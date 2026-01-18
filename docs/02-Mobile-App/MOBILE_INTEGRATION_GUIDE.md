# Mobile App Integration Guide

## File Structure

```
mobile-app/
├── CountryDetection.ts          # Main hook (copy-paste replace)
├── utils/
│   └── currency.ts              # Currency formatting utilities
├── components/
│   └── PriceDisplay.tsx         # React Native components for prices
├── hooks/
│   └── usePricing.ts            # Combined pricing hook
```

## Setup Steps

### 1. Copy CountryDetection.ts

- Copy the provided `CountryDetection.ts` file
- Replace your existing one
- **No 403 errors** - uses backend endpoint

### 2. Add Utils File

Copy `utils/currency.ts` for price formatting:

```typescript
import { formatSubscriptionPrice } from "./utils/currency";

// Use it
const price = formatSubscriptionPrice(99, "IN", "monthly");
// Result: "₹8265.00/month"
```

### 3. Add Components (React Native)

Copy `components/PriceDisplay.tsx` for UI:

```jsx
import { PriceDisplay } from "./components/PriceDisplay";

<PriceDisplay
  usdPrice={99}
  countryCode="IN"
  size="large"
  billingCycle="monthly"
/>;
```

### 4. Use Combined Hook

```typescript
import { usePricing } from './hooks/usePricing'

function SubscriptionScreen() {
  const { formatPrice, countryCode, loading } = usePricing()

  return (
    <Text>{formatPrice(99)}</Text>  // ₹8265.00, £78.21, $99.00, etc
  )
}
```

## Features

### CountryDetection Hook

```typescript
const { country, loading, formatPrice, convertPrice } = useCountryDetection();

// country: { countryCode, countryName, currency, currencySymbol, exchangeRate, paymentProvider }
// formatPrice(10) → "$10.00" or "₹835.00" or "£7.90"
// convertPrice(10) → 10 or 835 or 7.90 (number only)
```

### Currency Utils

```typescript
import {
  formatSubscriptionPrice,
  formatForPaymentIntent,
} from "./utils/currency";

// Subscription display
formatSubscriptionPrice(99, "IN", "monthly"); // "₹8265.00/month"

// Payment processing
const { amount, currency } = formatForPaymentIntent(99, "IN");
// { amount: 826500, currency: 'inr' } - ready for Stripe
```

### Price Components

```typescript
// Simple price display
<PriceDisplay usdPrice={99} countryCode="IN" size="large" billingCycle="monthly" />

// Compare original vs discounted
<PriceComparison
  originalUsdPrice={99}
  discountedUsdPrice={79}
  countryCode="IN"
  showSavings={true}
/>

// Currency badge
<CurrencyBadge countryCode="IN" size="large" />
```

## Backend Endpoint

Your backend now has `/api/country/detect` endpoint:

```bash
GET https://jeeva-admin-portal.vollskick.replit.dev/api/country/detect

Response:
{
  "countryCode": "IN",
  "countryName": "India",
  "currency": "inr",
  "currencySymbol": "₹",
  "exchangeRate": 83.5,
  "paymentProvider": "stripe"
}
```

## Supported Countries

| Country   | Code | Currency | Symbol | Rate |
| --------- | ---- | -------- | ------ | ---- |
| USA       | US   | usd      | $      | 1.00 |
| UK        | GB   | gbp      | £      | 0.79 |
| India     | IN   | inr      | ₹      | 83.5 |
| Canada    | CA   | cad      | C$     | 1.36 |
| Australia | AU   | aud      | A$     | 1.53 |
| NZ        | NZ   | nzd      | NZ$    | 1.64 |
| Singapore | SG   | sgd      | S$     | 1.35 |
| UAE       | AE   | aed      | AED    | 3.67 |

## Payment Processing

All payments go through **Stripe only**:

```typescript
const { formatForPaymentIntent } = usePricing();

// For $99 subscription in India:
const { amount, currency } = formatForPaymentIntent(99);
// { amount: 826500, currency: "inr" }

// Send to Stripe:
const response = await fetch("/api/payments/create-payment-intent", {
  method: "POST",
  body: JSON.stringify({
    amountUSD: 99, // Base USD amount
    currency: currency, // 'inr'
    amount: amount, // 826500 (in paise)
    countryCode: "IN",
  }),
});
```

## Troubleshooting

### 403 Error (Old Setup)

- ❌ Old: `https://ipapi.co/json/` (external API)
- ✅ New: Calls backend `/api/country/detect`

### Currency Not Converting

- Check `countryCode` is in supported list
- Verify backend endpoint is running
- Use `CountryUtils` as fallback

### Payment Amount Wrong

- Always use `formatForPaymentIntent()` for Stripe
- It handles currency conversion automatically
- Amount is in cents/smallest unit

## Example: Complete Subscription Screen

```typescript
import React from 'react'
import { View, Text } from 'react-native'
import { usePricing } from './hooks/usePricing'
import { PriceDisplay } from './components/PriceDisplay'

export function SubscriptionPlan() {
  const { formatPrice, countryCode, loading } = usePricing()

  if (loading) return <Text>Loading...</Text>

  return (
    <View>
      <Text>Selected: {countryCode}</Text>

      <PriceDisplay
        usdPrice={99}
        countryCode={countryCode}
        size="large"
        billingCycle="monthly"
      />

      <Text>Converted: {formatPrice(99)}</Text>
    </View>
  )
}
```

## Files Provided

1. ✅ **CountryDetection.ts** - Main detection hook (copy-paste replace)
2. ✅ **utils/currency.ts** - Currency formatting utilities
3. ✅ **components/PriceDisplay.tsx** - React Native UI components
4. ✅ **hooks/usePricing.ts** - Combined hook for easy usage
5. ✅ **STRIPE_ONLY_SETUP.md** - Complete architecture doc

All set! Your 403 error is fixed and mobile app is ready for payments. 🚀
