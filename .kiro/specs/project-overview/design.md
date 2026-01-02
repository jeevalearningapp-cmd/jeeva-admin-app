# Design Document

## Overview

The Jeeva Admin Portal is a full-stack web application built with React 18, TypeScript, and Material-UI v7 for the frontend, Express.js for the backend API, and Supabase (PostgreSQL) for the database. The system manages the Jeeva Learning mobile app ecosystem, providing comprehensive tools for content management, user administration, payment processing, and analytics.

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN PORTAL                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    React Frontend (Vite)                     │   │
│  │  Pages → Components → Hooks → API Clients → Zustand Store   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  Express.js API Server                       │   │
│  │  Routes: email, chat, payments, notifications, subscriptions │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  PostgreSQL  │  │    Auth      │  │   Storage    │              │
│  │  (53 tables) │  │  (RLS + JWT) │  │  (Media)     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐                                │
│  │   Triggers   │  │  Functions   │                                │
│  └──────────────┘  └──────────────┘                                │
└─────────────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │    Stripe    │  │    Resend    │  │ Google Gemini│              │
│  │  (Payments)  │  │   (Email)    │  │    (AI)      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
src/
├── api/              # Supabase & API clients
├── components/       # React components
│   ├── auth/         # Authentication (LoginForm, ProtectedRoute)
│   ├── common/       # Shared (ErrorBoundary, LoadingSpinner)
│   ├── content/      # Content management components
│   ├── layout/       # MainLayout, Sidebar, Header
│   └── TrialModuleManagement/  # Trial module admin
├── context/          # React context (Auth, Theme)
├── hooks/            # Custom hooks (useAuth, useSettings)
├── pages/            # Page components
├── types/            # TypeScript definitions
├── utils/            # Utility functions
└── App.tsx           # Main app with routing
```

### Backend Architecture

```
server/
├── routes/           # Express route handlers
│   ├── email.ts      # Email sending via Resend
│   ├── chat.ts       # AI chat via Gemini
│   ├── payments.ts   # Stripe payment processing
│   ├── notifications.ts  # Push notification management
│   ├── subscriptions.ts  # Subscription management
│   └── stripe-*.ts   # Stripe admin operations
├── services/         # Business logic services
│   └── notifications.ts  # Notification queue processor
├── lib/              # External service clients
└── index.ts          # Express server entry point
```

## Components and Interfaces

### Authentication Flow

```typescript
// AuthContext provides user state and auth methods
interface AuthContextType {
  user: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// ProtectedRoute guards routes by role
interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('superadmin' | 'editor' | 'moderator')[]
}
```

### Content Management Interfaces

```typescript
interface Module {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  is_active: boolean
  display_order: number
  is_trial: boolean
  icon?: string
  color?: string
  estimated_duration_hours?: number
  created_at: string
  updated_at: string
}

interface Topic {
  id: string
  module_id: string
  title: string
  description?: string
  is_active: boolean
  display_order: number
  is_trial_content: boolean
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
  lesson_type: 'text' | 'video' | 'audio'
  passing_score_percentage: number
  category?: string
  duration: number
  is_active: boolean
  display_order: number
  notes?: string
  is_trial_content: boolean
  unlock_threshold_percentage: number
  requires_unlocking: boolean
  created_at: string
  updated_at: string
}

interface Question {
  id: string
  lesson_id?: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  difficulty?: 'easy' | 'medium' | 'hard'
  points: number
  explanation?: string
  image_url?: string
  is_active: boolean
  module_type?: string
  category?: string
  subdivision?: string
  exam_part?: string
  is_trial_content: boolean
  trial_order?: number
  acceptable_range?: number
  unit?: string
  options?: QuestionOption[]
  created_at: string
  updated_at: string
}

interface QuestionOption {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  display_order: number
  created_at: string
}

interface Flashcard {
  id: string
  lesson_id?: string
  front: string
  back: string
  category?: string
  image_url?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}
```

### Payment & Subscription Interfaces

```typescript
interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price_usd: number
  duration_days: number
  features?: string[]
  is_active: boolean
  display_order: number
  config?: Record<string, any>
  created_at: string
  updated_at: string
}

interface Subscription {
  id: string
  user_id: string
  plan_type: string
  plan_id?: string
  start_date: string
  end_date: string
  is_active: boolean
  auto_renew: boolean
  status: 'active' | 'expired' | 'cancelled'
  payment_gateway?: string
  payment_method?: string
  amount_paid_usd?: number
  coupon_code?: string
  discount_amount?: number
  transaction_id?: string
  created_at: string
  updated_at: string
}

