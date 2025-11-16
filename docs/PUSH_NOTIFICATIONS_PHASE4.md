# Push Notifications - Phase 4: Backend Implementation Guide

## Overview

Phase 1-3 and Phase 5 have implemented the **admin portal UI**, **database schema**, **API layer**, and **mobile app integration guide**. However, notifications **cannot actually be sent yet** because the backend processing logic (Supabase Edge Functions) is not implemented.

This document explains what needs to be built in Phase 4 to make push notifications fully functional.

---

## What's Missing

Currently, when an admin creates a notification in the portal:
1. ✅ Notification is saved to the `notifications` table
2. ✅ Status is set to `draft` or `scheduled`
3. ❌ **Nothing actually processes or sends the notification**

**Phase 4 Requirements:**
- Supabase Edge Functions to process notification queue
- Expo Push API integration
- Receipt tracking and retry logic
- Automated notification triggers

---

## Architecture

```
Admin Portal                Supabase Database          Edge Functions               Expo Push Service
-------------               ------------------         --------------               -----------------
Create Notification   -->   notifications table  -->   Process Queue    -->        Send to Devices
  (draft/scheduled)         notification_queue         Call Expo API                  (FCM/APNs)
                                                              |
                                                              v
                                                       Track Delivery
                                                    notification_targets
```

---

## Phase 4 Implementation Tasks

### Task 1: Create Supabase Edge Function - Send Notifications

**Location:** `supabase/functions/send-notification/index.ts`

**Purpose:** Process the notification queue and send notifications via Expo Push API

**Key Responsibilities:**
1. Fetch pending notifications from queue
2. Get push tokens for targeted users
3. Call Expo Push Notification API
4. Update delivery status in `notification_targets`
5. Handle failures and retry logic

**Example Structure:**

```typescript
// supabase/functions/send-notification/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Fetch notifications from queue that need processing
  const { data: queueItems } = await supabaseClient
    .from('notification_queue')
    .select('*, notifications(*)')
    .eq('status', 'pending')
    .lte('run_at', new Date().toISOString())
    .limit(10)

  for (const item of queueItems || []) {
    // 2. Get target users based on audience filter
    const userIds = await getTargetUsers(item.notifications.audience_filter)

    // 3. Get push tokens for those users
    const { data: tokens } = await supabaseClient
      .from('push_tokens')
      .select('*')
      .in('user_id', userIds)
      .eq('is_active', true)

    // 4. Create notification targets
    for (const token of tokens || []) {
      await supabaseClient.from('notification_targets').insert({
        notification_id: item.notification_id,
        user_id: token.user_id,
        push_token_id: token.id,
        delivery_status: 'pending',
      })
    }

    // 5. Send to Expo Push API in batches
    const tickets = await sendToExpoPush(tokens, item.notifications)

    // 6. Update targets with ticket IDs
    // 7. Update queue status
    // 8. Update notification stats
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

async function sendToExpoPush(tokens, notification) {
  const messages = tokens.map(token => ({
    to: token.expo_push_token,
    sound: 'default',
    title: notification.title,
    body: notification.body,
    data: notification.data || {},
    badge: 1,
  }))

  // Call Expo Push API
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  })

  return await response.json()
}
```

---

### Task 2: Create Supabase Cron Job

**Purpose:** Automatically process scheduled notifications

**Setup:**
1. Use Supabase pg_cron extension
2. Schedule Edge Function to run every minute
3. Process notifications where `run_at <= NOW()`

