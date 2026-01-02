# Jeeva Learning - Data Types Reference

## Overview

This document provides a comprehensive reference for all custom data types, enum values, JSONB structures, and array columns used in the Jeeva Learning platform's Supabase PostgreSQL database.

**Database Provider:** Supabase  
**PostgreSQL Version:** 15+  
**Schema:** public

---

## Table of Contents

1. [Enum Values (CHECK Constraints)](#1-enum-values-check-constraints)
2. [JSONB Column Structures](#2-jsonb-column-structures)
3. [Array Columns](#3-array-columns)
4. [Custom Types](#4-custom-types)

---

## 1. Enum Values (CHECK Constraints)

PostgreSQL CHECK constraints are used to enforce allowed values for specific columns. These act as enums within the database.

### 1.1 Authentication & Users Domain

#### oauth_provider (users table)

**Table:** `users`  
**Column:** `oauth_provider`  
**Type:** VARCHAR(20)  
**Default:** 'email'

| Value | Description |
|-------|-------------|
| `email` | Standard email/password authentication |
| `google` | Google OAuth authentication |
| `apple` | Apple Sign-In authentication |

**Usage Example:**
```sql
SELECT * FROM users WHERE oauth_provider = 'google';
```

---

#### role (admin_users table)

**Table:** `admin_users`  
**Column:** `role`  
**Type:** TEXT

| Value | Description | Permissions |
|-------|-------------|-------------|
| `superadmin` | Full system access | All CRUD operations, user management, settings |
| `editor` | Content management | Create, edit, delete content |
| `moderator` | Content review | Review and approve content |

**Usage Example:**
```sql
SELECT * FROM admin_users WHERE role = 'superadmin';
```

---

### 1.2 Learning Content Domain

#### content_type (lesson_content table)

**Table:** `lesson_content`  
**Column:** `content_type`  
**Type:** TEXT

| Value | Description |
|-------|-------------|
| `text` | Rich text content block |
| `image` | Image content |
| `video` | Video content with URL |
| `audio` | Audio/podcast content |
| `code` | Code snippet block |
| `quiz` | Embedded quiz content |

**Usage Example:**
```sql
SELECT * FROM lesson_content WHERE content_type = 'video';
```

---

#### question_type (questions table)

**Table:** `questions`  
**Column:** `question_type`  
**Type:** TEXT

| Value | Description |
|-------|-------------|
| `multiple_choice` | Multiple choice question with options |
| `true_false` | True/False question |
| `short_answer` | Short text answer question |

**Usage Example:**
```sql
SELECT * FROM questions WHERE question_type = 'multiple_choice';
```

---

#### difficulty (questions table)

**Table:** `questions`  
**Column:** `difficulty`  
**Type:** TEXT

| Value | Description | Points Multiplier |
|-------|-------------|-------------------|
| `easy` | Basic understanding questions | 1x |
| `medium` | Intermediate application questions | 1.5x |
| `hard` | Advanced analysis questions | 2x |

**Usage Example:**
```sql
SELECT * FROM questions WHERE difficulty = 'hard';
```

---

#### media_type (question_media table)

**Table:** `question_media`  
**Column:** `media_type`  
**Type:** TEXT

| Value | Description |
|-------|-------------|
| `image` | Image attachment (PNG, JPG, etc.) |
| `audio` | Audio file attachment |
| `video` | Video file attachment |
| `document` | Document attachment (PDF, etc.) |

**Usage Example:**
```sql
SELECT * FROM question_media WHERE media_type = 'image';
```

---

#### access_type (module_access_rules table)

**Table:** `module_access_rules`  
**Column:** `access_type`  
**Type:** TEXT

| Value | Description |
|-------|-------------|
| `free` | Free access for all users |
| `trial` | Available during trial period |
| `subscription` | Requires active subscription |
| `premium` | Requires premium subscription tier |

**Usage Example:**
```sql
SELECT * FROM module_access_rules WHERE access_type = 'trial';
```

---

### 1.3 Progress & Practice Domain

#### status (learning_progress table)

**Table:** `learning_progress`  
**Column:** `status`  
**Type:** TEXT  
**Default:** 'not_started'

| Value | Description |
|-------|-------------|
| `not_started` | User has not begun this content |
| `in_progress` | User is currently working on this content |
| `completed` | User has finished this content |

**Usage Example:**
```sql
SELECT * FROM learning_progress WHERE status = 'completed';
```

---

#### status (practice_sessions table)

**Table:** `practice_sessions`  
**Column:** `status`  
**Type:** TEXT  
**Default:** 'in_progress'

| Value | Description |
|-------|-------------|
| `in_progress` | Session is currently active |
| `completed` | Session finished normally |
| `abandoned` | Session was left incomplete |

**Usage Example:**
```sql
SELECT * FROM practice_sessions WHERE status = 'completed';
```

---

#### status (mock_exams table)

**Table:** `mock_exams`  
**Column:** `status`  
**Type:** TEXT  
**Default:** 'in_progress'

| Value | Description |
|-------|-------------|
| `in_progress` | Exam is currently being taken |
| `completed` | Exam finished and submitted |
| `abandoned` | Exam was left incomplete |
| `timed_out` | Exam time limit exceeded |

**Usage Example:**
```sql
SELECT * FROM mock_exams WHERE status = 'timed_out';
```

---

### 1.4 Trial Module Domain

#### content_type (trial_attempt_records table)

**Table:** `trial_attempt_records`  
**Column:** `content_type`  
**Type:** VARCHAR(50)

| Value | Description |
|-------|-------------|
| `practice` | Practice question attempts |
| `learning` | Learning module progress |
| `mock_exam` | Mock exam attempts |

**Usage Example:**
```sql
SELECT * FROM trial_attempt_records WHERE content_type = 'mock_exam';
```

---

#### status (trial_attempt_records table)

**Table:** `trial_attempt_records`  
**Column:** `status`  
**Type:** VARCHAR(50)  
**Default:** 'in_progress'

| Value | Description |
|-------|-------------|
| `in_progress` | Attempt is currently active |
| `completed` | Attempt finished successfully |
| `abandoned` | Attempt was left incomplete |

---

#### status (trial_exam_attempts table)

**Table:** `trial_exam_attempts`  
**Column:** `status`  
**Type:** VARCHAR(50)  
**Default:** 'completed'

| Value | Description |
|-------|-------------|
| `in_progress` | Exam attempt is active |
| `completed` | Exam attempt finished |
| `abandoned` | Exam attempt was abandoned |

---

### 1.5 Subscriptions & Payments Domain

#### status (subscriptions table)

**Table:** `subscriptions`  
**Column:** `status`  
**Type:** TEXT

| Value | Description |
|-------|-------------|
| `trial` | User is in trial period |
| `active` | Subscription is currently active |
| `expired` | Subscription has expired |
| `cancelled` | Subscription was cancelled |
| `pending` | Payment pending confirmation |

**Usage Example:**
```sql
SELECT * FROM subscriptions WHERE status = 'active';
```

---

#### payment_gateway (subscriptions table)

**Table:** `subscriptions`  
**Column:** `payment_gateway`  
**Type:** TEXT

| Value | Description | Regions |
|-------|-------------|---------|
| `stripe` | Stripe payment processing | Global (UK, US, EU) |
| `razorpay` | Razorpay payment processing | India |

**Usage Example:**
```sql
SELECT * FROM subscriptions WHERE payment_gateway = 'stripe';
```

---

#### discount_type (discount_coupons table)

**Table:** `discount_coupons`  
**Column:** `discount_type`  
**Type:** TEXT

| Value | Description | Example |
|-------|-------------|---------|
| `percentage` | Percentage discount off total | 20% off |
| `fixed_amount` | Fixed amount discount | $10 off |

**Usage Example:**
```sql
SELECT * FROM discount_coupons WHERE discount_type = 'percentage';
```

---

### 1.6 System & Settings Domain

#### resource_type (content_approvals table)

**Table:** `content_approvals`  
**Column:** `resource_type`  
**Type:** TEXT

| Value | Description |
|-------|-------------|
| `module` | Module content |
| `topic` | Topic content |
| `lesson` | Lesson content |
| `question` | Question content |
| `flashcard` | Flashcard content |

**Usage Example:**
```sql
SELECT * FROM content_approvals WHERE resource_type = 'question';
```

---

#### status (content_approvals table)

**Table:** `content_approvals`  
**Column:** `status`  
**Type:** TEXT  
**Default:** 'pending'

| Value | Description |
|-------|-------------|
| `pending` | Awaiting review |
| `approved` | Content approved for publication |
| `rejected` | Content rejected with feedback |

**Usage Example:**
```sql
SELECT * FROM content_approvals WHERE status = 'pending';
```

---

### 1.7 AI & Chat Domain

#### role (chat_messages table)

**Table:** `chat_messages`  
**Column:** `role`  
**Type:** TEXT

| Value | Description |
|-------|-------------|
| `user` | Message from the user |
| `assistant` | Message from the AI assistant |

**Usage Example:**
```sql
SELECT * FROM chat_messages WHERE role = 'assistant';
```

---

### 1.8 Notifications Domain

#### notification_type (notifications table)

**Table:** `notifications`  
**Column:** `notification_type`  
**Type:** TEXT

| Value | Description |
|-------|-------------|
| `announcement` | General announcements |
| `reminder` | Study reminders |
| `achievement` | Achievement/milestone notifications |
| `promotional` | Promotional offers |
| `system` | System notifications |

**Usage Example:**
```sql
SELECT * FROM notifications WHERE notification_type = 'achievement';
```

---

#### delivery_status (notification_queue table)

**Table:** `notification_queue`  
**Column:** `delivery_status`  
**Type:** TEXT  
**Default:** 'pending'

| Value | Description |
|-------|-------------|
| `pending` | Awaiting delivery |
| `sent` | Sent to delivery service |
| `delivered` | Successfully delivered |
| `failed` | Delivery failed |
| `cancelled` | Delivery cancelled |

**Usage Example:**
```sql
SELECT * FROM notification_queue WHERE delivery_status = 'failed';
```

---

#### delivery_channel (notification_queue table)

**Table:** `notification_queue`  
**Column:** `delivery_channel`  
**Type:** TEXT  
**Default:** 'push'

| Value | Description |
|-------|-------------|
| `push` | Push notification to device |
| `email` | Email notification |
| `in_app` | In-app notification |

**Usage Example:**
```sql
SELECT * FROM notification_queue WHERE delivery_channel = 'email';
```

---

#### platform (push_tokens table)

**Table:** `push_tokens`  
**Column:** `platform`  
**Type:** TEXT

| Value | Description |
|-------|-------------|
| `ios` | Apple iOS devices |
| `android` | Android devices |
| `web` | Web browser push |

**Usage Example:**
```sql
SELECT * FROM push_tokens WHERE platform = 'ios';
```

---

### 1.9 Enum Summary Table

| Table | Column | Allowed Values |
|-------|--------|----------------|
| `users` | `oauth_provider` | 'email', 'google', 'apple' |
| `admin_users` | `role` | 'superadmin', 'editor', 'moderator' |
| `lesson_content` | `content_type` | 'text', 'image', 'video', 'audio', 'code', 'quiz' |
| `questions` | `question_type` | 'multiple_choice', 'true_false', 'short_answer' |
| `questions` | `difficulty` | 'easy', 'medium', 'hard' |
| `question_media` | `media_type` | 'image', 'audio', 'video', 'document' |
| `module_access_rules` | `access_type` | 'free', 'trial', 'subscription', 'premium' |
| `learning_progress` | `status` | 'not_started', 'in_progress', 'completed' |
| `practice_sessions` | `status` | 'in_progress', 'completed', 'abandoned' |
| `mock_exams` | `status` | 'in_progress', 'completed', 'abandoned', 'timed_out' |
| `trial_attempt_records` | `content_type` | 'practice', 'learning', 'mock_exam' |
| `trial_attempt_records` | `status` | 'in_progress', 'completed', 'abandoned' |
| `trial_exam_attempts` | `status` | 'in_progress', 'completed', 'abandoned' |
| `subscriptions` | `status` | 'trial', 'active', 'expired', 'cancelled', 'pending' |
| `subscriptions` | `payment_gateway` | 'stripe', 'razorpay' |
| `discount_coupons` | `discount_type` | 'percentage', 'fixed_amount' |
| `content_approvals` | `resource_type` | 'module', 'topic', 'lesson', 'question', 'flashcard' |
| `content_approvals` | `status` | 'pending', 'approved', 'rejected' |
| `chat_messages` | `role` | 'user', 'assistant' |
| `notifications` | `notification_type` | 'announcement', 'reminder', 'achievement', 'promotional', 'system' |
| `notification_queue` | `delivery_status` | 'pending', 'sent', 'delivered', 'failed', 'cancelled' |
| `notification_queue` | `delivery_channel` | 'push', 'email', 'in_app' |
| `push_tokens` | `platform` | 'ios', 'android', 'web' |

---

## 2. JSONB Column Structures

PostgreSQL JSONB columns store structured JSON data with indexing support. This section documents the expected structure for each JSONB column.

### 2.1 Authentication & Users Domain

#### device_info (user_sessions table)

**Table:** `user_sessions`  
**Column:** `device_info`  
**Type:** JSONB

**Structure:**
```json
{
  "model": "string",
  "osVersion": "string",
  "appVersion": "string",
  "deviceId": "string"
}
```

**Example:**
```json
{
  "model": "iPhone 14 Pro",
  "osVersion": "17.0",
  "appVersion": "1.2.0",
  "deviceId": "ABC123DEF456"
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string | No | Device model name |
| `osVersion` | string | No | Operating system version |
| `appVersion` | string | No | Application version |
| `deviceId` | string | No | Unique device identifier |

---

### 2.2 Progress & Practice Domain

#### path_data (learning_paths table)

**Table:** `learning_paths`  
**Column:** `path_data`  
**Type:** JSONB

**Structure:**
```json
{
  "modules": [
    {
      "moduleId": "uuid",
      "order": "number",
      "topics": ["uuid"]
    }
  ],
  "currentPosition": {
    "moduleId": "uuid",
    "topicId": "uuid",
    "lessonId": "uuid"
  },
  "completedItems": ["uuid"]
}
```

**Example:**
```json
{
  "modules": [
    {
      "moduleId": "550e8400-e29b-41d4-a716-446655440000",
      "order": 1,
      "topics": [
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002"
      ]
    }
  ],
  "currentPosition": {
    "moduleId": "550e8400-e29b-41d4-a716-446655440000",
    "topicId": "550e8400-e29b-41d4-a716-446655440001",
    "lessonId": "550e8400-e29b-41d4-a716-446655440010"
  },
  "completedItems": [
    "550e8400-e29b-41d4-a716-446655440010",
    "550e8400-e29b-41d4-a716-446655440011"
  ]
}
```

---

#### answers_data (lesson_quiz_results table)

**Table:** `lesson_quiz_results`  
**Column:** `answers_data`  
**Type:** JSONB

**Structure:**
```json
[
  {
    "questionId": "uuid",
    "selectedOptionId": "uuid",
    "isCorrect": "boolean",
    "timeTaken": "number"
  }
]
```

**Example:**
```json
[
  {
    "questionId": "550e8400-e29b-41d4-a716-446655440000",
    "selectedOptionId": "550e8400-e29b-41d4-a716-446655440001",
    "isCorrect": true,
    "timeTaken": 30
  },
  {
    "questionId": "550e8400-e29b-41d4-a716-446655440002",
    "selectedOptionId": "550e8400-e29b-41d4-a716-446655440003",
    "isCorrect": false,
    "timeTaken": 45
  }
]
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `questionId` | UUID | Yes | Reference to question |
| `selectedOptionId` | UUID | Yes | Selected answer option |
| `isCorrect` | boolean | Yes | Whether answer was correct |
| `timeTaken` | number | No | Time taken in seconds |

---

#### answer_log (practice_results table)

**Table:** `practice_results`  
**Column:** `answer_log`  
**Type:** JSONB

**Structure:**
```json
{
  "questionId": "uuid",
  "selectedOptionId": "uuid",
  "isCorrect": "boolean",
  "timeTaken": "number",
  "attempts": "number"
}
```

**Example:**
```json
{
  "questionId": "550e8400-e29b-41d4-a716-446655440000",
  "selectedOptionId": "550e8400-e29b-41d4-a716-446655440001",
  "isCorrect": true,
  "timeTaken": 30,
  "attempts": 1
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `questionId` | UUID | Yes | Reference to question |
| `selectedOptionId` | UUID | Yes | Selected answer option |
| `isCorrect` | boolean | Yes | Whether answer was correct |
| `timeTaken` | number | No | Time taken in seconds |
| `attempts` | number | No | Number of attempts made |

---

#### difficulty_distribution (mock_exam_config table)

**Table:** `mock_exam_config`  
**Column:** `difficulty_distribution`  
**Type:** JSONB

**Structure:**
```json
{
  "easy": "number",
  "medium": "number",
  "hard": "number"
}
```

**Example:**
```json
{
  "easy": 30,
  "medium": 50,
  "hard": 20
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `easy` | number | Yes | Percentage of easy questions |
| `medium` | number | Yes | Percentage of medium questions |
| `hard` | number | Yes | Percentage of hard questions |

**Note:** Values should sum to 100.

---

#### exam_data (mock_exams table)

**Table:** `mock_exams`  
**Column:** `exam_data`  
**Type:** JSONB

**Structure:**
```json
{
  "topicId": "uuid",
  "questionIds": ["uuid"],
  "duration": "number",
  "examTitle": "string"
}
```

**Example:**
```json
{
  "topicId": "550e8400-e29b-41d4-a716-446655440000",
  "questionIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003"
  ],
  "duration": 60,
  "examTitle": "NMC CBT Mock Test"
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topicId` | UUID | No | Topic for the exam |
| `questionIds` | UUID[] | Yes | Array of question IDs |
| `duration` | number | Yes | Duration in minutes |
| `examTitle` | string | Yes | Title of the exam |

---

#### results_data (mock_results table)

**Table:** `mock_results`  
**Column:** `results_data`  
**Type:** JSONB

**Structure:**
```json
{
  "score": "number",
  "totalQuestions": "number",
  "correctAnswers": "number",
  "timeTaken": "number",
  "topicScores": {
    "topicName": "number"
  }
}
```

**Example:**
```json
{
  "score": 85,
  "totalQuestions": 20,
  "correctAnswers": 17,
  "timeTaken": 3600,
  "topicScores": {
    "Clinical Skills": 90,
    "Patient Safety": 80
  }
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `score` | number | Yes | Overall score percentage |
| `totalQuestions` | number | Yes | Total questions in exam |
| `correctAnswers` | number | Yes | Number of correct answers |
| `timeTaken` | number | Yes | Time taken in seconds |
| `topicScores` | object | No | Score breakdown by topic |

---

#### recommendation_data (ai_recommendations table)

**Table:** `ai_recommendations`  
**Column:** `recommendation_data`  
**Type:** JSONB

**Structure:**
```json
{
  "type": "string",
  "topicId": "uuid",
  "reason": "string",
  "confidence": "number",
  "suggestedLessons": ["uuid"]
}
```

**Example:**
```json
{
  "type": "weak_topic",
  "topicId": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "Low score in recent practice",
  "confidence": 0.85,
  "suggestedLessons": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Type of recommendation (weak_topic, review, etc.) |
| `topicId` | UUID | No | Related topic ID |
| `reason` | string | Yes | Explanation for recommendation |
| `confidence` | number | Yes | AI confidence score (0-1) |
| `suggestedLessons` | UUID[] | No | Suggested lesson IDs |

---

#### analytics_data (user_analytics table)

**Table:** `user_analytics`  
**Column:** `analytics_data`  
**Type:** JSONB

**Structure:**
```json
{
  "totalStudyTime": "number",
  "lessonsCompleted": "number",
  "averageScore": "number",
  "currentStreak": "number",
  "longestStreak": "number",
  "topicScores": {
    "topicId": "number"
  }
}
```

**Example:**
```json
{
  "totalStudyTime": 7200,
  "lessonsCompleted": 45,
  "averageScore": 82,
  "currentStreak": 7,
  "longestStreak": 15,
  "topicScores": {
    "550e8400-e29b-41d4-a716-446655440000": 85,
    "550e8400-e29b-41d4-a716-446655440001": 78
  }
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalStudyTime` | number | Yes | Total study time in seconds |
| `lessonsCompleted` | number | Yes | Number of completed lessons |
| `averageScore` | number | Yes | Average score percentage |
| `currentStreak` | number | Yes | Current study streak in days |
| `longestStreak` | number | Yes | Longest study streak in days |
| `topicScores` | object | No | Score breakdown by topic ID |

---

### 2.3 Trial Module Domain

#### user_answers (trial_exam_attempts table)

**Table:** `trial_exam_attempts`  
**Column:** `user_answers`  
**Type:** JSONB

**Structure:**
```json
{
  "questionId": "answer"
}
```

**Example:**
```json
{
  "550e8400-e29b-41d4-a716-446655440001": "A",
  "550e8400-e29b-41d4-a716-446655440002": "B",
  "550e8400-e29b-41d4-a716-446655440003": "C"
}
```

**Note:** Keys are question UUIDs, values are the selected answer (A, B, C, D, or numeric value).

---

#### marked_for_review (trial_exam_attempts table)

**Table:** `trial_exam_attempts`  
**Column:** `marked_for_review`  
**Type:** JSONB

**Structure:**
```json
{
  "questionId": "boolean"
}
```

**Example:**
```json
{
  "550e8400-e29b-41d4-a716-446655440001": true,
  "550e8400-e29b-41d4-a716-446655440003": true
}
```

**Note:** Keys are question UUIDs, values indicate if marked for review.

---

#### topic_scores (trial_exam_attempts table)

**Table:** `trial_exam_attempts`  
**Column:** `topic_scores`  
**Type:** JSONB

**Structure:**
```json
{
  "topicName": {
    "score": "number",
    "total": "number",
    "percentage": "number"
  }
}
```

**Example:**
```json
{
  "Clinical Skills": {
    "score": 8,
    "total": 10,
    "percentage": 80
  },
  "Patient Safety": {
    "score": 6,
    "total": 8,
    "percentage": 75
  }
}
```

---

#### content_viewed (trial_learning_progress table)

**Table:** `trial_learning_progress`  
**Column:** `content_viewed`  
**Type:** JSONB

**Structure:**
```json
{
  "contentId": "boolean"
}
```

**Example:**
```json
{
  "550e8400-e29b-41d4-a716-446655440001": true,
  "550e8400-e29b-41d4-a716-446655440002": true,
  "550e8400-e29b-41d4-a716-446655440003": false,
  "550e8400-e29b-41d4-a716-446655440004": true
}
```

**Note:** Keys are content UUIDs, values indicate if content has been viewed.

---

#### answers_data (trial_attempt_records table)

**Table:** `trial_attempt_records`  
**Column:** `answers_data`  
**Type:** JSONB

**Structure:**
```json
{
  "questionId": "answer"
}
```

**Example:**
```json
{
  "550e8400-e29b-41d4-a716-446655440001": "A",
  "550e8400-e29b-41d4-a716-446655440002": "B",
  "550e8400-e29b-41d4-a716-446655440003": "10.5"
}
```

**Note:** Keys are question UUIDs, values are answers (letter for MCQ, numeric string for numerical).

---

#### question_details (trial_attempt_records table)

**Table:** `trial_attempt_records`  
**Column:** `question_details`  
**Type:** JSONB

**Structure:**
```json
[
  {
    "id": "uuid",
    "text": "string",
    "type": "string",
    "difficulty": "string",
    "correct_answer": "string"
  }
]
```

**Example:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "text": "What is the correct dosage?",
    "type": "mcq",
    "difficulty": "medium",
    "correct_answer": "A"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "text": "Calculate the infusion rate",
    "type": "numerical",
    "difficulty": "hard",
    "correct_answer": "10.5"
  }
]
```

---

### 2.4 AI & Chat Domain

#### context_data (chat_conversations table)

**Table:** `chat_conversations`  
**Column:** `context_data`  
**Type:** JSONB

**Structure:**
```json
{
  "currentLesson": {
    "id": "uuid",
    "title": "string",
    "moduleId": "uuid"
  },
  "userLevel": "string",
  "recentTopics": ["string"]
}
```

**Example:**
```json
{
  "currentLesson": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Introduction to Clinical Skills",
    "moduleId": "550e8400-e29b-41d4-a716-446655440001"
  },
  "userLevel": "intermediate",
  "recentTopics": ["clinical-skills", "patient-care"]
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentLesson` | object | No | Current lesson context |
| `userLevel` | string | No | User's proficiency level |
| `recentTopics` | string[] | No | Recently studied topics |

---

#### metadata (chat_messages table)

**Table:** `chat_messages`  
**Column:** `metadata`  
**Type:** JSONB

**Structure:**
```json
{
  "model": "string",
  "tokensUsed": "number",
  "responseTime": "number",
  "confidenceScore": "number"
}
```

**Example:**
```json
{
  "model": "gemini-1.5-flash",
  "tokensUsed": 245,
  "responseTime": 1.2,
  "confidenceScore": 0.87
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string | Yes | AI model used |
| `tokensUsed` | number | Yes | Tokens consumed |
| `responseTime` | number | Yes | Response time in seconds |
| `confidenceScore` | number | No | AI confidence (0-1) |

---

### 2.5 Notifications Domain

#### data (notifications table)

**Table:** `notifications`  
**Column:** `data`  
**Type:** JSONB

**Structure:**
```json
{
  "actionType": "string",
  "targetId": "uuid",
  "metadata": {}
}
```

**Example:**
```json
{
  "actionType": "open_lesson",
  "targetId": "550e8400-e29b-41d4-a716-446655440000",
  "metadata": {
    "lessonTitle": "Clinical Skills Introduction",
    "moduleId": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

---

#### device_info (push_tokens table)

**Table:** `push_tokens`  
**Column:** `device_info`  
**Type:** JSONB

**Structure:**
```json
{
  "model": "string",
  "osVersion": "string",
  "appVersion": "string"
}
```

**Example:**
```json
{
  "model": "iPhone 14 Pro",
  "osVersion": "17.0",
  "appVersion": "1.2.0"
}
```

---

### 2.6 Analytics Domain

#### device_info (analytics_sessions table)

**Table:** `analytics_sessions`  
**Column:** `device_info`  
**Type:** JSONB

**Structure:**
```json
{
  "model": "string",
  "osVersion": "string",
  "appVersion": "string",
  "screenResolution": "string"
}
```

**Example:**
```json
{
  "model": "Samsung Galaxy S23",
  "osVersion": "Android 14",
  "appVersion": "1.2.0",
  "screenResolution": "1080x2340"
}
```

---

### 2.7 JSONB Summary Table

| Table | Column | Structure Type | Description |
|-------|--------|----------------|-------------|
| `user_sessions` | `device_info` | Object | Device metadata |
| `learning_paths` | `path_data` | Object | Learning path configuration |
| `lesson_quiz_results` | `answers_data` | Array | Quiz answer details |
| `practice_results` | `answer_log` | Object | Practice answer log |
| `mock_exam_config` | `difficulty_distribution` | Object | Difficulty percentages |
| `mock_exams` | `exam_data` | Object | Exam configuration |
| `mock_results` | `results_data` | Object | Exam results summary |
| `ai_recommendations` | `recommendation_data` | Object | AI recommendation details |
| `user_analytics` | `analytics_data` | Object | User analytics metrics |
| `trial_exam_attempts` | `user_answers` | Object | User's exam answers |
| `trial_exam_attempts` | `marked_for_review` | Object | Review markers |
| `trial_exam_attempts` | `topic_scores` | Object | Topic score breakdown |
| `trial_learning_progress` | `content_viewed` | Object | Content view status |
| `trial_attempt_records` | `answers_data` | Object | Attempt answers |
| `trial_attempt_records` | `question_details` | Array | Cached question info |
| `chat_conversations` | `context_data` | Object | AI context |
| `chat_messages` | `metadata` | Object | AI response metadata |
| `notifications` | `data` | Object | Notification payload |
| `push_tokens` | `device_info` | Object | Device metadata |
| `analytics_sessions` | `device_info` | Object | Session device info |

---

## 3. Array Columns

PostgreSQL array columns store ordered lists of values. This section documents all array columns in the database.

### 3.1 Learning Content Domain

#### topic_ids (mock_exam_config table)

**Table:** `mock_exam_config`  
**Column:** `topic_ids`  
**Type:** UUID[]  
**Element Type:** UUID

**Description:** Array of topic UUIDs to include questions from when generating a mock exam.

**Example:**
```sql
-- Insert with array
INSERT INTO mock_exam_config (title, topic_ids, total_questions)
VALUES (
  'NMC CBT Practice Exam',
  ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid],
  50
);

-- Query with array contains
SELECT * FROM mock_exam_config 
WHERE '550e8400-e29b-41d4-a716-446655440001'::uuid = ANY(topic_ids);

-- Query with array overlap
SELECT * FROM mock_exam_config 
WHERE topic_ids && ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid];
```

**Usage:**
- Used to define which topics should be included in a mock exam
- Questions are randomly selected from these topics based on difficulty distribution
- Empty array or NULL means all topics are included

---

### 3.2 Subscriptions & Payments Domain

#### features (subscription_plans table)

**Table:** `subscription_plans`  
**Column:** `features`  
**Type:** TEXT[]  
**Element Type:** TEXT

**Description:** Array of feature descriptions included in the subscription plan.

**Example:**
```sql
-- Insert with array
INSERT INTO subscription_plans (name, price_usd, duration_days, features)
VALUES (
  'Premium Plan',
  29.99,
  30,
  ARRAY['Unlimited practice questions', 'All mock exams', 'AI tutor access', 'Progress analytics']
);

-- Query plans with specific feature
SELECT * FROM subscription_plans 
WHERE 'AI tutor access' = ANY(features);

-- Count features
SELECT name, array_length(features, 1) as feature_count 
FROM subscription_plans;
```

**Common Feature Values:**
| Feature | Description |
|---------|-------------|
| `Unlimited practice questions` | Access to all practice questions |
| `All mock exams` | Access to all mock exam configurations |
| `AI tutor access` | Access to AI chatbot tutor |
| `Progress analytics` | Detailed progress tracking |
| `Offline access` | Download content for offline use |
| `Priority support` | Priority customer support |

---

#### applicable_plans (discount_coupons table)

**Table:** `discount_coupons`  
**Column:** `applicable_plans`  
**Type:** UUID[]  
**Element Type:** UUID

**Description:** Array of subscription plan UUIDs that the coupon can be applied to. NULL means applicable to all plans.

**Example:**
```sql
-- Insert coupon for specific plans
INSERT INTO discount_coupons (code, discount_type, discount_value, applicable_plans)
VALUES (
  'PREMIUM20',
  'percentage',
  20,
  ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid]
);

-- Insert coupon for all plans
INSERT INTO discount_coupons (code, discount_type, discount_value, applicable_plans)
VALUES (
  'WELCOME10',
  'percentage',
  10,
  NULL
);

-- Check if coupon applies to a plan
SELECT * FROM discount_coupons 
WHERE applicable_plans IS NULL 
   OR '550e8400-e29b-41d4-a716-446655440001'::uuid = ANY(applicable_plans);
```

**Usage:**
- NULL value means coupon applies to all subscription plans
- Non-empty array restricts coupon to specific plans
- Used during checkout to validate coupon applicability

---

### 3.3 System & Settings Domain

#### variables (email_templates table)

**Table:** `email_templates`  
**Column:** `variables`  
**Type:** TEXT[]  
**Element Type:** TEXT

**Description:** Array of template variable names that can be substituted in the email body.

**Example:**
```sql
-- Insert template with variables
INSERT INTO email_templates (name, subject, body, variables)
VALUES (
  'welcome_email',
  'Welcome to Jeeva Learning, {{user_name}}!',
  'Hello {{user_name}}, thank you for joining...',
  ARRAY['user_name', 'email', 'signup_date']
);

-- Query templates with specific variable
SELECT * FROM email_templates 
WHERE 'user_name' = ANY(variables);
```

**Common Variable Names:**
| Variable | Description |
|----------|-------------|
| `user_name` | User's full name |
| `email` | User's email address |
| `signup_date` | Account creation date |
| `plan_name` | Subscription plan name |
| `expiry_date` | Subscription expiry date |
| `score` | Exam/quiz score |
| `lesson_title` | Lesson title |
| `reset_link` | Password reset link |

---

### 3.4 Trial Module Domain

#### question_ids (trial_mock_exams table)

**Table:** `trial_mock_exams`  
**Column:** `question_ids`  
**Type:** UUID[]  
**Element Type:** UUID

**Description:** Array of question UUIDs that make up the trial mock exam. Questions are presented in the order specified.

**Example:**
```sql
-- Insert trial exam with questions
INSERT INTO trial_mock_exams (module_id, name, question_count, time_limit_minutes, passing_score, question_ids)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Trial Mock Exam',
  20,
  30,
  50,
  ARRAY[
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440003'::uuid
  ]
);

-- Get question count
SELECT name, array_length(question_ids, 1) as actual_question_count 
FROM trial_mock_exams;

-- Get questions in order
SELECT q.* 
FROM trial_mock_exams tme
CROSS JOIN LATERAL unnest(tme.question_ids) WITH ORDINALITY AS u(question_id, ord)
JOIN questions q ON q.id = u.question_id
WHERE tme.id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY u.ord;
```

**Usage:**
- Defines the exact questions and order for a trial mock exam
- Array length should match `question_count` column
- Questions are presented to users in array order

---

### 3.5 Array Operations Reference

#### Common Array Operations

```sql
-- Check if value exists in array
SELECT * FROM table WHERE 'value' = ANY(array_column);

-- Check array overlap
SELECT * FROM table WHERE array_column && ARRAY['value1', 'value2'];

-- Check if array contains all values
SELECT * FROM table WHERE array_column @> ARRAY['value1', 'value2'];

-- Get array length
SELECT array_length(array_column, 1) FROM table;

-- Append to array
UPDATE table SET array_column = array_append(array_column, 'new_value');

-- Remove from array
UPDATE table SET array_column = array_remove(array_column, 'value_to_remove');

-- Unnest array to rows
SELECT unnest(array_column) FROM table;

-- Aggregate values into array
SELECT array_agg(column_name) FROM table GROUP BY group_column;
```

---

### 3.6 Array Columns Summary Table

| Table | Column | Element Type | Nullable | Description |
|-------|--------|--------------|----------|-------------|
| `mock_exam_config` | `topic_ids` | UUID | Yes | Topics to include in exam |
| `subscription_plans` | `features` | TEXT | Yes | Plan feature list |
| `discount_coupons` | `applicable_plans` | UUID | Yes | Plans coupon applies to |
| `email_templates` | `variables` | TEXT | Yes | Template variable names |
| `trial_mock_exams` | `question_ids` | UUID | No | Exam question list |

---

## 4. Custom Types

The Jeeva Learning database primarily uses PostgreSQL built-in types with CHECK constraints for validation rather than custom PostgreSQL types. This approach provides flexibility while maintaining data integrity.

### 4.1 Commonly Used PostgreSQL Types

| Type | Usage | Example Tables |
|------|-------|----------------|
| `UUID` | Primary keys, foreign keys | All tables |
| `TEXT` | Variable-length strings | Most tables |
| `VARCHAR(n)` | Length-limited strings | `trial_mock_exams`, `trial_attempt_records` |
| `INTEGER` | Whole numbers | `duration`, `score`, `display_order` |
| `NUMERIC` | Decimal numbers | `price_usd`, `discount_value` |
| `DECIMAL(p,s)` | Precise decimals | `percentage_score` |
| `BOOLEAN` | True/false values | `is_active`, `is_trial` |
| `TIMESTAMP` | Date and time | `created_at`, `updated_at` |
| `TIMESTAMPTZ` | Timestamp with timezone | Trial module tables |
| `DATE` | Date only | `date`, `period_start` |
| `JSONB` | Binary JSON | Various metadata columns |
| `UUID[]` | UUID arrays | `topic_ids`, `question_ids` |
| `TEXT[]` | Text arrays | `features`, `variables` |
| `INET` | IP addresses | `ip_address` |

### 4.2 Type Casting Examples

```sql
-- Cast string to UUID
SELECT '550e8400-e29b-41d4-a716-446655440000'::uuid;

-- Cast to array
SELECT ARRAY['value1', 'value2']::text[];

-- Cast to JSONB
SELECT '{"key": "value"}'::jsonb;

-- Cast to timestamp
SELECT '2025-12-03 10:00:00'::timestamp;

-- Cast to numeric
SELECT '29.99'::numeric;
```

---

## Appendix

### A. Data Type Validation Queries

```sql
-- List all columns with CHECK constraints (enums)
SELECT 
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- List all JSONB columns
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type = 'jsonb'
ORDER BY table_name;

-- List all array columns
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type = 'ARRAY'
ORDER BY table_name;
```

### B. Quick Reference

#### Enum Columns Count: 23
#### JSONB Columns Count: 20
#### Array Columns Count: 5

---

**Document Version:** 1.0  
**Last Updated:** December 3, 2025  
**Schema:** public

