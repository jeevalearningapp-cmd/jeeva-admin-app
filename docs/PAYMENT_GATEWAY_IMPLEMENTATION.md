# Payment Gateway Implementation Guide

## Overview

This guide covers the complete implementation of dual payment gateway system (Stripe + Razorpay) for the Jeeva Learning Platform.

**Key Features:**
- ✅ Smart routing: India → Razorpay, International → Stripe
- ✅ Integration with subscription plans, trials, and coupons
- ✅ One-time payments (subscriptions managed by app, not gateways)
- ✅ Admin portal for payment management
- ✅ Mobile app integration (React Native/Expo)
- ✅ Comprehensive webhook handling
- ✅ Refund support

---

## Architecture

### Payment Flow

```
User selects plan → 
App detects country → 
Routes to correct gateway →
Payment processed →
Webhook confirms →
Subscription activated
```

### Gateway Selection Logic

```typescript
function selectGateway(countryCode: string): PaymentGateway {
  return countryCode === 'IN' ? 'razorpay' : 'stripe'
}
```

### Database Schema

**Tables:**
- `payment_customers` - Gateway customer records
- `payment_methods` - Saved payment methods
- `payments` - Transaction records
- `payment_refunds` - Refund tracking
- `payment_webhook_events` - Webhook event log

---

## Setup Instructions

### 1. Deploy Database Migration

```bash
# Connect to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push the migration
supabase db push
```

The migration file `create_payment_system.sql` will create all necessary tables, enums, and functions.

### 2. Configure Environment Variables

**Required Secrets:**
- `STRIPE_SECRET_KEY` - From Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe Webhook settings
- `STRIPE_PUBLISHABLE_KEY` - Public key for frontend
- `RAZORPAY_KEY_ID` - From Razorpay Dashboard
- `RAZORPAY_KEY_SECRET` - Secret key
- `RAZORPAY_WEBHOOK_SECRET` - Webhook secret

**Add to Replit Secrets:**
```bash
# In Replit, go to Tools → Secrets
# Add each secret with its value
```

### 3. Install Dependencies

```bash
npm install stripe razorpay
```

---

## Backend Implementation

### Stripe Service (`server/services/stripe.ts`)

Key functions:
- `createPaymentIntent()` - Initiate payment
- `createCustomer()` - Create Stripe customer
- `verifyWebhook()` - Verify webhook signature
- `createRefund()` - Process refunds

### Razorpay Service (`server/services/razorpay.ts`)

Key functions:
- `createOrder()` - Create Razorpay order
- `createCustomer()` - Create Razorpay customer
- `verifySignature()` - Verify payment signature
- `createRefund()` - Process refunds

### Unified Payment Service (`server/services/payment.ts`)

Smart routing service that:
- Detects user's country
- Calculates pricing with discounts
- Routes to appropriate gateway
- Handles payment verification
- Updates subscription status

---

## API Endpoints

### Payment Creation
```
POST /api/payments/create
Body: {
  subscriptionPlanId: string
  discountCouponCode?: string
  countryCode: string
}
Response: {
  paymentId: string
  gateway: 'stripe' | 'razorpay'
  clientSecret?: string (Stripe)
  orderId?: string (Razorpay)
  amount: number
  currency: string
}
```

### Payment Verification
```
POST /api/payments/verify
Body: {
  paymentId: string
  gateway: 'stripe' | 'razorpay'
  // Stripe: paymentIntentId
  // Razorpay: orderId, paymentId, signature
}
Response: {
  success: boolean
  payment: Payment
  subscription: Subscription
}
```

### Webhooks
```
POST /api/webhooks/stripe
POST /api/webhooks/razorpay
```

---

## Mobile App Integration

### Stripe Integration (React Native/Expo)

**Install Dependencies:**
```bash
npx expo install @stripe/stripe-react-native
```

