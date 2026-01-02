-- ============================================
-- Pre-Migration Verification Script
-- Run this BEFORE creating new tables
-- ============================================

-- 1. Check if questions table exists and its structure
SELECT 
  'questions' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'questions'
ORDER BY ordinal_position;

-- 2. Check if question_options table exists
SELECT 
  'question_options' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'question_options'
ORDER BY ordinal_position;

-- 3. Count total questions
SELECT 
  'Total Questions' as metric,
  COUNT(*) as count
FROM questions;

-- 4. Count questions by lesson association
SELECT 
  'Questions with lesson_id' as metric,
  COUNT(*) as count
FROM questions
WHERE lesson_id IS NOT NULL;

SELECT 
  'Questions without lesson_id' as metric,
  COUNT(*) as count
FROM questions
WHERE lesson_id IS NULL;

-- 5. Check questions by module (if lessons/topics/modules exist)
SELECT 
  m.title as module_name,
  COUNT(q.id) as question_count
FROM questions q
LEFT JOIN lessons l ON q.lesson_id = l.id
LEFT JOIN topics t ON l.topic_id = t.id
LEFT JOIN modules m ON t.module_id = m.id
GROUP BY m.title
ORDER BY question_count DESC;

-- 6. Check for any existing category or subdivision fields
SELECT 
  column_name
FROM information_schema.columns
WHERE table_name = 'questions'
  AND column_name IN ('category', 'subdivision', 'module_type');

-- 7. Check existing indexes on questions table
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'questions';

-- 8. Check foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'questions'
  AND tc.constraint_type = 'FOREIGN KEY';

-- 9. Check if new tables already exist (should return 0 rows)
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('practice_questions', 'learning_questions', 'topic_core_notes', 'topic_flash_content')
  AND table_schema = 'public';

-- 10. Sample questions data (first 5 rows)
SELECT 
  id,
  lesson_id,
  question_text,
  question_type,
  difficulty,
  is_active,
  created_at
FROM questions
LIMIT 5;

-- ============================================
-- Expected Results:
-- - questions table should exist with lesson_id field
-- - question_options table should exist
-- - Should have questions with and without lesson_id
-- - New tables (practice_questions, learning_questions, etc.) should NOT exist yet
-- ============================================
