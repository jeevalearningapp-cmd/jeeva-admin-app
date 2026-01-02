-- ============================================
-- Verification Script for Learning Module Restructure Migration
-- Run this after executing learning_module_restructure.sql
-- ============================================

\echo '============================================'
\echo 'Learning Module Restructure - Verification'
\echo '============================================'
\echo ''

-- ============================================
-- 1. Check that all new tables exist
-- ============================================
\echo '1. Checking if all new tables exist...'
\echo ''

SELECT 
  CASE 
    WHEN COUNT(*) = 10 THEN '✓ All 10 tables exist'
    ELSE '✗ Missing tables: ' || (10 - COUNT(*))::text
  END as table_check
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'practice_questions',
  'practice_question_options',
  'learning_questions',
  'learning_question_options',
  'mock_exam_questions',
  'mock_exam_question_options',
  'topic_core_notes',
  'topic_flash_content',
  'subtopic_progress',
  'topic_progress'
);

\echo ''
\echo 'Detailed table list:'
SELECT table_name, 
       CASE WHEN table_name IS NOT NULL THEN '✓' ELSE '✗' END as exists
FROM (VALUES 
  ('practice_questions'),
  ('practice_question_options'),
  ('learning_questions'),
  ('learning_question_options'),
  ('mock_exam_questions'),
  ('mock_exam_question_options'),
  ('topic_core_notes'),
  ('topic_flash_content'),
  ('subtopic_progress'),
  ('topic_progress')
) AS expected(table_name)
LEFT JOIN information_schema.tables t 
  ON t.table_name = expected.table_name 
  AND t.table_schema = 'public'
ORDER BY expected.table_name;

-- ============================================
-- 2. Check that lessons table has new columns
-- ============================================
\echo ''
\echo '2. Checking lessons table new columns...'
\echo ''

SELECT 
  CASE 
    WHEN COUNT(*) = 3 THEN '✓ All 3 new columns exist in lessons table'
    ELSE '✗ Missing columns: ' || (3 - COUNT(*))::text
  END as column_check
FROM information_schema.columns 
WHERE table_name = 'lessons' 
AND column_name IN ('is_mandatory', 'content_type', 'podcast_url');

\echo ''
\echo 'Detailed column list:'
SELECT column_name, data_type, column_default,
       CASE WHEN column_name IS NOT NULL THEN '✓' ELSE '✗' END as exists
FROM (VALUES 
  ('is_mandatory'),
  ('content_type'),
  ('podcast_url')
) AS expected(column_name)
LEFT JOIN information_schema.columns c 
  ON c.column_name = expected.column_name 
  AND c.table_name = 'lessons'
  AND c.table_schema = 'public'
ORDER BY expected.column_name;

-- ============================================
-- 3. Check that RLS is enabled on all tables
-- ============================================
\echo ''
\echo '3. Checking Row Level Security (RLS) status...'
\echo ''

SELECT 
  CASE 
    WHEN COUNT(*) = 10 THEN '✓ RLS enabled on all 10 tables'
    ELSE '✗ RLS not enabled on ' || (10 - COUNT(*))::text || ' tables'
  END as rls_check
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
AND tablename IN (
  'practice_questions',
  'practice_question_options',
  'learning_questions',
  'learning_question_options',
  'mock_exam_questions',
  'mock_exam_question_options',
  'topic_core_notes',
  'topic_flash_content',
  'subtopic_progress',
  'topic_progress'
);

\echo ''
\echo 'Detailed RLS status:'
SELECT tablename, 
       CASE WHEN rowsecurity THEN '✓ Enabled' ELSE '✗ Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'practice_questions',
  'practice_question_options',
  'learning_questions',
  'learning_question_options',
  'mock_exam_questions',
  'mock_exam_question_options',
  'topic_core_notes',
  'topic_flash_content',
  'subtopic_progress',
  'topic_progress'
)
ORDER BY tablename;

-- ============================================
-- 4. Check indexes
-- ============================================
\echo ''
\echo '4. Checking indexes...'
\echo ''

SELECT 
  tablename,
  COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN (
  'practice_questions',
  'practice_question_options',
  'learning_questions',
  'learning_question_options',
  'topic_core_notes',
  'topic_flash_content',
  'subtopic_progress',
  'topic_progress'
)
GROUP BY tablename
ORDER BY tablename;

