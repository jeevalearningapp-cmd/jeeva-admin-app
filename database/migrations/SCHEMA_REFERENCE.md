# Learning Module Restructure - Database Schema Reference

## Quick Reference Guide

This document provides a quick reference for the new database schema created by the Learning Module Restructure migration.

## Table Overview

| Table Name                   | Purpose                              | Key Fields                             |
| ---------------------------- | ------------------------------------ | -------------------------------------- |
| `practice_questions`         | Questions for Practice Module        | category, subdivision                  |
| `practice_question_options`  | Options for practice questions       | question_id (FK)                       |
| `learning_questions`         | Questions for Learning Module        | topic_id, subtopic_id, video_lesson_id |
| `learning_question_options`  | Options for learning questions       | question_id (FK)                       |
| `mock_exam_questions`        | Questions for Mock Exam (renamed)    | lesson_id                              |
| `mock_exam_question_options` | Options for mock exam questions      | question_id (FK)                       |
| `topic_core_notes`           | Comprehensive topic-level content    | topic_id (UNIQUE)                      |
| `topic_flash_content`        | Quick revision screens (5 per topic) | topic_id, screen_number (1-5)          |
| `subtopic_progress`          | User progress through subtopics      | user_id, subtopic_id, score            |
| `topic_progress`             | User progress through topics         | user_id, topic_id, progress_percentage |

## Practice Questions Schema

### practice_questions

