# Stripe Coupon Sync Solution

## Problem
Updated coupon codes from Stripe were not showing in `/discount-coupons` page because:
- The page reads from **Supabase database** (`discount_coupons` table)
- Stripe coupons are stored in **Stripe's system** (separate database)
- No automatic synchronization between the two systems

## Solution
Added a sync functionality that pulls Stripe coupons and updates the Supabase database.

## Files Created/Modified

### 1. New Sync Route
**File:** `server/routes/sync-stripe-coupons.ts`
- `POST /api/sync-stripe-coupons` - Sync all Stripe coupons to Supabase
- `POST /api/sync-stripe-coupons/:couponId` - Sync a specific coupon

### 2. Updated UI
**File:** `src/pages/DiscountCouponsPage.tsx`
- Added "Sync Stripe" button in the header
- Added `handleSyncStripe()` function to trigger sync

### 3. Server Registration
**File:** `server/index.ts`
- Registered the sync route at `/api/sync-stripe-coupons`

## How to Use

### Option 1: Manual Sync via UI
1. Navigate to `/discount-coupons` page
2. Click the **"Sync Stripe"** button in the header
3. Wait for the sync to complete
4. Coupons from Stripe will now appear in the table

### Option 2: API Call
```bash
# Sync all coupons
curl -X POST http://localhost:3001/api/sync-stripe-coupons

# Sync specific coupon
curl -X POST http://localhost:3001/api/sync-stripe-coupons/COUPON_CODE
```

## What Gets Synced

The sync process:
1. Fetches all coupons from Stripe
2. For each Stripe coupon:
   - Checks if it exists in Supabase (by `stripe_coupon_id`)
   - **Creates** new record if it doesn't exist
   - **Updates** existing record if it does exist
3. Maps Stripe fields to Supabase fields:
   - `id` → `stripe_coupon_id` and `code`
   - `percent_off` or `amount_off` → `discount_value`
   - `duration` → `duration`
   - `max_redemptions` → `usage_limit`
   - `times_redeemed` → `times_redeemed`
   - `metadata.description` → `description`
   - etc.

## Sync Response

```json
{
  "success": true,
  "message": "Stripe coupons synced successfully",
  "results": {
    "created": 5,
    "updated": 3,
    "errors": 0,
    "total": 8
  }
}
```

## Environment Variables Required

Make sure these are set in your `.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Automatic Sync (Optional)

To automatically sync coupons, you can:

### Option A: Stripe Webhooks
Add webhook handler for coupon events:
```typescript
// In server/routes/payments.ts or webhook handler
case 'coupon.created':
case 'coupon.updated':
  await fetch('http://localhost:3001/api/sync-stripe-coupons/' + event.data.object.id, {
    method: 'POST'
  })
  break
```

### Option B: Scheduled Job
Add a cron job to sync periodically:
```typescript
// In server/index.ts
setInterval(async () => {
  try {
    await fetch('http://localhost:3001/api/sync-stripe-coupons', {
      method: 'POST'
    })
    console.log('✅ Stripe coupons synced')
  } catch (error) {
    console.error('❌ Error syncing Stripe coupons:', error)
  }
}, 60 * 60 * 1000) // Every hour
```

## Troubleshooting

### Coupons still not showing
1. Check if sync was successful (look for success message)
2. Verify Stripe API key is correct
3. Check Supabase service role key has write permissions
4. Look at browser console for errors

### Sync fails
1. Check server logs for error details
2. Verify environment variables are set
3. Check Supabase RLS policies allow inserts/updates
4. Ensure `discount_coupons` table has all required columns

### Duplicate coupons
- The sync uses `stripe_coupon_id` to prevent duplicates
- If you see duplicates, check the unique constraint on `stripe_coupon_id`

## Alternative: Use Stripe as Source of Truth

If you want to always show Stripe coupons directly (without Supabase):

1. Modify `src/api/coupons.ts` to fetch from `/api/stripe-coupons` instead
2. Update `useCoupons` hook to use the Stripe endpoint
3. This way, you'll always see live Stripe data

However, this approach:
- ❌ Slower (API call to Stripe each time)
- ❌ No offline access
- ❌ Can't add custom fields
- ✅ Always up-to-date
- ✅ No sync needed

## Recommended Workflow

1. **Create coupons in Stripe** (via Stripe Dashboard or API)
2. **Click "Sync Stripe"** in admin portal
3. **View/manage** coupons in `/discount-coupons` page
4. **Updates in Stripe?** Click "Sync Stripe" again

## Status
✅ **Complete** - Stripe coupon sync functionality implemented and ready to use!
