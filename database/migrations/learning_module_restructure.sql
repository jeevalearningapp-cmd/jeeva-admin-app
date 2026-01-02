-- ============================================
-- Learning Module Restructure Migration
-- This migration creates new tables for separated question storage
-- and new content types for the Learning Module
-- ============================================

-- ============================================
-- SUBTASK 1.1: Create Practice Questions Tables
-- ============================================

-- Practice questions table
CREATE TABLE IF NOT EXISTS practice_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL, -- 'Numeracy' or 'Clinical Knowledge'
  subdivision VARCHAR(100) NOT NULL, -- Subtopic name
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false')),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for practice_questions
CREATE INDEX IF NOT EXISTS idx_practice_questions_category ON practice_questions(category);
CREATE INDEX IF NOT EXISTS idx_practice_questions_subdivision ON practice_questions(subdivision);
CREATE INDEX IF NOT EXISTS idx_practice_questions_active ON practice_questions(is_active) WHERE is_active = true;

-- Practice question options table
CREATE TABLE IF NOT EXISTS practice_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES practice_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for practice_question_options
CREATE INDEX IF NOT EXISTS idx_practice_question_options_question_id ON practice_question_options(question_id);

-- ============================================
-- SUBTASK 1.2: Create Learning Questions Tables
-- ============================================

-- Learning questions table
CREATE TABLE IF NOT EXISTS learning_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  subtopic_id UUID REFERENCES topics(id) ON DELETE CASCADE, -- Subtopics are stored in topics table
  video_lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false')),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for learning_questions
CREATE INDEX IF NOT EXISTS idx_learning_questions_topic_id ON learning_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_learning_questions_subtopic_id ON learning_questions(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_learning_questions_video_lesson_id ON learning_questions(video_lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_questions_active ON learning_questions(is_active) WHERE is_active = true;

-- Learning question options table
CREATE TABLE IF NOT EXISTS learning_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES learning_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for learning_question_options
CREATE INDEX IF NOT EXISTS idx_learning_question_options_question_id ON learning_question_options(question_id);

-- ============================================
-- SUBTASK 1.3: Rename Existing Questions Table for Mock Exam
-- ============================================

-- Rename questions table to mock_exam_questions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions') THEN
    ALTER TABLE questions RENAME TO mock_exam_questions;
  END IF;
END $$;

-- Rename question_options table to mock_exam_question_options
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'question_options') THEN
    ALTER TABLE question_options RENAME TO mock_exam_question_options;
  END IF;
END $$;

-- Update foreign key constraint name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'question_options_question_id_fkey'
  ) THEN
    ALTER TABLE mock_exam_question_options 
      RENAME CONSTRAINT question_options_question_id_fkey 
      TO mock_exam_question_options_question_id_fkey;
  END IF;
END $$;

-- Note: Indexes are automatically renamed with table rename
-- RLS policies will be updated in subtask 1.8

-- ============================================
-- SUBTASK 1.4: Create Topic Core Notes Table
-- ============================================

-- Topic core notes table
CREATE TABLE IF NOT EXISTS topic_core_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- Rich text HTML content
  sections JSONB, -- Array of section objects with titles and content
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id)
);

-- Indexes for topic_core_notes
CREATE INDEX IF NOT EXISTS idx_topic_core_notes_topic_id ON topic_core_notes(topic_id);

-- JSONB structure for sections:
-- [
--   {
--     "title": "Introduction to Numeracy",
--     "content": "<p>HTML content here</p>",
--     "order": 1
--   },
--   {
--     "title": "Dosage Calculations Overview",
--     "content": "<p>HTML content here</p>",
--     "order": 2
--   }
-- ]

-- ============================================
-- SUBTASK 1.5: Create Topic Flash Content Table
-- ============================================

-- Topic flash content table
CREATE TABLE IF NOT EXISTS topic_flash_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  screen_number INTEGER NOT NULL CHECK (screen_number BETWEEN 1 AND 5),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- Rich text HTML content
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id, screen_number)
);

