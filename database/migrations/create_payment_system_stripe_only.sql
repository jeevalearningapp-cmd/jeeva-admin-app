-- =====================================================
-- Payment System (Stripe Only with Adaptive Pricing)
-- =====================================================
-- Stripe handles all payments globally via Adaptive Pricing
-- GBP base prices, automatic currency conversion at checkout
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

-- Drop old enums if they exist (for clean migration)
DROP TYPE IF EXISTS payment_gateway CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method_type CASCADE;
DROP TYPE IF EXISTS currency_code CASCADE;

CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded');
CREATE TYPE payment_method_type AS ENUM ('card', 'upi', 'netbanking', 'wallet', 'other');

-- =====================================================
-- Table 1: payment_customers
-- =====================================================
-- Stores Stripe customer IDs

CREATE TABLE IF NOT EXISTS payment_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe customer ID
  stripe_customer_id TEXT NOT NULL,
  
  -- Customer details
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  country_code VARCHAR(2), -- ISO 3166-1 alpha-2 (e.g., 'IN', 'GB', 'US')
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_stripe UNIQUE (user_id),
  CONSTRAINT unique_stripe_customer UNIQUE (stripe_customer_id)
);

CREATE INDEX idx_payment_customers_user_id ON payment_customers(user_id);
CREATE INDEX idx_payment_customers_stripe_id ON payment_customers(stripe_customer_id);

-- =====================================================
-- Table 2: payment_methods
-- =====================================================
-- Stores saved payment methods from Stripe

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_customer_id UUID NOT NULL REFERENCES payment_customers(id) ON DELETE CASCADE,
  
  -- Stripe payment method ID
  stripe_payment_method_id TEXT NOT NULL,
  
  -- Payment method details
  method_type payment_method_type NOT NULL,
  last4 TEXT, -- Last 4 digits of card
  card_brand TEXT, -- visa, mastercard, amex
  expiry_month INTEGER,
  expiry_year INTEGER,
  
  -- Status
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_stripe_payment_method UNIQUE (stripe_payment_method_id)
);

