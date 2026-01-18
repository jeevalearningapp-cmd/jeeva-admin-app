# Migration Execution Guide - Quick Reference

## Overview

This guide provides a quick reference for executing the Learning Module Restructure data migration. For detailed information, see `README_DATA_MIGRATION.md`.

## Files Created

All migration scripts are located in `jeeva-admin-portal/database/migrations/`:

1. **classify_questions.sql** - Question classification and analysis
2. **migrate_practice_questions.sql** - Practice questions migration
3. **migrate_learning_questions.sql** - Learning questions migration
4. **verify_mock_exam_questions.sql** - Mock exam verification
5. **rollback_question_migration.sql** - Rollback procedure
6. **README_DATA_MIGRATION.md** - Comprehensive migration guide

## Quick Start

### Prerequisites Check

```sql
-- 1. Verify schema migration is complete (Task 1)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'practice_questions',
  'learning_questions',
  'mock_exam_questions'
);
-- Should return all 3 tables

-- 2. Verify backup exists (Task 0.2)
-- Check your backup location and verify files exist

-- 3. Count current questions
SELECT COUNT(*) as total_questions FROM mock_exam_questions;
-- Note this number for verification later
```

### Execution Steps

#### Step 1: Analyze Questions (5 minutes)

```bash
# In Supabase SQL Editor or psql
\i jeeva-admin-portal/database/migrations/classify_questions.sql
```

**Review output**: Note the counts for practice, learning, and mock_exam questions

#### Step 2: Migrate Practice Questions (10 minutes)

```bash
\i jeeva-admin-portal/database/migrations/migrate_practice_questions.sql
```

**Verify**: Check that migration summary shows expected counts and no warnings

#### Step 3: Migrate Learning Questions (10 minutes)

```bash
\i jeeva-admin-portal/database/migrations/migrate_learning_questions.sql
```

**Verify**: Check that migration summary shows expected counts and no warnings

#### Step 4: Verify Mock Exam Questions (5 minutes)

```bash
\i jeeva-admin-portal/database/migrations/verify_mock_exam_questions.sql
```

**Verify**: Check that remaining questions are correct and no errors reported

#### Step 5: Final Verification (5 minutes)

```sql
-- Check total counts
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

-- Total should match original count from prerequisites
```

## Expected Timeline

- **Analysis**: 5 minutes
- **Practice Migration**: 10 minutes
- **Learning Migration**: 10 minutes
- **Verification**: 5 minutes
- **Total**: ~30 minutes

## Success Criteria

✅ All scripts run without errors
✅ No warnings about missing options or correct answers
✅ Total question count matches original count
✅ All foreign key relationships valid
✅ Mock exam functionality works

## If Something Goes Wrong

### Immediate Rollback

```bash
# Stop and rollback immediately
\i jeeva-admin-portal/database/migrations/rollback_question_migration.sql
```

### Common Issues

**Issue**: "Some questions have no options"

- **Action**: Rollback and check question_options data

**Issue**: "Some questions have no correct answer"

- **Action**: Rollback and check is_correct flags

**Issue**: "Foreign key violation"

- **Action**: Rollback and verify topics/lessons exist

**Issue**: "Questions still in mock_exam_questions with lesson_id"

- **Action**: Check module titles match expected patterns

## Post-Migration

After successful migration:

1. ✅ Test API endpoints with new tables
2. ✅ Update admin portal to use new tables
3. ✅ Update mobile app to use new structure
4. ✅ Monitor performance
5. ✅ Update documentation

## Rollback Decision Tree

```
Migration Failed?
├─ Yes → Run rollback_question_migration.sql
│        ├─ Investigate issue
│        ├─ Fix problem
│        └─ Retry migration
└─ No → Proceed to Task 3 (Backend API Updates)
```

## Contact

If you need help:

1. Check `README_DATA_MIGRATION.md` for detailed troubleshooting
2. Review Supabase logs for error messages
3. Contact development team with error details

## Requirements Satisfied

This migration implements:

- ✅ Requirement 1.1-1.7: Separate question tables
- ✅ Requirement 2.8: Practice questions structure
- ✅ Requirement 7.1-7.5: Learning questions with video mapping
- ✅ Requirement 9.1-9.8: Data migration with integrity

## Next Task

After completing this migration, proceed to:
**Task 3: Backend API Updates** - Update API endpoints to use new tables
