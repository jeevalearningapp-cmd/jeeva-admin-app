# Payment Sync Fix - Stripe Sync Not Working

## Issues Found & Fixed

### 1. Incorrect API Endpoint URL
**Problem:** PaymentsPage was calling `/stripe-sync/payments` instead of `/api/stripe-sync/payments`

**Fixed in:** `src/pages/PaymentsPage.tsx`
```typescript
// Before (WRONG)
const response = await fetch(`${apiUrl}/stripe-sync/payments`, {

// After (CORRECT)
const response = await fetch(`${apiUrl}/api/stripe-sync/payments`, {
```

### 2. Supabase Client Import Issue
**Problem:** `sync-stripe-coupons.ts` was creating its own Supabase client instead of using the shared one

**Fixed in:** `server/routes/sync-stripe-coupons.ts`
```typescript
// Before (WRONG)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(...)

// After (CORRECT)
import { supabase } from '../lib/supabase.js'
```

### 3. Stripe API Version Inconsistency
**Problem:** Different routes were using different Stripe API versions

**Fixed in:** `server/routes/stripe-coupons.ts` and `server/routes/sync-stripe-coupons.ts`
```typescript
// Updated to use consistent version
apiVersion: '2024-11-20.acacia'
```

## How to Test

### 1. Start the Server
```bash
cd jeeva-admin-portal
pnpm run dev
```

### 2. Test Payment Sync
1. Navigate to `/payments` page
2. Click **"Sync from Stripe"** button
3. Should see success message with counts: "Sync complete: X imported, Y skipped"

### 3. Check Browser Console
Open browser DevTools (F12) and check:
- Network tab for the API call to `/api/stripe-sync/payments`
- Console tab for any errors

### 4. Check Server Logs
Look for these messages in the terminal:
```
🔄 Starting Stripe payment sync...
✅ Imported session: cs_test_...
🏁 Sync complete: X imported, Y skipped, Z failed
```

## Common Issues & Solutions

### Issue: "404 Not Found"
**Cause:** Server route not registered or wrong URL
**Solution:** 
- Verify route is registered in `server/index.ts`
- Check URL includes `/api/` prefix
- Restart the server

### Issue: "SUPABASE_SERVICE_ROLE_KEY is required"
**Cause:** Missing environment variable
**Solution:** Add to `.env`:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```

### Issue: "No valid user_id in metadata"
**Cause:** Stripe sessions don't have userId in metadata
**Solution:** This is expected for old sessions. The sync will skip them and show in "skipped" count.

### Issue: "User not found in database"
**Cause:** Stripe session references a user that doesn't exist in Supabase
**Solution:** This is expected. The sync validates users exist before importing.

### Issue: CORS Error
**Cause:** Frontend and backend on different origins without CORS setup
**Solution:** 
- In development, Vite proxy should handle this
- Check `vite.config.ts` has proxy configuration
- Or add CORS headers in `server/index.ts`

## API Endpoints

### Stripe Sync
- **POST** `/api/stripe-sync/payments` - Sync payments from Stripe
- **GET** `/api/stripe-sync/status` - Get sync status

### Stripe Coupons Sync
- **POST** `/api/sync-stripe-coupons` - Sync all coupons
- **POST** `/api/sync-stripe-coupons/:couponId` - Sync specific coupon

## Environment Variables Required

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
VITE_SUPABASE_ANON_KEY=eyJ...

# API (optional, defaults to same origin)
VITE_API_URL=http://localhost:5000
```

## Testing the Fix

### Manual Test via cURL
```bash
# Test payment sync
curl -X POST http://localhost:5000/api/stripe-sync/payments \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'

# Test coupon sync
curl -X POST http://localhost:5000/api/sync-stripe-coupons \
  -H "Content-Type: application/json"
```

### Expected Response
```json
{
  "success": true,
  "imported": 5,
  "skipped": 3,
  "failed": 0,
  "errors": [],
  "hasMore": false
}
```

## Verification Checklist

- [ ] Server starts without errors
- [ ] Route registered in `server/index.ts`
- [ ] Environment variables set in `.env`
- [ ] Supabase client imports correctly
- [ ] API endpoint URL includes `/api/` prefix
- [ ] Stripe API key is valid
- [ ] Browser console shows no errors
- [ ] Server logs show sync progress
- [ ] Success message appears in UI
- [ ] Payments appear in database

## Files Modified

1. ✅ `src/pages/PaymentsPage.tsx` - Fixed API URL
2. ✅ `server/routes/sync-stripe-coupons.ts` - Fixed Supabase import
3. ✅ `server/routes/stripe-coupons.ts` - Updated API version
4. ✅ `server/index.ts` - Route already registered

## Next Steps

1. **Restart the server** to apply changes
2. **Clear browser cache** if needed
3. **Test the sync** in the UI
4. **Check database** to verify payments imported

## Troubleshooting Commands

```bash
# Check if server is running
curl http://localhost:5000/api/health

# Check Stripe connection
curl http://localhost:5000/api/stripe-sync/status

# View server logs
# (Check terminal where server is running)

# Check database
# (Use Supabase dashboard or SQL editor)
SELECT COUNT(*) FROM payments WHERE gateway = 'stripe';
```

## Status
✅ **Fixed** - Payment sync should now work correctly!