**Implementation:**
```tsx
import { StripeProvider, useStripe } from '@stripe/stripe-react-native'

export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <PaymentScreen />
    </StripeProvider>
  )
}

function PaymentScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe()
  
  const handlePayment = async () => {
    // 1. Create payment on backend
    const { clientSecret, paymentId } = await fetch('/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({
        subscriptionPlanId: plan.id,
        countryCode: 'US'
      })
    }).then(r => r.json())
    
    // 2. Initialize payment sheet
    await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Jeeva Learning'
    })
    
    // 3. Present payment sheet
    const { error } = await presentPaymentSheet()
    
    if (!error) {
      // 4. Verify payment
      await fetch('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          paymentId,
          gateway: 'stripe'
        })
      })
    }
  }
  
  return <Button onPress={handlePayment}>Pay Now</Button>
}
```

### Razorpay Integration (React Native)

**Install Dependencies:**
```bash
npm install react-native-razorpay
```

**Implementation:**
```tsx
import RazorpayCheckout from 'react-native-razorpay'

const handleRazorpayPayment = async () => {
  // 1. Create order on backend
  const { orderId, amount, currency } = await fetch('/api/payments/create', {
    method: 'POST',
    body: JSON.stringify({
      subscriptionPlanId: plan.id,
      countryCode: 'IN'
    })
  }).then(r => r.json())
  
  // 2. Open Razorpay checkout
  const options = {
    description: plan.name,
    currency,
    key: RAZORPAY_KEY_ID,
    amount: amount * 100, // paise
    order_id: orderId,
    name: 'Jeeva Learning',
    prefill: {
      email: user.email,
      contact: user.phone,
      name: user.name
    },
    theme: { color: '#007aff' }
  }
  
  try {
    const data = await RazorpayCheckout.open(options)
    
    // 3. Verify payment
    await fetch('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        paymentId: data.razorpay_payment_id,
        orderId: data.razorpay_order_id,
        signature: data.razorpay_signature,
        gateway: 'razorpay'
      })
    })
  } catch (error) {
    console.error('Payment failed:', error)
  }
}
```

### Smart Gateway Selection

```tsx
import * as Localization from 'expo-localization'

function getCountryCode(): string {
  // Method 1: From device locale
  const locale = Localization.locale // e.g., 'en-IN'
  const country = locale.split('-')[1] // 'IN'
  
  // Method 2: From user profile
  return user.countryCode || country || 'US'
}

function selectPaymentGateway(countryCode: string) {
  return countryCode === 'IN' ? 'razorpay' : 'stripe'
}

// In payment flow
const gateway = selectPaymentGateway(getCountryCode())

if (gateway === 'razorpay') {
  handleRazorpayPayment()
} else {
  handleStripePayment()
}
```

---

## Subscription Integration

### Pricing Calculation

```typescript
interface PricingDetails {
  plan: SubscriptionPlan
  coupon?: DiscountCoupon
  originalAmount: number
  discountAmount: number
  finalAmount: number
  currency: CurrencyCode
}

function calculatePricing(
  plan: SubscriptionPlan,
  couponCode?: string
): PricingDetails {
  const originalAmount = plan.price
  let discountAmount = 0
  let coupon: DiscountCoupon | undefined
  
  if (couponCode) {
    coupon = await getCouponByCode(couponCode)
    
    if (coupon && coupon.isActive) {
      if (coupon.discountType === 'percentage') {
        discountAmount = (originalAmount * coupon.discountValue) / 100
      } else if (coupon.discountType === 'fixed') {
        discountAmount = coupon.discountValue
      }
    }
  }
  
  const finalAmount = originalAmount - discountAmount
  
  return {
    plan,
    coupon,
    originalAmount,
    discountAmount,
    finalAmount,
    currency: plan.currency || 'USD'
  }
}
```

### Trial Period Handling

**Note:** Trials are managed by your app, not payment gateways.

```typescript
async function createSubscription(userId: string, planId: string) {
  const plan = await getSubscriptionPlan(planId)
  
  const subscription = {
    userId,
    planId,
    status: 'trialing', // Start in trial
    trialEndsAt: new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000),
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
  
  await supabase.from('subscriptions').insert(subscription)
}

// When payment succeeds, activate subscription
async function activateSubscription(subscriptionId: string) {
  await supabase
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('id', subscriptionId)
}
```

---

## Admin Portal Features

### Payment History Page

