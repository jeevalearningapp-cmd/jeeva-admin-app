-- ============================================
-- COMPLETE COUPON SYSTEM MIGRATION
-- Run this script to upgrade your discount_coupons table
-- ============================================
--
-- This script will:
-- 1. Add Stripe integration fields
-- 2. Add currency, duration, and metadata fields
-- 3. Migrate usage_count to times_redeemed
-- 4. Create helper functions for validation
-- 5. Create statistics view
--
-- SAFE TO RUN MULTIPLE TIMES (Idempotent)
-- ============================================

BEGIN;

-- ============================================
-- PART 1: Schema Enhancement
-- ============================================

-- Step 1: Add new columns (only if they don't exist)
DO $ 
BEGIN
  RAISE NOTICE '=== Adding new columns ===';
  
  -- Add stripe_coupon_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'stripe_coupon_id'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN stripe_coupon_id VARCHAR;
    RAISE NOTICE '✅ Added column: stripe_coupon_id';
  ELSE
    RAISE NOTICE '⏭️  Column stripe_coupon_id already exists, skipping';
  END IF;

  -- Add stripe_promotion_code_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'stripe_promotion_code_id'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN stripe_promotion_code_id VARCHAR;
    RAISE NOTICE '✅ Added column: stripe_promotion_code_id';
  ELSE
    RAISE NOTICE '⏭️  Column stripe_promotion_code_id already exists, skipping';
  END IF;

  -- Add currency if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'currency'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
    RAISE NOTICE '✅ Added column: currency';
  ELSE
    RAISE NOTICE '⏭️  Column currency already exists, skipping';
  END IF;

  -- Add duration if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'duration'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN duration VARCHAR(20);
    RAISE NOTICE '✅ Added column: duration';
  ELSE
    RAISE NOTICE '⏭️  Column duration already exists, skipping';
  END IF;

  -- Add duration_in_months if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'duration_in_months'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN duration_in_months INTEGER;
    RAISE NOTICE '✅ Added column: duration_in_months';
  ELSE
    RAISE NOTICE '⏭️  Column duration_in_months already exists, skipping';
  END IF;

  -- Add metadata if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '✅ Added column: metadata';
  ELSE
    RAISE NOTICE '⏭️  Column metadata already exists, skipping';
  END IF;
END $;

-- Step 2: Handle usage_count to times_redeemed migration
DO $ 
BEGIN
  RAISE NOTICE '=== Migrating usage_count to times_redeemed ===';
  
  -- Case 1: usage_count exists, times_redeemed doesn't exist -> Rename
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'usage_count'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'times_redeemed'
  ) THEN
    ALTER TABLE discount_coupons RENAME COLUMN usage_count TO times_redeemed;
    RAISE NOTICE '✅ Renamed usage_count to times_redeemed';
  
  -- Case 2: Both exist -> Drop usage_count, keep times_redeemed
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'usage_count'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'times_redeemed'
  ) THEN
    ALTER TABLE discount_coupons DROP COLUMN usage_count;
    RAISE NOTICE '✅ Dropped duplicate usage_count column';
  
  -- Case 3: Only times_redeemed exists -> Do nothing
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'times_redeemed'
  ) THEN
    RAISE NOTICE '⏭️  Column times_redeemed already exists, no migration needed';
  
  -- Case 4: Neither exists -> Create times_redeemed
  ELSE
    ALTER TABLE discount_coupons ADD COLUMN times_redeemed INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Created new times_redeemed column';
  END IF;
END $;

-- Step 3: Add/Update constraints
DO $
BEGIN
  RAISE NOTICE '=== Updating constraints ===';
  
  -- Drop existing constraints if they exist
  ALTER TABLE discount_coupons DROP CONSTRAINT IF EXISTS valid_discount_type;
  ALTER TABLE discount_coupons DROP CONSTRAINT IF EXISTS valid_percentage;
  ALTER TABLE discount_coupons DROP CONSTRAINT IF EXISTS currency_required_for_fixed;
  ALTER TABLE discount_coupons DROP CONSTRAINT IF EXISTS discount_coupons_duration_check;

  -- Add constraints
  ALTER TABLE discount_coupons 
    ADD CONSTRAINT valid_discount_type CHECK (discount_type IN ('percentage', 'fixed_amount'));

  ALTER TABLE discount_coupons
    ADD CONSTRAINT valid_percentage CHECK (
      (discount_type = 'percentage' AND discount_value >= 1 AND discount_value <= 100)
      OR discount_type = 'fixed_amount'
    );

  ALTER TABLE discount_coupons
    ADD CONSTRAINT currency_required_for_fixed CHECK (
      (discount_type = 'fixed_amount' AND currency IS NOT NULL)
      OR discount_type = 'percentage'
    );

  ALTER TABLE discount_coupons
    ADD CONSTRAINT discount_coupons_duration_check CHECK (
      duration IS NULL OR duration IN ('once', 'repeating', 'forever')
    );

  RAISE NOTICE '✅ Constraints updated successfully';
