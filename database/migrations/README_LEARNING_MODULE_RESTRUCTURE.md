# Learning Module Restructure Migration

## Overview

This migration implements the database schema changes required for the Learning Module restructure. It creates separate question tables for Practice, Learning, and Mock Exam modules, and adds new content types for the Learning Module.

## Migration File

- **File**: `learning_module_restructure.sql`
- **Purpose**: Create new database tables and update existing schema

## What This Migration Does

### 1. Creates Practice Questions Tables
- `practice_questions` - Questions for Practice Module with category and subdivision fields
- `practice_question_options` - Options for practice questions
- Indexes for efficient querying by category, subdivision, and active status

### 2. Creates Learning Questions Tables
- `learning_questions` - Questions for Learning Module with topic, subtopic, and video lesson associations
- `learning_question_options` - Options for learning questions
- Indexes for efficient querying by topic, subtopic, video lesson, and active status

### 3. Renames Existing Questions Tables
- Renames `questions` table to `mock_exam_questions`
- Renames `question_options` table to `mock_exam_question_options`
- Updates foreign key constraint names
- Preserves all existing data and indexes

### 4. Creates Topic Core Notes Table
- `topic_core_notes` - Stores comprehensive readable lessons for entire topics
- Supports rich text HTML content
- Includes JSONB field for structured sections
- One core notes entry per topic (UNIQUE constraint)

### 5. Creates Topic Flash Content Table
- `topic_flash_content` - Stores quick revision screens (5 per topic)
- Screen numbers 1-5 with CHECK constraint
- UNIQUE constraint on (topic_id, screen_number)
- Supports rich text HTML content and images

### 6. Creates Progress Tracking Tables
- `subtopic_progress` - Tracks user progress through subtopics
  - Status (locked, in_progress, completed)
  - Score, best score, attempts, time spent
  - 80% passing threshold enforcement
- `topic_progress` - Tracks overall topic progress
  - Core notes completion
  - Flash content completion
  - Overall progress percentage

### 7. Updates Lessons Table
- Adds `is_mandatory` field (default true)
- Adds `content_type` field (video, audio, text)
- Adds `podcast_url` field for optional podcast content
- Updates existing records with appropriate content_type values

### 8. Applies Row Level Security (RLS) Policies
- **Superadmins**: Full CRUD access to all tables
- **Editors**: Create, Read, Update (no delete) on content tables
- **Moderators**: Read-only access to content tables
- **Users**: Can only access their own progress data
- **Users**: Can read active content only

## How to Run This Migration

### Option 1: Supabase Dashboard (Recommended)

1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the file `learning_module_restructure.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click "Run" to execute the migration

### Option 2: Supabase CLI

```bash
# From the project root
cd jeeva-admin-portal/database/migrations

# Run the migration
supabase db push learning_module_restructure.sql
```

### Option 3: psql Command Line

```bash
# Connect to your database
psql "postgresql://[user]:[password]@[host]:[port]/[database]"

# Run the migration
\i jeeva-admin-portal/database/migrations/learning_module_restructure.sql
```

## Verification Steps

After running the migration, verify the changes:

```sql
-- Check that new tables exist
SELECT table_name 
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

-- Check that lessons table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lessons' 
AND column_name IN ('is_mandatory', 'content_type', 'podcast_url');

-- Check that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'practice_questions',
  'learning_questions',
  'mock_exam_questions',
  'topic_core_notes',
  'topic_flash_content',
  'subtopic_progress',
  'topic_progress'
);

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN (
  'practice_questions',
  'learning_questions',
  'topic_core_notes',
  'topic_flash_content',
  'subtopic_progress',
  'topic_progress'
);
```

## Important Notes

### Before Running Migration

1. **Backup your database** - Always create a backup before running migrations
2. **Test in development first** - Run this migration in a development environment before production
3. **Check for existing data** - Verify what data exists in the `questions` table

### After Running Migration

1. **Verify data integrity** - Check that all tables were created successfully
2. **Test RLS policies** - Verify that permissions work as expected
3. **Run data migration** - After schema migration, run the data migration script (Task 2)

### Data Migration

This migration only creates the schema. The actual data migration (moving questions from `mock_exam_questions` to `practice_questions` and `learning_questions`) will be handled in Task 2.

## Rollback Plan

If you need to rollback this migration:

```sql
-- Drop new tables
DROP TABLE IF EXISTS subtopic_progress CASCADE;
DROP TABLE IF EXISTS topic_progress CASCADE;
DROP TABLE IF EXISTS topic_flash_content CASCADE;
DROP TABLE IF EXISTS topic_core_notes CASCADE;
DROP TABLE IF EXISTS learning_question_options CASCADE;
DROP TABLE IF EXISTS learning_questions CASCADE;
DROP TABLE IF EXISTS practice_question_options CASCADE;
DROP TABLE IF EXISTS practice_questions CASCADE;

