-- ============================================
-- Practice Questions Migration Script
-- This script migrates questions from mock_exam_questions to practice_questions
-- ============================================

-- Start transaction for data integrity
BEGIN;

-- ============================================
-- Step 1: Create temporary table to track migrated questions
-- ============================================
CREATE TEMP TABLE practice_migration_log (
  old_question_id UUID,
  new_question_id UUID,
  category VARCHAR(100),
  subdivision VARCHAR(100),
  migrated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Step 2: Migrate Practice Questions
-- ============================================

-- Insert practice questions from mock_exam_questions
-- Category and subdivision are derived from topic and lesson titles
INSERT INTO practice_questions (
  id, -- Keep the same ID for easier tracking
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
    -- Map topic titles to Practice Module categories
    WHEN t.title ILIKE '%numeracy%' THEN 'Numeracy'
    WHEN t.title ILIKE '%clinical%' THEN 'Clinical Knowledge'
    -- Default fallback based on common patterns
    WHEN t.title ILIKE '%calculation%' OR t.title ILIKE '%math%' THEN 'Numeracy'
    ELSE 'Clinical Knowledge'
  END as category,
  -- Use lesson title as subdivision
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
ON CONFLICT (id) DO NOTHING; -- Skip if already migrated

-- Log migrated questions
INSERT INTO practice_migration_log (old_question_id, new_question_id, category, subdivision)
SELECT 
  q.id,
  q.id, -- Same ID
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

-- ============================================
-- Step 3: Migrate Practice Question Options
-- ============================================

-- Insert practice question options
INSERT INTO practice_question_options (
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
  SELECT old_question_id FROM practice_migration_log
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
  SELECT COUNT(*) INTO migrated_count FROM practice_migration_log;
  SELECT COUNT(*) INTO options_count FROM practice_question_options;
  
  RAISE NOTICE 'Practice Questions Migration Summary:';
  RAISE NOTICE '  Questions migrated: %', migrated_count;
  RAISE NOTICE '  Options migrated: %', options_count;
  
  -- Verify each question has at least one option
  IF EXISTS (
    SELECT 1 FROM practice_questions pq
    WHERE NOT EXISTS (
      SELECT 1 FROM practice_question_options pqo
      WHERE pqo.question_id = pq.id
    )
  ) THEN
    RAISE WARNING 'Some practice questions have no options!';
  END IF;
  
  -- Verify each question has at least one correct answer
  IF EXISTS (
    SELECT 1 FROM practice_questions pq
    WHERE NOT EXISTS (
      SELECT 1 FROM practice_question_options pqo
      WHERE pqo.question_id = pq.id AND pqo.is_correct = true
    )
  ) THEN
    RAISE WARNING 'Some practice questions have no correct answer!';
  END IF;
END $$;

-- ============================================
-- Step 5: Delete Migrated Questions from mock_exam_questions
-- ============================================

-- Delete question options first (due to foreign key)
DELETE FROM mock_exam_question_options
WHERE question_id IN (
  SELECT old_question_id FROM practice_migration_log
);

-- Delete questions
DELETE FROM mock_exam_questions
WHERE id IN (
  SELECT old_question_id FROM practice_migration_log
);

-- ============================================
-- Step 6: Final Verification
-- ============================================

-- Show migration summary by category
SELECT 
  category,
  subdivision,
  COUNT(*) as question_count,
  COUNT(CASE WHEN is_active THEN 1 END) as active_count
FROM practice_questions
GROUP BY category, subdivision
ORDER BY category, subdivision;

-- Show questions with no options (should be empty)
SELECT 
  pq.id,
  pq.category,
  pq.subdivision,
  pq.question_text
FROM practice_questions pq
WHERE NOT EXISTS (
  SELECT 1 FROM practice_question_options pqo
  WHERE pqo.question_id = pq.id
);

-- Show questions with no correct answer (should be empty)
SELECT 
  pq.id,
  pq.category,
  pq.subdivision,
  pq.question_text
FROM practice_questions pq
WHERE NOT EXISTS (
  SELECT 1 FROM practice_question_options pqo
  WHERE pqo.question_id = pq.id AND pqo.is_correct = true
);

-- ============================================
-- Commit Transaction
-- ============================================
COMMIT;

-- ============================================
-- Migration Complete!
-- ============================================
-- Practice questions have been migrated to practice_questions table
-- Question options have been migrated to practice_question_options table
-- Migrated questions have been deleted from mock_exam_questions
-- Run verification queries above to confirm data integrity
-- ============================================
