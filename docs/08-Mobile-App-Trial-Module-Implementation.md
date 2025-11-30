# Mobile App - Trial Module Implementation Guide

**Document Version:** 1.0  
**Date:** November 30, 2025  
**Status:** Implementation Ready  
**Platform:** React Native / Expo

---

## Table of Contents
1. [Overview](#overview)
2. [User Flow](#user-flow)
3. [Feature Implementation](#feature-implementation)
4. [API Endpoints](#api-endpoints)
5. [Components & Screens](#components--screens)
6. [State Management](#state-management)
7. [Database Queries](#database-queries)

---

## Overview

The trial module is the gateway to Jeeva Learning Platform. All new users start as **trial users** by default, gaining access to a curated set of practice questions, learning content, and mock exams without payment.

### Key Principles
- ✅ **Default Trial Access** - Every user begins as trial user upon signup
- ✅ **Seamless Onboarding** - Profile completion → Dashboard → Trial mode entry
- ✅ **Easy Entry Point** - "Let's Try" button on NMC CBT course page
- ✅ **Conversion Trigger** - Trial completion metrics track upgrade readiness
- ✅ **Feature Parity** - Trial has same UI/UX as paid modules

---

## User Flow

### Phase 1: Signup & Initial State
```
User Signs Up
    ↓
Supabase Auth creates account
    ↓
User created with trial_user=true, subscription_status='trial'
    ↓
Redirected to Profile Completion
```

### Phase 2: Profile Completion
```
Profile Completion Screen
├── Name, Phone, Qualification
├── Years of Experience
├── Target Exam Date
└── Study Preferences
    ↓
Save to user_profiles table
    ↓
Redirect to Dashboard
```

### Phase 3: Dashboard & Trial Entry
```
Dashboard Loads
    ├── Check user.subscription_status === 'trial'
    ├── Display "Let's Try" CTA Button
    ├── Show trial progress cards
    └── Limited module access badge
    ↓
User clicks "Let's Try" button
    ↓
Navigate to Trial Module
```

### Phase 4: Trial Module Experience
```
Trial Module (4 Sections)
├── Practice (6 Questions)
├── Learning (2 Lessons with 60% threshold)
├── Mock Exam (20 Questions, 30 mins)
└── Results & Upgrade CTA
```

### Phase 5: Conversion
```
Trial Completion → Analytics captured
    ↓
Upgrade Prompt shown with:
├── Feature comparison
├── Plan options (Starter/Growth/Ultimate)
├── Limited-time discount (optional)
└── Payment flow initiated
```

---

## Feature Implementation

### 1. Trial Button on NMC CBT Course Page

**Location:** Course catalog screen showing NMC CBT course

**Implementation:**
```typescript
// courseCard.tsx
<Button
  onPress={() => {
    if (user?.subscription_status === 'trial') {
      navigation.navigate('TrialModule')
    } else if (user?.subscription_status === 'active') {
      navigation.navigate('CourseDetails', { courseId: 'nmc-cbt' })
    } else {
      showSubscriptionSheet()
    }
  }}
  variant={user?.subscription_status === 'trial' ? 'secondary' : 'primary'}
  label={user?.subscription_status === 'trial' ? 'Let\'s Try' : 'Unlock Now'}
/>
```

**Button Placement:**
- Primary CTA on NMC CBT course card
- Icon: `<PlayCircleOutlineIcon />` (play icon) for "Let's Try"
- Color: `#2196F3` (blue) for trial, `#007AFF` for paid

---

### 2. Trial Module Access Control

**Check User Trial Status:**
```typescript
// hooks/useTrialAccess.ts
export const useTrialAccess = () => {
  const { user } = useAuth()
  const [canAccessTrial, setCanAccessTrial] = useState(false)

  useEffect(() => {
    const checkTrialAccess = async () => {
      // Check if user is trial user
      if (user?.subscription_status === 'trial') {
        // Check if trial not expired
        const { data, error } = await supabase
          .from('user_profiles')
          .select('trial_started_at, trial_expires_at')
          .eq('id', user.id)
          .single()

        if (!error && data) {
          const now = new Date()
          const expiresAt = new Date(data.trial_expires_at)
          setCanAccessTrial(now < expiresAt)
        }
      }
    }

    checkTrialAccess()
  }, [user?.id])

  return { canAccessTrial }
}
```

---

### 3. Trial Module Screens

#### Screen 1: Trial Practice Manager
**Path:** `TrialModule/Practice`

**Features:**
- Display 6 random trial questions (3 numerical + 3 clinical)
- Question navigation with progress indicator
- Unlimited attempts
- Immediate feedback with explanations
- Track score: X/6

**Implementation:**
```typescript
// screens/TrialModule/TrialPracticeScreen.tsx
const TrialPracticeScreen = () => {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    loadTrialQuestions()
  }, [])

  const loadTrialQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_trial_content', true)
      .limit(6)
    
    setQuestions(data || [])
  }

  const handleSubmitAnswer = async (answer) => {
    setAnswers({
      ...answers,
      [currentIndex]: answer
    })

    // Track attempt
    await supabase.from('trial_attempt_records').insert({
      user_id: user.id,
      module_id: 'trial-practice',
      content_type: 'practice',
      answers_data: { ...answers, [currentIndex]: answer }
    })
  }

  return (
    <TrialPracticeContainer>
      <ProgressBar value={(currentIndex + 1) / questions.length} />
      {/* Question card with options */}
      <QuestionCard question={questions[currentIndex]} />
      {/* Navigation */}
    </TrialPracticeContainer>
  )
}
```

#### Screen 2: Trial Learning Module
**Path:** `TrialModule/Learning`

**Features:**
- 2 pre-selected lessons (Patient Safety, Infection Prevention)
- 5 content types: Video, Audio, Text, Flashcard, MCQ
- 60% completion threshold to unlock next lesson
- Track progress with unlock status

**Implementation:**
```typescript
// screens/TrialModule/TrialLearningScreen.tsx
const TrialLearningScreen = () => {
  const [lessons, setLessons] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [progress, setProgress] = useState({})

  useEffect(() => {
    loadTrialLessons()
    loadProgress()
  }, [])

  const loadTrialLessons = async () => {
    // Get 2 trial lessons
    const { data } = await supabase
      .from('lessons')
      .select(`
        id, title, is_trial_content,
        unlock_threshold_percentage,
        lesson_content (*)
      `)
      .eq('is_trial_content', true)
      .limit(2)

    setLessons(data || [])
  }

  const loadProgress = async () => {
    const { data } = await supabase
      .from('trial_learning_progress')
      .select('*')
      .eq('user_id', user.id)

    const progressMap = {}
    data?.forEach(p => {
      progressMap[p.lesson_id] = {
        completed: p.is_completed,
        score: p.assessment_percentage,
        unlocked: p.is_unlocked
      }
    })
    setProgress(progressMap)
  }

  const handleContentComplete = async (lessonId, score) => {
    const isUnlocked = score >= 60

    await supabase.from('trial_learning_progress').upsert({
      user_id: user.id,
      lesson_id: lessonId,
      assessment_percentage: score,
      assessment_passed: isUnlocked,
      is_unlocked: isUnlocked,
      is_completed: true
    })

    setProgress({
      ...progress,
      [lessonId]: { completed: true, score, unlocked: isUnlocked }
    })
  }

  return (
    <TrialLearningContainer>
      {lessons.map((lesson, idx) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          progress={progress[lesson.id]}
          isLocked={idx > 0 && !progress[lessons[idx - 1].id]?.unlocked}
          onPress={() => setSelectedLesson(lesson)}
        />
      ))}
      {/* Content viewer modal */}
    </TrialLearningContainer>
  )
}
```

#### Screen 3: Trial Mock Exam
**Path:** `TrialModule/MockExam`

**Features:**
- 20 questions, 30-minute timer
- Mark for review enabled
- Answer change allowed
- Auto-submit on time limit
- Detailed results with topic breakdown

**Implementation:**
```typescript
// screens/TrialModule/TrialMockExamScreen.tsx
const TrialMockExamScreen = () => {
  const [exam, setExam] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 mins
  const [answers, setAnswers] = useState({})
  const [markedForReview, setMarkedForReview] = useState(new Set())
  const [examStarted, setExamStarted] = useState(false)

  useEffect(() => {
    loadTrialMockExam()
  }, [])

  const loadTrialMockExam = async () => {
    const { data } = await supabase
      .from('trial_mock_exams')
      .select('*')
      .eq('is_active', true)
      .single()

    setExam(data)
  }

  // Timer countdown
  useEffect(() => {
    if (!examStarted) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examStarted])

  const handleAutoSubmit = async () => {
    const correctCount = calculateCorrectAnswers()
    const percentage = (correctCount / 20) * 100

    await supabase.from('trial_exam_attempts').insert({
      user_id: user.id,
      exam_id: exam.id,
      total_questions: 20,
      correct_answers: correctCount,
      score: percentage,
      percentage_score: percentage,
      is_passed: percentage >= exam.passing_score,
      user_answers: answers,
      marked_for_review: Array.from(markedForReview),
      started_at: new Date(),
      completed_at: new Date(),
      duration_seconds: 1800 - timeRemaining,
      status: 'completed'
    })

    navigation.navigate('TrialResults', { examId: exam.id })
  }

  return (
    <TrialMockExamContainer>
      <ExamHeader
        timeRemaining={formatTime(timeRemaining)}
        currentQuestion={currentQuestion}
        totalQuestions={20}
      />
      <QuestionCard
        question={exam.questions[currentQuestion]}
        onAnswer={setAnswers}
        onMarkForReview={() => {
          setMarkedForReview(new Set([...markedForReview, currentQuestion]))
        }}
      />
      <ExamNavigation />
    </TrialMockExamContainer>
  )
}
```

#### Screen 4: Trial Results & Conversion
**Path:** `TrialModule/Results`

**Features:**
- Pass/fail status
- Score breakdown by topic
- Comparison to average user
- Detailed question review
- Upgrade CTA with benefits

---

### 4. Dashboard Trial Widget

**Component:** `TrialStatusCard`

```typescript
// components/TrialStatusCard.tsx
export const TrialStatusCard = () => {
  const [trialData, setTrialData] = useState(null)

  useEffect(() => {
    loadTrialStatus()
  }, [])

  const loadTrialStatus = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('trial_started_at, trial_expires_at')
      .eq('id', user.id)
      .single()

    setTrialData(data)
  }

  const daysRemaining = calculateDaysRemaining(trialData?.trial_expires_at)

  return (
    <TrialCard>
      <Typography variant="h6">You're on Trial Mode</Typography>
      <Typography variant="body2" color="text.secondary">
        {daysRemaining} days remaining
      </Typography>
      <Button
        label="Let's Try →"
        onPress={() => navigation.navigate('TrialModule')}
        fullWidth
      />
    </TrialCard>
  )
}
```

---

## API Endpoints

### Trial Module Endpoints

#### 1. Get Trial Questions
```
GET /api/trial/questions
Query Parameters:
  - type: 'numerical' | 'clinical'
  - limit: number (default: 6)

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "question_text": "string",
      "question_type": "numerical | clinical",
      "difficulty": "easy | medium",
      "explanation": "string"
    }
  ]
}
```

#### 2. Get Trial Lessons
```
GET /api/trial/lessons
Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "content": [
        {
          "type": "video | audio | text | flashcard | mcq",
          "url": "string",
          "data": "object"
        }
      ],
      "unlock_threshold": 60
    }
  ]
}
```

#### 3. Get Trial Mock Exam
```
GET /api/trial/mock-exam
Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "question_count": 20,
    "time_limit_minutes": 30,
    "passing_score": 50,
    "questions": [...]
  }
}
```

#### 4. Save Trial Attempt
```
POST /api/trial/attempts
Body:
{
  "user_id": "uuid",
  "module_id": "uuid",
  "content_type": "practice | learning | mock_exam",
  "answers_data": "object",
  "duration_seconds": "number",
  "score": "number",
  "status": "completed"
}

Response:
{
  "success": true,
  "data": { "attempt_id": "uuid" }
}
```

#### 5. Update Trial Learning Progress
```
POST /api/trial/learning-progress
Body:
{
  "lesson_id": "uuid",
  "assessment_score": "number",
  "assessment_passed": "boolean",
  "is_unlocked": "boolean"
}

Response:
{
  "success": true,
  "data": { "lesson_id": "uuid", "unlocked": true }
}
```

#### 6. Submit Trial Exam Attempt
```
POST /api/trial/exam-attempts
Body:
{
  "exam_id": "uuid",
  "total_questions": 20,
  "correct_answers": "number",
  "user_answers": "object",
  "marked_for_review": "array",
  "duration_seconds": "number"
}

Response:
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "score": "number",
    "is_passed": "boolean",
    "topic_breakdown": "object"
  }
}
```

#### 7. Get Trial Analytics
```
GET /api/trial/analytics/:userId
Response:
{
  "success": true,
  "data": {
    "practice_score": "number",
    "learning_progress": "number",
    "exam_score": "number",
    "completion_rate": "number",
    "trial_conversion_ready": "boolean"
  }
}
```

---

## Components & Screens

### Screen Hierarchy
```
Dashboard
├── TrialStatusCard (CTA)
└── Navigate to TrialModule
    ├── TrialPracticeScreen
    ├── TrialLearningScreen
    ├── TrialMockExamScreen
    └── TrialResultsScreen
```

### Reusable Components
```
TrialModuleNav/
├── TrialTabNav.tsx (tab navigation)
├── QuestionCard.tsx (generic question renderer)
├── ProgressBar.tsx (progress tracking)
├── UnlockThresholdCard.tsx (60% unlock visual)
└── UpgradePrompt.tsx (conversion CTA)
```

---

## State Management (Zustand Store)

```typescript
// stores/trialStore.ts
export const useTrialStore = create((set) => ({
  // Trial State
  trialStatus: null,
  currentModule: null,
  practiceScore: 0,
  learningProgress: {},
  examScore: 0,

  // Actions
  setTrialStatus: (status) => set({ trialStatus: status }),
  setCurrentModule: (module) => set({ currentModule: module }),
  updatePracticeScore: (score) => set({ practiceScore: score }),
  updateLearningProgress: (progress) => 
    set({ learningProgress: progress }),
  updateExamScore: (score) => set({ examScore: score }),

  // Computed
  isTrialComplete: (state) => 
    state.practiceScore > 0 &&
    Object.values(state.learningProgress).some(p => p.completed) &&
    state.examScore > 0,
}))
```

---

## Database Queries

### 1. Load Trial Questions
```sql
SELECT * FROM questions
WHERE is_trial_content = true
AND is_active = true
ORDER BY RANDOM()
LIMIT 6;
```

### 2. Load Trial Lessons with Content
```sql
SELECT 
  l.id, l.title, l.unlock_threshold_percentage,
  lc.id as content_id, lc.content_type, lc.content_url, lc.content_data
FROM lessons l
LEFT JOIN lesson_content lc ON l.id = lc.lesson_id
WHERE l.is_trial_content = true
AND l.is_active = true
ORDER BY l.display_order;
```

### 3. Get User Trial Progress
```sql
SELECT 
  lesson_id, is_unlocked, assessment_percentage,
  assessment_passed, is_completed
FROM trial_learning_progress
WHERE user_id = $1;
```

### 4. Save Trial Attempt
```sql
INSERT INTO trial_attempt_records (
  user_id, module_id, content_type, 
  answers_data, score, percentage_score,
  is_passed, status, started_at, completed_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id;
```

### 5. Get Trial Results Summary
```sql
SELECT 
  COUNT(*) as total_attempts,
  AVG(percentage_score) as avg_score,
  MAX(percentage_score) as best_score,
  SUM(CASE WHEN is_passed = true THEN 1 ELSE 0 END) as passed_count
FROM trial_exam_attempts
WHERE user_id = $1;
```

---

## Conversion Tracking

### Metrics to Track
1. **Trial Start Date** - When user first accesses trial
2. **Module Access Pattern** - Which sections accessed
3. **Completion Status** - Sections completed
4. **Time Spent** - Per module engagement
5. **Accuracy/Score** - Performance data
6. **Conversion Event** - When user subscribes

### Conversion Query
```sql
SELECT 
  tp.id as trial_user_id,
  MIN(tar.created_at) as first_trial_access,
  MAX(tar.created_at) as last_trial_access,
  COUNT(DISTINCT tar.id) as total_attempts,
  AVG(tar.percentage_score) as avg_score,
  s.id as subscription_id,
  s.created_at as subscription_date,
  EXTRACT(DAY FROM s.created_at - MIN(tar.created_at)) as days_to_convert
FROM user_profiles tp
LEFT JOIN trial_attempt_records tar ON tp.id = tar.user_id
LEFT JOIN subscriptions s ON tp.id = s.user_id AND s.status = 'active'
WHERE tp.subscription_status = 'trial'
GROUP BY tp.id, s.id;
```

---

## Testing Checklist

- [ ] Trial user signup flow
- [ ] Profile completion → Dashboard redirect
- [ ] "Let's Try" button visibility on course page
- [ ] Trial questions load correctly (6 questions)
- [ ] Answer tracking and immediate feedback
- [ ] Learning progress tracking (60% threshold)
- [ ] Mock exam timer and auto-submit
- [ ] Results display with breakdown
- [ ] Analytics tracking
- [ ] Upgrade CTA appears at conversion points
- [ ] Trial expiration handling

---

## Success Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Trial Signup Rate | >70% | Amplitude |
| Practice Module Completion | >50% | DB query |
| Learning Unlock Rate | >40% | DB query |
| Mock Exam Completion | >30% | DB query |
| Trial-to-Paid Conversion | >8% | DB query |
| Average Trial Duration | 5-7 days | Analytics |
| Questions Attempted | >4 per user | DB query |

---

## Troubleshooting

**Issue:** Questions not loading
- Check `is_trial_content = true` in database
- Verify RLS policies allow read access

**Issue:** Progress not saving
- Verify user authentication
- Check `trial_learning_progress` table RLS
- Ensure `lesson_id` exists in lessons table

**Issue:** Exam timer not working
- Verify `timeRemaining` state updates
- Check `setInterval` cleanup
- Validate `useEffect` dependency array

---

## Next Steps

1. Implement API endpoints in Express backend
2. Create React Native screens
3. Set up state management with Zustand
4. Add analytics tracking
5. Test full conversion flow
6. Launch A/B test for upgrade prompts
