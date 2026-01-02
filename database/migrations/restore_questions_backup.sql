-- ============================================================================
-- Restore Script for Questions and Question Options Tables
-- ============================================================================
-- Purpose: Restore questions and question_options tables from backup
-- Date: 2024-12-24
-- Related Task: 0.2 Backup Existing Database
-- WARNING: This will DROP existing tables and restore from backup!
-- ============================================================================

\echo '============================================================================'
\echo 'RESTORE QUESTIONS BACKUP'
\echo '============================================================================'
\echo 'WARNING: This will DROP and RECREATE questions and question_options tables!'
\echo 'Press Ctrl+C to cancel, or wait 5 seconds to continue...'

-- Give user time to cancel
SELECT pg_sleep(5);

\echo 'Starting restore process...'

-- Step 1: Verify backup tables exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions_backup') THEN
    RAISE EXCEPTION 'Backup table questions_backup does not exist! Cannot restore.';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'question_options_backup') THEN
    RAISE EXCEPTION 'Backup table question_options_backup does not exist! Cannot restore.';
  END IF;
  
  RAISE NOTICE 'Backup tables verified successfully';
END $$;

-- Step 2: Drop existing tables (if they exist)
\echo 'Dropping existing tables...'

DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;

\echo 'Existing tables dropped'

-- Step 3: Recreate tables from backup
\echo 'Recreating tables from backup...'

-- Recreate questions table
CREATE TABLE questions AS 
SELECT * FROM questions_backup;

-- Recreate question_options table
CREATE TABLE question_options AS 
SELECT * FROM question_options_backup;

\echo 'Tables recreated from backup'

-- Step 4: Restore primary keys and constraints
\echo 'Restoring primary keys and constraints...'

-- Add primary key to questions
ALTER TABLE questions ADD PRIMARY KEY (id);

-- Add primary key to question_options
ALTER TABLE question_options ADD PRIMARY KEY (id);

-- Add foreign key constraint
ALTER TABLE question_options 
  ADD CONSTRAINT question_options_question_id_fkey 
  FOREIGN KEY (question_id) 
  REFERENCES questions(id) 
  ON DELETE CASCADE;

\echo 'Primary keys and constraints restored'

-- Step 5: Recreate indexes
\echo 'Recreating indexes...'

CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);

\echo 'Indexes recreated'

-- Step 6: Restore RLS policies (if they existed)
\echo 'Restoring Row Level Security policies...'

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
CREATE POLICY admin_all_questions ON questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY admin_all_question_options ON question_options
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Users can read active questions
CREATE POLICY users_read_active_questions ON questions
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY users_read_question_options ON question_options
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = question_options.question_id 
      AND questions.is_active = true
    )
  );

\echo 'RLS policies restored'

-- Step 7: Verify restore integrity
\echo 'Verifying restore integrity...'

DO $$
DECLARE
  restored_questions_count INTEGER;
  backup_questions_count INTEGER;
  restored_options_count INTEGER;
  backup_options_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO restored_questions_count FROM questions;
  SELECT COUNT(*) INTO backup_questions_count FROM questions_backup;
  SELECT COUNT(*) INTO restored_options_count FROM question_options;
  SELECT COUNT(*) INTO backup_options_count FROM question_options_backup;
  
  IF restored_questions_count != backup_questions_count THEN
    RAISE EXCEPTION 'Questions restore count mismatch! Restored: %, Backup: %', 
      restored_questions_count, backup_questions_count;
  END IF;
  
  IF restored_options_count != backup_options_count THEN
    RAISE EXCEPTION 'Question options restore count mismatch! Restored: %, Backup: %', 
      restored_options_count, backup_options_count;
  END IF;
  
  RAISE NOTICE 'Restore verification successful!';
  RAISE NOTICE 'Questions: % rows restored', restored_questions_count;
  RAISE NOTICE 'Question Options: % rows restored', restored_options_count;
END $$;

-- Step 8: Record restore in metadata
INSERT INTO backup_metadata (backup_name, table_name, row_count, backup_location, notes)
VALUES 
  ('restore_from_backup', 'questions', (SELECT COUNT(*) FROM questions), 'questions_backup', 'Restored from backup'),
  ('restore_from_backup', 'question_options', (SELECT COUNT(*) FROM question_options), 'question_options_backup', 'Restored from backup');

-- Step 9: Generate restore summary report
\echo ''
\echo '============================================================================'
\echo 'RESTORE SUMMARY REPORT'
\echo '============================================================================'

SELECT 
  'questions' as table_name,
  COUNT(*) as row_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM questions
UNION ALL
SELECT 
  'question_options' as table_name,
  COUNT(*) as row_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM question_options;

\echo ''
\echo 'Restore completed successfully!'
\echo '============================================================================'
