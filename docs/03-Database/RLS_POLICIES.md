# Jeeva Learning - Row Level Security (RLS) Policies Documentation

## Overview

This document provides comprehensive documentation for all Row Level Security (RLS) policies in the Jeeva Learning platform's Supabase PostgreSQL database. RLS policies control data access at the row level, ensuring users can only access data they are authorized to view or modify.

**Total Tables with RLS Enabled:** 28  
**Total Tables Needing RLS:** 26  
**Schema:** public

---

## Table of Contents

1. [RLS Policy Basics](#1-rls-policy-basics)
2. [Tables with RLS Enabled](#2-tables-with-rls-enabled)
   - [Authentication & Users](#21-authentication--users)
   - [Learning Content](#22-learning-content)
   - [Progress & Practice](#23-progress--practice)
   - [Trial Module System](#24-trial-module-system)
   - [Subscriptions & Payments](#25-subscriptions--payments)
   - [System & Settings](#26-system--settings)
   - [AI & Chat](#27-ai--chat)
   - [Notifications](#28-notifications)
3. [Policy Matrix](#3-policy-matrix)
4. [Tables Needing RLS Policies](#4-tables-needing-rls-policies)

---

## 1. RLS Policy Basics

### How RLS Works in Supabase

Row Level Security (RLS) is a PostgreSQL feature that restricts which rows can be returned by queries or modified by DML commands. In Supabase:

- RLS is enabled per table using `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY`
- Policies define rules for SELECT, INSERT, UPDATE, and DELETE operations
- `auth.uid()` returns the current authenticated user's ID
- `auth.role()` returns the current user's role

### Policy Types

| Policy Type | Description |
|-------------|-------------|
| USING | Filters rows for SELECT, UPDATE, DELETE operations |
| WITH CHECK | Validates new/modified rows for INSERT, UPDATE operations |

### Common Patterns

```sql
-- User can only access their own data
CREATE POLICY "Users can view own data" ON table_name
FOR SELECT USING (auth.uid() = user_id);

-- User can insert their own data
CREATE POLICY "Users can insert own data" ON table_name
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access
CREATE POLICY "Public read access" ON table_name
FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin full access" ON table_name
FOR ALL USING (auth.role() = 'admin');
```

---

## 2. Tables with RLS Enabled

### 2.1 Authentication & Users

#### users

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| users_select_own | SELECT | `auth.uid() = id` | - |
| users_update_own | UPDATE | `auth.uid() = id` | `auth.uid() = id` |

**Description:** Users can only view and update their own user record.

---

#### user_profiles

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| profiles_select_own | SELECT | `auth.uid() = user_id` | - |
| profiles_insert_own | INSERT | - | `auth.uid() = user_id` |
| profiles_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Description:** Users can view, create, and update their own profile.

---

#### user_sessions

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| sessions_select_own | SELECT | `auth.uid() = user_id` | - |
| sessions_insert_own | INSERT | - | `auth.uid() = user_id` |
| sessions_delete_own | DELETE | `auth.uid() = user_id` | - |

**Description:** Users can manage their own session records.

---

#### admin_users

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| admin_select_self | SELECT | `auth.uid() = id` | - |
| admin_superadmin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin')` | - |

**Description:** Admins can view their own record. Superadmins have full access to all admin records.

---

#### notification_preferences

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| prefs_select_own | SELECT | `auth.uid() = user_id` | - |
| prefs_insert_own | INSERT | - | `auth.uid() = user_id` |
| prefs_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Description:** Users can manage their own notification preferences.

---

### 2.2 Learning Content

#### modules

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| modules_public_read | SELECT | `is_active = true` | - |
| modules_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Active modules are publicly readable. Admins have full access.

---

#### topics

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| topics_public_read | SELECT | `is_active = true` | - |
| topics_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Active topics are publicly readable. Admins have full access.

---

#### subtopics

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| subtopics_public_read | SELECT | `is_active = true` | - |
| subtopics_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Active subtopics are publicly readable. Admins have full access.

---

#### lessons

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| lessons_public_read | SELECT | `is_active = true` | - |
| lessons_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Active lessons are publicly readable. Admins have full access.

---

#### lesson_content

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| content_public_read | SELECT | `EXISTS (SELECT 1 FROM lessons WHERE id = lesson_id AND is_active = true)` | - |
| content_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Content is readable if parent lesson is active. Admins have full access.

---

#### lesson_quizzes

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| quizzes_public_read | SELECT | `EXISTS (SELECT 1 FROM lessons WHERE id = lesson_id AND is_active = true)` | - |
| quizzes_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Quiz mappings are readable if parent lesson is active. Admins have full access.

---

#### questions

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| questions_public_read | SELECT | `is_active = true` | - |
| questions_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Active questions are publicly readable. Admins have full access.

---

#### question_options

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| options_public_read | SELECT | `EXISTS (SELECT 1 FROM questions WHERE id = question_id AND is_active = true)` | - |
| options_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Options are readable if parent question is active. Admins have full access.

---

#### question_media

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| media_public_read | SELECT | `EXISTS (SELECT 1 FROM questions WHERE id = question_id AND is_active = true)` | - |
| media_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Media is readable if parent question is active. Admins have full access.

---

#### flashcards

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| flashcards_public_read | SELECT | `is_active = true` | - |
| flashcards_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Active flashcards are publicly readable. Admins have full access.

---

#### module_access_rules

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| rules_public_read | SELECT | `is_active = true` | - |
| rules_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Active access rules are publicly readable. Admins have full access.

---

### 2.3 Progress & Practice

#### learning_completions

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| completions_select_own | SELECT | `auth.uid() = user_id` | - |
| completions_insert_own | INSERT | - | `auth.uid() = user_id` |

**Description:** Users can view and record their own lesson completions.

---

#### learning_progress

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| progress_select_own | SELECT | `auth.uid() = user_id` | - |
| progress_insert_own | INSERT | - | `auth.uid() = user_id` |
| progress_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Description:** Users can manage their own learning progress records.

---

#### learning_paths

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| paths_select_own | SELECT | `auth.uid() = user_id` | - |
| paths_insert_own | INSERT | - | `auth.uid() = user_id` |
| paths_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Description:** Users can manage their own learning paths.

---

#### lesson_quiz_results

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| quiz_results_select_own | SELECT | `auth.uid() = user_id` | - |
| quiz_results_insert_own | INSERT | - | `auth.uid() = user_id` |

**Description:** Users can view and record their own quiz results.

---

#### practice_sessions

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| sessions_select_own | SELECT | `auth.uid() = user_id` | - |
| sessions_insert_own | INSERT | - | `auth.uid() = user_id` |
| sessions_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Description:** Users can manage their own practice sessions.

---

#### practice_results

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| results_select_own | SELECT | `EXISTS (SELECT 1 FROM practice_sessions WHERE id = session_id AND user_id = auth.uid())` | - |
| results_insert_own | INSERT | - | `EXISTS (SELECT 1 FROM practice_sessions WHERE id = session_id AND user_id = auth.uid())` |

**Description:** Users can manage results for their own practice sessions.

---

#### mock_exam_config

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| config_public_read | SELECT | `is_active = true` | - |
| config_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Active exam configs are publicly readable. Admins have full access.

---

#### mock_exams

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| exams_select_own | SELECT | `auth.uid() = user_id` | - |
| exams_insert_own | INSERT | - | `auth.uid() = user_id` |
| exams_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Description:** Users can manage their own mock exam attempts.

---

#### mock_results

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| mock_results_select_own | SELECT | `EXISTS (SELECT 1 FROM mock_exams WHERE id = exam_id AND user_id = auth.uid())` | - |
| mock_results_insert_own | INSERT | - | `EXISTS (SELECT 1 FROM mock_exams WHERE id = exam_id AND user_id = auth.uid())` |

**Description:** Users can manage results for their own mock exams.

---

#### mock_sessions

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| mock_sessions_select_own | SELECT | `EXISTS (SELECT 1 FROM mock_exams WHERE id = exam_id AND user_id = auth.uid())` | - |
| mock_sessions_insert_own | INSERT | - | `EXISTS (SELECT 1 FROM mock_exams WHERE id = exam_id AND user_id = auth.uid())` |
| mock_sessions_update_own | UPDATE | `EXISTS (SELECT 1 FROM mock_exams WHERE id = exam_id AND user_id = auth.uid())` | - |

**Description:** Users can manage sessions for their own mock exams.

---

#### ai_recommendations

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| recommendations_select_own | SELECT | `auth.uid() = user_id` | - |
| recommendations_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Description:** Users can view and dismiss their own AI recommendations.

---

#### user_analytics

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| analytics_select_own | SELECT | `auth.uid() = user_id` | - |

**Description:** Users can view their own analytics data.

---

### 2.4 Trial Module System

#### trial_mock_exams

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| trial_exams_public_read | SELECT | `true` | - |
| trial_exams_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Trial exams are publicly readable. Admins have full access.

---

#### trial_exam_attempts

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| trial_attempts_select_own | SELECT | `auth.uid() = user_id` | - |
| trial_attempts_insert_own | INSERT | - | `auth.uid() = user_id` |
| trial_attempts_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Description:** Users can manage their own trial exam attempts.

---

#### trial_learning_progress

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| trial_progress_select_own | SELECT | `auth.uid() = user_id` | - |
| trial_progress_insert_own | INSERT | - | `auth.uid() = user_id` |
| trial_progress_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Description:** Users can manage their own trial learning progress.

---

#### trial_attempt_records

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| trial_records_select_own | SELECT | `auth.uid() = user_id` | - |
| trial_records_insert_own | INSERT | - | `auth.uid() = user_id` |

**Description:** Users can view and create their own trial attempt records.



---

### 2.5 Subscriptions & Payments

#### subscription_plans

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| plans_public_read | SELECT | `is_active = true` | - |
| plans_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Active subscription plans are publicly readable. Admins have full access.

---

#### subscriptions

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| subscriptions_select_own | SELECT | `auth.uid() = user_id` | - |
| subscriptions_insert_own | INSERT | - | `auth.uid() = user_id` |
| subscriptions_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |
| subscriptions_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Users can manage their own subscriptions. Admins have full access.

---

#### subscription_usage

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| usage_select_own | SELECT | `EXISTS (SELECT 1 FROM subscriptions WHERE id = subscription_id AND user_id = auth.uid())` | - |
| usage_insert_own | INSERT | - | `EXISTS (SELECT 1 FROM subscriptions WHERE id = subscription_id AND user_id = auth.uid())` |
| usage_update_own | UPDATE | `EXISTS (SELECT 1 FROM subscriptions WHERE id = subscription_id AND user_id = auth.uid())` | - |

**Description:** Users can manage usage records for their own subscriptions.

---

#### discount_coupons

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| coupons_public_read | SELECT | `is_active = true AND (max_uses IS NULL OR times_used < max_uses)` | - |
| coupons_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Active, non-exhausted coupons are publicly readable. Admins have full access.

---

### 2.6 System & Settings

#### app_settings

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| settings_public_read | SELECT | `true` | - |
| settings_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** App settings are publicly readable. Admins have full access.

---

#### dashboard_hero

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| hero_public_read | SELECT | `is_active = true` | - |
| hero_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Active hero sections are publicly readable. Admins have full access.

---

#### content_approvals

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| approvals_admin_read | SELECT | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |
| approvals_admin_insert | INSERT | - | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` |
| approvals_admin_update | UPDATE | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Only admins can view and manage content approvals.

---

#### email_templates

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| templates_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Only admins can manage email templates.

---

### 2.7 AI & Chat

#### chat_conversations

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| conversations_select_own | SELECT | `auth.uid() = user_id` | - |
| conversations_insert_own | INSERT | - | `auth.uid() = user_id` |
| conversations_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |
| conversations_delete_own | DELETE | `auth.uid() = user_id` | - |

**Description:** Users can fully manage their own chat conversations.

---

#### chat_messages

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| messages_select_own | SELECT | `EXISTS (SELECT 1 FROM chat_conversations WHERE id = conversation_id AND user_id = auth.uid())` | - |
| messages_insert_own | INSERT | - | `EXISTS (SELECT 1 FROM chat_conversations WHERE id = conversation_id AND user_id = auth.uid())` |

**Description:** Users can view and add messages to their own conversations.

---

#### ai_usage_stats

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| ai_stats_select_own | SELECT | `auth.uid() = user_id` | - |
| ai_stats_insert_own | INSERT | - | `auth.uid() = user_id` |
| ai_stats_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Description:** Users can manage their own AI usage statistics.

---

### 2.8 Notifications

#### notifications

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| notifications_user_read | SELECT | `audience_filter->>'type' = 'all' OR audience_filter->'userIds' ? auth.uid()::text` | - |
| notifications_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Users can view notifications targeted to them. Admins have full access.

---

#### notification_queue

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| queue_admin_all | ALL | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` | - |

**Description:** Only admins can manage the notification queue.

---

#### notification_targets

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| targets_select_own | SELECT | `auth.uid() = user_id` | - |
| targets_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Description:** Users can view and update their own notification targets.

---

#### push_tokens

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| tokens_select_own | SELECT | `auth.uid() = user_id` | - |
| tokens_insert_own | INSERT | - | `auth.uid() = user_id` |
| tokens_update_own | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |
| tokens_delete_own | DELETE | `auth.uid() = user_id` | - |

**Description:** Users can fully manage their own push tokens.

---

#### user_notification_reads

**RLS Enabled:** Yes

| Policy Name | Operation | USING Expression | WITH CHECK Expression |
|-------------|-----------|------------------|----------------------|
| reads_select_own | SELECT | `auth.uid() = user_id` | - |
| reads_insert_own | INSERT | - | `auth.uid() = user_id` |

**Description:** Users can view and record their own notification reads.

---

## 3. Policy Matrix

### Role-Based Access Matrix

This matrix shows which operations each role can perform on each table category.

| Table Category | User (SELECT) | User (INSERT) | User (UPDATE) | User (DELETE) | Admin (ALL) |
|----------------|---------------|---------------|---------------|---------------|-------------|
| **Auth & Users** |
| users | Own only | - | Own only | - | Superadmin |
| user_profiles | Own only | Own only | Own only | - | Superadmin |
| user_sessions | Own only | Own only | - | Own only | Superadmin |
| admin_users | Own only | - | - | - | Superadmin |
| notification_preferences | Own only | Own only | Own only | - | Superadmin |
| **Learning Content** |
| modules | Active only | - | - | - | ✓ |
| topics | Active only | - | - | - | ✓ |
| subtopics | Active only | - | - | - | ✓ |
| lessons | Active only | - | - | - | ✓ |
| lesson_content | Via lesson | - | - | - | ✓ |
| lesson_quizzes | Via lesson | - | - | - | ✓ |
| questions | Active only | - | - | - | ✓ |
| question_options | Via question | - | - | - | ✓ |
| question_media | Via question | - | - | - | ✓ |
| flashcards | Active only | - | - | - | ✓ |
| module_access_rules | Active only | - | - | - | ✓ |
| **Progress & Practice** |
| learning_completions | Own only | Own only | - | - | - |
| learning_progress | Own only | Own only | Own only | - | - |
| learning_paths | Own only | Own only | Own only | - | - |
| lesson_quiz_results | Own only | Own only | - | - | - |
| practice_sessions | Own only | Own only | Own only | - | - |
| practice_results | Via session | Via session | - | - | - |
| mock_exam_config | Active only | - | - | - | ✓ |
| mock_exams | Own only | Own only | Own only | - | - |
| mock_results | Via exam | Via exam | - | - | - |
| mock_sessions | Via exam | Via exam | Via exam | - | - |
| ai_recommendations | Own only | - | Own only | - | - |
| user_analytics | Own only | - | - | - | - |
| **Trial Module** |
| trial_mock_exams | All | - | - | - | ✓ |
| trial_exam_attempts | Own only | Own only | Own only | - | - |
| trial_learning_progress | Own only | Own only | Own only | - | - |
| trial_attempt_records | Own only | Own only | - | - | - |
| **Subscriptions** |
| subscription_plans | Active only | - | - | - | ✓ |
| subscriptions | Own only | Own only | Own only | - | ✓ |
| subscription_usage | Via sub | Via sub | Via sub | - | - |
| discount_coupons | Active only | - | - | - | ✓ |
| **System** |
| app_settings | All | - | - | - | ✓ |
| dashboard_hero | Active only | - | - | - | ✓ |
| content_approvals | - | - | - | - | ✓ |
| email_templates | - | - | - | - | ✓ |
| **AI & Chat** |
| chat_conversations | Own only | Own only | Own only | Own only | - |
| chat_messages | Via conv | Via conv | - | - | - |
| ai_usage_stats | Own only | Own only | Own only | - | - |
| **Notifications** |
| notifications | Targeted | - | - | - | ✓ |
| notification_queue | - | - | - | - | ✓ |
| notification_targets | Own only | - | Own only | - | - |
| push_tokens | Own only | Own only | Own only | Own only | - |
| user_notification_reads | Own only | Own only | - | - | - |

**Legend:**
- Own only: User can only access their own records
- Active only: User can only access active records
- Via X: Access determined by parent record ownership
- Targeted: Access based on notification targeting
- ✓: Full access
- -: No access

### Service Role Access Pattern

The `service_role` is a special Supabase role that bypasses RLS policies. It should only be used for:

- Server-side operations (Edge Functions, webhooks)
- Administrative tasks that require full database access
- Background jobs and scheduled tasks

```sql
-- Example: Service role bypass pattern
-- When auth.role() = 'service_role', RLS is bypassed
CREATE POLICY "service_role_bypass" ON table_name
FOR ALL USING (auth.role() = 'service_role');
```

**Important:** Never expose the service_role key to client-side code.

---

## 4. Tables Needing RLS Policies

The following tables do not have RLS enabled and should be evaluated for security requirements.

### High Priority

These tables contain potentially sensitive data and should have RLS policies added:

| Table | Risk Level | Recommended Policy |
|-------|------------|-------------------|
| analytics_sessions | High | Admin-only access for viewing, system insert |
| daily_stats | High | Admin-only access |

### Medium Priority

These tables are backup/archive tables with lower risk:

| Table | Risk Level | Recommended Policy |
|-------|------------|-------------------|
| flashcards_backup | Medium | Admin-only access |
| lessons_backup | Medium | Admin-only access |
| questions_backup | Medium | Admin-only access |
| hero_sections | Medium | Public read, admin write |

### Recommended Implementation

```sql
-- Example: Enable RLS on analytics_sessions
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_admin_only" ON analytics_sessions
FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Example: Enable RLS on backup tables
ALTER TABLE flashcards_backup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "backup_admin_only" ON flashcards_backup
FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
```