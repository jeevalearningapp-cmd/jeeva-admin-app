# Jeeva Learning - Triggers and Functions Documentation

## Overview

This document provides comprehensive documentation for all database triggers and functions in the Jeeva Learning platform's Supabase PostgreSQL database.

**Total Triggers:** 18  
**Total Functions:** 25+  
**Schemas:** auth, public, realtime, storage

---

## Table of Contents

1. [Triggers](#1-triggers)
   - [Auth Schema Triggers](#11-auth-schema-triggers)
   - [Public Schema Triggers](#12-public-schema-triggers)
   - [Realtime Schema Triggers](#13-realtime-schema-triggers)
   - [Storage Schema Triggers](#14-storage-schema-triggers)
2. [Functions](#2-functions)
   - [Timestamp Update Functions](#21-timestamp-update-functions)
   - [Notification Functions](#22-notification-functions)
   - [Business Logic Functions](#23-business-logic-functions)
   - [Storage Functions](#24-storage-functions)

---

## 1. Triggers

### 1.1 Auth Schema Triggers

#### on_auth_user_created_profile

**Schema:** auth

**Table:** users

**Timing:** AFTER

**Events:** INSERT

**Level:** ROW

**Function:** handle_auth_user_created

**Description:** Automatically creates a user profile record when a new user signs up through Supabase Auth. This ensures every authenticated user has a corresponding profile entry in the public schema.

**Side Effects:**

- Creates a new record in `user_profiles` table
- Sets default values for profile fields
- Triggers welcome notification workflow

---

### 1.2 Public Schema Triggers

#### ai_usage_updated_at

**Schema:** public

**Table:** ai_usage_stats

**Timing:** BEFORE

**Events:** INSERT, UPDATE

**Level:** ROW

**Function:** update_ai_usage_timestamp

**Description:** Automatically updates the `updated_at` timestamp whenever an AI usage statistics record is created or modified.

**Side Effects:**

- Sets `updated_at` to current timestamp

---

#### chat_conversation_updated_at

**Schema:** public

**Table:** chat_conversations

**Timing:** BEFORE

**Events:** INSERT, UPDATE

**Level:** ROW

**Function:** update_chat_conversation_timestamp

**Description:** Automatically updates the `updated_at` timestamp whenever a chat conversation record is created or modified.

**Side Effects:**

- Sets `updated_at` to current timestamp

---

#### content_approvals_updated_at

**Schema:** public

**Table:** content_approvals

**Timing:** BEFORE

**Events:** INSERT, UPDATE

**Level:** ROW

**Function:** update_content_approvals_updated_at

**Description:** Automatically updates the `updated_at` timestamp whenever a content approval record is created or modified.

**Side Effects:**

- Sets `updated_at` to current timestamp

---

#### update_notification_preferences_updated_at

**Schema:** public

**Table:** notification_preferences

**Timing:** BEFORE

**Events:** INSERT, UPDATE

**Level:** ROW

**Function:** update_notification_preferences_timestamp

**Description:** Automatically updates the `updated_at` timestamp whenever a user's notification preferences are created or modified.

**Side Effects:**

- Sets `updated_at` to current timestamp

---

#### notification_queue_updated_at

**Schema:** public

**Table:** notification_queue

**Timing:** BEFORE

**Events:** INSERT, UPDATE

**Level:** ROW

**Function:** update_notification_queue_updated_at

**Description:** Automatically updates the `updated_at` timestamp whenever a notification queue record is created or modified.

**Side Effects:**

- Sets `updated_at` to current timestamp

---

#### notification_targets_updated_at

**Schema:** public

**Table:** notification_targets

**Timing:** BEFORE

**Events:** INSERT, UPDATE

**Level:** ROW

**Function:** update_notification_targets_updated_at

**Description:** Automatically updates the `updated_at` timestamp whenever a notification target record is created or modified.

**Side Effects:**

- Sets `updated_at` to current timestamp

---

#### notifications_updated_at

**Schema:** public

**Table:** notifications

**Timing:** BEFORE

**Events:** INSERT, UPDATE

**Level:** ROW

**Function:** update_notifications_updated_at

**Description:** Automatically updates the `updated_at` timestamp whenever a notification record is created or modified.

**Side Effects:**

- Sets `updated_at` to current timestamp

---

#### push_tokens_updated_at

**Schema:** public

**Table:** push_tokens

**Timing:** BEFORE

**Events:** INSERT, UPDATE

**Level:** ROW

**Function:** update_push_tokens_updated_at

**Description:** Automatically updates the `updated_at` timestamp whenever a push token record is created or modified.

**Side Effects:**

- Sets `updated_at` to current timestamp

---

#### increment_coupon_on_subscription

**Schema:** public

**Table:** subscriptions

**Timing:** AFTER

**Events:** INSERT, UPDATE

**Level:** ROW

**Function:** increment_coupon_usage

**Description:** Automatically increments the usage count of a discount coupon when it is applied to a new subscription. This ensures accurate tracking of coupon redemptions.

**Side Effects:**

- Increments `times_used` counter in `discount_coupons` table
- May invalidate coupon if max usage reached

---

#### new_user_welcome_notification

**Schema:** public

**Table:** user_profiles

**Timing:** AFTER

**Events:** INSERT

**Level:** ROW

**Function:** notify_new_user_welcome

**Description:** Automatically creates a welcome notification for new users when their profile is created. The notification is scheduled to be sent 5 minutes after signup.

**Side Effects:**

- Creates a new record in `notifications` table
- Adds entry to `notification_queue` with 5-minute delay

---

#### subscription_activated_notification

**Schema:** public

**Table:** subscriptions

**Timing:** AFTER

**Events:** INSERT, UPDATE

**Level:** ROW

**Function:** notify_subscription_activated

**Description:** Automatically creates a notification when a user's subscription status changes to 'active'. This confirms successful subscription activation to the user.

**Side Effects:**

- Creates a new record in `notifications` table
- Adds entry to `notification_queue` for immediate delivery

---

### 1.3 Realtime Schema Triggers

#### tr_check_filters

**Schema:** realtime

**Table:** subscription

**Timing:** BEFORE

**Events:** INSERT

**Level:** ROW

**Function:** subscription_check_filters

**Description:** Validates subscription filters before allowing a realtime subscription to be created. This is a Supabase internal trigger for managing realtime connections.

**Side Effects:**

- Validates filter expressions
- May reject invalid subscriptions

---

### 1.4 Storage Schema Triggers

#### enforce_bucket_name_length_trigger

**Schema:** storage

**Table:** buckets

**Timing:** BEFORE

**Events:** INSERT, UPDATE

**Level:** ROW

**Function:** enforce_bucket_name_length

**Description:** Validates that bucket names meet length requirements before allowing creation or modification.

**Side Effects:**

- Raises exception if bucket name is too long

---

#### objects_delete_delete_prefix

**Schema:** storage

**Table:** objects

**Timing:** INSTEAD OF

**Events:** DELETE

**Level:** ROW

**Function:** delete_prefix_hierarchy_trigger

**Description:** Handles the deletion of storage objects by managing the associated prefix hierarchy. This ensures proper cleanup of folder structures.

**Side Effects:**

- Updates or removes prefix records
- Maintains folder hierarchy integrity

---

#### objects_insert_create_prefix

**Schema:** storage

**Table:** objects

**Timing:** BEFORE

**Events:** INSERT

**Level:** ROW

**Function:** objects_insert_prefix_trigger

**Description:** Automatically creates prefix (folder) records when new objects are inserted into storage. This maintains the virtual folder structure.

**Side Effects:**

- Creates prefix records for object path
- Builds folder hierarchy

---

#### objects_update_create_prefix

**Schema:** storage

**Table:** objects

**Timing:** BEFORE

**Events:** UPDATE

**Level:** ROW

**Function:** objects_update_prefix_trigger

**Description:** Updates prefix records when storage objects are moved or renamed. This maintains consistency in the folder structure.

**Side Effects:**

- Updates prefix records for new path
- May create new prefix records

---

#### update_objects_updated_at

**Schema:** storage

**Table:** objects

**Timing:** BEFORE

**Events:** UPDATE

**Level:** ROW

**Function:** update_updated_at_column

**Description:** Automatically updates the `updated_at` timestamp whenever a storage object is modified.

**Side Effects:**

- Sets `updated_at` to current timestamp

---

#### prefixes_create_hierarchy

**Schema:** storage

**Table:** prefixes

**Timing:** BEFORE

**Events:** INSERT

**Level:** ROW

**Function:** prefixes_insert_trigger

**Description:** Creates parent prefix records when a new prefix (folder) is created. This ensures the complete folder hierarchy exists.

**Side Effects:**

- Creates parent prefix records
- Builds complete folder path

---

#### prefixes_delete_hierarchy

**Schema:** storage

**Table:** prefixes

**Timing:** INSTEAD OF

**Events:** DELETE

**Level:** ROW

**Function:** delete_prefix_hierarchy_trigger

**Description:** Handles the deletion of prefix (folder) records by managing child objects and subfolders.

**Side Effects:**

- May cascade delete child prefixes
- Updates object references

---

## Trigger Summary Table

| #   | Trigger Name                               | Schema   | Table                    | Timing     | Events         | Function                                  |
| --- | ------------------------------------------ | -------- | ------------------------ | ---------- | -------------- | ----------------------------------------- |
| 1   | on_auth_user_created_profile               | auth     | users                    | AFTER      | INSERT         | handle_auth_user_created                  |
| 2   | ai_usage_updated_at                        | public   | ai_usage_stats           | BEFORE     | INSERT, UPDATE | update_ai_usage_timestamp                 |
| 3   | chat_conversation_updated_at               | public   | chat_conversations       | BEFORE     | INSERT, UPDATE | update_chat_conversation_timestamp        |
| 4   | content_approvals_updated_at               | public   | content_approvals        | BEFORE     | INSERT, UPDATE | update_content_approvals_updated_at       |
| 5   | update_notification_preferences_updated_at | public   | notification_preferences | BEFORE     | INSERT, UPDATE | update_notification_preferences_timestamp |
| 6   | notification_queue_updated_at              | public   | notification_queue       | BEFORE     | INSERT, UPDATE | update_notification_queue_updated_at      |
| 7   | notification_targets_updated_at            | public   | notification_targets     | BEFORE     | INSERT, UPDATE | update_notification_targets_updated_at    |
| 8   | notifications_updated_at                   | public   | notifications            | BEFORE     | INSERT, UPDATE | update_notifications_updated_at           |
| 9   | push_tokens_updated_at                     | public   | push_tokens              | BEFORE     | INSERT, UPDATE | update_push_tokens_updated_at             |
| 10  | increment_coupon_on_subscription           | public   | subscriptions            | AFTER      | INSERT, UPDATE | increment_coupon_usage                    |
| 11  | new_user_welcome_notification              | public   | user_profiles            | AFTER      | INSERT         | notify_new_user_welcome                   |
| 12  | subscription_activated_notification        | public   | subscriptions            | AFTER      | INSERT, UPDATE | notify_subscription_activated             |
| 13  | tr_check_filters                           | realtime | subscription             | BEFORE     | INSERT         | subscription_check_filters                |
| 14  | enforce_bucket_name_length_trigger         | storage  | buckets                  | BEFORE     | INSERT, UPDATE | enforce_bucket_name_length                |
| 15  | objects_delete_delete_prefix               | storage  | objects                  | INSTEAD OF | DELETE         | delete_prefix_hierarchy_trigger           |
| 16  | objects_insert_create_prefix               | storage  | objects                  | BEFORE     | INSERT         | objects_insert_prefix_trigger             |
| 17  | objects_update_create_prefix               | storage  | objects                  | BEFORE     | UPDATE         | objects_update_prefix_trigger             |
| 18  | update_objects_updated_at                  | storage  | objects                  | BEFORE     | UPDATE         | update_updated_at_column                  |
| 19  | prefixes_create_hierarchy                  | storage  | prefixes                 | BEFORE     | INSERT         | prefixes_insert_trigger                   |
| 20  | prefixes_delete_hierarchy                  | storage  | prefixes                 | INSTEAD OF | DELETE         | delete_prefix_hierarchy_trigger           |

---

## 2. Functions

### 2.1 Timestamp Update Functions

These functions automatically update the `updated_at` column when records are modified. They all follow the same pattern and use `SECURITY DEFINER` context.

#### update_ai_usage_timestamp()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Updates the `updated_at` timestamp on `ai_usage_stats` records.

**Used By Triggers:**

- `ai_usage_updated_at` on `ai_usage_stats`

**Implementation:**

```sql
CREATE OR REPLACE FUNCTION update_ai_usage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### update_chat_conversation_timestamp()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Updates the `updated_at` timestamp on `chat_conversations` records.

**Used By Triggers:**

- `chat_conversation_updated_at` on `chat_conversations`

**Implementation:**

```sql
CREATE OR REPLACE FUNCTION update_chat_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### update_content_approvals_updated_at()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Updates the `updated_at` timestamp on `content_approvals` records.

**Used By Triggers:**

- `content_approvals_updated_at` on `content_approvals`

**Implementation:**

```sql
CREATE OR REPLACE FUNCTION update_content_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### update_notification_preferences_timestamp()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Updates the `updated_at` timestamp on `notification_preferences` records.

**Used By Triggers:**

- `update_notification_preferences_updated_at` on `notification_preferences`

**Implementation:**

```sql
CREATE OR REPLACE FUNCTION update_notification_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### update_notification_queue_updated_at()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Updates the `updated_at` timestamp on `notification_queue` records.

**Used By Triggers:**

- `notification_queue_updated_at` on `notification_queue`

**Implementation:**

```sql
CREATE OR REPLACE FUNCTION update_notification_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### update_notification_targets_updated_at()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Updates the `updated_at` timestamp on `notification_targets` records.

**Used By Triggers:**

- `notification_targets_updated_at` on `notification_targets`

**Implementation:**

```sql
CREATE OR REPLACE FUNCTION update_notification_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### update_notifications_updated_at()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Updates the `updated_at` timestamp on `notifications` records.

**Used By Triggers:**

- `notifications_updated_at` on `notifications`

**Implementation:**

```sql
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### update_push_tokens_updated_at()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Updates the `updated_at` timestamp on `push_tokens` records.

**Used By Triggers:**

- `push_tokens_updated_at` on `push_tokens`

**Implementation:**

```sql
CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### update_updated_at_column()

**Schema:** storage

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Generic function to update the `updated_at` timestamp. Used by storage schema triggers.

**Used By Triggers:**

- `update_objects_updated_at` on `storage.objects`

**Implementation:**

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 2.2 Notification Functions

These functions handle automated notification creation and delivery based on various system events.

#### notify_content_approved()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Creates a notification when content is approved by a moderator. The notification is sent to the content creator to inform them their submission is now live.

**Used By Triggers:**

- `content_approval_notification` on `content_approvals` (when enabled)

**Example Usage:**

```sql
-- Trigger fires automatically when content_approvals.status changes to 'approved'
UPDATE content_approvals
SET status = 'approved', reviewed_by = 'admin-uuid'
WHERE id = 'content-uuid';

-- Result: Creates notification with title "Content Approved! ✅"
-- and adds to notification_queue for immediate delivery
```

**Implementation Details:**

- Only triggers when status changes TO 'approved' (not when already approved)
- Looks up content creator from the lessons table
- Creates notification with type 'content_approved'
- Includes navigation data to the content details screen

---

#### notify_content_rejected()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Creates a notification when content is rejected by a moderator. The notification includes the rejection reason and is sent to the content creator.

**Used By Triggers:**

- `content_rejection_notification` on `content_approvals` (when enabled)

**Example Usage:**

```sql
-- Trigger fires automatically when content_approvals.status changes to 'rejected'
UPDATE content_approvals
SET status = 'rejected',
    comments = 'Please add more detail to the explanation section',
    reviewed_by = 'admin-uuid'
WHERE id = 'content-uuid';

-- Result: Creates notification with title "Content Needs Revision"
-- including the rejection reason in the body
```

**Implementation Details:**

- Only triggers when status changes TO 'rejected'
- Includes rejection reason from the `comments` field
- Creates notification with type 'content_rejected'
- Includes navigation data with the rejection reason

---

#### notify_new_user_welcome()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Creates a welcome notification for new users when their profile is created. The notification is scheduled to be sent 5 minutes after signup to give users time to explore the app first.

**Used By Triggers:**

- `new_user_welcome_notification` on `user_profiles`

**Example Usage:**

```sql
-- Trigger fires automatically when a new user profile is created
INSERT INTO user_profiles (user_id, full_name, profile_completed)
VALUES ('user-uuid', 'John Doe', false);

-- Result: Creates notification with title "Welcome to Jeeva Learning! 🎓"
-- scheduled for delivery 5 minutes from now
```

**Implementation Details:**

- Creates notification with type 'welcome'
- Schedules delivery for NOW() + 5 minutes
- Targets only the new user via audience_filter
- Includes navigation to Home screen

---

#### notify_subscription_activated()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Creates a notification when a user's subscription becomes active. This confirms successful payment and subscription activation.

**Used By Triggers:**

- `subscription_activated_notification` on `subscriptions`

**Example Usage:**

```sql
-- Trigger fires when subscription status changes to 'active'
UPDATE subscriptions
SET status = 'active',
    activated_at = NOW()
WHERE user_id = 'user-uuid';

-- Result: Creates notification with title "Subscription Activated! 🎉"
-- for immediate delivery
```

**Implementation Details:**

- Only triggers when status changes TO 'active' (not when already active)
- Includes plan name in the notification body
- Creates notification with type 'subscription_activated'
- Schedules for immediate delivery (NOW())

---

#### notify_study_streak()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Creates achievement notifications when users reach study streak milestones (7, 14, 30, 60, 90 consecutive days of study).

**Used By Triggers:**

- `study_streak_notification` on `user_profiles` (when enabled)

**Example Usage:**

```sql
-- Trigger fires when current_streak column is updated
UPDATE user_profiles
SET current_streak = 7
WHERE id = 'profile-uuid';

-- Result: Creates notification with title "🔥 7-Day Streak!"
-- for immediate delivery
```

**Implementation Details:**

- Only triggers on milestone values: 7, 14, 30, 60, 90 days
- Includes streak count in notification title and body
- Creates notification with type 'streak_achievement'
- Includes streak value in notification data

---

#### get_users_at_question_milestone()

**Schema:** public

**Returns:** TABLE(user_id UUID, total_questions BIGINT)

**Security:** DEFINER

**Parameters:**

| Name            | Type    | Description                           |
| --------------- | ------- | ------------------------------------- |
| milestone_count | INTEGER | The question count milestone to check |

**Description:** Helper function used by automated notification Edge Functions to find users who have reached a specific question practice milestone.

**Example Usage:**

```sql
-- Find all users who have answered exactly 100 questions
SELECT * FROM get_users_at_question_milestone(100);

-- Result:
-- user_id                              | total_questions
-- -------------------------------------|----------------
-- 550e8400-e29b-41d4-a716-446655440000 | 100
-- 6ba7b810-9dad-11d1-80b4-00c04fd430c8 | 100
```

**Implementation Details:**

- Aggregates practice answers by user
- Returns users with exactly the specified count
- Used for milestone notifications (50, 100, 500, 1000 questions)

---

### 2.3 Business Logic Functions

These functions implement core business logic for authentication, subscriptions, and trial module access.

#### handle_auth_user_created()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Automatically creates a user profile record when a new user signs up through Supabase Auth. This ensures every authenticated user has a corresponding profile entry.

**Used By Triggers:**

- `on_auth_user_created_profile` on `auth.users`

**Example Usage:**

```sql
-- Trigger fires automatically when a new auth user is created
-- (via Supabase Auth signup)

-- The function creates:
INSERT INTO user_profiles (user_id, full_name, profile_completed)
VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), false);
```

**Implementation Details:**

- Extracts user metadata from auth.users record
- Creates profile with default values
- Sets `profile_completed` to false for onboarding flow
- Handles both email and OAuth signups

---

#### increment_coupon_usage()

**Schema:** public

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Increments the usage count of a discount coupon when it is applied to a subscription. This ensures accurate tracking of coupon redemptions and enforces usage limits.

**Used By Triggers:**

- `increment_coupon_on_subscription` on `subscriptions`

**Example Usage:**

```sql
-- Trigger fires when a subscription is created with a coupon
INSERT INTO subscriptions (user_id, plan_id, coupon_code, status)
VALUES ('user-uuid', 'plan-uuid', 'SAVE20', 'active');

-- Result: discount_coupons.times_used is incremented by 1
-- for the coupon with code 'SAVE20'
```

**Implementation Details:**

- Only increments when `coupon_code` is not null
- Updates `times_used` counter in `discount_coupons` table
- May trigger coupon deactivation if max usage reached
- Handles both INSERT and UPDATE operations

---

#### check_module_access()

**Schema:** public

**Returns:** BOOLEAN

**Security:** DEFINER

**Parameters:**

| Name        | Type | Description                      |
| ----------- | ---- | -------------------------------- |
| p_user_id   | UUID | The user ID to check access for  |
| p_module_id | UUID | The module ID to check access to |

**Description:** Checks if a user has access to a specific module based on their subscription status, trial eligibility, and module access rules.

**Example Usage:**

```sql
-- Check if user can access a specific module
SELECT check_module_access('user-uuid', 'module-uuid');

-- Returns: true if user has access, false otherwise

-- Use in queries to filter accessible content
SELECT * FROM modules m
WHERE m.is_active = true
AND (m.is_trial = true OR check_module_access('user-uuid', m.id));
```

**Implementation Details:**

- Checks if module is marked as trial content (always accessible)
- Verifies user has active subscription
- Checks module_access_rules for subscription requirements
- Returns true for trial users accessing trial content
- Returns true for subscribed users meeting access requirements

---

#### get_trial_progress()

**Schema:** public

**Returns:** JSONB

**Security:** DEFINER

**Parameters:**

| Name      | Type | Description                     |
| --------- | ---- | ------------------------------- |
| p_user_id | UUID | The user ID to get progress for |

**Description:** Retrieves a user's progress through trial module content, including lessons completed, questions answered, and mock exams taken.

**Example Usage:**

```sql
-- Get trial progress for a user
SELECT get_trial_progress('user-uuid');

-- Returns JSONB:
-- {
--   "lessonsCompleted": 3,
--   "totalTrialLessons": 5,
--   "questionsAnswered": 25,
--   "totalTrialQuestions": 50,
--   "mockExamsTaken": 1,
--   "totalTrialExams": 2,
--   "overallProgress": 45
-- }
```

**Implementation Details:**

- Aggregates data from trial_learning_progress table
- Counts completed lessons, questions, and exams
- Calculates overall progress percentage
- Returns structured JSONB for easy frontend consumption

---

#### track_trial_to_paid_conversion()

**Schema:** public

**Returns:** VOID

**Security:** DEFINER

**Parameters:**

| Name              | Type | Description               |
| ----------------- | ---- | ------------------------- |
| p_user_id         | UUID | The user ID who converted |
| p_subscription_id | UUID | The new subscription ID   |

**Description:** Records analytics data when a trial user converts to a paid subscription. This helps track conversion rates and trial effectiveness.

**Example Usage:**

```sql
-- Track conversion when user subscribes
SELECT track_trial_to_paid_conversion('user-uuid', 'subscription-uuid');

-- Records:
-- - Trial duration before conversion
-- - Trial content engagement metrics
-- - Conversion timestamp
```

**Implementation Details:**

- Calculates time spent in trial mode
- Records trial engagement metrics
- Updates user_analytics with conversion data
- Used for business analytics and reporting

---

### 2.4 Storage Functions

These functions manage Supabase Storage operations, including bucket validation and prefix (folder) hierarchy management.

#### enforce_bucket_name_length()

**Schema:** storage

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Validates that bucket names meet the required length constraints before allowing bucket creation or modification.

**Used By Triggers:**

- `enforce_bucket_name_length_trigger` on `storage.buckets`

**Implementation Details:**

- Checks bucket name length against maximum allowed
- Raises exception if validation fails
- Prevents creation of invalid bucket names

---

#### delete_prefix_hierarchy_trigger()

**Schema:** storage

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Handles the deletion of storage prefixes (folders) by managing the associated hierarchy. Ensures proper cleanup when folders are deleted.

**Used By Triggers:**

- `objects_delete_delete_prefix` on `storage.objects`
- `prefixes_delete_hierarchy` on `storage.prefixes`

**Implementation Details:**

- Manages parent-child prefix relationships
- Updates or removes prefix records as needed
- Maintains folder hierarchy integrity

---

#### objects_insert_prefix_trigger()

**Schema:** storage

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Automatically creates prefix (folder) records when new objects are inserted into storage. This maintains the virtual folder structure.

**Used By Triggers:**

- `objects_insert_create_prefix` on `storage.objects`

**Implementation Details:**

- Parses object path to extract folder structure
- Creates prefix records for each folder level
- Builds complete folder hierarchy

---

#### objects_update_prefix_trigger()

**Schema:** storage

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Updates prefix records when storage objects are moved or renamed. Ensures folder structure remains consistent.

**Used By Triggers:**

- `objects_update_create_prefix` on `storage.objects`

**Implementation Details:**

- Detects path changes in object updates
- Creates new prefix records for new paths
- May clean up orphaned prefixes

---

#### prefixes_insert_trigger()

**Schema:** storage

**Returns:** TRIGGER

**Security:** DEFINER

**Parameters:** None (trigger function)

**Description:** Creates parent prefix records when a new prefix (folder) is created. Ensures the complete folder hierarchy exists.

**Used By Triggers:**

- `prefixes_create_hierarchy` on `storage.prefixes`

**Implementation Details:**

- Parses prefix path to identify parent folders
- Creates missing parent prefix records
- Builds complete folder path from root

---

## Function Summary Table

| #   | Function Name                             | Schema   | Returns | Security | Used By Trigger                                         |
| --- | ----------------------------------------- | -------- | ------- | -------- | ------------------------------------------------------- |
| 1   | update_ai_usage_timestamp                 | public   | TRIGGER | DEFINER  | ai_usage_updated_at                                     |
| 2   | update_chat_conversation_timestamp        | public   | TRIGGER | DEFINER  | chat_conversation_updated_at                            |
| 3   | update_content_approvals_updated_at       | public   | TRIGGER | DEFINER  | content_approvals_updated_at                            |
| 4   | update_notification_preferences_timestamp | public   | TRIGGER | DEFINER  | update_notification_preferences_updated_at              |
| 5   | update_notification_queue_updated_at      | public   | TRIGGER | DEFINER  | notification_queue_updated_at                           |
| 6   | update_notification_targets_updated_at    | public   | TRIGGER | DEFINER  | notification_targets_updated_at                         |
| 7   | update_notifications_updated_at           | public   | TRIGGER | DEFINER  | notifications_updated_at                                |
| 8   | update_push_tokens_updated_at             | public   | TRIGGER | DEFINER  | push_tokens_updated_at                                  |
| 9   | update_updated_at_column                  | storage  | TRIGGER | DEFINER  | update_objects_updated_at                               |
| 10  | notify_content_approved                   | public   | TRIGGER | DEFINER  | content_approval_notification                           |
| 11  | notify_content_rejected                   | public   | TRIGGER | DEFINER  | content_rejection_notification                          |
| 12  | notify_new_user_welcome                   | public   | TRIGGER | DEFINER  | new_user_welcome_notification                           |
| 13  | notify_subscription_activated             | public   | TRIGGER | DEFINER  | subscription_activated_notification                     |
| 14  | notify_study_streak                       | public   | TRIGGER | DEFINER  | study_streak_notification                               |
| 15  | get_users_at_question_milestone           | public   | TABLE   | DEFINER  | - (called by Edge Functions)                            |
| 16  | handle_auth_user_created                  | public   | TRIGGER | DEFINER  | on_auth_user_created_profile                            |
| 17  | increment_coupon_usage                    | public   | TRIGGER | DEFINER  | increment_coupon_on_subscription                        |
| 18  | check_module_access                       | public   | BOOLEAN | DEFINER  | - (called directly)                                     |
| 19  | get_trial_progress                        | public   | JSONB   | DEFINER  | - (called directly)                                     |
| 20  | track_trial_to_paid_conversion            | public   | VOID    | DEFINER  | - (called directly)                                     |
| 21  | enforce_bucket_name_length                | storage  | TRIGGER | DEFINER  | enforce_bucket_name_length_trigger                      |
| 22  | delete_prefix_hierarchy_trigger           | storage  | TRIGGER | DEFINER  | objects_delete_delete_prefix, prefixes_delete_hierarchy |
| 23  | objects_insert_prefix_trigger             | storage  | TRIGGER | DEFINER  | objects_insert_create_prefix                            |
| 24  | objects_update_prefix_trigger             | storage  | TRIGGER | DEFINER  | objects_update_create_prefix                            |
| 25  | prefixes_insert_trigger                   | storage  | TRIGGER | DEFINER  | prefixes_create_hierarchy                               |
| 26  | subscription_check_filters                | realtime | TRIGGER | DEFINER  | tr_check_filters                                        |

---

## Cross-Reference: Triggers and Functions

This section provides a quick reference for finding which function is invoked by each trigger and vice versa.

### By Table

| Table                    | Triggers                                                                                                            | Functions                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| auth.users               | on_auth_user_created_profile                                                                                        | handle_auth_user_created                                                                                                |
| ai_usage_stats           | ai_usage_updated_at                                                                                                 | update_ai_usage_timestamp                                                                                               |
| chat_conversations       | chat_conversation_updated_at                                                                                        | update_chat_conversation_timestamp                                                                                      |
| content_approvals        | content_approvals_updated_at                                                                                        | update_content_approvals_updated_at                                                                                     |
| notification_preferences | update_notification_preferences_updated_at                                                                          | update_notification_preferences_timestamp                                                                               |
| notification_queue       | notification_queue_updated_at                                                                                       | update_notification_queue_updated_at                                                                                    |
| notification_targets     | notification_targets_updated_at                                                                                     | update_notification_targets_updated_at                                                                                  |
| notifications            | notifications_updated_at                                                                                            | update_notifications_updated_at                                                                                         |
| push_tokens              | push_tokens_updated_at                                                                                              | update_push_tokens_updated_at                                                                                           |
| subscriptions            | increment_coupon_on_subscription, subscription_activated_notification                                               | increment_coupon_usage, notify_subscription_activated                                                                   |
| user_profiles            | new_user_welcome_notification                                                                                       | notify_new_user_welcome                                                                                                 |
| realtime.subscription    | tr_check_filters                                                                                                    | subscription_check_filters                                                                                              |
| storage.buckets          | enforce_bucket_name_length_trigger                                                                                  | enforce_bucket_name_length                                                                                              |
| storage.objects          | objects_delete_delete_prefix, objects_insert_create_prefix, objects_update_create_prefix, update_objects_updated_at | delete_prefix_hierarchy_trigger, objects_insert_prefix_trigger, objects_update_prefix_trigger, update_updated_at_column |
| storage.prefixes         | prefixes_create_hierarchy, prefixes_delete_hierarchy                                                                | prefixes_insert_trigger, delete_prefix_hierarchy_trigger                                                                |

### Standalone Functions (Not Trigger-Invoked)

These functions are called directly from application code or Edge Functions:

| Function                        | Purpose                       | Typical Caller                          |
| ------------------------------- | ----------------------------- | --------------------------------------- |
| check_module_access             | Verify user access to modules | Mobile app, API                         |
| get_trial_progress              | Get user's trial progress     | Mobile app, API                         |
| track_trial_to_paid_conversion  | Record conversion analytics   | Subscription webhook                    |
| get_users_at_question_milestone | Find users at milestones      | Edge Function (automated notifications) |

---

## Validation Queries

Use these queries to verify trigger and function documentation accuracy:

```sql
-- Get all triggers in the database
SELECT
  trigger_schema,
  trigger_name,
  event_manipulation,
  event_object_schema,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth', 'storage', 'realtime')
ORDER BY trigger_schema, event_object_table, trigger_name;

-- Get all functions in public schema
SELECT
  routine_name,
  routine_type,
  data_type AS return_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Get trigger-function relationships
SELECT
  t.trigger_name,
  t.event_object_table,
  t.action_statement
FROM information_schema.triggers t
WHERE t.trigger_schema = 'public'
ORDER BY t.event_object_table;
```
