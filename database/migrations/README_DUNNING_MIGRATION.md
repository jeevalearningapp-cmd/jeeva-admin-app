# Dunning System Database Migration Guide

## Overview

This guide helps you add the Failed Payments & Dunning Management system to your existing database.

## Files Created

1. **check_enum_status.sql** - Check if payment_status enum exists
2. **check_dunning_schema.sql** - Check what exists in your database
3. **add_dunning_system.sql** - Add missing tables and fields (FIXED - now creates enum)
4. **verify_dunning_installation.sql** - Comprehensive post-migration verification
5. **README_DUNNING_MIGRATION.md** - This guide

---

## Step-by-Step Instructions

### Step 1: Check Enum Status (IMPORTANT)

The migration requires the `payment_status` enum. Check if it exists:

```sql
\i database/migrations/check_enum_status.sql
```

**Note:** The migration script will automatically create the enum if it doesn't exist, but it's good to verify first.

### Step 2: Check Current Schema

Let's see what you already have:

```sql
\i database/migrations/check_dunning_schema.sql
```

Or use the quick check:

```sql
\i database/migrations/quick_check.sql
```

**What to look for:**

- ✅ `failure_code` and `failure_message` already exist in payments table
- ❌ Other dunning fields (failure_type, failed_at, retry_count, etc.) are missing
- ❌ New tables (payment_retries, grace_periods, alert_logs) don't exist

---

### Step 3: Run the Migration

Once you've confirmed what's missing, run the migration:

```sql
\i database/migrations/add_dunning_system.sql
```

**Expected output:**

```
✅ Created payment_status enum (or already exists)
========================================
Dunning System Migration Complete
========================================
Added 9 dunning fields to payments table
Created 3 new tables
✅ All dunning system components installed successfully
========================================
```

**This will:**

- ✅ Create `payment_status` enum if it doesn't exist (FIXED)
- ✅ Add 9 new columns to the `payments` table
- ✅ Create 3 new tables: `payment_retries`, `grace_periods`, `alert_logs`
- ✅ Add indexes for efficient queries
- ✅ Create helper functions for failure classification and stats
- ✅ Set up RLS policies
- ✅ Create triggers for automatic timestamp management

---

### Step 4: Verify Installation

After running the migration, run comprehensive verification:

```sql
\i database/migrations/verify_dunning_installation.sql
```

This will test:

- ✅ Enum exists
- ✅ All 9 dunning fields added to payments table
- ✅ All 3 new tables created
- ✅ All 3 helper functions work
- ✅ Indexes created
- ✅ RLS policies set up
- ✅ Triggers active

You can also test individual functions:

```sql
-- Check the summary
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('payment_retries', 'grace_periods', 'alert_logs');

-- Test the failure classification function
SELECT classify_payment_failure('insufficient_funds'); -- Should return 'soft_decline'
SELECT classify_payment_failure('expired_card');       -- Should return 'hard_decline'

-- Test the failed payments query (should return empty initially)
SELECT * FROM get_failed_payments();

-- Test the recovery stats (should return zeros initially)
SELECT * FROM get_recovery_stats();
```

---

## What Gets Added

### New Columns in `payments` Table

| Column | Type | Description |
|--------|------|-------------|
| `failure_type` | VARCHAR(20) | 'soft_decline' or 'hard_decline' |
| `failed_at` | TIMESTAMPTZ | When payment failed |
| `retry_count` | INTEGER | Number of retry attempts |
| `last_retry_at` | TIMESTAMPTZ | Last retry timestamp |
| `next_retry_at` | TIMESTAMPTZ | Next scheduled retry |
| `recovered_at` | TIMESTAMPTZ | When payment was recovered |
| `permanently_failed_at` | TIMESTAMPTZ | When marked as permanently failed |
| `reviewed_by` | UUID | Admin who reviewed |
| `reviewed_at` | TIMESTAMPTZ | When reviewed |

### New Table: `payment_retries`

Tracks all retry attempts (manual and automated):
- Retry scheduling and execution
- Success/failure tracking
- Admin audit trail for manual retries

### New Table: `grace_periods`

Manages grace periods for failed payments:
- Start and end dates
- Status tracking (active/expired/cancelled)
- Subscription linkage

### New Table: `alert_logs`

Logs admin alerts:
- High-value failures
- Fraud alerts
- High failure rate alerts
- Consecutive failure alerts

---

## Helper Functions Created

### 1. `classify_payment_failure(error_code TEXT)`

Automatically classifies Stripe error codes:

```sql
SELECT classify_payment_failure('insufficient_funds'); -- Returns 'soft_decline'
SELECT classify_payment_failure('expired_card');       -- Returns 'hard_decline'
```

### 2. `get_failed_payments(...)`

Query failed payments with filters:

