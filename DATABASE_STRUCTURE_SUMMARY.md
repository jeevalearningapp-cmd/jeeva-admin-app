# Database Structure - Three Separate Module Systems

## ✅ YES - All Three Modules Have Separate Database Tables

You already ran the migration that created completely separate database tables for each module type. Here's the breakdown:

---

## 1. Learning Module Tables (NEW)

### `learning_questions`
**Purpose**: MCQs for Learning Module (video-mapped, 5-10 per subtopic)

**Fields**:
- `id` - UUID primary key
- `topic_id` - References topics table
- `subtopic_id` - References topics table (subtopics)
- `video_lesson_id` - References lessons table (MANDATORY - video mapping)
- `question_text` - The question
- `question_type` - 'multiple_choice' or 'true_false'
- `difficulty` - 'easy', 'medium', 'hard'
- `points` - Default 1
- `explanation` - Answer explanation
- `image_url` - Optional image
- `is_active` - Boolean
- `created_at`, `updated_at`

**Indexes**:
- `idx_learning_questions_topic_id`
- `idx_learning_questions_subtopic_id`
- `idx_learning_questions_video_lesson_id`
- `idx_learning_questions_active`

### `learning_question_options`
**Purpose**: Answer options for learning questions (4 options, 1 correct)

**Fields**:
- `id` - UUID primary key
- `question_id` - References learning_questions (CASCADE DELETE)
- `option_text` - The option text
- `is_correct` - Boolean (only one should be true)
- `display_order` - Integer
- `created_at`

**Indexes**:
- `idx_learning_question_options_question_id`

### `topic_core_notes`
**Purpose**: Rich text reading lessons at topic level

**Fields**:
- `id` - UUID primary key
- `topic_id` - References topics (UNIQUE - one per topic)
- `content` - Rich text HTML content
- `sections` - JSONB array of section objects
- `is_active` - Boolean
- `created_at`, `updated_at`

**JSONB Structure**:
```json
[
  {
    "title": "Introduction to Numeracy",
    "content": "<p>HTML content here</p>",
    "order": 1
  }
]
```

**Indexes**:
- `idx_topic_core_notes_topic_id`

### `topic_flash_content`
**Purpose**: Quick revision flash screens (exactly 5 per topic)

**Fields**:
- `id` - UUID primary key
- `topic_id` - References topics
- `screen_number` - Integer 1-5 (UNIQUE per topic)
- `title` - Screen title
- `content` - Rich text HTML
- `image_url` - Optional image
- `is_active` - Boolean
- `created_at`, `updated_at`

**Constraint**: UNIQUE(topic_id, screen_number) - ensures exactly 5 screens

**Indexes**:
- `idx_topic_flash_content_topic_id`
- `idx_topic_flash_content_screen_number`

---

## 2. Practice Module Tables (NEW)

### `practice_questions`
**Purpose**: Practice questions organized by category and subdivision

**Fields**:
- `id` - UUID primary key
- `category` - 'Numeracy' or 'Clinical Knowledge'
- `subdivision` - Subtopic name (e.g., 'Dosage Calculations')
- `question_text` - The question
- `question_type` - 'multiple_choice' or 'true_false'
- `difficulty` - 'easy', 'medium', 'hard'
- `points` - Default 1
- `explanation` - Answer explanation
- `image_url` - Optional image
- `is_active` - Boolean
- `created_at`, `updated_at`

**Indexes**:
- `idx_practice_questions_category`
- `idx_practice_questions_subdivision`
- `idx_practice_questions_active`

### `practice_question_options`
**Purpose**: Answer options for practice questions

**Fields**:
- `id` - UUID primary key
- `question_id` - References practice_questions (CASCADE DELETE)
- `option_text` - The option text
- `is_correct` - Boolean
- `display_order` - Integer
- `created_at`

**Indexes**:
- `idx_practice_question_options_question_id`

---

## 3. Mock Exam Tables (RENAMED FROM EXISTING)

### `mock_exam_questions`
**Purpose**: Full exam simulation questions (Part A: Numeracy, Part B: Clinical)

**Fields**:
- `id` - UUID primary key
- `exam_part` - 'part_a' or 'part_b'
- `question_text` - The question
- `question_type` - 'multiple_choice' or 'true_false'
- `difficulty` - 'easy', 'medium', 'hard'
- `points` - Default 1
- `explanation` - Answer explanation
- `image_url` - Optional image
- `is_active` - Boolean
- `created_at`, `updated_at`

**Note**: This was renamed from the old `questions` table

### `mock_exam_question_options`
**Purpose**: Answer options for mock exam questions

