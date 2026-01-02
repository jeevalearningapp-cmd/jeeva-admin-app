# Mobile App Implementation Tasks

## Task Breakdown for Kiro IDE

### TASK 3: Core Notes Screen (NEW)

**File**: `src/screens/learning/CoreNotesScreen.tsx`

**Purpose**: Display rich text reading lessons for a topic

**Requirements**:
- Fetch core notes from API
- Render HTML content with proper styling
- Track reading progress (scroll position)
- Mark as completed when user finishes reading
- Support images in content
- Responsive text sizing

**Key Features**:
```typescript
- Load core notes by topic ID
- Render HTML with react-native-render-html
- Track scroll progress
- Auto-save reading position
- Mark completed button at end
- Navigate back to topic detail
```

**Dependencies**:
- `react-native-render-html` for HTML rendering
- `@react-native-async-storage/async-storage` for saving position

**API Calls**:
- `coreNotesAPI.getByTopicId(topicId)`
- `progressAPI.markCoreNotesCompleted(userId, topicId)`

---

### TASK 4: Flash Content Screen (NEW)

**File**: `src/screens/learning/FlashContentScreen.tsx`

**Purpose**: Display 5 flash review screens with swipe navigation

**Requirements**:
- Fetch 5 flash screens from API
- Swipeable card interface
- Progress indicator (1/5, 2/5, etc.)
- Support images per screen
- Mark as completed after viewing all 5
- Can navigate back/forward

**Key Features**:
```typescript
- Load 5 flash screens by topic ID
- Swipeable cards (left/right)
- Progress dots indicator
- Auto-advance option
- Mark completed after viewing all
- Navigate back to topic detail
```

**Dependencies**:
- `react-native-gesture-handler` for swipe
- `react-native-reanimated` for animations

**API Calls**:
- `flashContentAPI.getByTopicId(topicId)`
- `progressAPI.markFlashContentCompleted(userId, topicId)`

---

### TASK 5: Topic Detail Screen (NEW)

**File**: `src/screens/learning/TopicDetailScreen.tsx`

**Purpose**: Show topic overview with Core Notes, Flash Content, and Subtopics

**Requirements**:
- Display topic title and description
- Show progress percentage
- Three sections: Core Notes, Flash Content, Subtopics
- Navigate to each section
- Show completion status for each section
- Lock/unlock subtopics based on progress

**Key Features**:
```typescript
- Load topic details
- Load topic progress
- Display 3 action cards:
  1. Core Notes (with completion badge)
  2. Flash Content (with completion badge)
  3. Subtopics List (with count and progress)
- Navigate to respective screens
- Show overall topic progress bar
```

**API Calls**:
- `topicsAPI.getById(topicId)`
- `progressAPI.getTopicProgress(userId, topicId)`
- `subtopicsAPI.getByTopicId(topicId)`

---

### TASK 6: Subtopic List Screen (NEW)

**File**: `src/screens/learning/SubtopicListScreen.tsx`

**Purpose**: Display all subtopics for a topic with progress

**Requirements**:
- List all subtopics
- Show completion status (locked, in_progress, completed)
- Show best score for each
- Navigate to subtopic detail
- Lock subtopics until previous completed
- Show video/podcast availability icons

**Key Features**:
```typescript
- Load subtopics by topic ID
- Load progress for each subtopic
- Display cards with:
  - Title
  - Status badge (locked/in_progress/completed)
  - Best score
  - Video/podcast icons
  - Duration
- Tap to navigate to subtopic detail
- Disable locked subtopics
```

**API Calls**:
- `subtopicsAPI.getByTopicId(topicId)`
- `progressAPI.getSubtopicProgress(userId, subtopicId)` for each

---

### TASK 7: Subtopic Detail Screen (NEW)

**File**: `src/screens/learning/SubtopicDetailScreen.tsx`

**Purpose**: Show subtopic content with Video, Podcast, and MCQ tabs

**Requirements**:
- Tab navigation (Video, Podcast, MCQs)
- Video player for mandatory video
- Podcast player for optional audio
- MCQ assessment button
- Track time spent
- Show progress and scores

