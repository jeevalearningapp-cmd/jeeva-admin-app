# Learning Module Migration Guide

## Overview
This guide explains how to migrate from the old content management system to the new Learning Module Management system.

## Database Status

### ✅ Migration File Ready
The database migration file `database/migrations/learning_module_restructure.sql` contains:

1. **New Tables Created:**
   - `practice_questions` & `practice_question_options`
   - `learning_questions` & `learning_question_options`
   - `topic_core_notes` (for Core Notes at topic level)
   - `topic_flash_content` (for 5 flash screens per topic)
   - `subtopic_progress` & `topic_progress` (for tracking)

2. **Existing Tables Updated:**
   - `questions` → renamed to `mock_exam_questions`
   - `question_options` → renamed to `mock_exam_question_options`
   - `lessons` table updated with `is_mandatory`, `content_type`, `podcast_url`

3. **RLS Policies:**
   - All tables have proper Row Level Security policies
   - Superadmins: Full access
   - Editors: Create, Read, Update (no delete)
   - Moderators: Read-only
   - Users: Can only access their own progress

### 🔧 To Run Migration:
```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d your-database -f database/migrations/learning_module_restructure.sql
```

Or use Supabase Dashboard → SQL Editor → paste the contents of `learning_module_restructure.sql`

## New System Architecture

### Main Topic Level:
- **Core Notes** - Rich text reading lesson with sections
- **Flash Content** - Exactly 5 quick revision screens
- **Subtopics** - List of subtopics under the topic

### Subtopic Level (Lessons):
- **Video Lesson** (mandatory) - Video URL with preview
- **Podcast** (optional) - Audio URL with player
- **MCQs** (5-10 questions) - Video-mapped multiple choice questions

## Files Created

### Components (`src/components/content/`):
1. `LearningModuleTopicList.tsx` - Topic list with drag-and-drop
2. `TopicFormModal.tsx` - Create/edit topics
3. `CoreNotesEditor.tsx` - Rich text editor for Core Notes
4. `FlashContentEditor.tsx` - Manage 5 flash screens
5. `SubtopicList.tsx` - List subtopics with validation
6. `VideoLessonTab.tsx` - Video lesson management
7. `PodcastTab.tsx` - Podcast management
8. `MCQTab.tsx` - MCQ list with validation
9. `VideoMappedMCQForm.tsx` - Create/edit MCQs
10. `ContentValidation.tsx` - Validation checklist

### API Modules (`src/api/`):
1. `coreNotes.ts` - Core Notes CRUD
2. `flashContent.ts` - Flash Content CRUD
3. `subtopics.ts` - Subtopics CRUD with validation
4. `learningQuestions.ts` - Learning MCQs CRUD

### Main Page:
- `src/pages/LearningModuleManagementPage.tsx` - Main orchestration page

## Migration Steps

### Step 1: Run Database Migration
Run the `learning_module_restructure.sql` file on your database.

### Step 2: Replace Old Content Management
The old system used:
- `TopicsPage.tsx` - Generic topic management
- `LessonsPage.tsx` - Generic lesson management
- `QuestionsPage.tsx` - Generic question management

The new system uses:
- `LearningModuleManagementPage.tsx` - Specialized Learning Module management

### Step 3: Update Routing
Replace the old content management routes with the new Learning Module Management page.

## Key Differences

### Old System:
- Topics → Lessons → Questions (flat structure)
- No distinction between Core Notes and Subtopic content
- No Flash Content
- No video-mapped MCQs
- No validation system

### New System:
- Topics (with Core Notes + Flash Content) → Subtopics (with Video + Podcast + MCQs)
- Clear separation of topic-level and subtopic-level content
- Exactly 5 flash screens per topic
- 5-10 video-mapped MCQs per subtopic
- Comprehensive validation before activation
- Progress tracking for users

## Next Steps

1. ✅ Database migration file ready
2. ✅ All components created
3. ✅ All APIs created
4. ⏸️ Run database migration
5. ⏸️ Update routing to use new page
6. ⏸️ Test with sample data
7. ⏸️ Train admins on new interface

## Notes

- The new system is **completely separate** from the old system
- Both can coexist during transition
- Old data in `questions` table will be renamed to `mock_exam_questions`
- No data loss - only reorganization