END $;

-- Step 4: Add unique constraint on stripe_coupon_id
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'discount_coupons_stripe_coupon_id_key'
  ) THEN
    ALTER TABLE discount_coupons ADD CONSTRAINT discount_coupons_stripe_coupon_id_key UNIQUE (stripe_coupon_id);
    RAISE NOTICE '✅ Added unique constraint on stripe_coupon_id';
  ELSE
    RAISE NOTICE '⏭️  Unique constraint on stripe_coupon_id already exists';
  END IF;
END $;

-- Step 5: Create indexes
DO $
BEGIN
  RAISE NOTICE '=== Creating indexes ===';
END $;

CREATE INDEX IF NOT EXISTS idx_discount_coupons_code ON discount_coupons(code);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_is_active ON discount_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_valid_dates ON discount_coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_stripe_id ON discount_coupons(stripe_coupon_id);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_stripe_promo_id ON discount_coupons(stripe_promotion_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_duration ON discount_coupons(duration);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_times_redeemed ON discount_coupons(times_redeemed);

-- Step 6: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_discount_coupons_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_discount_coupons_updated_at ON discount_coupons;
CREATE TRIGGER trigger_discount_coupons_updated_at
  BEFORE UPDATE ON discount_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_coupons_updated_at();

-- Step 7: Create statistics view
CREATE OR REPLACE VIEW active_coupons_with_stats AS
SELECT 
  dc.*,
  CASE 
    WHEN dc.usage_limit IS NULL THEN 'Unlimited'
    WHEN dc.times_redeemed >= dc.usage_limit THEN 'Exhausted'
    ELSE CONCAT(dc.times_redeemed, '/', dc.usage_limit)
  END as usage_status,
  CASE 
    WHEN dc.valid_until IS NOT NULL AND dc.valid_until < NOW() THEN false
    WHEN dc.usage_limit IS NOT NULL AND dc.times_redeemed >= dc.usage_limit THEN false
    ELSE dc.is_active
  END as is_currently_valid,
  CASE
    WHEN dc.valid_until IS NOT NULL AND dc.valid_until < NOW() THEN 'Expired'
    WHEN dc.usage_limit IS NOT NULL AND dc.times_redeemed >= dc.usage_limit THEN 'Limit Reached'
    WHEN NOT dc.is_active THEN 'Inactive'
    WHEN dc.valid_from > NOW() THEN 'Scheduled'
    ELSE 'Active'
  END as status_label
FROM discount_coupons dc;

-- ============================================
-- PART 2: Helper Functions
-- ============================================

DO $
BEGIN
  RAISE NOTICE '=== Creating helper functions ===';
END $;

-- Function to increment coupon usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $
BEGIN
  UPDATE discount_coupons
  SET times_redeemed = times_redeemed + 1,
      updated_at = NOW()
  WHERE id = coupon_id;
END;
$ LANGUAGE plpgsql;

-- Function to validate coupon eligibility
CREATE OR REPLACE FUNCTION validate_coupon_eligibility(
  coupon_code TEXT,
  plan_id UUID DEFAULT NULL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  error_message TEXT,
  coupon_id UUID,
  discount_type TEXT,
  discount_value NUMERIC,
  currency TEXT
) AS $
DECLARE
  v_coupon RECORD;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Get coupon details
  SELECT * INTO v_coupon
  FROM discount_coupons
  WHERE code = UPPER(coupon_code);

  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Coupon not found'::TEXT, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::TEXT;
    RETURN;
  END IF;

  -- Check if active
  IF NOT v_coupon.is_active THEN
    RETURN QUERY SELECT FALSE, 'Coupon is inactive'::TEXT, v_coupon.id, NULL::TEXT, NULL::NUMERIC, NULL::TEXT;
    RETURN;
  END IF;

  -- Check valid_from date
  IF v_now < v_coupon.valid_from THEN
    RETURN QUERY SELECT FALSE, 'Coupon is not yet valid'::TEXT, v_coupon.id, NULL::TEXT, NULL::NUMERIC, NULL::TEXT;
    RETURN;
  END IF;

  -- Check valid_until date
  IF v_coupon.valid_until IS NOT NULL AND v_now > v_coupon.valid_until THEN
    RETURN QUERY SELECT FALSE, 'Coupon has expired'::TEXT, v_coupon.id, NULL::TEXT, NULL::NUMERIC, NULL::TEXT;
    RETURN;
  END IF;

  -- Check usage limit
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.times_redeemed >= v_coupon.usage_limit THEN
    RETURN QUERY SELECT FALSE, 'Coupon usage limit reached'::TEXT, v_coupon.id, NULL::TEXT, NULL::NUMERIC, NULL::TEXT;
    RETURN;
  END IF;

  -- Check plan applicability
  IF plan_id IS NOT NULL AND v_coupon.applicable_plans IS NOT NULL AND array_length(v_coupon.applicable_plans, 1) > 0 THEN
    IF NOT (plan_id = ANY(v_coupon.applicable_plans)) THEN
      RETURN QUERY SELECT FALSE, 'Coupon not applicable to this plan'::TEXT, v_coupon.id, NULL::TEXT, NULL::NUMERIC, NULL::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Coupon is valid
  RETURN QUERY SELECT 
    TRUE, 
    NULL::TEXT, 
    v_coupon.id, 
    v_coupon.discount_type, 
    v_coupon.discount_value,
    v_coupon.currency;
END;
$ LANGUAGE plpgsql;

-- Function to calculate discount amount
CREATE OR REPLACE FUNCTION calculate_coupon_discount(
  coupon_code TEXT,
  original_amount NUMERIC,
  currency_code TEXT DEFAULT 'USD'
)
RETURNS TABLE (
  discount_amount NUMERIC,
  final_amount NUMERIC,
  discount_type TEXT
) AS $
DECLARE
  v_coupon RECORD;
  v_discount NUMERIC;
BEGIN
  -- Get coupon details
  SELECT * INTO v_coupon
  FROM discount_coupons
  WHERE code = UPPER(coupon_code)
    AND is_active = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon not found or inactive';
  END IF;

  -- Calculate discount based on type
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := ROUND((original_amount * v_coupon.discount_value / 100), 2);
  ELSIF v_coupon.discount_type = 'fixed_amount' THEN
    -- Check currency match for fixed amount
    IF v_coupon.currency != currency_code THEN
      RAISE EXCEPTION 'Currency mismatch: coupon is for % but amount is in %', v_coupon.currency, currency_code;
    END IF;
    v_discount := v_coupon.discount_value;
  ELSE
    RAISE EXCEPTION 'Invalid discount type';
  END IF;

  -- Ensure discount doesn't exceed original amount
  IF v_discount > original_amount THEN
    v_discount := original_amount;
  END IF;

  RETURN QUERY SELECT 
    v_discount,
    original_amount - v_discount,
    v_coupon.discount_type;
END;
$ LANGUAGE plpgsql;

-- Function to get coupon usage statistics
CREATE OR REPLACE FUNCTION get_coupon_usage_stats(coupon_id UUID)
RETURNS TABLE (
  total_redemptions INTEGER,
  remaining_uses INTEGER,
  usage_percentage NUMERIC,
  is_exhausted BOOLEAN,
  days_until_expiry INTEGER
) AS $
DECLARE
  v_coupon RECORD;
  v_remaining INTEGER;
  v_percentage NUMERIC;
  v_days INTEGER;
BEGIN
  SELECT * INTO v_coupon
  FROM discount_coupons
  WHERE id = coupon_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon not found';
  END IF;

  -- Calculate remaining uses
  IF v_coupon.usage_limit IS NULL THEN
    v_remaining := NULL; -- Unlimited
    v_percentage := 0;
  ELSE
    v_remaining := v_coupon.usage_limit - v_coupon.times_redeemed;
    IF v_remaining < 0 THEN v_remaining := 0; END IF;
    v_percentage := ROUND((v_coupon.times_redeemed::NUMERIC / v_coupon.usage_limit * 100), 2);
  END IF;

  -- Calculate days until expiry
  IF v_coupon.valid_until IS NULL THEN
    v_days := NULL; -- No expiry
  ELSE
    v_days := EXTRACT(DAY FROM (v_coupon.valid_until - NOW()));
    IF v_days < 0 THEN v_days := 0; END IF;
  END IF;

  RETURN QUERY SELECT
    v_coupon.times_redeemed,
    v_remaining,
    v_percentage,
    (v_coupon.usage_limit IS NOT NULL AND v_coupon.times_redeemed >= v_coupon.usage_limit),
    v_days;
END;
$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_coupon_usage TO authenticated;
GRANT EXECUTE ON FUNCTION validate_coupon_eligibility TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_coupon_discount TO authenticated;
GRANT EXECUTE ON FUNCTION get_coupon_usage_stats TO authenticated;

-- ============================================
-- Final Summary
-- ============================================

DO $
DECLARE
  total_coupons INTEGER;
  active_coupons INTEGER;
  total_redemptions INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_coupons FROM discount_coupons;
  SELECT COUNT(*) INTO active_coupons FROM discount_coupons WHERE is_active = true;
  SELECT COALESCE(SUM(times_redeemed), 0) INTO total_redemptions FROM discount_coupons;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ COUPON MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '  Total coupons: %', total_coupons;
  RAISE NOTICE '  Active coupons: %', active_coupons;
  RAISE NOTICE '  Total redemptions: %', total_redemptions;
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Test the UI at /discount-coupons';
  RAISE NOTICE '  2. Create a test coupon';
  RAISE NOTICE '  3. Verify Stripe integration (optional)';
  RAISE NOTICE '';
  RAISE NOTICE 'Documentation: COUPON_MANAGEMENT_REWORK.md';
  RAISE NOTICE '========================================';
END $;

COMMIT;
