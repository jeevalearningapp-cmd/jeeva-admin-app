-- ============================================================================
-- Backup Script for Questions and Question Options Tables
-- ============================================================================
-- Purpose: Create full backup of questions and question_options tables
--          before schema restructuring migration
-- Date: 2024-12-24
-- Related Task: 0.2 Backup Existing Database
-- ============================================================================

-- Step 1: Export questions table to CSV
-- Note: This must be run with appropriate permissions
-- The COPY command exports data to the server's file system

\echo 'Starting backup of questions table...'

-- Create backup directory if it doesn't exist (PostgreSQL 11+)
-- Note: This requires superuser privileges or pg_write_server_files role

-- Export questions table
COPY (
  SELECT 
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
  FROM questions
  ORDER BY created_at
) TO '/tmp/questions_backup.csv' 
WITH (FORMAT CSV, HEADER true, DELIMITER ',', QUOTE '"', ESCAPE '"');

\echo 'Questions table exported to /tmp/questions_backup.csv'

-- Export question_options table
COPY (
  SELECT 
    id,
    question_id,
    option_text,
    is_correct,
    display_order,
    created_at
  FROM question_options
  ORDER BY question_id, display_order
) TO '/tmp/question_options_backup.csv' 
WITH (FORMAT CSV, HEADER true, DELIMITER ',', QUOTE '"', ESCAPE '"');

\echo 'Question options table exported to /tmp/question_options_backup.csv'

-- Step 2: Create backup tables (alternative to CSV export)
-- These tables will remain in the database as a safety net

\echo 'Creating backup tables in database...'

-- Drop backup tables if they exist
DROP TABLE IF EXISTS questions_backup CASCADE;
DROP TABLE IF EXISTS question_options_backup CASCADE;

-- Create backup of questions table
CREATE TABLE questions_backup AS 
SELECT * FROM questions;

\echo 'Created questions_backup table with row count:'
SELECT COUNT(*) as questions_count FROM questions_backup;

-- Create backup of question_options table
CREATE TABLE question_options_backup AS 
SELECT * FROM question_options;

\echo 'Created question_options_backup table with row count:'
SELECT COUNT(*) as question_options_count FROM question_options_backup;

-- Add indexes to backup tables for faster restore if needed
CREATE INDEX idx_questions_backup_id ON questions_backup(id);
CREATE INDEX idx_questions_backup_lesson_id ON questions_backup(lesson_id);
CREATE INDEX idx_question_options_backup_id ON question_options_backup(id);
CREATE INDEX idx_question_options_backup_question_id ON question_options_backup(question_id);

\echo 'Backup indexes created successfully'

-- Step 3: Create metadata table to track backup
CREATE TABLE IF NOT EXISTS backup_metadata (
  id SERIAL PRIMARY KEY,
  backup_name VARCHAR(255) NOT NULL,
  backup_date TIMESTAMPTZ DEFAULT NOW(),
  table_name VARCHAR(255) NOT NULL,
  row_count INTEGER,
  backup_location TEXT,
  notes TEXT
);

-- Insert backup metadata
INSERT INTO backup_metadata (backup_name, table_name, row_count, backup_location, notes)
VALUES 
  ('pre_migration_backup', 'questions', (SELECT COUNT(*) FROM questions), '/tmp/questions_backup.csv', 'Backup before learning module restructure'),
  ('pre_migration_backup', 'question_options', (SELECT COUNT(*) FROM question_options), '/tmp/question_options_backup.csv', 'Backup before learning module restructure'),
  ('pre_migration_backup', 'questions_backup', (SELECT COUNT(*) FROM questions_backup), 'database_table', 'In-database backup table'),
  ('pre_migration_backup', 'question_options_backup', (SELECT COUNT(*) FROM question_options_backup), 'database_table', 'In-database backup table');

\echo 'Backup metadata recorded'

-- Step 4: Verify backup integrity
\echo 'Verifying backup integrity...'

-- Check row counts match
DO $$
DECLARE
  original_questions_count INTEGER;
  backup_questions_count INTEGER;
  original_options_count INTEGER;
  backup_options_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO original_questions_count FROM questions;
  SELECT COUNT(*) INTO backup_questions_count FROM questions_backup;
  SELECT COUNT(*) INTO original_options_count FROM question_options;
  SELECT COUNT(*) INTO backup_options_count FROM question_options_backup;
  
  IF original_questions_count != backup_questions_count THEN
    RAISE EXCEPTION 'Questions backup count mismatch! Original: %, Backup: %', 
      original_questions_count, backup_questions_count;
  END IF;
  
  IF original_options_count != backup_options_count THEN
    RAISE EXCEPTION 'Question options backup count mismatch! Original: %, Backup: %', 
      original_options_count, backup_options_count;
  END IF;
  
  RAISE NOTICE 'Backup verification successful!';
  RAISE NOTICE 'Questions: % rows backed up', original_questions_count;
  RAISE NOTICE 'Question Options: % rows backed up', original_options_count;
END $$;

-- Step 5: Generate backup summary report
\echo ''
\echo '============================================================================'
\echo 'BACKUP SUMMARY REPORT'
\echo '============================================================================'

SELECT 
  backup_name,
  table_name,
  row_count,
  backup_location,
  backup_date,
  notes
FROM backup_metadata
WHERE backup_name = 'pre_migration_backup'
ORDER BY backup_date DESC;

\echo ''
\echo 'Backup completed successfully!'
\echo 'CSV files location: /tmp/questions_backup.csv, /tmp/question_options_backup.csv'
\echo 'Database backup tables: questions_backup, question_options_backup'
\echo '============================================================================'
