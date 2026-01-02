-- =====================================================
-- Verify Dunning System Installation
-- =====================================================
-- Run this after add_dunning_system.sql to verify everything works

-- Test 1: Check enum exists
SELECT '=== TEST 1: Enum Status ===' as test;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') 
    THEN '✅ payment_status enum exists'
    ELSE '❌ payment_status enum missing'
  END as result;

-- Test 2: Check dunning fields in payments table
SELECT '=== TEST 2: Payments Table Dunning Fields ===' as test;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'payments'
  AND column_name IN (
    'failure_type', 'failed_at', 'retry_count', 'last_retry_at', 
    'next_retry_at', 'recovered_at', 'permanently_failed_at', 
    'reviewed_by', 'reviewed_at'
  )
ORDER BY column_name;

-- Test 3: Check new tables exist
SELECT '=== TEST 3: New Tables ===' as test;
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('payment_retries', 'grace_periods', 'alert_logs') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('payment_retries', 'grace_periods', 'alert_logs')
ORDER BY table_name;

-- Test 4: Check helper functions exist
SELECT '=== TEST 4: Helper Functions ===' as test;
SELECT 
  routine_name,
  routine_type,
  '✅ EXISTS' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'classify_payment_failure',
    'get_failed_payments',
    'get_recovery_stats'
  )
ORDER BY routine_name;

-- Test 5: Test classify_payment_failure function
SELECT '=== TEST 5: Test Failure Classification ===' as test;
SELECT 
  'insufficient_funds' as error_code,
  classify_payment_failure('insufficient_funds') as classification,
  CASE 
    WHEN classify_payment_failure('insufficient_funds') = 'soft_decline' 
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as test_result
UNION ALL
SELECT 
  'expired_card' as error_code,
  classify_payment_failure('expired_card') as classification,
  CASE 
    WHEN classify_payment_failure('expired_card') = 'hard_decline' 
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as test_result;

-- Test 6: Check indexes
SELECT '=== TEST 6: Dunning Indexes ===' as test;
SELECT 
  indexname,
  tablename,
  '✅ EXISTS' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_payments_failure%' OR
    indexname LIKE 'idx_payments_failed%' OR
    indexname LIKE 'idx_payments_next_retry%' OR
    indexname LIKE 'idx_payments_retry%' OR
    indexname LIKE 'idx_payment_retries%' OR
    indexname LIKE 'idx_grace_periods%' OR
    indexname LIKE 'idx_alert_logs%'
  )
ORDER BY tablename, indexname;

-- Test 7: Check RLS policies
SELECT '=== TEST 7: RLS Policies ===' as test;
SELECT 
  tablename,
  policyname,
  '✅ EXISTS' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('payment_retries', 'grace_periods', 'alert_logs')
ORDER BY tablename, policyname;

-- Test 8: Check triggers
SELECT '=== TEST 8: Triggers ===' as test;
SELECT 
  trigger_name,
  event_object_table,
  '✅ EXISTS' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (
    trigger_name LIKE '%payment_retries%' OR
    trigger_name LIKE '%grace_periods%' OR
    trigger_name LIKE '%failed%' OR
    trigger_name LIKE '%recovered%'
  )
ORDER BY event_object_table, trigger_name;

-- Summary
SELECT '=== INSTALLATION SUMMARY ===' as test;
SELECT 
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = 'payments'
   AND column_name IN ('failure_type', 'failed_at', 'retry_count', 'last_retry_at', 
                       'next_retry_at', 'recovered_at', 'permanently_failed_at', 
                       'reviewed_by', 'reviewed_at')) as dunning_fields_added,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('payment_retries', 'grace_periods', 'alert_logs')) as new_tables_created,
  (SELECT COUNT(*) FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name IN ('classify_payment_failure', 'get_failed_payments', 'get_recovery_stats')) as helper_functions_created,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'payments'
          AND column_name IN ('failure_type', 'failed_at', 'retry_count', 'last_retry_at', 
                              'next_retry_at', 'recovered_at', 'permanently_failed_at', 
                              'reviewed_by', 'reviewed_at')) = 9
    AND (SELECT COUNT(*) FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name IN ('payment_retries', 'grace_periods', 'alert_logs')) = 3
    AND (SELECT COUNT(*) FROM information_schema.routines
         WHERE routine_schema = 'public'
         AND routine_name IN ('classify_payment_failure', 'get_failed_payments', 'get_recovery_stats')) = 3
    THEN '✅ ALL COMPONENTS INSTALLED SUCCESSFULLY'
    ELSE '⚠️ SOME COMPONENTS MISSING - CHECK DETAILS ABOVE'
  END as overall_status;
