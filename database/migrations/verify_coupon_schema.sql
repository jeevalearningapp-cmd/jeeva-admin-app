-- Quick verification query to check the coupon schema

-- 1. Check all columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'discount_coupons'
ORDER BY ordinal_position;

-- 2. Check sample data with new columns
SELECT 
  code,
  discount_type,
  discount_value,
  currency,
  duration,
  times_redeemed,
  stripe_coupon_id,
  is_active
FROM discount_coupons
LIMIT 5;

-- 3. Check if view exists
SELECT * FROM active_coupons_with_stats LIMIT 3;