-- Indexes for topic_flash_content
CREATE INDEX IF NOT EXISTS idx_topic_flash_content_topic_id ON topic_flash_content(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_flash_content_screen_number ON topic_flash_content(screen_number);

-- ============================================
-- SUBTASK 1.6: Create Progress Tracking Tables
-- ============================================

-- Subtopic progress table
CREATE TABLE IF NOT EXISTS subtopic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  subtopic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE, -- Subtopics are stored in topics table
  status VARCHAR(50) NOT NULL CHECK (status IN ('locked', 'in_progress', 'completed')),
  score INTEGER, -- Percentage score (0-100)
  best_score INTEGER, -- Best score achieved
  attempts INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subtopic_id)
);

-- Indexes for subtopic_progress
CREATE INDEX IF NOT EXISTS idx_subtopic_progress_user_id ON subtopic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_subtopic_progress_topic_id ON subtopic_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_subtopic_progress_subtopic_id ON subtopic_progress(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_subtopic_progress_status ON subtopic_progress(status);

-- Topic progress table
CREATE TABLE IF NOT EXISTS topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  core_notes_completed BOOLEAN DEFAULT false,
  flash_content_completed BOOLEAN DEFAULT false,
  progress_percentage INTEGER DEFAULT 0, -- Overall topic progress (0-100)
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Indexes for topic_progress
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_id ON topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_topic_id ON topic_progress(topic_id);

-- ============================================
-- SUBTASK 1.7: Update Lessons Table Schema
-- ============================================

-- Add new fields to existing lessons table
DO $$
BEGIN
  -- Add is_mandatory column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'is_mandatory'
  ) THEN
    ALTER TABLE lessons ADD COLUMN is_mandatory BOOLEAN DEFAULT true;
  END IF;

  -- Add content_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE lessons ADD COLUMN content_type VARCHAR(50) CHECK (content_type IN ('video', 'audio', 'text'));
  END IF;

  -- Add podcast_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'podcast_url'
  ) THEN
    ALTER TABLE lessons ADD COLUMN podcast_url TEXT;
  END IF;
END $$;

-- Update existing records to set content_type based on existing data
UPDATE lessons 
SET content_type = CASE
  WHEN video_url IS NOT NULL THEN 'video'
  WHEN content IS NOT NULL THEN 'text'
  ELSE 'video' -- Default to video
END
WHERE content_type IS NULL;

-- ============================================
-- SUBTASK 1.8: Apply Row Level Security Policies
-- ============================================

-- Enable RLS on new tables
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_core_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_flash_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtopic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for Practice Questions
-- ============================================

-- Superadmins: Full access
CREATE POLICY "Superadmins can view all practice_questions" ON practice_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert practice_questions" ON practice_questions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update practice_questions" ON practice_questions FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete practice_questions" ON practice_questions FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors: Create, Read, Update (no delete)
CREATE POLICY "Editors can view practice_questions" ON practice_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert practice_questions" ON practice_questions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update practice_questions" ON practice_questions FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators: Read-only
CREATE POLICY "Moderators can view practice_questions" ON practice_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- RLS Policies for Practice Question Options
-- ============================================

-- Superadmins
CREATE POLICY "Superadmins can view all practice_question_options" ON practice_question_options FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert practice_question_options" ON practice_question_options FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update practice_question_options" ON practice_question_options FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete practice_question_options" ON practice_question_options FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view practice_question_options" ON practice_question_options FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert practice_question_options" ON practice_question_options FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update practice_question_options" ON practice_question_options FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view practice_question_options" ON practice_question_options FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- RLS Policies for Learning Questions
-- ============================================

-- Superadmins
CREATE POLICY "Superadmins can view all learning_questions" ON learning_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert learning_questions" ON learning_questions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update learning_questions" ON learning_questions FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete learning_questions" ON learning_questions FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view learning_questions" ON learning_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert learning_questions" ON learning_questions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update learning_questions" ON learning_questions FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view learning_questions" ON learning_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- RLS Policies for Learning Question Options
-- ============================================

-- Superadmins
CREATE POLICY "Superadmins can view all learning_question_options" ON learning_question_options FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert learning_question_options" ON learning_question_options FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update learning_question_options" ON learning_question_options FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete learning_question_options" ON learning_question_options FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view learning_question_options" ON learning_question_options FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert learning_question_options" ON learning_question_options FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update learning_question_options" ON learning_question_options FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view learning_question_options" ON learning_question_options FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- RLS Policies for Mock Exam Questions (Update existing policies)
-- ============================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Superadmins can view all questions" ON mock_exam_questions;
DROP POLICY IF EXISTS "Superadmins can insert questions" ON mock_exam_questions;
DROP POLICY IF EXISTS "Superadmins can update questions" ON mock_exam_questions;
DROP POLICY IF EXISTS "Superadmins can delete questions" ON mock_exam_questions;
DROP POLICY IF EXISTS "Editors can view questions" ON mock_exam_questions;
DROP POLICY IF EXISTS "Editors can insert questions" ON mock_exam_questions;
DROP POLICY IF EXISTS "Editors can update questions" ON mock_exam_questions;
DROP POLICY IF EXISTS "Moderators can view questions" ON mock_exam_questions;

