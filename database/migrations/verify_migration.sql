-- Verification Script for Discount Coupons Migration
-- Run this after the migration to verify everything is correct

-- 1. Check if table exists
SELECT '1. Checking if discount_coupons table exists...' as step;
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'discount_coupons'
    ) THEN '✅ Table exists'
    ELSE '❌ Table does not exist'
  END as status;

-- 2. Check all required columns
SELECT '2. Checking required columns...' as step;
SELECT 
  column_name,
  data_type,
  CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END as nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'discount_coupons'
ORDER BY ordinal_position;

-- 3. Verify new columns exist
SELECT '3. Verifying new columns...' as step;
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'stripe_coupon_id'
  ) THEN '✅ stripe_coupon_id exists'
  ELSE '❌ stripe_coupon_id missing' END as stripe_coupon_id,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'stripe_promotion_code_id'
  ) THEN '✅ stripe_promotion_code_id exists'
  ELSE '❌ stripe_promotion_code_id missing' END as stripe_promotion_code_id,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'currency'
  ) THEN '✅ currency exists'
  ELSE '❌ currency missing' END as currency,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'duration'
  ) THEN '✅ duration exists'
  ELSE '❌ duration missing' END as duration,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'duration_in_months'
  ) THEN '✅ duration_in_months exists'
  ELSE '❌ duration_in_months missing' END as duration_in_months,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'times_redeemed'
  ) THEN '✅ times_redeemed exists'
  ELSE '❌ times_redeemed missing' END as times_redeemed,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'metadata'
  ) THEN '✅ metadata exists'
  ELSE '❌ metadata missing' END as metadata;

-- 4. Check constraints
SELECT '4. Checking constraints...' as step;
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'discount_coupons'::regclass
ORDER BY conname;

-- 5. Check indexes
SELECT '5. Checking indexes...' as step;
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'discount_coupons'
ORDER BY indexname;

-- 6. Check if view exists
SELECT '6. Checking active_coupons_with_stats view...' as step;
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.views 
      WHERE table_name = 'active_coupons_with_stats'
    ) THEN '✅ View exists'
    ELSE '❌ View does not exist'
  END as status;

-- 7. Test view (if exists)
SELECT '7. Testing view (showing first 3 rows)...' as step;
SELECT 
  code,
  discount_type,
  discount_value,
  usage_status,
  status_label
FROM active_coupons_with_stats
LIMIT 3;

-- 8. Check for old usage_count column
SELECT '8. Checking for old usage_count column...' as step;
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'discount_coupons' AND column_name = 'usage_count'
    ) THEN '⚠️  Old usage_count column still exists (should be removed)'
    ELSE '✅ Old usage_count column removed'
  END as status;

-- 9. Count existing coupons
SELECT '9. Coupon statistics...' as step;
SELECT 
  COUNT(*) as total_coupons,
  COUNT(*) FILTER (WHERE is_active = true) as active_coupons,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_coupons,
  SUM(times_redeemed) as total_redemptions,
  COUNT(*) FILTER (WHERE stripe_coupon_id IS NOT NULL) as synced_with_stripe
FROM discount_coupons;

-- 10. Check helper functions
SELECT '10. Checking helper functions...' as step;
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'increment_coupon_usage'
  ) THEN '✅ increment_coupon_usage exists'
  ELSE '⚠️  increment_coupon_usage not found (run coupon_helper_functions.sql)' END as func1,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'validate_coupon_eligibility'
  ) THEN '✅ validate_coupon_eligibility exists'
  ELSE '⚠️  validate_coupon_eligibility not found (run coupon_helper_functions.sql)' END as func2,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'calculate_coupon_discount'
  ) THEN '✅ calculate_coupon_discount exists'
  ELSE '⚠️  calculate_coupon_discount not found (run coupon_helper_functions.sql)' END as func3,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_coupon_usage_stats'
  ) THEN '✅ get_coupon_usage_stats exists'
  ELSE '⚠️  get_coupon_usage_stats not found (run coupon_helper_functions.sql)' END as func4;

-- Final summary
SELECT '=========================================' as summary
UNION ALL SELECT 'Verification Complete!'
UNION ALL SELECT '========================================='
UNION ALL SELECT ''
UNION ALL SELECT 'Next steps:'
UNION ALL SELECT '1. If helper functions are missing, run: coupon_helper_functions.sql'
UNION ALL SELECT '2. Test the UI at /discount-coupons'
UNION ALL SELECT '3. Create a test coupon to verify functionality';
