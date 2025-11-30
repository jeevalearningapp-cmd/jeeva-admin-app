# Payment Gateway & Subscriptions Implementation Guide

**Document Version:** 1.0  
**Date:** November 30, 2025  
**Status:** Implementation Ready  
**Platform:** React Native / Expo + Express Backend  
**Payment Provider:** Stripe

---

## Table of Contents
1. [Overview](#overview)
2. [Subscription Plans](#subscription-plans)
3. [Location Detection & Currency](#location-detection--currency)
4. [Payment Flow Architecture](#payment-flow-architecture)
5. [Stripe Setup for Expo](#stripe-setup-for-expo)
6. [API Endpoints](#api-endpoints)
7. [Implementation Details](#implementation-details)
8. [Error Handling](#error-handling)

---

## Overview

### Payment Philosophy
- **Location-Aware Pricing** - Detect user location before showing prices
- **Multi-Currency Support** - Display prices in user's local currency
- **One-Time Purchases** - No recurring charges (manual renewal only)
- **Tax Included** - Automatic GST (India) and VAT (UK) calculation
- **Seamless Conversion** - Trial users → Instant upgrade with one tap

### Supported Countries & Currencies
| Country | Currency | Tax | Min Amount |
|---------|----------|-----|-----------|
| India | INR (₹) | 18% GST | ₹100 |
| UK | GBP (£) | 20% VAT | £1 |
| Other | USD ($) | 0% | $2 |

### Subscription Plans (One-Time)

| Plan | Duration | INR | GBP | USD | Features |
|------|----------|-----|-----|-----|----------|
| **Starter** | 30 days | ₹3,000 | £25 | $34 | Practice + Learning + Materials |
| **Growth** | 90 days | ₹8,000 | £68 | $90 | Starter + Mock Exams + Analytics |
| **Ultimate** | 150 days | ₹15,000 | £127 | $168 | Growth + JeevaBot + Personal Plan |

---

## Location Detection & Currency

### Step 1: Detect User Location

**Service:** Expo Location API + IP Geolocation

```typescript
// services/locationService.ts
import * as Location from 'expo-location'
import axios from 'axios'

export const detectUserLocation = async () => {
  try {
    // Method 1: Device GPS (most accurate)
    const { status } = await Location.requestForegroundPermissionsAsync()
    
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync()
      const { latitude, longitude } = location.coords

      // Reverse geocode to get country
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      })

      if (geocode?.[0]?.country) {
        return geocode[0].country // e.g., 'India', 'United Kingdom'
      }
    }

    // Method 2: IP Geolocation (fallback)
    const ipLocation = await getIPLocation()
    return ipLocation.country

  } catch (error) {
    // Default to USD if detection fails
    return 'United States'
  }
}

// Helper: Get country from IP
const getIPLocation = async () => {
  try {
    // Using ipapi.co (free, no API key needed)
    const response = await axios.get('https://ipapi.co/json/')
    return {
      country: response.data.country_name,
      currency: response.data.currency_code,
      countryCode: response.data.country_code,
    }
  } catch (error) {
    return {
      country: 'United States',
      currency: 'USD',
      countryCode: 'US',
    }
  }
}
```

### Step 2: Map Location to Currency & Tax

```typescript
// services/currencyService.ts
export const CURRENCY_CONFIG = {
  'India': {
    currency: 'INR',
    symbol: '₹',
    countryCode: 'IN',
    tax: 0.18, // 18% GST
    prices: {
      starter: 3000,
      growth: 8000,
      ultimate: 15000,
    },
  },
  'United Kingdom': {
    currency: 'GBP',
    symbol: '£',
    countryCode: 'GB',
    tax: 0.20, // 20% VAT
    prices: {
      starter: 25,
      growth: 68,
      ultimate: 127,
    },
  },
  'Default': {
    currency: 'USD',
    symbol: '$',
    countryCode: 'US',
    tax: 0, // No automatic tax
    prices: {
      starter: 34,
      growth: 90,
      ultimate: 168,
    },
  },
}

export const getCurrencyConfig = (country: string) => {
  return CURRENCY_CONFIG[country] || CURRENCY_CONFIG['Default']
}

export const calculatePriceWithTax = (
  basePrice: number,
  taxRate: number
): { base: number; tax: number; total: number } => {
  const tax = basePrice * taxRate
  return {
    base: basePrice,
    tax,
    total: basePrice + tax,
  }
}
```

---

## Payment Flow Architecture

### User Journey
```
Trial User on Dashboard
    ↓
Clicks "Upgrade Now" or Plan Card
    ↓
Location Detection (silent)
    ↓
Currency Conversion (display local prices)
    ↓
Plan Selection Screen
    ├── Starter Plan (30 days)
    ├── Growth Plan (90 days)
    └── Ultimate Plan (150 days)
    ↓
Review Order Screen
    ├── Plan name & duration
    ├── Base price
    ├── Tax amount
    └── Total amount
    ↓
Payment Method Selection
    ├── Card
    ├── Apple Pay (iOS)
    └── Google Pay (Android)
    ↓
Stripe Payment Processing
    ├── Create Stripe Payment Intent
    ├── Confirm with client secret
    └── Handle 3D Secure (if needed)
    ↓
Success → Update user subscription
    ↓
Failed → Show error & retry option
```

---

## Stripe Setup for Expo

### 1. Installation

```bash
npm install @stripe/stripe-react-native expo-modules

# OR if using Expo Prebuild
eas build --platform ios --local
eas build --platform android --local
```

### 2. Initialization (App Entry Point)

```typescript
// app.tsx
import { StripeProvider } from '@stripe/stripe-react-native'

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY

export default function App() {
  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.jeeva.learning" // iOS
      threeDSecureParams={{
        timeout: 5 * 60 * 1000, // 5 minutes
      }}
    >
      {/* Your app navigation */}
    </StripeProvider>
  )
}
```

### 3. Environment Variables (.env)

```env
# Frontend
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
EXPO_PUBLIC_API_BASE_URL=https://your-api.com

# Backend (.env.local)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

---

## Payment Flow Component

### Complete Payment Integration

```typescript
// screens/SubscriptionPaymentScreen.tsx
import { useStripe, CardField, CardFieldInput } from '@stripe/stripe-react-native'
import { useQuery, useMutation } from '@tanstack/react-query'

export const SubscriptionPaymentScreen = ({ plan, country }) => {
  const { confirmPayment } = useStripe()
  const cardFieldRef = useRef<CardFieldInput>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get currency config based on country
  const currencyConfig = getCurrencyConfig(country)
  const priceWithTax = calculatePriceWithTax(
    currencyConfig.prices[plan],
    currencyConfig.tax
  )

  // Step 1: Create Payment Intent
  const { mutate: createPaymentIntent } = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          plan_id: plan,
          amount: Math.round(priceWithTax.total * 100), // Convert to cents
          currency: currencyConfig.currency.toLowerCase(),
          country: country,
          description: `${plan} Plan - ${currencyConfig.prices[plan]} ${currencyConfig.symbol}`,
        }),
      })

      if (!response.ok) throw new Error('Failed to create payment intent')
      return response.json()
    },
    onSuccess: (data) => {
      handlePayment(data.clientSecret)
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  // Step 2: Confirm Payment
  const handlePayment = async (clientSecret) => {
    setLoading(true)
    setError('')

    try {
      // Get card details
      const cardDetails = await cardFieldRef.current?.getDetails()

      if (!cardDetails) {
        setError('Please enter valid card details')
        setLoading(false)
        return
      }

      // Confirm payment with Stripe
      const { paymentIntent, error: stripeError } = await confirmPayment(
        clientSecret,
        {
          type: 'Card',
          billingDetails: {
            email: user.email,
            name: user.fullName,
            address: {
              country: currencyConfig.countryCode,
            },
          },
        }
      )

      if (stripeError) {
        setError(stripeError.message)
        return
      }

      if (paymentIntent?.status === 'Succeeded') {
        // Step 3: Update subscription in backend
        await updateSubscription({
          user_id: user.id,
          plan_id: plan,
          stripe_payment_intent_id: paymentIntent.id,
          status: 'active',
          expires_at: calculateExpiryDate(plan),
        })

        // Success - navigate to dashboard
        navigation.replace('Dashboard')
      }
    } catch (err) {
      setError('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView>
      {/* Order Summary */}
      <OrderSummaryCard
        plan={plan}
        basePrice={priceWithTax.base}
        tax={priceWithTax.tax}
        total={priceWithTax.total}
        currency={currencyConfig.symbol}
      />

      {/* Card Input */}
      <CardField
        ref={cardFieldRef}
        postalCodeEnabled={false}
        placeholder={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={{
          backgroundColor: '#EBEBEB',
          textColor: '#000000',
          fontSize: 16,
        }}
      />

      {/* Error Message */}
      {error && <ErrorAlert message={error} />}

      {/* Payment Button */}
      <Button
        label="Complete Payment"
        loading={loading}
        onPress={() => createPaymentIntent()}
        disabled={!cardFieldRef.current}
      />
    </ScrollView>
  )
}
```

---

## API Endpoints

### 1. Create Payment Intent

**Endpoint:** `POST /api/payments/create-intent`

**Purpose:** Initialize Stripe payment intent on server

**Request:**
```json
{
  "user_id": "uuid",
  "plan_id": "starter|growth|ultimate",
  "amount": 2500,
  "currency": "gbp",
  "country": "United Kingdom",
  "description": "Starter Plan - 30 days"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_xxxxxxxxxxxx",
    "publishableKey": "pk_live_xxxxxxxxxxxx",
    "amount": 2500,
    "currency": "gbp"
  }
}
```

**Backend Implementation:**
```typescript
// server/routes/payments.ts
app.post('/api/payments/create-intent', async (req, res) => {
  const { user_id, plan_id, amount, currency, country } = req.body

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Already in cents
      currency,
      metadata: {
        user_id,
        plan_id,
        country,
      },
      description: `${plan_id} subscription for ${country}`,
    })

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      },
    })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})
```

### 2. Confirm Payment & Update Subscription

**Endpoint:** `POST /api/subscriptions/activate`

**Purpose:** Confirm payment and activate user subscription

**Request:**
```json
{
  "user_id": "uuid",
  "plan_id": "starter",
  "stripe_payment_intent_id": "pi_1234567890",
  "amount": 2500,
  "currency": "gbp"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "uuid",
    "user_id": "uuid",
    "plan_id": "starter",
    "status": "active",
    "started_at": "2025-11-30T10:00:00Z",
    "expires_at": "2025-12-30T10:00:00Z",
    "plan_name": "Starter Plan",
    "plan_duration_days": 30
  }
}
```

**Backend Implementation:**
```typescript
app.post('/api/subscriptions/activate', async (req, res) => {
  const { user_id, plan_id, stripe_payment_intent_id, amount, currency } = req.body

  try {
    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(
      stripe_payment_intent_id
    )

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed',
      })
    }

    // Get plan details
    const planConfig = PLAN_CONFIG[plan_id]

    // Calculate expiry date
    const startedAt = new Date()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + planConfig.duration_days)

    // Create subscription in database
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id,
        plan_id,
        status: 'active',
        started_at: startedAt,
        expires_at: expiresAt,
        stripe_payment_intent_id,
        amount,
        currency,
      })
      .select()
      .single()

    if (error) throw error

    // Update user profile
    await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'active',
        subscription_plan_id: plan_id,
      })
      .eq('id', user_id)

    res.json({ success: true, data: subscription })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})