-- Create new policies with updated table name
CREATE POLICY "Superadmins can view all mock_exam_questions" ON mock_exam_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert mock_exam_questions" ON mock_exam_questions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update mock_exam_questions" ON mock_exam_questions FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete mock_exam_questions" ON mock_exam_questions FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view mock_exam_questions" ON mock_exam_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert mock_exam_questions" ON mock_exam_questions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update mock_exam_questions" ON mock_exam_questions FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view mock_exam_questions" ON mock_exam_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- Update policies for mock_exam_question_options
DROP POLICY IF EXISTS "Superadmins can view all question_options" ON mock_exam_question_options;
DROP POLICY IF EXISTS "Superadmins can insert question_options" ON mock_exam_question_options;
DROP POLICY IF EXISTS "Superadmins can update question_options" ON mock_exam_question_options;
DROP POLICY IF EXISTS "Superadmins can delete question_options" ON mock_exam_question_options;
DROP POLICY IF EXISTS "Editors can view question_options" ON mock_exam_question_options;
DROP POLICY IF EXISTS "Editors can insert question_options" ON mock_exam_question_options;
DROP POLICY IF EXISTS "Editors can update question_options" ON mock_exam_question_options;
DROP POLICY IF EXISTS "Moderators can view question_options" ON mock_exam_question_options;

CREATE POLICY "Superadmins can view all mock_exam_question_options" ON mock_exam_question_options FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert mock_exam_question_options" ON mock_exam_question_options FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update mock_exam_question_options" ON mock_exam_question_options FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete mock_exam_question_options" ON mock_exam_question_options FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view mock_exam_question_options" ON mock_exam_question_options FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert mock_exam_question_options" ON mock_exam_question_options FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update mock_exam_question_options" ON mock_exam_question_options FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view mock_exam_question_options" ON mock_exam_question_options FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- RLS Policies for Topic Core Notes
-- ============================================

-- Superadmins
CREATE POLICY "Superadmins can view all topic_core_notes" ON topic_core_notes FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert topic_core_notes" ON topic_core_notes FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update topic_core_notes" ON topic_core_notes FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete topic_core_notes" ON topic_core_notes FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view topic_core_notes" ON topic_core_notes FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert topic_core_notes" ON topic_core_notes FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update topic_core_notes" ON topic_core_notes FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view topic_core_notes" ON topic_core_notes FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- RLS Policies for Topic Flash Content
-- ============================================

-- Superadmins
CREATE POLICY "Superadmins can view all topic_flash_content" ON topic_flash_content FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert topic_flash_content" ON topic_flash_content FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update topic_flash_content" ON topic_flash_content FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete topic_flash_content" ON topic_flash_content FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view topic_flash_content" ON topic_flash_content FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert topic_flash_content" ON topic_flash_content FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update topic_flash_content" ON topic_flash_content FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view topic_flash_content" ON topic_flash_content FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- RLS Policies for Subtopic Progress
-- ============================================

-- Users can only access their own progress
CREATE POLICY "Users can view their own subtopic_progress" ON subtopic_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subtopic_progress" ON subtopic_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subtopic_progress" ON subtopic_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all subtopic_progress" ON subtopic_progress FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));

-- ============================================
-- RLS Policies for Topic Progress
-- ============================================

-- Users can only access their own progress
CREATE POLICY "Users can view their own topic_progress" ON topic_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own topic_progress" ON topic_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topic_progress" ON topic_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all topic_progress" ON topic_progress FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));

-- ============================================
-- Migration Complete!
-- ============================================
-- All new tables created with proper indexes and RLS policies
-- Existing questions table renamed to mock_exam_questions
-- Lessons table updated with new fields
-- Ready for data migration in next phase
-- ============================================
