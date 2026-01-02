-- ============================================
-- Question Migration Rollback Script
-- This script rolls back the question migration by:
-- 1. Copying migrated questions back to mock_exam_questions
-- 2. Renaming mock_exam_questions back to questions
-- 3. Cleaning up new tables (optional)
-- ============================================

-- WARNING: This script will restore the original questions table structure
-- Make sure you have a backup before running this script!

-- Start transaction for data integrity
BEGIN;

-- ============================================
-- Step 1: Copy Practice Questions Back to mock_exam_questions
-- ============================================

-- Insert practice questions back into mock_exam_questions
INSERT INTO mock_exam_questions (
  id,
  lesson_id, -- Will be NULL since practice questions don't have lesson associations
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
  id,
  NULL as lesson_id, -- Practice questions don't have lesson_id
  question_text,
  question_type,
  difficulty,
  points,
  explanation,
  image_url,
  is_active,
  created_at,
  updated_at
FROM practice_questions
ON CONFLICT (id) DO NOTHING; -- Skip if already exists

-- Insert practice question options back
INSERT INTO mock_exam_question_options (
  id,
  question_id,
  option_text,
  is_correct,
  display_order,
  created_at
)
SELECT 
  id,
  question_id,
  option_text,
  is_correct,
  display_order,
  created_at
FROM practice_question_options
ON CONFLICT (id) DO NOTHING; -- Skip if already exists

-- Log practice questions restored
DO $$
DECLARE
  restored_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO restored_count 
  FROM mock_exam_questions 
  WHERE id IN (SELECT id FROM practice_questions);
  
  RAISE NOTICE 'Practice Questions Rollback:';
  RAISE NOTICE '  Questions restored: %', restored_count;
END $$;

-- ============================================
-- Step 2: Copy Learning Questions Back to mock_exam_questions
-- ============================================

-- Insert learning questions back into mock_exam_questions
-- Restore the lesson_id from video_lesson_id
INSERT INTO mock_exam_questions (
  id,
  lesson_id,
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
  id,
  video_lesson_id as lesson_id, -- Restore lesson association
  question_text,
  question_type,
  difficulty,
  points,
  explanation,
  image_url,
  is_active,
  created_at,
  updated_at
FROM learning_questions
ON CONFLICT (id) DO NOTHING; -- Skip if already exists

-- Insert learning question options back
INSERT INTO mock_exam_question_options (
  id,
  question_id,
  option_text,
  is_correct,
  display_order,
  created_at
)
SELECT 
  id,
  question_id,
  option_text,
  is_correct,
  display_order,
  created_at
FROM learning_question_options
ON CONFLICT (id) DO NOTHING; -- Skip if already exists

-- Log learning questions restored
DO $$
DECLARE
  restored_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO restored_count 
  FROM mock_exam_questions 
  WHERE id IN (SELECT id FROM learning_questions);
  
  RAISE NOTICE 'Learning Questions Rollback:';
  RAISE NOTICE '  Questions restored: %', restored_count;
END $$;

-- ============================================
-- Step 3: Verify Restoration
-- ============================================

DO $$
DECLARE
  total_questions INTEGER;
  total_options INTEGER;
  practice_count INTEGER;
  learning_count INTEGER;
  mock_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_questions FROM mock_exam_questions;
  SELECT COUNT(*) INTO total_options FROM mock_exam_question_options;
  SELECT COUNT(*) INTO practice_count FROM practice_questions;
  SELECT COUNT(*) INTO learning_count FROM learning_questions;
  
  -- Count original mock exam questions (those without lesson_id or not in practice/learning)
  SELECT COUNT(*) INTO mock_count 
  FROM mock_exam_questions 
  WHERE id NOT IN (SELECT id FROM practice_questions)
  AND id NOT IN (SELECT id FROM learning_questions);
  
  RAISE NOTICE 'Rollback Verification:';
  RAISE NOTICE '  Total questions in mock_exam_questions: %', total_questions;
  RAISE NOTICE '  Total options in mock_exam_question_options: %', total_options;
  RAISE NOTICE '  Practice questions (still in practice_questions): %', practice_count;
  RAISE NOTICE '  Learning questions (still in learning_questions): %', learning_count;
  RAISE NOTICE '  Original mock exam questions: %', mock_count;
  
  -- Verify each question has at least one option
  IF EXISTS (
    SELECT 1 FROM mock_exam_questions q
    WHERE NOT EXISTS (
      SELECT 1 FROM mock_exam_question_options opt
      WHERE opt.question_id = q.id
    )
  ) THEN
    RAISE WARNING 'Some questions have no options after rollback!';
  END IF;
  
  -- Verify each question has at least one correct answer
  IF EXISTS (
    SELECT 1 FROM mock_exam_questions q
    WHERE NOT EXISTS (
      SELECT 1 FROM mock_exam_question_options opt
      WHERE opt.question_id = q.id AND opt.is_correct = true
    )
  ) THEN
    RAISE WARNING 'Some questions have no correct answer after rollback!';
  END IF;
END $$;

-- ============================================
-- Step 4: Rename Tables Back (Optional - Uncomment to execute)
-- ============================================

-- WARNING: Only uncomment and run this section if you want to fully revert
-- to the original table names. This will break any code that references
-- the new table names (practice_questions, learning_questions, mock_exam_questions)

-- Uncomment the following lines to rename tables back:

-- -- Rename mock_exam_questions back to questions
-- ALTER TABLE mock_exam_questions RENAME TO questions;
-- 
-- -- Rename mock_exam_question_options back to question_options
-- ALTER TABLE mock_exam_question_options RENAME TO question_options;
-- 
-- -- Update foreign key constraint name
-- ALTER TABLE question_options 
--   RENAME CONSTRAINT mock_exam_question_options_question_id_fkey 
--   TO question_options_question_id_fkey;
-- 
-- -- Update RLS policies (drop old, create new with original names)
-- DROP POLICY IF EXISTS "Superadmins can view all mock_exam_questions" ON questions;
-- DROP POLICY IF EXISTS "Superadmins can insert mock_exam_questions" ON questions;
-- DROP POLICY IF EXISTS "Superadmins can update mock_exam_questions" ON questions;
-- DROP POLICY IF EXISTS "Superadmins can delete mock_exam_questions" ON questions;
-- DROP POLICY IF EXISTS "Editors can view mock_exam_questions" ON questions;
-- DROP POLICY IF EXISTS "Editors can insert mock_exam_questions" ON questions;
-- DROP POLICY IF EXISTS "Editors can update mock_exam_questions" ON questions;
-- DROP POLICY IF EXISTS "Moderators can view mock_exam_questions" ON questions;
-- 
-- -- Create policies with original names
-- CREATE POLICY "Superadmins can view all questions" ON questions FOR SELECT
-- USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));
-- 
-- CREATE POLICY "Superadmins can insert questions" ON questions FOR INSERT
-- WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));
-- 
-- CREATE POLICY "Superadmins can update questions" ON questions FOR UPDATE
-- USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));
-- 
-- CREATE POLICY "Superadmins can delete questions" ON questions FOR DELETE
-- USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));
-- 
-- CREATE POLICY "Editors can view questions" ON questions FOR SELECT
-- USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));
-- 
-- CREATE POLICY "Editors can insert questions" ON questions FOR INSERT
-- WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));
-- 
-- CREATE POLICY "Editors can update questions" ON questions FOR UPDATE
-- USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));
-- 
-- CREATE POLICY "Moderators can view questions" ON questions FOR SELECT
-- USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));
-- 
-- -- Same for question_options
-- DROP POLICY IF EXISTS "Superadmins can view all mock_exam_question_options" ON question_options;
-- DROP POLICY IF EXISTS "Superadmins can insert mock_exam_question_options" ON question_options;
-- DROP POLICY IF EXISTS "Superadmins can update mock_exam_question_options" ON question_options;
-- DROP POLICY IF EXISTS "Superadmins can delete mock_exam_question_options" ON question_options;
-- DROP POLICY IF EXISTS "Editors can view mock_exam_question_options" ON question_options;
-- DROP POLICY IF EXISTS "Editors can insert mock_exam_question_options" ON question_options;
-- DROP POLICY IF EXISTS "Editors can update mock_exam_question_options" ON question_options;
-- DROP POLICY IF EXISTS "Moderators can view mock_exam_question_options" ON question_options;
-- 
-- CREATE POLICY "Superadmins can view all question_options" ON question_options FOR SELECT
-- USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));
-- 
-- CREATE POLICY "Superadmins can insert question_options" ON question_options FOR INSERT
-- WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));
-- 
-- CREATE POLICY "Superadmins can update question_options" ON question_options FOR UPDATE
-- USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));
-- 
-- CREATE POLICY "Superadmins can delete question_options" ON question_options FOR DELETE
-- USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));
-- 
-- CREATE POLICY "Editors can view question_options" ON question_options FOR SELECT
-- USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));
-- 
-- CREATE POLICY "Editors can insert question_options" ON question_options FOR INSERT
-- WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));
-- 
-- CREATE POLICY "Editors can update question_options" ON question_options FOR UPDATE
-- USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));
-- 
-- CREATE POLICY "Moderators can view question_options" ON question_options FOR SELECT
-- USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- ============================================
-- Step 5: Drop New Tables (Optional - Uncomment to execute)
-- ============================================

