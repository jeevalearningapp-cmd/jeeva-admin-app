-- =====================================================
-- Prepare payment_status Enum (Run This First)
-- =====================================================
-- This script ensures the payment_status enum exists
-- before running the main dunning system migration.
-- Safe to run multiple times (idempotent).
-- =====================================================

-- Check and create payment_status enum
DO $$ 
BEGIN
  -- Check if enum exists
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    -- Create the enum
    CREATE TYPE payment_status AS ENUM (
      'pending', 
      'processing', 
      'succeeded', 
      'failed', 
      'cancelled', 
      'refunded'
    );
    RAISE NOTICE '✅ Created payment_status enum';
  ELSE
    RAISE NOTICE '✓ payment_status enum already exists';
  END IF;
  
  -- Show the enum values
  RAISE NOTICE '========================================';
  RAISE NOTICE 'payment_status enum values:';
  FOR rec IN 
    SELECT enumlabel 
    FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_status')
    ORDER BY enumsortorder
  LOOP
    RAISE NOTICE '  - %', rec.enumlabel;
  END LOOP;
  RAISE NOTICE '========================================';
  
END $$;

-- Verify enum is usable
DO $$
DECLARE
  test_status payment_status;
BEGIN
  test_status := 'pending'::payment_status;
  RAISE NOTICE '✅ Enum is usable - test value: %', test_status;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ Enum test failed: %', SQLERRM;
END $$;

-- =====================================================
-- PREPARATION COMPLETE
-- =====================================================
-- 
-- ✅ payment_status enum is ready
-- 
-- Next step: Run add_dunning_system.sql
-- 
-- =====================================================
