# 🚀 Complete Deployment Guide - Jeeva Learning Platform

## Overview

This guide walks you through deploying the entire Jeeva Learning Platform backend to Supabase, including database tables, Edge Functions, and automated jobs.

---

## 📋 Deployment Checklist

Use this checklist to track your progress:

- [ ] **Phase 1:** Create Supabase project and configure environment variables
- [ ] **Phase 2:** Run database migrations (5 SQL files)
- [ ] **Phase 3:** Deploy Edge Functions (3 functions)
- [ ] **Phase 4:** Set up pg_cron jobs for automation
- [ ] **Phase 5:** Configure database triggers for real-time notifications
- [ ] **Phase 6:** Create first admin user and test the system
- [ ] **Phase 7:** Deploy mobile app with push notification integration

---

## Phase 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name:** Jeeva Learning
   - **Database Password:** (save this securely!)
   - **Region:** Choose closest to your users (e.g., Singapore for India)
   - **Pricing Plan:** Start with Free tier, upgrade to Pro when ready

### 1.2 Get Your Credentials

After project creation, go to **Settings → API**:

- `SUPABASE_URL` (Project URL): `https://YOUR-PROJECT-REF.supabase.co`
- `SUPABASE_ANON_KEY` (anon public): For frontend (safe to expose)
- `SUPABASE_SERVICE_ROLE_KEY` (service_role secret): For backend (NEVER expose!)

### 1.3 Configure Replit Environment Variables

In your Replit project, add these secrets (Secrets tab in Tools panel):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## Phase 2: Run Database Migrations

**Location:** `database/migrations/`

Run these SQL files **in this exact order** using Supabase SQL Editor:

### Migration Order:

1. ✅ **create_content_tables.sql**
   - Creates: modules, topics, lessons, flashcards, questions, question_options
   - RLS policies for admin roles
   - **Time:** ~2 minutes

2. ✅ **restructure_for_nmc_modules.sql**
   - Adds NMC exam-specific structure
   - Creates: lesson_quiz_results
   - **Time:** ~1 minute

3. ✅ **create_learning_completions.sql**
   - Creates: learning_completions
   - Tracks user progress
   - **Time:** ~30 seconds

4. ✅ **create_app_settings.sql**
   - Creates: app_settings
   - Stores global configuration
   - **Time:** ~30 seconds

5. ✅ **create_push_notifications.sql**
   - Creates: push_tokens, notifications, notification_targets, notification_queue
   - RLS policies for push notifications
   - Helper functions
   - **Time:** ~2 minutes

### How to Run Migrations:

1. Open **Supabase Dashboard → SQL Editor → New query**
2. Copy entire contents of migration file
3. Paste into SQL Editor
4. Click **Run** (or Cmd/Ctrl + Enter)
5. Verify success: "Success. No rows returned" or "Success. Rows affected: X"

**📖 Detailed Guide:** See `database/SUPABASE_DEPLOYMENT_GUIDE.md`

---

## Phase 3: Deploy Edge Functions

**Location:** `supabase/functions/`

### 3.1 Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# npm
npm install -g supabase
```

### 3.2 Login and Link Project

```bash
supabase login
supabase link --project-ref YOUR-PROJECT-REF
```

### 3.3 Deploy Functions

```bash
# Deploy all three functions
supabase functions deploy send-notification
supabase functions deploy track-receipts
supabase functions deploy process-automated-notifications
```

### 3.4 Set Environment Variables

```bash
supabase secrets set SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3.5 Test Functions

```bash
curl -X POST https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY"
```

**📖 Detailed Guide:** See `database/EDGE_FUNCTIONS_DEPLOYMENT.md`

---

## Phase 4: Set Up Automated Jobs (pg_cron)

**Location:** `database/sql_helpers/pg_cron_setup.sql`

### 4.1 Update Configuration

1. Open `pg_cron_setup.sql`
2. Replace `YOUR-PROJECT-REF` with your actual project reference
3. Replace `YOUR-SERVICE-ROLE-KEY` with your service role key

### 4.2 Run in SQL Editor

1. Copy entire file contents
2. Paste into Supabase SQL Editor
3. Click **Run**

### 4.3 Verify Jobs

```sql
SELECT * FROM cron.job;
```

You should see 4 scheduled jobs:
- `process-notification-queue` (every minute)
- `track-notification-receipts` (every 5 minutes)
- `process-automated-notifications` (daily at 10 AM)
- `cleanup-inactive-push-tokens` (weekly)

**Note:** pg_cron requires Supabase Pro plan. Free tier users can manually trigger Edge Functions.

---

## Phase 5: Configure Database Triggers

**Location:** `database/sql_helpers/database_triggers.sql`

### 5.1 Run Triggers SQL

1. Open `database_triggers.sql` in Supabase SQL Editor
2. Copy and paste entire file
3. Click **Run**

