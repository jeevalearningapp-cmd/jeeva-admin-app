# Discount Coupon Management System - Complete Rework

## Overview
Complete rework of the coupon management system with enhanced database schema, Stripe integration support, and modern React implementation.

## Changes Made

### 1. Database Migration
**File:** `database/migrations/enhance_discount_coupons.sql`

**New Columns Added:**
- `stripe_coupon_id` - Stripe coupon ID for API integration
- `stripe_promotion_code_id` - Stripe promotion code ID
- `currency` - Currency code (required for fixed_amount coupons)
- `duration` - How long coupon applies: once, repeating, forever
- `duration_in_months` - Number of months for repeating coupons
- `times_redeemed` - Renamed from `usage_count` for consistency
- `metadata` - JSONB field for additional data

**New Constraints:**
- `currency_required_for_fixed` - Ensures currency is set for fixed_amount coupons
- Updated `valid_discount_type` and `valid_percentage` constraints

**New Indexes:**
- `idx_discount_coupons_stripe_id`
- `idx_discount_coupons_stripe_promo_id`
- `idx_discount_coupons_duration`
- `idx_discount_coupons_times_redeemed`

**New View:**
- `active_coupons_with_stats` - Shows coupons with computed usage statistics and validity status

### 2. TypeScript Types
**File:** `src/types/coupon.ts`

**Interfaces Created:**
- `DiscountCoupon` - Main coupon interface with all fields
- `CreateCouponInput` - Input for creating new coupons
- `UpdateCouponInput` - Input for updating existing coupons
- `CouponValidationResult` - Result of coupon validation
- `CouponUsageStats` - Usage statistics interface
- `StripeCouponParams` - Stripe API parameters

### 3. API Layer
**File:** `src/api/coupons.ts`

**Functions Implemented:**
- `getAll(filters?)` - Get all coupons with optional filtering
- `getActiveWithStats()` - Get active coupons with computed stats
- `getById(id)` - Get coupon by ID
- `getByCode(code)` - Get coupon by code
- `create(input)` - Create new coupon
- `update(id, input)` - Update existing coupon
- `delete(id)` - Delete coupon
- `validate(code, planId?)` - Validate coupon code
- `incrementUsage(id)` - Increment usage count
- `syncWithStripe(id, stripeCouponId)` - Sync with Stripe

**Features:**
- Automatic code uppercase conversion
- Comprehensive validation logic
- Error handling
- Type-safe operations

### 4. React Hooks
**File:** `src/hooks/useCoupons.ts`

**Hooks Created:**
- `useCoupons(filters?)` - Fetch all coupons with filters
- `useActiveCouponsWithStats()` - Fetch active coupons with stats
- `useCoupon(id)` - Fetch single coupon by ID
- `useCouponByCode(code)` - Fetch coupon by code
- `useCreateCoupon()` - Create coupon mutation
- `useUpdateCoupon()` - Update coupon mutation
- `useDeleteCoupon()` - Delete coupon mutation
- `useValidateCoupon()` - Validate coupon mutation

**Features:**
- React Query integration for caching
- Automatic refetching
- Optimistic updates
- Toast notifications

### 5. Updated UI Component
**File:** `src/pages/DiscountCouponsPage.tsx`

**Features:**
- ✅ Modern Material-UI design
- ✅ Statistics cards (Total, Active, Redemptions, Expired)
- ✅ Real-time search functionality
- ✅ Pagination support
- ✅ Create/Edit dialog with comprehensive form
- ✅ Copy coupon code to clipboard
- ✅ Status indicators with color coding
- ✅ Usage tracking display
- ✅ Form validation
- ✅ Responsive design

**Form Fields:**
- Code (required, auto-uppercase)
- Description (optional)
- Discount Type (percentage/fixed_amount)
- Discount Value (with validation)
- Currency (for fixed_amount)
- Duration (once/repeating/forever)
- Duration in Months (for repeating)
- Usage Limit (optional)
- Valid From (required)
- Valid Until (optional)
- Active Status (toggle)

**Table Columns:**
- Code (with copy button)
- Description
- Discount (formatted)
- Duration
- Usage (current/limit)
- Valid Until
- Status (with color chip)
- Actions (Edit/Delete)

## Database Schema

```sql
CREATE TABLE discount_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC NOT NULL,
  currency VARCHAR(3),
  duration VARCHAR(20) CHECK (duration IN ('once', 'repeating', 'forever')),
  duration_in_months INTEGER,
  applicable_plans UUID[],
  usage_limit INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  stripe_coupon_id VARCHAR UNIQUE,
  stripe_promotion_code_id VARCHAR,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Usage Examples

### Creating a Percentage Coupon
```typescript
const createInput: CreateCouponInput = {
  code: 'SAVE20',
  description: '20% off for new customers',
  discount_type: 'percentage',
  discount_value: 20,
  duration: 'once',
  usage_limit: 100,
  valid_from: '2025-01-01',
  valid_until: '2025-12-31',
  is_active: true,
}

