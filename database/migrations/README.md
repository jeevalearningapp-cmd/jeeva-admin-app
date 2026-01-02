# Database Migrations

## Discount Coupons Enhancement

### Files Overview

1. **enhance_discount_coupons_safe.sql** ⭐ (USE THIS ONE)
   - Safe, idempotent migration
   - Can be run multiple times without errors
   - Handles all edge cases

2. **coupon_helper_functions.sql**
   - SQL helper functions for coupon operations
   - Run after the main migration

3. **verify_migration.sql**
   - Verification script to check migration success
   - Run after both migrations

4. **MIGRATION_GUIDE.md**
   - Detailed migration instructions
   - Troubleshooting guide

5. **enhance_discount_coupons.sql** (deprecated)
   - Original migration (may cause errors if run twice)
   - Use `enhance_discount_coupons_safe.sql` instead

## Quick Start

### Step 1: Run Safe Migration
```bash
psql -h your-db-host -U postgres -d your-database \
  -f database/migrations/enhance_discount_coupons_safe.sql
```

### Step 2: Run Helper Functions
```bash
psql -h your-db-host -U postgres -d your-database \
  -f database/migrations/coupon_helper_functions.sql
```

### Step 3: Verify
```bash
psql -h your-db-host -U postgres -d your-database \
  -f database/migrations/verify_migration.sql
```

## What Gets Added

### New Columns
- `stripe_coupon_id` - Stripe integration
- `stripe_promotion_code_id` - Stripe promo codes
- `currency` - Currency code (USD, GBP, INR, etc.)
- `duration` - once, repeating, forever
- `duration_in_months` - For repeating coupons
- `times_redeemed` - Usage counter (renamed from usage_count)
- `metadata` - JSONB for extra data

### New Constraints
- Currency required for fixed_amount coupons
- Duration validation
- Percentage value validation (1-100)

### New Indexes
- `idx_discount_coupons_stripe_id`
- `idx_discount_coupons_stripe_promo_id`
- `idx_discount_coupons_duration`
- `idx_discount_coupons_times_redeemed`

### New View
- `active_coupons_with_stats` - Coupons with computed statistics

### New Functions
- `increment_coupon_usage(coupon_id)` - Increment usage counter
- `validate_coupon_eligibility(code, plan_id)` - Validate coupon
- `calculate_coupon_discount(code, amount, currency)` - Calculate discount
- `get_coupon_usage_stats(coupon_id)` - Get usage statistics

## Troubleshooting

### Error: "column already exists"
✅ **Solution:** Use `enhance_discount_coupons_safe.sql` - it handles this

### Error: "constraint already exists"
✅ **Solution:** The safe migration drops and recreates constraints

### Error: "relation does not exist"
❌ **Problem:** The `discount_coupons` table doesn't exist
**Solution:** Create the base table first

### Error: "permission denied"
❌ **Problem:** Insufficient database permissions
**Solution:** Connect as superuser or database owner

## Verification Checklist

After running migrations, verify:

- [ ] All new columns exist
- [ ] `times_redeemed` column exists (not `usage_count`)
- [ ] Constraints are in place
- [ ] Indexes created
- [ ] View `active_coupons_with_stats` exists
- [ ] Helper functions exist
- [ ] Can query the view without errors
- [ ] UI at `/discount-coupons` loads successfully

## Rollback

If you need to rollback:

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
ALTER TABLE discount_coupons 
RENAME COLUMN times_redeemed TO usage_count;

-- Drop view
DROP VIEW IF EXISTS active_coupons_with_stats;

-- Drop functions
DROP FUNCTION IF EXISTS increment_coupon_usage;
DROP FUNCTION IF EXISTS validate_coupon_eligibility;
DROP FUNCTION IF EXISTS calculate_coupon_discount;
DROP FUNCTION IF EXISTS get_coupon_usage_stats;
```

## Support

For detailed instructions, see:
- `MIGRATION_GUIDE.md` - Step-by-step guide
- `../COUPON_MANAGEMENT_REWORK.md` - Full system documentation
- `../COUPON_SYSTEM_SUMMARY.md` - Quick reference

## Migration Status

✅ Safe migration script created
✅ Helper functions created
✅ Verification script created
✅ Documentation complete
✅ Ready for production use