**Fields**:
- `id` - UUID primary key
- `question_id` - References mock_exam_questions (CASCADE DELETE)
- `option_text` - The option text
- `is_correct` - Boolean
- `display_order` - Integer
- `created_at`

**Note**: This was renamed from the old `question_options` table

---

## Supporting Tables

### `lessons` (UPDATED)
**Purpose**: Video and podcast lessons for subtopics

**New Fields Added**:
- `is_mandatory` - Boolean (video is mandatory, podcast is optional)
- `content_type` - 'video', 'audio', or 'text'
- `podcast_url` - URL for podcast audio

**Existing Fields**:
- `id`, `topic_id`, `title`, `description`, `video_url`, `duration`, etc.

### `subtopic_progress`
**Purpose**: Track user progress through subtopics

**Fields**:
- `id`, `user_id`, `topic_id`, `subtopic_id`
- `status` - 'locked', 'in_progress', 'completed'
- `score`, `best_score`, `attempts`
- `time_spent_seconds`
- `completed_at`, `created_at`, `updated_at`

**Constraint**: UNIQUE(user_id, subtopic_id)

### `topic_progress`
**Purpose**: Track user progress through topics

**Fields**:
- `id`, `user_id`, `topic_id`
- `core_notes_completed` - Boolean
- `flash_content_completed` - Boolean
- `progress_percentage` - 0-100
- `completed_at`, `created_at`, `updated_at`

**Constraint**: UNIQUE(user_id, topic_id)

---

## Row Level Security (RLS) Policies

### All Question Tables (Learning, Practice, Mock Exam)

**Superadmins**:
- ✅ SELECT (view all)
- ✅ INSERT (create)
- ✅ UPDATE (edit)
- ✅ DELETE (remove)

**Editors**:
- ✅ SELECT (view all)
- ✅ INSERT (create)
- ✅ UPDATE (edit)
- ❌ DELETE (cannot delete)

**Moderators**:
- ✅ SELECT (view all)
- ❌ INSERT (cannot create)
- ❌ UPDATE (cannot edit)
- ❌ DELETE (cannot delete)

### Content Tables (Core Notes, Flash Content)

**Same as question tables** - Superadmins (full), Editors (CRU), Moderators (R)

### Progress Tables

**Users**:
- ✅ Can only view/insert/update their own progress
- ❌ Cannot access other users' progress

**Admins** (all roles):
- ✅ Can view all users' progress (for analytics)

---

## Database Relationships

### Learning Module Flow
```
topics (main topic)
  ├─→ topic_core_notes (1:1 - one per topic)
  ├─→ topic_flash_content (1:5 - exactly 5 per topic)
  └─→ topics (subtopics)
      ├─→ lessons (video + podcast)
      └─→ learning_questions (5-10 per subtopic)
          ├─→ video_lesson_id (FK to lessons)
          └─→ learning_question_options (4 per question)
```

### Practice Module Flow
```
practice_questions (by category/subdivision)
  └─→ practice_question_options (4 per question)
```

### Mock Exam Flow
```
mock_exam_questions (by exam part A/B)
  └─→ mock_exam_question_options (4 per question)
```

---

## Key Differences Between Modules

| Feature | Learning Module | Practice Module | Mock Exam |
|---------|----------------|-----------------|-----------|
| **Question Table** | `learning_questions` | `practice_questions` | `mock_exam_questions` |
| **Organization** | By topic → subtopic → video | By category → subdivision | By exam part (A/B) |
| **Video Mapping** | ✅ Required (video_lesson_id) | ❌ Not applicable | ❌ Not applicable |
| **Content Types** | Core Notes + Flash Content + MCQs | Questions only | Questions only |
| **Question Count** | 5-10 per subtopic | Unlimited | 15 (Part A), 120 (Part B) |
| **Additional Content** | Video + Podcast + Rich Text | None | None |

---

## Migration Status

✅ **Database migration completed** - You already ran this migration
✅ **All tables created** with proper schema
✅ **All indexes created** for performance
✅ **All RLS policies applied** for security
✅ **All relationships configured** with foreign keys and cascade deletes
✅ **Old tables renamed** (questions → mock_exam_questions)

---

## Summary

**YES**, all three modules have completely separate database tables:

1. **Learning Module**: `learning_questions`, `learning_question_options`, `topic_core_notes`, `topic_flash_content`
2. **Practice Module**: `practice_questions`, `practice_question_options`
3. **Mock Exam**: `mock_exam_questions`, `mock_exam_question_options`

Each module has its own:
- ✅ Separate question tables
- ✅ Separate option tables
- ✅ Separate indexes
- ✅ Separate RLS policies
- ✅ Unique organizational structure
- ✅ Specific constraints and validations

This ensures complete data separation and allows each module to have its own specific requirements and features without interfering with the others.
