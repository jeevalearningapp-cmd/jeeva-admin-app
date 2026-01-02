-- Enhanced Discount Coupons Table Migration
-- This migration enhances the existing discount_coupons table with Stripe integration

-- Add new columns for Stripe integration (only if they don't exist)
DO $$ 
BEGIN
  -- Add stripe_coupon_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'stripe_coupon_id'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN stripe_coupon_id VARCHAR UNIQUE;
  END IF;

  -- Add stripe_promotion_code_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'stripe_promotion_code_id'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN stripe_promotion_code_id VARCHAR;
  END IF;

  -- Add currency if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'currency'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
  END IF;

  -- Add duration if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'duration'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN duration VARCHAR(20) CHECK (duration IN ('once', 'repeating', 'forever'));
  END IF;

  -- Add duration_in_months if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'duration_in_months'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN duration_in_months INTEGER;
  END IF;

  -- Add times_redeemed if it doesn't exist (in case it wasn't renamed from usage_count)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'times_redeemed'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN times_redeemed INTEGER DEFAULT 0;
  END IF;

  -- Add metadata if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Rename usage_count to times_redeemed for consistency (if not already done)
DO $$ 
BEGIN
  -- Check if usage_count exists and times_redeemed doesn't exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'usage_count'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'times_redeemed'
  ) THEN
    ALTER TABLE discount_coupons RENAME COLUMN usage_count TO times_redeemed;
  END IF;
  
  -- If both exist, drop usage_count and keep times_redeemed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'usage_count'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'times_redeemed'
  ) THEN
    ALTER TABLE discount_coupons DROP COLUMN usage_count;
  END IF;
  
  -- If only times_redeemed exists, do nothing (already migrated)
END $$;

-- Update constraint names for clarity
ALTER TABLE discount_coupons 
DROP CONSTRAINT IF EXISTS valid_discount_type,
ADD CONSTRAINT valid_discount_type CHECK (discount_type IN ('percentage', 'fixed_amount'));

ALTER TABLE discount_coupons
DROP CONSTRAINT IF EXISTS valid_percentage,
ADD CONSTRAINT valid_percentage CHECK (
  (discount_type = 'percentage' AND discount_value >= 1 AND discount_value <= 100)
  OR discount_type = 'fixed_amount'
);

-- Add constraint for currency requirement on fixed_amount coupons
ALTER TABLE discount_coupons
ADD CONSTRAINT currency_required_for_fixed CHECK (
  (discount_type = 'fixed_amount' AND currency IS NOT NULL)
  OR discount_type = 'percentage'
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_discount_coupons_stripe_id ON discount_coupons(stripe_coupon_id);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_stripe_promo_id ON discount_coupons(stripe_promotion_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_duration ON discount_coupons(duration);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_times_redeemed ON discount_coupons(times_redeemed);

-- Update the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_discount_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_discount_coupons_updated_at ON discount_coupons;
CREATE TRIGGER trigger_discount_coupons_updated_at
  BEFORE UPDATE ON discount_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_coupons_updated_at();

-- Add comments for documentation
COMMENT ON COLUMN discount_coupons.stripe_coupon_id IS 'Stripe coupon ID for API integration';
COMMENT ON COLUMN discount_coupons.stripe_promotion_code_id IS 'Stripe promotion code ID if created';
COMMENT ON COLUMN discount_coupons.currency IS 'Currency code (required for fixed_amount coupons)';
COMMENT ON COLUMN discount_coupons.duration IS 'How long the coupon applies: once, repeating, or forever';
COMMENT ON COLUMN discount_coupons.duration_in_months IS 'Number of months for repeating coupons';
COMMENT ON COLUMN discount_coupons.times_redeemed IS 'Number of times this coupon has been used';
COMMENT ON COLUMN discount_coupons.metadata IS 'Additional metadata in JSON format';

-- Create a view for active coupons with usage statistics
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

COMMENT ON VIEW active_coupons_with_stats IS 'View showing coupons with computed usage statistics and validity status';
