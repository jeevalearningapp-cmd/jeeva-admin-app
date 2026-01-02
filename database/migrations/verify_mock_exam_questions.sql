-- ============================================
-- Mock Exam Questions Verification Script
-- This script verifies that questions without lesson associations
-- remain in mock_exam_questions table after migration
-- ============================================

-- ============================================
-- Step 1: Count Remaining Mock Exam Questions
-- ============================================

DO $$
DECLARE
  total_questions INTEGER;
  questions_with_lessons INTEGER;
  questions_without_lessons INTEGER;
  total_options INTEGER;
BEGIN
  -- Count total questions in mock_exam_questions
  SELECT COUNT(*) INTO total_questions FROM mock_exam_questions;
  
  -- Count questions with lesson associations
  SELECT COUNT(*) INTO questions_with_lessons 
  FROM mock_exam_questions 
  WHERE lesson_id IS NOT NULL;
  
  -- Count questions without lesson associations
  SELECT COUNT(*) INTO questions_without_lessons 
  FROM mock_exam_questions 
  WHERE lesson_id IS NULL;
  
  -- Count total options
  SELECT COUNT(*) INTO total_options FROM mock_exam_question_options;
  
  RAISE NOTICE 'Mock Exam Questions Verification:';
  RAISE NOTICE '  Total questions remaining: %', total_questions;
  RAISE NOTICE '  Questions with lesson_id: %', questions_with_lessons;
  RAISE NOTICE '  Questions without lesson_id: %', questions_without_lessons;
  RAISE NOTICE '  Total options: %', total_options;
  
  -- Warn if there are still questions with lesson associations
  IF questions_with_lessons > 0 THEN
    RAISE WARNING 'There are still % questions with lesson associations in mock_exam_questions!', questions_with_lessons;
    RAISE WARNING 'These should have been migrated to practice_questions or learning_questions.';
  END IF;
  
  -- Verify we have questions remaining
  IF total_questions = 0 THEN
    RAISE WARNING 'No questions remain in mock_exam_questions! This may be expected if all questions were associated with lessons.';
  ELSE
    RAISE NOTICE 'Mock exam questions are properly preserved.';
  END IF;
END $$;

-- ============================================
-- Step 2: Verify Foreign Key Relationships
-- ============================================

-- Check that all question options have valid question_id references
SELECT 
  'Valid Options' as check_name,
  COUNT(*) as count
FROM mock_exam_question_options opt
WHERE EXISTS (
  SELECT 1 FROM mock_exam_questions q WHERE q.id = opt.question_id
);

-- Check for orphaned options (should be 0)
SELECT 
  'Orphaned Options' as check_name,
  COUNT(*) as count
FROM mock_exam_question_options opt
WHERE NOT EXISTS (
  SELECT 1 FROM mock_exam_questions q WHERE q.id = opt.question_id
);

-- ============================================
-- Step 3: Verify Data Integrity
-- ============================================

-- Check for questions without options
SELECT 
  'Questions Without Options' as check_name,
  COUNT(*) as count
FROM mock_exam_questions q
WHERE NOT EXISTS (
  SELECT 1 FROM mock_exam_question_options opt
  WHERE opt.question_id = q.id
);

-- Check for questions without correct answers
SELECT 
  'Questions Without Correct Answer' as check_name,
  COUNT(*) as count
FROM mock_exam_questions q
WHERE NOT EXISTS (
  SELECT 1 FROM mock_exam_question_options opt
  WHERE opt.question_id = q.id AND opt.is_correct = true
);

-- ============================================
-- Step 4: Show Sample Mock Exam Questions
-- ============================================

-- Show first 10 mock exam questions
SELECT 
  id,
  lesson_id,
  question_text,
  question_type,
  difficulty,
  is_active,
  created_at
FROM mock_exam_questions
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- Step 5: Verify Mock Exam Functionality
-- ============================================

-- Simulate a mock exam query (get random questions)
SELECT 
  q.id,
  q.question_text,
  q.difficulty,
  q.points,
  json_agg(
    json_build_object(
      'id', opt.id,
      'option_text', opt.option_text,
      'display_order', opt.display_order
    ) ORDER BY opt.display_order
  ) as options
FROM mock_exam_questions q
INNER JOIN mock_exam_question_options opt ON q.id = opt.question_id
WHERE q.is_active = true
GROUP BY q.id, q.question_text, q.difficulty, q.points
ORDER BY RANDOM()
LIMIT 5;

-- ============================================
-- Step 6: Check for Questions That Should Have Been Migrated
-- ============================================

-- Find questions with lesson_id that are still in mock_exam_questions
-- These might have been missed during migration
SELECT 
  q.id,
  q.lesson_id,
  l.title as lesson_title,
  t.title as topic_title,
  m.title as module_title,
  q.question_text,
  q.difficulty
FROM mock_exam_questions q
LEFT JOIN lessons l ON q.lesson_id = l.id
LEFT JOIN topics t ON l.topic_id = t.id
LEFT JOIN modules m ON t.module_id = m.id
WHERE q.lesson_id IS NOT NULL
ORDER BY m.title, t.title, l.title;

-- ============================================
-- Step 7: Summary Statistics
-- ============================================

-- Overall migration summary
SELECT 
  'practice_questions' as table_name,
  COUNT(*) as question_count,
  COUNT(CASE WHEN is_active THEN 1 END) as active_count
FROM practice_questions
UNION ALL
SELECT 
  'learning_questions' as table_name,
  COUNT(*) as question_count,
  COUNT(CASE WHEN is_active THEN 1 END) as active_count
FROM learning_questions
UNION ALL
SELECT 
  'mock_exam_questions' as table_name,
  COUNT(*) as question_count,
  COUNT(CASE WHEN is_active THEN 1 END) as active_count
FROM mock_exam_questions
ORDER BY table_name;

-- ============================================
-- Verification Complete!
-- ============================================
-- Review the output above to ensure:
-- 1. Mock exam questions without lesson_id remain in mock_exam_questions
-- 2. All foreign key relationships are valid
-- 3. No orphaned options exist
-- 4. Questions have valid options and correct answers
-- 5. Mock exam functionality still works
-- ============================================
