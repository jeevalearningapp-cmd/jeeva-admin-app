# Supabase Edge Functions Deployment Guide

## Overview

This guide explains how to deploy the three Edge Functions required for push notifications:

1. **send-notification** - Processes the notification queue and sends to Expo Push API
2. **track-receipts** - Fetches delivery confirmations from Expo
3. **process-automated-notifications** - Creates automated notifications (subscription expiring, welcome, milestones)

---

## Prerequisites

### 1. Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (using Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or install via npm
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

### 2. Login to Supabase

```bash
supabase login
```

This will open a browser window to authenticate.

### 3. Link to Your Project

```bash
# Get your project ref from: https://supabase.com/dashboard/project/_/settings/general
supabase link --project-ref YOUR-PROJECT-REF
```

---

## Deployment Steps

### Step 1: Deploy Edge Functions

From your project root directory (where the `supabase/` folder is):

```bash
# Deploy send-notification function
supabase functions deploy send-notification

# Deploy track-receipts function
supabase functions deploy track-receipts

# Deploy process-automated-notifications function
supabase functions deploy process-automated-notifications
```

**Expected output:**
```
Deploying send-notification (project ref: YOUR-PROJECT-REF)
Bundled send-notification in 250ms.
✔ Deployed send-notification in 1.5s.
Function URL: https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-notification
```

---

### Step 2: Set Function Secrets (Environment Variables)

Edge Functions need access to your Supabase database. Set the required environment variables:

```bash
# Set Supabase URL
supabase secrets set SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co

# Set Service Role Key (found in Dashboard → Settings → API)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:** The service role key is different from the anon key. Find it in:
- Supabase Dashboard → Settings → API → service_role secret (click "Reveal" to copy)

Verify secrets are set:
```bash
supabase secrets list
```

---

### Step 3: Test Edge Functions Manually

Test each function to ensure it's working:

#### Test send-notification:

```bash
curl -X POST https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "success": true,
  "message": "No pending notifications",
  "processed": 0
}
```

#### Test track-receipts:

```bash
curl -X POST https://YOUR-PROJECT-REF.supabase.co/functions/v1/track-receipts \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY" \
  -H "Content-Type: application/json"
```

#### Test process-automated-notifications:

```bash
curl -X POST https://YOUR-PROJECT-REF.supabase.co/functions/v1/process-automated-notifications \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY" \
  -H "Content-Type: application/json"
```

---

### Step 4: Set Up pg_cron Jobs

Now that the Edge Functions are deployed, set up automated scheduling:

1. **Open Supabase SQL Editor**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor"

2. **Update the pg_cron setup file**
   - Open `database/sql_helpers/pg_cron_setup.sql`
   - Replace `YOUR-PROJECT-REF` with your actual project reference
   - Replace `YOUR-SERVICE-ROLE-KEY` with your service role key

3. **Run the pg_cron setup SQL**
   - Copy the entire contents of `pg_cron_setup.sql`
   - Paste into Supabase SQL Editor
   - Click "Run"

4. **Verify jobs are scheduled**
   ```sql
   SELECT * FROM cron.job;
   ```

   You should see 4 jobs:
   - `process-notification-queue` (every minute)
   - `track-notification-receipts` (every 5 minutes)
   - `process-automated-notifications` (daily at 10 AM)
   - `cleanup-inactive-push-tokens` (weekly)

---

### Step 5: Set Up Database Triggers (Optional)

For real-time automated notifications, set up database triggers:

1. **Open `database/sql_helpers/database_triggers.sql`**
2. **Run the SQL in Supabase SQL Editor**

This creates triggers for:
- Welcome notifications (when new user signs up)
- Subscription activation notifications
- Content approved/rejected notifications
- Study streak achievements

---

## Function URLs

After deployment, your Edge Functions will be available at:

```
https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-notification
https://YOUR-PROJECT-REF.supabase.co/functions/v1/track-receipts
https://YOUR-PROJECT-REF.supabase.co/functions/v1/process-automated-notifications
```

---

## Testing the Complete Flow

### 1. Create a Test Notification via Admin Portal

1. Log into your admin portal
2. Go to "Push Notifications" → "Compose"
3. Create a notification:
   - Title: "Test Notification"
   - Body: "Testing push notifications"
   - Target: "All Users" or "Specific Users"
4. Click "Send Now"

### 2. Verify in Database

```sql
-- Check notification was created
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;

