# Design Document

## Overview

This design document defines the structure and content for comprehensive Supabase PostgreSQL database documentation for the Jeeva Learning platform. The documentation will serve as the single source of truth for all database artifacts, consolidating information from multiple existing sources and filling documentation gaps.

## Architecture

### Documentation Structure

All documentation files have been created and are available at `docs/03-Database/`:

| Document                  | Description                          | Link                                                        |
| ------------------------- | ------------------------------------ | ----------------------------------------------------------- |
| INDEX.md                  | Navigation and overview              | [View](../../../docs/03-Database/INDEX.md)                  |
| SCHEMA_COMPLETE.md        | All 58 tables with full details      | [View](../../../docs/03-Database/SCHEMA_COMPLETE.md)        |
| TRIGGERS_AND_FUNCTIONS.md | All triggers and functions           | [View](../../../docs/03-Database/TRIGGERS_AND_FUNCTIONS.md) |
| RLS_POLICIES.md           | Security policies                    | [View](../../../docs/03-Database/RLS_POLICIES.md)           |
| INDEXES.md                | Performance indexes                  | [View](../../../docs/03-Database/INDEXES.md)                |
| ER_DIAGRAMS.md            | Visual relationship diagrams         | [View](../../../docs/03-Database/ER_DIAGRAMS.md)            |
| DATA_TYPES.md             | Enums, JSONB structures, arrays      | [View](../../../docs/03-Database/DATA_TYPES.md)             |
| MIGRATIONS.md             | Migration history and guide          | [View](../../../docs/03-Database/MIGRATIONS.md)             |
| SCHEMA_LEGACY.md          | Archived original schema (24 tables) | [View](../../../docs/03-Database/SCHEMA_LEGACY.md)          |

```text
docs/03-Database/
├── INDEX.md                    # Navigation and overview
├── SCHEMA_COMPLETE.md          # All 53 tables with full details
├── TRIGGERS_AND_FUNCTIONS.md   # All triggers and functions
├── RLS_POLICIES.md             # Security policies
├── INDEXES.md                  # Performance indexes
├── ER_DIAGRAMS.md              # Visual relationship diagrams
├── DATA_TYPES.md               # Enums, JSONB structures, arrays
├── MIGRATIONS.md               # Migration history and guide
└── SCHEMA_LEGACY.md            # Archived original schema (24 tables)
```

### Information Sources

The documentation was consolidated from multiple existing sources into a single source of truth:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    ORIGINAL SOURCES (Consolidated)               │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ design.md        │  │ SCHEMA.md        │                    │
│  │ (53 tables)      │  │ (24 tables)      │                    │
│  └──────────────────┘  └──────────────────┘                    │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ TRIAL_MODULE_    │  │ database_        │                    │
│  │ SUPABASE_SCHEMA  │  │ triggers.sql     │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONSOLIDATED OUTPUT (Complete)                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              SCHEMA_COMPLETE.md                           │  │
│  │  ✅ All 58 tables with columns, types, constraints       │  │
│  │  ✅ Foreign key relationships                             │  │
│  │  ✅ Indexes per table                                     │  │
│  │  ✅ RLS status per table                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Note:** The original SCHEMA.md has been archived as [SCHEMA_LEGACY.md](../../../docs/03-Database/SCHEMA_LEGACY.md) for reference.

## Components and Interfaces

### Table Documentation Format

Each table will be documented using this consistent format:

```markdown
### table_name

**Purpose:** Brief description of what this table stores

**Schema:** public

| Column | Type | Nullable | Default           | Description |
| ------ | ---- | -------- | ----------------- | ----------- |
| id     | UUID | NO       | gen_random_uuid() | Primary key |
| ...    | ...  | ...      | ...               | ...         |

**Primary Key:** id

**Foreign Keys:**

- `column_name` → `referenced_table.referenced_column` (ON DELETE CASCADE)

**Unique Constraints:**

- `constraint_name` on (column1, column2)

**Check Constraints:**

- `constraint_name`: column IN ('value1', 'value2')

**Indexes:**

- `idx_name` on (column1, column2) [UNIQUE]

**RLS Enabled:** Yes/No

**Related Triggers:**

- `trigger_name` → `function_name` (BEFORE/AFTER INSERT/UPDATE/DELETE)
```

### Trigger Documentation Format