-- Rename tables back
ALTER TABLE mock_exam_questions RENAME TO questions;
ALTER TABLE mock_exam_question_options RENAME TO question_options;

-- Rename constraint back
ALTER TABLE question_options 
  RENAME CONSTRAINT mock_exam_question_options_question_id_fkey 
  TO question_options_question_id_fkey;

-- Remove new columns from lessons table
ALTER TABLE lessons DROP COLUMN IF EXISTS is_mandatory;
ALTER TABLE lessons DROP COLUMN IF EXISTS content_type;
ALTER TABLE lessons DROP COLUMN IF EXISTS podcast_url;

-- Recreate original RLS policies for questions table
-- (Copy policies from create_content_tables.sql)
```

## Next Steps

After successfully running this migration:

1. ✅ Task 1: Database Schema Creation (COMPLETE)
2. ⏭️ Task 2: Data Migration Script - Migrate existing questions to appropriate tables
3. ⏭️ Task 3: Backend API Updates - Update API endpoints to use new tables
4. ⏭️ Task 4-7: Admin Portal and Mobile App Updates

## Support

If you encounter any issues:

1. Check the Supabase logs for error messages
2. Verify that the `admin_users` table exists (required for RLS policies)
3. Ensure you have proper database permissions
4. Review the verification queries above to identify what failed

## Schema Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Question Tables                          │
├─────────────────────────────────────────────────────────────┤
│  practice_questions          learning_questions             │
│  ├── category                ├── topic_id (FK)              │
│  ├── subdivision             ├── subtopic_id (FK)           │
│  └── question_text           ├── video_lesson_id (FK)       │
│                              └── question_text              │
│  practice_question_options   learning_question_options      │
│  └── question_id (FK)        └── question_id (FK)           │
│                                                              │
│  mock_exam_questions (renamed from questions)               │
│  └── lesson_id (FK)                                         │
│                                                              │
│  mock_exam_question_options (renamed from question_options) │
│  └── question_id (FK)                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Content Tables                           │
├─────────────────────────────────────────────────────────────┤
│  topic_core_notes            topic_flash_content            │
│  ├── topic_id (FK, UNIQUE)   ├── topic_id (FK)              │
│  ├── content (HTML)          ├── screen_number (1-5)        │
│  └── sections (JSONB)        ├── title                      │
│                              ├── content (HTML)             │
│                              └── image_url                  │
│                              UNIQUE(topic_id, screen_number)│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Progress Tables                          │
├─────────────────────────────────────────────────────────────┤
│  subtopic_progress           topic_progress                 │
│  ├── user_id (FK)            ├── user_id (FK)               │
│  ├── topic_id (FK)           ├── topic_id (FK)              │
│  ├── subtopic_id (FK)        ├── core_notes_completed       │
│  ├── status                  ├── flash_content_completed    │
│  ├── score                   └── progress_percentage        │
│  ├── best_score              UNIQUE(user_id, topic_id)      │
│  ├── attempts                                               │
│  └── time_spent_seconds                                     │
│  UNIQUE(user_id, subtopic_id)                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Updated Tables                           │
├─────────────────────────────────────────────────────────────┤
│  lessons (existing table with new fields)                   │
│  ├── ... (existing fields)                                  │
│  ├── is_mandatory (new)                                     │
│  ├── content_type (new)                                     │
│  └── podcast_url (new)                                      │
└─────────────────────────────────────────────────────────────┘
```

## Requirements Validation

This migration satisfies the following requirements:

- ✅ Requirement 1.1-1.7: Separate question tables by module type
- ✅ Requirement 2.8: Practice questions with category and subdivision
- ✅ Requirement 4.1-4.8: Topic core notes and flash content
- ✅ Requirement 5.9-5.10: Lessons with mandatory/optional and content type
- ✅ Requirement 7.1-7.5: Video-mapped MCQs with video_lesson_id
- ✅ Requirement 9.1-9.8: Database schema migration
- ✅ Requirement 11.1-11.7: Progress tracking tables
- ✅ Security: Row Level Security policies for all tables
