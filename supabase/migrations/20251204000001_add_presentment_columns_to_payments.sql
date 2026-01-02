-- =====================================================
-- Migration: Add Presentment Columns to Payments Table
-- =====================================================
-- Adds columns to support Stripe Adaptive Pricing presentment data
-- These columns store the local currency amount charged to customers
-- and the FX conversion details from Stripe Checkout Sessions
-- =====================================================
-- Requirements: 4.4 (Storing payment data from webhooks)
-- =====================================================

-- Add stripe_checkout_session_id column
-- Stores the Stripe Checkout Session ID (cs_xxx) for payments made via Checkout
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

-- Add amount_charged_local column
-- The amount charged to the customer in their local/presentment currency
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS amount_charged_local DECIMAL(12,2);

-- Add currency_charged_local column
-- The ISO 4217 currency code of the presentment currency (e.g., 'INR', 'USD', 'GBP')
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS currency_charged_local VARCHAR(3);

-- Add amount_charged_gbp column
-- The amount in GBP (settlement currency) after FX conversion
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS amount_charged_gbp DECIMAL(12,2);

-- Add fx_rate_applied column
-- The foreign exchange rate applied during currency conversion (local/gbp)
-- NULL when payment is in GBP (no conversion needed)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS fx_rate_applied DECIMAL(10,6);

-- Add country_detected column
-- ISO 3166-1 alpha-2 country code detected for the customer (e.g., 'IN', 'US', 'GB')
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS country_detected VARCHAR(2);

-- Create index on stripe_checkout_session_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_payments_checkout_session 
ON payments(stripe_checkout_session_id) 
WHERE stripe_checkout_session_id IS NOT NULL;

-- Create index on currency_charged_local for analytics queries
CREATE INDEX IF NOT EXISTS idx_payments_currency_local 
ON payments(currency_charged_local) 
WHERE currency_charged_local IS NOT NULL;

-- Create index on country_detected for geographic analytics
CREATE INDEX IF NOT EXISTS idx_payments_country 
ON payments(country_detected) 
WHERE country_detected IS NOT NULL;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN payments.stripe_checkout_session_id IS 
'Stripe Checkout Session ID (cs_xxx) for payments made via Stripe Checkout with Adaptive Pricing';

COMMENT ON COLUMN payments.amount_charged_local IS 
'Amount charged to customer in their local/presentment currency (e.g., INR amount for Indian customers)';

COMMENT ON COLUMN payments.currency_charged_local IS 
'ISO 4217 currency code of the presentment currency (INR, USD, GBP, etc.)';

COMMENT ON COLUMN payments.amount_charged_gbp IS 
'Amount in GBP (settlement currency) after FX conversion by Stripe Adaptive Pricing';

COMMENT ON COLUMN payments.fx_rate_applied IS 
'Foreign exchange rate applied during currency conversion (local_amount / gbp_amount). NULL for GBP payments.';

COMMENT ON COLUMN payments.country_detected IS 
'ISO 3166-1 alpha-2 country code detected for the customer based on payment location';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify columns were added
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'payments'
    AND column_name IN (
      'stripe_checkout_session_id',
      'amount_charged_local',
      'currency_charged_local',
      'amount_charged_gbp',
      'fx_rate_applied',
      'country_detected'
    );
  
  IF col_count != 6 THEN
    RAISE EXCEPTION 'Migration verification failed: Expected 6 new columns, found %', col_count;
  END IF;
  
  RAISE NOTICE 'Migration successful: Added 6 presentment columns to payments table';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- 
-- ✅ Added stripe_checkout_session_id TEXT column
-- ✅ Added amount_charged_local DECIMAL(12,2) column
-- ✅ Added currency_charged_local VARCHAR(3) column
-- ✅ Added amount_charged_gbp DECIMAL(12,2) column
-- ✅ Added fx_rate_applied DECIMAL(10,6) column
-- ✅ Added country_detected VARCHAR(2) column
-- ✅ Created indexes for efficient queries
-- ✅ Added column comments for documentation
--
-- =====================================================
