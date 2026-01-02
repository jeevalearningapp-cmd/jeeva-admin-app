-- =====================================================
-- Check if payment_status enum exists
-- =====================================================
-- Run this before add_dunning_system.sql to verify enum

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') 
    THEN '✅ payment_status enum EXISTS'
    ELSE '❌ payment_status enum MISSING - will be created by migration'
  END as enum_status;

-- Show all values if enum exists
SELECT 
  enumlabel as payment_status_values
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_status')
ORDER BY enumsortorder;
