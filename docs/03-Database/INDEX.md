# Database Documentation Index

## Overview

The Jeeva Learning platform uses **Supabase PostgreSQL** as its database backend, shared between the admin portal and mobile app. This documentation provides a comprehensive reference for all database artifacts including tables, triggers, functions, RLS policies, and indexes.

**Database Provider:** Supabase  
**PostgreSQL Version:** 15+  
**Total Tables:** 58  
**Authentication:** Supabase Auth with RLS + OAuth (Google, Apple)  
**Last Updated:** December 2025

## Quick Start

- **Looking for table definitions?** → [SCHEMA_COMPLETE.md](./SCHEMA_COMPLETE.md)
- **Need to understand relationships?** → [ER_DIAGRAMS.md](./ER_DIAGRAMS.md)
- **Checking security policies?** → [RLS_POLICIES.md](./RLS_POLICIES.md)
- **Working with enums or JSONB?** → [DATA_TYPES.md](./DATA_TYPES.md)

## Documentation Structure

### Current Documentation

| Document                                                 | Description                                                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| [SCHEMA_COMPLETE.md](./SCHEMA_COMPLETE.md)               | Complete schema for all 58 tables with columns, types, and constraints |
| [TRIGGERS_AND_FUNCTIONS.md](./TRIGGERS_AND_FUNCTIONS.md) | All 18 triggers and associated functions                               |
| [RLS_POLICIES.md](./RLS_POLICIES.md)                     | Row Level Security policies and access control matrix                  |
| [INDEXES.md](./INDEXES.md)                               | Performance indexes and optimization recommendations                   |
| [ER_DIAGRAMS.md](./ER_DIAGRAMS.md)                       | Visual entity-relationship diagrams by domain                          |
| [DATA_TYPES.md](./DATA_TYPES.md)                         | Enums, JSONB structures, and array column definitions                  |
| [MIGRATIONS.md](./MIGRATIONS.md)                         | Migration history and schema evolution guide                           |

### Legacy Documentation (Archived)

| Document                               | Description                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [SCHEMA_LEGACY.md](./SCHEMA_LEGACY.md) | ⚠️ **ARCHIVED** - Original schema documentation (24 tables only). Use SCHEMA_COMPLETE.md instead. |

> **Note:** The original `SCHEMA.md` has been renamed to `SCHEMA_LEGACY.md` and is kept for historical reference only. All new development should reference `SCHEMA_COMPLETE.md` which documents all 58 tables.

## Database Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           JEEVA LEARNING DATABASE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │ Authentication  │    │ Learning        │    │ Progress &      │         │
│  │ & Users (5)     │───▶│ Content (11)    │───▶│ Practice (12)   │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│          │                      │                      │                    │
│          │                      │                      │                    │
│          ▼                      ▼                      ▼                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │ Subscriptions   │    │ Trial Module    │    │ Notifications   │         │
│  │ & Payments (9)  │    │ System (4)      │    │ (5)             │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│          │                      │                      │                    │
│          │                      │                      │                    │
│          ▼                      ▼                      ▼                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │ System &        │    │ AI & Chat       │    │ Analytics &     │         │
│  │ Settings (4)    │    │ (3)             │    │ Backup (5)      │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Quick Reference: All 58 Tables

### Authentication & Users (5 tables)

| #   | Table                      | Purpose                                       | RLS |
| --- | -------------------------- | --------------------------------------------- | --- |
| 1   | `users`                    | Student/learner accounts                      | ✅  |
| 2   | `user_profiles`            | Extended profile data (country, NMC attempts) | ✅  |
| 3   | `user_sessions`            | Active session tracking                       | ✅  |
| 4   | `admin_users`              | Admin portal users with roles                 | ✅  |
| 5   | `notification_preferences` | User notification settings                    | ✅  |

### Learning Content (11 tables)

| #   | Table                 | Purpose                        | RLS |
| --- | --------------------- | ------------------------------ | --- |
| 6   | `modules`             | Top-level course modules       | ✅  |
| 7   | `topics`              | Topics within modules          | ✅  |
| 8   | `subtopics`           | Subtopics within topics        | ✅  |
| 9   | `lessons`             | Lesson content with multimedia | ✅  |
| 10  | `lesson_content`      | Rich lesson content blocks     | ✅  |
| 11  | `lesson_quizzes`      | Quiz-question mapping          | ✅  |
| 12  | `questions`           | Practice questions             | ✅  |
| 13  | `question_options`    | MCQ answer options             | ✅  |
| 14  | `question_media`      | Question attachments           | ✅  |
| 15  | `flashcards`          | Study flashcards               | ✅  |
| 16  | `module_access_rules` | Access control per module      | ✅  |

### Progress & Practice (12 tables)

| #   | Table                  | Purpose                     | RLS |
| --- | ---------------------- | --------------------------- | --- |
| 17  | `learning_completions` | Lesson completion tracking  | ✅  |
| 18  | `learning_progress`    | Subdivision progress        | ✅  |
| 19  | `learning_paths`       | Personalized learning paths | ✅  |
| 20  | `lesson_quiz_results`  | Quiz attempt results        | ✅  |
| 21  | `practice_sessions`    | Practice session records    | ✅  |
| 22  | `practice_results`     | Individual practice answers | ✅  |
| 23  | `mock_exam_config`     | Exam configuration          | ✅  |
| 24  | `mock_exams`           | Mock exam attempts          | ✅  |
| 25  | `mock_results`         | Mock exam answers           | ✅  |
| 26  | `mock_sessions`        | Mock session tracking       | ✅  |
| 27  | `ai_recommendations`   | AI-generated suggestions    | ✅  |
| 28  | `user_analytics`       | Engagement metrics          | ✅  |

