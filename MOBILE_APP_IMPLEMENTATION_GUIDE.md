# Mobile App Implementation Guide - Learning Module Restructure

## 📋 Overview

This document provides a comprehensive guide for migrating the Expo/React Native mobile app from the current structure to the new Learning Module system with separate databases for Practice, Learning, and Mock Exam modules.

## 🎯 Migration Goals

1. ✅ Implement new hierarchical Learning Module structure
2. ✅ Separate question databases by module type
3. ✅ Add Core Notes and Flash Content features
4. ✅ Implement video-mapped MCQ system
5. ✅ Update progress tracking for new structure
6. ✅ Maintain backward compatibility during migration
7. ✅ Zero data loss during migration

## 📊 Impact Analysis

### Affected App Sections

#### 🔴 HIGH IMPACT (Major Changes Required)

1. **Learning Module Screens**
   - Topic List Screen
   - Topic Detail Screen (NEW)
   - Core Notes Reader (NEW)
   - Flash Content Viewer (NEW)
   - Subtopic List Screen (NEW)
   - Video Lesson Player (UPDATED)
   - Podcast Player (NEW)
   - MCQ Assessment Screen (UPDATED)

2. **Progress Tracking**
   - Topic Progress Component
   - Subtopic Progress Component
   - Progress Calculation Logic
   - Progress Persistence Layer

3. **API Layer**
   - Learning Questions API (NEW)
   - Practice Questions API (NEW)
   - Core Notes API (NEW)
   - Flash Content API (NEW)
   - Subtopics API (NEW)
   - Progress Tracking API (UPDATED)

#### 🟡 MEDIUM IMPACT (Moderate Changes)

4. **Practice Module Screens**
   - Practice Topic List (UPDATED - new API)
   - Practice Question Screen (UPDATED - new API)
   - Practice Results Screen (UPDATED)

5. **Mock Exam Module Screens**
   - Mock Exam Question Screen (UPDATED - new table name)
   - Mock Exam Results Screen (UPDATED)

6. **Navigation**
   - Learning Module Navigation Stack (UPDATED)
   - Deep Linking (UPDATED)

#### 🟢 LOW IMPACT (Minor Changes)

7. **Dashboard/Home Screen**
   - Module Cards (UI only)
   - Progress Summary (API changes)

8. **Profile/Settings**
   - No changes required

9. **Authentication**
   - No changes required

---

## 📁 Current vs New Structure

### Current Structure
```
Learning Module
└── Topics
    └── Lessons (Video + Questions)
        └── Questions (mixed with Practice/Mock Exam)
```

### New Structure
```
Learning Module
└── Topics
    ├── Core Notes (Rich Text Reading)
    ├── Flash Content (5 Quick Review Screens)
    └── Subtopics
        ├── Video Lesson (Mandatory)
        ├── Podcast (Optional)
        └── MCQs (5-10, Video-Mapped)
```


## 🗂️ Database Changes Summary

### New Tables (Mobile App Reads From)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `learning_questions` | Learning Module MCQs | topic_id, subtopic_id, video_lesson_id |
| `learning_question_options` | Learning MCQ options | question_id, is_correct |
| `practice_questions` | Practice Module questions | category, subdivision |
| `practice_question_options` | Practice MCQ options | question_id, is_correct |
| `topic_core_notes` | Reading lessons | topic_id, content, sections |
| `topic_flash_content` | Flash review screens | topic_id, screen_number (1-5) |
| `subtopic_progress` | Subtopic completion tracking | user_id, subtopic_id, status, score |
| `topic_progress` | Topic completion tracking | user_id, topic_id, progress_percentage |

### Renamed Tables

| Old Name | New Name | Purpose |
|----------|----------|---------|
| `questions` | `mock_exam_questions` | Mock Exam questions only |
| `question_options` | `mock_exam_question_options` | Mock Exam options only |

### Updated Tables

| Table | New Fields Added |
|-------|------------------|
| `lessons` | `podcast_url`, `content_type`, `is_mandatory` |

---

## 🔄 Migration Strategy