```markdown
### trigger_name

**Schema:** public/auth/storage

**Table:** table_name

**Timing:** BEFORE/AFTER

**Events:** INSERT, UPDATE, DELETE

**Level:** ROW/STATEMENT

**Function:** function_name

**Description:** What this trigger does and when it fires

**Side Effects:**

- Creates notification records
- Updates related tables
```

### Function Documentation Format

````markdown
### function_name()

**Schema:** public

**Returns:** return_type

**Security:** DEFINER/INVOKER

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| p_param1 | UUID | Description |

**Description:** What this function does

**Used By Triggers:**

- trigger_name on table_name

**Example Usage:**

```sql
SELECT * FROM function_name('param_value');
```
````

````

### RLS Policy Documentation Format

```markdown
### table_name Policies

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| policy_name | SELECT | auth.uid() = user_id | - |
| policy_name | INSERT | - | auth.uid() = user_id |
````

## Data Models

### Table Categories (58 Tables)

**Authentication & Users (5 tables):**

1. `users` - Student accounts
2. `user_profiles` - Extended profile data
3. `user_sessions` - Active session tracking
4. `admin_users` - Admin portal users
5. `notification_preferences` - User notification settings

**Learning Content (11 tables):** 6. `modules` - Top-level course modules 7. `topics` - Topics within modules 8. `subtopics` - Subtopics within topics 9. `lessons` - Lesson content 10. `lesson_content` - Rich lesson content blocks 11. `lesson_quizzes` - Quiz-question mapping 12. `questions` - Practice questions 13. `question_options` - MCQ answer options 14. `question_media` - Question attachments 15. `flashcards` - Study flashcards 16. `module_access_rules` - Access control per module

**Progress & Practice (12 tables):** 17. `learning_completions` - Lesson completion tracking 18. `learning_progress` - Subdivision progress 19. `learning_paths` - Personalized learning paths 20. `lesson_quiz_results` - Quiz attempt results 21. `practice_sessions` - Practice session records 22. `practice_results` - Individual practice answers 23. `mock_exam_config` - Exam configuration 24. `mock_exams` - Mock exam attempts 25. `mock_results` - Mock exam answers 26. `mock_sessions` - Mock session tracking 27. `ai_recommendations` - AI-generated suggestions 28. `user_analytics` - Engagement metrics

**Trial Module System (4 tables):** 29. `trial_mock_exams` - Trial exam definitions 30. `trial_exam_attempts` - Trial exam attempts 31. `trial_learning_progress` - Trial lesson progress 32. `trial_attempt_records` - Generic trial attempts

**Subscriptions & Payments (9 tables):** 33. `subscription_plans` - Duration-based plans 34. `subscriptions` - User subscription records 35. `subscription_usage` - Feature usage tracking 36. `discount_coupons` - Coupon codes 37. `payment_customers` - Payment customer records (Stripe/Razorpay) 38. `payment_methods` - Stored payment methods 39. `payments` - Payment transaction records 40. `payment_refunds` - Refund records 41. `payment_webhook_events` - Webhook event logging

**System & Settings (4 tables):** 42. `app_settings` - Application configuration 43. `dashboard_hero` / `hero_sections` - Dashboard banners 44. `content_approvals` - Content review queue 45. `email_templates` - Email templates

**AI & Chat (3 tables):** 46. `chat_conversations` - AI conversation threads 47. `chat_messages` - Individual messages 48. `ai_usage_stats` - Usage tracking

**Notifications (5 tables):** 49. `notifications` - Notification definitions 50. `notification_queue` - Delivery queue 51. `notification_targets` - Per-user delivery tracking 52. `push_tokens` - Device tokens 53. `user_notification_reads` - Read receipts

**Analytics (2 tables):** 54. `analytics_sessions` - User session tracking 55. `daily_stats` - Aggregated daily metrics

**Backup Tables (3 tables):** 56. `flashcards_backup` 57. `lessons_backup` 58. `questions_backup`

### Trigger Inventory (18 Triggers)

**Auth Schema (1):**

1. `on_auth_user_created_profile` → `handle_auth_user_created` (AFTER INSERT on users)

**Public Schema - Timestamp Triggers (8):** 2. `ai_usage_updated_at` → `update_ai_usage_timestamp` (BEFORE INSERT on ai_usage_stats) 3. `chat_conversation_updated_at` → `update_chat_conversation_timestamp` (BEFORE INSERT on chat_conversations) 4. `content_approvals_updated_at` → `update_content_approvals_updated_at` (BEFORE INSERT on content_approvals) 5. `update_notification_preferences_updated_at` → `update_notification_preferences_timestamp` (BEFORE INSERT on notification_preferences) 6. `notification_queue_updated_at` → `update_notification_queue_updated_at` (BEFORE INSERT on notification_queue) 7. `notification_targets_updated_at` → `update_notification_targets_updated_at` (BEFORE INSERT on notification_targets) 8. `notifications_updated_at` → `update_notifications_updated_at` (BEFORE INSERT on notifications) 9. `push_tokens_updated_at` → `update_push_tokens_updated_at` (BEFORE INSERT on push_tokens)

**Public Schema - Business Logic (1):** 10. `increment_coupon_on_subscription` → `increment_coupon_usage` (AFTER on subscriptions)

**Realtime Schema (1):** 11. `tr_check_filters` → `subscription_check_filters` (BEFORE INSERT on subscription)

**Storage Schema (7):** 12. `enforce_bucket_name_length_trigger` → `enforce_bucket_name_length` (BEFORE INSERT on buckets) 13. `objects_delete_delete_prefix` → `delete_prefix_hierarchy_trigger` (INSTEAD OF on objects) 14. `objects_insert_create_prefix` → `objects_insert_prefix_trigger` (BEFORE on objects) 15. `objects_update_create_prefix` → `objects_update_prefix_trigger` (BEFORE INSERT on objects) 16. `update_objects_updated_at` → `update_updated_at_column` (BEFORE INSERT on objects) 17. `prefixes_create_hierarchy` → `prefixes_insert_trigger` (BEFORE on prefixes) 18. `prefixes_delete_hierarchy` → `delete_prefix_hierarchy_trigger` (INSTEAD OF on prefixes)

### Function Inventory

**Notification Functions:**

- `notify_content_approved()` - Sends notification when content is approved
- `notify_content_rejected()` - Sends notification when content is rejected
- `notify_new_user_welcome()` - Sends welcome notification to new users
- `notify_subscription_activated()` - Sends notification when subscription activates
- `notify_study_streak()` - Sends streak achievement notifications
- `get_users_at_question_milestone()` - Gets users at practice milestones

**Timestamp Functions:**

- `update_ai_usage_timestamp()` - Updates ai_usage_stats.updated_at
- `update_chat_conversation_timestamp()` - Updates chat_conversations.updated_at
- `update_content_approvals_updated_at()` - Updates content_approvals.updated_at
- `update_notification_preferences_timestamp()` - Updates notification_preferences.updated_at
- `update_notification_queue_updated_at()` - Updates notification_queue.updated_at
- `update_notification_targets_updated_at()` - Updates notification_targets.updated_at
- `update_notifications_updated_at()` - Updates notifications.updated_at
- `update_push_tokens_updated_at()` - Updates push_tokens.updated_at
- `update_updated_at_column()` - Generic updated_at updater

**Auth Functions:**

- `handle_auth_user_created()` - Creates user profile on signup

**Business Logic Functions:**

- `increment_coupon_usage()` - Increments coupon usage count on subscription
- `check_module_access()` - Checks if user can access a module
- `get_trial_progress()` - Gets user's trial module progress
- `track_trial_to_paid_conversion()` - Tracks trial to paid conversion

**Storage Functions:**

- `enforce_bucket_name_length()` - Validates bucket name length
- `delete_prefix_hierarchy_trigger()` - Handles prefix deletion
- `objects_insert_prefix_trigger()` - Creates prefix on object insert
- `objects_update_prefix_trigger()` - Updates prefix on object update
- `prefixes_insert_trigger()` - Creates prefix hierarchy

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Documentation Completeness

_For any_ table in the Supabase public schema, there SHALL exist a corresponding entry in the documentation with table name and purpose description.

**Validates: Requirements 1.1, 2.1, 3.1, 4.1, 5.1, 8.1**

### Property 2: Column Detail Accuracy

_For any_ documented table column, the documented data type, nullability, and default value SHALL match the actual database column metadata.

**Validates: Requirements 1.2, 2.2, 3.2, 4.2, 5.2**

### Property 3: Foreign Key Documentation

_For any_ foreign key constraint in the database, there SHALL exist a corresponding entry in the documentation showing the referencing column, referenced table, referenced column, and ON DELETE behavior.

**Validates: Requirements 1.3**

### Property 4: Trigger-Function Cross-Reference

_For any_ trigger in the database, the documentation SHALL correctly identify the function it invokes, and for any function invoked by a trigger, the documentation SHALL list the trigger that invokes it.

**Validates: Requirements 2.2, 3.4**

### Property 5: RLS Gap Identification

_For any_ table in the public schema that does not have RLS enabled, the documentation SHALL explicitly identify it in the "Tables Needing RLS" section.

**Validates: Requirements 4.4**

### Property 6: Index Coverage for Foreign Keys

_For any_ foreign key column in the database, the documentation SHALL either show an existing index on that column or identify it as a potential performance issue.

**Validates: Requirements 5.4**

### Property 7: Relationship Cardinality

_For any_ foreign key relationship documented in the ER diagrams, the cardinality notation (1:1, 1:N, N:M) SHALL accurately reflect the actual constraint (unique vs non-unique foreign key).

**Validates: Requirements 6.4**

### Property 8: Enum Value Completeness

_For any_ column with a CHECK constraint defining allowed values, the documentation SHALL list all allowed values exactly as defined in the constraint.

**Validates: Requirements 7.1, 7.4**

## Error Handling

### Documentation Validation Errors

- **Missing Table**: If a table exists in the database but not in documentation, flag as "UNDOCUMENTED"
- **Column Mismatch**: If documented column differs from actual, flag as "OUTDATED"
- **Missing Trigger**: If a trigger exists but is not documented, flag as "UNDOCUMENTED TRIGGER"
- **RLS Gap**: If a table lacks RLS and is not in the gap list, flag as "SECURITY REVIEW NEEDED"

### Resolution Process

1. Run validation queries against live database
2. Compare with documentation
3. Generate diff report
4. Update documentation to match actual state
5. Re-validate

## Testing Strategy

### Dual Testing Approach

**Unit Tests:**

- Verify documentation file structure exists
- Verify required sections are present in each file
- Verify Mermaid diagram syntax is valid

**Property-Based Tests (fast-check):**

- Generate random table names and verify documentation lookup
- Generate random column queries and verify accuracy
- Generate random trigger queries and verify cross-references

### Validation Queries

```sql
-- Get all tables for completeness check
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- Get all columns for accuracy check
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' ORDER BY table_name, ordinal_position;

