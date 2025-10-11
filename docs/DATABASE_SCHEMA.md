# 🗄️ Jeeva Learning - Database Schema Documentation

## 📊 Database Overview

The Jeeva Learning platform uses **Supabase PostgreSQL** as its database, shared between the admin portal and mobile app. This document provides complete schema details, relationships, and data structures.

**Database Type:** PostgreSQL 15+  
**Provider:** Supabase  
**Total Tables:** 20+  
**Authentication:** Supabase Auth with RLS

---

## 🔗 Entity Relationship Diagram

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION & USERS                      │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │    users     │──────│user_profiles │      │ admin_users  │  │
│  │  (students)  │      │              │      │              │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
┌─────────────────────────────────────────────────────────────────┐
│                       LEARNING CONTENT                           │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐              │
│  │ modules  │──────│  topics  │──────│ lessons  │              │
│  │          │      │          │      │          │              │
│  └──────────┘      └──────────┘      └──────────┘              │
│                                            │                     │
│                           ┌────────────────┼────────────┐       │
│                           │                │            │       │
│                      ┌──────────┐    ┌──────────┐ ┌──────────┐ │
│                      │questions │    │flashcards│ │question_ │ │
│                      │          │    │          │ │ options  │ │
│                      └──────────┘    └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    LEARNING PROGRESS & PRACTICE                  │
│  ┌──────────────────┐    ┌─────────────────┐                   │
│  │learning_         │    │practice_        │                   │
│  │completions       │    │sessions         │                   │
│  └──────────────────┘    └─────────────────┘                   │
│                               │                                  │
│  ┌──────────────────┐    ┌─────────────────┐                   │
│  │mock_exams        │    │practice_results │                   │
│  └──────────────────┘    └─────────────────┘                   │
│                                                                  │
│  ┌──────────────────┐    ┌─────────────────┐                   │
│  │ai_              │    │user_analytics   │                   │
│  │recommendations  │    │                 │                   │
│  └──────────────────┘    └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
┌─────────────────────────────────────────────────────────────────┐
│                  SUBSCRIPTIONS & SETTINGS                        │
│  ┌──────────────────┐    ┌─────────────────┐                   │
│  │subscription_     │    │subscriptions    │                   │
│  │plans             │────│                 │                   │
│  └──────────────────┘    └─────────────────┘                   │
│                                                                  │
│  ┌──────────────────┐    ┌─────────────────┐                   │
│  │app_settings      │    │dashboard_hero   │                   │
│  └──────────────────┘    └─────────────────┘                   │
│                                                                  │
│  ┌──────────────────┐                                           │
│  │content_approvals │                                           │
│  └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Table Categories

### 1. Authentication & Users
- `users` - Student/learner accounts
- `user_profiles` - Extended user information
- `admin_users` - Admin portal users

### 2. Learning Content
- `modules` - Course modules
- `topics` - Topics within modules
- `lessons` - Lesson content
- `questions` - Practice questions
- `question_options` - MCQ options
- `flashcards` - Study flashcards

### 3. Progress & Practice
- `learning_completions` - Lesson completion tracking
- `practice_sessions` - Practice session records
- `practice_results` - Practice session results
- `mock_exams` - Mock exam attempts
- `mock_exam_results` - Mock exam results
- `ai_recommendations` - AI-generated suggestions
- `user_analytics` - User engagement metrics

### 4. Subscriptions
- `subscription_plans` - Available subscription plans
- `subscriptions` - User subscription records

### 5. System & Settings
- `app_settings` - Application configuration
- `dashboard_hero` - Dashboard banners
- `content_approvals` - Content review queue
- `email_templates` - Email template storage

---

## 📊 Detailed Table Schemas

### 1. Authentication & Users

#### Table: `users`
**Purpose:** Student/learner user accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | TEXT | UNIQUE, NOT NULL | User email address |
| `role` | TEXT | DEFAULT 'student' | User role |
| `is_active` | BOOLEAN | DEFAULT true | Account status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- Primary Key: `id`
- Unique: `email`

**RLS Policy:** Users can read/update their own data

---

#### Table: `user_profiles`
**Purpose:** Extended user profile information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Profile ID |
| `user_id` | UUID | FK → users.id | User reference |
| `full_name` | TEXT | | User's full name |
| `phone_number` | TEXT | | Contact number |
| `date_of_birth` | TEXT | | Birth date |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Profile creation |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**RLS Policy:** Users can only access their own profile

