-- =====================================================
-- Payment Gateway System (Stripe + Razorpay)
-- =====================================================
-- Supports dual payment gateway with smart routing
-- India users → Razorpay, International users → Stripe
-- Integrates with subscription_plans and discount_coupons
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE payment_gateway AS ENUM ('stripe', 'razorpay');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded');
CREATE TYPE payment_method_type AS ENUM ('card', 'upi', 'netbanking', 'wallet', 'other');
CREATE TYPE currency_code AS ENUM ('USD', 'GBP', 'EUR', 'INR');

-- =====================================================
-- Table 1: payment_customers
-- =====================================================
-- Stores customer IDs from payment gateways

CREATE TABLE IF NOT EXISTS payment_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gateway payment_gateway NOT NULL,
  
  -- Gateway-specific customer IDs
  stripe_customer_id TEXT,
  razorpay_customer_id TEXT,
  
  -- Customer details
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  country_code TEXT, -- ISO 3166-1 alpha-2 (e.g., 'IN', 'GB', 'US')
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_gateway UNIQUE (user_id, gateway),
  CONSTRAINT stripe_customer_required CHECK (
    (gateway = 'stripe' AND stripe_customer_id IS NOT NULL) OR gateway != 'stripe'
  ),
  CONSTRAINT razorpay_customer_required CHECK (
    (gateway = 'razorpay' AND razorpay_customer_id IS NOT NULL) OR gateway != 'razorpay'
  )
);

CREATE INDEX idx_payment_customers_user_id ON payment_customers(user_id);
CREATE INDEX idx_payment_customers_stripe_id ON payment_customers(stripe_customer_id);
CREATE INDEX idx_payment_customers_razorpay_id ON payment_customers(razorpay_customer_id);

-- =====================================================
-- Table 2: payment_methods
-- =====================================================
-- Stores saved payment methods

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_customer_id UUID NOT NULL REFERENCES payment_customers(id) ON DELETE CASCADE,
  gateway payment_gateway NOT NULL,
  
  -- Gateway-specific IDs
  stripe_payment_method_id TEXT,
  razorpay_token_id TEXT,
  
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_customer_id ON payment_methods(payment_customer_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(payment_customer_id, is_default) WHERE is_default = true;

-- =====================================================
-- Table 3: payments
-- =====================================================
-- Main payment records

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_customer_id UUID REFERENCES payment_customers(id) ON DELETE SET NULL,
  
  -- Gateway information
  gateway payment_gateway NOT NULL,
  stripe_payment_intent_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency currency_code NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- Subscription relationship
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  subscription_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  discount_coupon_id UUID REFERENCES discount_coupons(id) ON DELETE SET NULL,
  
  -- Pricing breakdown
  original_amount DECIMAL(10, 2) NOT NULL, -- Before discount
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL, -- After discount = amount
  
  -- Payment method used
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  payment_method_type payment_method_type,
  
  -- Failure details
  failure_code TEXT,
  failure_message TEXT,
  
  -- Gateway response
  gateway_response JSONB, -- Full response from gateway
  
  -- Receipt and billing
  receipt_url TEXT,
  invoice_pdf TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT stripe_intent_required CHECK (
    (gateway = 'stripe' AND stripe_payment_intent_id IS NOT NULL) OR gateway != 'stripe'
  ),
  CONSTRAINT razorpay_order_required CHECK (
    (gateway = 'razorpay' AND razorpay_order_id IS NOT NULL) OR gateway != 'razorpay'
  ),
  CONSTRAINT final_amount_matches CHECK (final_amount = original_amount - discount_amount)
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway ON payments(gateway);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id);

-- =====================================================
-- Table 4: payment_refunds
-- =====================================================
-- Track refunds

CREATE TABLE IF NOT EXISTS payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  gateway payment_gateway NOT NULL,
  
  -- Gateway refund IDs
  stripe_refund_id TEXT,
  razorpay_refund_id TEXT,
  
  -- Refund details
  amount DECIMAL(10, 2) NOT NULL,
  currency currency_code NOT NULL,
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

-- =====================================================
-- Table 5: payment_webhook_events
-- =====================================================
-- Log all webhook events for debugging

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway payment_gateway NOT NULL,
  event_id TEXT NOT NULL, -- stripe event ID or razorpay event ID
  event_type TEXT NOT NULL,
  
  -- Event payload
  payload JSONB NOT NULL,
  
  -- Processing status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate processing
  CONSTRAINT unique_gateway_event UNIQUE (gateway, event_id)
);

CREATE INDEX idx_webhook_events_gateway ON payment_webhook_events(gateway);
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

-- Service role can do everything (for backend API)
-- No policies for webhook events - only backend access

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get payment gateway for user based on country
CREATE OR REPLACE FUNCTION get_payment_gateway_for_user(user_country_code TEXT)
RETURNS payment_gateway AS $$
BEGIN
  IF user_country_code = 'IN' THEN
    RETURN 'razorpay'::payment_gateway;
  ELSE
    RETURN 'stripe'::payment_gateway;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's payment summary
CREATE OR REPLACE FUNCTION get_user_payment_summary(user_id_param UUID)
RETURNS TABLE (
  total_payments BIGINT,
  total_amount DECIMAL,
  successful_payments BIGINT,
  failed_payments BIGINT,
  refunded_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_payments,
    COALESCE(SUM(final_amount), 0) as total_amount,
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
  IF NEW.status = 'succeeded' AND OLD.status != 'succeeded' THEN
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

-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'payment_customers', 
  'payment_methods', 
  'payments', 
  'payment_refunds', 
  'payment_webhook_events'
);

-- Check enums
SELECT typname FROM pg_type 
WHERE typname IN (
  'payment_gateway', 
  'payment_status', 
  'payment_method_type', 
  'currency_code'
);

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- 
-- ✅ Created 5 tables for payment management
-- ✅ Created enums for type safety
-- ✅ Set up RLS policies for user data access
-- ✅ Created helper functions for payment summaries
-- ✅ Set up triggers for timestamp management
--
-- Next: Implement backend APIs and mobile integration
--
-- =====================================================
