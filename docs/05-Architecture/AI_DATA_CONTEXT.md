# AI Phase 1: Data Context & Training Guide

## Overview

This document explains what data is required for Phase 1 AI implementation (JeevaBot chatbot using Google AI Studio/Gemini). Unlike traditional ML training, Gemini uses **prompt engineering with dynamic context retrieval** rather than model fine-tuning.

**Key Concept:** No traditional "training data" is needed. Instead, we build educational context from existing database content and inject it into prompts at runtime.

---

## 1. Data Sources for Context Building

### 1.1 Educational Content Database

JeevaBot retrieves relevant educational content from Supabase to provide context-aware responses:

**Primary Tables:**
```sql
-- Core educational hierarchy
modules (id, title, description, exam_type, difficulty_level, is_active)
topics (id, module_id, title, description, order_index, is_active)
lessons (id, topic_id, title, content, lesson_type, duration_minutes, order_index, audio_url)
flashcards (id, topic_id, front_text, back_text, difficulty_level)
questions (id, topic_id, question_text, question_type, difficulty_level, explanation)
question_options (id, question_id, option_text, is_correct)
```

**Student Progress Tables:**
```sql
learning_completions (user_id, lesson_id, completed_at, time_spent_seconds)
practice_sessions (user_id, topic_id, score, total_questions, session_type)
mock_exams (user_id, exam_type, score, total_questions, time_taken_seconds)
```

**User Context:**
```sql
users (id, email, full_name, phone_number, created_at)
user_profiles (user_id, preferred_language, learning_goals, weak_topics)
subscriptions (user_id, plan_id, status, start_date, end_date)
```

---

## 2. Context Retrieval Strategies

### 2.1 Query-Based Context Building

When a student asks a question, retrieve relevant educational content:

**Example: Student asks "Explain Newton's laws"**

```typescript
// Step 1: Identify relevant topics using keyword matching
const relevantTopics = await supabase
  .from('topics')
  .select(`
    id, title, description,
    modules!inner(title, exam_type),
    lessons(id, title, content, lesson_type)
  `)
  .ilike('title', '%newton%')
  .eq('is_active', true)
  .limit(3)

// Step 2: Fetch related lessons and flashcards
const lessonContent = await supabase
  .from('lessons')
  .select('title, content, lesson_type')
  .in('topic_id', topicIds)
  .limit(5)

const flashcards = await supabase
  .from('flashcards')
  .select('front_text, back_text')
  .in('topic_id', topicIds)
  .limit(10)

// Step 3: Build context string for Gemini prompt
const educationalContext = `
EDUCATIONAL CONTENT:
Topic: ${topic.title} (${module.title})
Description: ${topic.description}

LESSON CONTENT:
${lessonContent.map(l => `${l.title}: ${l.content}`).join('\n\n')}

KEY CONCEPTS (Flashcards):
${flashcards.map(f => `Q: ${f.front_text}\nA: ${f.back_text}`).join('\n')}
`
```

### 2.2 Student Progress Context

Include student's learning history for personalized responses:

```typescript
// Fetch student's weak areas
const weakTopics = await supabase
  .from('practice_sessions')
  .select('topic_id, score')
  .eq('user_id', studentId)
  .lt('score', 60)
  .order('created_at', { ascending: false })
  .limit(5)

// Get completed lessons
const completedLessons = await supabase
  .from('learning_completions')
  .select('lesson_id, lessons(title, topic_id)')
  .eq('user_id', studentId)
  .order('completed_at', { ascending: false })

// Build student context
const studentContext = `
STUDENT PROFILE:
Name: ${user.full_name}
Learning Goals: ${profile.learning_goals}
Preferred Language: ${profile.preferred_language}

WEAK AREAS (needs focus):
${weakTopics.map(t => `- ${t.topics.title} (${t.score}% score)`).join('\n')}

RECENTLY COMPLETED:
${completedLessons.map(l => `✓ ${l.lessons.title}`).join('\n')}
`
```

---

## 3. Prompt Engineering Templates

### 3.1 System Prompt (Context Injection)

```typescript
const systemPrompt = `
You are JeevaBot, an expert AI tutor for Indian competitive exam preparation (NEET, JEE, UPSC).

ROLE & PERSONALITY:
- You are encouraging, patient, and culturally aware
- You explain concepts using Indian examples and contexts
- You adapt explanations based on student's knowledge level
- You encourage critical thinking, not just memorization

EDUCATIONAL CONTEXT:
${educationalContext}

STUDENT CONTEXT:
${studentContext}

RESPONSE GUIDELINES:
1. Use simple, clear language
2. Break complex concepts into steps
3. Provide examples from syllabus content above
4. Reference completed lessons when relevant
5. Focus extra attention on weak topics
6. Keep responses under 300 words
7. Use Hindi/regional terms when student prefers

LIMITATIONS:
- Only answer questions related to provided syllabus
- Redirect off-topic questions politely
- Admit when you don't have information
- Encourage practicing with flashcards and questions
`
```

### 3.2 User Query Processing

```typescript
// Build complete prompt for Gemini
const userPrompt = `
STUDENT QUESTION:
"${studentMessage}"

