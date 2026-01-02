-- ============================================================================
-- Backup Verification Script
-- ============================================================================
-- Purpose: Verify that backup tables exist and contain valid data
-- Date: 2024-12-24
-- Related Task: 0.2 Backup Existing Database
-- ============================================================================

\echo '============================================================================'
\echo 'BACKUP VERIFICATION REPORT'
\echo '============================================================================'
\echo ''

-- Check if backup tables exist
\echo 'Checking if backup tables exist...'
\echo ''

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions_backup') THEN
    RAISE WARNING 'Backup table questions_backup does NOT exist!';
  ELSE
    RAISE NOTICE '✓ questions_backup table exists';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'question_options_backup') THEN
    RAISE WARNING 'Backup table question_options_backup does NOT exist!';
  ELSE
    RAISE NOTICE '✓ question_options_backup table exists';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_metadata') THEN
    RAISE WARNING 'Backup metadata table does NOT exist!';
  ELSE
    RAISE NOTICE '✓ backup_metadata table exists';
  END IF;
END $$;

\echo ''
\echo '----------------------------------------------------------------------------'
\echo 'Row Count Comparison'
\echo '----------------------------------------------------------------------------'
\echo ''

-- Compare row counts
SELECT 
  'questions' as table_name,
  (SELECT COUNT(*) FROM questions) as original_count,
  (SELECT COUNT(*) FROM questions_backup) as backup_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM questions) = (SELECT COUNT(*) FROM questions_backup)
    THEN '✓ Match'
    ELSE '✗ Mismatch'
  END as status
UNION ALL
SELECT 
  'question_options' as table_name,
  (SELECT COUNT(*) FROM question_options) as original_count,
  (SELECT COUNT(*) FROM question_options_backup) as backup_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM question_options) = (SELECT COUNT(*) FROM question_options_backup)
    THEN '✓ Match'
    ELSE '✗ Mismatch'
  END as status;

\echo ''
\echo '----------------------------------------------------------------------------'
\echo 'Data Integrity Checks'
\echo '----------------------------------------------------------------------------'
\echo ''

-- Check for questions without options in backup
SELECT 
  'Questions without options (backup)' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ Pass'
    ELSE '⚠ Warning'
  END as status
FROM questions_backup q
LEFT JOIN question_options_backup qo ON qo.question_id = q.id
WHERE qo.id IS NULL;

-- Check for orphaned options in backup
SELECT 
  'Orphaned question options (backup)' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ Pass'
    ELSE '✗ Fail'
  END as status
FROM question_options_backup qo
LEFT JOIN questions_backup q ON q.id = qo.question_id
WHERE q.id IS NULL;

-- Check for duplicate IDs in backup
SELECT 
  'Duplicate question IDs (backup)' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ Pass'
    ELSE '✗ Fail'
  END as status
FROM (
  SELECT id, COUNT(*) as cnt
  FROM questions_backup
  GROUP BY id
  HAVING COUNT(*) > 1
) duplicates;

\echo ''
\echo '----------------------------------------------------------------------------'
\echo 'Backup Metadata'
\echo '----------------------------------------------------------------------------'
\echo ''

-- Show backup metadata
SELECT 
  backup_name,
  table_name,
  row_count,
  backup_location,
  TO_CHAR(backup_date, 'YYYY-MM-DD HH24:MI:SS') as backup_date,
  notes
FROM backup_metadata
WHERE backup_name = 'pre_migration_backup'
ORDER BY backup_date DESC;

\echo ''
\echo '----------------------------------------------------------------------------'
\echo 'Sample Data from Backup'
\echo '----------------------------------------------------------------------------'
\echo ''

-- Show sample questions from backup
\echo 'Sample questions from backup (first 3):'
SELECT 
  id,
  LEFT(question_text, 50) || '...' as question_text,
  difficulty,
  is_active,
  TO_CHAR(created_at, 'YYYY-MM-DD') as created_date
FROM questions_backup
ORDER BY created_at
LIMIT 3;

\echo ''
\echo 'Sample question options from backup (first 5):'
SELECT 
  qo.id,
  LEFT(qo.option_text, 40) || '...' as option_text,
  qo.is_correct,
  qo.display_order
FROM question_options_backup qo
ORDER BY qo.created_at
LIMIT 5;

\echo ''
\echo '----------------------------------------------------------------------------'
\echo 'Backup Age'
\echo '----------------------------------------------------------------------------'
\echo ''

-- Check backup age
SELECT 
  backup_name,
  MAX(backup_date) as latest_backup,
  NOW() - MAX(backup_date) as age,
  CASE 
    WHEN NOW() - MAX(backup_date) < INTERVAL '1 day' THEN '✓ Recent (< 1 day)'
    WHEN NOW() - MAX(backup_date) < INTERVAL '7 days' THEN '⚠ Aging (< 7 days)'
    ELSE '✗ Old (> 7 days)'
  END as status
FROM backup_metadata
WHERE backup_name = 'pre_migration_backup'
GROUP BY backup_name;

\echo ''
\echo '============================================================================'
\echo 'VERIFICATION COMPLETE'
\echo '============================================================================'
\echo ''

-- Final summary
DO $$
DECLARE
  questions_match BOOLEAN;
  options_match BOOLEAN;
  no_orphans BOOLEAN;
  backup_exists BOOLEAN;
BEGIN
  -- Check if counts match
  SELECT (SELECT COUNT(*) FROM questions) = (SELECT COUNT(*) FROM questions_backup)
  INTO questions_match;
  
  SELECT (SELECT COUNT(*) FROM question_options) = (SELECT COUNT(*) FROM question_options_backup)
  INTO options_match;
  
  -- Check for orphans
  SELECT (
    SELECT COUNT(*) 
    FROM question_options_backup qo
    LEFT JOIN questions_backup q ON q.id = qo.question_id
    WHERE q.id IS NULL
  ) = 0
  INTO no_orphans;
  
  -- Check if backup tables exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name IN ('questions_backup', 'question_options_backup')
  )
  INTO backup_exists;
  
  IF backup_exists AND questions_match AND options_match AND no_orphans THEN
    RAISE NOTICE '✓ BACKUP VERIFICATION PASSED';
    RAISE NOTICE 'Backup is valid and ready for use';
  ELSE
    RAISE WARNING '✗ BACKUP VERIFICATION FAILED';
    IF NOT backup_exists THEN
      RAISE WARNING 'Backup tables do not exist';
    END IF;
    IF NOT questions_match THEN
      RAISE WARNING 'Questions row count mismatch';
    END IF;
    IF NOT options_match THEN
      RAISE WARNING 'Question options row count mismatch';
    END IF;
    IF NOT no_orphans THEN
      RAISE WARNING 'Orphaned question options detected';
    END IF;
  END IF;
END $$;

\echo ''