\echo ''
\echo 'Expected index counts:'
\echo '  practice_questions: 3 indexes (category, subdivision, active)'
\echo '  practice_question_options: 1 index (question_id)'
\echo '  learning_questions: 4 indexes (topic_id, subtopic_id, video_lesson_id, active)'
\echo '  learning_question_options: 1 index (question_id)'
\echo '  topic_core_notes: 1 index (topic_id)'
\echo '  topic_flash_content: 2 indexes (topic_id, screen_number)'
\echo '  subtopic_progress: 4 indexes (user_id, topic_id, subtopic_id, status)'
\echo '  topic_progress: 2 indexes (user_id, topic_id)'

-- ============================================
-- 5. Check foreign key constraints
-- ============================================
\echo ''
\echo '5. Checking foreign key constraints...'
\echo ''

SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  '✓' as exists
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN (
  'practice_question_options',
  'learning_questions',
  'learning_question_options',
  'topic_core_notes',
  'topic_flash_content',
  'subtopic_progress',
  'topic_progress'
)
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 6. Check unique constraints
-- ============================================
\echo ''
\echo '6. Checking unique constraints...'
\echo ''

SELECT 
  tc.table_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns,
  '✓' as exists
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE' 
AND tc.table_schema = 'public'
AND tc.table_name IN (
  'topic_core_notes',
  'topic_flash_content',
  'subtopic_progress',
  'topic_progress'
)
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

\echo ''
\echo 'Expected unique constraints:'
\echo '  topic_core_notes: UNIQUE(topic_id)'
\echo '  topic_flash_content: UNIQUE(topic_id, screen_number)'
\echo '  subtopic_progress: UNIQUE(user_id, subtopic_id)'
\echo '  topic_progress: UNIQUE(user_id, topic_id)'

-- ============================================
-- 7. Check CHECK constraints
-- ============================================
\echo ''
\echo '7. Checking CHECK constraints...'
\echo ''

SELECT 
  tc.table_name,
  cc.check_clause,
  '✓' as exists
FROM information_schema.table_constraints AS tc
JOIN information_schema.check_constraints AS cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
AND tc.table_schema = 'public'
AND tc.table_name IN (
  'practice_questions',
  'learning_questions',
  'topic_flash_content',
  'subtopic_progress',
  'lessons'
)
ORDER BY tc.table_name;

-- ============================================
-- 8. Check RLS policies count
-- ============================================
\echo ''
\echo '8. Checking RLS policies...'
\echo ''

SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'practice_questions',
  'practice_question_options',
  'learning_questions',
  'learning_question_options',
  'mock_exam_questions',
  'mock_exam_question_options',
  'topic_core_notes',
  'topic_flash_content',
  'subtopic_progress',
  'topic_progress'
)
GROUP BY schemaname, tablename
ORDER BY tablename;

\echo ''
\echo 'Expected policy counts:'
\echo '  practice_questions: 4 policies (superadmin, editor, moderator view + admin CRUD)'
\echo '  practice_question_options: 4 policies'
\echo '  learning_questions: 4 policies'
\echo '  learning_question_options: 4 policies'
\echo '  mock_exam_questions: 4 policies'
\echo '  mock_exam_question_options: 4 policies'
\echo '  topic_core_notes: 4 policies'
\echo '  topic_flash_content: 4 policies'
\echo '  subtopic_progress: 4 policies (user own + admin view)'
\echo '  topic_progress: 4 policies (user own + admin view)'

-- ============================================
-- 9. Check data in renamed tables
-- ============================================
\echo ''
\echo '9. Checking data in renamed tables...'
\echo ''

SELECT 
  'mock_exam_questions' as table_name,
  COUNT(*) as row_count
FROM mock_exam_questions
UNION ALL
SELECT 
  'mock_exam_question_options' as table_name,
  COUNT(*) as row_count
FROM mock_exam_question_options;

\echo ''
\echo 'Note: These counts should match the original questions and question_options tables'

-- ============================================
-- 10. Summary
-- ============================================
\echo ''
\echo '============================================'
\echo 'Verification Summary'
\echo '============================================'
\echo ''
\echo 'If all checks show ✓, the migration was successful!'
\echo ''
\echo 'Next steps:'
\echo '  1. Review any ✗ marks above and investigate issues'
\echo '  2. Test RLS policies with different user roles'
\echo '  3. Proceed to Task 2: Data Migration'
\echo ''
\echo '============================================'
