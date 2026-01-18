# Database Indexes Documentation

## Overview

This document provides comprehensive documentation of all database indexes in the Jeeva Learning platform's Supabase PostgreSQL database. Indexes are critical for query performance optimization and are automatically created for primary keys and unique constraints.

**Total Tables:** 53  
**Total Indexes:** 100+  
**Index Types:** PRIMARY, UNIQUE, B-tree (default), Partial

---

## Table of Contents

1. [Index Types Reference](#index-types-reference)
2. [Authentication & Users Indexes](#1-authentication--users-indexes)
3. [Learning Content Indexes](#2-learning-content-indexes)
4. [Progress & Practice Indexes](#3-progress--practice-indexes)
5. [Trial Module System Indexes](#4-trial-module-system-indexes)
6. [Subscriptions & Payments Indexes](#5-subscriptions--payments-indexes)
7. [System & Settings Indexes](#6-system--settings-indexes)
8. [AI & Chat Indexes](#7-ai--chat-indexes)
9. [Notifications Indexes](#8-notifications-indexes)
10. [Analytics & Backup Indexes](#9-analytics--backup-indexes)
11. [Missing Indexes for Foreign Keys](#10-missing-indexes-for-foreign-keys)
12. [Index Optimization Recommendations](#11-index-optimization-recommendations)

---

## Index Types Reference

| Type      | Description                                             | Use Case                                    |
| --------- | ------------------------------------------------------- | ------------------------------------------- |
| PRIMARY   | Automatically created for primary key columns           | Unique row identification                   |
| UNIQUE    | Enforces uniqueness constraint                          | Email addresses, codes, unique combinations |
| B-tree    | Default index type, good for equality and range queries | Most common queries                         |
| Partial   | Index with WHERE clause, indexes subset of rows         | Filtering active/inactive records           |
| Composite | Index on multiple columns                               | Multi-column lookups and sorting            |

---

## 1. Authentication & Users Indexes

### 1.1 users

| Index Name                 | Columns          | Type    | Description                           |
| -------------------------- | ---------------- | ------- | ------------------------------------- |
| `users_pkey`               | `id`             | PRIMARY | Primary key index                     |
| `users_email_key`          | `email`          | UNIQUE  | Ensures unique email addresses        |
| `idx_users_oauth_provider` | `oauth_provider` | B-tree  | Filter users by authentication method |

### 1.2 user_profiles

| Index Name                  | Columns   | Type    | Description                 |
| --------------------------- | --------- | ------- | --------------------------- |
| `user_profiles_pkey`        | `id`      | PRIMARY | Primary key index           |
| `idx_user_profiles_user_id` | `user_id` | B-tree  | Foreign key lookup to users |

### 1.3 user_sessions

| Index Name                  | Columns   | Type    | Description                 |
| --------------------------- | --------- | ------- | --------------------------- |
| `user_sessions_pkey`        | `id`      | PRIMARY | Primary key index           |
| `idx_user_sessions_user_id` | `user_id` | B-tree  | Foreign key lookup to users |

### 1.4 admin_users

| Index Name              | Columns | Type    | Description                 |
| ----------------------- | ------- | ------- | --------------------------- |
| `admin_users_pkey`      | `id`    | PRIMARY | Primary key index           |
| `admin_users_email_key` | `email` | UNIQUE  | Ensures unique admin emails |

### 1.5 notification_preferences

| Index Name                      | Columns | Type    | Description       |
| ------------------------------- | ------- | ------- | ----------------- |
| `notification_preferences_pkey` | `id`    | PRIMARY | Primary key index |

**Note:** Missing index on `user_id` foreign key - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

---

## 2. Learning Content Indexes

### 2.1 modules

| Index Name                  | Columns         | Type    | Description                   |
| --------------------------- | --------------- | ------- | ----------------------------- |
| `modules_pkey`              | `id`            | PRIMARY | Primary key index             |
| `idx_modules_display_order` | `display_order` | B-tree  | Sort modules by display order |
| `idx_modules_is_trial`      | `is_trial`      | B-tree  | Filter trial modules          |

### 2.2 topics

| Index Name                 | Columns         | Type    | Description                   |
| -------------------------- | --------------- | ------- | ----------------------------- |
| `topics_pkey`              | `id`            | PRIMARY | Primary key index             |
| `idx_topics_module_id`     | `module_id`     | B-tree  | Foreign key lookup to modules |
| `idx_topics_display_order` | `display_order` | B-tree  | Sort topics by display order  |

### 2.3 subtopics

| Index Name               | Columns    | Type    | Description                  |
| ------------------------ | ---------- | ------- | ---------------------------- |
| `subtopics_pkey`         | `id`       | PRIMARY | Primary key index            |
| `idx_subtopics_topic_id` | `topic_id` | B-tree  | Foreign key lookup to topics |

### 2.4 lessons

| Index Name                  | Columns         | Type    | Description                     |
| --------------------------- | --------------- | ------- | ------------------------------- |
| `lessons_pkey`              | `id`            | PRIMARY | Primary key index               |
| `idx_lessons_topic_id`      | `topic_id`      | B-tree  | Foreign key lookup to topics    |
| `idx_lessons_subtopic_id`   | `subtopic_id`   | B-tree  | Foreign key lookup to subtopics |
| `idx_lessons_display_order` | `display_order` | B-tree  | Sort lessons by display order   |

### 2.5 lesson_content

| Index Name                     | Columns     | Type    | Description                   |
| ------------------------------ | ----------- | ------- | ----------------------------- |
| `lesson_content_pkey`          | `id`        | PRIMARY | Primary key index             |
| `idx_lesson_content_lesson_id` | `lesson_id` | B-tree  | Foreign key lookup to lessons |

### 2.6 lesson_quizzes

| Index Name                     | Columns     | Type    | Description                   |
| ------------------------------ | ----------- | ------- | ----------------------------- |
| `lesson_quizzes_pkey`          | `id`        | PRIMARY | Primary key index             |
| `idx_lesson_quizzes_lesson_id` | `lesson_id` | B-tree  | Foreign key lookup to lessons |

**Note:** Missing index on `question_id` foreign key - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

### 2.7 questions

| Index Name                 | Columns      | Type    | Description                    |
| -------------------------- | ------------ | ------- | ------------------------------ |
| `questions_pkey`           | `id`         | PRIMARY | Primary key index              |
| `idx_questions_lesson_id`  | `lesson_id`  | B-tree  | Foreign key lookup to lessons  |
| `idx_questions_topic_id`   | `topic_id`   | B-tree  | Foreign key lookup to topics   |
| `idx_questions_difficulty` | `difficulty` | B-tree  | Filter questions by difficulty |

### 2.8 question_options

| Index Name                         | Columns       | Type    | Description                     |
| ---------------------------------- | ------------- | ------- | ------------------------------- |
| `question_options_pkey`            | `id`          | PRIMARY | Primary key index               |
| `idx_question_options_question_id` | `question_id` | B-tree  | Foreign key lookup to questions |

### 2.9 question_media

| Index Name                       | Columns       | Type    | Description                     |
| -------------------------------- | ------------- | ------- | ------------------------------- |
| `question_media_pkey`            | `id`          | PRIMARY | Primary key index               |
| `idx_question_media_question_id` | `question_id` | B-tree  | Foreign key lookup to questions |

### 2.10 flashcards

| Index Name                 | Columns     | Type    | Description                   |
| -------------------------- | ----------- | ------- | ----------------------------- |
| `flashcards_pkey`          | `id`        | PRIMARY | Primary key index             |
| `idx_flashcards_lesson_id` | `lesson_id` | B-tree  | Foreign key lookup to lessons |
| `idx_flashcards_topic_id`  | `topic_id`  | B-tree  | Foreign key lookup to topics  |
| `idx_flashcards_category`  | `category`  | B-tree  | Filter flashcards by category |

### 2.11 module_access_rules

| Index Name                          | Columns     | Type    | Description                   |
| ----------------------------------- | ----------- | ------- | ----------------------------- |
| `module_access_rules_pkey`          | `id`        | PRIMARY | Primary key index             |
| `idx_module_access_rules_module_id` | `module_id` | B-tree  | Foreign key lookup to modules |

---

## 3. Progress & Practice Indexes

### 3.1 learning_completions

| Index Name                              | Columns        | Type    | Description                 |
| --------------------------------------- | -------------- | ------- | --------------------------- |
| `learning_completions_pkey`             | `id`           | PRIMARY | Primary key index           |
| `idx_learning_completions_user_id`      | `user_id`      | B-tree  | Foreign key lookup to users |
| `idx_learning_completions_completed_at` | `completed_at` | B-tree  | Query completions by date   |

**Note:** Missing index on `lesson_id` foreign key - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

### 3.2 learning_progress

| Index Name                      | Columns   | Type    | Description                 |
| ------------------------------- | --------- | ------- | --------------------------- |
| `learning_progress_pkey`        | `id`      | PRIMARY | Primary key index           |
| `idx_learning_progress_user_id` | `user_id` | B-tree  | Foreign key lookup to users |

**Note:** Missing indexes on `module_id`, `topic_id`, `subtopic_id` foreign keys - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

### 3.3 learning_paths

| Index Name                   | Columns   | Type    | Description                 |
| ---------------------------- | --------- | ------- | --------------------------- |
| `learning_paths_pkey`        | `id`      | PRIMARY | Primary key index           |
| `idx_learning_paths_user_id` | `user_id` | B-tree  | Foreign key lookup to users |

### 3.4 lesson_quiz_results

| Index Name                          | Columns     | Type    | Description                   |
| ----------------------------------- | ----------- | ------- | ----------------------------- |
| `lesson_quiz_results_pkey`          | `id`        | PRIMARY | Primary key index             |
| `idx_lesson_quiz_results_user_id`   | `user_id`   | B-tree  | Foreign key lookup to users   |
| `idx_lesson_quiz_results_lesson_id` | `lesson_id` | B-tree  | Foreign key lookup to lessons |

### 3.5 practice_sessions

| Index Name                      | Columns   | Type    | Description                 |
| ------------------------------- | --------- | ------- | --------------------------- |
| `practice_sessions_pkey`        | `id`      | PRIMARY | Primary key index           |
| `idx_practice_sessions_user_id` | `user_id` | B-tree  | Foreign key lookup to users |

**Note:** Missing index on `topic_id` foreign key - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

### 3.6 practice_results

| Index Name                        | Columns      | Type    | Description                             |
| --------------------------------- | ------------ | ------- | --------------------------------------- |
| `practice_results_pkey`           | `id`         | PRIMARY | Primary key index                       |
| `idx_practice_results_session_id` | `session_id` | B-tree  | Foreign key lookup to practice_sessions |

**Note:** Missing indexes on `question_id`, `selected_option_id` foreign keys - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

### 3.7 mock_exam_config

| Index Name              | Columns | Type    | Description       |
| ----------------------- | ------- | ------- | ----------------- |
| `mock_exam_config_pkey` | `id`    | PRIMARY | Primary key index |

### 3.8 mock_exams

| Index Name               | Columns   | Type    | Description                 |
| ------------------------ | --------- | ------- | --------------------------- |
| `mock_exams_pkey`        | `id`      | PRIMARY | Primary key index           |
| `idx_mock_exams_user_id` | `user_id` | B-tree  | Foreign key lookup to users |

**Note:** Missing index on `config_id` foreign key - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

### 3.9 mock_results

| Index Name                 | Columns   | Type    | Description                      |
| -------------------------- | --------- | ------- | -------------------------------- |
| `mock_results_pkey`        | `id`      | PRIMARY | Primary key index                |
| `idx_mock_results_exam_id` | `exam_id` | B-tree  | Foreign key lookup to mock_exams |

**Note:** Missing indexes on `question_id`, `selected_option_id` foreign keys - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

### 3.10 mock_sessions

| Index Name                  | Columns   | Type    | Description                      |
| --------------------------- | --------- | ------- | -------------------------------- |
| `mock_sessions_pkey`        | `id`      | PRIMARY | Primary key index                |
| `idx_mock_sessions_exam_id` | `exam_id` | B-tree  | Foreign key lookup to mock_exams |

### 3.11 ai_recommendations

| Index Name                       | Columns   | Type    | Description                 |
| -------------------------------- | --------- | ------- | --------------------------- |
| `ai_recommendations_pkey`        | `id`      | PRIMARY | Primary key index           |
| `idx_ai_recommendations_user_id` | `user_id` | B-tree  | Foreign key lookup to users |

### 3.12 user_analytics

| Index Name                   | Columns   | Type    | Description                 |
| ---------------------------- | --------- | ------- | --------------------------- |
| `user_analytics_pkey`        | `id`      | PRIMARY | Primary key index           |
| `idx_user_analytics_user_id` | `user_id` | B-tree  | Foreign key lookup to users |

---

## 4. Trial Module System Indexes

### 4.1 trial_mock_exams

| Index Name                    | Columns     | Type    | Description                   |
| ----------------------------- | ----------- | ------- | ----------------------------- |
| `trial_mock_exams_pkey`       | `id`        | PRIMARY | Primary key index             |
| `idx_trial_mock_exams_module` | `module_id` | B-tree  | Foreign key lookup to modules |

### 4.2 trial_exam_attempts

| Index Name                       | Columns     | Type    | Description                            |
| -------------------------------- | ----------- | ------- | -------------------------------------- |
| `trial_exam_attempts_pkey`       | `id`        | PRIMARY | Primary key index                      |
| `idx_trial_exam_attempts_user`   | `user_id`   | B-tree  | Foreign key lookup to user_profiles    |
| `idx_trial_exam_attempts_exam`   | `exam_id`   | B-tree  | Foreign key lookup to trial_mock_exams |
| `idx_trial_exam_attempts_passed` | `is_passed` | B-tree  | Filter by pass/fail status             |

### 4.3 trial_learning_progress

| Index Name                     | Columns     | Type    | Description                         |
| ------------------------------ | ----------- | ------- | ----------------------------------- |
| `trial_learning_progress_pkey` | `id`        | PRIMARY | Primary key index                   |
| `idx_trial_learning_user`      | `user_id`   | B-tree  | Foreign key lookup to user_profiles |
| `idx_trial_learning_topic`     | `topic_id`  | B-tree  | Foreign key lookup to topics        |
| `idx_trial_learning_lesson`    | `lesson_id` | B-tree  | Foreign key lookup to lessons       |

### 4.4 trial_attempt_records

| Index Name                   | Columns        | Type    | Description                         |
| ---------------------------- | -------------- | ------- | ----------------------------------- |
| `trial_attempt_records_pkey` | `id`           | PRIMARY | Primary key index                   |
| `idx_trial_attempts_user`    | `user_id`      | B-tree  | Foreign key lookup to user_profiles |
| `idx_trial_attempts_module`  | `module_id`    | B-tree  | Foreign key lookup to modules       |
| `idx_trial_attempts_content` | `content_type` | B-tree  | Filter by content type              |

---

## 5. Subscriptions & Payments Indexes

### 5.1 subscription_plans

| Index Name                             | Columns         | Type    | Description                 |
| -------------------------------------- | --------------- | ------- | --------------------------- |
| `subscription_plans_pkey`              | `id`            | PRIMARY | Primary key index           |
| `idx_subscription_plans_display_order` | `display_order` | B-tree  | Sort plans by display order |

### 5.2 subscriptions

| Index Name                  | Columns   | Type    | Description                    |
| --------------------------- | --------- | ------- | ------------------------------ |
| `subscriptions_pkey`        | `id`      | PRIMARY | Primary key index              |
| `idx_subscriptions_user_id` | `user_id` | B-tree  | Foreign key lookup to users    |
| `idx_subscriptions_status`  | `status`  | B-tree  | Filter subscriptions by status |

**Note:** Missing indexes on `plan_id`, `coupon_code` foreign keys - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

### 5.3 subscription_usage

| Index Name                               | Columns           | Type    | Description                         |
| ---------------------------------------- | ----------------- | ------- | ----------------------------------- |
| `subscription_usage_pkey`                | `id`              | PRIMARY | Primary key index                   |
| `idx_subscription_usage_subscription_id` | `subscription_id` | B-tree  | Foreign key lookup to subscriptions |

### 5.4 discount_coupons

| Index Name                  | Columns | Type    | Description                 |
| --------------------------- | ------- | ------- | --------------------------- |
| `discount_coupons_pkey`     | `id`    | PRIMARY | Primary key index           |
| `discount_coupons_code_key` | `code`  | UNIQUE  | Ensures unique coupon codes |

---

## 6. System & Settings Indexes

### 6.1 app_settings

| Index Name             | Columns | Type    | Description                 |
| ---------------------- | ------- | ------- | --------------------------- |
| `app_settings_pkey`    | `id`    | PRIMARY | Primary key index           |
| `app_settings_key_key` | `key`   | UNIQUE  | Ensures unique setting keys |

### 6.2 dashboard_hero

| Index Name                         | Columns         | Type    | Description                         |
| ---------------------------------- | --------------- | ------- | ----------------------------------- |
| `dashboard_hero_pkey`              | `id`            | PRIMARY | Primary key index                   |
| `idx_dashboard_hero_display_order` | `display_order` | B-tree  | Sort hero sections by display order |

### 6.3 content_approvals

| Index Name                     | Columns  | Type    | Description                |
| ------------------------------ | -------- | ------- | -------------------------- |
| `content_approvals_pkey`       | `id`     | PRIMARY | Primary key index          |
| `idx_content_approvals_status` | `status` | B-tree  | Filter approvals by status |

**Note:** Missing indexes on `submitted_by`, `reviewed_by` foreign keys - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

### 6.4 email_templates

| Index Name                 | Columns | Type    | Description                   |
| -------------------------- | ------- | ------- | ----------------------------- |
| `email_templates_pkey`     | `id`    | PRIMARY | Primary key index             |
| `email_templates_name_key` | `name`  | UNIQUE  | Ensures unique template names |

---

## 7. AI & Chat Indexes

### 7.1 chat_conversations

| Index Name                       | Columns           | Type    | Description                         |
| -------------------------------- | ----------------- | ------- | ----------------------------------- |
| `chat_conversations_pkey`        | `id`              | PRIMARY | Primary key index                   |
| `idx_chat_conversations_user`    | `user_id`         | B-tree  | Foreign key lookup to users         |
| `idx_chat_conversations_created` | `created_at DESC` | B-tree  | Sort conversations by creation date |

### 7.2 chat_messages

| Index Name                       | Columns           | Type    | Description                              |
| -------------------------------- | ----------------- | ------- | ---------------------------------------- |
| `chat_messages_pkey`             | `id`              | PRIMARY | Primary key index                        |
| `idx_chat_messages_conversation` | `conversation_id` | B-tree  | Foreign key lookup to chat_conversations |
| `idx_chat_messages_created`      | `created_at DESC` | B-tree  | Sort messages by creation date           |

### 7.3 ai_usage_stats

| Index Name               | Columns         | Type      | Description                   |
| ------------------------ | --------------- | --------- | ----------------------------- |
| `ai_usage_stats_pkey`    | `id`            | PRIMARY   | Primary key index             |
| `idx_ai_usage_user_date` | `user_id, date` | Composite | Lookup usage by user and date |

---

## 8. Notifications Indexes

### 8.1 notifications

| Index Name                    | Columns             | Type    | Description                   |
| ----------------------------- | ------------------- | ------- | ----------------------------- |
| `notifications_pkey`          | `id`                | PRIMARY | Primary key index             |
| `idx_notifications_type`      | `notification_type` | B-tree  | Filter by notification type   |
| `idx_notifications_scheduled` | `scheduled_at`      | B-tree  | Query scheduled notifications |

**Note:** Missing index on `created_by` foreign key - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

### 8.2 notification_queue

| Index Name                      | Columns           | Type    | Description                 |
| ------------------------------- | ----------------- | ------- | --------------------------- |
| `notification_queue_pkey`       | `id`              | PRIMARY | Primary key index           |
| `idx_notification_queue_status` | `delivery_status` | B-tree  | Filter by delivery status   |
| `idx_notification_queue_user`   | `user_id`         | B-tree  | Foreign key lookup to users |

**Note:** Missing index on `notification_id` foreign key - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

### 8.3 notification_targets

| Index Name                        | Columns            | Type    | Description                                                      |
| --------------------------------- | ------------------ | ------- | ---------------------------------------------------------------- |
| `notification_targets_pkey`       | `id`               | PRIMARY | Primary key index                                                |
| `idx_notification_targets_user`   | `user_id`          | B-tree  | Foreign key lookup to users                                      |
| `idx_notification_targets_unread` | `user_id, is_read` | Partial | Optimized query for unread notifications (WHERE is_read = false) |

**Note:** Missing index on `notification_id` foreign key - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

### 8.4 push_tokens

| Index Name              | Columns   | Type    | Description                 |
| ----------------------- | --------- | ------- | --------------------------- |
| `push_tokens_pkey`      | `id`      | PRIMARY | Primary key index           |
| `push_tokens_token_key` | `token`   | UNIQUE  | Ensures unique push tokens  |
| `idx_push_tokens_user`  | `user_id` | B-tree  | Foreign key lookup to users |

### 8.5 user_notification_reads

| Index Name                         | Columns   | Type    | Description                 |
| ---------------------------------- | --------- | ------- | --------------------------- |
| `user_notification_reads_pkey`     | `id`      | PRIMARY | Primary key index           |
| `idx_user_notification_reads_user` | `user_id` | B-tree  | Foreign key lookup to users |

**Note:** Missing index on `notification_id` foreign key - see [Missing Indexes](#10-missing-indexes-for-foreign-keys)

---

## 9. Analytics & Backup Indexes

### 9.1 analytics_sessions

| Index Name                     | Columns         | Type    | Description                  |
| ------------------------------ | --------------- | ------- | ---------------------------- |
| `analytics_sessions_pkey`      | `id`            | PRIMARY | Primary key index            |
| `idx_analytics_sessions_user`  | `user_id`       | B-tree  | Foreign key lookup to users  |
| `idx_analytics_sessions_start` | `session_start` | B-tree  | Query sessions by start time |

### 9.2 daily_stats

| Index Name             | Columns | Type    | Description                 |
| ---------------------- | ------- | ------- | --------------------------- |
| `daily_stats_pkey`     | `id`    | PRIMARY | Primary key index           |
| `daily_stats_date_key` | `date`  | UNIQUE  | Ensures one record per date |

### 9.3 flashcards_backup

| Index Name               | Columns | Type    | Description       |
| ------------------------ | ------- | ------- | ----------------- |
| `flashcards_backup_pkey` | `id`    | PRIMARY | Primary key index |

### 9.4 lessons_backup

| Index Name            | Columns | Type    | Description       |
| --------------------- | ------- | ------- | ----------------- |
| `lessons_backup_pkey` | `id`    | PRIMARY | Primary key index |

### 9.5 questions_backup

| Index Name              | Columns | Type    | Description       |
| ----------------------- | ------- | ------- | ----------------- |
| `questions_backup_pkey` | `id`    | PRIMARY | Primary key index |

---

## 10. Missing Indexes for Foreign Keys

The following foreign key columns do not have dedicated indexes, which may cause performance issues on JOIN operations and cascading deletes.

### High Priority (Frequently Queried)

| Table                      | Column            | Referenced Table     | Recommended Index                                                                                 |
| -------------------------- | ----------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| `notification_preferences` | `user_id`         | `users`              | `CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);`         |
| `lesson_quizzes`           | `question_id`     | `questions`          | `CREATE INDEX idx_lesson_quizzes_question_id ON lesson_quizzes(question_id);`                     |
| `learning_completions`     | `lesson_id`       | `lessons`            | `CREATE INDEX idx_learning_completions_lesson_id ON learning_completions(lesson_id);`             |
| `subscriptions`            | `plan_id`         | `subscription_plans` | `CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);`                               |
| `notification_queue`       | `notification_id` | `notifications`      | `CREATE INDEX idx_notification_queue_notification_id ON notification_queue(notification_id);`     |
| `notification_targets`     | `notification_id` | `notifications`      | `CREATE INDEX idx_notification_targets_notification_id ON notification_targets(notification_id);` |

### Medium Priority (Moderate Query Frequency)

| Table                     | Column            | Referenced Table   | Recommended Index                                                                                       |
| ------------------------- | ----------------- | ------------------ | ------------------------------------------------------------------------------------------------------- |
| `learning_progress`       | `module_id`       | `modules`          | `CREATE INDEX idx_learning_progress_module_id ON learning_progress(module_id);`                         |
| `learning_progress`       | `topic_id`        | `topics`           | `CREATE INDEX idx_learning_progress_topic_id ON learning_progress(topic_id);`                           |
| `learning_progress`       | `subtopic_id`     | `subtopics`        | `CREATE INDEX idx_learning_progress_subtopic_id ON learning_progress(subtopic_id);`                     |
| `practice_sessions`       | `topic_id`        | `topics`           | `CREATE INDEX idx_practice_sessions_topic_id ON practice_sessions(topic_id);`                           |
| `mock_exams`              | `config_id`       | `mock_exam_config` | `CREATE INDEX idx_mock_exams_config_id ON mock_exams(config_id);`                                       |
| `notifications`           | `created_by`      | `admin_users`      | `CREATE INDEX idx_notifications_created_by ON notifications(created_by);`                               |
| `user_notification_reads` | `notification_id` | `notifications`    | `CREATE INDEX idx_user_notification_reads_notification_id ON user_notification_reads(notification_id);` |

### Lower Priority (Less Frequently Queried)

| Table               | Column               | Referenced Table   | Recommended Index                                                                               |
| ------------------- | -------------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `practice_results`  | `question_id`        | `questions`        | `CREATE INDEX idx_practice_results_question_id ON practice_results(question_id);`               |
| `practice_results`  | `selected_option_id` | `question_options` | `CREATE INDEX idx_practice_results_selected_option_id ON practice_results(selected_option_id);` |
| `mock_results`      | `question_id`        | `questions`        | `CREATE INDEX idx_mock_results_question_id ON mock_results(question_id);`                       |
| `mock_results`      | `selected_option_id` | `question_options` | `CREATE INDEX idx_mock_results_selected_option_id ON mock_results(selected_option_id);`         |
| `subscriptions`     | `coupon_code`        | `discount_coupons` | `CREATE INDEX idx_subscriptions_coupon_code ON subscriptions(coupon_code);`                     |
| `content_approvals` | `submitted_by`       | `admin_users`      | `CREATE INDEX idx_content_approvals_submitted_by ON content_approvals(submitted_by);`           |
| `content_approvals` | `reviewed_by`        | `admin_users`      | `CREATE INDEX idx_content_approvals_reviewed_by ON content_approvals(reviewed_by);`             |

---

## 11. Index Optimization Recommendations

### Recommended Composite Indexes

For common query patterns, consider adding these composite indexes:

```sql
-- User progress queries (frequently filter by user + module/topic)
CREATE INDEX idx_learning_progress_user_module ON learning_progress(user_id, module_id);
CREATE INDEX idx_learning_progress_user_topic ON learning_progress(user_id, topic_id);

-- Subscription queries (frequently filter by user + status)
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);

-- Notification queries (frequently filter by user + read status)
CREATE INDEX idx_notification_targets_user_unread ON notification_targets(user_id) WHERE is_read = false;

-- Practice session queries (frequently filter by user + status)
CREATE INDEX idx_practice_sessions_user_status ON practice_sessions(user_id, status);
```

### Partial Index Recommendations

For tables with boolean flags frequently used in WHERE clauses:

```sql
-- Active modules only
CREATE INDEX idx_modules_active ON modules(id) WHERE is_active = true;

-- Active lessons only
CREATE INDEX idx_lessons_active ON lessons(id) WHERE is_active = true;

-- Pending notifications
CREATE INDEX idx_notification_queue_pending ON notification_queue(id) WHERE delivery_status = 'pending';

-- Active subscriptions
CREATE INDEX idx_subscriptions_active ON subscriptions(user_id) WHERE status = 'active';
```

### Index Maintenance Notes

1. **Monitor Index Usage**: Use `pg_stat_user_indexes` to identify unused indexes
2. **Reindex Periodically**: Run `REINDEX` on heavily updated tables
3. **Analyze Tables**: Run `ANALYZE` after bulk data changes
4. **Check Bloat**: Monitor index bloat with `pgstattuple` extension

---

## Summary Statistics

| Category                       | Count |
| ------------------------------ | ----- |
| Total Tables                   | 53    |
| Tables with Indexes            | 53    |
| Primary Key Indexes            | 53    |
| Unique Indexes                 | 12    |
| Foreign Key Indexes (existing) | 45+   |
| Missing FK Indexes             | 19    |
| Partial Indexes                | 1     |
| Composite Indexes              | 2     |