-- Get all foreign keys
SELECT tc.table_name, kcu.column_name, ccu.table_name AS referenced_table,
       ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';

-- Get all triggers
SELECT trigger_schema, trigger_name, event_manipulation, event_object_table,
       action_statement
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth', 'storage', 'realtime');

-- Get RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

### Test File Organization

```text
src/__tests__/
└── database-docs/
    ├── completeness.test.ts    # Property 1
    ├── accuracy.test.ts        # Property 2
    ├── foreign-keys.test.ts    # Property 3
    ├── triggers.test.ts        # Property 4
    ├── rls-gaps.test.ts        # Property 5
    ├── index-coverage.test.ts  # Property 6
    ├── cardinality.test.ts     # Property 7
    └── enums.test.ts           # Property 8
```

## Documentation Status

**Status:** ✅ Complete

All documentation files have been created and validated:

| Document                                                                         | Status      | Tables/Items Documented                      |
| -------------------------------------------------------------------------------- | ----------- | -------------------------------------------- |
| [SCHEMA_COMPLETE.md](../../../docs/03-Database/SCHEMA_COMPLETE.md)               | ✅ Complete | 58 tables                                    |
| [TRIGGERS_AND_FUNCTIONS.md](../../../docs/03-Database/TRIGGERS_AND_FUNCTIONS.md) | ✅ Complete | 18 triggers, 25+ functions                   |
| [RLS_POLICIES.md](../../../docs/03-Database/RLS_POLICIES.md)                     | ✅ Complete | 28 tables with RLS, 26 tables needing review |
| [INDEXES.md](../../../docs/03-Database/INDEXES.md)                               | ✅ Complete | All indexes documented                       |
| [ER_DIAGRAMS.md](../../../docs/03-Database/ER_DIAGRAMS.md)                       | ✅ Complete | 7 domain diagrams                            |
| [DATA_TYPES.md](../../../docs/03-Database/DATA_TYPES.md)                         | ✅ Complete | All enums, JSONB, arrays                     |
| [MIGRATIONS.md](../../../docs/03-Database/MIGRATIONS.md)                         | ✅ Complete | All migrations documented                    |
| [INDEX.md](../../../docs/03-Database/INDEX.md)                                   | ✅ Complete | Navigation hub                               |

**Entry Point:** Start with [INDEX.md](../../../docs/03-Database/INDEX.md) for navigation to all documentation.