### Phase 1: Preparation (Week 1)
- ✅ Database migration already completed
- ✅ Admin portal updated
- 📝 Review current mobile app codebase
- 📝 Identify all affected components
- 📝 Create feature flags for gradual rollout

### Phase 2: API Layer (Week 2)
- 📝 Create new API services
- 📝 Update existing API services
- 📝 Add TypeScript types
- 📝 Test API endpoints

### Phase 3: Core Features (Week 3-4)
- 📝 Implement Core Notes reader
- 📝 Implement Flash Content viewer
- 📝 Update video player for subtopics
- 📝 Add podcast player
- 📝 Update MCQ assessment flow

### Phase 4: Progress Tracking (Week 5)
- 📝 Update progress calculation logic
- 📝 Implement new progress tracking
- 📝 Migrate existing progress data
- 📝 Test progress persistence

### Phase 5: Testing & Rollout (Week 6)
- 📝 Integration testing
- 📝 User acceptance testing
- 📝 Gradual rollout with feature flags
- 📝 Monitor and fix issues

---

## 📦 Required Dependencies

### New Dependencies to Install

```bash
# Video player (if not already installed)
expo install expo-av

# HTML renderer for Core Notes and Flash Content
npm install react-native-render-html

# Progress indicators
npm install react-native-progress

# Markdown support (optional, for rich text)
npm install react-native-markdown-display
```

### Existing Dependencies (Verify Versions)
- `@react-navigation/native` - Navigation
- `@react-navigation/stack` - Stack navigation
- `@supabase/supabase-js` - Database client
- `react-native-video` or `expo-av` - Video playback
- `react-native-sound` or `expo-av` - Audio playback


## 📂 Folder Structure (Recommended)

```
src/
├── api/
│   ├── learningQuestions.ts          (NEW)
│   ├── practiceQuestions.ts          (NEW)
│   ├── coreNotes.ts                  (NEW)
│   ├── flashContent.ts               (NEW)
│   ├── subtopics.ts                  (NEW)
│   ├── progress.ts                   (UPDATED)
│   ├── lessons.ts                    (UPDATED)
│   └── mockExamQuestions.ts          (RENAMED from questions.ts)
├── screens/
│   ├── learning/
│   │   ├── TopicListScreen.tsx       (UPDATED)
│   │   ├── TopicDetailScreen.tsx     (NEW)
│   │   ├── CoreNotesScreen.tsx       (NEW)
│   │   ├── FlashContentScreen.tsx    (NEW)
│   │   ├── SubtopicListScreen.tsx    (NEW)
│   │   ├── SubtopicDetailScreen.tsx  (NEW)
│   │   ├── VideoLessonScreen.tsx     (UPDATED)
│   │   ├── PodcastScreen.tsx         (NEW)
│   │   └── MCQAssessmentScreen.tsx   (UPDATED)
│   ├── practice/
│   │   ├── PracticeTopicScreen.tsx   (UPDATED)
│   │   └── PracticeQuestionScreen.tsx (UPDATED)
│   └── mockExam/
│       ├── MockExamScreen.tsx        (UPDATED)
│       └── MockExamQuestionScreen.tsx (UPDATED)
├── components/
│   ├── learning/
│   │   ├── TopicCard.tsx             (UPDATED)
│   │   ├── SubtopicCard.tsx          (NEW)
│   │   ├── CoreNotesReader.tsx       (NEW)
│   │   ├── FlashCard.tsx             (NEW)
│   │   ├── VideoPlayer.tsx           (UPDATED)
│   │   ├── PodcastPlayer.tsx         (NEW)
│   │   ├── ProgressBar.tsx           (UPDATED)
│   │   └── ValidationBadge.tsx       (NEW)
│   ├── questions/
│   │   ├── QuestionCard.tsx          (UPDATED)
│   │   ├── OptionButton.tsx          (UPDATED)
│   │   └── ExplanationView.tsx       (UPDATED)
│   └── progress/
│       ├── TopicProgress.tsx         (NEW)
│       ├── SubtopicProgress.tsx      (NEW)
│       └── ProgressCircle.tsx        (UPDATED)
├── types/
│   ├── learning.ts                   (NEW)
│   ├── practice.ts                   (NEW)
│   ├── mockExam.ts                   (NEW)
│   ├── progress.ts                   (UPDATED)
│   └── api.ts                        (UPDATED)
├── hooks/
│   ├── useLearningProgress.ts        (NEW)
│   ├── useSubtopicProgress.ts        (NEW)
│   ├── useCoreNotes.ts               (NEW)
│   ├── useFlashContent.ts            (NEW)
│   └── useVideoProgress.ts           (NEW)
├── utils/
│   ├── progressCalculator.ts         (UPDATED)
│   ├── contentValidator.ts           (NEW)
│   └── htmlRenderer.ts               (NEW)
└── navigation/
    ├── LearningNavigator.tsx         (UPDATED)
    ├── PracticeNavigator.tsx         (UPDATED)
    └── MockExamNavigator.tsx         (UPDATED)
```


