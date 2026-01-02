-- Helper Functions for Discount Coupons

-- Function to increment coupon usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE discount_coupons
  SET times_redeemed = times_redeemed + 1,
      updated_at = NOW()
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_coupon_usage IS 'Safely increment the times_redeemed counter for a coupon';

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
) AS $$
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
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_coupon_eligibility IS 'Validate if a coupon can be used, checking all eligibility criteria';

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
) AS $$
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
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_coupon_discount IS 'Calculate the discount amount for a given coupon and original amount';

-- Function to get coupon usage statistics
CREATE OR REPLACE FUNCTION get_coupon_usage_stats(coupon_id UUID)
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
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_coupon_usage_stats IS 'Get detailed usage statistics for a coupon';

-- Grant execute permissions (adjust role as needed)
GRANT EXECUTE ON FUNCTION increment_coupon_usage TO authenticated;
GRANT EXECUTE ON FUNCTION validate_coupon_eligibility TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_coupon_discount TO authenticated;
GRANT EXECUTE ON FUNCTION get_coupon_usage_stats TO authenticated;
