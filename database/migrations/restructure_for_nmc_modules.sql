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

-- Step 9: Insert 10 Sample Questions with Options
-- These demonstrate the new question tagging system across all module types

-- Sample Question 1: Practice - Numeracy - Dosage Calculations
INSERT INTO questions (id, question_text, question_type, difficulty, points, explanation, module_type, category, subdivision, is_active)
VALUES (
  '10000000-0001-0000-0000-000000000001',
  'A patient requires 500mg of medication. The medication is available in 250mg tablets. How many tablets should be administered?',
  'multiple_choice',
  'easy',
  1,
  'Divide the required dose (500mg) by the tablet strength (250mg): 500 ÷ 250 = 2 tablets',
  'practice',
  'Numeracy',
  'Dosage Calculations',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
VALUES
  ('10000000-0001-0000-0000-000000000001', '1 tablet', false, 0),
  ('10000000-0001-0000-0000-000000000001', '2 tablets', true, 1),
  ('10000000-0001-0000-0000-000000000001', '3 tablets', false, 2),
  ('10000000-0001-0000-0000-000000000001', '4 tablets', false, 3);

-- Sample Question 2: Practice - Numeracy - Unit Conversions
INSERT INTO questions (id, question_text, question_type, difficulty, points, explanation, module_type, category, subdivision, is_active)
VALUES (
  '10000000-0002-0000-0000-000000000002',
  'Convert 2.5 liters to milliliters',
  'multiple_choice',
  'easy',
  1,
  '1 liter = 1000 milliliters, so 2.5 liters = 2.5 × 1000 = 2500 milliliters',
  'practice',
  'Numeracy',
  'Unit Conversions',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
VALUES
  ('10000000-0002-0000-0000-000000000002', '250 ml', false, 0),
  ('10000000-0002-0000-0000-000000000002', '2500 ml', true, 1),
  ('10000000-0002-0000-0000-000000000002', '25000 ml', false, 2),
  ('10000000-0002-0000-0000-000000000002', '250000 ml', false, 3);

-- Sample Question 3: Practice - Numeracy - IV Flow Rate Calculations
INSERT INTO questions (id, question_text, question_type, difficulty, points, explanation, module_type, category, subdivision, is_active)
VALUES (
  '10000000-0003-0000-0000-000000000003',
  'Calculate the drip rate for 1000ml to be infused over 8 hours using a giving set with 20 drops/ml',
  'multiple_choice',
  'medium',
  1,
  'First calculate ml/hour: 1000ml ÷ 8 hours = 125 ml/hour. Then calculate drops/min: (125 ml × 20 drops/ml) ÷ 60 min = 41.67 ≈ 42 drops/min',
  'practice',
  'Numeracy',
  'IV Flow Rate Calculations',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
VALUES
  ('10000000-0003-0000-0000-000000000003', '25 drops/min', false, 0),
  ('10000000-0003-0000-0000-000000000003', '32 drops/min', false, 1),
  ('10000000-0003-0000-0000-000000000003', '42 drops/min', true, 2),
  ('10000000-0003-0000-0000-000000000003', '50 drops/min', false, 3);

-- Sample Question 4: Practice - Clinical Knowledge - Pharmacology
INSERT INTO questions (id, question_text, question_type, difficulty, points, explanation, module_type, category, subdivision, is_active)
VALUES (
  '10000000-0004-0000-0000-000000000004',
  'What is the primary action of ACE inhibitors?',
  'multiple_choice',
  'medium',
  1,
  'ACE inhibitors work by blocking the angiotensin-converting enzyme, which prevents the conversion of angiotensin I to angiotensin II, thereby reducing vasoconstriction and lowering blood pressure',
  'practice',
  'Clinical Knowledge',
  'Pharmacology',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
VALUES
  ('10000000-0004-0000-0000-000000000004', 'Increase heart rate', false, 0),
  ('10000000-0004-0000-0000-000000000004', 'Reduce blood pressure', true, 1),
  ('10000000-0004-0000-0000-000000000004', 'Increase blood glucose', false, 2),
  ('10000000-0004-0000-0000-000000000004', 'Reduce inflammation', false, 3);

-- Sample Question 5: Practice - Clinical Knowledge - Infection Control
INSERT INTO questions (id, question_text, question_type, difficulty, points, explanation, module_type, category, subdivision, is_active)
VALUES (
  '10000000-0005-0000-0000-000000000005',
  'What is the most effective method to prevent the spread of healthcare-associated infections?',
  'multiple_choice',
  'easy',
  1,
  'Hand hygiene is considered the single most important measure to prevent the transmission of healthcare-associated infections. It should be performed before and after patient contact.',
  'practice',
  'Clinical Knowledge',
  'Infection Control',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
VALUES
  ('10000000-0005-0000-0000-000000000005', 'Wearing gloves at all times', false, 0),
  ('10000000-0005-0000-0000-000000000005', 'Hand hygiene', true, 1),
  ('10000000-0005-0000-0000-000000000005', 'Taking antibiotics', false, 2),
  ('10000000-0005-0000-0000-000000000005', 'Wearing a mask', false, 3);

-- Sample Question 6: Practice - Clinical Knowledge - Wound Care
INSERT INTO questions (id, question_text, question_type, difficulty, points, explanation, module_type, category, subdivision, is_active)
VALUES (
  '10000000-0006-0000-0000-000000000006',
  'Which type of wound dressing is most appropriate for a wound with heavy exudate?',
  'multiple_choice',
  'medium',
  1,
  'Alginate dressings are highly absorbent and can hold up to 20 times their weight in fluid, making them ideal for wounds with heavy drainage',
  'practice',
  'Clinical Knowledge',
  'Wound Care',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
VALUES
  ('10000000-0006-0000-0000-000000000006', 'Hydrocolloid', false, 0),
  ('10000000-0006-0000-0000-000000000006', 'Alginate', true, 1),
  ('10000000-0006-0000-0000-000000000006', 'Transparent film', false, 2),
  ('10000000-0006-0000-0000-000000000006', 'Dry gauze', false, 3);

-- Sample Question 7: Learning - The NMC Code
INSERT INTO questions (id, question_text, question_type, difficulty, points, explanation, module_type, category, is_active)
VALUES (
  '10000000-0007-0000-0000-000000000007',
  'The NMC Code requires nurses to "prioritise people". What does this principle primarily mean?',
  'multiple_choice',
  'medium',
  1,
  'The first principle of the NMC Code emphasizes putting patients first, making their care and safety the main concern in everything nurses do',
  'learning',
  'The NMC Code',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
VALUES
  ('10000000-0007-0000-0000-000000000007', 'Focus on task completion', false, 0),
  ('10000000-0007-0000-0000-000000000007', 'Put people''s needs first', true, 1),
  ('10000000-0007-0000-0000-000000000007', 'Prioritize documentation', false, 2),
  ('10000000-0007-0000-0000-000000000007', 'Complete procedures quickly', false, 3);

-- Sample Question 8: Learning - Safeguarding
INSERT INTO questions (id, question_text, question_type, difficulty, points, explanation, module_type, category, is_active)
VALUES (
  '10000000-0008-0000-0000-000000000008',
  'Which of the following is NOT a type of abuse covered under safeguarding?',
  'multiple_choice',
  'easy',
  1,
  'The main types of abuse in safeguarding are: physical, emotional/psychological, sexual, financial, neglect, discriminatory, and institutional abuse. Fair criticism is not abuse.',
  'learning',
  'Safeguarding',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
VALUES
  ('10000000-0008-0000-0000-000000000008', 'Physical abuse', false, 0),
  ('10000000-0008-0000-0000-000000000008', 'Emotional abuse', false, 1),
  ('10000000-0008-0000-0000-000000000008', 'Financial abuse', false, 2),
  ('10000000-0008-0000-0000-000000000008', 'Fair criticism', true, 3);

-- Sample Question 9: Mock Exam - Part A (Numeracy)
INSERT INTO questions (id, question_text, question_type, difficulty, points, explanation, module_type, exam_part, is_active)
VALUES (
  '10000000-0009-0000-0000-000000000009',
  'A patient requires 75mg of medication. The medication is supplied as 25mg in 5ml. How many ml should be administered?',
  'multiple_choice',
  'medium',
  1,
  'First find mg per ml: 25mg ÷ 5ml = 5mg/ml. Then calculate volume needed: 75mg ÷ 5mg/ml = 15ml',
  'mock_exam',
  'part_a',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
VALUES
  ('10000000-0009-0000-0000-000000000009', '5ml', false, 0),
  ('10000000-0009-0000-0000-000000000009', '10ml', false, 1),
  ('10000000-0009-0000-0000-000000000009', '15ml', true, 2),
  ('10000000-0009-0000-0000-000000000009', '20ml', false, 3);

-- Sample Question 10: Mock Exam - Part B (Clinical)
INSERT INTO questions (id, question_text, question_type, difficulty, points, explanation, module_type, exam_part, is_active)
VALUES (
  '10000000-0010-0000-0000-000000000010',
  'What is the first-line treatment for anaphylaxis?',
  'multiple_choice',
  'easy',
  1,
  'Intramuscular adrenaline (epinephrine) is the first-line treatment for anaphylaxis and should be administered immediately to any patient showing signs of anaphylactic reaction',
  'mock_exam',
  'part_b',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
VALUES
  ('10000000-0010-0000-0000-000000000010', 'Oral antihistamine', false, 0),
  ('10000000-0010-0000-0000-000000000010', 'IM adrenaline', true, 1),
  ('10000000-0010-0000-0000-000000000010', 'IV steroids', false, 2),
  ('10000000-0010-0000-0000-000000000010', 'Oxygen therapy', false, 3);

-- ============================================
-- Migration Complete!
-- ============================================
-- Next steps:
-- 1. Use this schema to add questions with proper tags
-- 2. Questions can be filtered by module_type, category, subdivision
-- 3. Mock exams will randomly select from the question pool
-- 4. Learning module lessons require 80% passing score on quizzes
-- ============================================
