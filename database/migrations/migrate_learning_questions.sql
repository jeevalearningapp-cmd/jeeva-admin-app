-- ============================================
-- Learning Questions Migration Script
-- This script migrates questions from mock_exam_questions to learning_questions
-- ============================================

-- Start transaction for data integrity
BEGIN;

-- ============================================
-- Step 1: Create temporary table to track migrated questions
-- ============================================
CREATE TEMP TABLE learning_migration_log (
  old_question_id UUID,
  new_question_id UUID,
  topic_id UUID,
  subtopic_id UUID,
  video_lesson_id UUID,
  migrated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Step 2: Migrate Learning Questions
-- ============================================

-- Insert learning questions from mock_exam_questions
-- topic_id, subtopic_id, and video_lesson_id are derived from lesson associations
INSERT INTO learning_questions (
  id, -- Keep the same ID for easier tracking
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
  -- Subtopic is the parent topic if it exists, otherwise use the same topic
  COALESCE(t.parent_id, t.id) as subtopic_id,
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
ON CONFLICT (id) DO NOTHING; -- Skip if already migrated

-- Log migrated questions
INSERT INTO learning_migration_log (old_question_id, new_question_id, topic_id, subtopic_id, video_lesson_id)
SELECT 
  q.id,
  q.id, -- Same ID
  t.id as topic_id,
  COALESCE(t.parent_id, t.id) as subtopic_id,
  l.id as video_lesson_id
FROM mock_exam_questions q
INNER JOIN lessons l ON q.lesson_id = l.id
INNER JOIN topics t ON l.topic_id = t.id
INNER JOIN modules m ON t.module_id = m.id
WHERE m.title ILIKE '%learning%';

-- ============================================
-- Step 3: Migrate Learning Question Options
-- ============================================

-- Insert learning question options
INSERT INTO learning_question_options (
  id, -- Keep the same ID
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
WHERE opt.question_id IN (
  SELECT old_question_id FROM learning_migration_log
)
ON CONFLICT (id) DO NOTHING; -- Skip if already migrated

-- ============================================
-- Step 4: Verify Migration
-- ============================================

-- Count migrated questions
DO $$
DECLARE
  migrated_count INTEGER;
  options_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count FROM learning_migration_log;
  SELECT COUNT(*) INTO options_count FROM learning_question_options;
  
  RAISE NOTICE 'Learning Questions Migration Summary:';
  RAISE NOTICE '  Questions migrated: %', migrated_count;
  RAISE NOTICE '  Options migrated: %', options_count;
  
  -- Verify each question has at least one option
  IF EXISTS (
    SELECT 1 FROM learning_questions lq
    WHERE NOT EXISTS (
      SELECT 1 FROM learning_question_options lqo
      WHERE lqo.question_id = lq.id
    )
  ) THEN
    RAISE WARNING 'Some learning questions have no options!';
  END IF;
  
  -- Verify each question has at least one correct answer
  IF EXISTS (
    SELECT 1 FROM learning_questions lq
    WHERE NOT EXISTS (
      SELECT 1 FROM learning_question_options lqo
      WHERE lqo.question_id = lq.id AND lqo.is_correct = true
    )
  ) THEN
    RAISE WARNING 'Some learning questions have no correct answer!';
  END IF;
  
  -- Verify all foreign keys are valid
  IF EXISTS (
    SELECT 1 FROM learning_questions lq
    WHERE NOT EXISTS (SELECT 1 FROM topics WHERE id = lq.topic_id)
  ) THEN
    RAISE WARNING 'Some learning questions have invalid topic_id!';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM learning_questions lq
    WHERE lq.subtopic_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM topics WHERE id = lq.subtopic_id)
  ) THEN
    RAISE WARNING 'Some learning questions have invalid subtopic_id!';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM learning_questions lq
    WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id = lq.video_lesson_id)
  ) THEN
    RAISE WARNING 'Some learning questions have invalid video_lesson_id!';
  END IF;
END $$;

-- ============================================
-- Step 5: Delete Migrated Questions from mock_exam_questions
-- ============================================

-- Delete question options first (due to foreign key)
DELETE FROM mock_exam_question_options
WHERE question_id IN (
  SELECT old_question_id FROM learning_migration_log
);

-- Delete questions
DELETE FROM mock_exam_questions
WHERE id IN (
  SELECT old_question_id FROM learning_migration_log
);

-- ============================================
-- Step 6: Final Verification
-- ============================================

-- Show migration summary by topic
SELECT 
  t.title as topic_title,
  COUNT(lq.id) as question_count,
  COUNT(CASE WHEN lq.is_active THEN 1 END) as active_count,
  COUNT(DISTINCT lq.video_lesson_id) as unique_lessons
FROM learning_questions lq
INNER JOIN topics t ON lq.topic_id = t.id
GROUP BY t.title
ORDER BY t.title;

-- Show questions with no options (should be empty)
SELECT 
  lq.id,
  t.title as topic_title,
  l.title as lesson_title,
  lq.question_text
FROM learning_questions lq
INNER JOIN topics t ON lq.topic_id = t.id
INNER JOIN lessons l ON lq.video_lesson_id = l.id
WHERE NOT EXISTS (
  SELECT 1 FROM learning_question_options lqo
  WHERE lqo.question_id = lq.id
);

-- Show questions with no correct answer (should be empty)
SELECT 
  lq.id,
  t.title as topic_title,
  l.title as lesson_title,
  lq.question_text
FROM learning_questions lq
INNER JOIN topics t ON lq.topic_id = t.id
INNER JOIN lessons l ON lq.video_lesson_id = l.id
WHERE NOT EXISTS (
  SELECT 1 FROM learning_question_options lqo
  WHERE lqo.question_id = lq.id AND lqo.is_correct = true
);

-- Show questions per video lesson
SELECT 
  l.title as lesson_title,
  t.title as topic_title,
  COUNT(lq.id) as question_count
FROM learning_questions lq
INNER JOIN lessons l ON lq.video_lesson_id = l.id
INNER JOIN topics t ON lq.topic_id = t.id
GROUP BY l.title, t.title
ORDER BY t.title, l.title;

-- ============================================
-- Commit Transaction
-- ============================================
COMMIT;

-- ============================================
-- Migration Complete!
-- ============================================
-- Learning questions have been migrated to learning_questions table
-- Question options have been migrated to learning_question_options table
-- Migrated questions have been deleted from mock_exam_questions
-- All questions are properly mapped to video lessons
-- Run verification queries above to confirm data integrity
-- ============================================
