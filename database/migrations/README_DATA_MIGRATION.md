# Data Migration Guide - Learning Module Restructure

## Overview

This guide covers the data migration process for separating questions from the `mock_exam_questions` table into three distinct tables:
- `practice_questions` - Questions for the Practice Module
- `learning_questions` - Questions for the Learning Module  
- `mock_exam_questions` - Questions for Mock Exams (questions without lesson associations)

## Quick Start

**Want to run everything at once?** See [`QUICK_START.md`](./QUICK_START.md) for the one-command migration using `run_complete_migration.sql`.

**Prefer step-by-step?** Continue reading this guide for detailed information about each migration script.

## Prerequisites

Before running the migration:

1. ✅ **Database Backup** - Task 0.2 must be completed (backup created) - **CRITICAL!**
2. ✅ **Schema Migration Complete** - Task 1 must be completed (tables created) - **OR** use `run_complete_migration.sql` which does this automatically
3. ✅ **Verification Script Run** - Task 0.1 should be completed (schema verified) - Optional

## Migration Scripts

### 0. run_complete_migration.sql (RECOMMENDED)
**Purpose**: Run the complete migration in one transaction

**What it does**:
- Checks current database state
- Creates all new tables (schema migration)
- Renames questions → mock_exam_questions
- Migrates practice questions
- Migrates learning questions
- Verifies data integrity
- Provides comprehensive summary

**When to run**: When you want to run the entire migration at once

**How to run**:
```sql
-- Run in Supabase SQL Editor or psql
\i jeeva-admin-portal/database/migrations/run_complete_migration.sql
```

**Expected output**:
- Pre-migration status check
- Schema creation confirmation
- Migration counts for practice and learning questions
- Final verification summary
- Total question counts across all tables

**Advantages**:
- ✅ Single transaction (all-or-nothing)
- ✅ Automatic prerequisite checking
- ✅ Handles both schema and data migration
- ✅ Built-in verification
- ✅ Clear progress reporting

**Use this if**: You want a simple, reliable, one-command migration

---

### 1. classify_questions.sql
**Purpose**: Analyze and classify questions before migration

**What it does**:
- Creates a `classify_question()` function to determine question type
- Creates a `question_classification_analysis` view for reporting
- Provides queries to understand question distribution

**When to run**: Before migration to understand what will be migrated

**How to run**:
```sql
-- Run in Supabase SQL Editor or psql
\i jeeva-admin-portal/database/migrations/classify_questions.sql
```

**Expected output**:
- Classification summary showing counts by type (practice, learning, mock_exam)
- Detailed breakdown by module and topic
- List of questions without lesson associations

### 2. migrate_practice_questions.sql
**Purpose**: Migrate Practice Module questions

**What it does**:
- Copies questions from `mock_exam_questions` to `practice_questions`
- Maps topic titles to categories (Numeracy, Clinical Knowledge)
- Uses lesson titles as subdivisions
- Copies question options to `practice_question_options`
- Deletes migrated questions from `mock_exam_questions`
- Verifies data integrity

**When to run**: After classification analysis

**How to run**:
```sql
-- Run in Supabase SQL Editor or psql
\i jeeva-admin-portal/database/migrations/migrate_practice_questions.sql
```

**Expected output**:
- Migration summary with question and option counts
- Warnings if any questions lack options or correct answers
- Summary by category and subdivision
- Verification queries showing migrated data

### 3. migrate_learning_questions.sql
**Purpose**: Migrate Learning Module questions

**What it does**:
- Copies questions from `mock_exam_questions` to `learning_questions`
- Maps questions to topics, subtopics, and video lessons
- Copies question options to `learning_question_options`
- Deletes migrated questions from `mock_exam_questions`
- Verifies data integrity and foreign key relationships

**When to run**: After practice questions migration

**How to run**:
```sql
-- Run in Supabase SQL Editor or psql
\i jeeva-admin-portal/database/migrations/migrate_learning_questions.sql
```

