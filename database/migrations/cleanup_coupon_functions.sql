-- ============================================
-- CLEANUP SCRIPT - Run this FIRST
-- Removes all existing coupon-related functions
-- ============================================

-- Drop dependent trigger first
DROP TRIGGER IF EXISTS increment_coupon_on_subscription ON subscriptions;

-- Drop all possible versions of increment_coupon_usage (with CASCADE for safety)
DROP FUNCTION IF EXISTS increment_coupon_usage(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_coupon_usage(coupon_id UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_coupon_usage CASCADE;

-- Drop all possible versions of validate_coupon_eligibility
DROP FUNCTION IF EXISTS validate_coupon_eligibility(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS validate_coupon_eligibility(coupon_code TEXT, plan_id UUID) CASCADE;
DROP FUNCTION IF EXISTS validate_coupon_eligibility(TEXT) CASCADE;
DROP FUNCTION IF EXISTS validate_coupon_eligibility CASCADE;

-- Drop all possible versions of calculate_coupon_discount
DROP FUNCTION IF EXISTS calculate_coupon_discount(TEXT, NUMERIC, TEXT) CASCADE;
DROP FUNCTION IF EXISTS calculate_coupon_discount(coupon_code TEXT, original_amount NUMERIC, currency_code TEXT) CASCADE;
DROP FUNCTION IF EXISTS calculate_coupon_discount(TEXT, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS calculate_coupon_discount CASCADE;

-- Drop all possible versions of get_coupon_usage_stats
DROP FUNCTION IF EXISTS get_coupon_usage_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_coupon_usage_stats(coupon_id UUID) CASCADE;
DROP FUNCTION IF EXISTS get_coupon_usage_stats CASCADE;

SELECT 'Cleanup completed! Now run run_coupon_migration_v2.sql' as status;
