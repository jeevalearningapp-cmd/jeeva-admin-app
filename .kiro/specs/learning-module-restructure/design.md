# Design Document

## Overview

This design document outlines the technical approach for restructuring the Learning Module and separating question databases by module type. The solution involves creating separate question tables for Practice, Learning, and Mock Exam modules, implementing a new hierarchical content structure for the Learning Module, and updating the admin portal to support dynamic content management.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Portal (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Practice   │  │   Learning   │  │  Mock Exam   │     │
│  │  Management  │  │  Management  │  │  Management  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase PostgreSQL                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   practice_  │  │  learning_   │  │ mock_exam_   │     │
│  │  questions   │  │  questions   │  │  questions   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    topics    │  │  subtopics   │  │    lessons   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │topic_core_   │  │topic_flash_  │                        │
│  │   notes      │  │   content    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Mobile App (React Native)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Practice   │  │   Learning   │  │  Mock Exam   │     │
│  │    Module    │  │    Module    │  │    Module    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Schema

#### 1.1 Practice Questions Tables

```sql
-- Practice questions table
CREATE TABLE practice_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL, -- 'Numeracy' or 'Clinical Knowledge'
  subdivision VARCHAR(100) NOT NULL, -- Subtopic name
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false')),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_practice_questions_category ON practice_questions(category);
CREATE INDEX idx_practice_questions_subdivision ON practice_questions(subdivision);
CREATE INDEX idx_practice_questions_active ON practice_questions(is_active) WHERE is_active = true;

-- Practice question options table
CREATE TABLE practice_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES practice_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_practice_question_options_question_id ON practice_question_options(question_id);
```

#### 1.2 Learning Questions Tables

```sql
-- Learning questions table
CREATE TABLE learning_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  subtopic_id UUID NOT NULL REFERENCES subtopics(id) ON DELETE CASCADE,
  video_lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false')),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_questions_topic_id ON learning_questions(topic_id);
CREATE INDEX idx_learning_questions_subtopic_id ON learning_questions(subtopic_id);
CREATE INDEX idx_learning_questions_video_lesson_id ON learning_questions(video_lesson_id);
CREATE INDEX idx_learning_questions_active ON learning_questions(is_active) WHERE is_active = true;

-- Learning question options table
CREATE TABLE learning_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES learning_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_question_options_question_id ON learning_question_options(question_id);
```

#### 1.3 Mock Exam Questions Tables (Reuse Existing)

```sql
-- Rename existing questions table to mock_exam_questions
ALTER TABLE questions RENAME TO mock_exam_questions;
ALTER TABLE question_options RENAME TO mock_exam_question_options;

-- Update foreign key constraint name
ALTER TABLE mock_exam_question_options 
  RENAME CONSTRAINT question_options_question_id_fkey 
  TO mock_exam_question_options_question_id_fkey;

-- Existing indexes are preserved with table rename
-- No need to create new tables - reuse existing structure
```

#### 1.4 Topic Core Notes Table

```sql
-- Topic core notes table
CREATE TABLE topic_core_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- Rich text HTML content
  sections JSONB, -- Array of section objects with titles and content
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id)
);

CREATE INDEX idx_topic_core_notes_topic_id ON topic_core_notes(topic_id);

-- JSONB structure for sections:
-- [
--   {
--     "title": "Introduction to Numeracy",
--     "content": "<p>HTML content here</p>",
--     "order": 1
--   },
--   {
--     "title": "Dosage Calculations Overview",
--     "content": "<p>HTML content here</p>",
--     "order": 2
--   }
-- ]
```

#### 1.5 Topic Flash Content Table

```sql
-- Topic flash content table
CREATE TABLE topic_flash_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  screen_number INTEGER NOT NULL CHECK (screen_number BETWEEN 1 AND 5),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- Rich text HTML content
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id, screen_number)
);

CREATE INDEX idx_topic_flash_content_topic_id ON topic_flash_content(topic_id);
CREATE INDEX idx_topic_flash_content_screen_number ON topic_flash_content(screen_number);
```

#### 1.6 Updated Lessons Table

```sql
-- Add new fields to existing lessons table
ALTER TABLE lessons ADD COLUMN is_mandatory BOOLEAN DEFAULT true;
ALTER TABLE lessons ADD COLUMN content_type VARCHAR(50) CHECK (content_type IN ('video', 'audio', 'text'));
ALTER TABLE lessons ADD COLUMN podcast_url TEXT;

-- Update existing records
UPDATE lessons SET content_type = 'video' WHERE video_url IS NOT NULL;
UPDATE lessons SET content_type = 'audio' WHERE audio_url IS NOT NULL;
UPDATE lessons SET content_type = 'text' WHERE content IS NOT NULL;
```

#### 1.7 Subtopic Progress Tracking

```sql
-- Subtopic progress table
CREATE TABLE subtopic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  subtopic_id UUID NOT NULL REFERENCES subtopics(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('locked', 'in_progress', 'completed')),
  score INTEGER, -- Percentage score (0-100)
  best_score INTEGER, -- Best score achieved
  attempts INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subtopic_id)
);

CREATE INDEX idx_subtopic_progress_user_id ON subtopic_progress(user_id);
CREATE INDEX idx_subtopic_progress_topic_id ON subtopic_progress(topic_id);
CREATE INDEX idx_subtopic_progress_subtopic_id ON subtopic_progress(subtopic_id);
CREATE INDEX idx_subtopic_progress_status ON subtopic_progress(status);
```

#### 1.8 Topic Progress Tracking

```sql
-- Topic progress table
CREATE TABLE topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  core_notes_completed BOOLEAN DEFAULT false,
  flash_content_completed BOOLEAN DEFAULT false,
  progress_percentage INTEGER DEFAULT 0, -- Overall topic progress (0-100)
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_topic_progress_user_id ON topic_progress(user_id);
CREATE INDEX idx_topic_progress_topic_id ON topic_progress(topic_id);
```

### 2. Data Migration Strategy

#### 2.1 Migration Steps

1. **Create new tables** (practice_questions, learning_questions only)
2. **Rename existing questions table** to mock_exam_questions
3. **Analyze existing questions** to determine if they belong to Practice or Learning
4. **Copy Practice and Learning questions** to new tables
5. **Delete migrated questions** from mock_exam_questions table
6. **Verify data integrity** and foreign key relationships
7. **Update application code** to use appropriate tables

#### 2.2 Migration Logic

```typescript
// Pseudocode for question migration
async function migrateQuestions() {
  // Step 1: Rename existing table
  await db.raw('ALTER TABLE questions RENAME TO mock_exam_questions');
  await db.raw('ALTER TABLE question_options RENAME TO mock_exam_question_options');
  
  // Step 2: Get all questions from mock_exam_questions
  const allQuestions = await db.mock_exam_questions.findAll();
  
  const practiceQuestionIds = [];
  const learningQuestionIds = [];
  
  for (const question of allQuestions) {
    // Determine if question belongs to Practice or Learning
    if (question.lesson_id) {
      const lesson = await db.lessons.findById(question.lesson_id);
      const topic = await db.topics.findById(lesson.topic_id);
      const module = await db.modules.findById(topic.module_id);
      
      if (module.title === 'Practice Module') {
        // Migrate to practice_questions
        await migrateToPracticeQuestions(question);
        practiceQuestionIds.push(question.id);
      } else if (module.title === 'Learning Module') {
        // Migrate to learning_questions
        await migrateToLearningQuestions(question);
        learningQuestionIds.push(question.id);
      }
    }
    // Questions without lesson_id stay in mock_exam_questions
  }
  
  // Step 3: Delete migrated questions from mock_exam_questions
  await db.mock_exam_questions.deleteMany({
    id: { in: [...practiceQuestionIds, ...learningQuestionIds] }
  });
}
```

### 3. Admin Portal Components

#### 3.1 Practice Module Management

**Component Structure:**
```
PracticeModuleManager
├── TopicSelector (Numeracy / Clinical Knowledge)
├── SubtopicSelector (Fixed list based on topic)
└── QuestionManager
    ├── QuestionList
    ├── QuestionForm
    └── QuestionOptionsEditor
```

**Key Features:**
- Fixed topic/subtopic structure (no add/delete)
- Question CRUD operations
- Bulk import from CSV
- Question preview

#### 3.2 Learning Module Management

**Component Structure:**
```
LearningModuleManager
├── TopicList (with Add/Edit/Delete/Reorder)
├── TopicEditor
│   ├── CoreNotesEditor (Rich text editor)
│   ├── FlashContentEditor (5 screens)
│   └── SubtopicList
└── SubtopicEditor
    ├── VideoLessonManager (Mandatory)
    ├── PodcastManager (Optional)
    └── VideoMappedMCQManager (5-10 questions)
```

**Key Features:**
- Dynamic topic creation/editing
- Rich text editor for Core Notes
- Flash content screen editor (exactly 5)
- Video/podcast upload and management
- Video-mapped MCQ creation
- Content validation before activation

#### 3.3 Mock Exam Module Management

**Component Structure:**
```
MockExamModuleManager
├── QuestionList
├── QuestionForm
├── ExamConfigEditor
└── QuestionPoolManager
```

**Key Features:**
- Question CRUD operations
- Exam configuration (duration, passing score, etc.)
- Question pool management
- Difficulty distribution settings

### 4. Mobile App Components

#### 4.1 Learning Module Mobile UI

**Main Topic Screen:**
```
┌─────────────────────────────────────┐
│  Topic: Numeracy                    │
│  Progress: 45%                      │
├─────────────────────────────────────┤
│  📖 Core Notes                      │
│  [Read Now]                         │
├─────────────────────────────────────┤
│  ⚡ Flash Content (5 screens)       │
│  [Review]                           │
├─────────────────────────────────────┤
│  Subtopics:                         │
│  ✓ 1.1 Dosage Calculations (92%)   │
│  → 1.2 Unit Conversions (Current)  │
│  🔒 1.3 IV Flow Rate Calculations   │
│  🔒 1.4 Fluid Balance               │
└─────────────────────────────────────┘
```

**Subtopic Screen:**
```
┌─────────────────────────────────────┐
│  1.2 Unit Conversions               │
├─────────────────────────────────────┤
│  🎥 Video Lesson (Mandatory)        │
│  Duration: 12:34                    │
│  [Watch Video]                      │
├─────────────────────────────────────┤
│  🎧 Podcast (Optional)              │
│  Duration: 18:45                    │
│  [Listen]                           │
├─────────────────────────────────────┤
│  📝 Assessment (7 questions)        │
│  Passing Score: 80%                 │
│  [Start Assessment]                 │
└─────────────────────────────────────┘
```

#### 4.2 Practice Module Mobile UI

**Practice Topic Screen:**
```
┌─────────────────────────────────────┐
│  Practice: Numeracy                 │
├─────────────────────────────────────┤
│  Dosage Calculations (45 questions) │
│  [Practice Now]                     │
├─────────────────────────────────────┤
│  Unit Conversions (38 questions)    │
│  [Practice Now]                     │
├─────────────────────────────────────┤
│  IV Flow Rate (42 questions)        │
│  [Practice Now]                     │
├─────────────────────────────────────┤
│  Fluid Balance (35 questions)       │
│  [Practice Now]                     │
└─────────────────────────────────────┘
```

## Data Models

### TypeScript Interfaces

```typescript
// Practice Question
interface PracticeQuestion {
  id: string;
  category: 'Numeracy' | 'Clinical Knowledge';
  subdivision: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  explanation: string;
  imageUrl?: string;
  isActive: boolean;
  options: PracticeQuestionOption[];
  createdAt: Date;
  updatedAt: Date;
}

interface PracticeQuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

// Learning Question
interface LearningQuestion {
  id: string;
  topicId: string;
  subtopicId: string;
  videoLessonId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  explanation: string;
  imageUrl?: string;
  isActive: boolean;
  options: LearningQuestionOption[];
  createdAt: Date;
  updatedAt: Date;
}

interface LearningQuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

// Topic Core Notes
interface TopicCoreNotes {
  id: string;
  topicId: string;
  content: string; // HTML
  sections: CoreNoteSection[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CoreNoteSection {
  title: string;
  content: string; // HTML
  order: number;
}

// Topic Flash Content
interface TopicFlashContent {
  id: string;
  topicId: string;
  screenNumber: number; // 1-5
  title: string;
  content: string; // HTML
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Subtopic Progress
interface SubtopicProgress {
  id: string;
  userId: string;
  topicId: string;
  subtopicId: string;
  status: 'locked' | 'in_progress' | 'completed';
  score?: number; // 0-100
  bestScore?: number;
  attempts: number;
  timeSpentSeconds: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Topic Progress
interface TopicProgress {
  id: string;
  userId: string;
  topicId: string;
  coreNotesCompleted: boolean;
  flashContentCompleted: boolean;
  progressPercentage: number; // 0-100
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Validation Errors

1. **Topic Activation Validation**
   - Missing Core Notes → "Core Notes must be completed before activating topic"
   - Incomplete Flash Content → "Exactly 5 flash screens required (currently: X)"
   - No subtopics → "At least one subtopic required"

2. **Subtopic Activation Validation**
   - No video lesson → "Mandatory video lesson required"
   - Insufficient MCQs → "5-10 MCQs required (currently: X)"
   - Unmapped MCQs → "All MCQs must be mapped to video lesson"

3. **Question Creation Validation**
   - Missing correct answer → "At least one correct answer required"
   - Duplicate options → "Option text must be unique"
   - Invalid difficulty → "Difficulty must be easy, medium, or hard"

### Migration Errors

1. **Data Integrity Errors**
   - Foreign key violations → Rollback and report
   - Duplicate entries → Skip and log
   - Missing references → Create placeholder or skip

2. **Rollback Strategy**
   - Keep old tables until migration verified
   - Transaction-based migration
   - Backup before migration

## Testing Strategy

### Unit Tests

1. **Database Operations**
   - Test CRUD operations for each new table
   - Test foreign key constraints
   - Test unique constraints
   - Test check constraints

2. **Business Logic**
   - Test subtopic unlocking logic
   - Test progress calculation
   - Test validation rules
   - Test score calculation (80% threshold)

3. **Data Migration**
   - Test question classification logic
   - Test data transformation
   - Test rollback procedures

### Integration Tests

1. **Admin Portal**
   - Test topic creation workflow
   - Test subtopic content management
   - Test question creation and mapping
   - Test validation enforcement

2. **Mobile App**
   - Test topic navigation
   - Test subtopic progression
   - Test MCQ assessment flow
   - Test progress tracking

3. **API Endpoints**
   - Test question retrieval by module type
   - Test progress updates
   - Test content validation

### Property-Based Tests

Property tests will be defined after design approval to validate universal correctness properties.

## Performance Considerations

### Database Optimization

1. **Indexes**
   - Create indexes on frequently queried fields (topic_id, subtopic_id, user_id)
   - Create composite indexes for common query patterns
   - Use partial indexes for active content (WHERE is_active = true)

2. **Query Optimization**
   - Use JOIN queries to fetch related data in single request
   - Implement pagination for large question lists
   - Cache frequently accessed content (Core Notes, Flash Content)

3. **Data Volume**
   - Estimate: 1000+ questions per module
   - Estimate: 50+ topics in Learning Module
   - Estimate: 10,000+ user progress records

### Caching Strategy

1. **Static Content**
   - Cache Core Notes (invalidate on update)
   - Cache Flash Content (invalidate on update)
   - Cache topic/subtopic structure

2. **User Progress**
   - Cache current user's progress
   - Invalidate on progress update
   - Use optimistic updates in UI

## Security Considerations

### Row Level Security (RLS)

1. **Admin Access**
   - Superadmins: Full CRUD on all tables
   - Editors: Create, Read, Update (no delete)
   - Moderators: Read-only

2. **User Access**
   - Users can only read active content
   - Users can only update their own progress
   - Users cannot access locked subtopics

### Data Validation

1. **Input Sanitization**
   - Sanitize HTML content in Core Notes and Flash Content
   - Validate file uploads (images, videos, audio)
   - Prevent SQL injection in dynamic queries

2. **Authorization**
   - Verify user permissions before content access
   - Verify subtopic unlock status before allowing access
   - Verify admin role before allowing content management

## Deployment Strategy

### Phase 1: Database Migration
1. Create new tables
2. Run migration script
3. Verify data integrity
4. Keep old tables for rollback

### Phase 2: Admin Portal Update
1. Deploy new admin components
2. Enable feature flag for new UI
3. Train admins on new interface
4. Monitor for issues

### Phase 3: Mobile App Update
1. Deploy new mobile components
2. Enable feature flag for new UI
3. Monitor user feedback
4. Gradual rollout to all users

### Phase 4: Cleanup
1. Remove old questions table (after verification period)
2. Remove feature flags
3. Update documentation
4. Archive old code

## Rollback Plan

1. **Database Rollback**
   - Revert to old questions table
   - Drop new tables
   - Restore from backup if needed

2. **Application Rollback**
   - Disable feature flags
   - Revert to previous code version
   - Restore old admin UI

3. **Data Recovery**
   - Old questions table preserved during migration
   - Regular backups before each phase
   - Transaction logs for point-in-time recovery
