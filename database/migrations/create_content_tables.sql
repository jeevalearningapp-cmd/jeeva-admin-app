-- ============================================
-- Content Management System Tables
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_display_order ON modules(display_order);
CREATE INDEX IF NOT EXISTS idx_modules_active ON modules(is_active) WHERE is_active = true;

-- 2. Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topics_module_id ON topics(module_id);
CREATE INDEX IF NOT EXISTS idx_topics_display_order ON topics(display_order);
CREATE INDEX IF NOT EXISTS idx_topics_active ON topics(is_active) WHERE is_active = true;

-- 3. Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  duration INTEGER,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_lessons_display_order ON lessons(display_order);
CREATE INDEX IF NOT EXISTS idx_lessons_active ON lessons(is_active) WHERE is_active = true;

-- 4. Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcards_lesson_id ON flashcards(lesson_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_display_order ON flashcards(display_order);
CREATE INDEX IF NOT EXISTS idx_flashcards_active ON flashcards(is_active) WHERE is_active = true;

-- 5. Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

-- 6. Create question_options table
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_display_order ON question_options(display_order);
CREATE INDEX IF NOT EXISTS idx_question_options_correct ON question_options(is_correct) WHERE is_correct = true;

-- ============================================
-- Enable Row Level Security
-- ============================================

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for Modules
-- ============================================

-- Superadmins: Full access
CREATE POLICY "Superadmins can view all modules"
ON modules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true
  )
);

CREATE POLICY "Superadmins can insert modules"
ON modules FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true
  )
);

CREATE POLICY "Superadmins can update modules"
ON modules FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true
  )
);

CREATE POLICY "Superadmins can delete modules"
ON modules FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true
  )
);

-- Editors: Can create, read, update (but not delete)
CREATE POLICY "Editors can view modules"
ON modules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role = 'editor' AND is_active = true
  )
);

CREATE POLICY "Editors can insert modules"
ON modules FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role = 'editor' AND is_active = true
  )
);

CREATE POLICY "Editors can update modules"
ON modules FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role = 'editor' AND is_active = true
  )
);

-- Moderators: Read-only
CREATE POLICY "Moderators can view modules"
ON modules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role = 'moderator' AND is_active = true
  )
);

-- ============================================
-- RLS Policies for Topics
-- ============================================

-- Superadmins
CREATE POLICY "Superadmins can view all topics" ON topics FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert topics" ON topics FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update topics" ON topics FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete topics" ON topics FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view topics" ON topics FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert topics" ON topics FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update topics" ON topics FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view topics" ON topics FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- RLS Policies for Lessons
-- ============================================

-- Superadmins
CREATE POLICY "Superadmins can view all lessons" ON lessons FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert lessons" ON lessons FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update lessons" ON lessons FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete lessons" ON lessons FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view lessons" ON lessons FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert lessons" ON lessons FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update lessons" ON lessons FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view lessons" ON lessons FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- RLS Policies for Flashcards
-- ============================================

-- Superadmins
CREATE POLICY "Superadmins can view all flashcards" ON flashcards FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert flashcards" ON flashcards FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update flashcards" ON flashcards FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete flashcards" ON flashcards FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view flashcards" ON flashcards FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert flashcards" ON flashcards FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update flashcards" ON flashcards FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view flashcards" ON flashcards FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- RLS Policies for Questions
-- ============================================

-- Superadmins
CREATE POLICY "Superadmins can view all questions" ON questions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert questions" ON questions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update questions" ON questions FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete questions" ON questions FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view questions" ON questions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert questions" ON questions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update questions" ON questions FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view questions" ON questions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- RLS Policies for Question Options
-- ============================================

-- Superadmins
CREATE POLICY "Superadmins can view all question_options" ON question_options FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert question_options" ON question_options FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update question_options" ON question_options FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete question_options" ON question_options FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view question_options" ON question_options FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert question_options" ON question_options FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update question_options" ON question_options FOR UPDATE
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view question_options" ON question_options FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- Complete!
-- ============================================
-- All content tables created with RLS policies
-- Superadmin: Full CRUD access
-- Editor: Create, Read, Update (no delete)
-- Moderator: Read-only access
-- ============================================
