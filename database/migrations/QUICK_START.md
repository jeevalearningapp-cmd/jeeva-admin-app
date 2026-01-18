# Quick Start - Learning Module Restructure Migration

## TL;DR - Run This One Script

If you want to run the complete migration in one go:

```sql
-- In Supabase SQL Editor or psql
\i jeeva-admin-portal/database/migrations/run_complete_migration.sql
```

This single script will:

1. ✅ Create all new tables (practice_questions, learning_questions)
2. ✅ Rename questions → mock_exam_questions
3. ✅ Migrate practice questions to practice_questions table
4. ✅ Migrate learning questions to learning_questions table
5. ✅ Verify data integrity
6. ✅ Provide migration summary

**Time**: ~30 minutes
**Prerequisites**: Database backup completed

---

## What This Fixes

The error you encountered:

```
ERROR: 42P01: relation "mock_exam_questions" does not exist
```

This happened because the individual migration scripts expected the schema to already be set up. The `run_complete_migration.sql` script handles everything in the correct order.

---

## Before You Run

### 1. Backup Your Database (CRITICAL!)

```bash
# Using Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# Or use Supabase Dashboard → Database → Backups
```

### 2. Check Current State

```sql
-- Check if questions table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('questions', 'mock_exam_questions', 'practice_questions', 'learning_questions');

-- Count current questions
SELECT COUNT(*) as total_questions FROM questions;
-- OR if already renamed:
SELECT COUNT(*) as total_questions FROM mock_exam_questions;
```

Note the total count - you'll verify this after migration.

---

## Running the Migration

### Option 1: Supabase Dashboard (Recommended)

1. Open your Supabase project
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `run_complete_migration.sql`
5. Paste into the editor
6. Click **Run**
7. Watch the output for any errors or warnings

### Option 2: Command Line (psql)

```bash
cd jeeva-admin-portal/database/migrations
psql "your-database-connection-string" -f run_complete_migration.sql
```

### Option 3: Supabase CLI

```bash
cd jeeva-admin-portal
supabase db push database/migrations/run_complete_migration.sql
```

---

## What to Expect

The script will output progress messages like:

```
NOTICE: === Pre-Migration Status ===
NOTICE: questions table exists: true
NOTICE: mock_exam_questions table exists: false
NOTICE: Schema migration needed. Will run full migration.

NOTICE: === STEP 1: Creating Schema ===
NOTICE: Renamed questions to mock_exam_questions
NOTICE: Schema migration complete!

NOTICE: === STEP 2: Migrating Practice Questions ===
NOTICE: Practice questions migrated: 45

NOTICE: === STEP 3: Migrating Learning Questions ===
NOTICE: Learning questions migrated: 123

NOTICE: === STEP 4: Final Verification ===
NOTICE: Migration Summary:
NOTICE:   Practice questions: 45
NOTICE:   Learning questions: 123
NOTICE:   Mock exam questions: 67
NOTICE:   Total questions: 235

NOTICE: === MIGRATION COMPLETE ===
```

---

## After Migration

### Verify Success

```sql
-- Check all tables exist
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('practice_questions', 'learning_questions', 'mock_exam_questions')
ORDER BY table_name;

-- Verify question counts
SELECT
  'practice_questions' as table_name,
  COUNT(*) as count
FROM practice_questions
UNION ALL
SELECT
  'learning_questions' as table_name,
  COUNT(*) as count
FROM learning_questions
UNION ALL
SELECT
  'mock_exam_questions' as table_name,
  COUNT(*) as count
FROM mock_exam_questions;

-- Total should match your original count from "Before You Run"
```

### Test Queries

```sql
-- Test practice questions query
SELECT
  category,
  subdivision,
  COUNT(*) as question_count
FROM practice_questions
WHERE is_active = true
GROUP BY category, subdivision
ORDER BY category, subdivision;

-- Test learning questions query
SELECT
  t.title as topic,
  COUNT(lq.id) as question_count
FROM learning_questions lq
INNER JOIN topics t ON lq.topic_id = t.id
WHERE lq.is_active = true
GROUP BY t.title
ORDER BY t.title;

-- Test mock exam questions query
SELECT
  difficulty,
  COUNT(*) as question_count
FROM mock_exam_questions
WHERE is_active = true
GROUP BY difficulty
ORDER BY difficulty;
```

---

## If Something Goes Wrong

### Rollback Immediately

```sql
-- Run the rollback script
\i jeeva-admin-portal/database/migrations/rollback_question_migration.sql
```

This will:

- Copy all questions back to mock_exam_questions
- Preserve all data
- Allow you to investigate the issue

### Common Issues

**Issue**: "Some questions have no options"

- **Cause**: Data integrity issue in original data
- **Fix**: Check original questions table for questions without options

**Issue**: "Foreign key violation"

- **Cause**: Referenced topics or lessons don't exist
- **Fix**: Ensure all lessons and topics exist before migration

**Issue**: Transaction timeout

- **Cause**: Too many questions to migrate at once
- **Fix**: Run individual migration scripts instead of master script

---

## Alternative: Step-by-Step Migration

If you prefer to run migrations step-by-step (for debugging or large datasets):

```sql
-- Step 1: Schema only
\i jeeva-admin-portal/database/migrations/learning_module_restructure.sql

-- Step 2: Analyze (optional)
\i jeeva-admin-portal/database/migrations/classify_questions.sql

-- Step 3: Migrate practice
\i jeeva-admin-portal/database/migrations/migrate_practice_questions.sql

-- Step 4: Migrate learning
\i jeeva-admin-portal/database/migrations/migrate_learning_questions.sql

-- Step 5: Verify
\i jeeva-admin-portal/database/migrations/verify_mock_exam_questions.sql
```

---

## Next Steps

After successful migration:

1. ✅ **Task 3**: Update Backend API endpoints to use new tables
2. ✅ **Task 4-5**: Update Admin Portal UI
3. ✅ **Task 6-7**: Update Mobile App UI
4. ✅ **Task 8**: Comprehensive testing
5. ✅ **Task 9**: Documentation and deployment

---

## Support

If you need help:

- Check the detailed guide: `README_DATA_MIGRATION.md`
- Review the design document: `.kiro/specs/learning-module-restructure/design.md`
- Check Supabase logs for detailed error messages

---

## Summary

**One command to rule them all:**

```sql
\i jeeva-admin-portal/database/migrations/run_complete_migration.sql
```

That's it! The script handles everything automatically with proper error checking and rollback support.
