-- =====================================================
-- Add Dunning System Tables and Fields
-- =====================================================
-- This migration adds support for:
-- - Failed payment tracking and classification
-- - Automated retry scheduling
-- - Grace period management
-- - Admin alerts
-- =====================================================

-- =====================================================
-- STEP 0: Ensure Required Enums Exist
-- =====================================================

-- Create payment_status enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded');
    RAISE NOTICE '✅ Created payment_status enum';
  ELSE
    RAISE NOTICE '✓ payment_status enum already exists';
  END IF;
END $$;

-- =====================================================
-- STEP 1: Add Dunning Fields to Payments Table
-- =====================================================

-- Add failure tracking fields
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS failure_type VARCHAR(20) CHECK (failure_type IN ('soft_decline', 'hard_decline')),
  ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recovered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS permanently_failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Add indexes for dunning queries
CREATE INDEX IF NOT EXISTS idx_payments_failure_type ON payments(failure_type) 
  WHERE failure_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_failed_at ON payments(failed_at DESC) 
  WHERE failed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_next_retry ON payments(next_retry_at) 
  WHERE next_retry_at IS NOT NULL AND status = 'failed';
CREATE INDEX IF NOT EXISTS idx_payments_retry_count ON payments(retry_count) 
  WHERE retry_count > 0;

-- =====================================================
-- STEP 2: Create payment_retries Table
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_retries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  
  -- Retry details
  attempt_number INTEGER NOT NULL,
  retry_type VARCHAR(20) NOT NULL CHECK (retry_type IN ('manual', 'automated')),
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  attempted_at TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
  
  -- Failure details (if retry failed)
  failure_code TEXT,
  failure_message TEXT,
  
  -- Admin tracking (for manual retries)
  triggered_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_payment_attempt UNIQUE (payment_id, attempt_number)
);

-- Indexes for retry queries
CREATE INDEX idx_payment_retries_payment_id ON payment_retries(payment_id);
CREATE INDEX idx_payment_retries_status ON payment_retries(status);
CREATE INDEX idx_payment_retries_scheduled ON payment_retries(scheduled_for) 
  WHERE status = 'pending';
CREATE INDEX idx_payment_retries_type ON payment_retries(retry_type);

-- =====================================================
-- STEP 3: Create grace_periods Table
-- =====================================================

CREATE TABLE IF NOT EXISTS grace_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Grace period dates
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  duration_days INTEGER NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'expired', 'cancelled')),
  
  -- Cancellation tracking
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_payment_grace_period UNIQUE (payment_id)
);

-- Indexes for grace period queries
CREATE INDEX idx_grace_periods_payment_id ON grace_periods(payment_id);
CREATE INDEX idx_grace_periods_subscription_id ON grace_periods(subscription_id);
CREATE INDEX idx_grace_periods_user_id ON grace_periods(user_id);
CREATE INDEX idx_grace_periods_status ON grace_periods(status);
CREATE INDEX idx_grace_periods_end_date ON grace_periods(end_date) 
  WHERE status = 'active';

-- =====================================================
-- STEP 4: Create alert_logs Table
-- =====================================================

CREATE TABLE IF NOT EXISTS alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Alert classification
  alert_type VARCHAR(50) NOT NULL 
    CHECK (alert_type IN ('high_value', 'fraud', 'high_failure_rate', 'consecutive_failure')),
  severity VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Related entities
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Alert content
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  
  -- Delivery tracking
  sent_to TEXT[] NOT NULL, -- Array of admin email addresses
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Acknowledgment tracking
  acknowledged_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for alert queries
CREATE INDEX idx_alert_logs_alert_type ON alert_logs(alert_type);
CREATE INDEX idx_alert_logs_severity ON alert_logs(severity);
CREATE INDEX idx_alert_logs_payment_id ON alert_logs(payment_id) 
  WHERE payment_id IS NOT NULL;
CREATE INDEX idx_alert_logs_user_id ON alert_logs(user_id) 
  WHERE user_id IS NOT NULL;
CREATE INDEX idx_alert_logs_sent_at ON alert_logs(sent_at DESC);
CREATE INDEX idx_alert_logs_acknowledged ON alert_logs(acknowledged_at) 
  WHERE acknowledged_at IS NULL;