### Trial Module System (4 tables)

| #   | Table                     | Purpose                | RLS |
| --- | ------------------------- | ---------------------- | --- |
| 29  | `trial_mock_exams`        | Trial exam definitions | ✅  |
| 30  | `trial_exam_attempts`     | Trial exam attempts    | ✅  |
| 31  | `trial_learning_progress` | Trial lesson progress  | ✅  |
| 32  | `trial_attempt_records`   | Generic trial attempts | ✅  |

### Subscriptions & Payments (9 tables)

| #   | Table                    | Purpose                                    | RLS |
| --- | ------------------------ | ------------------------------------------ | --- |
| 33  | `subscription_plans`     | Duration-based plans                       | ⚠️  |
| 34  | `subscriptions`          | User subscription records                  | ✅  |
| 35  | `subscription_usage`     | Feature usage tracking                     | ⚠️  |
| 36  | `discount_coupons`       | Coupon codes                               | ⚠️  |
| 37  | `payment_customers`      | Payment customer records (Stripe/Razorpay) | ✅  |
| 38  | `payment_methods`        | Stored payment methods                     | ✅  |
| 39  | `payments`               | Payment transaction records                | ✅  |
| 40  | `payment_refunds`        | Refund records                             | ✅  |
| 41  | `payment_webhook_events` | Webhook event logging                      | ✅  |

### System & Settings (4 tables)

| #   | Table               | Purpose                   | RLS |
| --- | ------------------- | ------------------------- | --- |
| 42  | `app_settings`      | Application configuration | ⚠️  |
| 43  | `dashboard_hero`    | Dashboard banners         | ⚠️  |
| 44  | `content_approvals` | Content review queue      | ✅  |
| 45  | `email_templates`   | Email templates           | ⚠️  |

### AI & Chat (3 tables)

| #   | Table                | Purpose                 | RLS |
| --- | -------------------- | ----------------------- | --- |
| 46  | `chat_conversations` | AI conversation threads | ✅  |
| 47  | `chat_messages`      | Individual messages     | ✅  |
| 48  | `ai_usage_stats`     | Usage tracking          | ✅  |

### Notifications (5 tables)

| #   | Table                     | Purpose                    | RLS |
| --- | ------------------------- | -------------------------- | --- |
| 49  | `notifications`           | Notification definitions   | ✅  |
| 50  | `notification_queue`      | Delivery queue             | ⚠️  |
| 51  | `notification_targets`    | Per-user delivery tracking | ⚠️  |
| 52  | `push_tokens`             | Device tokens              | ⚠️  |
| 53  | `user_notification_reads` | Read receipts              | ✅  |

### Analytics & Backup (5 tables)

| #   | Table                | Purpose                  | RLS |
| --- | -------------------- | ------------------------ | --- |
| 54  | `analytics_sessions` | User session tracking    | ✅  |
| 55  | `daily_stats`        | Aggregated daily metrics | ✅  |
| 56  | `flashcards_backup`  | Flashcards backup        | ⚠️  |
| 57  | `lessons_backup`     | Lessons backup           | ⚠️  |
| 58  | `questions_backup`   | Questions backup         | ⚠️  |

**Legend:** ✅ RLS Enabled | ⚠️ RLS Review Needed

## Key Relationships

### Content Hierarchy

```text
modules (1) ──▶ (*) topics (1) ──▶ (*) subtopics (1) ──▶ (*) lessons
                                                              │
                    ┌─────────────────────────────────────────┤
                    │                    │                    │
                    ▼                    ▼                    ▼
              questions          flashcards          lesson_content
                    │
                    ▼
            question_options
```

### User Progress Flow

```text
users (1) ──▶ (*) learning_completions ──▶ (1) lessons
users (1) ──▶ (*) practice_sessions ──▶ (*) practice_results
users (1) ──▶ (*) mock_exams ──▶ (*) mock_results
users (1) ──▶ (*) subscriptions ──▶ (1) subscription_plans
```

## Related Documentation

- [Learning Module Structure](./LEARNING_MODULE_STRUCTURE.md) - Module hierarchy and content organization
- [Lesson Management Guide](./LESSON_MANAGEMENT_GUIDE.md) - Lesson creation and management
- [Modules and Questions Logic](./MODULES_AND_QUESTIONS_LOGIC.md) - Question logic and module flow

## Changelog

| Date       | Version | Changes                                                                       |
| ---------- | ------- | ----------------------------------------------------------------------------- |
| 2025-12-04 | 2.1     | Added 5 payment tables, updated column schemas, added learning_completions FK |
| 2025-12-03 | 2.0     | Complete documentation restructure with all 53 tables                         |
| -          | 1.0     | Original SCHEMA.md with 24 tables (now SCHEMA_LEGACY.md)                      |