-- WARNING: Only uncomment and run this section if you want to completely
-- remove the new table structure. This will delete all practice and learning
-- questions that were not restored to mock_exam_questions.

-- Uncomment the following lines to drop new tables:

-- -- Drop practice tables
-- DROP TABLE IF EXISTS practice_question_options CASCADE;
-- DROP TABLE IF EXISTS practice_questions CASCADE;
-- 
-- -- Drop learning tables
-- DROP TABLE IF EXISTS learning_question_options CASCADE;
-- DROP TABLE IF EXISTS learning_questions CASCADE;
-- 
-- -- Drop content tables
-- DROP TABLE IF EXISTS topic_flash_content CASCADE;
-- DROP TABLE IF EXISTS topic_core_notes CASCADE;
-- 
-- -- Drop progress tables
-- DROP TABLE IF EXISTS subtopic_progress CASCADE;
-- DROP TABLE IF EXISTS topic_progress CASCADE;
-- 
-- -- Remove new columns from lessons table
-- ALTER TABLE lessons DROP COLUMN IF EXISTS is_mandatory;
-- ALTER TABLE lessons DROP COLUMN IF EXISTS content_type;
-- ALTER TABLE lessons DROP COLUMN IF EXISTS podcast_url;

-- ============================================
-- Commit Transaction
-- ============================================
COMMIT;

