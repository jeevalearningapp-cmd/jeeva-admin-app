-- ============================================
-- COMPLETE LEARNING MODULE RESTRUCTURE MIGRATION
-- This is the master script that runs all migrations in correct order
-- ============================================

-- WARNING: This script will:
-- 1. Create new tables (practice_questions, learning_questions)
-- 2. Rename questions table to mock_exam_questions
-- 3. Migrate data from mock_exam_questions to new tables
-- 4. Delete migrated data from mock_exam_questions
--
-- PREREQUISITES:
-- - Database backup completed (Task 0.2)
-- - You have reviewed the migration plan
-- - You are ready to proceed with data migration
--
-- ESTIMATED TIME: 30-45 minutes
-- ============================================

-- Start transaction
BEGIN;

-- ============================================
-- STEP 0: Pre-Migration Checks
-- ============================================

DO $$
DECLARE
  questions_table_exists BOOLEAN;
  mock_exam_table_exists BOOLEAN;
  practice_table_exists BOOLEAN;
  learning_table_exists BOOLEAN;
BEGIN
  -- Check if questions table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'questions'
  ) INTO questions_table_exists;
  
  -- Check if mock_exam_questions already exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'mock_exam_questions'
  ) INTO mock_exam_table_exists;
  
  -- Check if practice_questions already exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'practice_questions'
  ) INTO practice_table_exists;
  
  -- Check if learning_questions already exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'learning_questions'
  ) INTO learning_table_exists;
  
  RAISE NOTICE '=== Pre-Migration Status ===';
  RAISE NOTICE 'questions table exists: %', questions_table_exists;
  RAISE NOTICE 'mock_exam_questions table exists: %', mock_exam_table_exists;
  RAISE NOTICE 'practice_questions table exists: %', practice_table_exists;
  RAISE NOTICE 'learning_questions table exists: %', learning_table_exists;
  
  -- Determine migration state
  IF NOT questions_table_exists AND NOT mock_exam_table_exists THEN
    RAISE EXCEPTION 'ERROR: Neither questions nor mock_exam_questions table exists! Cannot proceed.';
  END IF;
  
  IF mock_exam_table_exists AND NOT practice_table_exists THEN
    RAISE NOTICE 'Schema migration already complete. Will proceed with data migration only.';
  ELSIF questions_table_exists AND NOT mock_exam_table_exists THEN
    RAISE NOTICE 'Schema migration needed. Will run full migration.';
  ELSIF practice_table_exists AND learning_table_exists THEN
    RAISE NOTICE 'WARNING: New tables already exist. Migration may have been run before.';
    RAISE NOTICE 'This script will skip existing data (ON CONFLICT DO NOTHING).';
  END IF;
END $$;

-- ============================================
-- STEP 1: Schema Migration (Task 1)
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '=== STEP 1: Creating Schema ===';
END $$;

