# Database Backup and Restore Guide

## Overview

This guide provides comprehensive instructions for backing up and restoring the `questions` and `question_options` tables before the Learning Module restructuring migration.

**Related Task:** 0.2 Backup Existing Database  
**Date:** 2024-12-24  
**Requirements:** 9.1-9.8

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backup Procedures](#backup-procedures)
3. [Backup Locations](#backup-locations)
4. [Restore Procedures](#restore-procedures)
5. [Testing Restore on Development](#testing-restore-on-development)
6. [Verification Steps](#verification-steps)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Access

- **Production Database:** Supabase project access with service role key
- **Development Database:** Local or staging Supabase instance
- **File System:** Write access to `/tmp` directory or custom backup location

### Required Tools

- PostgreSQL client (`psql`) version 11 or higher
- Supabase CLI (optional, for easier database access)
- CSV viewer/editor (for manual backup inspection)

### Environment Variables

Ensure you have the following environment variables set:

```bash
SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

## Backup Procedures

### Method 1: Automated SQL Backup Script (Recommended)

This method creates both CSV exports and in-database backup tables.

#### Step 1: Connect to Database

```bash
# Using psql
psql "$SUPABASE_DB_URL"

# OR using Supabase CLI
supabase db connect
```

#### Step 2: Run Backup Script

```bash
# From the project root
psql "$SUPABASE_DB_URL" -f jeeva-admin-portal/database/migrations/backup_questions_tables.sql
```

#### Step 3: Verify Backup

The script will output a summary report showing:
- Number of rows backed up
- Backup locations
- Verification status

**Expected Output:**
```
============================================================================
BACKUP SUMMARY REPORT
============================================================================
 backup_name          | table_name         | row_count | backup_location
----------------------+--------------------+-----------+---------------------------
 pre_migration_backup | questions          | 1234      | /tmp/questions_backup.csv
 pre_migration_backup | question_options   | 4936      | /tmp/question_options_backup.csv
 pre_migration_backup | questions_backup   | 1234      | database_table
 pre_migration_backup | question_options_backup | 4936 | database_table
============================================================================
```

### Method 2: Manual CSV Export

If you prefer manual control or the automated script fails:

```sql
-- Export questions table
COPY (
  SELECT * FROM questions ORDER BY created_at
) TO '/tmp/questions_backup.csv' 
WITH (FORMAT CSV, HEADER true);

-- Export question_options table
COPY (
  SELECT * FROM question_options ORDER BY question_id, display_order
) TO '/tmp/question_options_backup.csv' 
WITH (FORMAT CSV, HEADER true);
```

### Method 3: Supabase Dashboard Export

1. Log in to Supabase Dashboard
2. Navigate to **Table Editor**
3. Select `questions` table
4. Click **Export** → **CSV**
5. Repeat for `question_options` table

---

## Backup Locations

### Primary Backup Locations

| Backup Type | Location | Description |
|-------------|----------|-------------|
| CSV Files | `/tmp/questions_backup.csv` | Server file system export |
| CSV Files | `/tmp/question_options_backup.csv` | Server file system export |
| Database Tables | `questions_backup` | In-database backup table |
| Database Tables | `question_options_backup` | In-database backup table |
| Metadata | `backup_metadata` table | Backup tracking information |

### Recommended Storage

For production backups, copy CSV files to secure storage:

```bash
# Copy from server to local machine
scp user@server:/tmp/questions_backup.csv ./backups/
scp user@server:/tmp/question_options_backup.csv ./backups/

# Upload to cloud storage (example: AWS S3)
aws s3 cp ./backups/questions_backup.csv s3://your-bucket/backups/2024-12-24/
aws s3 cp ./backups/question_options_backup.csv s3://your-bucket/backups/2024-12-24/

# OR upload to Supabase Storage
supabase storage upload backups questions_backup.csv
supabase storage upload backups question_options_backup.csv
```

### Backup Retention Policy

- **Production Backups:** Retain for 90 days minimum
- **Pre-Migration Backups:** Retain for 1 year
- **Development Backups:** Retain for 30 days

---

## Restore Procedures

### When to Restore

Restore from backup if:
- Migration fails and data is corrupted
- Need to rollback to pre-migration state
- Testing restore procedures on development
- Data integrity issues detected

### Method 1: Automated SQL Restore Script

**⚠️ WARNING:** This will DROP existing tables and restore from backup!

#### Step 1: Verify Backup Exists

```sql
-- Check backup tables exist
SELECT COUNT(*) FROM questions_backup;
SELECT COUNT(*) FROM question_options_backup;
```

#### Step 2: Run Restore Script

```bash
# From the project root
psql "$SUPABASE_DB_URL" -f jeeva-admin-portal/database/migrations/restore_questions_backup.sql
```

The script includes a 5-second delay to allow cancellation (Ctrl+C).

#### Step 3: Verify Restore

Check the summary report output for row counts and verification status.

### Method 2: Manual CSV Import

If CSV files are available:

```sql
-- Drop existing tables
DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;

-- Recreate questions table structure
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Import from CSV
COPY questions FROM '/tmp/questions_backup.csv' 
WITH (FORMAT CSV, HEADER true);

-- Recreate question_options table structure
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Import from CSV
COPY question_options FROM '/tmp/question_options_backup.csv' 
WITH (FORMAT CSV, HEADER true);

-- Recreate indexes
CREATE INDEX idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX idx_question_options_question_id ON question_options(question_id);
```

---

## Testing Restore on Development

Before running restore on production, **always test on development first**.

### Step 1: Set Up Development Database

```bash
# Connect to development database
export SUPABASE_DB_URL="postgresql://postgres:[DEV_PASSWORD]@db.[DEV_PROJECT_REF].supabase.co:5432/postgres"
```

### Step 2: Copy Backup to Development

```bash
# Option A: Copy backup tables from production
pg_dump "$PROD_SUPABASE_DB_URL" -t questions_backup -t question_options_backup | psql "$DEV_SUPABASE_DB_URL"

# Option B: Copy CSV files
scp prod-server:/tmp/questions_backup.csv ./
scp prod-server:/tmp/question_options_backup.csv ./
```

### Step 3: Run Restore on Development

```bash
psql "$DEV_SUPABASE_DB_URL" -f jeeva-admin-portal/database/migrations/restore_questions_backup.sql
```

### Step 4: Verify Development Restore

```sql
-- Check row counts
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM question_options;

-- Check data integrity
SELECT 
  q.id,
  q.question_text,
  COUNT(qo.id) as option_count
FROM questions q
LEFT JOIN question_options qo ON qo.question_id = q.id
GROUP BY q.id, q.question_text
HAVING COUNT(qo.id) = 0;  -- Should return 0 rows (no questions without options)

-- Check foreign key integrity
SELECT COUNT(*) 
FROM question_options qo
LEFT JOIN questions q ON q.id = qo.question_id
WHERE q.id IS NULL;  -- Should return 0 (no orphaned options)
```

### Step 5: Test Application

- Start development server
- Navigate to questions management
- Verify questions display correctly
- Test CRUD operations
- Check question options display

---

## Verification Steps

### Post-Backup Verification

Run these checks after creating a backup:

```sql
-- 1. Verify row counts match
SELECT 
  (SELECT COUNT(*) FROM questions) as original_questions,
  (SELECT COUNT(*) FROM questions_backup) as backup_questions,
  (SELECT COUNT(*) FROM question_options) as original_options,
  (SELECT COUNT(*) FROM question_options_backup) as backup_options;

-- 2. Verify data integrity
SELECT 
  COUNT(*) as questions_with_options
FROM questions q
WHERE EXISTS (
  SELECT 1 FROM question_options qo 
  WHERE qo.question_id = q.id
);

-- 3. Check backup metadata
SELECT * FROM backup_metadata 
WHERE backup_name = 'pre_migration_backup'
ORDER BY backup_date DESC;

-- 4. Verify CSV files exist (if using file system)
\! ls -lh /tmp/questions_backup.csv
\! ls -lh /tmp/question_options_backup.csv
```

### Post-Restore Verification

Run these checks after restoring from backup:

```sql
-- 1. Verify table structure
\d questions
\d question_options

-- 2. Verify constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid IN ('questions'::regclass, 'question_options'::regclass);

-- 3. Verify indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('questions', 'question_options');

-- 4. Verify RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('questions', 'question_options');

-- 5. Sample data check
SELECT * FROM questions LIMIT 5;
SELECT * FROM question_options LIMIT 5;
```

---

## Troubleshooting

### Issue: Permission Denied on CSV Export

**Error:** `ERROR: could not open file "/tmp/questions_backup.csv" for writing: Permission denied`

**Solution:**
```sql
-- Use a different directory with write permissions
COPY questions TO '/var/tmp/questions_backup.csv' WITH CSV HEADER;

-- OR use STDOUT and redirect
\copy questions TO '/path/to/local/questions_backup.csv' WITH CSV HEADER;
```

### Issue: Backup Tables Already Exist

**Error:** `ERROR: relation "questions_backup" already exists`

**Solution:**
```sql
-- Drop existing backup tables first
DROP TABLE IF EXISTS questions_backup CASCADE;
DROP TABLE IF EXISTS question_options_backup CASCADE;

-- Then run backup script again
```

### Issue: Foreign Key Constraint Violation on Restore

**Error:** `ERROR: insert or update on table "question_options" violates foreign key constraint`

**Solution:**
```sql
-- Disable foreign key checks temporarily
ALTER TABLE question_options DISABLE TRIGGER ALL;

-- Import data
COPY question_options FROM '/tmp/question_options_backup.csv' WITH CSV HEADER;

-- Re-enable foreign key checks
ALTER TABLE question_options ENABLE TRIGGER ALL;

-- Verify integrity
SELECT COUNT(*) FROM question_options qo
LEFT JOIN questions q ON q.id = qo.question_id
WHERE q.id IS NULL;
```

### Issue: Row Count Mismatch After Restore

**Problem:** Restored table has fewer rows than backup

**Solution:**
```sql
-- Check for import errors in PostgreSQL logs
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Re-import with verbose error reporting
\copy questions FROM '/tmp/questions_backup.csv' WITH (FORMAT CSV, HEADER true, VERBOSE true);

-- Check for duplicate IDs
SELECT id, COUNT(*) 
FROM questions_backup 
GROUP BY id 
HAVING COUNT(*) > 1;
```

### Issue: Backup Metadata Table Missing

**Error:** `ERROR: relation "backup_metadata" does not exist`

**Solution:**
```sql
-- Create backup metadata table
CREATE TABLE backup_metadata (
  id SERIAL PRIMARY KEY,
  backup_name VARCHAR(255) NOT NULL,
  backup_date TIMESTAMPTZ DEFAULT NOW(),
  table_name VARCHAR(255) NOT NULL,
  row_count INTEGER,
  backup_location TEXT,
  notes TEXT
);
```

---

## Backup Checklist

Use this checklist before running the migration:

- [ ] Production database backup completed
- [ ] CSV files exported and saved to secure location
- [ ] In-database backup tables created (`questions_backup`, `question_options_backup`)
- [ ] Backup metadata recorded in `backup_metadata` table
- [ ] Row counts verified (original vs backup)
- [ ] CSV files copied to cloud storage or external location
- [ ] Development database backup completed
- [ ] Restore procedure tested on development database
- [ ] Restore verification passed on development
- [ ] Application tested with restored data on development
- [ ] Backup documentation reviewed and understood
- [ ] Rollback plan documented and approved
- [ ] Team notified of backup completion

---

## Emergency Contacts

If issues arise during backup or restore:

- **Database Administrator:** [Contact Info]
- **DevOps Team:** [Contact Info]
- **Project Lead:** [Contact Info]

---

## Backup Schedule

For ongoing operations after migration:

- **Daily Backups:** Automated via Supabase (Point-in-Time Recovery)
- **Weekly Full Backups:** Manual CSV exports
- **Pre-Migration Backups:** Before any schema changes
- **Monthly Archive:** Long-term storage in cloud

---

## Additional Resources

- [Supabase Backup Documentation](https://supabase.com/docs/guides/platform/backups)
- [PostgreSQL COPY Documentation](https://www.postgresql.org/docs/current/sql-copy.html)
- [PostgreSQL Backup and Restore](https://www.postgresql.org/docs/current/backup.html)

---

**Last Updated:** 2024-12-24  
**Version:** 1.0  
**Maintained By:** Development Team