```

### 3. Get Available Plans

**Endpoint:** `GET /api/subscriptions/plans`

**Query Parameters:**
```
?country=United Kingdom
?currency=gbp
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "plan_id": "starter",
      "name": "Starter Plan",
      "duration_days": 30,
      "base_price": 25,
      "tax": 5,
      "total_price": 30,
      "currency": "gbp",
      "symbol": "£",
      "features": ["Practice MCQs", "Learning Content", "Email Support"]
    },
    {
      "plan_id": "growth",
      "name": "Growth Plan",
      "duration_days": 90,
      "base_price": 68,
      "tax": 13.6,
      "total_price": 81.6,
      "currency": "gbp",
      "symbol": "£",
      "features": ["All Starter", "Mock Exams", "Analytics", "Priority Support"]
    },
    {
      "plan_id": "ultimate",
      "name": "Ultimate Plan",
      "duration_days": 150,
      "base_price": 127,
      "tax": 25.4,
      "total_price": 152.4,
      "currency": "gbp",
      "symbol": "£",
      "features": ["All Growth", "JeevaBot", "Personal Study Plan"]
    }
  ]
}
```

### 4. Get User Subscription Status

**Endpoint:** `GET /api/subscriptions/:user_id`

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "uuid",
    "plan_id": "growth",
    "status": "active",
    "started_at": "2025-11-01T00:00:00Z",
    "expires_at": "2025-12-30T00:00:00Z",
    "days_remaining": 30,
    "is_expired": false,
    "auto_renewal": false,
    "stripe_customer_id": "cus_xxxxxxxxxxxx",
    "last_payment": {
      "amount": 8100,
      "currency": "gbp",
      "date": "2025-11-01T00:00:00Z"
    }
  }
}
```

