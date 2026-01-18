# Learning Module Restructure Migration - Index

## 📚 Documentation Guide

### 🚀 Getting Started

**New to this migration?** Start here:

1. **[QUICK_START.md](./QUICK_START.md)** ⭐ **START HERE**
   - One-page guide
   - Single command migration
   - Quick troubleshooting

2. **[TASK_2_COMPLETION_SUMMARY.md](./TASK_2_COMPLETION_SUMMARY.md)**
   - What was delivered
   - File inventory
   - Implementation overview

### 📖 Detailed Guides

**Need more details?** Read these:

3. **[README_DATA_MIGRATION.md](./README_DATA_MIGRATION.md)**
   - Comprehensive migration guide
   - Detailed script explanations
   - Step-by-step workflow
   - Troubleshooting section

4. **[MIGRATION_EXECUTION_GUIDE.md](./MIGRATION_EXECUTION_GUIDE.md)**
   - Quick reference card
   - Prerequisites checklist
   - Expected timeline
   - Success criteria

5. **[README_LEARNING_MODULE_RESTRUCTURE.md](./README_LEARNING_MODULE_RESTRUCTURE.md)**
   - Schema migration guide (Task 1)
   - Database structure overview
   - RLS policies

## 🔧 Migration Scripts

### Recommended Approach

**[run_complete_migration.sql](./run_complete_migration.sql)** ⭐ **USE THIS**

- Complete migration in one transaction
- Handles schema + data migration
- Built-in verification
- Automatic rollback on error

### Individual Scripts (Advanced)

Use these if you need step-by-step control:

1. **[learning_module_restructure.sql](./learning_module_restructure.sql)** (Task 1)
   - Schema migration only
   - Creates all tables
   - Renames questions → mock_exam_questions

2. **[classify_questions.sql](./classify_questions.sql)** (Task 2.1)
   - Question classification logic
   - Analysis and reporting

3. **[migrate_practice_questions.sql](./migrate_practice_questions.sql)** (Task 2.2)
   - Practice questions migration
   - Category/subdivision mapping

4. **[migrate_learning_questions.sql](./migrate_learning_questions.sql)** (Task 2.3)
   - Learning questions migration
   - Topic/video lesson mapping

5. **[verify_mock_exam_questions.sql](./verify_mock_exam_questions.sql)** (Task 2.4)
   - Mock exam verification
   - Data integrity checks

6. **[rollback_question_migration.sql](./rollback_question_migration.sql)** (Task 2.5)
   - Rollback procedure
   - Data restoration

## 🎯 Quick Navigation

### By Task

- **Task 0**: Pre-migration verification (see spec tasks.md)
- **Task 1**: Schema migration → `learning_module_restructure.sql`
- **Task 2**: Data migration → `run_complete_migration.sql` ⭐
- **Task 3+**: Backend/Frontend updates (see spec tasks.md)

### By Use Case

**"I want to run the migration"**
→ [QUICK_START.md](./QUICK_START.md)

**"I need to understand what each script does"**
→ [README_DATA_MIGRATION.md](./README_DATA_MIGRATION.md)

**"Something went wrong, I need to rollback"**
→ [rollback_question_migration.sql](./rollback_question_migration.sql)

**"I want to see what was implemented"**
→ [TASK_2_COMPLETION_SUMMARY.md](./TASK_2_COMPLETION_SUMMARY.md)

**"I need detailed troubleshooting"**
→ [README_DATA_MIGRATION.md](./README_DATA_MIGRATION.md) (Troubleshooting section)

### By Role

**Database Administrator**

- [QUICK_START.md](./QUICK_START.md) - Quick execution
- [run_complete_migration.sql](./run_complete_migration.sql) - Master script
- [rollback_question_migration.sql](./rollback_question_migration.sql) - Rollback

**Developer**

- [TASK_2_COMPLETION_SUMMARY.md](./TASK_2_COMPLETION_SUMMARY.md) - Implementation details
- [README_DATA_MIGRATION.md](./README_DATA_MIGRATION.md) - Technical details
- Individual migration scripts - Step-by-step control

**Project Manager**

- [MIGRATION_EXECUTION_GUIDE.md](./MIGRATION_EXECUTION_GUIDE.md) - Timeline and checklist
- [TASK_2_COMPLETION_SUMMARY.md](./TASK_2_COMPLETION_SUMMARY.md) - Deliverables

