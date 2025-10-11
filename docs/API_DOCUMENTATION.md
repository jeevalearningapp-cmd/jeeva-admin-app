# 📡 Jeeva Learning Mobile App - API Documentation

## 🔗 Supabase Backend Integration

The Jeeva Learning mobile app uses **Supabase** as its backend-as-a-service, sharing the same PostgreSQL database with the admin portal. This document provides complete API reference for all mobile app interactions.

---

## 🔑 Authentication & Setup

### Supabase Client Configuration

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Use AsyncStorage for React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

### Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔐 Authentication APIs

### Sign Up (Email/Password)

```typescript
const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  
  if (error) throw error
  
  // Create user profile after signup
  if (data.user) {
    await supabase.from('user_profiles').insert({
      user_id: data.user.id,
      full_name: fullName,
    })
  }
  
  return data
}
```

### Sign In

```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}
```

### Sign Out

```typescript
const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
```

### Get Current User

```typescript
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

### Password Reset

```typescript
const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'yourapp://reset-password',
  })
  
  if (error) throw error
  return data
}
```

### Social Authentication

```typescript
// Google Sign In
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })
  if (error) throw error
  return data
}

// Apple Sign In
const signInWithApple = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
  })
  if (error) throw error
  return data
}
```

---

## 👤 User Profile APIs

### Table: `user_profiles`

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `full_name` (TEXT)
- `phone_number` (TEXT)
- `date_of_birth` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Get User Profile

```typescript
const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}
```

### Update User Profile

```typescript
const updateUserProfile = async (userId: string, updates: {
  full_name?: string
  phone_number?: string
  date_of_birth?: string
}) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

---

## 📚 Learning Content APIs

### Table: `modules`

**Columns:**
- `id` (UUID, PK)
- `title` (TEXT)
- `description` (TEXT)
- `thumbnail_url` (TEXT)
- `is_active` (BOOLEAN)
- `display_order` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Get All Modules

```typescript
const getModules = async () => {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) throw error
  return data
}
```

### Get Module by ID

```typescript
const getModuleById = async (id: string) => {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  
  if (error) throw error
  return data
}
```

---

### Table: `topics`

**Columns:**
- `id` (UUID, PK)
- `module_id` (UUID, FK → modules.id)
- `title` (TEXT)
- `description` (TEXT)
- `is_active` (BOOLEAN)
- `display_order` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Get Topics by Module

```typescript
const getTopicsByModule = async (moduleId: string) => {
  const { data, error } = await supabase
    .from('topics')
    .select(`
      *,
      modules (
        id,
        title,
        thumbnail_url
      )
    `)
    .eq('module_id', moduleId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) throw error
  return data
}
```

---

### Table: `lessons`

**Columns:**
- `id` (UUID, PK)
- `topic_id` (UUID, FK → topics.id)
- `title` (TEXT)
- `content` (TEXT)
- `video_url` (TEXT, nullable)
- `audio_url` (TEXT, nullable)
- `duration` (INTEGER, nullable)
- `is_active` (BOOLEAN)
- `display_order` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Get Lessons by Topic

```typescript
const getLessonsByTopic = async (topicId: string) => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      topics (
        id,
        title,
        module_id
      )
    `)
    .eq('topic_id', topicId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) throw error
  return data
}
```

### Get Single Lesson with Details

```typescript
const getLessonById = async (lessonId: string) => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      topics (
        id,
        title,
        module_id,
        modules (
          id,
          title
        )
      )
    `)
    .eq('id', lessonId)
    .eq('is_active', true)
    .single()
  
  if (error) throw error
  return data
}
```

---

### Table: `questions`

**Columns:**
- `id` (UUID, PK)
- `lesson_id` (UUID, FK → lessons.id, nullable)
- `question_text` (TEXT)
- `question_type` (TEXT: 'multiple_choice' | 'true_false' | 'short_answer')
- `difficulty` (TEXT: 'easy' | 'medium' | 'hard')
- `points` (INTEGER)
- `explanation` (TEXT, nullable)
- `image_url` (TEXT, nullable)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Table: `question_options`

**Columns:**
- `id` (UUID, PK)
- `question_id` (UUID, FK → questions.id)
- `option_text` (TEXT)
- `is_correct` (BOOLEAN)
- `display_order` (INTEGER)