**Expected output**:
- Migration summary with question and option counts
- Warnings if any questions lack options or correct answers
- Summary by topic and lesson
- Verification queries showing migrated data

### 4. verify_mock_exam_questions.sql
**Purpose**: Verify Mock Exam questions remain intact

**What it does**:
- Counts remaining questions in `mock_exam_questions`
- Verifies foreign key relationships
- Checks data integrity (options, correct answers)
- Tests mock exam functionality
- Identifies any questions that should have been migrated

**When to run**: After all migrations complete

**How to run**:
```sql
-- Run in Supabase SQL Editor or psql
\i jeeva-admin-portal/database/migrations/verify_mock_exam_questions.sql
```

**Expected output**:
- Count of remaining mock exam questions
- Verification that all foreign keys are valid
- Confirmation that mock exam functionality works
- Overall migration summary across all three tables

### 5. rollback_question_migration.sql
**Purpose**: Rollback migration if needed

**What it does**:
- Copies questions back from `practice_questions` to `mock_exam_questions`
- Copies questions back from `learning_questions` to `mock_exam_questions`
- Restores lesson associations for learning questions
- Optionally renames tables back to original names
- Optionally drops new tables

**When to run**: Only if migration needs to be rolled back

**How to run**:
```sql
-- Run in Supabase SQL Editor or psql
\i jeeva-admin-portal/database/migrations/rollback_question_migration.sql
```

**Note**: Steps 4 and 5 in the rollback script are commented out by default. Uncomment them only if you want to fully revert to the original structure.

## Migration Workflow

### Step-by-Step Process

#### Step 1: Pre-Migration Analysis
```sql
-- Run classification script
\i jeeva-admin-portal/database/migrations/classify_questions.sql

-- Review the output to understand:
-- - How many questions will be migrated to each table
-- - Which topics/lessons have questions
-- - How many questions have no lesson associations
```

#### Step 2: Migrate Practice Questions
```sql
-- Run practice migration
\i jeeva-admin-portal/database/migrations/migrate_practice_questions.sql

-- Verify the output shows:
-- - Questions migrated successfully
-- - No warnings about missing options or correct answers
-- - Proper distribution across categories and subdivisions
```

#### Step 3: Migrate Learning Questions
```sql
-- Run learning migration
\i jeeva-admin-portal/database/migrations/migrate_learning_questions.sql

-- Verify the output shows:
-- - Questions migrated successfully
-- - No warnings about missing options or correct answers
-- - Proper distribution across topics and lessons
-- - Valid foreign key relationships
```

#### Step 4: Verify Mock Exam Questions
```sql
-- Run verification script
\i jeeva-admin-portal/database/migrations/verify_mock_exam_questions.sql

-- Verify the output shows:
-- - Remaining mock exam questions (those without lesson_id)
-- - No orphaned options
-- - All foreign keys valid
-- - Mock exam functionality works
```

#### Step 5: Final Verification
```sql
-- Check total question counts across all tables
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

-- Verify no questions were lost
-- Total should equal original question count from backup
```

## Troubleshooting

### Issue: Questions have no options after migration

**Cause**: Options were not properly copied or foreign keys are incorrect

**Solution**:
```sql
-- Check for questions without options
SELECT 
  q.id,
  q.question_text
FROM practice_questions q
WHERE NOT EXISTS (
  SELECT 1 FROM practice_question_options opt
  WHERE opt.question_id = q.id
);

-- If found, rollback and investigate
\i jeeva-admin-portal/database/migrations/rollback_question_migration.sql
```

### Issue: Questions have no correct answer

**Cause**: Correct answer flag was not set properly

**Solution**:
```sql
-- Check for questions without correct answers
SELECT 
  q.id,
  q.question_text
FROM practice_questions q
WHERE NOT EXISTS (
  SELECT 1 FROM practice_question_options opt
  WHERE opt.question_id = q.id AND opt.is_correct = true
);

-- Manually fix or rollback
```

### Issue: Foreign key violations

