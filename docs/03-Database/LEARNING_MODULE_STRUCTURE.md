# Learning Module Structure & User Progression

## Content Hierarchy

```
Learning Module
├── Topic 1: Numeracy
│   ├── Subtopic 1.1: Dosage Calculations
│   │   ├── Lessons (text, video, audio)
│   │   ├── Questions
│   │   └── Flashcards
│   ├── Subtopic 1.2: Unit Conversions
│   │   ├── Lessons
│   │   ├── Questions
│   │   └── Flashcards
│   ├── Subtopic 1.3: IV Flow Rate Calculations
│   │   ├── Lessons
│   │   ├── Questions
│   │   └── Flashcards
│   └── Subtopic 1.4: Fluid Balance
│       ├── Lessons
│       ├── Questions
│       └── Flashcards
│
├── Topic 2: The NMC Code
│   ├── Subtopic 2.1: Prioritise People
│   │   ├── Lessons (text, video, audio)
│   │   ├── Questions
│   │   └── Flashcards
│   ├── Subtopic 2.2: Practice Effectively
│   │   ├── Lessons
│   │   ├── Questions
│   │   └── Flashcards
│   ├── Subtopic 2.3: Preserve Safety
│   │   ├── Lessons
│   │   ├── Questions
│   │   └── Flashcards
│   └── Subtopic 2.4: Promote Professionalism
│       ├── Lessons
│       ├── Questions
│       └── Flashcards
│
├── Topic 3: Mental Capacity Act
│   └── (4 subtopics: 3.1-3.4 with same structure)
│
├── Topic 4: Safeguarding
│   └── (3 subtopics: 4.1-4.3)
│
├── Topic 5: Consent & Confidentiality
│   └── (3 subtopics: 5.1-5.3)
│
├── Topic 6: Equality & Diversity
│   └── (3 subtopics: 6.1-6.3)
│
├── Topic 7: Duty of Candour
│   └── (2 subtopics: 7.1-7.2)
│
└── Topic 8: Cultural Adaptation
    └── (2 subtopics: 8.1-8.2)
```

## User Progression Logic (Mobile App)

### Sequential Unlocking

Users **CANNOT** randomly select topics. They must complete them in order:

1. Complete Topic 1 → Unlock Topic 2
2. Complete Topic 2 → Unlock Topic 3
3. And so on...

### Subtopic Completion Flow

For each subtopic, the user must:

#### 1. **Complete Lessons** (Study Phase)

- Watch videos
- Listen to audio
- Read text content
- Review flashcards

#### 2. **Pass Questions** (Assessment Phase)

- Must score **80% or higher**
- Questions are specific to that subtopic
- If score < 80%, must retry

#### 3. **Unlock Next Subtopic**

- Only after passing with 80%+
- Within the same topic

### Topic Completion Requirements

To mark a topic as "complete" and unlock the next topic:

- Complete **ALL** subtopics within that topic
- Each subtopic must have 80%+ passing score

### All Topics Follow Same Structure

All 8 topics now have subtopics:

- Complete all lessons in a subtopic
- Pass assessment with 80%+ score
- Unlock next subtopic
- Complete all subtopics to unlock next topic

## Database Structure

### Questions Table

```sql
category: string      -- Topic title (e.g., "The NMC Code")
subdivision: string   -- Subtopic ID (e.g., "1.1", "3.2")
module_type: 'learning'
```

### Lessons Table

```sql
topic_id: UUID        -- Topic ID
category: string      -- Subtopic ID (e.g., "1.1", "3.2")
lesson_type: 'text' | 'video' | 'audio' | 'quiz'
```

### Flashcards Table

```sql
category: string      -- Subtopic ID (e.g., "1.1") or Topic title
```

## Mobile App Implementation Guide

### 1. Fetch Topic List

```typescript
const topics = LEARNING_TOPICS; // 8 fixed topics
```

### 2. Check User Progress

```typescript
interface UserProgress {
  topicId: string;
  subtopicId?: string;
  lessonsCompleted: number;
  questionsScore: number; // 0-100
  isLocked: boolean;
  isPassed: boolean; // >= 80%
}
```

### 3. Determine Locked/Unlocked State

```typescript
function isTopicUnlocked(
  topicIndex: number,
  userProgress: UserProgress[],
): boolean {
  if (topicIndex === 0) return true; // First topic always unlocked

  // Check if previous topic is completed
  const previousTopic = userProgress[topicIndex - 1];
  return previousTopic && previousTopic.isPassed;
}
```

### 4. Fetch Subtopic Content

```typescript
// Get questions for a specific subtopic
const questions = await fetchQuestionsByFilters({
  moduleType: "learning",
  category: topicTitle, // e.g., "The NMC Code"
  subdivision: subtopicId, // e.g., "1.1"
});

// Get lessons for a specific subtopic
const lessons = await fetchLessonsByTopicAndCategory({
  topicId: topicId,
  category: subtopicId, // e.g., "1.1"
});

// Get flashcards for a specific subtopic
const flashcards = await fetchFlashcardsByCategory({
  category: subtopicId, // e.g., "1.1"
});
```

### 5. Calculate Subtopic Score

```typescript
function calculateScore(userAnswers: Answer[], questions: Question[]): number {
  const correctAnswers = userAnswers.filter(
    (answer) =>
      answer.selectedOption ===
      questions.find((q) => q.id === answer.questionId)?.correctOption,
  );

  return (correctAnswers.length / questions.length) * 100;
}
```