---

#### Table: `admin_users`
**Purpose:** Admin portal user accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Admin user ID |
| `email` | TEXT | UNIQUE, NOT NULL | Admin email |
| `full_name` | TEXT | | Admin's name |
| `role` | TEXT | NOT NULL | superadmin/editor/moderator |
| `is_active` | BOOLEAN | DEFAULT true | Account status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Roles:**
- `superadmin` - Full system access
- `editor` - Content & user management
- `moderator` - Content approval only

**RLS Policy:** Only active admin users can access

---

### 2. Learning Content

#### Table: `modules`
**Purpose:** Top-level course modules

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Module ID |
| `title` | TEXT | NOT NULL | Module title |
| `description` | TEXT | | Module description |
| `thumbnail_url` | TEXT | | Module image |
| `is_active` | BOOLEAN | DEFAULT true | Visibility status |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- Primary Key: `id`
- Index: `display_order`

**RLS Policy:** Public read, admin write

**Example Data:**
```json
{
  "id": "uuid-1",
  "title": "Mathematics",
  "description": "Complete mathematics course",
  "thumbnail_url": "https://storage/math.jpg",
  "is_active": true,
  "display_order": 1
}
```

---

#### Table: `topics`
**Purpose:** Topics within modules

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Topic ID |
| `module_id` | UUID | FK → modules.id | Parent module |
| `title` | TEXT | NOT NULL | Topic title |
| `description` | TEXT | | Topic description |
| `is_active` | BOOLEAN | DEFAULT true | Visibility status |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Foreign Keys:**
- `module_id` → `modules.id` (ON DELETE CASCADE)

**Indexes:**
- Primary Key: `id`
- Foreign Key: `module_id`
- Index: `display_order`

**RLS Policy:** Public read, admin write

---

#### Table: `lessons`
**Purpose:** Lesson content with multimedia support

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Lesson ID |
| `topic_id` | UUID | FK → topics.id | Parent topic |
| `title` | TEXT | NOT NULL | Lesson title |
| `content` | TEXT | | Lesson text content |
| `video_url` | TEXT | | Video lesson URL |
| `audio_url` | TEXT | | Audio/podcast URL |
| `duration` | INTEGER | | Duration in seconds |
| `is_active` | BOOLEAN | DEFAULT true | Visibility status |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Foreign Keys:**
- `topic_id` → `topics.id` (ON DELETE CASCADE)

**Features:**
- Rich text content
- Video lessons
- Audio/podcast support
- Duration tracking

**RLS Policy:** Public read, admin write

---

#### Table: `questions`
**Purpose:** Practice questions and quiz items

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Question ID |
| `lesson_id` | UUID | FK → lessons.id | Associated lesson (optional) |
| `question_text` | TEXT | NOT NULL | Question content |
| `question_type` | TEXT | NOT NULL | Type of question |
| `difficulty` | TEXT | NOT NULL | Difficulty level |
| `points` | INTEGER | DEFAULT 1 | Points value |
| `explanation` | TEXT | | Answer explanation |
| `image_url` | TEXT | | Question image |
| `is_active` | BOOLEAN | DEFAULT true | Visibility status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Enums:**
- `question_type`: 'multiple_choice' | 'true_false' | 'short_answer'
- `difficulty`: 'easy' | 'medium' | 'hard'

**Foreign Keys:**
- `lesson_id` → `lessons.id` (ON DELETE SET NULL)

**RLS Policy:** Public read, admin write

---

#### Table: `question_options`
**Purpose:** Multiple choice question options

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Option ID |
| `question_id` | UUID | FK → questions.id | Parent question |
| `option_text` | TEXT | NOT NULL | Option content |
| `is_correct` | BOOLEAN | DEFAULT false | Correct answer flag |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |

**Foreign Keys:**
- `question_id` → `questions.id` (ON DELETE CASCADE)

**Note:** One option per question must have `is_correct = true`

---

#### Table: `flashcards`
**Purpose:** Study flashcards for spaced repetition

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Flashcard ID |
| `lesson_id` | UUID | FK → lessons.id | Associated lesson |
| `front` | TEXT | NOT NULL | Front of card |
| `back` | TEXT | NOT NULL | Back of card |
| `image_url` | TEXT | | Card image |
| `is_active` | BOOLEAN | DEFAULT true | Visibility status |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Foreign Keys:**
- `lesson_id` → `lessons.id` (ON DELETE CASCADE)

