-- =====================================================
-- Supabase pg_cron Setup for Push Notifications
-- =====================================================
-- This file sets up automated jobs to process notifications
-- Run this AFTER deploying the Edge Functions
-- =====================================================

-- Enable pg_cron extension (Supabase Pro required)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =====================================================
-- Job 1: Process Notification Queue (Every Minute)
-- =====================================================
-- Calls the send-notification Edge Function to process pending notifications

SELECT cron.schedule(
  'process-notification-queue',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR-SERVICE-ROLE-KEY',
        'Content-Type', 'application/json'
      )
    ) as request_id;
  $$
);

-- =====================================================
-- Job 2: Track Delivery Receipts (Every 5 Minutes)
-- =====================================================
-- Calls the track-receipts Edge Function to confirm delivery

SELECT cron.schedule(
  'track-notification-receipts',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/track-receipts',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR-SERVICE-ROLE-KEY',
        'Content-Type', 'application/json'
      )
    ) as request_id;
  $$
);

-- =====================================================
-- Job 3: Process Automated Notifications (Daily at 10 AM)
-- =====================================================
-- Calls the automated notifications function for subscription expiring, welcome messages, etc.

SELECT cron.schedule(
  'process-automated-notifications',
  '0 10 * * *', -- Every day at 10:00 AM
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/process-automated-notifications',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR-SERVICE-ROLE-KEY',
        'Content-Type', 'application/json'
      )
    ) as request_id;
  $$
);

-- =====================================================
-- Job 4: Clean Up Inactive Push Tokens (Weekly)
-- =====================================================
-- Marks tokens that haven't been seen in 60 days as inactive

SELECT cron.schedule(
  'cleanup-inactive-push-tokens',
  '0 3 * * 0', -- Every Sunday at 3:00 AM
  $$
  SELECT mark_inactive_push_tokens(60);
  $$
);

-- =====================================================
-- View All Scheduled Jobs
-- =====================================================

SELECT * FROM cron.job;

-- =====================================================
-- Unschedule Jobs (if needed for debugging)
-- =====================================================

-- SELECT cron.unschedule('process-notification-queue');
-- SELECT cron.unschedule('track-notification-receipts');
-- SELECT cron.unschedule('process-automated-notifications');
-- SELECT cron.unschedule('cleanup-inactive-push-tokens');

-- =====================================================
-- Monitor Job Execution
-- =====================================================

-- View job run history
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 50;

-- Check for failed jobs
SELECT * FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC
LIMIT 20;

-- =====================================================
-- IMPORTANT SETUP INSTRUCTIONS
-- =====================================================
--
-- 1. Replace YOUR-PROJECT-REF with your actual Supabase project reference
--    Example: https://abcdefghijklmnop.supabase.co
--
-- 2. Replace YOUR-SERVICE-ROLE-KEY with your Supabase service role key
--    Found in: Supabase Dashboard → Settings → API → service_role secret
--
-- 3. Make sure you've deployed the Edge Functions first:
--    - send-notification
--    - track-receipts
--    - process-automated-notifications
--
-- 4. Test each Edge Function manually before setting up cron:
--    curl -X POST https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-notification \
--      -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY"
--
-- 5. Supabase Pro plan required for pg_cron extension
--
-- =====================================================