-- ============================================
-- Rollback Complete!
-- ============================================
-- Questions have been restored to mock_exam_questions table
-- To fully revert to original structure:
-- 1. Uncomment and run Step 4 to rename tables back
-- 2. Uncomment and run Step 5 to drop new tables
-- 3. Update application code to use original table names
-- ============================================

-- ============================================
-- Rollback Verification Queries
-- ============================================

-- Show total questions by table
SELECT 
  'mock_exam_questions' as table_name,
  COUNT(*) as question_count
FROM mock_exam_questions
UNION ALL
SELECT 
  'practice_questions' as table_name,
  COUNT(*) as question_count
FROM practice_questions
UNION ALL
SELECT 
  'learning_questions' as table_name,
  COUNT(*) as question_count
FROM learning_questions;

-- Show questions with and without lesson_id
SELECT 
  CASE 
    WHEN lesson_id IS NULL THEN 'No lesson_id'
    ELSE 'Has lesson_id'
  END as lesson_status,
  COUNT(*) as question_count
FROM mock_exam_questions
GROUP BY lesson_status;

-- Show sample restored questions
SELECT 
  id,
  lesson_id,
  question_text,
  difficulty,
  is_active
FROM mock_exam_questions
ORDER BY created_at DESC
LIMIT 10;