### 5. Validate Subscription Access

**Endpoint:** `POST /api/subscriptions/validate-access`

**Purpose:** Check if user can access paid features

**Request:**
```json
{
  "user_id": "uuid",
  "feature": "mock_exam|jeevabot|analytics"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "has_access": true,
    "reason": "Active subscription",
    "plan_id": "ultimate",
    "expires_at": "2025-12-30T00:00:00Z"
  }
}
```

---

## Implementation Details

### Plan Configuration

```typescript
// config/plans.ts
export const PLAN_CONFIG = {
  starter: {
    id: 'prod_TW9ia1yVYrTLf9',
    name: 'Starter Plan',
    duration_days: 30,
    features: [
      'Practice MCQs',
      'Learning Content',
      'Basic Study Materials',
      'Email Support',
    ],
    access: {
      practice: true,
      learning: true,
      mock_exam: false,
      jeevabot: false,
      analytics: false,
    },
  },
  growth: {
    id: 'prod_TW9iUXDnA340NL',
    name: 'Growth Plan',
    duration_days: 90,
    features: [
      'All Starter',
      'Mock Exams',
      'Performance Analytics',
      'Priority Support',
      'Weekly Recommendations',
    ],
    access: {
      practice: true,
      learning: true,
      mock_exam: true,
      jeevabot: false,
      analytics: true,
    },
  },
  ultimate: {
    id: 'prod_TW9ix6XY2ikEzJ',
    name: 'Ultimate Plan',
    duration_days: 150,
    features: [
      'All Growth',
      'AI JeevaBot',
      'Priority Support',
      'Unlimited Questions',
      'Personalized Study Plan',
    ],
    access: {
      practice: true,
      learning: true,
      mock_exam: true,
      jeevabot: true,
      analytics: true,
    },
  },
}
```