```sql
CREATE TABLE practice_questions (
  id UUID PRIMARY KEY,
  category VARCHAR(100) NOT NULL,        -- 'Numeracy' or 'Clinical Knowledge'
  subdivision VARCHAR(100) NOT NULL,     -- Subtopic name
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,    -- 'multiple_choice' or 'true_false'
  difficulty VARCHAR(20) NOT NULL,       -- 'easy', 'medium', or 'hard'
  points INTEGER DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

- `idx_practice_questions_category` on `category`
- `idx_practice_questions_subdivision` on `subdivision`
- `idx_practice_questions_active` on `is_active` (partial index)

**Fixed Categories:**

- Numeracy
- Clinical Knowledge

**Fixed Subdivisions (Numeracy):**

- Dosage Calculations
- Unit Conversions
- IV Flow Rate Calculations
- Fluid Balance

**Fixed Subdivisions (Clinical Knowledge):**

- Medical-Surgical Nursing
- Pharmacology
- Infection Control
- Wound Care
- Palliative Care

### practice_question_options

```sql
CREATE TABLE practice_question_options (
  id UUID PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES practice_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Learning Questions Schema

### learning_questions

```sql
CREATE TABLE learning_questions (
  id UUID PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  subtopic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  video_lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,    -- 'multiple_choice' or 'true_false'
  difficulty VARCHAR(20) NOT NULL,       -- 'easy', 'medium', or 'hard'
  points INTEGER DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

- `idx_learning_questions_topic_id` on `topic_id`
- `idx_learning_questions_subtopic_id` on `subtopic_id`
- `idx_learning_questions_video_lesson_id` on `video_lesson_id`
- `idx_learning_questions_active` on `is_active` (partial index)

**Key Relationships:**

- Each question MUST be mapped to a video lesson (`video_lesson_id`)
- Each subtopic should have 5-10 questions
- Questions are filtered by `video_lesson_id` when displaying for a subtopic

### learning_question_options

```sql
CREATE TABLE learning_question_options (
  id UUID PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES learning_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Mock Exam Questions Schema

### mock_exam_questions (renamed from questions)

```sql
-- Existing table structure preserved
CREATE TABLE mock_exam_questions (
  id UUID PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Note:** This table was renamed from `questions`. All existing data and indexes are preserved.

## Topic Content Schema

### topic_core_notes

```sql
CREATE TABLE topic_core_notes (
  id UUID PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,              -- Rich text HTML content
  sections JSONB,                     -- Structured sections
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id)                    -- One core notes per topic
);
```

**JSONB Structure for sections:**

```json
[
  {
    "title": "Introduction to Numeracy",
    "content": "<p>HTML content here</p>",
    "order": 1
  },
  {
    "title": "Dosage Calculations Overview",
    "content": "<p>HTML content here</p>",
    "order": 2
  }
]
```

**Usage:**

- One core notes entry per topic
- Covers the entire topic comprehensively
- Organized by sections for easy navigation
- Supports rich text HTML formatting

### topic_flash_content

```sql
CREATE TABLE topic_flash_content (
  id UUID PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  screen_number INTEGER NOT NULL CHECK (screen_number BETWEEN 1 AND 5),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,              -- Rich text HTML content
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id, screen_number)     -- Exactly 5 screens per topic
);
```

**Constraints:**

- Exactly 5 screens per topic (screen_number 1-5)
- UNIQUE constraint on (topic_id, screen_number)
- CHECK constraint ensures screen_number is between 1 and 5

**Usage:**

- Quick revision content
- Displayed one screen at a time
- Supports images and rich text
- Accessed after completing core notes

## Progress Tracking Schema

### subtopic_progress

```sql
CREATE TABLE subtopic_progress (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  subtopic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('locked', 'in_progress', 'completed')),
  score INTEGER,                      -- Percentage score (0-100)
  best_score INTEGER,                 -- Best score achieved
  attempts INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subtopic_id)        -- One progress record per user per subtopic
);
```

**Status Values:**

- `locked` - Subtopic not yet accessible (previous subtopic not completed)
- `in_progress` - User has started but not completed (score < 80%)
- `completed` - User has passed with >= 80% score

**Indexes:**

- `idx_subtopic_progress_user_id` on `user_id`
- `idx_subtopic_progress_topic_id` on `topic_id`
- `idx_subtopic_progress_subtopic_id` on `subtopic_id`
- `idx_subtopic_progress_status` on `status`

**Business Rules:**

- 80% passing threshold to unlock next subtopic
- Unlimited retries allowed
- Best score is tracked across all attempts
- Time spent is cumulative across all attempts

### topic_progress

```sql
CREATE TABLE topic_progress (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  core_notes_completed BOOLEAN DEFAULT false,
  flash_content_completed BOOLEAN DEFAULT false,
  progress_percentage INTEGER DEFAULT 0,  -- Overall topic progress (0-100)
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)           -- One progress record per user per topic
);
```

**Progress Calculation:**

```
progress_percentage = (
  (core_notes_completed ? 20 : 0) +
  (flash_content_completed ? 10 : 0) +
  (completed_subtopics / total_subtopics * 70)
)
```

**Indexes:**

- `idx_topic_progress_user_id` on `user_id`
- `idx_topic_progress_topic_id` on `topic_id`

## Updated Lessons Table

### New Fields Added

```sql
ALTER TABLE lessons ADD COLUMN is_mandatory BOOLEAN DEFAULT true;
ALTER TABLE lessons ADD COLUMN content_type VARCHAR(50) CHECK (content_type IN ('video', 'audio', 'text'));
ALTER TABLE lessons ADD COLUMN podcast_url TEXT;
```

**Field Descriptions:**

- `is_mandatory` - Whether the lesson must be completed (videos are mandatory, podcasts are optional)
- `content_type` - Type of content: 'video', 'audio', or 'text'
- `podcast_url` - URL for optional podcast content

**Usage:**

- Video lessons are mandatory (`is_mandatory = true`)
- Podcasts are optional (`is_mandatory = false`)
- Content type determines how to render the lesson

## Row Level Security (RLS) Policies

### Admin Access Levels

| Role           | Practice Questions   | Learning Questions   | Mock Exam Questions  | Content Tables       | Progress Tables |
| -------------- | -------------------- | -------------------- | -------------------- | -------------------- | --------------- |
| **Superadmin** | Full CRUD            | Full CRUD            | Full CRUD            | Full CRUD            | View All        |
| **Editor**     | Create, Read, Update | Create, Read, Update | Create, Read, Update | Create, Read, Update | View All        |
| **Moderator**  | Read Only            | Read Only            | Read Only            | Read Only            | View All        |
| **User**       | -                    | -                    | -                    | Read Active Only     | Own Data Only   |

### User Access Rules

**Content Access:**

- Users can only read active content (`is_active = true`)
- Users cannot modify any content tables
- Users can only access unlocked subtopics

**Progress Access:**

- Users can only view/update their own progress
- Users cannot view other users' progress
- Admins can view all users' progress for analytics

## Common Queries

### Get Practice Questions by Category and Subdivision

```sql
SELECT pq.*, array_agg(pqo.*) as options
FROM practice_questions pq
LEFT JOIN practice_question_options pqo ON pq.id = pqo.question_id
WHERE pq.category = 'Numeracy'
  AND pq.subdivision = 'Dosage Calculations'
  AND pq.is_active = true
