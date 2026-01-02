-- =====================================================
-- Quick Database Check for Dunning System
-- =====================================================
-- Run this and share the complete output
-- =====================================================

-- Check 1: Does admin_users table exist?
SELECT 
  '1. admin_users table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'admin_users'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as result;

-- Check 2: Does subscriptions table exist?
SELECT 
  '2. subscriptions table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'subscriptions'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as result;

-- Check 3: Does payments table exist?
SELECT 
  '3. payments table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'payments'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as result;

-- Check 4: Current columns in payments table
SELECT 
  '4. payments table columns' as info,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'payments';

-- Check 5: Do dunning fields exist in payments?
SELECT 
  '5. Dunning fields in payments' as check_name,
  COUNT(*) as existing_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ NONE (need to add all 9)'
    WHEN COUNT(*) < 9 THEN '⚠️ PARTIAL (need to add ' || (9 - COUNT(*))::TEXT || ' more)'
    ELSE '✅ ALL PRESENT'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'payments'
  AND column_name IN (
    'failure_type', 'failed_at', 'retry_count', 'last_retry_at',
    'next_retry_at', 'recovered_at', 'permanently_failed_at',
    'reviewed_by', 'reviewed_at'
  );

-- Check 6: Do new tables exist?
SELECT 
  '6. payment_retries table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'payment_retries'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as result;

SELECT 
  '7. grace_periods table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'grace_periods'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as result;

SELECT 
  '8. alert_logs table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'alert_logs'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as result;

-- Check 7: List all public tables (for reference)
SELECT 
  '9. All public tables' as info,
  string_agg(table_name, ', ' ORDER BY table_name) as tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- Summary
SELECT 
  '========================================' as summary;
SELECT 
  'SUMMARY: Ready for dunning migration?' as question;
SELECT 
  '========================================' as summary;