**Key Features**:
```typescript
- Load subtopic details
- Load subtopic progress
- Three tabs:
  1. Video Lesson (mandatory)
  2. Podcast (optional, show "Not Available" if none)
  3. MCQ Assessment (show count and best score)
- Track time spent on screen
- Update progress when leaving
- Navigate to MCQ assessment
```

**API Calls**:
- `subtopicsAPI.getById(subtopicId)`
- `progressAPI.getSubtopicProgress(userId, subtopicId)`
- `progressAPI.updateSubtopicProgress(userId, subtopicId, { timeSpent })`


---

### TASK 8: Video Lesson Screen (UPDATED)

**File**: `src/screens/learning/VideoLessonScreen.tsx`

**Purpose**: Play video lesson with progress tracking

**Requirements**:
- Video player with controls
- Track watch progress
- Mark as watched when completed
- Support fullscreen
- Show video duration
- Resume from last position

**Key Features**:
```typescript
- Load video URL from subtopic
- Video player with:
  - Play/pause
  - Seek bar
  - Fullscreen toggle
  - Speed control
  - Quality selection
- Track watch percentage
- Save watch position
- Mark video as watched (80% threshold)
- Update subtopic progress
```

**Dependencies**:
- `expo-av` or `react-native-video`

**API Calls**:
- `subtopicsAPI.getById(subtopicId)` for video URL
- `progressAPI.updateSubtopicProgress(userId, subtopicId, { status: 'in_progress' })`

---

### TASK 9: Podcast Screen (NEW)

**File**: `src/screens/learning/PodcastScreen.tsx`

**Purpose**: Play podcast audio with progress tracking

**Requirements**:
- Audio player with controls
- Track listen progress
- Support background playback
- Show duration
- Resume from last position
- Optional (not required for completion)

**Key Features**:
```typescript
- Load podcast URL from subtopic
- Audio player with:
  - Play/pause
  - Seek bar
  - Speed control (0.5x, 1x, 1.5x, 2x)
  - Background playback
- Track listen percentage
- Save listen position
- Show "Optional" badge
- Continue playing when screen locked
```

**Dependencies**:
- `expo-av` for audio playback

**API Calls**:
- `subtopicsAPI.getById(subtopicId)` for podcast URL

---

### TASK 10: MCQ Assessment Screen (UPDATED)

**File**: `src/screens/learning/MCQAssessmentScreen.tsx`

**Purpose**: Display video-mapped MCQs and calculate score

**Requirements**:
- Load 5-10 questions for subtopic
- One question at a time
- Show progress (Question 1/7)
- Submit answer and show result
- Show explanation after answer
- Calculate final score
- Require 80% to pass
- Update subtopic progress

**Key Features**:
```typescript
- Load questions by subtopic ID
- Display one question at a time
- Show 4 options
- Submit answer
- Show correct/incorrect feedback
- Show explanation
- Next question button
- Progress indicator
- Final score screen
- Pass/fail status (80% threshold)
- Update best score
- Mark subtopic as completed if passed
- Retry option if failed
```

**API Calls**:
- `learningQuestionsAPI.getBySubtopicId(subtopicId)`
- `learningQuestionsAPI.submitAnswer(questionId, optionId)`
- `progressAPI.updateSubtopicProgress(userId, subtopicId, { score, status })`

---

### TASK 11: Practice Module Updates

**File**: `src/screens/practice/PracticeQuestionScreen.tsx` (UPDATED)

**Purpose**: Update to use new practice_questions table

**Changes Required**:
```typescript
// OLD API
import { questionsAPI } from '@/api/questions';
const questions = await questionsAPI.getByCategory(category);

// NEW API
import { practiceQuestionsAPI } from '@/api/practiceQuestions';
const questions = await practiceQuestionsAPI.getBySubdivision(category, subdivision);
```

**API File**: `src/api/practiceQuestions.ts` (NEW)