## 🔧 Implementation Tasks

### TASK 1: TypeScript Types & Interfaces

**File**: `src/types/learning.ts` (NEW)

```typescript
// Learning Module Types
export interface LearningTopic {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoreNotes {
  id: string;
  topicId: string;
  content: string; // HTML
  sections: CoreNoteSection[];
  isActive: boolean;
}

export interface CoreNoteSection {
  title: string;
  content: string; // HTML
  order: number;
}

export interface FlashContent {
  id: string;
  topicId: string;
  screenNumber: number; // 1-5
  title: string;
  content: string; // HTML
  imageUrl?: string;
  isActive: boolean;
}

export interface Subtopic {
  id: string;
  topicId: string;
  title: string;
  description: string;
  videoUrl?: string;
  podcastUrl?: string;
  duration?: number;
  isMandatory: boolean;
  contentType: 'video' | 'audio' | 'text';
  displayOrder: number;
  isActive: boolean;
}

export interface LearningQuestion {
  id: string;
  topicId: string;
  subtopicId: string;
  videoLessonId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  imageUrl?: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface SubtopicProgress {
  id: string;
  userId: string;
  topicId: string;
  subtopicId: string;
  status: 'locked' | 'in_progress' | 'completed';
  score?: number; // 0-100
  bestScore?: number;
  attempts: number;
  timeSpentSeconds: number;
  completedAt?: string;
}

export interface TopicProgress {
  id: string;
  userId: string;
  topicId: string;
  coreNotesCompleted: boolean;
  flashContentCompleted: boolean;
  progressPercentage: number; // 0-100
  completedAt?: string;
}
```

**File**: `src/types/practice.ts` (NEW)

```typescript
export interface PracticeQuestion {
  id: string;
  category: 'Numeracy' | 'Clinical Knowledge';
  subdivision: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  imageUrl?: string;
  options: QuestionOption[];
}
```

**File**: `src/types/mockExam.ts` (NEW)

```typescript
export interface MockExamQuestion {
  id: string;
  examPart: 'part_a' | 'part_b';
  questionText: string;
  questionType: 'multiple_choice' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  imageUrl?: string;
  options: QuestionOption[];
}
```


### TASK 2: API Services

**File**: `src/api/learningQuestions.ts` (NEW)

```typescript
import { supabase } from '@/lib/supabase';
import { LearningQuestion } from '@/types/learning';

export const learningQuestionsAPI = {
  // Get questions for a subtopic
  async getBySubtopicId(subtopicId: string): Promise<LearningQuestion[]> {
    const { data, error } = await supabase
      .from('learning_questions')
      .select(`
        *,
        learning_question_options (
          id,
          option_text,
          is_correct,
          display_order
        )
      `)
      .eq('subtopic_id', subtopicId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return data.map(q => ({
      id: q.id,
      topicId: q.topic_id,
      subtopicId: q.subtopic_id,
      videoLessonId: q.video_lesson_id,
      questionText: q.question_text,
      questionType: q.question_type,
      difficulty: q.difficulty,
      explanation: q.explanation,
      imageUrl: q.image_url,
      options: q.learning_question_options.map(o => ({
        id: o.id,
        questionId: q.id,
        optionText: o.option_text,
        isCorrect: o.is_correct,
        displayOrder: o.display_order,
      })),
    }));
  },

  // Submit answer and get result
  async submitAnswer(
    questionId: string,
    selectedOptionId: string
  ): Promise<{ isCorrect: boolean; explanation: string }> {
    const { data, error } = await supabase
      .from('learning_question_options')
      .select('is_correct')
      .eq('id', selectedOptionId)
      .single();

    if (error) throw error;

    const { data: question } = await supabase
      .from('learning_questions')
      .select('explanation')
      .eq('id', questionId)
      .single();

    return {
      isCorrect: data.is_correct,
      explanation: question?.explanation || '',
    };
  },
};
```

