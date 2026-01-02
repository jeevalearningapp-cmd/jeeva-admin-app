# How to Run the Coupon Migration

## Option 1: Supabase Dashboard (Easiest - Recommended)

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/qsvjvgsnbslgypykuznd/sql/new

2. **Copy the migration file:**
   - Open: `database/migrations/run_coupon_migration.sql`
   - Select all (Cmd+A) and copy (Cmd+C)

3. **Paste and run:**
   - Paste into the SQL Editor
   - Click "Run" button (or press Cmd+Enter)
   - Watch the output for success messages

4. **Verify:**
   - You should see messages like:
     - ✅ Added column: stripe_coupon_id
     - ✅ Migration completed successfully!

---

## Option 2: Using psql Command Line

If you prefer command line, you need to get your database password first:

1. **Get your database password:**
   - Go to: https://supabase.com/dashboard/project/qsvjvgsnbslgypykuznd/settings/database
   - Click "Reset database password" if you don't have it
   - Copy the password

2. **Run the migration:**
   ```bash
   cd jeeva-admin-portal
   psql "postgresql://postgres.qsvjvgsnbslgypykuznd:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres" -f database/migrations/run_coupon_migration.sql
   ```
   Replace `[YOUR-PASSWORD]` with your actual database password.

---

## What the Migration Does

✅ Adds Stripe integration fields (stripe_coupon_id, stripe_promotion_code_id)
✅ Adds currency, duration, duration_in_months fields
✅ Migrates usage_count → times_redeemed (handles existing column)
✅ Adds metadata JSONB field
✅ Creates helper functions for validation
✅ Creates statistics view
✅ Safe to run multiple times (idempotent)

---

## After Migration

1. Test the UI at: http://localhost:5173/discount-coupons
2. Create a test coupon
3. Verify all features work

---

## Troubleshooting

**Error: "times_redeemed already exists"**
- This is handled automatically by the migration
- The script will skip or merge the column

**Error: "permission denied"**
- Make sure you're using the service role key or database password
- Check your Supabase project permissions

**Need help?**
- Check the full documentation: `COUPON_MANAGEMENT_REWORK.md`
- Review the migration file: `run_coupon_migration.sql`
