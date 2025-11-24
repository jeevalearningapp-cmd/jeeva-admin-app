# Stripe-Only Payment & Country-Based Currency Setup

## Overview
Jeeva Learning Platform now uses **Stripe globally** with automatic currency conversion based on the user's detected country. All course prices are defined in USD on the backend.

## Architecture

### Payment Gateway: Stripe Only
- **All payments**: Processed through Stripe
- **Base currency**: USD (stored on backend)
- **Currency conversion**: Calculated on frontend based on detected country
- **No dual gateway**: Razorpay removed (simplified architecture)

### Country Detection Strategy

#### Backend Endpoint: `/api/country/detect`
```
GET https://your-api.com/api/country/detect
Response: {
  countryCode: "US",
  countryName: "United States",
  currency: "usd",
  currencySymbol: "$",
  exchangeRate: 1,
  paymentProvider: "stripe"
}
```

**Detection Logic:**
1. Reads request headers from Cloudflare (cf-ipcountry)
2. Falls back to Replit headers if available
3. Defaults to "US" if detection fails
4. No 403 CORS errors - backend handles all geolocation

#### Supported Countries & Exchange Rates (USD base)
```
IN (India):           ₹83.5  ($10 = ₹835)
US (USA):             $1.00  (base)
GB (UK):              £0.79  ($10 = £7.90)
CA (Canada):          C$1.36 ($10 = C$13.60)
AU (Australia):       A$1.53 ($10 = A$15.30)
NZ (New Zealand):     NZ$1.64
SG (Singapore):       S$1.35
AE (UAE):             AED 3.67
```

## Frontend Implementation (Mobile App)

### Updated `useCountryDetection` Hook
```typescript
export function useCountryDetection() {
  const [country, setCountry] = useState<CountryInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    detectCountry()
  }, [])

  async function detectCountry() {
    try {
      setLoading(true)
      // Call your backend endpoint (NOT external IP lookup)
      const response = await fetch(
        'https://jeeva-admin-portal.vollskick.replit.dev/api/country/detect'
      )
      const data = await response.json()
      setCountry(data)
    } catch (error) {
      console.error('Error detecting country:', error)
      // Default to US
      setDefaultCountry()
    } finally {
      setLoading(false)
    }
  }

  function setDefaultCountry() {
    setCountry({
      countryCode: 'US',
      countryName: 'United States',
      currency: 'usd',
      currencySymbol: '$',
      exchangeRate: 1,
      paymentProvider: 'stripe',
    })
  }

  function convertPrice(usdPrice: number, countryCode?: string): number {
    const cc = countryCode || country?.countryCode || 'US'
    const rate = country?.exchangeRate || 1
    return Math.round(usdPrice * rate * 100) / 100
  }

  function formatPrice(usdPrice: number, countryCode?: string): string {
    const converted = convertPrice(usdPrice, countryCode)
    const symbol = country?.currencySymbol || '$'
    return `${symbol}${converted}`
  }

  return {
    country,
    loading,
    convertPrice,
    formatPrice,
  }
}
```

### Payment Integration Steps

1. **Detect country** on app load:
   ```typescript
   const { country, loading } = useCountryDetection()
   ```

2. **Convert USD price** to user's currency:
   ```typescript
   const displayPrice = useCountryDetection().formatPrice(10) // $10 or ₹835 or £7.90
   ```

3. **Create Stripe payment** with converted amount:
   ```typescript
   // Always send base USD amount + currency to backend
   const response = await fetch('/api/payments/create-payment-intent', {
     method: 'POST',
     body: JSON.stringify({
       amountUSD: 10, // $10 USD
       currency: country?.currency, // "usd" or "inr" or "gbp"
       countryCode: country?.countryCode,
     })
   })
   ```

4. **Stripe processes payment** in user's currency automatically

## Backend Payment Processing

### Payment Creation Endpoint
```typescript
POST /api/payments/create-payment-intent
{
  amountUSD: 10,
  currency: "inr",
  countryCode: "IN",
  userId: "user-uuid",
  planId: "plan-uuid"
}
```

**Backend Logic:**
1. Calculate converted amount: `10 * 83.5 = 835`
2. Create Stripe PaymentIntent with:
   - Amount: 835 (in smallest currency unit, e.g., paise for INR)
   - Currency: "inr"
   - Metadata: { baseAmount: 10, baseCurrency: "usd", countryCode: "IN" }
3. Return clientSecret to mobile app

### Webhook Processing
- Stripe sends webhooks with converted amount
- Backend stores both `baseAmount` (USD) and `convertedAmount` (local currency)
- All reporting shows USD amounts (normalized)

## Database Schema

### payments table
```sql
amount_usd DECIMAL(10, 2),          -- Base USD amount
amount_converted DECIMAL(10, 2),    -- User's local currency
currency VARCHAR(3),                -- 'usd', 'inr', 'gbp', etc.
country_code VARCHAR(2),            -- 'US', 'IN', 'GB', etc.
stripe_payment_id VARCHAR(255),     -- Stripe ID
status VARCHAR(50),                 -- 'pending', 'completed', 'failed'
```

## Testing

### Test Payments by Country
- **USD (US)**: $10.00
- **INR (IN)**: ₹835.00
- **GBP (UK)**: £7.90
- **CAD (CA)**: C$13.60

### Test Endpoint
```bash
curl https://jeeva-admin-portal.vollskick.replit.dev/api/country/detect
# Returns user's detected country and rates
```

## Error Handling

### If Country Detection Fails
- Defaults to US pricing ($)
- User can manually select country in settings
- No 403 CORS errors (backend handles detection)

### If Currency Conversion Fails
- Falls back to USD pricing
- User notified: "Currency conversion unavailable, showing USD price"

## Migration from Dual Gateway (Old Setup)

### Removed
- Razorpay integration
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` secrets
- Country-based routing logic (IN → Razorpay, others → Stripe)
- Mobile app country routing logic

### Updated
- Exchange rates maintained in backend
- Country detection via backend (not external APIs)
- All payments go through Stripe with currency codes

### Environment Variables
Keep only:
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLIC_KEY` (for mobile)

Remove:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- Any country routing logic

## Analytics & Reporting

### Revenue Reporting (Normalized to USD)
- All revenue reports show `amount_usd`
- Exchange rates used for conversion are stored with each transaction
- Easy to track actual vs. converted amounts

### Example Query
```sql
SELECT 
  EXTRACT(MONTH FROM created_at) as month,
  currency,
  COUNT(*) as transactions,
  SUM(amount_usd) as revenue_usd,
  SUM(amount_converted) as revenue_local
FROM payments
WHERE status = 'completed'
GROUP BY month, currency
```

## Checklist for Mobile Team

- [ ] Update `useCountryDetection` hook to call `/api/country/detect`
- [ ] Remove all Razorpay imports and logic
- [ ] Update payment creation to use Stripe only
- [ ] Test payments in multiple countries (US, UK, India, Australia)
- [ ] Verify currency conversion displays correctly
- [ ] Remove `RAZORPAY_KEY_*` from environment
- [ ] Add `STRIPE_PUBLIC_KEY` to mobile config
- [ ] Update payment webhook handling (Stripe only)
- [ ] Test 403 CORS error is fixed (using backend endpoint)
- [ ] Update docs to reflect Stripe-only architecture
