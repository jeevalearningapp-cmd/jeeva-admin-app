# Database Migrations Reference

This document provides a comprehensive reference for all database migrations in the Jeeva Learning platform. It includes migration history, dependencies, rollback information, and conflict resolution strategies.

## Overview

The Jeeva Learning platform uses two migration directories:

- `database/migrations/` - Manual SQL migrations for Supabase SQL Editor
- `supabase/migrations/` - Timestamped migrations for Supabase CLI

All migrations are designed to be idempotent using `IF NOT EXISTS` and `ON CONFLICT DO NOTHING` patterns.

## Migration Files by Feature Area

### Core Content Management

| File                              | Summary                                                  | Tables Created/Modified                                           |
| --------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| `create_content_tables.sql`       | Creates core content management tables with RLS policies | modules, topics, lessons, flashcards, questions, question_options |
| `create_app_settings.sql`         | Creates platform configuration table                     | app_settings                                                      |
| `create_learning_completions.sql` | Creates user progress tracking table                     | learning_completions                                              |

### NMC Course Structure

| File                              | Summary                                    | Tables Created/Modified                                                               |
| --------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------- |
| `restructure_for_nmc_modules.sql` | Converts to fixed 3-module NMC structure   | questions (add columns), lessons (add columns), mock_exam_config, lesson_quiz_results |
| `add_subtopics_to_lessons.sql`    | Adds hierarchical subtopic support         | lessons (add category column)                                                         |
| `add_category_to_flashcards.sql`  | Enables topic-level flashcard organization | flashcards (add category column, make lesson_id nullable)                             |
| `add_audio_to_lessons.sql`        | Adds audio/podcast support to lessons      | lessons (add audio_url column)                                                        |

### Trial Module System

| File                                 | Summary                                        | Tables Created/Modified                                                                                                                                                                                                 |
| ------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `001_create_trial_module_schema.sql` | Creates trial module schema with access rules  | modules (add columns), topics (add columns), lessons (add columns), questions (add columns), module_access_rules, lesson_content, trial_attempt_records, trial_learning_progress, trial_mock_exams, trial_exam_attempts |
| `TRIAL_MODULE_FINAL.sql`             | Final trial module schema (fixed column names) | Same as above with corrected column references                                                                                                                                                                          |
| `TRIAL_MODULE_SCHEMA_CLEAN.sql`      | Clean version of trial module schema           | Same as above                                                                                                                                                                                                           |
| `TRIAL_MODULE_SCHEMA_FIXED.sql`      | Fixed version addressing schema issues         | Same as above                                                                                                                                                                                                           |

### Payment System

| File                        | Summary                                                 | Tables Created/Modified                                                               |
| --------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `create_payment_system.sql` | Creates dual payment gateway system (Stripe + Razorpay) | payment_customers, payment_methods, payments, payment_refunds, payment_webhook_events |

### Notifications System

| File                            | Summary                                | Tables Created/Modified                                              |
| ------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| `create_push_notifications.sql` | Creates Expo Push Notifications system | push_tokens, notifications, notification_targets, notification_queue |
| `add_inapp_notifications.sql`   | Adds in-app notification tracking      | user_notification_reads, notification_preferences                    |

### Foreign Key Fixes

| File                              | Summary                                                   | Tables Modified      |
| --------------------------------- | --------------------------------------------------------- | -------------------- |
| `fix_learning_completions_fk.sql` | Adds missing FK constraint for PostgREST embedded queries | learning_completions |

### Supabase CLI Migrations

| File                                         | Date       | Summary                                |
| -------------------------------------------- | ---------- | -------------------------------------- |
| `20251204_fix_learning_completions_fk.sql`   | 2025-12-04 | Fix learning_completions FK to lessons |
| `20251116042624_add_inapp_notifications.sql` | 2025-11-16 | In-app notifications (CLI version)     |
| `20251116042936_add_inapp_notifications.sql` | 2025-11-16 | In-app notifications (duplicate/retry) |

## Recommended Execution Order

For a fresh database setup, execute migrations in this order:

```
1. create_content_tables.sql          # Core tables (modules, topics, lessons, questions)
2. create_app_settings.sql            # Platform configuration
3. create_learning_completions.sql    # User progress tracking
4. restructure_for_nmc_modules.sql    # NMC 3-module structure
5. add_subtopics_to_lessons.sql       # Hierarchical subtopics
6. add_category_to_flashcards.sql     # Flashcard categories
7. add_audio_to_lessons.sql           # Audio support
8. 001_create_trial_module_schema.sql # Trial module system
9. create_payment_system.sql          # Payment gateway
10. create_push_notifications.sql     # Push notifications
11. add_inapp_notifications.sql       # In-app notifications
```

## Migration Details

### create_content_tables.sql

**Purpose:** Creates the foundational content management system tables.

**Tables Created:**

- `modules` - Top-level course modules
- `topics` - Topics within modules
- `lessons` - Lesson content
- `flashcards` - Study flashcards
- `questions` - Practice questions
- `question_options` - MCQ answer options

**Dependencies:** Requires `admin_users` table to exist for RLS policies.

**RLS Policies:** Creates role-based policies for superadmin, editor, and moderator roles.

**Reversible:** Yes

**Rollback:**

```sql
DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS flashcards CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
```

---

### create_app_settings.sql

**Purpose:** Creates platform configuration table with default settings.

**Tables Created:**

- `app_settings` - Application configuration (site name, feature toggles, security settings)

**Dependencies:** Requires `admin_users` table for RLS policies.

**Triggers Created:**

- `app_settings_updated_at` → `update_app_settings_updated_at()`

**Reversible:** Yes

**Rollback:**

```sql
DROP TRIGGER IF EXISTS app_settings_updated_at ON app_settings;
DROP FUNCTION IF EXISTS update_app_settings_updated_at();
DROP TABLE IF EXISTS app_settings CASCADE;
```

---

### create_learning_completions.sql

**Purpose:** Tracks user progress through lessons for analytics dashboard.

**Tables Created:**

- `learning_completions` - User lesson completion tracking

**Dependencies:**

- `auth.users` table
- `lessons` table
- `admin_users` table for RLS policies

**Reversible:** Yes

**Rollback:**

```sql
DROP TABLE IF EXISTS learning_completions CASCADE;
```

---

### restructure_for_nmc_modules.sql

**Purpose:** Converts from dynamic modules to fixed 3-module NMC CBT structure.

**Schema Changes:**

- Adds columns to `questions`: module_type, category, subdivision, exam_part
- Adds columns to `lessons`: lesson_type, passing_score_percentage

**Tables Created:**

- `mock_exam_config` - Exam configuration (Part A: 15 questions/30 min, Part B: 120 questions/150 min)
- `lesson_quiz_results` - Quiz attempt results with 80% passing requirement

**Functions Created:**

- `get_random_mock_exam_questions()` - Selects random questions for mock exams

**Seed Data:**

- 3 fixed modules (Practice, Learning, Mock Exams)
- Topics for Practice and Learning modules
- 10 sample questions with options

**Dependencies:**

- `modules` table
- `topics` table
- `lessons` table
- `questions` table
- `question_options` table
- `auth.users` table
- `admin_users` table

**Reversible:** Partial (data migrations are not reversible)

**Rollback:**

```sql
-- Remove new columns
ALTER TABLE questions DROP COLUMN IF EXISTS module_type;
ALTER TABLE questions DROP COLUMN IF EXISTS category;
ALTER TABLE questions DROP COLUMN IF EXISTS subdivision;
ALTER TABLE questions DROP COLUMN IF EXISTS exam_part;
ALTER TABLE lessons DROP COLUMN IF EXISTS lesson_type;
ALTER TABLE lessons DROP COLUMN IF EXISTS passing_score_percentage;

-- Drop new tables
DROP TABLE IF EXISTS lesson_quiz_results CASCADE;
DROP TABLE IF EXISTS mock_exam_config CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS get_random_mock_exam_questions;

-- Note: Seeded modules, topics, and questions must be manually removed
```

---

### 001_create_trial_module_schema.sql

**Purpose:** Creates comprehensive trial module system with access control.

**Schema Changes:**