interface DiscountCoupon {
  id: string
  code: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  applicable_plans?: string[]
  usage_limit?: number
  usage_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface SubscriptionUsage {
  id: string
  user_id: string
  feature: string
  used_this_month: number
  limit_this_month?: number
  reset_date: string
  created_at: string
  updated_at: string
}
```

### Trial Module Interfaces

```typescript
interface TrialMockExam {
  id: string
  module_id: string
  title: string
  description?: string
  question_count: number
  time_limit_minutes: number
  passing_score: number
  question_ids: string[]
  allow_mark_for_review: boolean
  allow_answer_changes: boolean
  show_question_navigator: boolean
  auto_submit_at_time_limit: boolean
  show_results_immediately: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

interface TrialExamAttempt {
  id: string
  user_id: string
  exam_id: string
  total_questions: number
  correct_answers?: number
  incorrect_answers?: number
  score?: number
  percentage_score?: number
  is_passed?: boolean
  user_answers?: Record<string, any>
  marked_for_review?: Record<string, any>
  started_at: string
  completed_at: string
  duration_seconds?: number
  topic_scores?: Record<string, any>
  status: 'in_progress' | 'completed' | 'abandoned'
  device_type?: string
  created_at: string
  updated_at: string
}

interface TrialLearningProgress {
  id: string
  user_id: string
  topic_id: string
  lesson_id: string
  is_started: boolean
  is_completed: boolean
  is_unlocked: boolean
  assessment_score?: number
  assessment_percentage?: number
  assessment_passed?: boolean
  assessment_attempts: number
  content_viewed?: Record<string, any>
  estimated_time_spent_minutes?: number
  started_at?: string
  completed_at?: string
  last_accessed_at?: string
  created_at: string
  updated_at: string
}
```

### API Route Structure

| Route | Purpose |
|-------|---------|
| `/api/email` | Email sending via Resend |
| `/api/chat` | AI chat via Google Gemini |
| `/api/payments` | Stripe payment processing |
| `/api/notifications` | Push notification management |
| `/api/subscriptions` | Subscription CRUD operations |
| `/api/stripe-admin` | Stripe dashboard operations |
| `/api/stripe-coupons` | Stripe coupon management |
| `/api/country` | Country/currency detection |

## Data Models

### Database Schema Overview (53 Tables)

**Authentication & Users (5 tables):**

- `users` - Student accounts with auth credentials (id, email, password_hash, auth_provider, is_email_verified)
- `user_profiles` - Extended profile data (full_name, phone_number, country_code, date_of_birth, gender, current_country, nmc_attempts, uses_coaching, nursing_id_url, profile_completed, oauth_provider)
- `user_sessions` - Active session tracking (device_info, session_token, ip_address, user_agent, last_active_at)
- `admin_users` - Admin portal users (email, password_hash, full_name, role: superadmin|editor|moderator, is_active)
- `notification_preferences` - User notification settings (push_enabled, email_enabled, in_app_enabled, quiet_hours)

**Learning Content (11 tables):**

- `modules` - Top-level course modules (title, description, thumbnail_url, is_active, display_order, is_trial, icon, color, estimated_duration_hours)
- `topics` - Topics within modules (module_id, title, description, is_active, display_order, is_trial_content)
- `subtopics` - Subtopics within topics (topic_id, name, description, position)
- `lessons` - Lesson content (topic_id, title, content, video_url, audio_url, lesson_type, passing_score_percentage, category, duration, notes, is_trial_content, unlock_threshold_percentage, requires_unlocking)
- `lesson_content` - Rich lesson content blocks (lesson_id, content_type, title, description, content_url, content_text, content_data, duration_seconds)
- `lesson_quizzes` - Quiz-question mapping (lesson_id, question_id, position)
- `questions` - Practice questions (lesson_id, question_text, question_type, difficulty, points, explanation, image_url, module_type, category, subdivision, exam_part, is_trial_content, trial_order, acceptable_range, unit)
- `question_options` - MCQ answer options (question_id, option_text, is_correct, display_order)
- `question_media` - Question attachments (question_id, media_type, media_url)
- `flashcards` - Study flashcards (lesson_id, front, back, category, image_url, is_active, display_order)
- `module_access_rules` - Access control per module (module_id, access_type, requires_payment, description)

**Progress & Practice (12 tables):**

- `learning_completions` - Lesson completion tracking (user_id, lesson_id, is_completed, completed_at, time_spent_minutes)
- `learning_progress` - Subdivision progress (user_id, subdivision, status, score_percentage, attempts, best_score, last_attempted_at)
- `learning_paths` - Personalized learning paths (user_id, path_type, details, current_index)
- `lesson_quiz_results` - Quiz attempt results (user_id, lesson_id, score_percentage, passed, completed_at)
- `practice_sessions` - Practice session records (user_id, module_id, topic_id, subtopic_id, subdivision, started_at, completed_at, total_questions, correct_count, incorrect_count, skipped_count)
- `practice_results` - Individual practice answers (session_id, question_id, selected_option_id, is_correct, time_taken_seconds)
- `mock_exam_config` - Exam configuration (part_a_question_count, part_a_duration_minutes, part_b_question_count, part_b_duration_minutes, allow_calculator)
- `mock_exams` - Mock exam attempts (user_id, started_at, completed_at, total_questions, correct_count, incorrect_count, skipped_count)
- `mock_results` - Mock exam answers (mock_exam_id, question_id, selected_option_id, is_correct, time_taken_seconds)
- `mock_sessions` - Mock session tracking (user_id, exam_part, started_at, completed_at, total_questions, correct_answers, score_percentage, time_taken_minutes, passed)
- `ai_recommendations` - AI-generated suggestions (user_id, recommendation_type, reference_id, score, expires_at)
- `user_analytics` - Engagement metrics per topic (user_id, topic_id, subtopic_id, practice_attempts, correct_count, incorrect_count, average_time_seconds)

**Trial Module System (4 tables):**

- `trial_mock_exams` - Trial exam definitions (module_id, title, description, question_count, time_limit_minutes, passing_score, question_ids[], allow_mark_for_review, allow_answer_changes, show_question_navigator, auto_submit_at_time_limit, show_results_immediately)
- `trial_exam_attempts` - Trial exam attempts (user_id, exam_id, total_questions, correct_answers, incorrect_answers, score, percentage_score, is_passed, user_answers, marked_for_review, started_at, completed_at, duration_seconds, topic_scores, status, device_type)
- `trial_learning_progress` - Trial lesson progress (user_id, topic_id, lesson_id, is_started, is_completed, is_unlocked, assessment_score, assessment_percentage, assessment_passed, assessment_attempts, content_viewed, estimated_time_spent_minutes)
- `trial_attempt_records` - Generic trial attempts (user_id, module_id, content_type, section_type, total_questions, correct_answers, score, percentage_score, started_at, completed_at, duration_seconds, is_passed, status, answers_data, question_details, device_type)

**Subscriptions & Payments (4 tables):**

- `subscription_plans` - Duration-based plans (name, description, price_usd, duration_days, features[], is_active, display_order, config)
- `subscriptions` - User subscription records (user_id, plan_type, plan_id, start_date, end_date, is_active, auto_renew, status, payment_gateway, payment_method, amount_paid_usd, coupon_code, discount_amount, transaction_id)
- `subscription_usage` - Feature usage tracking (user_id, feature, used_this_month, limit_this_month, reset_date)
- `discount_coupons` - Coupon codes (code, description, discount_type, discount_value, applicable_plans[], usage_limit, usage_count, valid_from, valid_until, is_active)

**System & Settings (4 tables):**

- `app_settings` - Application configuration (site_name, site_description, contact_email, support_email, logo_url, favicon_url, default_notification_image_url, maintenance_mode, registration_enabled, email_verification_required, max_file_upload_size, allowed_file_types[], session_timeout, password policies, notification toggles)
- `dashboard_hero` - Dashboard banners (image_url, headline, subheadline, button_text, button_link, is_active, display_order, title_color, subtitle_color, button_text_color, button_background_color)
- `content_approvals` - Content review queue (resource_id, resource_type, resource_title, status, submitted_by, reviewed_by, review_comments, reviewed_at)
- `email_templates` - Email templates (template_name, subject, html_content, variables)

**AI & Chat (3 tables):**

- `chat_conversations` - AI conversation threads (user_id, title, context_data, is_active)
- `chat_messages` - Individual messages (conversation_id, role, content, metadata)
- `ai_usage_stats` - Usage tracking (user_id, date, message_count, total_tokens, total_cost)

**Notifications (5 tables):**

- `notifications` - Notification definitions (title, body, image_url, data, audience_filter, scheduled_for, sent_at, status, notification_type, total_recipients, total_sent, total_delivered, total_failed, created_by)
- `notification_queue` - Delivery queue (notification_id, run_at, attempts, max_attempts, last_attempt_at, next_retry_at, status, last_error)
- `notification_targets` - Per-user delivery tracking (notification_id, user_id, push_token_id, delivery_status, expo_ticket_id, expo_receipt_id, sent_at, delivered_at, read_at, error_code, error_message)
- `push_tokens` - Device tokens (user_id, expo_push_token, device_id, platform, is_active, last_seen_at)
- `user_notification_reads` - Read receipts (user_id, notification_id, read_at)

**Analytics (2 tables):**

- `analytics_sessions` - User session tracking (user_id, session_start, session_end, duration_seconds)
- `daily_stats` - Aggregated daily metrics (date, total_signups, total_conversions, active_users, total_sessions, avg_session_duration, total_revenue)

**Backup Tables (3 tables):**

- `flashcards_backup` - Flashcard backup data
- `lessons_backup` - Lesson backup data
- `questions_backup` - Question backup data

### Key Database Relationships

```text
modules (1) ──→ (*) topics (1) ──→ (*) subtopics
                    │
                    └──→ (*) lessons (1) ──→ (*) lesson_content
                                    │
                                    ├──→ (*) questions ──→ (*) question_options
                                    │                  └──→ (*) question_media
                                    ├──→ (*) flashcards
                                    └──→ (*) lesson_quizzes

modules (1) ──→ (*) module_access_rules
modules (1) ──→ (*) trial_mock_exams ──→ (*) trial_exam_attempts

users (1) ──→ (1) user_profiles
users (1) ──→ (*) user_sessions
users (1) ──→ (*) subscriptions ──→ (1) subscription_plans
users (1) ──→ (*) subscription_usage
users (1) ──→ (*) learning_completions ──→ (1) lessons
users (1) ──→ (*) learning_progress
users (1) ──→ (*) learning_paths
users (1) ──→ (*) practice_sessions ──→ (*) practice_results
users (1) ──→ (*) mock_exams ──→ (*) mock_results
users (1) ──→ (*) mock_sessions
users (1) ──→ (*) chat_conversations ──→ (*) chat_messages
users (1) ──→ (*) ai_usage_stats
users (1) ──→ (*) ai_recommendations
users (1) ──→ (*) push_tokens
users (1) ──→ (*) notification_preferences
users (1) ──→ (*) notification_targets
users (1) ──→ (*) user_notification_reads
users (1) ──→ (*) analytics_sessions
users (1) ──→ (*) trial_learning_progress
users (1) ──→ (*) trial_attempt_records

notifications (1) ──→ (*) notification_queue
notifications (1) ──→ (*) notification_targets
```

### Row Level Security (RLS) Policies

**Admin Role Hierarchy:**

| Role | Permissions |
|------|-------------|
| `superadmin` | Full CRUD on all tables, can manage admin users |
| `editor` | Create/update content (modules, lessons, questions, flashcards), create notifications |
| `moderator` | Read-only access to content and analytics |

**RLS Policy Patterns:**

1. **User Data Isolation**: Users can only access their own data
   - Pattern: `user_id = auth.uid()`
   - Applied to: subscriptions, learning_completions, practice_sessions, chat_conversations, etc.

2. **Admin Access via Lookup**: Admin permissions verified via admin_users table
   - Pattern: `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true)`

3. **Public Read for Active Content**: Anyone can read active content
   - Pattern: `is_active = true`
   - Applied to: modules, lessons, topics, mock_exam_config

4. **Service Role Bypass**: Backend operations use service_role for full access
   - Pattern: `true` for service_role
   - Applied to: learning_completions, learning_progress, mock_sessions, notifications

**Tables with RLS Enabled (28 tables):**

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| admin_users | Own record only | Superadmin only | Superadmin only | Superadmin only |
| ai_recommendations | Own only | Own only | Own only | Own only |
| ai_usage_stats | Own + Admin view | Own only | Own only | - |
| analytics_sessions | Own only | Own only | Own only | Own only |
| chat_conversations | Own + Admin view | Own only | Own only | - |
| chat_messages | Own (via conversation) + Admin | Own only | - | - |
| content_approvals | Editor/Moderator/Superadmin | Editor/Superadmin | Own pending + Superadmin | Superadmin |
| flashcards | Editor/Moderator/Superadmin | Editor/Superadmin | Editor/Superadmin | Superadmin |
| learning_completions | Own + Admin view | Own only | Own only | - |
| learning_paths | Own only | Own only | Own only | Own only |
| learning_progress | Own only | Service role | Service role | - |
| lesson_content | Admin + Trial content | Admin only | Admin only | Admin only |
| lesson_quiz_results | Own + Admin view | Own only | - | - |
| lessons | Public active + Admin | Editor/Superadmin | Editor/Superadmin | Superadmin |
| mock_exam_config | Public view | Admin only | Admin only | Admin only |
| mock_exams | Own only | Own only | - | - |
| mock_results | Own (via exam) | Own (via exam) | - | - |
| mock_sessions | Own only | Own only | Own only | - |
| module_access_rules | Public active | Admin only | Admin only | Admin only |
| modules | Public active + Admin | Editor/Superadmin | Editor/Superadmin | Superadmin |
| notification_preferences | Own only | Own only | Own only | - |
| notification_queue | Admin view | Service role | Service role | Service role |
| notification_targets | Own + Admin view | Service role | Service role | Service role |
| notifications | Public view | Editor/Superadmin | Editor/Superadmin | Superadmin |

**Tables Needing RLS Policies (26 tables):**

- `daily_stats`, `dashboard_hero`, `discount_coupons`, `email_templates`
- `app_settings`, `subscription_plans`, `subscriptions`, `subscription_usage`
- `subtopics`, `topics`, `questions`, `question_options`, `question_media`
- `practice_sessions`, `practice_results`, `user_analytics`
- `user_profiles`, `user_sessions`, `users`
- `trial_mock_exams`, `trial_exam_attempts`, `trial_learning_progress`, `trial_attempt_records`
- `flashcards_backup`, `lessons_backup`, `questions_backup`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Role-Based Access Control Consistency
*For any* admin user with a specific role, accessing any protected route SHALL either grant access (if role is in allowedRoles) or redirect to dashboard (if role is not permitted)
**Validates: Requirements 1.2, 1.3, 1.4**

### Property 2: Content Hierarchy Integrity
*For any* content item (topic, lesson, question, flashcard), the parent reference SHALL always point to an existing, active parent entity
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Question Option Correctness
*For any* multiple choice question, exactly one option SHALL be marked as is_correct = true
**Validates: Requirements 2.5**

### Property 4: Subscription Status Consistency
*For any* subscription record, the status SHALL be 'active' only when current_date is between start_date and end_date
**Validates: Requirements 4.5**

### Property 5: Payment Amount Calculation
*For any* payment with a discount coupon, finalAmount SHALL equal originalAmount minus discountAmount, and discountAmount SHALL not exceed originalAmount
**Validates: Requirements 4.3**

### Property 6: Trial Module Configuration Bounds
*For any* trial mock exam configuration, question_count SHALL be exactly 20, time_limit_minutes SHALL be exactly 30, and passing_score SHALL be between 0 and 100
**Validates: Requirements 5.3**

### Property 7: AI Usage Rate Limiting
*For any* user on any given day, the message_count in ai_usage_stats SHALL not exceed the configured daily limit (default: 50)
**Validates: Requirements 8.2**

### Property 8: Notification Delivery Tracking
*For any* notification in the queue with status 'sent', there SHALL exist corresponding delivery records with timestamps
**Validates: Requirements 7.4**

## Error Handling

### Frontend Error Handling

- **ErrorBoundary**: Catches React component errors and displays fallback UI
- **API Error Handling**: All API calls wrapped in try-catch with user-friendly error messages via Notistack
- **Form Validation**: Client-side validation with immediate feedback before submission
- **Network Errors**: Retry logic with exponential backoff for transient failures

### Backend Error Handling

- **Express Error Middleware**: Centralized error handling for all routes
- **Stripe Webhook Verification**: Signature validation to prevent spoofed events
- **Database Errors**: Graceful handling of constraint violations and connection issues
- **Rate Limiting**: 429 responses for exceeded API limits

### Error Response Format

```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, any>
  }
}
```

## Testing Strategy

### Unit Testing (Vitest + React Testing Library)

- **Component Tests**: Test UI components in isolation with mocked data
- **Hook Tests**: Test custom hooks with mock Supabase client
- **Utility Tests**: Test pure functions for data transformation and validation
- **Service Tests**: Test backend services with mocked external APIs

### Property-Based Testing (fast-check)

Property-based tests SHALL be written using the `fast-check` library to verify correctness properties across randomly generated inputs.

Each property-based test MUST:
1. Be annotated with the property number from the design document
2. Run a minimum of 100 iterations
3. Use smart generators that constrain to valid input spaces

### Integration Testing

- **API Route Tests**: Test Express routes with supertest
- **Database Tests**: Test Supabase queries against test database
- **Webhook Tests**: Test Stripe webhook handlers with mock events

### Test File Organization

```
src/__tests__/           # Frontend tests
├── pages/               # Page component tests
├── hooks/               # Custom hook tests
└── services/            # Service tests

server/__tests__/        # Backend tests
├── routes/              # Route handler tests
└── services/            # Service tests
```