### Subscription Access Control

```typescript
// hooks/useSubscriptionAccess.ts
export const useSubscriptionAccess = (feature: string) => {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAccess()
  }, [user?.id, feature])

  const checkAccess = async () => {
    try {
      const response = await fetch(
        `/api/subscriptions/validate-access`,
        {
          method: 'POST',
          body: JSON.stringify({
            user_id: user?.id,
            feature,
          }),
        }
      )

      const data = await response.json()
      setHasAccess(data.data.has_access)
    } finally {
      setLoading(false)
    }
  }

  return { hasAccess, loading }
}

// Usage in components
const MockExamScreen = () => {
  const { hasAccess, loading } = useSubscriptionAccess('mock_exam')

  if (!hasAccess) {
    return <UpgradePrompt feature="Mock Exams" />
  }

  return <MockExamContent />
}
```

---

## Error Handling

### Common Stripe Errors

| Error Code | Meaning | Handling |
|-----------|---------|----------|
| `card_declined` | Card was declined | Show "Card declined" + try another card |
| `incorrect_cvc` | Invalid CVC | Show "Incorrect CVC, try again" |
| `expired_card` | Card expired | Show "Card expired" + use different card |
| `processing_error` | Backend error | Retry or contact support |
| `rate_limit` | Too many requests | Show "Please wait before retrying" |

