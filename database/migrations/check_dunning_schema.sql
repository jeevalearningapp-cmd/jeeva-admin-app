-- =====================================================
-- Check Existing Schema for Dunning System
-- =====================================================
-- This script checks what tables and columns exist
-- Run this first to see what needs to be added
-- =====================================================

-- Check if payments table has dunning fields
SELECT 
  'payments' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'payments'
  AND column_name IN (
    'failure_code',
    'failure_message',
    'failure_type',
    'failed_at',
    'retry_count',
    'last_retry_at',
    'next_retry_at',
    'recovered_at',
    'permanently_failed_at',
    'reviewed_by',
    'reviewed_at'
  )
ORDER BY column_name;

-- Check if payment_retries table exists
SELECT 
  'payment_retries' as table_name,
  EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'payment_retries'
  ) as table_exists;

-- Check if grace_periods table exists
SELECT 
  'grace_periods' as table_name,
  EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'grace_periods'
  ) as table_exists;

-- Check if alert_logs table exists
SELECT 
  'alert_logs' as table_name,
  EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'alert_logs'
  ) as table_exists;

-- Check if subscriptions table exists (needed for grace periods)
SELECT 
  'subscriptions' as table_name,
  EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'subscriptions'
  ) as table_exists;

-- List all columns in payments table
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'payments'
ORDER BY ordinal_position;

-- Check if admin_users table exists (needed for reviewed_by)
SELECT 
  'admin_users' as table_name,
  EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'admin_users'
  ) as table_exists;

-- Summary report
SELECT 
  'SUMMARY' as report_type,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = 'payments' 
   AND column_name IN ('failure_code', 'failure_message')) as existing_failure_fields,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'payment_retries') as payment_retries_exists,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'grace_periods') as grace_periods_exists,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'alert_logs') as alert_logs_exists;
