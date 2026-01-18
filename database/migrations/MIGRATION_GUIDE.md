# Discount Coupons Migration Guide

## Quick Start

### Option 1: Run Safe Migration (Recommended)

This version can be run multiple times without errors.

```bash
# Run the safe migration
psql -h your-db-host -U postgres -d your-database -f database/migrations/enhance_discount_coupons_safe.sql
```

### Option 2: Run via Supabase SQL Editor

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy contents of `enhance_discount_coupons_safe.sql`
5. Click "Run"

## What the Migration Does

### 1. Adds New Columns

- `stripe_coupon_id` - For Stripe integration
- `stripe_promotion_code_id` - Stripe promo code
- `currency` - Currency code (USD, GBP, INR, etc.)
- `duration` - once, repeating, or forever
- `duration_in_months` - For repeating coupons
- `metadata` - JSONB for extra data

### 2. Handles Column Rename

- Renames `usage_count` to `times_redeemed` (if needed)
- Handles all edge cases safely

### 3. Updates Constraints

- Validates discount types
- Ensures currency is set for fixed_amount coupons
- Validates percentage values (1-100)

### 4. Creates Indexes

- Improves query performance
- Indexes on Stripe IDs, duration, times_redeemed

### 5. Creates View

- `active_coupons_with_stats` - Shows coupons with computed stats

## Verify Migration Success

Run this query to verify:

```sql
-- Check all columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'discount_coupons'
ORDER BY ordinal_position;

-- Expected columns:
-- id, code, description, discount_type, discount_value,
-- currency, duration, duration_in_months, applicable_plans,
-- usage_limit, times_redeemed, valid_from, valid_until,
-- is_active, stripe_coupon_id, stripe_promotion_code_id,
-- metadata, created_at, updated_at
```

## Check View

```sql
-- Test the view
SELECT * FROM active_coupons_with_stats LIMIT 5;
```

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Remove new columns
ALTER TABLE discount_coupons
DROP COLUMN IF EXISTS stripe_coupon_id,
DROP COLUMN IF EXISTS stripe_promotion_code_id,
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS duration,
DROP COLUMN IF EXISTS duration_in_months,
DROP COLUMN IF EXISTS metadata;

-- Rename back (if needed)
ALTER TABLE discount_coupons RENAME COLUMN times_redeemed TO usage_count;

-- Drop view
DROP VIEW IF EXISTS active_coupons_with_stats;
```

## Common Issues

### Issue: "column already exists"

**Solution:** Use `enhance_discount_coupons_safe.sql` - it handles existing columns

### Issue: "constraint already exists"

**Solution:** The safe migration drops and recreates constraints

### Issue: "relation does not exist"

**Solution:** Make sure the `discount_coupons` table exists first

## Next Steps

After successful migration:

1. ✅ Run helper functions migration:

   ```bash
   psql -h your-db-host -U postgres -d your-database -f database/migrations/coupon_helper_functions.sql
   ```

2. ✅ Test the UI at `/discount-coupons`

3. ✅ Create a test coupon to verify everything works

## Migration Status Checklist

- [ ] Backup database
- [ ] Run `enhance_discount_coupons_safe.sql`
- [ ] Verify columns exist
- [ ] Run `coupon_helper_functions.sql`
- [ ] Test view: `SELECT * FROM active_coupons_with_stats`
- [ ] Test UI at `/discount-coupons`
- [ ] Create test coupon
- [ ] Verify coupon validation works

## Support

If you encounter issues:

1. Check the error message
2. Verify table exists: `SELECT * FROM discount_coupons LIMIT 1;`
3. Check column list: `\d discount_coupons` (in psql)
4. Review migration logs for NOTICE messages
