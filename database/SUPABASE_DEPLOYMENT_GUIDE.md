# Supabase Database Deployment Guide

## Overview

This guide will help you deploy all database migrations to your Supabase project. The Jeeva Learning Platform uses Supabase for authentication, database, and serverless functions.

---

## Prerequisites

1. **Supabase Account**: Create one at https://supabase.com
2. **Supabase Project**: Create a new project (note your project URL and keys)
3. **Environment Variables**: You should already have these secrets configured in Replit:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## Migration Order (IMPORTANT!)

Run migrations in this exact order to avoid foreign key errors:

### 1. Core Content Tables
**File:** `create_content_tables.sql`

**What it creates:**
- `modules` - Course modules (e.g., "Practice MCQs", "Learning Content", "Mock Exams")
- `topics` - Topics within modules
- `lessons` - Individual lessons with rich text content
- `flashcards` - Study flashcards for lessons
- `questions` - Quiz questions (MCQ, True/False, Fill-in-blank)
- `question_options` - Answer choices for questions

**RLS Policies:**
- Superadmin: Full CRUD
- Editor: Create, Read, Update
- Moderator: Read-only

---

### 2. NMC Exam Structure
**File:** `restructure_for_nmc_modules.sql`

**What it creates:**
- Updates content structure for UK NMC CBT exam format
- `lesson_quiz_results` - Track quiz scores (80% passing requirement)
- Adds NMC-specific fields to existing tables

**Dependencies:** Must run after `create_content_tables.sql`

---

### 3. Learning Progress Tracking
**File:** `create_learning_completions.sql`

**What it creates:**
- `learning_completions` - Track which lessons users have completed
- Timestamps for completion tracking
- Progress percentage calculations

**Dependencies:** Requires `lessons` table from step 1

---

### 4. App Configuration
**File:** `create_app_settings.sql`

**What it creates:**
- `app_settings` - Global app configuration (JSONB storage)
- Automated notification rules
- Feature flags
- System-wide settings

**Use cases:**
- Configure automated notifications (subscription expiring, welcome messages)
- Toggle features on/off
- Store API keys and configurations

---

### 5. Push Notifications
**File:** `create_push_notifications.sql`

**What it creates:**
- `push_tokens` - Store Expo push notification tokens from mobile devices
- `notifications` - Notification campaigns and messages
- `notification_targets` - Delivery tracking per user
- `notification_queue` - Scheduled notification processing

**Functions:**
- `get_notification_stats()` - Get delivery metrics for a notification
- `mark_inactive_push_tokens()` - Clean up stale tokens

**RLS Policies:**
- Admins: Full access to all tables
- Users: Read-only access to their own push tokens and notifications

**Dependencies:** Requires `auth.users` (provided by Supabase)

---

## Step-by-Step Deployment

### Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your Jeeva Learning project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

---

### Step 2: Run Migrations in Order

For each migration file (in the order listed above):

1. **Open the migration file** in your code editor
2. **Copy the entire contents** (Cmd/Ctrl + A, then Cmd/Ctrl + C)
3. **Paste into Supabase SQL Editor**
4. **Click "Run"** (or press Cmd/Ctrl + Enter)
5. **Verify Success**:
   - You should see: `Success. No rows returned` (this is normal!)
   - Or: `Success. Rows affected: X`

**Migration Checklist:**

- [ ] `create_content_tables.sql` ✅
- [ ] `restructure_for_nmc_modules.sql` ✅
- [ ] `create_learning_completions.sql` ✅
- [ ] `create_app_settings.sql` ✅
- [ ] `create_push_notifications.sql` ✅

---

### Step 3: Verify Tables Were Created

1. In Supabase Dashboard, click **Table Editor**
2. You should see these tables:

**Content Management:**
- modules
- topics
- lessons
- flashcards
- questions
- question_options
- lesson_quiz_results

**User Progress:**
- learning_completions

**Platform:**
- app_settings

**Push Notifications:**
- push_tokens
- notifications
- notification_targets
- notification_queue

---

### Step 4: Create Your First Admin User

Run this SQL in the SQL Editor:

```sql
-- Insert a test admin user (replace with your actual user ID from Supabase Auth)
INSERT INTO admin_users (id, email, role, first_name, last_name, is_active)
VALUES (
  'YOUR-USER-ID-FROM-SUPABASE-AUTH',
  'admin@jeeva.com',
  'superadmin',
  'Admin',
  'User',
  true
);
```

**How to get your user ID:**
1. Sign up through your admin portal first
2. In Supabase Dashboard → Authentication → Users
3. Copy the User UID
4. Use it in the query above

---

### Step 5: Test Admin Portal Access

1. Go to your admin portal: https://your-repl-url.replit.app
2. Log in with your Supabase account
3. You should see the dashboard with:
   - Content Management (Modules, Topics, Lessons)
   - User Management
   - Subscriptions
   - Analytics
   - Push Notifications

---

## Troubleshooting

### Error: "relation admin_users does not exist"

**Solution:**
The `create_content_tables.sql` migration expects `admin_users` to exist. Create it manually first:

```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'editor', 'moderator')),
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all admin users
CREATE POLICY "Admins can read all admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );
```

---

### Error: "column users.last_login does not exist"

**Solution:**
This is expected. The analytics queries reference columns that don't exist yet. This won't affect functionality - analytics will just show empty data until user activity is tracked.

---

### Error: "Could not find a relationship between 'learning_completions' and 'lessons'"

**Solution:**
Make sure you ran migrations in the correct order. `learning_completions.sql` must be run AFTER `create_content_tables.sql`.

---

### Error: "schema auth does not exist"

**Solution:**
You're not running this in Supabase. The `auth` schema is automatically provided by Supabase. Make sure you're using Supabase SQL Editor, not a local PostgreSQL database.

---

### Push Notifications Show "0 sent"

**Expected Behavior:**
This is correct! The admin portal UI and database are ready, but **Edge Functions to actually send notifications are not deployed yet**.

See `docs/PUSH_NOTIFICATIONS_PHASE4.md` for implementation details.

---

## Next Steps

After running all migrations:

1. ✅ **Test Content Management**
   - Create a module (e.g., "Practice MCQs")
   - Add topics and lessons
   - Upload questions

2. ✅ **Configure App Settings**
   ```sql
   INSERT INTO app_settings (key, value, description)
   VALUES (
     'notifications_automation',
     '{"subscription_expiring": {"enabled": true, "days_before": 7}}'::jsonb,
     'Automated notification rules'
   );
   ```

3. ⏳ **Deploy Edge Functions** (Phase 4)
   - See `database/EDGE_FUNCTIONS_DEPLOYMENT.md` (to be created)
   - Required to actually send push notifications

4. ✅ **Integrate Mobile App**
   - Follow `docs/mobileapp-optimisation/push-notifications-guide.md`
   - Register device tokens
   - Handle deep linking

---

## Database Backup

**Important:** Always backup before running migrations!

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or download from Supabase Dashboard:
# Settings → Database → Backups → Download
```

---

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **SQL Editor Guide:** https://supabase.com/docs/guides/database/overview
- **RLS Policies:** https://supabase.com/docs/guides/auth/row-level-security
- **Migration Issues:** Check `database/migrations/SETUP_INSTRUCTIONS.md`

---

**Last Updated:** November 2025

**Status:** All migrations ready to deploy ✅