**File**: `src/api/coreNotes.ts` (NEW)

```typescript
import { supabase } from '@/lib/supabase';
import { CoreNotes } from '@/types/learning';

export const coreNotesAPI = {
  async getByTopicId(topicId: string): Promise<CoreNotes | null> {
    const { data, error } = await supabase
      .from('topic_core_notes')
      .select('*')
      .eq('topic_id', topicId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      id: data.id,
      topicId: data.topic_id,
      content: data.content,
      sections: data.sections || [],
      isActive: data.is_active,
    };
  },
};
```

**File**: `src/api/flashContent.ts` (NEW)

```typescript
import { supabase } from '@/lib/supabase';
import { FlashContent } from '@/types/learning';

export const flashContentAPI = {
  async getByTopicId(topicId: string): Promise<FlashContent[]> {
    const { data, error } = await supabase
      .from('topic_flash_content')
      .select('*')
      .eq('topic_id', topicId)
      .eq('is_active', true)
      .order('screen_number', { ascending: true });

    if (error) throw error;

    return data.map(f => ({
      id: f.id,
      topicId: f.topic_id,
      screenNumber: f.screen_number,
      title: f.title,
      content: f.content,
      imageUrl: f.image_url,
      isActive: f.is_active,
    }));
  },
};
```

**File**: `src/api/subtopics.ts` (NEW)

```typescript
import { supabase } from '@/lib/supabase';
import { Subtopic } from '@/types/learning';

export const subtopicsAPI = {
  async getByTopicId(topicId: string): Promise<Subtopic[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('topic_id', topicId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data.map(s => ({
      id: s.id,
      topicId: s.topic_id,
      title: s.title,
      description: s.content || '',
      videoUrl: s.video_url,
      podcastUrl: s.podcast_url,
      duration: s.duration,
      isMandatory: s.is_mandatory ?? true,
      contentType: s.content_type || 'video',
      displayOrder: s.display_order,
      isActive: s.is_active,
    }));
  },

  async getById(id: string): Promise<Subtopic> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      topicId: data.topic_id,
      title: data.title,
      description: data.content || '',
      videoUrl: data.video_url,
      podcastUrl: data.podcast_url,
      duration: data.duration,
      isMandatory: data.is_mandatory ?? true,
      contentType: data.content_type || 'video',
      displayOrder: data.display_order,
      isActive: data.is_active,
    };
  },
};
```


**File**: `src/api/progress.ts` (UPDATED)