-- =====================================================
-- STEP 5: Add RLS Policies
-- =====================================================

ALTER TABLE payment_retries ENABLE ROW LEVEL SECURITY;
ALTER TABLE grace_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own retry history
CREATE POLICY "Users can read their own payment retries"
  ON payment_retries FOR SELECT
  USING (
    payment_id IN (
      SELECT id FROM payments WHERE user_id = auth.uid()
    )
  );

-- Users can read their own grace periods
CREATE POLICY "Users can read their own grace periods"
  ON grace_periods FOR SELECT
  USING (auth.uid() = user_id);

-- Alert logs are admin-only (no user access)
-- Admins will access via service role

-- =====================================================
-- STEP 6: Create Helper Functions
-- =====================================================

-- Function to classify payment failure
CREATE OR REPLACE FUNCTION classify_payment_failure(error_code TEXT)
RETURNS VARCHAR(20) AS $
DECLARE
  soft_decline_codes TEXT[] := ARRAY[
    'insufficient_funds',
    'card_declined',
    'generic_decline',
    'processing_error',
    'try_again_later'
  ];
  hard_decline_codes TEXT[] := ARRAY[
    'expired_card',
    'invalid_card',
    'incorrect_cvc',
    'incorrect_number',
    'fraudulent',
    'card_not_supported',
    'currency_not_supported',
    'do_not_honor',
    'do_not_try_again',
    'lost_card',
    'stolen_card',
    'pickup_card'
  ];
BEGIN
  IF error_code = ANY(soft_decline_codes) THEN
    RETURN 'soft_decline';
  ELSIF error_code = ANY(hard_decline_codes) THEN
    RETURN 'hard_decline';
  ELSE
    -- Default to soft decline for unknown codes (can be retried)
    RETURN 'soft_decline';
  END IF;
