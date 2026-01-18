# Database Backup - Quick Start Guide

## Overview

This directory contains scripts and documentation for backing up the `questions` and `question_options` tables before the Learning Module restructuring migration.

**Task:** 0.2 Backup Existing Database  
**Requirements:** 9.1-9.8

---

## Quick Start

### 1. Run Backup (Production)

```bash
# Set database connection
export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Run automated backup script
cd jeeva-admin-portal/database/migrations
./run_backup.sh
```

This will:

- Create CSV exports of both tables
- Create in-database backup tables
- Generate backup summary report
- Compress backup into `.tar.gz` file

### 2. Test Restore (Development)

```bash
# Set development database connection
export DEV_SUPABASE_DB_URL="postgresql://postgres:[DEV_PASSWORD]@db.[DEV_PROJECT_REF].supabase.co:5432/postgres"

# Copy backup tables from production to development
pg_dump "$SUPABASE_DB_URL" -t questions_backup -t question_options_backup | psql "$DEV_SUPABASE_DB_URL"

# Run test restore
./test_restore_dev.sh
```

This will:

- Verify backup tables exist
- Run restore procedure
- Verify data integrity
- Generate test report

### 3. Restore (If Needed)

```bash
# PRODUCTION RESTORE - USE WITH CAUTION!
psql "$SUPABASE_DB_URL" -f restore_questions_backup.sql
```

---

## Files in This Directory

| File                           | Purpose                                    |
| ------------------------------ | ------------------------------------------ |
| `backup_questions_tables.sql`  | SQL script to create backups               |
| `restore_questions_backup.sql` | SQL script to restore from backup          |
| `run_backup.sh`                | Automated backup shell script              |
| `test_restore_dev.sh`          | Test restore on development database       |
| `BACKUP_RESTORE_GUIDE.md`      | Comprehensive backup/restore documentation |
| `README_BACKUP.md`             | This quick start guide                     |

---

## Backup Locations

After running `run_backup.sh`, backups are stored in:

```
jeeva-admin-portal/database/migrations/backups/
└── YYYYMMDD_HHMMSS/
    ├── questions_backup.csv
    ├── question_options_backup.csv
    ├── backup_metadata.csv
    ├── backup_log.txt
    └── BACKUP_SUMMARY.txt
```

Additionally, backup tables are created in the database:

- `questions_backup`
- `question_options_backup`
- `backup_metadata`

---

## Pre-Migration Checklist

Before running the migration, ensure:

- [ ] Backup completed successfully
- [ ] CSV files exported and verified
- [ ] Backup tables created in database
- [ ] Backup copied to secure cloud storage
- [ ] Restore tested on development database
- [ ] Restore test passed
- [ ] Application tested with restored data
- [ ] Team notified of backup completion

---

## Emergency Restore

If migration fails and you need to restore immediately:

```bash
# 1. Connect to database
psql "$SUPABASE_DB_URL"

# 2. Run restore script
\i restore_questions_backup.sql

# 3. Verify restore
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM question_options;
```

---

## Backup Verification

To verify backup integrity:

```sql
-- Check row counts match
SELECT
  (SELECT COUNT(*) FROM questions) as original,
  (SELECT COUNT(*) FROM questions_backup) as backup;

-- Check backup metadata
SELECT * FROM backup_metadata
WHERE backup_name = 'pre_migration_backup'
ORDER BY backup_date DESC;
```

---

## Common Issues

### Issue: Permission denied on CSV export

**Solution:** Use `\copy` instead of `COPY`:

```sql
\copy questions TO '/path/to/questions_backup.csv' WITH CSV HEADER;
```

### Issue: Backup tables already exist

**Solution:** Drop them first:

```sql
DROP TABLE IF EXISTS questions_backup CASCADE;
DROP TABLE IF EXISTS question_options_backup CASCADE;
```

### Issue: Cannot connect to database

**Solution:** Check your connection string:

```bash
# Test connection
psql "$SUPABASE_DB_URL" -c "SELECT current_database();"
```

---

## Support

For detailed documentation, see:

- [BACKUP_RESTORE_GUIDE.md](./BACKUP_RESTORE_GUIDE.md) - Comprehensive guide
- [Requirements Document](../../.kiro/specs/learning-module-restructure/requirements.md)
- [Design Document](../../.kiro/specs/learning-module-restructure/design.md)

---

## Next Steps

After backup is complete:

1. ✅ Review backup summary report
2. ✅ Verify CSV files are readable
3. ✅ Test restore on development
4. ✅ Copy backup to cloud storage
5. ⏭️ Proceed with task 0.3 (Analyze Existing Question Distribution)
6. ⏭️ Then proceed with migration (task 1.x)

---

**Last Updated:** 2024-12-24  
**Version:** 1.0