- Adds columns to `modules`: is_trial, icon, color, estimated_duration_hours
- Adds columns to `topics`: is_trial_content
- Adds columns to `lessons`: is_trial_content, unlock_threshold_percentage, requires_unlocking
- Adds columns to `questions`: is_trial_content, trial_order, acceptable_range, unit

**Tables Created:**

- `module_access_rules` - Access control per module (free, trial, subscriber)
- `lesson_content` - Rich lesson content blocks (video, audio, text, flashcard, mcq, assessment)
- `trial_attempt_records` - Generic trial attempt tracking
- `trial_learning_progress` - Trial lesson progress
- `trial_mock_exams` - Trial exam definitions
- `trial_exam_attempts` - Trial exam attempts

**Functions Created:**

- `check_module_access()` - Checks if user can access a module

**Dependencies:**

- `modules` table
- `topics` table
- `lessons` table
- `questions` table
- `user_profiles` table
- `subscription_plans` table
- `subscriptions` table
- `auth.users` table

**Reversible:** Partial

**Rollback:**

```sql
-- Drop new tables
DROP TABLE IF EXISTS trial_exam_attempts CASCADE;
DROP TABLE IF EXISTS trial_mock_exams CASCADE;
DROP TABLE IF EXISTS trial_learning_progress CASCADE;
DROP TABLE IF EXISTS trial_attempt_records CASCADE;
DROP TABLE IF EXISTS lesson_content CASCADE;
DROP TABLE IF EXISTS module_access_rules CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS check_module_access;

-- Remove new columns
ALTER TABLE modules DROP COLUMN IF EXISTS is_trial;
ALTER TABLE modules DROP COLUMN IF EXISTS icon;
ALTER TABLE modules DROP COLUMN IF EXISTS color;
ALTER TABLE modules DROP COLUMN IF EXISTS estimated_duration_hours;
ALTER TABLE topics DROP COLUMN IF EXISTS is_trial_content;
ALTER TABLE lessons DROP COLUMN IF EXISTS is_trial_content;
ALTER TABLE lessons DROP COLUMN IF EXISTS unlock_threshold_percentage;
ALTER TABLE lessons DROP COLUMN IF EXISTS requires_unlocking;
ALTER TABLE questions DROP COLUMN IF EXISTS is_trial_content;
ALTER TABLE questions DROP COLUMN IF EXISTS trial_order;
ALTER TABLE questions DROP COLUMN IF EXISTS acceptable_range;
ALTER TABLE questions DROP COLUMN IF EXISTS unit;
```

---

### create_payment_system.sql

**Purpose:** Creates dual payment gateway system supporting Stripe and Razorpay.

**Enums Created:**

- `payment_gateway` - stripe, razorpay
- `payment_status` - pending, processing, succeeded, failed, cancelled, refunded
- `payment_method_type` - card, upi, netbanking, wallet, other
- `currency_code` - USD, GBP, EUR, INR

**Tables Created:**

- `payment_customers` - Gateway customer IDs
- `payment_methods` - Saved payment methods
- `payments` - Main payment records
- `payment_refunds` - Refund tracking
- `payment_webhook_events` - Webhook event logging

**Functions Created:**

- `get_payment_gateway_for_user()` - Returns gateway based on country (IN → Razorpay, others → Stripe)
- `get_user_payment_summary()` - Returns payment statistics for a user
- `update_payment_timestamp()` - Updates timestamp on record changes
- `set_payment_completed_at()` - Sets completed_at when status changes to succeeded

**Dependencies:**

- `auth.users` table
- `subscriptions` table
- `subscription_plans` table
- `discount_coupons` table
- `admin_users` table

**Reversible:** Yes (but data will be lost)

**Rollback:**

```sql
DROP TABLE IF EXISTS payment_webhook_events CASCADE;
DROP TABLE IF EXISTS payment_refunds CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS payment_customers CASCADE;

DROP FUNCTION IF EXISTS get_payment_gateway_for_user;
DROP FUNCTION IF EXISTS get_user_payment_summary;
DROP FUNCTION IF EXISTS update_payment_timestamp;
DROP FUNCTION IF EXISTS set_payment_completed_at;

DROP TYPE IF EXISTS payment_gateway;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS payment_method_type;
DROP TYPE IF EXISTS currency_code;
```