**RLS Policy:** Public read, admin write

---

### 3. Progress & Practice

#### Table: `learning_completions`
**Purpose:** Track user lesson completion

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Completion ID |
| `user_id` | UUID | FK → users.id | User reference |
| `lesson_id` | UUID | FK → lessons.id | Completed lesson |
| `completed_at` | TIMESTAMP | DEFAULT NOW() | Completion time |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `lesson_id` → `lessons.id` (ON DELETE CASCADE)

**Indexes:**
- Composite: `(user_id, lesson_id)` - UNIQUE
- Index: `completed_at` for streak calculation

**RLS Policy:** Users can only insert/read their own completions

---

#### Table: `practice_sessions`
**Purpose:** Practice session records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Session ID |
| `user_id` | UUID | FK → users.id | User reference |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Session start |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

---

#### Table: `practice_results`
**Purpose:** Store practice session results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Result ID |
| `session_id` | UUID | FK → practice_sessions.id | Parent session |
| `answer_log` | JSONB | NOT NULL | Answers & scores |

**Foreign Keys:**
- `session_id` → `practice_sessions.id` (ON DELETE CASCADE)

**JSONB Structure:**
```json
[
  {
    "questionId": "uuid",
    "selectedOptionId": "uuid",
    "isCorrect": true,
    "timeTaken": 30
  }
]
```

---

#### Table: `mock_exams`
**Purpose:** Mock exam attempts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Exam ID |
| `user_id` | UUID | FK → users.id | User reference |
| `exam_data` | JSONB | NOT NULL | Exam configuration |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Exam start time |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**JSONB Structure:**
```json
{
  "topicId": "uuid",
  "questionIds": ["uuid1", "uuid2"],
  "duration": 60,
  "examTitle": "Physics Mock Test"
}
```

---

#### Table: `mock_exam_results`
**Purpose:** Mock exam results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Result ID |
| `exam_id` | UUID | FK → mock_exams.id | Parent exam |
| `results_data` | JSONB | NOT NULL | Scores & answers |

**Foreign Keys:**
- `exam_id` → `mock_exams.id` (ON DELETE CASCADE)

**JSONB Structure:**
```json
{
  "score": 85,
  "totalQuestions": 20,
  "correctAnswers": 17,
  "timeTaken": 3600,
  "answers": [...]
}
```

---

#### Table: `ai_recommendations`
**Purpose:** AI-generated learning recommendations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Recommendation ID |
| `user_id` | UUID | FK → users.id | User reference |
| `recommendation_data` | JSONB | NOT NULL | AI suggestion data |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**JSONB Structure:**
```json
{
  "type": "weak_topic",
  "topicId": "uuid",
  "reason": "Low score in recent practice",
  "confidence": 0.85
}
```

---

#### Table: `user_analytics`
**Purpose:** User engagement and progress metrics

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Analytics ID |
| `user_id` | UUID | FK → users.id | User reference |
| `analytics_data` | JSONB | NOT NULL | Metrics data |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record time |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**JSONB Structure:**
```json
{
  "totalStudyTime": 7200,
  "lessonsCompleted": 45,
  "averageScore": 82,
  "currentStreak": 7,
  "longestStreak": 15
}
```

---

### 4. Subscriptions

#### Table: `subscription_plans`
**Purpose:** Available subscription plans

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Plan ID |
| `name` | TEXT | NOT NULL | Plan name |
| `description` | TEXT | | Plan description |
| `price` | NUMERIC | NOT NULL | Price amount |
| `billing_cycle` | TEXT | NOT NULL | Billing frequency |
| `features` | TEXT[] | | Feature list |
| `max_users` | INTEGER | | User limit |
| `is_active` | BOOLEAN | DEFAULT true | Availability |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Enums:**
- `billing_cycle`: 'monthly' | 'yearly' | 'lifetime'

**Example Data:**
```json
{
  "id": "uuid-1",
  "name": "Premium",
  "price": 999.00,
  "billing_cycle": "monthly",
  "features": ["All Content", "Offline Mode", "Priority Support"]
}
```

---

