-- ============================================
-- COMPLETE COUPON SYSTEM MIGRATION (v2)
-- Compatible with Supabase SQL Editor
-- ============================================

-- Step 1: Add stripe_coupon_id
ALTER TABLE discount_coupons 
ADD COLUMN IF NOT EXISTS stripe_coupon_id VARCHAR;

-- Step 2: Add stripe_promotion_code_id
ALTER TABLE discount_coupons 
ADD COLUMN IF NOT EXISTS stripe_promotion_code_id VARCHAR;

-- Step 3: Add currency
ALTER TABLE discount_coupons 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Step 4: Add duration
ALTER TABLE discount_coupons 
ADD COLUMN IF NOT EXISTS duration VARCHAR(20);

-- Step 5: Add duration_in_months
ALTER TABLE discount_coupons 
ADD COLUMN IF NOT EXISTS duration_in_months INTEGER;

-- Step 6: Add metadata
ALTER TABLE discount_coupons 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Step 7: Add times_redeemed (if it doesn't exist)
ALTER TABLE discount_coupons 
ADD COLUMN IF NOT EXISTS times_redeemed INTEGER DEFAULT 0;

-- Step 8: Drop old usage_count column if it exists
ALTER TABLE discount_coupons 
DROP COLUMN IF EXISTS usage_count;

-- Step 9: Drop old constraints
ALTER TABLE discount_coupons DROP CONSTRAINT IF EXISTS valid_discount_type;
ALTER TABLE discount_coupons DROP CONSTRAINT IF EXISTS valid_percentage;
ALTER TABLE discount_coupons DROP CONSTRAINT IF EXISTS currency_required_for_fixed;
ALTER TABLE discount_coupons DROP CONSTRAINT IF EXISTS discount_coupons_duration_check;

-- Step 10: Add new constraints
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

-- Step 11: Add unique constraint on stripe_coupon_id (drop first if exists)
ALTER TABLE discount_coupons 
DROP CONSTRAINT IF EXISTS discount_coupons_stripe_coupon_id_key;

ALTER TABLE discount_coupons 
ADD CONSTRAINT discount_coupons_stripe_coupon_id_key UNIQUE (stripe_coupon_id);

-- Step 12: Create indexes
CREATE INDEX IF NOT EXISTS idx_discount_coupons_code ON discount_coupons(code);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_is_active ON discount_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_valid_dates ON discount_coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_stripe_id ON discount_coupons(stripe_coupon_id);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_stripe_promo_id ON discount_coupons(stripe_promotion_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_duration ON discount_coupons(duration);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_times_redeemed ON discount_coupons(times_redeemed);

-- Step 13: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_discount_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 14: Create trigger
DROP TRIGGER IF EXISTS trigger_discount_coupons_updated_at ON discount_coupons;
CREATE TRIGGER trigger_discount_coupons_updated_at
  BEFORE UPDATE ON discount_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_coupons_updated_at();

-- Step 15: Create statistics view
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

-- Step 16: Create helper function - increment_coupon_usage
CREATE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE discount_coupons
  SET times_redeemed = times_redeemed + 1,
      updated_at = NOW()
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function wrapper for subscriptions
CREATE OR REPLACE FUNCTION trigger_increment_coupon_on_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coupon_id IS NOT NULL THEN
    PERFORM increment_coupon_usage(NEW.coupon_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger that depends on this function
DROP TRIGGER IF EXISTS increment_coupon_on_subscription ON subscriptions;
CREATE TRIGGER increment_coupon_on_subscription
  AFTER INSERT ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_increment_coupon_on_subscription();

-- Step 17: Create helper function - validate_coupon_eligibility
CREATE FUNCTION validate_coupon_eligibility(
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
) AS $$
DECLARE
  v_coupon RECORD;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  SELECT * INTO v_coupon
  FROM discount_coupons
  WHERE code = UPPER(coupon_code);

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Coupon not found'::TEXT, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::TEXT;
    RETURN;
  END IF;

  IF NOT v_coupon.is_active THEN
    RETURN QUERY SELECT FALSE, 'Coupon is inactive'::TEXT, v_coupon.id, NULL::TEXT, NULL::NUMERIC, NULL::TEXT;
    RETURN;
  END IF;

  IF v_now < v_coupon.valid_from THEN
    RETURN QUERY SELECT FALSE, 'Coupon is not yet valid'::TEXT, v_coupon.id, NULL::TEXT, NULL::NUMERIC, NULL::TEXT;
    RETURN;
  END IF;

  IF v_coupon.valid_until IS NOT NULL AND v_now > v_coupon.valid_until THEN
    RETURN QUERY SELECT FALSE, 'Coupon has expired'::TEXT, v_coupon.id, NULL::TEXT, NULL::NUMERIC, NULL::TEXT;
    RETURN;
  END IF;

  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.times_redeemed >= v_coupon.usage_limit THEN
    RETURN QUERY SELECT FALSE, 'Coupon usage limit reached'::TEXT, v_coupon.id, NULL::TEXT, NULL::NUMERIC, NULL::TEXT;
    RETURN;
  END IF;

  IF plan_id IS NOT NULL AND v_coupon.applicable_plans IS NOT NULL AND array_length(v_coupon.applicable_plans, 1) > 0 THEN
    IF NOT (plan_id = ANY(v_coupon.applicable_plans)) THEN
      RETURN QUERY SELECT FALSE, 'Coupon not applicable to this plan'::TEXT, v_coupon.id, NULL::TEXT, NULL::NUMERIC, NULL::TEXT;
      RETURN;
    END IF;
  END IF;

  RETURN QUERY SELECT 
    TRUE, 
    NULL::TEXT, 
    v_coupon.id, 
    v_coupon.discount_type, 
    v_coupon.discount_value,
    v_coupon.currency;
END;
$$ LANGUAGE plpgsql;

-- Step 18: Create helper function - calculate_coupon_discount
CREATE FUNCTION calculate_coupon_discount(
  coupon_code TEXT,
  original_amount NUMERIC,
  currency_code TEXT DEFAULT 'USD'
)
RETURNS TABLE (
  discount_amount NUMERIC,
  final_amount NUMERIC,
  discount_type TEXT
) AS $$
DECLARE
  v_coupon RECORD;
  v_discount NUMERIC;
BEGIN
  SELECT * INTO v_coupon
  FROM discount_coupons
  WHERE code = UPPER(coupon_code)
    AND is_active = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon not found or inactive';
  END IF;

  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := ROUND((original_amount * v_coupon.discount_value / 100), 2);
  ELSIF v_coupon.discount_type = 'fixed_amount' THEN
    IF v_coupon.currency != currency_code THEN
      RAISE EXCEPTION 'Currency mismatch: coupon is for % but amount is in %', v_coupon.currency, currency_code;
    END IF;
    v_discount := v_coupon.discount_value;
  ELSE
    RAISE EXCEPTION 'Invalid discount type';
  END IF;

  IF v_discount > original_amount THEN
    v_discount := original_amount;
  END IF;

  RETURN QUERY SELECT 
    v_discount,
    original_amount - v_discount,
    v_coupon.discount_type;
END;
$$ LANGUAGE plpgsql;

-- Step 19: Create helper function - get_coupon_usage_stats
CREATE FUNCTION get_coupon_usage_stats(coupon_id UUID)
RETURNS TABLE (
  total_redemptions INTEGER,
  remaining_uses INTEGER,
  usage_percentage NUMERIC,
  is_exhausted BOOLEAN,
  days_until_expiry INTEGER
) AS $$
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

  IF v_coupon.usage_limit IS NULL THEN
    v_remaining := NULL;
    v_percentage := 0;
  ELSE
    v_remaining := v_coupon.usage_limit - v_coupon.times_redeemed;
    IF v_remaining < 0 THEN v_remaining := 0; END IF;
    v_percentage := ROUND((v_coupon.times_redeemed::NUMERIC / v_coupon.usage_limit * 100), 2);
  END IF;

  IF v_coupon.valid_until IS NULL THEN
    v_days := NULL;
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
$$ LANGUAGE plpgsql;

-- Step 20: Grant permissions
GRANT EXECUTE ON FUNCTION increment_coupon_usage TO authenticated;
GRANT EXECUTE ON FUNCTION validate_coupon_eligibility TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_coupon_discount TO authenticated;
GRANT EXECUTE ON FUNCTION get_coupon_usage_stats TO authenticated;

-- Done!
SELECT 'Migration completed successfully!' as status;
