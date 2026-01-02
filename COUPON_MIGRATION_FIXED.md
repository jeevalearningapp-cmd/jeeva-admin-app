# ✅ Discount Coupon Migration - Issue Fixed

## Problem Encountered
```
ERROR: column "times_redeemed" of relation "discount_coupons" already exists
```

## Solution Provided
Created a **safe, idempotent migration** that can be run multiple times without errors.

## Files Created

### 1. Safe Migration Script ⭐
**File:** `database/migrations/enhance_discount_coupons_safe.sql`

**Features:**
- ✅ Checks if columns exist before adding them
- ✅ Handles `usage_count` → `times_redeemed` rename safely
- ✅ Handles all edge cases (column exists, both exist, neither exists)
- ✅ Can be run multiple times without errors
- ✅ Provides helpful NOTICE messages during execution

### 2. Helper Functions
**File:** `database/migrations/coupon_helper_functions.sql`

**Functions:**
- `increment_coupon_usage(coupon_id)` - Safely increment usage
- `validate_coupon_eligibility(code, plan_id)` - Validate eligibility
- `calculate_coupon_discount(code, amount, currency)` - Calculate discount
- `get_coupon_usage_stats(coupon_id)` - Get usage statistics

### 3. Verification Script
**File:** `database/migrations/verify_migration.sql`

**Checks:**
- ✅ Table exists
- ✅ All columns present
- ✅ Constraints in place
- ✅ Indexes created
- ✅ View exists and works
- ✅ Helper functions exist
- ✅ Old `usage_count` column removed

### 4. Documentation
- `database/migrations/README.md` - Migrations overview
- `database/migrations/MIGRATION_GUIDE.md` - Detailed guide
- `COUPON_MANAGEMENT_REWORK.md` - Full system docs
- `COUPON_SYSTEM_SUMMARY.md` - Quick reference

## How to Run (Fixed Version)

### Step 1: Run Safe Migration
```bash
psql -h your-db-host -U postgres -d your-database \
  -f database/migrations/enhance_discount_coupons_safe.sql
```

**Or via Supabase SQL Editor:**
1. Open Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents of `enhance_discount_coupons_safe.sql`
4. Click "Run"

### Step 2: Run Helper Functions
```bash
psql -h your-db-host -U postgres -d your-database \
  -f database/migrations/coupon_helper_functions.sql
```

### Step 3: Verify Success
```bash
psql -h your-db-host -U postgres -d your-database \
  -f database/migrations/verify_migration.sql
```

## Expected Output

When running the safe migration, you'll see NOTICE messages like:

```
NOTICE:  Added column: stripe_coupon_id
NOTICE:  Added column: stripe_promotion_code_id
NOTICE:  Column currency already exists, skipping
NOTICE:  Column times_redeemed already exists, no migration needed
NOTICE:  Constraints added/updated successfully
NOTICE:  ✅ Migration completed successfully!
```

## What Changed in Your Database

### New Columns Added
```sql
stripe_coupon_id         VARCHAR
stripe_promotion_code_id VARCHAR
currency                 VARCHAR(3)
duration                 VARCHAR(20)
duration_in_months       INTEGER
times_redeemed          INTEGER (renamed from usage_count)
metadata                JSONB
```

### New Constraints
- `valid_discount_type` - Validates percentage/fixed_amount
- `valid_percentage` - Ensures percentage is 1-100
- `currency_required_for_fixed` - Currency required for fixed_amount
- `discount_coupons_duration_check` - Validates duration values

### New Indexes
- `idx_discount_coupons_stripe_id`
- `idx_discount_coupons_stripe_promo_id`
- `idx_discount_coupons_duration`
- `idx_discount_coupons_times_redeemed`

### New View
- `active_coupons_with_stats` - Shows coupons with computed statistics

## Verification Checklist

After running migrations:

- [ ] Run `verify_migration.sql` - all checks pass
- [ ] Query: `SELECT * FROM discount_coupons LIMIT 1;` - works
- [ ] Query: `SELECT * FROM active_coupons_with_stats LIMIT 1;` - works
- [ ] Navigate to `/discount-coupons` in admin portal - loads
- [ ] Create a test coupon - succeeds
- [ ] Edit a coupon - succeeds
- [ ] Delete a coupon - succeeds

## Test Coupon Creation

After migration, test with:

```sql
INSERT INTO discount_coupons (
  code, description, discount_type, discount_value,
  currency, duration, valid_from, is_active
) VALUES (
  'TEST20',
  'Test 20% discount',
  'percentage',
  20,
  NULL,
  'once',
  NOW(),
  true
);
```

## UI Testing

1. Navigate to `/discount-coupons`
2. You should see:
   - Statistics cards (Total, Active, Redemptions, Expired)
   - Search bar
   - Table with coupons
   - "Create Coupon" button

3. Click "Create Coupon" and fill:
   - Code: `SAVE25`
   - Description: `25% off test`
   - Type: `Percentage`
   - Value: `25`
   - Duration: `Once`
   - Valid From: Today's date
   - Active: ✓

4. Click "Create" - should succeed

## Troubleshooting

### Still getting "column already exists" error?
**Solution:** You're running the old migration. Use `enhance_discount_coupons_safe.sql`

### Migration runs but UI shows errors?
**Check:**
1. Browser console for errors
2. Network tab for API failures
3. Supabase logs for database errors

### Functions not found?
**Solution:** Run `coupon_helper_functions.sql`

### View doesn't exist?
**Solution:** Re-run `enhance_discount_coupons_safe.sql` (it's safe to run again)

## Rollback (If Needed)

```sql
-- Remove new columns
ALTER TABLE discount_coupons 
DROP COLUMN IF EXISTS stripe_coupon_id,
DROP COLUMN IF EXISTS stripe_promotion_code_id,
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS duration,
DROP COLUMN IF EXISTS duration_in_months,
DROP COLUMN IF EXISTS metadata;

-- Rename back
ALTER TABLE discount_coupons 
RENAME COLUMN times_redeemed TO usage_count;

-- Drop view and functions
DROP VIEW IF EXISTS active_coupons_with_stats;
DROP FUNCTION IF EXISTS increment_coupon_usage;
DROP FUNCTION IF EXISTS validate_coupon_eligibility;
DROP FUNCTION IF EXISTS calculate_coupon_discount;
DROP FUNCTION IF EXISTS get_coupon_usage_stats;
```

## Summary

✅ **Problem:** Original migration failed due to existing columns
✅ **Solution:** Created safe, idempotent migration
✅ **Status:** Ready to run - no errors expected
✅ **Files:** All migration files created and documented
✅ **Testing:** Verification script provided
✅ **UI:** Complete coupon management interface ready

## Next Steps

1. ✅ Run `enhance_discount_coupons_safe.sql`
2. ✅ Run `coupon_helper_functions.sql`
3. ✅ Run `verify_migration.sql`
4. ✅ Test UI at `/discount-coupons`
5. ✅ Create test coupon
6. ✅ Start using the new coupon system!

## Support

For questions or issues:
- Check `database/migrations/MIGRATION_GUIDE.md`
- Review `COUPON_MANAGEMENT_REWORK.md`
- Run `verify_migration.sql` to diagnose issues

---

**Migration Status:** ✅ Fixed and Ready
**Last Updated:** December 24, 2025