END;
$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get failed payments with filters
CREATE OR REPLACE FUNCTION get_failed_payments(
  failure_type_filter VARCHAR(20) DEFAULT NULL,
  date_from TIMESTAMPTZ DEFAULT NULL,
  date_to TIMESTAMPTZ DEFAULT NULL,
  search_query TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 100,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  amount DECIMAL,
  currency VARCHAR(3),
  failure_code TEXT,
  failure_message TEXT,
  failure_type VARCHAR(20),
  failed_at TIMESTAMPTZ,
  retry_count INTEGER,
  next_retry_at TIMESTAMPTZ,
  status payment_status,
  grace_period_ends_at TIMESTAMPTZ,
  days_remaining INTEGER
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    pc.email as user_email,
    p.final_amount as amount,
    p.currency,
    p.failure_code,
    p.failure_message,
    p.failure_type,
    p.failed_at,
    p.retry_count,
    p.next_retry_at,
    p.status,
    gp.end_date as grace_period_ends_at,
    CASE 
      WHEN gp.end_date IS NOT NULL AND gp.status = 'active' 
      THEN GREATEST(0, EXTRACT(DAY FROM (gp.end_date - NOW()))::INTEGER)
      ELSE NULL 
    END as days_remaining
  FROM payments p
  LEFT JOIN payment_customers pc ON p.payment_customer_id = pc.id
  LEFT JOIN grace_periods gp ON p.id = gp.payment_id AND gp.status = 'active'
  WHERE p.status = 'failed'
    AND (failure_type_filter IS NULL OR p.failure_type = failure_type_filter)
    AND (date_from IS NULL OR p.failed_at >= date_from)
    AND (date_to IS NULL OR p.failed_at <= date_to)
    AND (search_query IS NULL OR 
         pc.email ILIKE '%' || search_query || '%' OR 
         p.id::TEXT ILIKE '%' || search_query || '%')
  ORDER BY p.failed_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recovery statistics
CREATE OR REPLACE FUNCTION get_recovery_stats(
  date_from TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  date_to TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_failed BIGINT,
  total_recovered BIGINT,
  total_permanently_failed BIGINT,
  recovery_rate DECIMAL,
  total_revenue_recovered DECIMAL,
  avg_time_to_recovery_hours DECIMAL
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE failed_at IS NOT NULL)::BIGINT as total_failed,
    COUNT(*) FILTER (WHERE recovered_at IS NOT NULL)::BIGINT as total_recovered,
    COUNT(*) FILTER (WHERE permanently_failed_at IS NOT NULL)::BIGINT as total_permanently_failed,
    CASE 
      WHEN COUNT(*) FILTER (WHERE failed_at IS NOT NULL) > 0 
      THEN (COUNT(*) FILTER (WHERE recovered_at IS NOT NULL)::DECIMAL / 
            COUNT(*) FILTER (WHERE failed_at IS NOT NULL)::DECIMAL * 100)
      ELSE 0 
    END as recovery_rate,
    COALESCE(SUM(final_amount) FILTER (WHERE recovered_at IS NOT NULL), 0) as total_revenue_recovered,
    COALESCE(AVG(EXTRACT(EPOCH FROM (recovered_at - failed_at)) / 3600) 
      FILTER (WHERE recovered_at IS NOT NULL), 0) as avg_time_to_recovery_hours
  FROM payments
  WHERE failed_at >= date_from 
    AND failed_at <= date_to;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 7: Create Triggers
-- =====================================================

-- Update timestamps for new tables
CREATE TRIGGER update_payment_retries_timestamp
  BEFORE UPDATE ON payment_retries
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_timestamp();

CREATE TRIGGER update_grace_periods_timestamp
  BEFORE UPDATE ON grace_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_timestamp();

-- Auto-set failed_at when payment status changes to failed
CREATE OR REPLACE FUNCTION set_payment_failed_at()
RETURNS TRIGGER AS $
BEGIN
  IF NEW.status = 'failed' AND (OLD.status IS NULL OR OLD.status != 'failed') THEN
    NEW.failed_at = NOW();
    -- Auto-classify failure if failure_code is present
    IF NEW.failure_code IS NOT NULL AND NEW.failure_type IS NULL THEN
      NEW.failure_type = classify_payment_failure(NEW.failure_code);
    END IF;
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER set_payment_failed_timestamp
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_payment_failed_at();

-- Auto-set recovered_at when payment status changes from failed to succeeded
CREATE OR REPLACE FUNCTION set_payment_recovered_at()
RETURNS TRIGGER AS $
BEGIN
  IF NEW.status = 'succeeded' AND OLD.status = 'failed' THEN
    NEW.recovered_at = NOW();
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER set_payment_recovered_timestamp
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_payment_recovered_at();

-- =====================================================
-- STEP 8: Verification
-- =====================================================

DO $
DECLARE
  payments_columns INTEGER;
  new_tables INTEGER;
BEGIN
  -- Check payments table columns
  SELECT COUNT(*) INTO payments_columns
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
    AND table_name = 'payments'
    AND column_name IN (
      'failure_type', 'failed_at', 'retry_count', 'last_retry_at', 
      'next_retry_at', 'recovered_at', 'permanently_failed_at', 
      'reviewed_by', 'reviewed_at'
    );
  
  -- Check new tables
  SELECT COUNT(*) INTO new_tables
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN ('payment_retries', 'grace_periods', 'alert_logs');
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Dunning System Migration Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Added % dunning fields to payments table', payments_columns;
  RAISE NOTICE 'Created % new tables', new_tables;
  
  IF payments_columns = 9 AND new_tables = 3 THEN
    RAISE NOTICE '✅ All dunning system components installed successfully';
  ELSE
    RAISE WARNING '⚠️ Expected 9 fields and 3 tables, found % fields and % tables', 
      payments_columns, new_tables;
  END IF;
  
  RAISE NOTICE '========================================';
END $;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- 
-- ✅ Added 9 dunning fields to payments table
-- ✅ Created payment_retries table for retry tracking
-- ✅ Created grace_periods table for grace period management
-- ✅ Created alert_logs table for admin alerts
-- ✅ Added indexes for efficient dunning queries
-- ✅ Created helper functions for failure classification and stats
-- ✅ Set up RLS policies for data access
-- ✅ Created triggers for automatic timestamp management
--
-- Next Steps:
-- 1. Run check_dunning_schema.sql to verify installation
-- 2. Test failure classification: SELECT classify_payment_failure('insufficient_funds');
-- 3. Test failed payments query: SELECT * FROM get_failed_payments();
-- 4. Test recovery stats: SELECT * FROM get_recovery_stats();
--
-- =====================================================