**Features:**
- List all payments with filters
- View payment details
- Process refunds
- Download transaction reports

**Location:** `src/pages/PaymentsPage.tsx`

**Key Components:**
- Payment list with DataGrid
- Payment details modal
- Refund dialog
- Filters (status, gateway, date range)

---

## Webhook Handling

### Stripe Webhooks

**Events to handle:**
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed

**Implementation:**
```typescript
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature']
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleStripePaymentSuccess(event.data.object)
        break
      case 'payment_intent.payment_failed':
        await handleStripePaymentFailure(event.data.object)
        break
    }
    
    res.json({ received: true })
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`)
  }
})
```

### Razorpay Webhooks

**Events to handle:**
- `payment.authorized` - Payment successful
- `payment.failed` - Payment failed
- `refund.processed` - Refund completed

**Implementation:**
```typescript
app.post('/api/webhooks/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature']
  
  try {
    const isValid = Razorpay.validateWebhookSignature(
      JSON.stringify(req.body),
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    )
    
    if (!isValid) {
      return res.status(400).send('Invalid signature')
    }
    
    const { event, payload } = req.body
    
    switch (event) {
      case 'payment.authorized':
        await handleRazorpayPaymentSuccess(payload.payment.entity)
        break
      case 'payment.failed':
        await handleRazorpayPaymentFailure(payload.payment.entity)
        break
    }
    
    res.json({ status: 'ok' })
  } catch (err) {
    res.status(500).send(`Webhook Error: ${err.message}`)
  }
})
```

---

## Testing

### Test Cards

**Stripe:**
- Success: `4242 4242 4242 4242`
- 3D Secure: `4000 0027 6000 3184`
- Declined: `4000 0000 0000 0002`

**Razorpay:**
- Success: `4111 1111 1111 1111`
- Failure: Use any incorrect CVV

### Webhook Testing

**Stripe CLI:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

**Razorpay:**
Use webhook simulator in Razorpay Dashboard

---

## Production Deployment Checklist

### Pre-Launch
- [ ] Deploy database migration
- [ ] Add production API keys to secrets
- [ ] Configure webhook URLs in dashboards
- [ ] Enable RLS policies
- [ ] Test payment flow end-to-end
- [ ] Test webhook delivery
- [ ] Set up error monitoring (Sentry)

### Stripe Setup
- [ ] Activate Stripe account
- [ ] Add business details
- [ ] Configure supported currencies
- [ ] Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
- [ ] Add India compliance (IEC code if applicable)

### Razorpay Setup
- [ ] Complete KYC verification
- [ ] Activate account
- [ ] Configure webhook: `https://your-domain.com/api/webhooks/razorpay`
- [ ] Test UPI, cards, net banking

### Compliance
- [ ] Add Terms of Service
- [ ] Add Refund Policy
- [ ] Add Privacy Policy (payment data handling)
- [ ] Enable PCI compliance (for Stripe)
- [ ] Set up proper receipt generation

---

## Error Handling

### Common Errors

**Card Declined:**
```typescript
if (error.code === 'card_declined') {
  showError('Your card was declined. Please try another payment method.')
}
```

**Insufficient Funds:**
```typescript
if (error.code === 'insufficient_funds') {
  showError('Insufficient funds. Please check your balance.')
}
```

**Network Errors:**
```typescript
try {
  await processPayment()
} catch (error) {
  if (error.type === 'network_error') {
    showError('Network error. Please check your connection.')
  }
}
```

---

## Support & Resources

**Stripe:**
- Docs: https://stripe.com/docs
- Dashboard: https://dashboard.stripe.com
- Test Mode: https://dashboard.stripe.com/test

**Razorpay:**
- Docs: https://razorpay.com/docs
- Dashboard: https://dashboard.razorpay.com
- Test Mode: Use test API keys

---

## Next Steps

1. Deploy database migration
2. Add API keys to secrets
3. Implement backend services
4. Create admin UI
5. Integrate with mobile app
6. Test thoroughly
7. Go live!

---

**Need Help?** Refer to the mobile integration guides in `docs/mobile-app-payment-gateway/`