-- Create Practice Questions Tables
CREATE TABLE IF NOT EXISTS practice_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  subdivision VARCHAR(100) NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_practice_questions_category ON practice_questions(category);
CREATE INDEX IF NOT EXISTS idx_practice_questions_subdivision ON practice_questions(subdivision);
CREATE INDEX IF NOT EXISTS idx_practice_questions_active ON practice_questions(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS practice_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES practice_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_question_options_question_id ON practice_question_options(question_id);

-- Create Learning Questions Tables
CREATE TABLE IF NOT EXISTS learning_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  subtopic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_learning_questions_topic_id ON learning_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_learning_questions_subtopic_id ON learning_questions(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_learning_questions_video_lesson_id ON learning_questions(video_lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_questions_active ON learning_questions(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS learning_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES learning_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_question_options_question_id ON learning_question_options(question_id);

-- Rename existing questions table to mock_exam_questions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions') THEN
    ALTER TABLE questions RENAME TO mock_exam_questions;
    RAISE NOTICE 'Renamed questions to mock_exam_questions';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'question_options') THEN
    ALTER TABLE question_options RENAME TO mock_exam_question_options;
    RAISE NOTICE 'Renamed question_options to mock_exam_question_options';
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
    RAISE NOTICE 'Renamed foreign key constraint';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE 'Schema migration complete!';
END $$;

-- ============================================
-- STEP 2: Data Migration - Practice Questions
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '=== STEP 2: Migrating Practice Questions ===';
END $$;

-- Create temp table for tracking
CREATE TEMP TABLE IF NOT EXISTS practice_migration_log (
  old_question_id UUID,
  new_question_id UUID,
  category VARCHAR(100),
  subdivision VARCHAR(100),
  migrated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate practice questions
INSERT INTO practice_questions (
  id,
  category,
  subdivision,
  question_text,
  question_type,
  difficulty,
  points,
  explanation,
  image_url,
  is_active,
  created_at,
  updated_at
)
SELECT 
  q.id,
  CASE 
    WHEN t.title ILIKE '%numeracy%' THEN 'Numeracy'
    WHEN t.title ILIKE '%clinical%' THEN 'Clinical Knowledge'
    WHEN t.title ILIKE '%calculation%' OR t.title ILIKE '%math%' THEN 'Numeracy'
    ELSE 'Clinical Knowledge'
  END as category,
  COALESCE(l.title, 'General') as subdivision,
  q.question_text,
  q.question_type,
  q.difficulty,
  q.points,
  q.explanation,
  q.image_url,
  q.is_active,
  q.created_at,
  q.updated_at
FROM mock_exam_questions q
INNER JOIN lessons l ON q.lesson_id = l.id
INNER JOIN topics t ON l.topic_id = t.id
INNER JOIN modules m ON t.module_id = m.id
WHERE m.title ILIKE '%practice%'
ON CONFLICT (id) DO NOTHING;

-- Log migrated questions
INSERT INTO practice_migration_log (old_question_id, new_question_id, category, subdivision)
SELECT 
  q.id,
  q.id,
  CASE 
    WHEN t.title ILIKE '%numeracy%' THEN 'Numeracy'
    WHEN t.title ILIKE '%clinical%' THEN 'Clinical Knowledge'
    WHEN t.title ILIKE '%calculation%' OR t.title ILIKE '%math%' THEN 'Numeracy'
    ELSE 'Clinical Knowledge'
  END as category,
  COALESCE(l.title, 'General') as subdivision
FROM mock_exam_questions q
INNER JOIN lessons l ON q.lesson_id = l.id
INNER JOIN topics t ON l.topic_id = t.id
INNER JOIN modules m ON t.module_id = m.id
WHERE m.title ILIKE '%practice%';

-- Migrate practice question options
INSERT INTO practice_question_options (
  id,
  question_id,
  option_text,
  is_correct,
  display_order,
  created_at
)
SELECT 
  opt.id,
  opt.question_id,
  opt.option_text,
  opt.is_correct,
  opt.display_order,
  opt.created_at
FROM mock_exam_question_options opt
WHERE opt.question_id IN (SELECT old_question_id FROM practice_migration_log)
ON CONFLICT (id) DO NOTHING;

-- Report practice migration
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count FROM practice_migration_log;
  RAISE NOTICE 'Practice questions migrated: %', migrated_count;
END $$;

-- Delete migrated practice questions
DELETE FROM mock_exam_question_options
WHERE question_id IN (SELECT old_question_id FROM practice_migration_log);

DELETE FROM mock_exam_questions
WHERE id IN (SELECT old_question_id FROM practice_migration_log);

DO $$
BEGIN
  RAISE NOTICE 'Practice questions migration complete!';
END $$;

-- ============================================
-- STEP 3: Data Migration - Learning Questions
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '=== STEP 3: Migrating Learning Questions ===';
END $$;

-- Create temp table for tracking
CREATE TEMP TABLE IF NOT EXISTS learning_migration_log (
  old_question_id UUID,
  new_question_id UUID,
  topic_id UUID,
  subtopic_id UUID,
  video_lesson_id UUID,
  migrated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate learning questions
INSERT INTO learning_questions (
  id,
  topic_id,
  subtopic_id,
  video_lesson_id,
  question_text,
  question_type,
  difficulty,
  points,
  explanation,
  image_url,
  is_active,
  created_at,
  updated_at
)
SELECT 
  q.id,
  t.id as topic_id,
  t.id as subtopic_id,  -- Using topic_id as subtopic_id since parent_id doesn't exist
  l.id as video_lesson_id,
  q.question_text,
  q.question_type,
  q.difficulty,
  q.points,
  q.explanation,
  q.image_url,
  q.is_active,
  q.created_at,
  q.updated_at
FROM mock_exam_questions q
INNER JOIN lessons l ON q.lesson_id = l.id
INNER JOIN topics t ON l.topic_id = t.id
INNER JOIN modules m ON t.module_id = m.id
WHERE m.title ILIKE '%learning%'
ON CONFLICT (id) DO NOTHING;

-- Log migrated questions
INSERT INTO learning_migration_log (old_question_id, new_question_id, topic_id, subtopic_id, video_lesson_id)
SELECT 
  q.id,
  q.id,
  t.id as topic_id,
  t.id as subtopic_id,  -- Using topic_id as subtopic_id since parent_id doesn't exist
  l.id as video_lesson_id
FROM mock_exam_questions q
INNER JOIN lessons l ON q.lesson_id = l.id
INNER JOIN topics t ON l.topic_id = t.id
INNER JOIN modules m ON t.module_id = m.id
WHERE m.title ILIKE '%learning%';

-- Migrate learning question options
INSERT INTO learning_question_options (
  id,
  question_id,
  option_text,
  is_correct,
  display_order,
  created_at
)
SELECT 
  opt.id,
  opt.question_id,
  opt.option_text,
  opt.is_correct,
  opt.display_order,
  opt.created_at
FROM mock_exam_question_options opt
WHERE opt.question_id IN (SELECT old_question_id FROM learning_migration_log)
ON CONFLICT (id) DO NOTHING;

-- Report learning migration
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count FROM learning_migration_log;
  RAISE NOTICE 'Learning questions migrated: %', migrated_count;
END $$;

-- Delete migrated learning questions
DELETE FROM mock_exam_question_options
WHERE question_id IN (SELECT old_question_id FROM learning_migration_log);

DELETE FROM mock_exam_questions
WHERE id IN (SELECT old_question_id FROM learning_migration_log);

DO $$
BEGIN
  RAISE NOTICE 'Learning questions migration complete!';
END $$;

-- ============================================
-- STEP 4: Final Verification
-- ============================================

DO $$
DECLARE
  practice_count INTEGER;
  learning_count INTEGER;
  mock_count INTEGER;
  total_count INTEGER;
BEGIN
  RAISE NOTICE '=== STEP 4: Final Verification ===';
  
  SELECT COUNT(*) INTO practice_count FROM practice_questions;
  SELECT COUNT(*) INTO learning_count FROM learning_questions;
  SELECT COUNT(*) INTO mock_count FROM mock_exam_questions;
  total_count := practice_count + learning_count + mock_count;
  
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '  Practice questions: %', practice_count;
  RAISE NOTICE '  Learning questions: %', learning_count;
  RAISE NOTICE '  Mock exam questions: %', mock_count;
  RAISE NOTICE '  Total questions: %', total_count;
  
  -- Check for data integrity issues
  IF EXISTS (
    SELECT 1 FROM practice_questions pq
    WHERE NOT EXISTS (
      SELECT 1 FROM practice_question_options pqo
      WHERE pqo.question_id = pq.id
    )
  ) THEN
    RAISE WARNING 'Some practice questions have no options!';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM learning_questions lq
    WHERE NOT EXISTS (
      SELECT 1 FROM learning_question_options lqo
      WHERE lqo.question_id = lq.id
    )
  ) THEN
    RAISE WARNING 'Some learning questions have no options!';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM mock_exam_questions q
    WHERE NOT EXISTS (
      SELECT 1 FROM mock_exam_question_options opt
      WHERE opt.question_id = q.id
    )
  ) THEN
    RAISE WARNING 'Some mock exam questions have no options!';
  END IF;
  
  RAISE NOTICE 'Verification complete!';
  RAISE NOTICE '=== MIGRATION COMPLETE ===';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Review the migration summary above';
  RAISE NOTICE '2. Test API endpoints with new tables';
  RAISE NOTICE '3. Update admin portal to use new tables';
  RAISE NOTICE '4. Proceed to Task 3: Backend API Updates';
END $$;

-- ============================================
-- Commit Transaction
-- ============================================
COMMIT;
