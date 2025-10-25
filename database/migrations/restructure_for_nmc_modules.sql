-- ============================================
-- NMC Course Restructuring Migration
-- Converts from dynamic modules to fixed 3-module structure
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Add new columns to questions table for categorization
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS module_type VARCHAR(50) CHECK (module_type IN ('practice', 'learning', 'mock_exam')),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS subdivision VARCHAR(100),
ADD COLUMN IF NOT EXISTS exam_part VARCHAR(20) CHECK (exam_part IS NULL OR exam_part IN ('part_a', 'part_b'));

-- Add indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_questions_module_type ON questions(module_type);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_subdivision ON questions(subdivision);
CREATE INDEX IF NOT EXISTS idx_questions_exam_part ON questions(exam_part);

-- Step 2: Add new columns to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS lesson_type VARCHAR(50) CHECK (lesson_type IN ('video', 'audio', 'text', 'quiz')),
ADD COLUMN IF NOT EXISTS passing_score_percentage INTEGER DEFAULT 80;

-- Step 3: Create mock_exam_config table
CREATE TABLE IF NOT EXISTS mock_exam_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_a_question_count INTEGER NOT NULL DEFAULT 15,
  part_a_duration_minutes INTEGER NOT NULL DEFAULT 30,
  part_b_question_count INTEGER NOT NULL DEFAULT 120,
  part_b_duration_minutes INTEGER NOT NULL DEFAULT 150,
  allow_calculator BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default mock exam configuration
INSERT INTO mock_exam_config (
  part_a_question_count,
  part_a_duration_minutes,
  part_b_question_count,
  part_b_duration_minutes,
  allow_calculator
) VALUES (15, 30, 120, 150, false)
ON CONFLICT DO NOTHING;

-- Step 4: Create lesson_quiz_results table (for 80% passing requirement)
CREATE TABLE IF NOT EXISTS lesson_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score_percentage INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_quiz_results_user ON lesson_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_quiz_results_lesson ON lesson_quiz_results(lesson_id);

-- Enable RLS on new tables
ALTER TABLE mock_exam_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mock_exam_config (admin can manage, students can view)
CREATE POLICY "Admins can manage mock exam config" ON mock_exam_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Students can view mock exam config" ON mock_exam_config FOR SELECT
USING (true);

-- RLS Policies for lesson_quiz_results (users can only see their own results)
CREATE POLICY "Users can view own quiz results" ON lesson_quiz_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results" ON lesson_quiz_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz results" ON lesson_quiz_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Step 5: Seed the 3 fixed modules
-- Clear existing modules if they exist (optional - comment out if you want to keep existing data)
-- DELETE FROM modules;

-- Insert the 3 fixed modules
INSERT INTO modules (id, title, description, thumbnail_url, is_active, display_order)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Practice Module', 'Practice questions by topic to build proficiency', NULL, true, 1),
  ('22222222-2222-2222-2222-222222222222', 'Learning Module', 'Structured lessons with video, audio, and text content', NULL, true, 2),
  ('33333333-3333-3333-3333-333333333333', 'Mock Exams', 'Full-length exam simulator with real timing', NULL, true, 3)
ON CONFLICT (id) DO NOTHING;

-- Step 6: Seed Practice Module topics and subdivisions
-- Practice Module - Numeracy
INSERT INTO topics (id, module_id, title, description, is_active, display_order)
VALUES 
  ('11111111-1111-0001-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Numeracy', 'Dosage calculations, unit conversions, IV flow rates, and fluid balance', true, 1)
ON CONFLICT (id) DO NOTHING;

-- Practice Module - Clinical Knowledge
INSERT INTO topics (id, module_id, title, description, is_active, display_order)
VALUES 
  ('11111111-1111-0002-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Clinical Knowledge', 'Medical-surgical nursing, pharmacology, infection control, wound care, and palliative care', true, 2)
ON CONFLICT (id) DO NOTHING;

-- Step 7: Seed Learning Module topics
INSERT INTO topics (id, module_id, title, description, is_active, display_order)
VALUES 
  ('22222222-2222-0001-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Numeracy', 'Essential numeracy skills for nursing practice', true, 1),
  ('22222222-2222-0002-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'The NMC Code', 'Professional standards of practice and behaviour', true, 2),
  ('22222222-2222-0003-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Mental Capacity Act', 'Understanding mental capacity and decision-making', true, 3),
  ('22222222-2222-0004-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Safeguarding', 'Protecting vulnerable individuals from harm', true, 4),
  ('22222222-2222-0005-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'Consent & Confidentiality', 'Patient rights and information governance', true, 5),
  ('22222222-2222-0006-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'Equality & Diversity', 'Promoting equality in healthcare', true, 6),
  ('22222222-2222-0007-0000-000000000007', '22222222-2222-2222-2222-222222222222', 'Duty of Candour', 'Being open and honest when things go wrong', true, 7),
  ('22222222-2222-0008-0000-000000000008', '22222222-2222-2222-2222-222222222222', 'Cultural Adaptation', 'Working effectively in a multicultural healthcare environment', true, 8)
ON CONFLICT (id) DO NOTHING;

-- Step 8: Create a function to get random questions for mock exams
CREATE OR REPLACE FUNCTION get_random_mock_exam_questions(
  part VARCHAR(20),
  question_count INTEGER
)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  question_type VARCHAR(50),
  difficulty VARCHAR(20),
  points INTEGER,
  explanation TEXT,
  image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.question_text,
    q.question_type,
    q.difficulty,
    q.points,
    q.explanation,
    q.image_url
  FROM questions q
  WHERE 
    q.module_type = 'mock_exam' 
    AND q.exam_part = part
    AND q.is_active = true
  ORDER BY RANDOM()
  LIMIT question_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Migration Complete!
-- ============================================
-- Next steps:
-- 1. Use this schema to add questions with proper tags
-- 2. Questions can be filtered by module_type, category, subdivision
-- 3. Mock exams will randomly select from the question pool
-- 4. Learning module lessons require 80% passing score on quizzes
-- ============================================