**SQL:**

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the send-notification function to run every minute
SELECT cron.schedule(
  'process-notification-queue',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-notification',
    headers := '{"Authorization": "Bearer YOUR-SERVICE-ROLE-KEY"}'::jsonb
  ) as request_id;
  $$
);
```

---

### Task 3: Receipt Tracking Function

**Location:** `supabase/functions/track-receipts/index.ts`

**Purpose:** Fetch delivery receipts from Expo and update status

**Key Points:**
- Expo provides receipt IDs after initial send
- Poll Expo's receipt API to get delivery confirmation
- Update `notification_targets` with delivery status
- Run this function every 5-10 minutes

---

### Task 4: Automated Notification Triggers

**Purpose:** Send notifications based on app events

**Examples:**

1. **Subscription Expiring:**
```sql
-- Create a cron job that checks for expiring subscriptions
SELECT cron.schedule(
  'subscription-expiring-notifications',
  '0 10 * * *', -- Every day at 10 AM
  $$
  INSERT INTO notifications (title, body, notification_type, audience_filter, status)
  SELECT 
    'Subscription Expiring Soon',
    'Your subscription expires in ' || (end_date - CURRENT_DATE) || ' days. Renew now!',
    'subscription_expiring',
    jsonb_build_object('type', 'specific_users', 'userIds', array_agg(user_id)),
    'scheduled'
  FROM subscriptions
  WHERE end_date BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 7
  AND status = 'active'
  GROUP BY end_date;
  $$
);
```

2. **Content Approved:**
```typescript
// Database trigger on content_approvals table
CREATE OR REPLACE FUNCTION notify_content_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO notifications (title, body, notification_type, audience_filter, status)
    VALUES (
      'Content Approved',
      'Your submitted content has been approved!',
      'content_approved',
      jsonb_build_object('type', 'specific_users', 'userIds', ARRAY[NEW.submitted_by]),
      'scheduled'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_approval_notification
AFTER UPDATE ON content_approvals
FOR EACH ROW
EXECUTE FUNCTION notify_content_approved();
```

---

## Testing Phase 4

### 1. Manual Test via Admin Portal

1. Log into admin portal
2. Navigate to Push Notifications → Compose
3. Create a test notification:
   - Title: "Test Notification"
   - Body: "Testing push notifications"
   - Target: All Users
4. Click "Send Now"
5. Check database:
   ```sql
   SELECT * FROM notifications WHERE id = 'notification-id';
   SELECT * FROM notification_queue WHERE notification_id = 'notification-id';
   ```

### 2. Verify Edge Function Processes Queue

```sql
-- Check queue status
SELECT * FROM notification_queue WHERE status = 'processing';

-- Check targets created
SELECT * FROM notification_targets WHERE notification_id = 'notification-id';
```

### 3. Verify Mobile App Receives Notification

- Open mobile app on physical device
- Should receive push notification
- Tap notification - should navigate to correct screen (deep linking)

---

## Environment Variables Needed

Add these to Supabase Edge Functions:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EXPO_ACCESS_TOKEN=optional-if-using-expo-push-api-v2
```

---

## Deployment Checklist

- [ ] Deploy `send-notification` Edge Function
- [ ] Deploy `track-receipts` Edge Function  
- [ ] Set up pg_cron job for queue processing
- [ ] Set up pg_cron job for receipt tracking
- [ ] Add database triggers for automated notifications
- [ ] Test manual notification sending
- [ ] Test scheduled notifications
- [ ] Test automated triggers (subscription expiry, content approval)
- [ ] Monitor Expo Push logs for errors
- [ ] Set up error alerting (email/Slack when send rate drops)

---

## Monitoring & Debugging

### Check Notification Stats

```sql
-- Overall stats
SELECT 
  status,
  COUNT(*) as count,
  AVG(total_delivered::float / NULLIF(total_recipients, 0) * 100) as avg_delivery_rate
FROM notifications
GROUP BY status;

-- Recent failures
SELECT n.*, nt.error_message
FROM notifications n
JOIN notification_targets nt ON nt.notification_id = n.id
WHERE nt.delivery_status = 'failed'
ORDER BY n.created_at DESC
LIMIT 20;
```

### Edge Function Logs

```bash
# View logs
supabase functions logs send-notification

# Stream logs
supabase functions logs send-notification --follow
```

---

## Cost Estimation

**Expo Push Notifications:**
- FREE for up to 100 push/sec
- Sufficient for ~50,000 users

**Supabase Edge Functions:**
- 500,000 invocations/month free
- $2 per million after
- Estimate: ~$5-10/month for active usage

**pg_cron:**
- Included in Supabase Pro plan

---

## Support Resources

- [Expo Push Notifications API](https://docs.expo.dev/push-notifications/sending-notifications/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Expo Push Tool (Testing)](https://expo.dev/notifications)

---

**Status:** Phase 4 NOT implemented yet. This is documentation for future implementation.

**Last Updated:** January 2025