This creates triggers for:
- 👋 Welcome notifications (new user signup)
- ✅ Content approved/rejected notifications
- 💳 Subscription activation notifications
- 🔥 Study streak achievements

### 5.2 Verify Triggers

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%notification%';
```

---

## Phase 6: Create Admin User & Test

### 6.1 Sign Up Through Admin Portal

1. Go to your admin portal: `https://your-repl-url.replit.app`
2. Click "Login" and sign up with email/password
3. Note your email address

### 6.2 Get Your User ID

In Supabase Dashboard:
1. Go to **Authentication → Users**
2. Find your user and copy the **User UID**

### 6.3 Create Admin User Record

Run this SQL (replace with your actual User ID):

```sql
INSERT INTO admin_users (id, email, role, first_name, last_name, is_active)
VALUES (
  'YOUR-USER-ID-FROM-AUTH',
  'your-email@example.com',
  'superadmin',
  'Your',
  'Name',
  true
);
```

### 6.4 Test Admin Portal Access

1. Refresh the admin portal
2. You should see full access to:
   - Dashboard with analytics
   - Content Management
   - User Management
   - Subscriptions
   - Push Notifications
   - Analytics

---

## Phase 7: Mobile App Integration

**Location:** `docs/mobileapp-optimisation/push-notifications-guide.md`

### 7.1 Configure Expo Push Notifications

Follow the mobile app guide to:
1. Install Expo notification packages
2. Request push notification permissions
3. Register device tokens with backend
4. Handle notification events and deep linking

### 7.2 Test End-to-End Flow

1. **Create notification in admin portal:**
   - Go to Push Notifications → Compose
   - Create a test notification
   - Select target audience
   - Click "Send Now"

2. **Verify in database:**
   ```sql
   SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM notification_queue ORDER BY created_at DESC LIMIT 1;
   ```

3. **Wait for cron job (1 minute) or trigger manually:**
   ```bash
   curl -X POST https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-notification \
     -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY"
   ```

4. **Check notification received on mobile device**

---

## 🎉 Deployment Complete!

Your platform is now fully deployed with:

✅ Database tables for content, users, subscriptions, and notifications  
✅ Edge Functions for processing and sending push notifications  
✅ Automated jobs for scheduled tasks  
✅ Database triggers for real-time events  
✅ Admin portal for content and user management  
✅ Mobile app integration ready  

---

## 📊 Monitoring & Maintenance

### Check System Health

```sql
-- Notification delivery stats
SELECT 
  status,
  COUNT(*) as total,
  SUM(total_delivered) as delivered,
  SUM(total_failed) as failed
FROM notifications
GROUP BY status;

-- Active push tokens
SELECT COUNT(*) FROM push_tokens WHERE is_active = true;

-- Recent cron job runs
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### View Edge Function Logs

```bash
supabase functions logs send-notification --follow
```

Or in Supabase Dashboard: **Edge Functions → [function name] → Logs**

---

## 🆘 Troubleshooting

### Issue: "Table does not exist"

**Solution:** Run migrations in correct order (Phase 2)

### Issue: "Edge Function not found"

**Solution:** Deploy Edge Functions (Phase 3)

### Issue: "Notifications not sending"

**Check:**
1. Queue has items: `SELECT * FROM notification_queue WHERE status = 'pending';`
2. Cron jobs running: `SELECT * FROM cron.job_run_details;`
3. Push tokens exist: `SELECT COUNT(*) FROM push_tokens WHERE is_active = true;`
4. Edge Function logs: `supabase functions logs send-notification`

### Issue: "Admin portal shows 'Unauthorized'"

**Solution:** Create admin_users record with your auth.users ID (Phase 6.3)

---

## 📚 Additional Resources

- **Database Setup:** `database/SUPABASE_DEPLOYMENT_GUIDE.md`
- **Edge Functions:** `database/EDGE_FUNCTIONS_DEPLOYMENT.md`
- **Mobile Integration:** `docs/mobileapp-optimisation/push-notifications-guide.md`
- **Architecture:** `replit.md`

---

## 🚀 Next Steps

After deployment:

1. **Add Content:**
   - Create modules, topics, and lessons
   - Upload questions for practice MCQs
   - Add flashcards for study material

2. **Configure Subscriptions:**
   - Create subscription plans
   - Set up Stripe/Razorpay payment integration
   - Configure AI usage limits

3. **Test Notifications:**
   - Send test notifications to yourself
   - Verify automated triggers work
   - Monitor delivery rates

4. **Launch Mobile App:**
   - Deploy to TestFlight (iOS) and Google Play Beta (Android)
   - Collect user feedback
   - Iterate and improve

---

**Last Updated:** November 2025  
**Deployment Status:** All systems ready ✅  
**Estimated Setup Time:** 1-2 hours