## 📋 Checklists

### Pre-Migration Checklist

- [ ] Read [QUICK_START.md](./QUICK_START.md)
- [ ] Create database backup
- [ ] Note current question count
- [ ] Review migration plan with team
- [ ] Schedule maintenance window

### Migration Checklist

- [ ] Run `run_complete_migration.sql`
- [ ] Review output for errors/warnings
- [ ] Verify question counts match
- [ ] Test sample queries
- [ ] Document any issues

### Post-Migration Checklist

- [ ] Verify all tables exist
- [ ] Check data integrity
- [ ] Test API endpoints
- [ ] Update application code
- [ ] Monitor performance
- [ ] Update documentation

## 🆘 Troubleshooting

### Common Errors

**"relation mock_exam_questions does not exist"**
→ Use `run_complete_migration.sql` instead of individual scripts

**"Some questions have no options"**
→ Check original data integrity, see [README_DATA_MIGRATION.md](./README_DATA_MIGRATION.md)

**"Foreign key violation"**
→ Ensure topics and lessons exist, see troubleshooting section

**"Transaction timeout"**
→ Run individual scripts instead of master script

### Getting Help

1. Check [QUICK_START.md](./QUICK_START.md) troubleshooting section
2. Review [README_DATA_MIGRATION.md](./README_DATA_MIGRATION.md) detailed troubleshooting
3. Check Supabase logs for error details
4. Run rollback if needed
5. Contact development team

## 🔗 Related Documentation

### Spec Documents

Located in `.kiro/specs/learning-module-restructure/`:

- **requirements.md** - Feature requirements
- **design.md** - Technical design
- **tasks.md** - Implementation tasks

### Database Documentation

Located in `database/`:

- **EDGE_FUNCTIONS_DEPLOYMENT.md** - Edge functions guide
- **README_DEPLOYMENT_STEPS.md** - Deployment guide
- **SUPABASE_DEPLOYMENT_GUIDE.md** - Supabase setup

## 📊 Migration Overview

```
┌─────────────────────────────────────────────────────────┐
│                   BEFORE MIGRATION                       │
├─────────────────────────────────────────────────────────┤
│  questions                                              │
│  ├── All questions (practice, learning, mock exam)     │
│  └── lesson_id (optional)                              │
│                                                         │
│  question_options                                       │
│  └── Options for all questions                         │
└─────────────────────────────────────────────────────────┘

                         ↓ MIGRATION ↓

┌─────────────────────────────────────────────────────────┐
│                   AFTER MIGRATION                        │
├─────────────────────────────────────────────────────────┤
│  practice_questions                                     │
│  ├── category (Numeracy, Clinical Knowledge)           │
│  └── subdivision (subtopic name)                       │
│                                                         │
│  learning_questions                                     │
│  ├── topic_id                                          │
│  ├── subtopic_id                                       │
│  └── video_lesson_id                                   │
│                                                         │
│  mock_exam_questions                                    │
│  └── Questions without lesson_id                       │
└─────────────────────────────────────────────────────────┘
```

## 🎓 Learning Path

**Beginner**: Just want to run the migration

1. [QUICK_START.md](./QUICK_START.md)
2. Run `run_complete_migration.sql`
3. Done!

**Intermediate**: Want to understand the process

1. [QUICK_START.md](./QUICK_START.md)
2. [TASK_2_COMPLETION_SUMMARY.md](./TASK_2_COMPLETION_SUMMARY.md)
3. [README_DATA_MIGRATION.md](./README_DATA_MIGRATION.md)
4. Run `run_complete_migration.sql`

**Advanced**: Need full control

1. Read all documentation
2. Review individual scripts
3. Run scripts step-by-step
4. Customize as needed

## 📝 Version History

- **v1.0** - Initial implementation (Task 2 complete)
  - Master migration script
  - Individual migration scripts
  - Comprehensive documentation
  - Rollback support

## 🏆 Success Criteria

Migration is successful when:

✅ All three tables exist and are populated
✅ Total question count matches original
✅ All questions have options and correct answers
✅ All foreign keys are valid
✅ No data loss occurred
✅ API endpoints work with new tables
✅ Application functionality preserved

---

**Ready to migrate?** → [QUICK_START.md](./QUICK_START.md) ⭐