```typescript
import { supabase } from '@/lib/supabase';
import { PracticeQuestion } from '@/types/practice';

export const practiceQuestionsAPI = {
  async getBySubdivision(
    category: string,
    subdivision: string
  ): Promise<PracticeQuestion[]> {
    const { data, error } = await supabase
      .from('practice_questions')
      .select(`
        *,
        practice_question_options (
          id,
          option_text,
          is_correct,
          display_order
        )
      `)
      .eq('category', category)
      .eq('subdivision', subdivision)
      .eq('is_active', true);

    if (error) throw error;

    return data.map(q => ({
      id: q.id,
      category: q.category,
      subdivision: q.subdivision,
      questionText: q.question_text,
      questionType: q.question_type,
      difficulty: q.difficulty,
      explanation: q.explanation,
      imageUrl: q.image_url,
      options: q.practice_question_options.map(o => ({
        id: o.id,
        questionId: q.id,
        optionText: o.option_text,
        isCorrect: o.is_correct,
        displayOrder: o.display_order,
      })),
    }));
  },
};
```

---

### TASK 12: Mock Exam Module Updates

**File**: `src/screens/mockExam/MockExamQuestionScreen.tsx` (UPDATED)

**Purpose**: Update to use renamed mock_exam_questions table

**Changes Required**:
```typescript
// OLD API
import { questionsAPI } from '@/api/questions';
const questions = await questionsAPI.getByExamPart(examPart);

// NEW API
import { mockExamQuestionsAPI } from '@/api/mockExamQuestions';
const questions = await mockExamQuestionsAPI.getByExamPart(examPart);
```

**API File**: `src/api/mockExamQuestions.ts` (RENAMED from questions.ts)

```typescript
import { supabase } from '@/lib/supabase';
import { MockExamQuestion } from '@/types/mockExam';

export const mockExamQuestionsAPI = {
  async getByExamPart(examPart: 'part_a' | 'part_b'): Promise<MockExamQuestion[]> {
    const { data, error } = await supabase
      .from('mock_exam_questions')  // RENAMED TABLE
      .select(`
        *,
        mock_exam_question_options (  // RENAMED TABLE
          id,
          option_text,
          is_correct,
          display_order
        )
      `)
      .eq('exam_part', examPart)
      .eq('is_active', true);

    if (error) throw error;

    return data.map(q => ({
      id: q.id,
      examPart: q.exam_part,
      questionText: q.question_text,
      questionType: q.question_type,
      difficulty: q.difficulty,
      explanation: q.explanation,
      imageUrl: q.image_url,
      options: q.mock_exam_question_options.map(o => ({
        id: o.id,
        questionId: q.id,
        optionText: o.option_text,
        isCorrect: o.is_correct,
        displayOrder: o.display_order,
      })),
    }));
  },
};
```


---

### TASK 13: Navigation Updates

**File**: `src/navigation/LearningNavigator.tsx` (UPDATED)

**Purpose**: Add new screens to navigation stack

**Changes Required**:
```typescript
import { createStackNavigator } from '@react-navigation/stack';
import TopicListScreen from '@/screens/learning/TopicListScreen';
import TopicDetailScreen from '@/screens/learning/TopicDetailScreen';  // NEW
import CoreNotesScreen from '@/screens/learning/CoreNotesScreen';      // NEW
import FlashContentScreen from '@/screens/learning/FlashContentScreen'; // NEW
import SubtopicListScreen from '@/screens/learning/SubtopicListScreen'; // NEW
import SubtopicDetailScreen from '@/screens/learning/SubtopicDetailScreen'; // NEW
import VideoLessonScreen from '@/screens/learning/VideoLessonScreen';
import PodcastScreen from '@/screens/learning/PodcastScreen';          // NEW
import MCQAssessmentScreen from '@/screens/learning/MCQAssessmentScreen';

export type LearningStackParamList = {
  TopicList: undefined;
  TopicDetail: { topicId: string };                    // NEW
  CoreNotes: { topicId: string };                      // NEW
  FlashContent: { topicId: string };                   // NEW
  SubtopicList: { topicId: string };                   // NEW
  SubtopicDetail: { subtopicId: string; topicId: string }; // NEW
  VideoLesson: { subtopicId: string };
  Podcast: { subtopicId: string };                     // NEW
  MCQAssessment: { subtopicId: string; topicId: string };
};

const Stack = createStackNavigator<LearningStackParamList>();

export function LearningNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TopicList" component={TopicListScreen} />
      <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
      <Stack.Screen name="CoreNotes" component={CoreNotesScreen} />
      <Stack.Screen name="FlashContent" component={FlashContentScreen} />
      <Stack.Screen name="SubtopicList" component={SubtopicListScreen} />
      <Stack.Screen name="SubtopicDetail" component={SubtopicDetailScreen} />
      <Stack.Screen name="VideoLesson" component={VideoLessonScreen} />
      <Stack.Screen name="Podcast" component={PodcastScreen} />
      <Stack.Screen name="MCQAssessment" component={MCQAssessmentScreen} />
    </Stack.Navigator>
  );
}
```