---

### create_push_notifications.sql

**Purpose:** Creates Expo Push Notifications system for mobile app.

**Tables Created:**

- `push_tokens` - User device push notification tokens
- `notifications` - Notification campaigns (manual and automated)
- `notification_targets` - Per-user delivery tracking
- `notification_queue` - Scheduled notifications and retry logic

**Functions Created:**

- `get_notification_stats()` - Returns delivery statistics for a campaign
- `mark_inactive_push_tokens()` - Marks tokens inactive after 90 days

**Triggers Created:**

- `push_tokens_updated_at` → `update_push_tokens_updated_at()`
- `notifications_updated_at` → `update_notifications_updated_at()`
- `notification_targets_updated_at` → `update_notification_targets_updated_at()`
- `notification_queue_updated_at` → `update_notification_queue_updated_at()`

**Dependencies:**

- `auth.users` table
- `admin_users` table

**Reversible:** Yes

**Rollback:**

```sql
DROP TABLE IF EXISTS notification_queue CASCADE;
DROP TABLE IF EXISTS notification_targets CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS push_tokens CASCADE;

DROP FUNCTION IF EXISTS get_notification_stats;
DROP FUNCTION IF EXISTS mark_inactive_push_tokens;
DROP FUNCTION IF EXISTS update_push_tokens_updated_at;
DROP FUNCTION IF EXISTS update_notifications_updated_at;
DROP FUNCTION IF EXISTS update_notification_targets_updated_at;
DROP FUNCTION IF EXISTS update_notification_queue_updated_at;
```

---

### add_inapp_notifications.sql

**Purpose:** Adds in-app notification tracking and user preferences.

**Tables Created:**

- `user_notification_reads` - Tracks which notifications a user has read
- `notification_preferences` - User notification settings

**Functions Created:**

- `get_user_notifications_with_read_status()` - Fetches notifications with read status
- `get_unread_notification_count()` - Returns unread notification count for badge

**Triggers Created:**

- `update_notification_preferences_updated_at` → `update_notification_preferences_timestamp()`
- `create_notification_preferences_on_signup` → `create_default_notification_preferences()`

**Dependencies:**

- `auth.users` table
- `notifications` table (from create_push_notifications.sql)

**Reversible:** Yes

**Rollback:**

```sql
DROP TRIGGER IF EXISTS create_notification_preferences_on_signup ON auth.users;
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;

DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS user_notification_reads CASCADE;

DROP FUNCTION IF EXISTS get_user_notifications_with_read_status;
DROP FUNCTION IF EXISTS get_unread_notification_count;
DROP FUNCTION IF EXISTS update_notification_preferences_timestamp;
DROP FUNCTION IF EXISTS create_default_notification_preferences;
```

## Schema Conflict Resolution Strategies

### Common Conflict Scenarios

#### 1. Column Already Exists

**Scenario:** Running a migration that adds a column that already exists.

**Prevention:** All migrations use `ADD COLUMN IF NOT EXISTS` pattern.

**Resolution:**

```sql
-- Check if column exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'table_name' AND column_name = 'column_name'
  ) THEN
    ALTER TABLE table_name ADD COLUMN column_name data_type;
  END IF;
END $$;
```

#### 2. Table Already Exists

**Scenario:** Running a migration that creates a table that already exists.

**Prevention:** All migrations use `CREATE TABLE IF NOT EXISTS` pattern.

**Resolution:**

```sql
-- Check if table exists before creating
CREATE TABLE IF NOT EXISTS table_name (
  -- columns
);
```

#### 3. Constraint Already Exists

**Scenario:** Adding a constraint that already exists.

**Prevention:** Use named constraints and check existence.

**Resolution:**

```sql
-- Check if constraint exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'constraint_name'
  ) THEN
    ALTER TABLE table_name ADD CONSTRAINT constraint_name ...;
  END IF;
END $$;
```

#### 4. Index Already Exists

**Scenario:** Creating an index that already exists.

**Prevention:** All migrations use `CREATE INDEX IF NOT EXISTS` pattern.