```typescript
// Error handler
const handleStripeError = (error) => {
  const errorMessages = {
    card_declined: 'Your card was declined. Please try another card.',
    incorrect_cvc: 'The CVC code is incorrect.',
    expired_card: 'Your card has expired.',
    processing_error: 'Payment processing failed. Please try again.',
    network_error: 'Network error. Check your connection.',
    authentication_required: '3D Secure verification required.',
  }

  return errorMessages[error.code] || 'Payment failed. Please try again.'
}
```

---

## Webhook Handling

### Stripe Webhook Events

```typescript
// server/webhooks/stripe.ts
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`)
  }
})
```

---

## Testing

### Test Card Numbers

| Card Number | Result | CVC | Date |
|-------------|--------|-----|------|
| 4242 4242 4242 4242 | Success | Any 3 digits | Future date |
| 4000 0000 0000 0002 | Declined | Any 3 digits | Future date |
| 4000 0025 0000 3155 | 3D Secure Required | Any 3 digits | Future date |

### Test Payment Flow

```typescript
// Test in sandbox mode
const testPaymentFlow = async () => {
  // 1. Detect location
  const country = await detectUserLocation() // Returns 'India' in test

  // 2. Get plans
  const plans = await fetch('/api/subscriptions/plans?country=' + country)

  // 3. Create payment intent
  const intent = await fetch('/api/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify({
      plan_id: 'starter',
      amount: 3000,
      currency: 'inr',
      country,
    }),
  })

  // 4. Confirm payment with test card
  const payment = await confirmPayment(intent.clientSecret, {
    type: 'Card',
    cardNumber: '4242424242424242',
    cvc: '123',
  })

  // 5. Verify subscription created
  const subscription = await fetch('/api/subscriptions/' + userId)
  console.assert(subscription.status === 'active')
}
```

---

## Stripe References

### Official Documentation
- **API Reference:** https://stripe.com/docs/api
- **Expo Integration:** https://stripe.com/docs/stripe-js/react-native
- **Payment Intent Guide:** https://stripe.com/docs/payments/accept-a-payment
- **3D Secure:** https://stripe.com/docs/payments/3d-secure

### Key Links
- **Dashboard:** https://dashboard.stripe.com
- **API Keys:** https://dashboard.stripe.com/apikeys
- **Webhooks:** https://dashboard.stripe.com/webhooks
- **Test Cards:** https://stripe.com/docs/testing

---

## Database Schema

### subscriptions table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  renewal_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Deployment Checklist

- [ ] Stripe account setup (production keys)
- [ ] Environment variables configured
- [ ] Webhook endpoint registered with Stripe
- [ ] Test payment flow end-to-end
- [ ] Error messaging reviewed
- [ ] Location detection tested across devices
- [ ] Currency conversion verified
- [ ] Tax calculation confirmed
- [ ] Receipt email working
- [ ] Analytics tracking implemented
- [ ] Refund policy documented
- [ ] Support contact provided

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Conversion Funnel**
   - Trial users who saw upgrade prompt: X%
   - Users who started payment: Y%
   - Successful payments: Z%

2. **Payment Failures**
   - Declined cards
   - 3D Secure required
   - Timeout errors

3. **Revenue**
   - Total revenue by currency
   - Average order value
   - Refund rate

4. **User Retention**
   - Subscription renewals
   - Churn rate
   - Upgrade from starter → growth

---

## Support & Troubleshooting

**API Issues:** Check Stripe Dashboard → Logs tab  
**Payment Test:** Use test card 4242 4242 4242 4242  
**Webhook Debug:** Enable webhook signing verification  
**Location Services:** Ensure permissions granted in app

---

## Future Enhancements

- [ ] Subscription auto-renewal option
- [ ] Flexible plan durations (7-day, 14-day)
- [ ] Promo codes & discounts
- [ ] Family plan sharing
- [ ] Payment history & invoice download
- [ ] Subscription pause option
- [ ] Upsell during quiz completion