-- Check it was added to the queue
SELECT * FROM notification_queue ORDER BY created_at DESC LIMIT 5;

-- After 1 minute (cron job runs), check targets were created
SELECT * FROM notification_targets ORDER BY created_at DESC LIMIT 10;
```

### 3. Monitor Edge Function Logs

View real-time logs:

```bash
# Send-notification logs
supabase functions logs send-notification --follow

# Track-receipts logs
supabase functions logs track-receipts --follow
```

Or view in Supabase Dashboard:
- Edge Functions → Select function → Logs tab

---

## Troubleshooting

### Error: "Function not found"

**Solution:** Make sure you deployed the function:
```bash
supabase functions deploy send-notification
```

### Error: "SUPABASE_URL is not defined"

**Solution:** Set the environment variables:
```bash
supabase secrets set SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
```

### Error: "relation notifications does not exist"

**Solution:** Run the database migrations first (see `SUPABASE_DEPLOYMENT_GUIDE.md`)

### Notifications not sending

**Check these:**

1. **Queue has items?**
   ```sql
   SELECT * FROM notification_queue WHERE status = 'pending';
   ```

2. **Cron job running?**
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
   ```

3. **Edge Function logs show errors?**
   ```bash
   supabase functions logs send-notification
   ```

4. **Push tokens exist and are active?**
   ```sql
   SELECT COUNT(*) FROM push_tokens WHERE is_active = true;
   ```

### Expo Push API Errors

**Common errors:**

- `DeviceNotRegistered` - Token is invalid, function will mark it as inactive
- `InvalidCredentials` - Expo push token format is wrong
- `MessageTooBig` - Notification payload exceeds 4KB limit

View Expo errors in notification_targets:
```sql
SELECT error_message, COUNT(*) 
FROM notification_targets 
WHERE delivery_status = 'failed'
GROUP BY error_message;
```

---

## Monitoring & Maintenance

### View Notification Stats

```sql
-- Overall delivery rates
SELECT 
  status,
  COUNT(*) as total,
  SUM(total_delivered) as delivered,
  SUM(total_failed) as failed,
  ROUND(AVG(total_delivered::float / NULLIF(total_recipients, 0) * 100), 2) as avg_delivery_rate
FROM notifications
GROUP BY status;

-- Recent notifications
SELECT 
  n.title,
  n.status,
  n.total_recipients,
  n.total_delivered,
  n.created_at
FROM notifications n
ORDER BY created_at DESC
LIMIT 20;
```

### Clean Up Old Data

```sql
-- Delete notifications older than 90 days
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '90 days'
AND status = 'sent';

-- Clean up completed queue items older than 7 days
DELETE FROM notification_queue
WHERE status = 'completed'
AND created_at < NOW() - INTERVAL '7 days';
```

---

## Updating Edge Functions

When you make changes to the Edge Function code:

```bash
# Redeploy the function
supabase functions deploy send-notification

# The function URL stays the same, no need to update cron jobs
```

---

## Cost Estimation

**Supabase Edge Functions:**
- 500,000 invocations/month: FREE
- $2 per million after that
- Estimate: ~$5-10/month for 50,000 users

**Expo Push Notifications:**
- Up to 100 push/sec: FREE
- More than enough for most use cases

**Total estimated cost:** $5-15/month

---

## Security Best Practices

1. **Never expose service role key** - Only use it in Edge Functions (server-side)
2. **Use RLS policies** - Already configured in the migrations
3. **Validate input** - Edge Functions validate notification data
4. **Rate limiting** - Consider adding rate limits for notification creation
5. **Monitor logs** - Check for suspicious activity

---

## Next Steps

After deployment:

- [ ] Test manual notifications from admin portal
- [ ] Test automated notifications (subscription expiring, welcome)
- [ ] Monitor delivery rates for the first week
- [ ] Set up alerting for failed deliveries
- [ ] Integrate mobile app (see `docs/mobileapp-optimisation/push-notifications-guide.md`)

---

## Support Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Expo Push Notifications API](https://docs.expo.dev/push-notifications/sending-notifications/)
- [Deno Runtime Docs](https://deno.land/manual)

---

**Last Updated:** November 2025

**Status:** Edge Functions ready to deploy ✅