#### Table: `subscriptions`
**Purpose:** User subscription records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Subscription ID |
| `user_id` | UUID | FK → users.id | User reference |
| `plan_id` | UUID | FK → subscription_plans.id | Plan reference |
| `status` | TEXT | NOT NULL | Subscription status |
| `start_date` | TEXT | NOT NULL | Start date |
| `end_date` | TEXT | | End date |
| `auto_renew` | BOOLEAN | DEFAULT true | Auto-renewal |
| `payment_method` | TEXT | | Payment type |
| `last_payment_date` | TEXT | | Last payment |
| `next_payment_date` | TEXT | | Next billing |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Enums:**
- `status`: 'active' | 'cancelled' | 'expired' | 'trial'

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `plan_id` → `subscription_plans.id` (ON DELETE RESTRICT)

**RLS Policy:** Users can read their own subscriptions

---

### 5. System & Settings

#### Table: `app_settings`
**Purpose:** Application configuration

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Setting ID |
| `key` | TEXT | UNIQUE, NOT NULL | Setting key |
| `value` | TEXT | | Setting value |

**Example Keys:**
- `site_name`
- `maintenance_mode`
- `registration_enabled`
- `max_file_upload_size`

---

#### Table: `dashboard_hero`
**Purpose:** Dashboard banner/hero sections

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Hero ID |
| `title` | TEXT | NOT NULL | Hero title |
| `description` | TEXT | | Hero description |
| `image_url` | TEXT | | Banner image |
| `cta_text` | TEXT | | Call-to-action text |
| `cta_link` | TEXT | | CTA link |
| `is_active` | BOOLEAN | DEFAULT true | Visibility |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

---

#### Table: `content_approvals`
**Purpose:** Content review and approval workflow

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Approval ID |
| `resource_id` | UUID | NOT NULL | Content ID |
| `resource_type` | TEXT | NOT NULL | Content type |
| `resource_title` | TEXT | NOT NULL | Content title |
| `status` | TEXT | NOT NULL | Approval status |
| `submitted_by` | UUID | FK → admin_users.id | Submitter |
| `reviewed_by` | UUID | FK → admin_users.id | Reviewer |
| `review_comments` | TEXT | | Review notes |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Submission time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |
| `reviewed_at` | TIMESTAMP | | Review time |

**Enums:**
- `resource_type`: 'module' | 'topic' | 'lesson' | 'question' | 'flashcard'
- `status`: 'pending' | 'approved' | 'rejected'

**Foreign Keys:**
- `submitted_by` → `admin_users.id`
- `reviewed_by` → `admin_users.id`

---

#### Table: `email_templates`
**Purpose:** Email template storage

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Template ID |
| `name` | TEXT | UNIQUE, NOT NULL | Template name |
| `subject` | TEXT | NOT NULL | Email subject |
| `body` | TEXT | NOT NULL | HTML content |
| `variables` | TEXT[] | | Template variables |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Example Templates:**
- `welcome_email`
- `password_reset`
- `subscription_confirmation`

---

## 🔗 Relationship Summary

### Primary Relationships

**Content Hierarchy:**
```
modules (1) ──→ (*) topics (1) ──→ (*) lessons
                                        ├──→ (*) questions ──→ (*) question_options
                                        └──→ (*) flashcards
```

**User Progress:**
```
users (1) ──→ (*) learning_completions ──→ (1) lessons
users (1) ──→ (*) practice_sessions ──→ (*) practice_results
users (1) ──→ (*) mock_exams ──→ (*) mock_exam_results
```

**Subscriptions:**
```
subscription_plans (1) ──→ (*) subscriptions ──→ (1) users
```

**Content Approval:**
```
admin_users (1) ──→ (*) content_approvals (submitted)
admin_users (1) ──→ (*) content_approvals (reviewed)
```

---

## 🔒 Row Level Security (RLS) Policies

### Policy Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **users** | Self + Admin | Anyone | Self + Admin | Admin |
| **user_profiles** | Self | Self | Self | Self |
| **admin_users** | Active Admin | Superadmin | Superadmin | Superadmin |
| **modules** | Public | Editor/Super | Editor/Super | Superadmin |
| **topics** | Public | Editor/Super | Editor/Super | Superadmin |
| **lessons** | Public | Editor/Super | Editor/Super | Superadmin |
| **questions** | Public | Editor/Super | Editor/Super | Superadmin |
| **flashcards** | Public | Editor/Super | Editor/Super | Superadmin |
| **learning_completions** | Self | Self | - | - |
| **practice_sessions** | Self | Self | Self | Self |
| **mock_exams** | Self | Self | - | - |
| **subscriptions** | Self | Payment/Admin | Admin | Admin |
| **subscription_plans** | Public | Superadmin | Superadmin | Superadmin |