GROUP BY pq.id
ORDER BY pq.created_at DESC;
```

### Get Learning Questions for a Subtopic

```sql
SELECT lq.*, array_agg(lqo.*) as options
FROM learning_questions lq
LEFT JOIN learning_question_options lqo ON lq.id = lqo.question_id
WHERE lq.subtopic_id = 'subtopic-uuid'
  AND lq.video_lesson_id = 'lesson-uuid'
  AND lq.is_active = true
GROUP BY lq.id
ORDER BY lq.created_at DESC
LIMIT 10;
```

### Get Topic Core Notes

```sql
SELECT *
FROM topic_core_notes
WHERE topic_id = 'topic-uuid'
  AND is_active = true;
```

### Get Topic Flash Content (All 5 Screens)

```sql
SELECT *
FROM topic_flash_content
WHERE topic_id = 'topic-uuid'
  AND is_active = true
ORDER BY screen_number;
```

### Get User's Subtopic Progress

```sql
SELECT sp.*, t.title as topic_title, st.title as subtopic_title
FROM subtopic_progress sp
JOIN topics t ON sp.topic_id = t.id
JOIN topics st ON sp.subtopic_id = st.id
WHERE sp.user_id = 'user-uuid'
  AND sp.topic_id = 'topic-uuid'
ORDER BY st.display_order;
```

### Get User's Topic Progress

```sql
SELECT tp.*, t.title as topic_title
FROM topic_progress tp
JOIN topics t ON tp.topic_id = t.id
WHERE tp.user_id = 'user-uuid'
ORDER BY t.display_order;
```

### Check if Subtopic is Unlocked

```sql
-- First subtopic is always unlocked
-- Other subtopics require previous subtopic to be completed

WITH subtopic_order AS (
  SELECT id, display_order
  FROM topics
  WHERE module_id = (SELECT module_id FROM topics WHERE id = 'current-subtopic-uuid')
  ORDER BY display_order
),
previous_subtopic AS (
  SELECT id
  FROM subtopic_order
  WHERE display_order < (SELECT display_order FROM subtopic_order WHERE id = 'current-subtopic-uuid')
  ORDER BY display_order DESC
  LIMIT 1
)
SELECT
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM previous_subtopic) THEN true  -- First subtopic
    WHEN EXISTS (
      SELECT 1 FROM subtopic_progress
      WHERE user_id = 'user-uuid'
        AND subtopic_id = (SELECT id FROM previous_subtopic)
        AND status = 'completed'
    ) THEN true  -- Previous subtopic completed
    ELSE false  -- Previous subtopic not completed
  END as is_unlocked;
```

## Migration Status

- ✅ Schema created
- ⏳ Data migration pending (Task 2)
- ⏳ API endpoints pending (Task 3)
- ⏳ Admin portal pending (Tasks 4-5)
- ⏳ Mobile app pending (Tasks 6-7)

## Related Files

- **Migration Script**: `learning_module_restructure.sql`
- **Verification Script**: `verify_learning_module_restructure.sql`
- **Documentation**: `README_LEARNING_MODULE_RESTRUCTURE.md`
- **Requirements**: `.kiro/specs/learning-module-restructure/requirements.md`
- **Design**: `.kiro/specs/learning-module-restructure/design.md`
- **Tasks**: `.kiro/specs/learning-module-restructure/tasks.md`