**Resolution:**

```sql
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column_name);
```

#### 5. Function Already Exists

**Scenario:** Creating a function that already exists.

**Prevention:** Use `CREATE OR REPLACE FUNCTION` pattern.

**Resolution:**

```sql
CREATE OR REPLACE FUNCTION function_name()
RETURNS return_type AS $$
BEGIN
  -- function body
END;
$$ LANGUAGE plpgsql;
```

#### 6. Trigger Already Exists

**Scenario:** Creating a trigger that already exists.

**Prevention:** Drop trigger before creating.

**Resolution:**

```sql
DROP TRIGGER IF EXISTS trigger_name ON table_name;
CREATE TRIGGER trigger_name
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION function_name();
```

#### 7. Enum Type Already Exists

**Scenario:** Creating an enum type that already exists.

**Prevention:** Check existence before creating.

**Resolution:**

```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_name') THEN
    CREATE TYPE enum_name AS ENUM ('value1', 'value2');
  END IF;
END $$;
```

#### 8. RLS Policy Already Exists

**Scenario:** Creating an RLS policy that already exists.

**Prevention:** Use `CREATE POLICY IF NOT EXISTS` (PostgreSQL 15+) or drop first.

**Resolution:**

```sql
-- For PostgreSQL < 15
DROP POLICY IF EXISTS policy_name ON table_name;
CREATE POLICY policy_name ON table_name ...;

-- For PostgreSQL 15+
CREATE POLICY IF NOT EXISTS policy_name ON table_name ...;
```

#### 9. Foreign Key Reference Fails

**Scenario:** Adding a foreign key to a table that doesn't exist yet.

**Prevention:** Ensure migrations run in correct order.

**Resolution:**

1. Check migration execution order
2. Run prerequisite migrations first
3. Use deferred constraints if needed:

```sql
ALTER TABLE table_name
ADD CONSTRAINT fk_name
FOREIGN KEY (column_name)
REFERENCES other_table(id)
DEFERRABLE INITIALLY DEFERRED;
```

#### 10. Data Type Mismatch

**Scenario:** Altering a column to a type incompatible with existing data.

**Prevention:** Always check existing data before type changes.

**Resolution:**

```sql
-- Check for incompatible data
SELECT * FROM table_name WHERE column_name::new_type IS NULL;

-- Convert data first if needed
UPDATE table_name SET column_name = converted_value WHERE condition;

-- Then alter column
ALTER TABLE table_name ALTER COLUMN column_name TYPE new_type USING column_name::new_type;
```

### Migration Best Practices

1. **Always use idempotent patterns:**
   - `CREATE TABLE IF NOT EXISTS`
   - `CREATE INDEX IF NOT EXISTS`
   - `ADD COLUMN IF NOT EXISTS`
   - `CREATE OR REPLACE FUNCTION`
   - `ON CONFLICT DO NOTHING`

2. **Test migrations on a copy of production data** before running on production.

3. **Back up the database** before running migrations.

4. **Run migrations in a transaction** when possible:

```sql
BEGIN;
-- migration statements
COMMIT;
```

5. **Document dependencies** clearly in migration files.

6. **Use meaningful names** for constraints, indexes, and triggers.

7. **Include rollback scripts** for each migration.

8. **Version control all migrations** and never modify committed migrations.

### Verification Queries

After running migrations, verify the schema:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- Check all columns for a table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'table_name' ORDER BY ordinal_position;

-- Check all indexes
SELECT indexname, indexdef FROM pg_indexes
WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- Check all triggers
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public' ORDER BY event_object_table;

-- Check all functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' ORDER BY routine_name;

-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' ORDER BY tablename;
```

## Documentation Files

For additional migration guidance, see:

- `database/migrations/README.md` - Basic migration instructions
- `database/migrations/MIGRATION_README.md` - NMC restructuring guide
- `database/migrations/SETUP_INSTRUCTIONS.md` - Initial setup guide
- `database/migrations/AUDIO_SETUP_INSTRUCTIONS.md` - Audio feature setup
- `database/migrations/FLASHCARD_SETUP.md` - Flashcard feature setup