**Cause**: Referenced topics, lessons, or users don't exist

**Solution**:
```sql
-- Check for invalid foreign keys
SELECT 
  lq.id,
  lq.topic_id,
  lq.video_lesson_id
FROM learning_questions lq
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE id = lq.topic_id)
   OR NOT EXISTS (SELECT 1 FROM lessons WHERE id = lq.video_lesson_id);

-- Fix data or rollback
```

### Issue: Questions still in mock_exam_questions with lesson_id

**Cause**: Migration script didn't match module title pattern

**Solution**:
```sql
-- Find questions that should have been migrated
SELECT 
  q.id,
  q.lesson_id,
  m.title as module_title
FROM mock_exam_questions q
INNER JOIN lessons l ON q.lesson_id = l.id
INNER JOIN topics t ON l.topic_id = t.id
INNER JOIN modules m ON t.module_id = m.id;

-- Manually migrate or update classification logic
```

## Rollback Procedure

If you need to rollback the migration:

### Option 1: Restore Questions Only (Keep New Tables)
```sql
-- Run rollback script (default behavior)
\i jeeva-admin-portal/database/migrations/rollback_question_migration.sql

-- This will:
-- - Copy questions back to mock_exam_questions
-- - Keep new tables intact
-- - Preserve new schema structure
```

### Option 2: Full Rollback (Remove New Tables)
```sql
-- Edit rollback_question_migration.sql
-- Uncomment Step 4 (rename tables back)
-- Uncomment Step 5 (drop new tables)

-- Then run:
\i jeeva-admin-portal/database/migrations/rollback_question_migration.sql

-- This will:
-- - Copy questions back to mock_exam_questions
-- - Rename mock_exam_questions to questions
-- - Drop practice_questions and learning_questions tables
-- - Remove new columns from lessons table
```

### After Rollback
1. Verify all questions are back in the questions table
2. Update application code to use original table names
3. Test all functionality
4. Investigate why rollback was needed
5. Fix issues before attempting migration again

## Post-Migration Tasks

After successful migration:

1. ✅ **Update API Endpoints** - Task 3 (update backend to use new tables)
2. ✅ **Update Admin Portal** - Tasks 4-5 (update UI to manage new tables)
3. ✅ **Update Mobile App** - Tasks 6-7 (update mobile UI)
4. ✅ **Test All Functionality** - Task 8 (comprehensive testing)
5. ✅ **Monitor Performance** - Check query performance with new structure
6. ✅ **Update Documentation** - Task 9 (update user guides)

## Verification Checklist

Before considering migration complete:

- [ ] All practice questions migrated to `practice_questions`
- [ ] All learning questions migrated to `learning_questions`
- [ ] Mock exam questions (without lesson_id) remain in `mock_exam_questions`
- [ ] All question options migrated correctly
- [ ] All questions have at least one option
- [ ] All questions have at least one correct answer
- [ ] All foreign key relationships are valid
- [ ] No orphaned options exist
- [ ] Total question count matches original count
- [ ] Mock exam functionality still works
- [ ] Practice module queries work
- [ ] Learning module queries work
- [ ] No data loss occurred

## Support

If you encounter issues during migration:

1. Check the Supabase logs for error messages
2. Review the verification queries in each script
3. Check the troubleshooting section above
4. Run the rollback script if needed
5. Contact the development team with:
   - Error messages
   - Output from verification queries
   - Database backup information

## Requirements Validation

This migration satisfies the following requirements:

- ✅ Requirement 1.1-1.7: Separate question tables by module type
- ✅ Requirement 2.8: Practice questions with category and subdivision
- ✅ Requirement 7.1-7.5: Learning questions with video lesson mapping
- ✅ Requirement 9.1-9.8: Database schema migration with data preservation

## Next Steps

After completing this migration:

1. Proceed to Task 3: Backend API Updates
2. Update API endpoints to query new tables
3. Test API endpoints with migrated data
4. Update admin portal to manage new tables
5. Update mobile app to use new structure