### 6. Update Progress

```typescript
async function completeSubtopic(
  userId: string,
  topicId: string,
  subtopicId: string,
  score: number,
) {
  const isPassed = score >= 80;

  await saveProgress({
    userId,
    topicId,
    subtopicId,
    score,
    isPassed,
    completedAt: new Date(),
  });

  // Check if all subtopics in topic are passed
  const allSubtopicsPassed = await checkAllSubtopicsPassed(userId, topicId);

  if (allSubtopicsPassed) {
    // Unlock next topic
    await unlockNextTopic(userId, topicId);
  }
}
```

## Admin Panel Flow

### 1. Select Module

Click "Learning Module" (green card)

### 2. Select Topic

Choose from dropdown: "The NMC Code", "Safeguarding", etc.

### 3. Select Subtopic

- All topics now have subtopics
- Choose from dropdown (e.g., "1.1 Dosage Calculations", "2.1 Prioritise People")

### 4. Manage Content

Tabs:

- **Questions**: Add/edit questions for this subtopic
- **Flashcards**: Add/edit flashcards for this subtopic
- **Lessons**: Add/edit lessons (text, video, audio) for this subtopic
- **Bulk Upload**: CSV import for bulk content

## Mobile App UI/UX Recommendations

### Topic List Screen

```
✓ Topic 1: Numeracy [COMPLETED] [100%]
  ├── ✓ 1.1 Dosage Calculations [PASSED] [92%]
  ├── ✓ 1.2 Unit Conversions [PASSED] [88%]
  ├── ✓ 1.3 IV Flow Rate Calculations [PASSED] [85%]
  └── ✓ 1.4 Fluid Balance [PASSED] [90%]
→ Topic 2: The NMC Code [IN PROGRESS] [60%]
  ├── ✓ 2.1 Prioritise People [PASSED] [85%]
  ├── → 2.2 Practice Effectively [CURRENT]
  ├── 🔒 2.3 Preserve Safety [LOCKED]
  └── 🔒 2.4 Promote Professionalism [LOCKED]
🔒 Topic 3: Mental Capacity Act [LOCKED]
```

### Subtopic Screen

```
[Header: 2.2 Practice Effectively]

Lessons (5 of 8 completed)
─────────────────────────────
[✓] Introduction to Effective Practice
[✓] Communication Skills
[ ] Documentation Standards
[ ] Time Management

Questions (Ready to attempt)
─────────────────────────────
Complete all lessons to unlock questions
[Start Questions] (disabled until lessons done)

Flashcards (12 cards)
─────────────────────────────
[Review Flashcards]
```

### Assessment Screen

```
Question 5 of 15

[Question text with image]

○ Option A
○ Option B
○ Option C
○ Option D

[Previous]  [Next]  [Submit]

Progress: ▓▓▓▓▓░░░░░░░░░ 33%
```

### Results Screen

```
Assessment Complete!

Your Score: 92% ✓ PASSED

Correct Answers: 11 / 12
Passing Score: 80%

[View Detailed Results]
[Next Subtopic: 2.3 Preserve Safety →]
```

## Analytics & Tracking

Track these metrics per user:

- `topics_completed`: Number of topics fully passed
- `subtopics_completed`: Number of subtopics passed
- `current_topic_id`: UUID of current topic
- `current_subtopic_id`: String (e.g., "1.1")
- `questions_attempted`: Total questions answered
- `questions_correct`: Total correct answers
- `average_score`: Average across all subtopic assessments
- `time_spent_learning`: Minutes on lesson screens
- `time_spent_practicing`: Minutes on question screens

## Database Tables for Mobile App

### `learning_progress`

```sql
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  topic_id UUID REFERENCES topics(id),
  subtopic_id VARCHAR(10),  -- e.g., "1.1", "3.2"
  lessons_completed INT DEFAULT 0,
  questions_attempted INT DEFAULT 0,
  questions_correct INT DEFAULT 0,
  score_percentage DECIMAL(5,2),
  is_passed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `question_attempts`

```sql
CREATE TABLE question_attempts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  question_id UUID REFERENCES questions(id),
  selected_option_id UUID REFERENCES question_options(id),
  is_correct BOOLEAN,
  time_spent_seconds INT,
  attempted_at TIMESTAMP DEFAULT NOW()
);
```

### `lesson_completions`

```sql
CREATE TABLE lesson_completions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  lesson_id UUID REFERENCES lessons(id),
  time_spent_seconds INT,
  completed_at TIMESTAMP DEFAULT NOW()
);
```

## Content Creation Best Practices

### For Admins Creating Content:

1. **Lessons**:
   - Create 3-5 lessons per subtopic
   - Mix content types (text, video, audio)
   - Keep videos under 10 minutes
   - Include practical examples

2. **Questions**:
   - 10-15 questions per subtopic minimum
   - Mix difficulty levels
   - Add explanations for answers
   - Include relevant images

3. **Flashcards**:
   - 8-12 flashcards per subtopic
   - Focus on key concepts
   - Keep text concise
   - Use for quick reviews

## Summary

- **All 8 topics have subtopics** - Content is consistently organized
- **Sequential unlocking** ensures structured learning
- **80% passing score** required for progression
- **Questions, Lessons, and Flashcards** all belong to subtopics
- **Mobile app** enforces linear progression through topics/subtopics