await couponsAPI.create(createInput)
```

### Creating a Fixed Amount Coupon
```typescript
const createInput: CreateCouponInput = {
  code: 'FLAT50',
  description: '$50 off subscription',
  discount_type: 'fixed_amount',
  discount_value: 50,
  currency: 'USD',
  duration: 'once',
  valid_from: '2025-01-01',
  is_active: true,
}

await couponsAPI.create(createInput)
```

### Validating a Coupon
```typescript
const result = await couponsAPI.validate('SAVE20', 'plan-id-123')

if (result.valid) {
  console.log('Coupon is valid:', result.coupon)
} else {
  console.log('Validation error:', result.error)
}
```

## Migration Steps

### 1. Run Database Migration (Safe Version)

**Option A: Via Command Line**
```bash
# Connect to your Supabase project
psql -h your-db-host -U postgres -d your-database

# Run the SAFE migration (can be run multiple times)
\i database/migrations/enhance_discount_coupons_safe.sql

# Run helper functions
\i database/migrations/coupon_helper_functions.sql

# Verify migration
\i database/migrations/verify_migration.sql
```

**Option B: Via Supabase SQL Editor**
1. Open Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents of `enhance_discount_coupons_safe.sql`
4. Click "Run"
5. Repeat for `coupon_helper_functions.sql`

### 2. Verify Migration
```bash
# Connect to your Supabase project
psql -h your-db-host -U postgres -d your-database

# Run the migration
\i database/migrations/enhance_discount_coupons.sql
```

### 2. Verify Migration
```sql
-- Check new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'discount_coupons';

-- Check the view
SELECT * FROM active_coupons_with_stats LIMIT 5;
```

### 3. Test the UI
1. Navigate to `/discount-coupons` in admin portal
2. Create a test coupon
3. Edit the coupon
4. Verify statistics cards
5. Test search functionality
6. Test pagination

## Stripe Integration (Optional)

To integrate with Stripe, you'll need to:

1. **Create Backend Endpoint** (`server/routes/stripe-coupons.ts`):
```typescript
router.post('/api/stripe/create-coupon', async (req, res) => {
  const { name, discount_type, discount_value, currency, duration } = req.body
  
  const couponParams: any = { name, duration }
  
  if (discount_type === 'percentage') {
    couponParams.percent_off = discount_value
  } else {
    couponParams.amount_off = discount_value * 100 // Convert to cents
    couponParams.currency = currency.toLowerCase()
  }
  
  const stripeCoupon = await stripe.coupons.create(couponParams)
  res.json(stripeCoupon)
})
```

2. **Update Create Function** in `src/api/coupons.ts`:
```typescript
// After creating in Supabase, optionally create in Stripe
if (input.create_in_stripe) {
  const stripeResponse = await fetch('/api/stripe/create-coupon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  })
  const stripeCoupon = await stripeResponse.json()
  
  // Update with Stripe ID
  await couponsAPI.syncWithStripe(data.id, stripeCoupon.id)
}
```

3. **Add Webhook Handler** for syncing usage:
```typescript
case 'coupon.updated':
  const coupon = event.data.object
  await supabase
    .from('discount_coupons')
    .update({ times_redeemed: coupon.times_redeemed })
    .eq('stripe_coupon_id', coupon.id)
  break
```

## Features

### ✅ Implemented
- Complete CRUD operations
- Form validation
- Search and filtering
- Pagination
- Usage tracking
- Status indicators
- Copy to clipboard
- Statistics dashboard
- Responsive design
- Error handling
- Toast notifications

### 🚧 Future Enhancements
- Stripe API integration
- Bulk import/export
- Usage analytics charts
- Coupon templates
- A/B testing support
- Customer-specific coupons
- Automatic expiry notifications
- Redemption history view

## Testing Checklist

- [ ] Run database migration successfully
- [ ] Create percentage coupon
- [ ] Create fixed amount coupon
- [ ] Edit existing coupon
- [ ] Delete coupon
- [ ] Search coupons
- [ ] Validate coupon code
- [ ] Check usage limits
- [ ] Verify expiry dates
- [ ] Test pagination
- [ ] Copy code to clipboard
- [ ] View statistics cards
- [ ] Test form validation
- [ ] Check responsive design

## Files Modified/Created

### Created:
- ✅ `database/migrations/enhance_discount_coupons.sql`
- ✅ `src/types/coupon.ts`
- ✅ `src/api/coupons.ts`
- ✅ `src/hooks/useCoupons.ts`
- ✅ `src/pages/DiscountCouponsPage.tsx` (rewritten)

### Modified:
- ✅ `src/hooks/index.ts` - Added coupon hooks export
- ✅ `src/api/index.ts` - Added coupons API export

## Status
✅ **Complete** - Coupon management system fully reworked with enhanced features and Stripe integration support.

## Support
For issues or questions:
1. Check the migration file for database schema
2. Review API documentation in `src/api/coupons.ts`
3. Check component implementation in `src/pages/DiscountCouponsPage.tsx`
4. Verify types in `src/types/coupon.ts`