```sql
-- Get all failed payments
SELECT * FROM get_failed_payments();

-- Get soft declines only
SELECT * FROM get_failed_payments(failure_type_filter := 'soft_decline');

-- Get failures from last 7 days
SELECT * FROM get_failed_payments(
  date_from := NOW() - INTERVAL '7 days'
);

-- Search by email
SELECT * FROM get_failed_payments(
  search_query := 'user@example.com'
);
```

### 3. `get_recovery_stats(date_from, date_to)`

Get recovery analytics:

```sql
-- Last 30 days (default)
SELECT * FROM get_recovery_stats();

-- Last 7 days
SELECT * FROM get_recovery_stats(
  NOW() - INTERVAL '7 days',
  NOW()
);
```

Returns:
- Total failed payments
- Total recovered payments
- Recovery rate percentage
- Total revenue recovered
- Average time to recovery (hours)

---

## Automatic Triggers

The migration sets up automatic triggers:

1. **Auto-set `failed_at`** - When payment status changes to 'failed'
2. **Auto-classify failures** - Automatically sets `failure_type` based on `failure_code`
3. **Auto-set `recovered_at`** - When payment status changes from 'failed' to 'succeeded'
4. **Update timestamps** - Automatically updates `updated_at` on all tables

---

## Testing the Migration

### Test 1: Simulate a Failed Payment

```sql
-- Update an existing payment to failed status
UPDATE payments 
SET 
  status = 'failed',
  failure_code = 'insufficient_funds',
  failure_message = 'Insufficient funds in account'
WHERE id = 'your-payment-id';

-- Check if failed_at and failure_type were set automatically
SELECT 
  id, 
  status, 
  failure_code, 
  failure_type, 
  failed_at 
FROM payments 
WHERE id = 'your-payment-id';
```

### Test 2: Create a Retry Record

```sql
-- Create a retry attempt
INSERT INTO payment_retries (
  payment_id,
  attempt_number,
  retry_type,
  scheduled_for,
  status
) VALUES (
  'your-payment-id',
  1,
  'automated',
  NOW() + INTERVAL '24 hours',
  'pending'
);

-- Verify it was created
SELECT * FROM payment_retries WHERE payment_id = 'your-payment-id';
```

### Test 3: Create a Grace Period

```sql
-- Create a grace period
INSERT INTO grace_periods (
  payment_id,
  subscription_id,
  user_id,
  start_date,
  end_date,
  duration_days,
  status
) VALUES (
  'your-payment-id',
  'your-subscription-id',
  'your-user-id',
  NOW(),
  NOW() + INTERVAL '7 days',
  7,
  'active'
);

-- Verify it was created
SELECT * FROM grace_periods WHERE payment_id = 'your-payment-id';
```

---

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Drop new tables
DROP TABLE IF EXISTS alert_logs CASCADE;
DROP TABLE IF EXISTS grace_periods CASCADE;
DROP TABLE IF EXISTS payment_retries CASCADE;

-- Drop new functions
DROP FUNCTION IF EXISTS classify_payment_failure(TEXT);
DROP FUNCTION IF EXISTS get_failed_payments(...);
DROP FUNCTION IF EXISTS get_recovery_stats(...);
DROP FUNCTION IF EXISTS set_payment_failed_at();
DROP FUNCTION IF EXISTS set_payment_recovered_at();

-- Remove columns from payments table
ALTER TABLE payments 
  DROP COLUMN IF EXISTS failure_type,
  DROP COLUMN IF EXISTS failed_at,
  DROP COLUMN IF EXISTS retry_count,
  DROP COLUMN IF EXISTS last_retry_at,
  DROP COLUMN IF EXISTS next_retry_at,
  DROP COLUMN IF EXISTS recovered_at,
  DROP COLUMN IF EXISTS permanently_failed_at,
  DROP COLUMN IF EXISTS reviewed_by,
  DROP COLUMN IF EXISTS reviewed_at;
```

---

## Next Steps

After successful migration:

1. ✅ Verify all tables and columns exist
2. ✅ Test the helper functions
3. ✅ Start implementing the backend services (Phase 2 of tasks.md)
4. ✅ Set up cron jobs for automated retry processing

---

## Troubleshooting

### Error: "type payment_status does not exist"

**Solution:** The migration now automatically creates this enum. If you still see this error after running the migration, manually create it:

```sql
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded');
```

Then re-run the migration.

### Error: "admin_users table does not exist"

If you get this error, you need to create the admin_users table first, or remove the foreign key constraints:

```sql
-- Option 1: Create admin_users table (recommended)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Option 2: Remove foreign key constraints (not recommended)
-- Edit add_dunning_system.sql and remove REFERENCES admin_users(id)
```

### Error: "subscriptions table does not exist"

The grace_periods table requires a subscriptions table. Make sure it exists:

```sql
-- Check if subscriptions table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'subscriptions'
);
```

---

## Support

If you encounter any issues:
1. Check the verification output at the end of the migration
2. Run `check_dunning_schema.sql` to see what's installed
3. Review the error messages carefully
4. Check that all prerequisite tables exist (admin_users, subscriptions)