CONVERSATION HISTORY:
${conversationHistory.map(msg => 
  `${msg.role}: ${msg.content}`
).join('\n')}

Please provide a helpful, personalized response based on the educational content and student context provided.
`

// Call Gemini API
const response = await chatModel.generateContent({
  contents: [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'I understand. I will help students learn effectively.' }] },
    { role: 'user', parts: [{ text: userPrompt }] }
  ]
})
```

---

## 4. Context Optimization Strategies

### 4.1 Relevance Ranking

Prioritize most relevant content to stay within token limits:

```typescript
// Score topics by relevance
function scoreTopicRelevance(topic: Topic, query: string): number {
  let score = 0
  
  // Exact title match
  if (topic.title.toLowerCase().includes(query.toLowerCase())) {
    score += 10
  }
  
  // Description match
  if (topic.description.toLowerCase().includes(query.toLowerCase())) {
    score += 5
  }
  
  // Recent student activity
  if (studentRecentTopics.includes(topic.id)) {
    score += 3
  }
  
  // Weak area (needs focus)
  if (studentWeakTopics.includes(topic.id)) {
    score += 2
  }
  
  return score
}

// Use top 3 most relevant topics
const rankedTopics = topics
  .map(t => ({ topic: t, score: scoreTopicRelevance(t, query) }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 3)
```

### 4.2 Token Budget Management

Gemini has input token limits (30K for Flash, 1M for Pro):

```typescript
const TOKEN_BUDGET = {
  systemPrompt: 2000,      // Educational context + guidelines
  studentContext: 500,      // Student profile + progress
  conversationHistory: 1500, // Last 5-10 messages
  userQuery: 500,          // Current question
  responseBuffer: 1000      // Reserve for response
}

function truncateContext(context: string, maxTokens: number): string {
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4
  
  if (context.length <= maxChars) return context
  
  // Truncate and add indicator
  return context.substring(0, maxChars - 50) + '\n[...content truncated for length...]'
}
```

---

## 5. Data Flow Architecture

### 5.1 Request Processing Pipeline

```
Student Question
    ↓
1. Extract Keywords & Intent
    ↓
2. Query Supabase for Relevant Content
   - Topics (keyword match)
   - Lessons (content search)
   - Flashcards (concept review)
   - Questions (practice reference)
    ↓
3. Retrieve Student Context
   - Learning progress
   - Weak areas
   - Recent activity
    ↓
4. Build Context String
   - Rank by relevance
   - Truncate to token budget
   - Format for readability
    ↓
5. Construct Gemini Prompt
   - System prompt (educational context)
   - Conversation history
   - User query
    ↓
6. Call Gemini API
    ↓
7. Post-process Response
   - Sanitize output
   - Add references (lesson/flashcard IDs)
   - Format for mobile display
    ↓
8. Store Conversation
   - Save to chat_messages table
   - Update usage stats
    ↓
Return to Student
```

### 5.2 Implementation Example

```typescript
// server/routes/chat.ts
export async function sendMessage(req: Request, res: Response) {
  const { message, conversationId } = req.body
  const userId = req.user.id
  
  // Step 1: Extract keywords
  const keywords = extractKeywords(message)
  
  // Step 2: Retrieve educational content
  const relevantContent = await retrieveEducationalContent(keywords)
  
  // Step 3: Get student context
  const studentContext = await getStudentContext(userId)
  
  // Step 4: Build context string
  const educationalContext = buildEducationalContext(relevantContent)
  const studentInfo = buildStudentContext(studentContext)
  
  // Step 5: Construct prompt
  const systemPrompt = buildSystemPrompt(educationalContext, studentInfo)
  const conversationHistory = await getConversationHistory(conversationId, limit: 10)
  
  // Step 6: Call Gemini
  const response = await chatModel.generateContent({
    contents: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...conversationHistory,
      { role: 'user', parts: [{ text: message }] }
    ]
  })
  
  // Step 7: Process response
  const botMessage = response.response.text()
  
  // Step 8: Store conversation
  await supabase.from('chat_messages').insert([
    { conversation_id: conversationId, role: 'user', content: message },
    { conversation_id: conversationId, role: 'assistant', content: botMessage }
  ])
  
  return res.json({ message: botMessage })
}
```

---

## 6. Data Quality Requirements

### 6.1 Content Completeness Checklist

For JeevaBot to work effectively, ensure:

**✅ Modules & Topics:**
- All active modules have descriptive titles and descriptions
- Topics are properly linked to modules
- Hierarchy is logically structured (Module → Topic → Lesson)

**✅ Lessons:**
- Content is well-written and informative (not just placeholders)
- Lesson types are correctly categorized (video, text, audio)
- Order index is set for sequential learning

**✅ Flashcards:**
- Front/back text is concise and clear
- Cover key concepts from lessons
- Difficulty levels are assigned

**✅ Questions:**
- Question text is clear and unambiguous
- All options have is_correct flag set properly
- Explanations are provided for learning

### 6.2 Content Quality Standards

