# Mobile App API Documentation

## 📡 API Endpoints Reference

This document provides complete API documentation for the mobile app to interact with the new Learning Module system.

---

## 🔐 Authentication

All API requests require authentication using Supabase JWT token.

```typescript
import { supabase } from '@/lib/supabase';

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// All subsequent API calls automatically include auth token
```

---

## 📚 Learning Module APIs

### 1. Topics API

#### Get All Topics
```typescript
GET /topics

// Implementation
const { data, error } = await supabase
  .from('topics')
  .select('*')
  .eq('is_active', true)
  .order('display_order', { ascending: true });

// Response
{
  id: string;
  module_id: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}[]
```

#### Get Topic by ID
```typescript
GET /topics/:id

// Implementation
const { data, error } = await supabase
  .from('topics')
  .select('*')
  .eq('id', topicId)
  .single();

// Response
{
  id: string;
  module_id: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

---

### 2. Core Notes API

#### Get Core Notes by Topic ID
```typescript
GET /topic_core_notes?topic_id=:topicId

// Implementation
const { data, error } = await supabase
  .from('topic_core_notes')
  .select('*')
  .eq('topic_id', topicId)
  .eq('is_active', true)
  .single();

// Response
{
  id: string;
  topic_id: string;
  content: string;           // HTML content
  sections: {                // JSONB array
    title: string;
    content: string;         // HTML content
    order: number;
  }[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Error Handling
if (error && error.code === 'PGRST116') {
  // No core notes found for this topic
  return null;
}
```

---

### 3. Flash Content API

#### Get Flash Content by Topic ID
```typescript
GET /topic_flash_content?topic_id=:topicId

// Implementation
const { data, error } = await supabase
  .from('topic_flash_content')
  .select('*')
  .eq('topic_id', topicId)
  .eq('is_active', true)
  .order('screen_number', { ascending: true });

// Response (Always 5 screens)
{
  id: string;
  topic_id: string;
  screen_number: number;     // 1-5
  title: string;
  content: string;           // HTML content
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}[]

// Validation
if (data.length !== 5) {
  throw new Error('Invalid flash content: must have exactly 5 screens');
}
```

---

### 4. Subtopics API

#### Get Subtopics by Topic ID
```typescript
GET /lessons?topic_id=:topicId

// Implementation
const { data, error } = await supabase
  .from('lessons')
  .select('*')
  .eq('topic_id', topicId)
  .eq('is_active', true)
  .order('display_order', { ascending: true });

// Response
{
  id: string;
  topic_id: string;
  title: string;
  content: string;           // Description
  video_url: string | null;  // Mandatory
  podcast_url: string | null; // Optional
  duration: number;          // In seconds
  is_mandatory: boolean;     // true for video, false for podcast
  content_type: 'video' | 'audio' | 'text';
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}[]
```

#### Get Subtopic by ID
```typescript
GET /lessons/:id

// Implementation
const { data, error } = await supabase
  .from('lessons')
  .select('*')
  .eq('id', subtopicId)
  .single();

// Response: Same as above (single object)
```

---

### 5. Learning Questions API

#### Get Questions by Subtopic ID
```typescript
GET /learning_questions?subtopic_id=:subtopicId

// Implementation
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

// Response
{
  id: string;
  topic_id: string;
  subtopic_id: string;
  video_lesson_id: string;   // FK to lessons table
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  explanation: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  learning_question_options: {
    id: string;
    option_text: string;
    is_correct: boolean;
    display_order: number;
  }[];
}[]

// Validation
if (data.length < 5 || data.length > 10) {
  console.warn('Invalid question count: should be 5-10');
}
```

#### Submit Answer
```typescript
POST /learning_question_options/:optionId/validate

// Implementation
const { data: option, error } = await supabase
  .from('learning_question_options')
  .select('is_correct')
  .eq('id', selectedOptionId)
  .single();

const { data: question, error: qError } = await supabase
  .from('learning_questions')
  .select('explanation')
  .eq('id', questionId)
  .single();

// Response
{
  isCorrect: boolean;
  explanation: string;
}
```

---

## 🎯 Practice Module APIs

### 6. Practice Questions API

#### Get Questions by Category and Subdivision
```typescript
GET /practice_questions?category=:category&subdivision=:subdivision

// Implementation
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

// Parameters
category: 'Numeracy' | 'Clinical Knowledge'
subdivision: string (e.g., 'Dosage Calculations')

// Response
{
  id: string;
  category: string;
  subdivision: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  explanation: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  practice_question_options: {
    id: string;
    option_text: string;
    is_correct: boolean;
    display_order: number;
  }[];
}[]
```

#### Get All Subdivisions by Category
```typescript
GET /practice_questions?category=:category&select=subdivision

// Implementation
const { data, error } = await supabase
  .from('practice_questions')
  .select('subdivision')
  .eq('category', category)
  .eq('is_active', true);

// Get unique subdivisions
const uniqueSubdivisions = [...new Set(data.map(d => d.subdivision))];

// Response
string[] // Array of subdivision names
```

---

## 🎓 Mock Exam APIs

### 7. Mock Exam Questions API

#### Get Questions by Exam Part
```typescript
GET /mock_exam_questions?exam_part=:examPart

// Implementation
const { data, error } = await supabase
  .from('mock_exam_questions')
  .select(`
    *,
    mock_exam_question_options (
      id,
      option_text,
      is_correct,
      display_order
    )
  `)
  .eq('exam_part', examPart)
  .eq('is_active', true);

// Parameters
examPart: 'part_a' | 'part_b'

// Response
{
  id: string;
  exam_part: 'part_a' | 'part_b';
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  explanation: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  mock_exam_question_options: {
    id: string;
    option_text: string;
    is_correct: boolean;
    display_order: number;
  }[];
}[]

// Expected Counts
// Part A: 15 questions (Numeracy)
// Part B: 120 questions (Clinical)
```

---

## 📊 Progress Tracking APIs

### 8. Topic Progress API

#### Get Topic Progress
```typescript
GET /topic_progress?user_id=:userId&topic_id=:topicId

// Implementation
const { data, error } = await supabase
  .from('topic_progress')
  .select('*')
  .eq('user_id', userId)
  .eq('topic_id', topicId)
  .single();

// Response
{
  id: string;
  user_id: string;
  topic_id: string;
  core_notes_completed: boolean;
  flash_content_completed: boolean;
  progress_percentage: number; // 0-100
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Error Handling
if (error && error.code === 'PGRST116') {
  // No progress found - user hasn't started this topic
  return null;
}
```

#### Create/Update Topic Progress
```typescript
POST /topic_progress

// Implementation
const { data, error } = await supabase
  .from('topic_progress')
  .upsert({
    user_id: userId,
    topic_id: topicId,
    core_notes_completed: true,
    flash_content_completed: false,
    progress_percentage: 30,
  }, {
    onConflict: 'user_id,topic_id'
  })
  .select()
  .single();

// Response: Same as GET
```

#### Mark Core Notes Completed
```typescript
PATCH /topic_progress

// Implementation
const { data, error } = await supabase
  .from('topic_progress')
  .update({ core_notes_completed: true })
  .eq('user_id', userId)
  .eq('topic_id', topicId)
  .select()
  .single();
```

#### Mark Flash Content Completed
```typescript
PATCH /topic_progress

// Implementation
const { data, error } = await supabase
  .from('topic_progress')
  .update({ flash_content_completed: true })
  .eq('user_id', userId)
  .eq('topic_id', topicId)
  .select()
  .single();
```

---

### 9. Subtopic Progress API

#### Get Subtopic Progress
```typescript
GET /subtopic_progress?user_id=:userId&subtopic_id=:subtopicId

// Implementation
const { data, error } = await supabase
  .from('subtopic_progress')
  .select('*')
  .eq('user_id', userId)
  .eq('subtopic_id', subtopicId)
  .single();

// Response
{
  id: string;
  user_id: string;
  topic_id: string;
  subtopic_id: string;
  status: 'locked' | 'in_progress' | 'completed';
  score: number | null;        // 0-100
  best_score: number | null;   // 0-100
  attempts: number;
  time_spent_seconds: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Error Handling
if (error && error.code === 'PGRST116') {
  // No progress found - subtopic is locked
  return { status: 'locked' };
}
```

#### Create/Update Subtopic Progress
```typescript
POST /subtopic_progress

// Implementation
const { data, error } = await supabase
  .from('subtopic_progress')
  .upsert({
    user_id: userId,
    topic_id: topicId,
    subtopic_id: subtopicId,
    status: 'in_progress',
    score: 85,
    best_score: 85,
    attempts: 1,
    time_spent_seconds: 1200,
    completed_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id,subtopic_id'
  })
  .select()
  .single();

// Response: Same as GET
```

#### Update Status Only
```typescript
PATCH /subtopic_progress

// Implementation
const { data, error } = await supabase
  .from('subtopic_progress')
  .update({ status: 'in_progress' })
  .eq('user_id', userId)
  .eq('subtopic_id', subtopicId)
  .select()
  .single();
```

#### Update Score and Attempts
```typescript
PATCH /subtopic_progress

// Implementation
// Get current progress first
const { data: current } = await supabase
  .from('subtopic_progress')
  .select('best_score, attempts')
  .eq('user_id', userId)
  .eq('subtopic_id', subtopicId)
  .single();

// Update with new score
const newBestScore = Math.max(newScore, current?.best_score || 0);
const newAttempts = (current?.attempts || 0) + 1;

const { data, error } = await supabase
  .from('subtopic_progress')
  .update({
    score: newScore,
    best_score: newBestScore,
    attempts: newAttempts,
    status: newScore >= 80 ? 'completed' : 'in_progress',
    completed_at: newScore >= 80 ? new Date().toISOString() : null,
  })
  .eq('user_id', userId)
  .eq('subtopic_id', subtopicId)
  .select()
  .single();
```

#### Get All Subtopic Progress for Topic
```typescript
GET /subtopic_progress?user_id=:userId&topic_id=:topicId

// Implementation
const { data, error } = await supabase
  .from('subtopic_progress')
  .select('*')
  .eq('user_id', userId)
  .eq('topic_id', topicId)
  .order('created_at', { ascending: true });

// Response: Array of subtopic progress objects
```


---

## 🔄 Common API Patterns

### Error Handling

```typescript
try {
  const { data, error } = await supabase
    .from('table_name')
    .select('*');

  if (error) {
    // Handle specific errors
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('Record already exists');
    }
    // Generic error
    throw error;
  }

  return data;
} catch (error) {
  console.error('API Error:', error);
  throw error;
}
```

### Pagination

```typescript
// Get paginated results
const PAGE_SIZE = 20;
const page = 1;

const { data, error, count } = await supabase
  .from('table_name')
  .select('*', { count: 'exact' })
  .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

// Calculate total pages
const totalPages = Math.ceil(count / PAGE_SIZE);
```

### Filtering

```typescript
// Multiple filters
const { data, error } = await supabase
  .from('learning_questions')
  .select('*')
  .eq('subtopic_id', subtopicId)
  .eq('is_active', true)
  .in('difficulty', ['easy', 'medium'])
  .order('created_at', { ascending: true });
```

### Joins

```typescript
// Get questions with options
const { data, error } = await supabase
  .from('learning_questions')
  .select(`
    *,
    learning_question_options (*)
  `)
  .eq('subtopic_id', subtopicId);

// Get subtopics with progress
const { data, error } = await supabase
  .from('lessons')
  .select(`
    *,
    subtopic_progress!subtopic_id (
      status,
      score,
      best_score
    )
  `)
  .eq('topic_id', topicId)
  .eq('subtopic_progress.user_id', userId);
```

---

## 📈 Progress Calculation Logic

### Calculate Topic Progress Percentage

```typescript
async function calculateTopicProgress(
  userId: string,
  topicId: string
): Promise<number> {
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

  // Count completed subtopics
  const completedCount = progressData?.filter(
    p => p.status === 'completed'
  ).length || 0;

  // Calculate percentage
  const percentage = Math.round((completedCount / subtopics.length) * 100);

  // Update topic progress
  await supabase
    .from('topic_progress')
    .upsert({
      user_id: userId,
      topic_id: topicId,
      progress_percentage: percentage,
      completed_at: percentage === 100 ? new Date().toISOString() : null,
    }, {
      onConflict: 'user_id,topic_id'
    });

  return percentage;
}
```

### Check if Subtopic is Unlocked

```typescript
async function isSubtopicUnlocked(
  userId: string,
  topicId: string,
  subtopicId: string
): Promise<boolean> {
  // Get all subtopics for this topic in order
  const { data: subtopics } = await supabase
    .from('lessons')
    .select('id')
    .eq('topic_id', topicId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (!subtopics) return false;

  // Find index of current subtopic
  const currentIndex = subtopics.findIndex(s => s.id === subtopicId);
  
  // First subtopic is always unlocked
  if (currentIndex === 0) return true;

  // Check if previous subtopic is completed
  const previousSubtopicId = subtopics[currentIndex - 1].id;
  
  const { data: previousProgress } = await supabase
    .from('subtopic_progress')
    .select('status')
    .eq('user_id', userId)
    .eq('subtopic_id', previousSubtopicId)
    .single();

  return previousProgress?.status === 'completed';
}
```

### Calculate Quiz Score

```typescript
function calculateQuizScore(
  correctAnswers: number,
  totalQuestions: number
): number {
  return Math.round((correctAnswers / totalQuestions) * 100);
}

function isQuizPassed(score: number): boolean {
  return score >= 80; // 80% passing threshold
}
```

---

## 🔒 Row Level Security (RLS)

### User Access Rules

**Users can**:
- ✅ Read all active content (topics, core notes, flash content, subtopics, questions)
- ✅ Read/write their own progress data
- ❌ Cannot read other users' progress
- ❌ Cannot modify content

**Admins can**:
- ✅ Read all content
- ✅ Read all users' progress (for analytics)
- ✅ Modify content (via admin portal)

### RLS Policies Applied

All tables have RLS enabled with appropriate policies:

```sql
-- Users can read active content
CREATE POLICY "Users can view active content"
ON learning_questions FOR SELECT
USING (is_active = true);

-- Users can only access their own progress
CREATE POLICY "Users can view their own progress"
ON subtopic_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON subtopic_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all progress"
ON subtopic_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);
```

---

## 🚨 Error Codes Reference

### Supabase Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `PGRST116` | Not found | Return null or default value |
| `23505` | Unique constraint violation | Show "Already exists" error |
| `23503` | Foreign key violation | Show "Invalid reference" error |
| `42501` | Insufficient privileges | Show "Access denied" error |
| `PGRST301` | Row level security violation | Show "Access denied" error |

### Custom Error Handling

```typescript
export class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleSupabaseError(error: any): APIError {
  switch (error.code) {
    case 'PGRST116':
      return new APIError('NOT_FOUND', 'Resource not found');
    case '23505':
      return new APIError('DUPLICATE', 'Record already exists');
    case '23503':
      return new APIError('INVALID_REFERENCE', 'Invalid reference');
    case '42501':
    case 'PGRST301':
      return new APIError('ACCESS_DENIED', 'Access denied');
    default:
      return new APIError('UNKNOWN', error.message, error);
  }
}
```

---

## 📝 API Usage Examples

### Complete Learning Module Flow

```typescript
// 1. Get topic
const topic = await supabase
  .from('topics')
  .select('*')
  .eq('id', topicId)
  .single();

// 2. Get topic progress
const topicProgress = await supabase
  .from('topic_progress')
  .select('*')
  .eq('user_id', userId)
  .eq('topic_id', topicId)
  .single();

// 3. Get core notes
const coreNotes = await supabase
  .from('topic_core_notes')
  .select('*')
  .eq('topic_id', topicId)
  .single();

// 4. Mark core notes as completed
await supabase
  .from('topic_progress')
  .upsert({
    user_id: userId,
    topic_id: topicId,
    core_notes_completed: true,
  }, { onConflict: 'user_id,topic_id' });

// 5. Get flash content
const flashContent = await supabase
  .from('topic_flash_content')
  .select('*')
  .eq('topic_id', topicId)
  .order('screen_number');

// 6. Mark flash content as completed
await supabase
  .from('topic_progress')
  .update({ flash_content_completed: true })
  .eq('user_id', userId)
  .eq('topic_id', topicId);

// 7. Get subtopics
const subtopics = await supabase
  .from('lessons')
  .select('*')
  .eq('topic_id', topicId)
  .order('display_order');

// 8. Get subtopic progress
const subtopicProgress = await supabase
  .from('subtopic_progress')
  .select('*')
  .eq('user_id', userId)
  .eq('subtopic_id', subtopicId)
  .single();

// 9. Start subtopic (mark as in_progress)
await supabase
  .from('subtopic_progress')
  .upsert({
    user_id: userId,
    topic_id: topicId,
    subtopic_id: subtopicId,
    status: 'in_progress',
  }, { onConflict: 'user_id,subtopic_id' });

// 10. Get questions for subtopic
const questions = await supabase
  .from('learning_questions')
  .select(`
    *,
    learning_question_options (*)
  `)
  .eq('subtopic_id', subtopicId);

// 11. Submit quiz score
await supabase
  .from('subtopic_progress')
  .update({
    score: 85,
    best_score: 85,
    attempts: 1,
    status: 'completed',
    completed_at: new Date().toISOString(),
  })
  .eq('user_id', userId)
  .eq('subtopic_id', subtopicId);

// 12. Calculate and update topic progress
const percentage = await calculateTopicProgress(userId, topicId);
```

---

## 🔍 Query Optimization Tips

### Use Select Specific Fields
```typescript
// ❌ Bad - fetches all fields
const { data } = await supabase
  .from('learning_questions')
  .select('*');

// ✅ Good - fetches only needed fields
const { data } = await supabase
  .from('learning_questions')
  .select('id, question_text, difficulty');
```

### Use Indexes
All tables have indexes on frequently queried fields:
- `topic_id`, `subtopic_id`, `user_id`
- `is_active` (partial index)
- `display_order`

### Batch Operations
```typescript
// ❌ Bad - multiple queries
for (const subtopicId of subtopicIds) {
  await supabase
    .from('subtopic_progress')
    .select('*')
    .eq('subtopic_id', subtopicId);
}

// ✅ Good - single query with IN
const { data } = await supabase
  .from('subtopic_progress')
  .select('*')
  .in('subtopic_id', subtopicIds);
```

### Cache Static Content
```typescript
// Cache topics, core notes, flash content
// They don't change frequently
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let cachedTopics = null;
let cacheTime = 0;

async function getTopics() {
  const now = Date.now();
  if (cachedTopics && (now - cacheTime) < CACHE_DURATION) {
    return cachedTopics;
  }

  const { data } = await supabase
    .from('topics')
    .select('*');

  cachedTopics = data;
  cacheTime = now;
  return data;
}
```

---

## 📊 API Response Times

### Expected Performance

| Endpoint | Expected Time | Notes |
|----------|---------------|-------|
| Get Topics | < 500ms | Cached |
| Get Core Notes | < 1s | Large HTML content |
| Get Flash Content | < 500ms | 5 screens |
| Get Subtopics | < 500ms | ~10 items |
| Get Questions | < 1s | With options |
| Update Progress | < 300ms | Single record |
| Calculate Progress | < 1s | Multiple queries |

### Optimization Strategies

1. **Pagination**: For large lists
2. **Caching**: For static content
3. **Lazy Loading**: Load content as needed
4. **Prefetching**: Load next content in background
5. **Optimistic Updates**: Update UI before API response

---

## 🎯 API Best Practices

### 1. Always Handle Errors
```typescript
try {
  const { data, error } = await supabase.from('table').select('*');
  if (error) throw error;
  return data;
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
  showError('Failed to load data. Please try again.');
  return null;
}
```

### 2. Use TypeScript Types
```typescript
import { LearningQuestion } from '@/types/learning';

const questions: LearningQuestion[] = await getQuestions(subtopicId);
```

### 3. Validate Data
```typescript
// Validate flash content count
if (flashContent.length !== 5) {
  throw new Error('Invalid flash content');
}

// Validate question count
if (questions.length < 5 || questions.length > 10) {
  console.warn('Invalid question count');
}
```

### 4. Use Transactions for Related Updates
```typescript
// Update multiple related records atomically
const { error } = await supabase.rpc('update_progress_transaction', {
  p_user_id: userId,
  p_subtopic_id: subtopicId,
  p_score: score,
  p_status: 'completed',
});
```

### 5. Implement Retry Logic
```typescript
async function fetchWithRetry(fn: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Database Schema**: See `DATABASE_STRUCTURE_SUMMARY.md`
- **Admin Portal APIs**: See `IMPLEMENTATION_STATUS.md`
- **Progress Tracking**: See `MOBILE_APP_TASKS.md`

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: "PGRST116: No rows found"
- **Solution**: Check if record exists, handle null case

**Issue**: "Row level security violation"
- **Solution**: Verify user is authenticated, check RLS policies

**Issue**: "Unique constraint violation"
- **Solution**: Use `upsert` instead of `insert`, or check if record exists first

**Issue**: Slow query performance
- **Solution**: Check indexes, use pagination, cache results

**Issue**: Progress not updating
- **Solution**: Verify user_id matches authenticated user, check RLS policies

---

**API Documentation Complete!** 🎉

All endpoints are documented with examples, error handling, and best practices.