### Key Policies

**1. Self-Access Policy (user_profiles)**
```sql
CREATE POLICY "Users can access own profile"
ON user_profiles
FOR ALL
USING (auth.uid() = user_id);
```

**2. Public Read Policy (modules)**
```sql
CREATE POLICY "Public can read active modules"
ON modules
FOR SELECT
USING (is_active = true);
```

**3. Admin Write Policy (lessons)**
```sql
CREATE POLICY "Editors can manage lessons"
ON lessons
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role IN ('editor', 'superadmin')
    AND admin_users.is_active = true
  )
);
```

---

## 📊 Indexes & Performance

### Critical Indexes

**1. User Lookups**
- `users.email` (UNIQUE)
- `user_profiles.user_id`

**2. Content Navigation**
- `topics.module_id`
- `lessons.topic_id`
- `questions.lesson_id`
- `flashcards.lesson_id`

**3. Progress Queries**
- `learning_completions (user_id, lesson_id)` (UNIQUE)
- `learning_completions.completed_at`
- `practice_sessions.user_id`

**4. Display Order**
- `modules.display_order`
- `topics.display_order`
- `lessons.display_order`

---

## 🔄 Cascading Rules

### ON DELETE CASCADE

**Content Hierarchy:**
- Delete Module → Cascade to Topics → Lessons → Questions/Flashcards

**User Data:**
- Delete User → Cascade to Profile, Completions, Sessions, Exams

### ON DELETE RESTRICT

**Protected References:**
- Cannot delete Subscription Plan if active subscriptions exist
- Cannot delete Admin User if they have approval records

---

## 💾 Data Types Guide

### UUID Generation
```sql
DEFAULT gen_random_uuid()
```

### Timestamp Defaults
```sql
DEFAULT NOW()
DEFAULT CURRENT_TIMESTAMP
```

### JSONB Usage
- `practice_results.answer_log`
- `mock_exams.exam_data`
- `ai_recommendations.recommendation_data`
- `user_analytics.analytics_data`

### Array Types
- `subscription_plans.features` (TEXT[])
- `email_templates.variables` (TEXT[])

---

## 🚀 Migration Guide

### Initial Setup

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)
```

### Sample Seed Data

```sql
-- Insert sample module
INSERT INTO modules (title, description, is_active, display_order)
VALUES ('Mathematics', 'Complete math course', true, 1);

-- Insert sample topic
INSERT INTO topics (module_id, title, description, is_active, display_order)
VALUES ('[module-id]', 'Algebra', 'Introduction to Algebra', true, 1);

-- Insert sample lesson
INSERT INTO lessons (topic_id, title, content, is_active, display_order)
VALUES ('[topic-id]', 'Basic Equations', 'Learn to solve equations...', true, 1);
```

---

## 📱 Mobile App Queries

### Common Query Patterns

**1. Get Learning Path**
```sql
SELECT m.*, t.*, l.*
FROM modules m
LEFT JOIN topics t ON t.module_id = m.id
LEFT JOIN lessons l ON l.topic_id = t.id
WHERE m.is_active = true
ORDER BY m.display_order, t.display_order, l.display_order;
```

**2. Get User Progress**
```sql
SELECT 
  l.*,
  CASE WHEN lc.id IS NOT NULL THEN true ELSE false END as is_completed
FROM lessons l
LEFT JOIN learning_completions lc 
  ON lc.lesson_id = l.id AND lc.user_id = '[user-id]'
WHERE l.topic_id = '[topic-id]';
```

**3. Get Practice Questions**
```sql
SELECT q.*, json_agg(qo.*) as options
FROM questions q
LEFT JOIN question_options qo ON qo.question_id = q.id
WHERE q.lesson_id = '[lesson-id]'
GROUP BY q.id;
```

---

## 🔗 Related Documentation

- [Mobile App Overview](./MOBILE_APP_OVERVIEW.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Authentication Flow](./AUTHENTICATION_FLOW.md) (Next to create)

---

**Database Version:** 1.0  
**Last Updated:** October 11, 2025  
**Maintained by:** vollstek@gmail.com