**Good Example (Rich Context):**
```json
{
  "topic": {
    "title": "Newton's Laws of Motion",
    "description": "Fundamental principles governing motion and force interactions"
  },
  "lesson": {
    "title": "First Law - Law of Inertia",
    "content": "An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force. Example: A cricket ball continues rolling on the ground until friction stops it."
  },
  "flashcard": {
    "front_text": "What is Newton's First Law?",
    "back_text": "Law of Inertia - Objects resist changes in motion unless external force is applied"
  }
}
```

**Poor Example (Insufficient Context):**
```json
{
  "topic": {
    "title": "Physics Topic 1",
    "description": "Important physics concepts"
  },
  "lesson": {
    "title": "Lesson 1",
    "content": "To be added"
  }
}
```

---

## 7. Context Retrieval API Endpoints

### 7.1 Backend Helper Functions

```typescript
// server/lib/context-builder.ts

export async function retrieveEducationalContent(keywords: string[]) {
  const topics = await supabase
    .from('topics')
    .select(`
      id, title, description,
      modules(title, exam_type),
      lessons(title, content, lesson_type),
      flashcards(front_text, back_text),
      questions(question_text, explanation)
    `)
    .or(keywords.map(k => `title.ilike.%${k}%`).join(','))
    .eq('is_active', true)
    .limit(5)
    
  return topics.data
}

export async function getStudentContext(userId: string) {
  const [profile, weakAreas, recentProgress] = await Promise.all([
    // User profile
    supabase
      .from('user_profiles')
      .select('preferred_language, learning_goals, weak_topics')
      .eq('user_id', userId)
      .single(),
      
    // Weak performance areas
    supabase
      .from('practice_sessions')
      .select('topic_id, topics(title), score')
      .eq('user_id', userId)
      .lt('score', 60)
      .limit(5),
      
    // Recent completions
    supabase
      .from('learning_completions')
      .select('lessons(title)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(10)
  ])
  
  return { profile: profile.data, weakAreas: weakAreas.data, recentProgress: recentProgress.data }
}
```

---

## 8. No Traditional Training Required

### 8.1 Why No Model Training?

**Google AI Studio (Gemini) uses:**
- ✅ Pre-trained foundation models (Gemini 1.5 Flash/Pro)
- ✅ Prompt engineering with dynamic context
- ✅ Zero-shot/few-shot learning

**NOT required:**
- ❌ Custom dataset preparation
- ❌ Model fine-tuning
- ❌ GPU/TPU training infrastructure
- ❌ Training epochs or hyperparameter tuning

### 8.2 Instead, Focus On:

1. **Content Quality:** Ensure database has rich educational content
2. **Context Retrieval:** Build smart queries to fetch relevant data
3. **Prompt Engineering:** Craft effective system prompts
4. **Response Quality:** Test and refine bot responses iteratively

---

## 9. Testing & Validation

### 9.1 Context Validation Checklist

Before launching JeevaBot, test:

**✅ Content Retrieval:**
- Query returns relevant topics for test questions
- Lessons contain sufficient detail for explanations
- Flashcards provide quick concept review
- Questions offer practice examples

**✅ Student Context:**
- Weak areas are correctly identified
- Recent progress is accurately tracked
- Learning goals are considered in responses

**✅ Response Quality:**
- Bot explains concepts clearly
- Uses educational content from database
- Personalizes based on student context
- Stays within syllabus scope

### 9.2 Sample Test Cases

```typescript
// Test Case 1: Topic explanation
{
  query: "Explain photosynthesis",
  expectedContext: ["Biology module", "Plant processes topic", "Photosynthesis lesson"],
  expectedResponse: "Uses lesson content to explain concept step-by-step"
}

// Test Case 2: Weak area support
{
  query: "I'm struggling with organic chemistry",
  studentWeakTopics: ["Organic Chemistry"],
  expectedResponse: "Acknowledges weak area, offers focused practice resources"
}

// Test Case 3: Out of scope
{
  query: "What's the weather today?",
  expectedResponse: "Politely redirects to educational topics"
}
```

---

## 10. Summary

**Phase 1 AI (JeevaBot) Data Requirements:**

| Component | Data Source | Purpose |
|-----------|-------------|---------|
| **Educational Context** | modules, topics, lessons, flashcards, questions | Provide accurate subject matter for explanations |
| **Student Progress** | learning_completions, practice_sessions, mock_exams | Personalize responses based on performance |
| **User Profile** | users, user_profiles, subscriptions | Adapt language, difficulty, and focus areas |
| **Conversation History** | chat_conversations, chat_messages | Maintain context across chat session |

**Key Takeaway:** No traditional ML training needed. Success depends on:
1. ✅ High-quality educational content in database
2. ✅ Smart context retrieval queries
3. ✅ Well-crafted prompt engineering
4. ✅ Continuous testing and refinement

The AI becomes smarter as your educational content grows richer!

---

**Next Steps:**
1. Ensure database has comprehensive lesson content (not placeholders)
2. Implement context retrieval functions in backend
3. Test prompt templates with sample queries
4. Monitor response quality and iterate
5. See `AI_PHASE1_CHATBOT.md` for full implementation details
