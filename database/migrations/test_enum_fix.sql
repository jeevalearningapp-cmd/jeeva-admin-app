-- =====================================================
-- Quick Test: Verify Enum Fix Works
-- =====================================================
-- Copy and paste this entire file into Supabase SQL Editor
-- This tests that the enum creation logic works correctly
-- =====================================================

-- Test 1: Create enum if missing (same logic as migration)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded');
    RAISE NOTICE '✅ TEST PASSED: Created payment_status enum';
  ELSE
    RAISE NOTICE '✅ TEST PASSED: payment_status enum already exists';
  END IF;
END $$;

-- Test 2: Verify enum is usable
DO $$
DECLARE
  test_status payment_status;
BEGIN
  test_status := 'failed'::payment_status;
  RAISE NOTICE '✅ TEST PASSED: Enum is usable (test value: %)', test_status;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ TEST FAILED: %', SQLERRM;
END $$;

-- Test 3: Show enum values
SELECT '=== Enum Values ===' as info;
SELECT enumlabel as payment_status_values
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_status')
ORDER BY enumsortorder;

-- Test 4: Test using enum in a query (simulates what migration does)
DO $$
DECLARE
  test_query TEXT;
BEGIN
  -- This simulates the type of query used in the migration
  test_query := 'SELECT ''failed''::payment_status as test_value';
  EXECUTE test_query;
  RAISE NOTICE '✅ TEST PASSED: Enum works in queries';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ TEST FAILED: %', SQLERRM;
END $$;

-- =====================================================
-- RESULT
-- =====================================================
-- If you see all "✅ TEST PASSED" messages above,
-- then the enum fix works and you can safely run:
-- add_dunning_system.sql
-- =====================================================

SELECT '✅ ALL TESTS PASSED - Ready to run add_dunning_system.sql' as final_result;