CREATE INDEX idx_payment_methods_customer_id ON payment_methods(payment_customer_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(payment_customer_id, is_default) WHERE is_default = true;

-- =====================================================
-- Table 3: payments
-- =====================================================
-- Main payment records with Adaptive Pricing support

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_customer_id UUID REFERENCES payment_customers(id) ON DELETE SET NULL,
  
  -- Stripe identifiers
  gateway TEXT NOT NULL DEFAULT 'stripe',
  stripe_checkout_session_id TEXT, -- cs_xxx (Checkout flow)
  stripe_payment_intent_id TEXT,   -- pi_xxx
  stripe_customer_id TEXT,         -- cus_xxx
  
  -- Base payment details (GBP - settlement currency)
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- Adaptive Pricing: Presentment data (what customer paid)
  amount_charged_local DECIMAL(12, 2),    -- Amount in customer's currency
  currency_charged_local VARCHAR(3),       -- Customer's currency (INR, USD, EUR, etc.)
  amount_charged_gbp DECIMAL(12, 2),       -- GBP equivalent (settlement)
  fx_rate_applied DECIMAL(10, 6),          -- FX rate: local/gbp
  country_detected VARCHAR(2),             -- Customer's country code
  
  -- Subscription relationship
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  subscription_plan_id TEXT, -- Stripe Product ID or internal plan ID
  
  -- Pricing breakdown (in GBP)
  original_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  
  -- Payment method used
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  payment_method_type payment_method_type,
  
  -- Failure details
  failure_code TEXT,
  failure_message TEXT,
  
  -- Gateway response
  gateway_response JSONB,
  
  -- Receipt and billing
  receipt_url TEXT,
  invoice_pdf TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Primary indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Stripe lookup indexes
CREATE INDEX idx_payments_checkout_session ON payments(stripe_checkout_session_id) 
  WHERE stripe_checkout_session_id IS NOT NULL;
CREATE INDEX idx_payments_payment_intent ON payments(stripe_payment_intent_id) 
  WHERE stripe_payment_intent_id IS NOT NULL;

-- Adaptive Pricing analytics indexes
CREATE INDEX idx_payments_currency_local ON payments(currency_charged_local) 
  WHERE currency_charged_local IS NOT NULL;
CREATE INDEX idx_payments_country ON payments(country_detected) 
  WHERE country_detected IS NOT NULL;

-- =====================================================
-- Table 4: payment_refunds
-- =====================================================
-- Track refunds

CREATE TABLE IF NOT EXISTS payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  
  -- Stripe refund ID
  stripe_refund_id TEXT,
  
  -- Refund details (in GBP)
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
  reason TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- Admin details
  refunded_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_payment_refunds_payment_id ON payment_refunds(payment_id);
CREATE INDEX idx_payment_refunds_status ON payment_refunds(status);
CREATE INDEX idx_payment_refunds_stripe_id ON payment_refunds(stripe_refund_id) 
  WHERE stripe_refund_id IS NOT NULL;

-- =====================================================
-- Table 5: payment_webhook_events
-- =====================================================
-- Log Stripe webhook events for debugging

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE, -- Stripe event ID (evt_xxx)
  event_type TEXT NOT NULL,      -- checkout.session.completed, payment_intent.succeeded, etc.
  
  -- Event payload
  payload JSONB NOT NULL,
  
  -- Processing status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_event_id ON payment_webhook_events(event_id);
CREATE INDEX idx_webhook_events_event_type ON payment_webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed ON payment_webhook_events(processed);
CREATE INDEX idx_webhook_events_created_at ON payment_webhook_events(created_at DESC);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own payment data
CREATE POLICY "Users can read their own payment customers"
  ON payment_customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own payment methods"
  ON payment_methods FOR SELECT
  USING (
    payment_customer_id IN (
      SELECT id FROM payment_customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own refunds"
  ON payment_refunds FOR SELECT
  USING (
    payment_id IN (
      SELECT id FROM payments WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's payment summary
CREATE OR REPLACE FUNCTION get_user_payment_summary(user_id_param UUID)
RETURNS TABLE (
  total_payments BIGINT,
  total_amount_gbp DECIMAL,
  successful_payments BIGINT,
  failed_payments BIGINT,
  refunded_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_payments,
    COALESCE(SUM(final_amount), 0) as total_amount_gbp,
    COUNT(*) FILTER (WHERE status = 'succeeded')::BIGINT as successful_payments,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_payments,
    COALESCE((
      SELECT SUM(r.amount) 
      FROM payment_refunds r 
      JOIN payments p ON r.payment_id = p.id 
      WHERE p.user_id = user_id_param AND r.status = 'succeeded'
    ), 0) as refunded_amount
  FROM payments
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get presentment currency distribution
CREATE OR REPLACE FUNCTION get_presentment_summary(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  currency VARCHAR(3),
  payment_count BIGINT,
  total_local DECIMAL,
  total_gbp DECIMAL,
  avg_fx_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    currency_charged_local as currency,
    COUNT(*)::BIGINT as payment_count,
    SUM(amount_charged_local) as total_local,
    SUM(amount_charged_gbp) as total_gbp,
    AVG(fx_rate_applied) as avg_fx_rate
  FROM payments
  WHERE status = 'succeeded'
    AND currency_charged_local IS NOT NULL
    AND created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY currency_charged_local
  ORDER BY payment_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_payment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_customers_timestamp
  BEFORE UPDATE ON payment_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_timestamp();

CREATE TRIGGER update_payment_methods_timestamp
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_timestamp();

CREATE TRIGGER update_payments_timestamp
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_timestamp();

CREATE TRIGGER update_payment_refunds_timestamp
  BEFORE UPDATE ON payment_refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_timestamp();

-- Set completed_at when status changes to succeeded
CREATE OR REPLACE FUNCTION set_payment_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND (OLD.status IS NULL OR OLD.status != 'succeeded') THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_payment_completed_timestamp
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_payment_completed_at();

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN (
    'payment_customers', 
    'payment_methods', 
    'payments', 
    'payment_refunds', 
    'payment_webhook_events'
  );
  
  IF table_count = 5 THEN
    RAISE NOTICE '✅ All 5 payment tables created successfully';
  ELSE
    RAISE WARNING '⚠️ Expected 5 tables, found %', table_count;
  END IF;
END $$;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- 
-- ✅ Created 5 tables for Stripe-only payment management
-- ✅ Removed Razorpay references
-- ✅ Added Adaptive Pricing presentment columns
-- ✅ Set up RLS policies for user data access
-- ✅ Created helper functions for payment summaries
-- ✅ Set up triggers for timestamp management
--
-- =====================================================