### Get Questions by Lesson

```typescript
const getQuestionsByLesson = async (lessonId: string) => {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options (
        id,
        option_text,
        is_correct,
        display_order
      )
    `)
    .eq('lesson_id', lessonId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}
```

### Get Questions by Topic (for Practice)

```typescript
const getQuestionsByTopic = async (topicId: string, limit: number = 10) => {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options (*),
      lessons!inner (
        topic_id
      )
    `)
    .eq('lessons.topic_id', topicId)
    .eq('is_active', true)
    .limit(limit)
  
  if (error) throw error
  return data
}
```

---

### Table: `flashcards`

**Columns:**
- `id` (UUID, PK)
- `lesson_id` (UUID, FK → lessons.id)
- `front` (TEXT)
- `back` (TEXT)
- `image_url` (TEXT, nullable)
- `is_active` (BOOLEAN)
- `display_order` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Get Flashcards by Lesson

```typescript
const getFlashcardsByLesson = async (lessonId: string) => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) throw error
  return data
}
```

### Get Flashcards by Topic

```typescript
const getFlashcardsByTopic = async (topicId: string) => {
  const { data, error } = await supabase
    .from('flashcards')
    .select(`
      *,
      lessons!inner (
        topic_id
      )
    `)
    .eq('lessons.topic_id', topicId)
    .eq('is_active', true)
  
  if (error) throw error
  return data
}
```

---

## 📊 Progress Tracking APIs

### Table: `learning_completions`

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `lesson_id` (UUID, FK → lessons.id)
- `completed_at` (TIMESTAMP)

### Mark Lesson as Complete

```typescript
const markLessonComplete = async (userId: string, lessonId: string) => {
  const { data, error } = await supabase
    .from('learning_completions')
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

### Get User's Completed Lessons

```typescript
const getCompletedLessons = async (userId: string) => {
  const { data, error } = await supabase
    .from('learning_completions')
    .select(`
      *,
      lessons (
        id,
        title,
        topic_id,
        topics (
          id,
          title,
          module_id
        )
      )
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

### Check if Lesson is Completed

```typescript
const isLessonCompleted = async (userId: string, lessonId: string) => {
  const { data, error } = await supabase
    .from('learning_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()
  
  if (error) throw error
  return !!data
}
```

### Get Topic Progress

```typescript
const getTopicProgress = async (userId: string, topicId: string) => {
  // Get total lessons in topic
  const { data: totalLessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id')
    .eq('topic_id', topicId)
    .eq('is_active', true)
  
  if (lessonsError) throw lessonsError
  
  // Get completed lessons in topic
  const { data: completedLessons, error: completedError } = await supabase
    .from('learning_completions')
    .select(`
      lesson_id,
      lessons!inner (
        topic_id
      )
    `)
    .eq('user_id', userId)
    .eq('lessons.topic_id', topicId)
  
  if (completedError) throw completedError
  
  return {
    total: totalLessons.length,
    completed: completedLessons.length,
    percentage: (completedLessons.length / totalLessons.length) * 100,
  }
}
```

---

## 🎯 Practice & Exam APIs

### Table: `practice_sessions`

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Table: `practice_results`

**Columns:**
- `id` (UUID, PK)
- `session_id` (UUID, FK → practice_sessions.id)
- `answer_log` (JSONB)

### Start Practice Session

```typescript
const startPracticeSession = async (userId: string) => {
  const { data, error } = await supabase
    .from('practice_sessions')
    .insert({
      user_id: userId,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

### Save Practice Results

```typescript
interface PracticeAnswer {
  questionId: string
  selectedOptionId: string
  isCorrect: boolean
  timeTaken: number // seconds
}

const savePracticeResults = async (
  sessionId: string, 
  answers: PracticeAnswer[]
) => {
  const { data, error } = await supabase
    .from('practice_results')
    .insert({
      session_id: sessionId,
      answer_log: answers,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

### Get User Practice History

```typescript
const getPracticeHistory = async (userId: string, limit: number = 20) => {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select(`
      *,
      practice_results (
        answer_log
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}
```

---

### Table: `mock_exams`

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `exam_data` (JSONB)
- `created_at` (TIMESTAMP)

### Table: `mock_exam_results`

**Columns:**
- `id` (UUID, PK)
- `exam_id` (UUID, FK → mock_exams.id)
- `results_data` (JSONB)

### Start Mock Exam

```typescript
interface MockExamData {
  topicId: string
  questionIds: string[]
  duration: number // minutes
}

const startMockExam = async (userId: string, examData: MockExamData) => {
  const { data, error } = await supabase
    .from('mock_exams')
    .insert({
      user_id: userId,
      exam_data: examData,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

### Submit Mock Exam

```typescript
interface MockExamResults {
  score: number
  totalQuestions: number
  correctAnswers: number
  timeTaken: number
  answers: PracticeAnswer[]
}

const submitMockExam = async (examId: string, results: MockExamResults) => {
  const { data, error } = await supabase
    .from('mock_exam_results')
    .insert({
      exam_id: examId,
      results_data: results,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

### Get Mock Exam History

```typescript
const getMockExamHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('mock_exams')
    .select(`
      *,
      mock_exam_results (
        results_data
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

---

## 💳 Subscription APIs

### Table: `subscription_plans`

**Columns:**
- `id` (UUID, PK)
- `name` (TEXT)
- `description` (TEXT)
- `price` (NUMERIC)
- `billing_cycle` (TEXT: 'monthly' | 'yearly' | 'lifetime')
- `features` (TEXT[])
- `max_users` (INTEGER, nullable)
- `is_active` (BOOLEAN)
- `display_order` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Get Subscription Plans

```typescript
const getSubscriptionPlans = async () => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) throw error
  return data
}
```

---

### Table: `subscriptions`

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `plan_id` (UUID, FK → subscription_plans.id)
- `status` (TEXT: 'active' | 'cancelled' | 'expired' | 'trial')
- `start_date` (TEXT)
- `end_date` (TEXT, nullable)
- `auto_renew` (BOOLEAN)
- `payment_method` (TEXT, nullable)
- `last_payment_date` (TEXT, nullable)
- `next_payment_date` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Get User Subscription

```typescript
const getUserSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      subscription_plans (
        id,
        name,
        description,
        price,
        billing_cycle,
        features
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()
  
  if (error) throw error
  return data
}
```

### Check if User has Premium Access

```typescript
const hasPremiumAccess = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()
  
  if (error) throw error
  return !!data
}
```

---

## 🤖 AI Recommendations

### Table: `ai_recommendations`

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `recommendation_data` (JSONB)
- `created_at` (TIMESTAMP)

### Get AI Recommendations

```typescript
const getAIRecommendations = async (userId: string) => {
  const { data, error } = await supabase
    .from('ai_recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (error) throw error
  return data
}
```

### Generate AI Recommendation

```typescript
interface RecommendationData {
  type: 'weak_topic' | 'next_lesson' | 'practice_suggestion'
  topicId: string
  reason: string
  confidence: number
}

const saveAIRecommendation = async (
  userId: string, 
  recommendation: RecommendationData
) => {
  const { data, error } = await supabase
    .from('ai_recommendations')
    .insert({
      user_id: userId,
      recommendation_data: recommendation,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

---

## 📈 Analytics & Stats

### Get User Statistics

```typescript
const getUserStats = async (userId: string) => {
  // Total lessons completed
  const { count: lessonsCompleted } = await supabase
    .from('learning_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  // Total practice sessions
  const { count: practiceSessions } = await supabase
    .from('practice_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  // Total mock exams
  const { count: mockExams } = await supabase
    .from('mock_exams')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  return {
    lessonsCompleted: lessonsCompleted || 0,
    practiceSessions: practiceSessions || 0,
    mockExams: mockExams || 0,
  }
}
```

### Get Learning Streak

```typescript
const getLearningStreak = async (userId: string) => {
  const { data, error } = await supabase
    .from('learning_completions')
    .select('completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
  
  if (error) throw error
  
  // Calculate streak from completed_at dates
  let streak = 0
  let currentDate = new Date()
  
  for (const completion of data) {
    const completionDate = new Date(completion.completed_at)
    const daysDiff = Math.floor(
      (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysDiff === streak) {
      streak++
      currentDate = completionDate
    } else {
      break
    }
  }
  
  return streak
}
```

---

## 📦 Storage APIs

### Upload Profile Picture

```typescript
const uploadProfilePicture = async (userId: string, file: File) => {
  const fileName = `${userId}/${Date.now()}.jpg`
  
  const { data, error } = await supabase.storage
    .from('profile-pictures')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })
  
  if (error) throw error
  
  const { data: urlData } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(fileName)
  
  return urlData.publicUrl
}
```

### Get Lesson Media URL

```typescript
const getLessonMediaUrl = (path: string) => {
  const { data } = supabase.storage
    .from('lesson-media')
    .getPublicUrl(path)
  
  return data.publicUrl
}
```

---

## 🔄 Real-time Subscriptions

### Subscribe to Lesson Updates

```typescript
const subscribeLessonUpdates = (topicId: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('lesson-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lessons',
        filter: `topic_id=eq.${topicId}`,
      },
      callback
    )
    .subscribe()
  
  return subscription
}
```

### Subscribe to User Progress

```typescript
const subscribeUserProgress = (userId: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('user-progress')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'learning_completions',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
  
  return subscription
}
```

### Unsubscribe

```typescript
const unsubscribe = (subscription: any) => {
  supabase.removeChannel(subscription)
}
```

---

## 🔒 Row Level Security (RLS) Policies

### Users can only access their own data:

**Tables with Self-Access Only:**
- `user_profiles` - Users can read/update their own profile
- `subscriptions` - Users can view their own subscriptions
- `practice_sessions` - Users can access only their sessions
- `learning_completions` - Users can track only their progress
- `ai_recommendations` - Users see only their recommendations

**Public Read Tables:**
- `modules` - Everyone can read active modules
- `topics` - Everyone can read active topics
- `lessons` - Everyone can read active lessons
- `questions` - Everyone can read active questions
- `flashcards` - Everyone can read active flashcards
- `subscription_plans` - Everyone can view available plans

**Write Restrictions:**
- Content tables (modules, topics, lessons, etc.) - Read-only for students
- Only admin users can create/update/delete content
- Students can only INSERT their own progress, practice, and exam records

---

## 📊 TypeScript Types

### User Types

```typescript
interface User {
  id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: string
  user_id: string
  full_name: string
  phone_number?: string
  date_of_birth?: string
  created_at: string
  updated_at: string
}
```

### Content Types

```typescript
interface Module {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface Topic {
  id: string
  module_id: string
  title: string
  description: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface Lesson {
  id: string
  topic_id: string
  title: string
  content: string
  video_url?: string
  audio_url?: string
  duration?: number
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface Question {
  id: string
  lesson_id?: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  explanation?: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  options?: QuestionOption[]
}

interface QuestionOption {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  display_order: number
}

interface Flashcard {
  id: string
  lesson_id: string
  front: string
  back: string
  image_url?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}
```

### Progress Types

```typescript
interface LearningCompletion {
  id: string
  user_id: string
  lesson_id: string
  completed_at: string
}

interface PracticeSession {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

interface MockExam {
  id: string
  user_id: string
  exam_data: {
    topicId: string
    questionIds: string[]
    duration: number
  }
  created_at: string
}
```

### Subscription Types

```typescript
interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  billing_cycle: 'monthly' | 'yearly' | 'lifetime'
  features: string[]
  max_users?: number
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  start_date: string
  end_date?: string
  auto_renew: boolean
  payment_method?: string
  last_payment_date?: string
  next_payment_date?: string
  created_at: string
  updated_at: string
}
```

---

## 🤖 AI & Chat APIs (Phase 1)

### Overview

The JeevaBot chatbot uses Google's Gemini AI Studio API for conversational AI support. All chat data is stored in Supabase for history and context.

---

### Chat Conversations

#### Get User Conversations

```typescript
const getUserConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

**Response:**
```typescript
interface ChatConversation {
  id: string
  user_id: string
  title: string
  context_data: {
    currentLesson?: {
      id: string
      title: string
      moduleId: string
    }
    userLevel?: string
    recentTopics?: string[]
  }
  created_at: string
  updated_at: string
}
```

---

#### Create Conversation

```typescript
const createConversation = async (userId: string, title: string = 'New Conversation') => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      user_id: userId,
      title,
      context_data: {}
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

---

#### Get Conversation Messages

```typescript
const getConversationMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}
```

**Response:**
```typescript
interface ChatMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: {
    model?: string
    tokensUsed?: number
    responseTime?: number
    confidenceScore?: number
  }
  created_at: string
}
```

---

#### Send Message

```typescript
import { getModelResponse } from '@/lib/gemini'
import { buildChatContext } from '@/utils/chatContext'

const sendMessage = async (
  conversationId: string,
  userId: string,
  content: string
) => {
  // 1. Save user message
  const { data: userMsg, error: userError } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content
    })
    .select()
    .single()
  
  if (userError) throw userError
  
  // 2. Build context from user data
  const context = await buildChatContext(userId)
  
  // 3. Get conversation history
  const history = await getConversationMessages(conversationId)
  const conversationHistory = history.map(m => ({
    role: m.role,
    content: m.content
  }))
  
  // 4. Call Gemini API
  const aiResponse = await getModelResponse(
    `${context}\n\nStudent Question: ${content}`,
    conversationHistory
  )
  
  // 5. Save AI response
  const { data: aiMsg, error: aiError } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: aiResponse,
      metadata: {
        model: 'gemini-1.5-flash',
        tokensUsed: Math.ceil(aiResponse.length / 4),
        responseTime: 0 // Populate from actual timing
      }
    })
    .select()
    .single()
  
  if (aiError) throw aiError
  
  return { userMsg, aiMsg }
}
```

---

### AI Usage Tracking

#### Check Daily Message Limit

```typescript
const checkMessageLimit = async (userId: string): Promise<boolean> => {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('ai_usage_stats')
    .select('message_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  
  const maxMessages = 50 // Daily limit
  const currentCount = data?.message_count || 0
  
  return currentCount < maxMessages
}
```

---

#### Update Usage Stats

```typescript
const updateUsageStats = async (userId: string, tokensUsed: number = 0) => {
  const today = new Date().toISOString().split('T')[0]
  
  await supabase.rpc('increment_ai_usage', {
    p_user_id: userId,
    p_date: today,
    p_message_count: 1,
    p_tokens: tokensUsed
  })
}
```

**Database Function:**
```sql
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id UUID,
  p_date DATE,
  p_message_count INTEGER DEFAULT 1,
  p_tokens INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_usage_stats (user_id, date, message_count, total_tokens)
  VALUES (p_user_id, p_date, p_message_count, p_tokens)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    message_count = ai_usage_stats.message_count + p_message_count,
    total_tokens = ai_usage_stats.total_tokens + p_tokens,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

---

#### Get Usage Stats

```typescript
const getUserUsageStats = async (userId: string, days: number = 30) => {
  const { data, error } = await supabase
    .from('ai_usage_stats')
    .select('*')
    .eq('user_id', userId)
    .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('date', { ascending: false })
  
  if (error) throw error
  return data
}
```

**Response:**
```typescript
interface AIUsageStats {
  id: string
  user_id: string
  date: string
  message_count: number
  total_tokens: number
  created_at: string
  updated_at: string
}
```

---

### Gemini AI Integration

#### Initialize Gemini Client

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''  // Backend only!

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export const chatModel = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
})
```

---

#### Get AI Response

```typescript
export const getModelResponse = async (
  prompt: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<string> => {
  try {
    const chat = chatModel.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    })

    const result = await chat.sendMessage(prompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API Error:', error)
    
    // Fallback response
    return "I'm having trouble connecting right now. Please try again in a moment."
  }
}
```

---

#### Build User Context

```typescript
export const buildChatContext = async (userId: string): Promise<string> => {
  // Get user's current lesson
  const { data: currentLesson } = await supabase
    .from('learning_completions')
    .select('lesson:lessons(*), module:modules(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  // Get recent practice performance
  const { data: recentPractice } = await supabase
    .from('practice_sessions')
    .select('score, topic:topics(title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Build context string
  let context = `You are JeevaBot, an AI tutor for medical exam preparation.

Student Context:
`

  if (currentLesson) {
    context += `- Currently studying: ${currentLesson.lesson?.title} in ${currentLesson.module?.title}\n`
  }

  if (recentPractice && recentPractice.length > 0) {
    context += `- Recent practice scores:\n`
    recentPractice.forEach(p => {
      context += `  * ${p.topic?.title}: ${p.score}%\n`
    })
  }

  context += `
Instructions:
1. Provide clear, concise explanations suitable for medical students
2. Reference the student's current lesson when relevant
3. If the student is struggling (low scores), offer encouraging support
4. Use simple language and break down complex concepts
5. Suggest relevant practice topics when appropriate
6. Keep responses under 200 words unless detailed explanation is requested

Remember: You're a supportive tutor, not just an information source.`

  return context
}
```

---

### React Hook Example

```typescript
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getModelResponse } from '@/lib/gemini'
import { buildChatContext } from '@/utils/chatContext'

export const useChatbot = (conversationId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string, userId: string) => {
    if (!userId || !content.trim()) return

    setLoading(true)
    setError(null)

    try {
      // Check rate limit
      const canSend = await checkMessageLimit(userId)
      if (!canSend) {
        throw new Error('Daily message limit reached')
      }

      // Create/get conversation
      let convId = conversationId
      if (!convId) {
        const conv = await createConversation(userId, content.substring(0, 50))
        convId = conv.id
      }

      // Send message and get response
      const { userMsg, aiMsg } = await sendMessage(convId, userId, content)

      // Update UI
      setMessages(prev => [...prev, userMsg, aiMsg])

      // Track usage
      await updateUsageStats(userId, aiMsg.metadata?.tokensUsed)

    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  return { messages, loading, error, sendMessage }
}
```

---

### Error Handling

```typescript
// Graceful degradation when AI fails
const getAIResponseWithFallback = async (prompt: string): Promise<string> => {
  try {
    return await getModelResponse(prompt)
  } catch (error) {
    console.error('AI Error:', error)
    
    // Return helpful fallback message
    return `I'm currently experiencing technical difficulties. Here are some alternatives:
    
1. Check the lesson content for answers
2. Review practice question explanations
3. Contact support for personalized help
4. Try again in a few moments

Sorry for the inconvenience!`
  }
}
```

---

## 🚀 Quick Start Example

```typescript
import { supabase } from './lib/supabase'

// Complete learning flow example
const learningFlow = async (userId: string) => {
  // 1. Get available modules
  const modules = await getModules()
  
  // 2. Select first module and get topics
  const topics = await getTopicsByModule(modules[0].id)
  
  // 3. Get lessons for first topic
  const lessons = await getLessonsByTopic(topics[0].id)
  
  // 4. Get lesson content
  const lesson = await getLessonById(lessons[0].id)
  
  // 5. Mark lesson as complete
  await markLessonComplete(userId, lesson.id)
  
  // 6. Get practice questions
  const questions = await getQuestionsByLesson(lesson.id)
  
  // 7. Start practice session
  const session = await startPracticeSession(userId)
  
  // 8. Save practice results
  await savePracticeResults(session.id, [
    {
      questionId: questions[0].id,
      selectedOptionId: questions[0].options[0].id,
      isCorrect: questions[0].options[0].is_correct,
      timeTaken: 30,
    },
  ])
  
  // 9. Check progress
  const progress = await getTopicProgress(userId, topics[0].id)
  console.log(`Progress: ${progress.percentage}%`)
}
```

---

## 📝 Best Practices

### 1. **Error Handling**
```typescript
try {
  const data = await getModules()
  return data
} catch (error) {
  console.error('Failed to fetch modules:', error)
  throw error
}
```

### 2. **Caching with React Query**
```typescript
import { useQuery } from '@tanstack/react-query'

const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: getModules,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### 3. **Pagination**
```typescript
const getLessonsPaginated = async (topicId: string, page: number, limit: number) => {
  const from = page * limit
  const to = from + limit - 1
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('topic_id', topicId)
    .range(from, to)
  
  if (error) throw error
  return data
}
```

### 4. **Optimistic Updates**
```typescript
const markComplete = async (userId: string, lessonId: string) => {
  // Update UI immediately
  queryClient.setQueryData(['completions', userId], (old: any) => [
    ...old,
    { lesson_id: lessonId, completed_at: new Date().toISOString() },
  ])
  
  // Then update server
  await markLessonComplete(userId, lessonId)
}
```

---

## 🔗 Related Documentation

- [Mobile App Overview](./MOBILE_APP_OVERVIEW.md)
- [Database Schema](./DATABASE_SCHEMA.md) (Next to create)
- [Authentication Flow](./AUTHENTICATION_FLOW.md) (Next to create)

---

**Last Updated**: October 11, 2025  
**Developer**: vollstek@gmail.com