---

### TASK 14: Progress Calculation Utility

**File**: `src/utils/progressCalculator.ts` (UPDATED)

**Purpose**: Calculate progress percentages for topics and subtopics

```typescript
import { SubtopicProgress, TopicProgress } from '@/types/learning';

export const progressCalculator = {
  // Calculate topic progress based on subtopics
  calculateTopicProgress(
    subtopicProgresses: SubtopicProgress[],
    coreNotesCompleted: boolean,
    flashContentCompleted: boolean
  ): number {
    if (subtopicProgresses.length === 0) return 0;

    const completedSubtopics = subtopicProgresses.filter(
      p => p.status === 'completed'
    ).length;

    const subtopicPercentage = (completedSubtopics / subtopicProgresses.length) * 100;
    
    // Weight: 40% subtopics, 30% core notes, 30% flash content
    const coreNotesWeight = coreNotesCompleted ? 30 : 0;
    const flashContentWeight = flashContentCompleted ? 30 : 0;
    const subtopicWeight = subtopicPercentage * 0.4;

    return Math.round(coreNotesWeight + flashContentWeight + subtopicWeight);
  },

  // Check if subtopic is unlocked
  isSubtopicUnlocked(
    subtopicIndex: number,
    allProgresses: SubtopicProgress[]
  ): boolean {
    // First subtopic is always unlocked
    if (subtopicIndex === 0) return true;

    // Check if previous subtopic is completed
    const previousProgress = allProgresses[subtopicIndex - 1];
    return previousProgress?.status === 'completed';
  },

  // Calculate quiz score
  calculateQuizScore(
    correctAnswers: number,
    totalQuestions: number
  ): number {
    return Math.round((correctAnswers / totalQuestions) * 100);
  },

  // Check if quiz passed (80% threshold)
  isQuizPassed(score: number): boolean {
    return score >= 80;
  },

  // Get status badge color
  getStatusColor(status: 'locked' | 'in_progress' | 'completed'): string {
    switch (status) {
      case 'locked':
        return '#9CA3AF'; // Gray
      case 'in_progress':
        return '#F59E0B'; // Orange
      case 'completed':
        return '#10B981'; // Green
      default:
        return '#9CA3AF';
    }
  },

  // Get status icon
  getStatusIcon(status: 'locked' | 'in_progress' | 'completed'): string {
    switch (status) {
      case 'locked':
        return '🔒';
      case 'in_progress':
        return '▶️';
      case 'completed':
        return '✅';
      default:
        return '🔒';
    }
  },
};
```

---

### TASK 15: Content Validator Utility

**File**: `src/utils/contentValidator.ts` (NEW)

**Purpose**: Validate content before allowing access

```typescript
import { Subtopic, SubtopicProgress } from '@/types/learning';

export const contentValidator = {
  // Validate if subtopic can be accessed
  canAccessSubtopic(
    subtopic: Subtopic,
    progress: SubtopicProgress | null
  ): { canAccess: boolean; reason?: string } {
    // Check if locked
    if (progress?.status === 'locked') {
      return {
        canAccess: false,
        reason: 'Complete previous subtopic to unlock',
      };
    }

    // Check if video exists (mandatory)
    if (!subtopic.videoUrl) {
      return {
        canAccess: false,
        reason: 'Video lesson not available yet',
      };
    }

    return { canAccess: true };
  },

  // Validate if MCQ assessment can be started
  canStartAssessment(
    subtopic: Subtopic,
    videoWatched: boolean
  ): { canStart: boolean; reason?: string } {
    // Must watch video first
    if (!videoWatched) {
      return {
        canStart: false,
        reason: 'Watch the video lesson first',
      };
    }

    return { canStart: true };
  },

  // Validate quiz completion
  validateQuizCompletion(
    answeredCount: number,
    totalQuestions: number
  ): boolean {
    return answeredCount === totalQuestions;
  },
};
```

