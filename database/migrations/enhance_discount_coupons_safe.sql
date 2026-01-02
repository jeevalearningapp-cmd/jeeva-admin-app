-- Enhanced Discount Coupons Table Migration (Safe/Idempotent Version)
-- This migration can be run multiple times safely

-- Step 1: Add new columns (only if they don't exist)
DO $$ 
BEGIN
  -- Add stripe_coupon_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'stripe_coupon_id'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN stripe_coupon_id VARCHAR;
    RAISE NOTICE 'Added column: stripe_coupon_id';
  ELSE
    RAISE NOTICE 'Column stripe_coupon_id already exists, skipping';
  END IF;

  -- Add stripe_promotion_code_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'stripe_promotion_code_id'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN stripe_promotion_code_id VARCHAR;
    RAISE NOTICE 'Added column: stripe_promotion_code_id';
  ELSE
    RAISE NOTICE 'Column stripe_promotion_code_id already exists, skipping';
  END IF;

  -- Add currency if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'currency'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
    RAISE NOTICE 'Added column: currency';
  ELSE
    RAISE NOTICE 'Column currency already exists, skipping';
  END IF;

  -- Add duration if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'duration'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN duration VARCHAR(20);
    RAISE NOTICE 'Added column: duration';
  ELSE
    RAISE NOTICE 'Column duration already exists, skipping';
  END IF;

  -- Add duration_in_months if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'duration_in_months'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN duration_in_months INTEGER;
    RAISE NOTICE 'Added column: duration_in_months';
  ELSE
    RAISE NOTICE 'Column duration_in_months already exists, skipping';
  END IF;

  -- Add metadata if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE discount_coupons ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added column: metadata';
  ELSE
    RAISE NOTICE 'Column metadata already exists, skipping';
  END IF;
END $$;

-- Step 2: Handle usage_count to times_redeemed migration
DO $$ 
BEGIN
  -- Case 1: usage_count exists, times_redeemed doesn't exist -> Rename
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'usage_count'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'times_redeemed'
  ) THEN
    ALTER TABLE discount_coupons RENAME COLUMN usage_count TO times_redeemed;
    RAISE NOTICE 'Renamed usage_count to times_redeemed';
  
  -- Case 2: Both exist -> Drop usage_count, keep times_redeemed
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'usage_count'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'times_redeemed'
  ) THEN
    ALTER TABLE discount_coupons DROP COLUMN usage_count;
    RAISE NOTICE 'Dropped duplicate usage_count column';
  
  -- Case 3: Only times_redeemed exists -> Do nothing
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discount_coupons' AND column_name = 'times_redeemed'
  ) THEN
    RAISE NOTICE 'Column times_redeemed already exists, no migration needed';
  
  -- Case 4: Neither exists -> Create times_redeemed
  ELSE
    ALTER TABLE discount_coupons ADD COLUMN times_redeemed INTEGER DEFAULT 0;
    RAISE NOTICE 'Created new times_redeemed column';
  END IF;
END $$;

-- Step 3: Add/Update constraints (drop and recreate to ensure they're correct)
DO $$
BEGIN
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

  RAISE NOTICE 'Constraints added/updated successfully';
END $$;

-- Step 4: Add unique constraint on stripe_coupon_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'discount_coupons_stripe_coupon_id_key'
  ) THEN
    ALTER TABLE discount_coupons ADD CONSTRAINT discount_coupons_stripe_coupon_id_key UNIQUE (stripe_coupon_id);
    RAISE NOTICE 'Added unique constraint on stripe_coupon_id';
  ELSE
    RAISE NOTICE 'Unique constraint on stripe_coupon_id already exists';
  END IF;
END $$;

-- Step 5: Create indexes (IF NOT EXISTS is safe)
CREATE INDEX IF NOT EXISTS idx_discount_coupons_code ON discount_coupons(code);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_is_active ON discount_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_valid_dates ON discount_coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_stripe_id ON discount_coupons(stripe_coupon_id);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_stripe_promo_id ON discount_coupons(stripe_promotion_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_duration ON discount_coupons(duration);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_times_redeemed ON discount_coupons(times_redeemed);

-- Step 6: Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_discount_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger (drop and recreate to ensure it's correct)
DROP TRIGGER IF EXISTS trigger_discount_coupons_updated_at ON discount_coupons;
CREATE TRIGGER trigger_discount_coupons_updated_at
  BEFORE UPDATE ON discount_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_coupons_updated_at();

-- Step 8: Add column comments
COMMENT ON COLUMN discount_coupons.stripe_coupon_id IS 'Stripe coupon ID for API integration';
COMMENT ON COLUMN discount_coupons.stripe_promotion_code_id IS 'Stripe promotion code ID if created';
COMMENT ON COLUMN discount_coupons.currency IS 'Currency code (required for fixed_amount coupons)';
COMMENT ON COLUMN discount_coupons.duration IS 'How long the coupon applies: once, repeating, or forever';
COMMENT ON COLUMN discount_coupons.duration_in_months IS 'Number of months for repeating coupons';
COMMENT ON COLUMN discount_coupons.times_redeemed IS 'Number of times this coupon has been used';
COMMENT ON COLUMN discount_coupons.metadata IS 'Additional metadata in JSON format';

-- Step 9: Create or replace the view
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

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'All columns, constraints, indexes, and views are now up to date.';
END $$;
