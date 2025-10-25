-- =============================================
-- Jeeva Learning Platform - Database Schema
-- =============================================
-- This script creates all necessary tables for the Learning Module
-- Run this BEFORE running the seed data script

-- =============================================
-- 1. Modules Table
-- =============================================
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 2. Topics Table
-- =============================================
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 3. Lessons Table
-- =============================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  audio_url TEXT,
  lesson_type VARCHAR(50) DEFAULT 'text',
  passing_score_percentage INTEGER DEFAULT 80,
  category VARCHAR(100),
  duration INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 4. Questions Table
-- =============================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice',
  difficulty VARCHAR(50),
  points INTEGER DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  module_type VARCHAR(50),
  category VARCHAR(255),
  subdivision VARCHAR(100),
  exam_part VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 5. Question Options Table
-- =============================================
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 6. Flashcards Table
-- =============================================
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  category VARCHAR(255),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_topics_module_id ON topics(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);
CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_filters ON questions(module_type, category, subdivision);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic_id ON flashcards(topic_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_category ON flashcards(category);

-- =============================================
-- Insert Fixed Module Records
-- =============================================
INSERT INTO modules (id, title, description, is_active, display_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Practice Module', 'Practice MCQs to test your knowledge', true, 1),
  ('22222222-2222-2222-2222-222222222222', 'Learning Module', 'Comprehensive learning content for NMC CBT preparation', true, 2),
  ('33333333-3333-3333-3333-333333333333', 'Mock Exam', 'Full-length mock exams to prepare for the real test', true, 3)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Insert Learning Module Topics
-- =============================================
INSERT INTO topics (id, module_id, title, description, is_active, display_order) VALUES
  ('22222222-2222-0001-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Numeracy', 'Essential numeracy skills for nursing practice', true, 1),
  ('22222222-2222-0002-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'The NMC Code', 'Professional standards of practice and behaviour', true, 2),
  ('22222222-2222-0003-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Mental Capacity Act', 'Understanding mental capacity and decision-making', true, 3),
  ('22222222-2222-0004-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Safeguarding', 'Protecting vulnerable individuals from harm', true, 4),
  ('22222222-2222-0005-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'Consent & Confidentiality', 'Patient rights and information governance', true, 5),
  ('22222222-2222-0006-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'Equality & Diversity', 'Promoting equality in healthcare', true, 6),
  ('22222222-2222-0007-0000-000000000007', '22222222-2222-2222-2222-222222222222', 'Duty of Candour', 'Being open and honest when things go wrong', true, 7),
  ('22222222-2222-0008-0000-000000000008', '22222222-2222-2222-2222-222222222222', 'Cultural Adaptation', 'Working effectively in a multicultural healthcare environment', true, 8)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Success Message
-- =============================================
SELECT 'Database schema created successfully! You can now run the seed data script.' AS status;