```typescript
import { supabase } from '@/lib/supabase';
import { SubtopicProgress, TopicProgress } from '@/types/learning';

export const progressAPI = {
  // Get topic progress
  async getTopicProgress(userId: string, topicId: string): Promise<TopicProgress | null> {
    const { data, error } = await supabase
      .from('topic_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      topicId: data.topic_id,
      coreNotesCompleted: data.core_notes_completed,
      flashContentCompleted: data.flash_content_completed,
      progressPercentage: data.progress_percentage,
      completedAt: data.completed_at,
    };
  },

  // Get subtopic progress
  async getSubtopicProgress(userId: string, subtopicId: string): Promise<SubtopicProgress | null> {
    const { data, error } = await supabase
      .from('subtopic_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('subtopic_id', subtopicId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      topicId: data.topic_id,
      subtopicId: data.subtopic_id,
      status: data.status,
      score: data.score,
      bestScore: data.best_score,
      attempts: data.attempts,
      timeSpentSeconds: data.time_spent_seconds,
      completedAt: data.completed_at,
    };
  },

  // Update subtopic progress
  async updateSubtopicProgress(
    userId: string,
    subtopicId: string,
    updates: {
      status?: 'locked' | 'in_progress' | 'completed';
      score?: number;
      timeSpent?: number;
    }
  ): Promise<SubtopicProgress> {
    // Check if progress exists
    const existing = await this.getSubtopicProgress(userId, subtopicId);

    if (existing) {
      // Update existing
      const updateData: any = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.score !== undefined) {
        updateData.score = updates.score;
        updateData.best_score = Math.max(updates.score, existing.bestScore || 0);
        updateData.attempts = existing.attempts + 1;
      }
      if (updates.timeSpent) {
        updateData.time_spent_seconds = existing.timeSpentSeconds + updates.timeSpent;
      }
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('subtopic_progress')
        .update(updateData)
        .eq('user_id', userId)
        .eq('subtopic_id', subtopicId)
        .select()
        .single();

      if (error) throw error;
      return this.mapSubtopicProgress(data);
    } else {
      // Create new
      const { data, error } = await supabase
        .from('subtopic_progress')
        .insert({
          user_id: userId,
          subtopic_id: subtopicId,
          topic_id: updates.topicId, // Need to pass this
          status: updates.status || 'in_progress',
          score: updates.score,
          best_score: updates.score,
          attempts: updates.score !== undefined ? 1 : 0,
          time_spent_seconds: updates.timeSpent || 0,
          completed_at: updates.status === 'completed' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapSubtopicProgress(data);
    }
  },

  // Mark core notes as completed
  async markCoreNotesCompleted(userId: string, topicId: string): Promise<void> {
    const existing = await this.getTopicProgress(userId, topicId);

    if (existing) {
      await supabase
        .from('topic_progress')
        .update({ core_notes_completed: true })
        .eq('user_id', userId)
        .eq('topic_id', topicId);
    } else {
      await supabase
        .from('topic_progress')
        .insert({
          user_id: userId,
          topic_id: topicId,
          core_notes_completed: true,
          flash_content_completed: false,
          progress_percentage: 0,
        });
    }
  },

  // Mark flash content as completed
  async markFlashContentCompleted(userId: string, topicId: string): Promise<void> {
    const existing = await this.getTopicProgress(userId, topicId);

    if (existing) {
      await supabase
        .from('topic_progress')
        .update({ flash_content_completed: true })
        .eq('user_id', userId)
        .eq('topic_id', topicId);
    } else {
      await supabase
        .from('topic_progress')
        .insert({
          user_id: userId,
          topic_id: topicId,
          core_notes_completed: false,
          flash_content_completed: true,
          progress_percentage: 0,
        });
    }
  },

  // Calculate and update topic progress percentage
  async calculateTopicProgress(userId: string, topicId: string): Promise<number> {
    // Get all subtopics for this topic
    const { data: subtopics } = await supabase
      .from('lessons')
      .select('id')
      .eq('topic_id', topicId)
      .eq('is_active', true);

    if (!subtopics || subtopics.length === 0) return 0;

    // Get progress for all subtopics
    const { data: progressData } = await supabase
      .from('subtopic_progress')
      .select('status')
      .eq('user_id', userId)
      .eq('topic_id', topicId);

    const completedCount = progressData?.filter(p => p.status === 'completed').length || 0;
    const percentage = Math.round((completedCount / subtopics.length) * 100);

    // Update topic progress
    await supabase
      .from('topic_progress')
      .upsert({
        user_id: userId,
        topic_id: topicId,
        progress_percentage: percentage,
        completed_at: percentage === 100 ? new Date().toISOString() : null,
      });

    return percentage;
  },

  mapSubtopicProgress(data: any): SubtopicProgress {
    return {
      id: data.id,
      userId: data.user_id,
      topicId: data.topic_id,
      subtopicId: data.subtopic_id,
      status: data.status,
      score: data.score,
      bestScore: data.best_score,
      attempts: data.attempts,
      timeSpentSeconds: data.time_spent_seconds,
      completedAt: data.completed_at,
    };
  },
};
```

