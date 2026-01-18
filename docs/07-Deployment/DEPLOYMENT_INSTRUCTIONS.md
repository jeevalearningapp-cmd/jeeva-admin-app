# 🚀 Push Notifications Deployment Guide

## Overview

This guide will help you deploy the complete push notifications system for Jeeva Learning Platform.

---

## ✅ What's Already Done

- Admin portal UI (Notifications page with Compose, Campaigns, Automation tabs)
- Database schema SQL files
- Edge Functions code (TypeScript)
- Supabase CLI installed (v2.58.5)

---

## 📋 Deployment Steps

### Step 1: Run SQL Migrations

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project (qsvjvgsnbslgypykuznd)
   - Click **SQL Editor** → **New query**

2. **Run `create_push_notifications.sql`:**
   - Open `database/migrations/create_push_notifications.sql`
   - Copy the entire file contents
   - Paste into Supabase SQL Editor
   - Click **Run** (or Cmd/Ctrl + Enter)
   - ✅ Should see: "Success. No rows returned"

   **This creates:**
   - `push_tokens` - Store device push tokens
   - `notifications` - Notification campaigns
   - `notification_targets` - Delivery tracking
   - `notification_queue` - Scheduled processing

---

### Step 2: Get Supabase Access Token

**Important:** This is NOT your service role key. It's a personal access token for CLI deployment.

1. Go to https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Name it: "Replit Deployment"
4. Click **"Generate token"**
5. **Copy the token** (you'll need it in the next step)

---

### Step 3: Login to Supabase CLI

In the Replit Shell, run:

```bash
npx supabase login
```

When prompted, paste your access token from Step 2.

✅ You should see: "Finished supabase login"

---

### Step 4: Deploy Edge Functions

Run these commands one by one:

```bash
# Deploy send-notification (main processing function)
npx supabase functions deploy send-notification \
  --project-ref qsvjvgsnbslgypykuznd \
  --no-verify-jwt

# Deploy track-receipts (delivery confirmation)
npx supabase functions deploy track-receipts \
  --project-ref qsvjvgsnbslgypykuznd \
  --no-verify-jwt

# Deploy process-automated-notifications (scheduled tasks)
npx supabase functions deploy process-automated-notifications \
  --project-ref qsvjvgsnbslgypykuznd \
  --no-verify-jwt
```

✅ Each should show: "Deployed [function-name]" with a function URL

---

### Step 5: Set Environment Variables for Edge Functions

Your Edge Functions need to connect to the database. Set these environment variables:

```bash
# Set Supabase URL
npx supabase secrets set SUPABASE_URL=https://qsvjvgsnbslgypykuznd.supabase.co \
  --project-ref qsvjvgsnbslgypykuznd

# Set Service Role Key
# Go to: Supabase Dashboard → Settings → API → Copy service_role secret
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE \
  --project-ref qsvjvgsnbslgypykuznd
```

**Where to find your service role key:**

1. Supabase Dashboard → Settings → API
2. Under "Project API keys"
3. Click "Reveal" next to `service_role` secret
4. Copy the key

---

### Step 6: Test Edge Function Deployment

Test that the function is working:

```bash
curl -X POST https://qsvjvgsnbslgypykuznd.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

✅ Expected response:

```json
{
  "success": true,
  "message": "No pending notifications",
  "processed": 0
}
```

This is correct! It means the function is working but there are no notifications in the queue yet.

---

### Step 7: Set Up Automated Processing (Optional - Requires Pro Plan)

**Option A: Using pg_cron (Supabase Pro)**

1. Open `database/sql_helpers/pg_cron_setup.sql`
2. Replace `YOUR-PROJECT-REF` with `qsvjvgsnbslgypykuznd`
3. Replace `YOUR-SERVICE-ROLE-KEY` with your actual service role key
4. Copy and run in Supabase SQL Editor

This creates cron jobs that:

- Process notification queue every minute
- Track delivery receipts every 5 minutes
- Run automated notifications daily at 10 AM

**Option B: Free Tier - Manual Triggering**

If you don't have Pro plan, you can manually trigger the functions or use an external cron service (like cron-job.org) to call the Edge Function URLs every minute.

---

### Step 8: Set Up Database Triggers (Optional)

For real-time automated notifications:

1. Open `database/sql_helpers/database_triggers.sql`
2. Copy the entire file
3. Run in Supabase SQL Editor

This creates triggers for:

- Welcome notifications (new user signup)
- Subscription activation alerts
- Content approved/rejected notifications

---

### Step 9: Test End-to-End

1. **Go to your admin portal**
2. **Navigate to: Push Notifications → Compose**
3. **Create a test notification:**
   - Title: "Test Notification"
   - Body: "Testing push notifications system"
   - Target: "All Users"
   - Click **"Send Now"**

4. **Verify in database:**

```sql
-- Check notification was created
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;

-- Check it was added to queue
SELECT * FROM notification_queue ORDER BY created_at DESC LIMIT 1;
```

5. **Trigger processing** (if pg_cron not set up):

```bash
curl -X POST https://qsvjvgsnbslgypykuznd.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

6. **Check results:**

```sql
-- Check notification targets were created
SELECT * FROM notification_targets ORDER BY created_at DESC LIMIT 10;

-- Check notification stats
SELECT * FROM notifications WHERE id = 'your-notification-id';
```

---

## 🎉 You're Done!

The push notifications system is now fully deployed:

✅ Database tables created  
✅ Edge Functions deployed  
✅ Admin portal ready to send notifications

---

## 📱 Next Step: Mobile App Integration

For notifications to reach actual devices, the mobile app needs to:

1. **Request push notification permissions**
2. **Register device tokens** with your backend
3. **Handle notification events**

**Complete guide:** See `docs/mobileapp-optimisation/push-notifications-guide.md`

---

## 🔧 Troubleshooting

### "Access token not provided"

- Run `npx supabase login` again
- Make sure you copied the full access token

### "relation notifications does not exist"

- Run Step 1 (SQL migrations) first

### "No pending notifications" (after creating one)

- This is normal if pg_cron isn't set up yet
- Manually trigger the function with curl (see Step 9)

### Edge Function errors

- Check function logs:
  ```bash
  npx supabase functions logs send-notification --project-ref qsvjvgsnbslgypykuznd
  ```

### Notifications not reaching devices

- Make sure mobile app has registered push tokens
- Check `push_tokens` table: `SELECT COUNT(*) FROM push_tokens WHERE is_active = true;`

---

## 📊 Monitor Your System

**Check notification delivery stats:**

```sql
SELECT
  status,
  COUNT(*) as total,
  SUM(total_delivered) as delivered,
  SUM(total_failed) as failed
FROM notifications
GROUP BY status;
```

**View Edge Function logs:**

```bash
npx supabase functions logs send-notification --project-ref qsvjvgsnbslgypykuznd --follow
```

---

## 🔐 Security Note

- ✅ **Access Token:** Safe for CLI deployment (limited permissions)
- ⚠️ **Service Role Key:** NEVER expose in client code or git (full admin access)
  - Only use in Edge Functions (server-side)
  - Only use for testing via curl in secure terminal
  - Never commit to git or share publicly

---

**Project Details:**

- Supabase URL: https://qsvjvgsnbslgypykuznd.supabase.co
- Project Ref: qsvjvgsnbslgypykuznd
- Admin Portal: Your Replit URL

**Estimated Time:** 15-20 minutes

**Last Updated:** November 16, 2025
