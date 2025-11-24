# Backend Payment API Reference - Mobile App Integration

**Jeeva Learning Platform**  
**For React Native / Expo Mobile Developers**  
**Last Updated:** November 24, 2025

---

## 📱 Quick Start

**Base URL:** `https://your-domain.replit.dev` (or your custom domain)  
**API Version:** 1.0  
**Content-Type:** `application/json`

---

## 🔑 Authentication

All payment endpoints require the **user's unique ID** to be sent in the request body:
```json
{
  "userId": "user_uuid"
}
```

The user must be authenticated in your mobile app before making payment requests.

---

## 📋 API Endpoints

### 1. Get Payment Configuration

**Endpoint:** `GET /api/payments/config`

Get public keys for Stripe and Razorpay (needed for client-side initialization).

**Request:**
```bash
curl https://your-domain.replit.dev/api/payments/config
```

**Response (200):**
```json
{
  "stripe": {
    "publishableKey": "pk_test_51234567890abcdef"
  },
  "razorpay": {
    "keyId": "rzp_test_1234567890abcd"
  }
}
```

**Error (500):**
```json
{
  "error": "Failed to fetch configuration"
}
```

---

### 2. Create Payment (Step 1: Initiate Payment)

**Endpoint:** `POST /api/payments/create`

Initialize a payment for a subscription plan. This endpoint:
- Validates the subscription plan
- Applies discount coupons (if provided)
- Detects country based on `countryCode`
- Routes to **Stripe** (International) or **Razorpay** (India)
- Returns payment credentials

**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "subscriptionPlanId": "plan_monthly_01",
  "countryCode": "IN",
  "discountCouponCode": "WELCOME10",
  "metadata": {
    "appVersion": "1.0.0",
    "deviceId": "device_123"
  }
}
```

**Required Fields:**
- `userId` (string, UUID) - User's unique identifier
- `subscriptionPlanId` (string) - Plan ID from `/api/subscription-plans`
- `countryCode` (string) - ISO country code (IN, GB, US, etc.)

**Optional Fields:**
- `discountCouponCode` (string) - Discount code for the plan
- `metadata` (object) - Additional tracking info

**Response (Razorpay - India, 200):**
```json
{
  "paymentId": "pay_550e8400-e29b-41d4-a716-446655440000",
  "orderId": "order_DBJOWzybf0sJbb",
  "amount": 79900,
  "currency": "INR",
  "gateway": "razorpay",
  "subscriptionPlanId": "plan_monthly_01",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "planDetails": {
    "name": "Monthly Plan",
    "price": 799,
    "duration_days": 30,
    "features": ["Unlimited Practice", "AI Assistant"]
  }
}
```

**Response (Stripe - International, 200):**
```json
{
  "paymentId": "pay_550e8400-e29b-41d4-a716-446655440001",
  "clientSecret": "pi_1234567890abcdef_secret_1234567890",
  "amount": 9999,
  "currency": "USD",
  "gateway": "stripe",
  "subscriptionPlanId": "plan_monthly_01",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "planDetails": {
    "name": "Monthly Plan",
    "price": 99.99,
    "duration_days": 30,
    "features": ["Unlimited Practice", "AI Assistant"]
  }
}
```

**Error Responses (400, 500):**
```json
{
  "error": "Missing required fields: userId, subscriptionPlanId, countryCode"
}
```

```json
{
  "error": "Subscription plan not found"
}
```

```json
{
  "error": "Discount coupon expired or invalid"
}
```

---

### 3. Verify Payment (Step 2: Confirm Payment Success)

**Endpoint:** `POST /api/payments/verify`

After user completes payment in Stripe/Razorpay UI, verify the payment on your backend.

#### For Razorpay Payments:

**Request:**
```json
{
  "paymentId": "pay_550e8400-e29b-41d4-a716-446655440000",
  "gateway": "razorpay",
  "razorpayOrderId": "order_DBJOWzybf0sJbb",
  "razorpayPaymentId": "pay_1234567890abcdef",
  "razorpaySignature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

#### For Stripe Payments:

**Request:**
```json
{
  "paymentId": "pay_550e8400-e29b-41d4-a716-446655440001",
  "gateway": "stripe",
  "stripePaymentIntentId": "pi_1234567890abcdef"
}
```

**Required Fields:**
- `paymentId` (string) - From the create payment response
- `gateway` (string) - "razorpay" or "stripe"

**Gateway-Specific Fields:**

For **Razorpay**:
- `razorpayOrderId` - Order ID from payment gateway
- `razorpayPaymentId` - Payment ID from gateway
- `razorpaySignature` - Signature for verification

For **Stripe**:
- `stripePaymentIntentId` - Payment Intent ID from Stripe

**Success Response (200):**
```json
{
  "success": true,
  "subscriptionId": "sub_550e8400-e29b-41d4-a716-446655440000",
  "subscriptionStatus": "active",
  "expiresAt": "2025-12-24T10:30:00Z",
  "message": "Payment verified and subscription activated"
}
```

**Error Responses (400, 500):**
```json
{
  "error": "Missing required fields: paymentId, gateway"
}
```

```json
{
  "error": "Payment verification failed: Invalid signature"
}
```

```json
{
  "error": "Payment not found or already processed"
}
```

---

### 4. Process Refund

**Endpoint:** `POST /api/payments/refund`

Request a refund for a completed payment (admin/superadmin only).

**Request:**
```json
{
  "paymentId": "pay_550e8400-e29b-41d4-a716-446655440000",
  "amount": 9999,
  "reason": "User requested refund",
  "refundedBy": "admin_uuid"
}
```

**Required Fields:**
- `paymentId` (string) - Payment ID to refund
- `refundedBy` (string) - Admin user ID authorizing the refund

**Optional Fields:**
- `amount` (number) - Refund amount (partial refund). If not provided, full refund
- `reason` (string) - Refund reason for records

**Success Response (200):**
```json
{
  "refundId": "ref_550e8400-e29b-41d4-a716-446655440000",
  "paymentId": "pay_550e8400-e29b-41d4-a716-446655440000",
  "amount": 9999,
  "status": "processed",
  "gateway": "stripe",
  "createdAt": "2025-11-24T10:30:00Z"
}
```

**Error Responses:**
```json
{
  "error": "Payment not found or already refunded"
}
```

---

## 🔄 Payment Flow Diagram

```
┌─────────────────┐
│  Mobile App     │
└────────┬────────┘
         │
         │ 1. GET /api/payments/config
         ├──────────────────────────────►  Backend
         │                                  │
         │ 2. POST /api/payments/create     │
         ├──────────────────────────────►  ├─► Validate Plan
         │                                  ├─► Apply Coupon
         │  Returns: orderId or            ├─► Route to Gateway
         │           clientSecret          │
         │  ◄─────────────────────────────┤
         │
         │ 3. Open Stripe/Razorpay UI
         │    (Native SDK)
         ├──► User enters payment details
         │
         │ 4. User confirms payment
         │    Gateway processes ✓
         │
         │ 5. POST /api/payments/verify
         ├──────────────────────────────►  Backend
         │    (with payment proof)          │
         │                                  ├─► Verify Signature
         │  Returns: success & sub ID       ├─► Activate Subscription
         │  ◄─────────────────────────────┤
         │
         │ 6. Navigate to Success Screen
         └─────────────────────────────────
```

---

## 💻 React Native Code Examples

### Install Dependencies

```bash
npm install @stripe/stripe-react-native @react-native-async-storage/async-storage
npm install razorpay
```

### Setup Environment

```typescript
// config/api.ts
export const API_BASE_URL = 'https://your-domain.replit.dev'

export const paymentAPI = {
  config: `${API_BASE_URL}/api/payments/config`,
  create: `${API_BASE_URL}/api/payments/create`,
  verify: `${API_BASE_URL}/api/payments/verify`,
  refund: `${API_BASE_URL}/api/payments/refund`,
}
```

### Get Payment Configuration

```typescript
// hooks/usePaymentConfig.ts
import { useState, useEffect } from 'react'
import { paymentAPI } from '@/config/api'

export function usePaymentConfig() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    try {
      const response = await fetch(paymentAPI.config)
      const data = await response.json()
      setConfig(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return { config, loading, error }
}
```

### Initiate Payment (Razorpay - India)

```typescript
// services/razorpayPayment.ts
import RazorpayCheckout from 'react-native-razorpay'
import { paymentAPI } from '@/config/api'

export async function initiateRazorpayPayment(
  userId: string,
  planId: string,
  config: any
) {
  try {
    // Step 1: Create payment on backend
    const createResponse = await fetch(paymentAPI.create, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subscriptionPlanId: planId,
        countryCode: 'IN',
      }),
    })

    const paymentData = await createResponse.json()

    if (!createResponse.ok) {
      throw new Error(paymentData.error || 'Failed to create payment')
    }

    // Step 2: Open Razorpay checkout
    const options = {
      description: paymentData.planDetails.name,
      image: 'https://your-logo-url.png',
      currency: paymentData.currency,
      key_id: config.razorpay.keyId,
      amount: paymentData.amount,
      order_id: paymentData.orderId,
      name: 'Jeeva Learning',
      prefill: {
        email: 'user@example.com', // Get from user profile
        contact: '9876543210', // Get from user profile
      },
      theme: { color: '#007aff' },
    }

    return new Promise((resolve, reject) => {
      RazorpayCheckout.open(options)
        .then((data) => {
          // Payment successful in UI, verify on backend
          verifyRazorpayPayment(paymentData.paymentId, data).then(resolve).catch(reject)
        })
        .catch((error) => {
          reject(new Error(`Payment cancelled: ${error.code}`))
        })
    })
  } catch (error) {
    console.error('Razorpay payment error:', error)
    throw error
  }
}

async function verifyRazorpayPayment(paymentId: string, paymentResult: any) {
  const verifyResponse = await fetch(paymentAPI.verify, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentId,
      gateway: 'razorpay',
      razorpayOrderId: paymentResult.razorpay_order_id,
      razorpayPaymentId: paymentResult.razorpay_payment_id,
      razorpaySignature: paymentResult.razorpay_signature,
    }),
  })

  const verifyData = await verifyResponse.json()

  if (!verifyResponse.ok) {
    throw new Error(verifyData.error || 'Payment verification failed')
  }

  return verifyData
}
```

### Initiate Payment (Stripe - International)

```typescript
// services/stripePayment.ts
import { useStripe } from '@stripe/stripe-react-native'
import { paymentAPI } from '@/config/api'

export function useStripePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  async function initiateStripePayment(
    userId: string,
    planId: string,
    stripePublishableKey: string
  ) {
    try {
      // Step 1: Create payment on backend
      const createResponse = await fetch(paymentAPI.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscriptionPlanId: planId,
          countryCode: 'GB', // Adjust based on user location
        }),
      })

      const paymentData = await createResponse.json()

      if (!createResponse.ok) {
        throw new Error(paymentData.error || 'Failed to create payment')
      }

      // Step 2: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Jeeva Learning',
        paymentIntentClientSecret: paymentData.clientSecret,
        allowsDelayedPaymentMethods: false,
      })

      if (initError) {
        throw initError
      }

      // Step 3: Present payment sheet to user
      const { error: presentError } = await presentPaymentSheet()

      if (presentError) {
        throw presentError
      }

      // Step 4: Verify payment on backend
      const verifyResponse = await fetch(paymentAPI.verify, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: paymentData.paymentId,
          gateway: 'stripe',
          stripePaymentIntentId: paymentData.clientSecret.split('_secret')[0],
        }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Payment verification failed')
      }

      return verifyData
    } catch (error) {
      console.error('Stripe payment error:', error)
      throw error
    }
  }

  return { initiateStripePayment }
}
```

### Complete Subscription Component

```typescript
// screens/SubscriptionScreen.tsx
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useAuth } from '@/context/AuthContext'
import { usePaymentConfig } from '@/hooks/usePaymentConfig'
import { initiateRazorpayPayment } from '@/services/razorpayPayment'
import { useStripePayment } from '@/services/stripePayment'

export function SubscriptionScreen() {
  const { user } = useAuth()
  const { config, loading: configLoading } = usePaymentConfig()
  const { initiateStripePayment } = useStripePayment()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (planId: string) => {
    if (!user?.id || !config) return

    setLoading(true)
    try {
      // Determine country and route to appropriate payment gateway
      const userCountry = 'IN' // Get from user profile or geolocation

      if (userCountry === 'IN') {
        // Route to Razorpay
        const result = await initiateRazorpayPayment(user.id, planId, config)
        Alert.alert('Success', 'Subscription activated!')
        // Navigate to dashboard
      } else {
        // Route to Stripe
        const result = await initiateStripePayment(user.id, planId, config.stripe.publishableKey)
        Alert.alert('Success', 'Subscription activated!')
        // Navigate to dashboard
      }
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (configLoading) {
    return <ActivityIndicator size="large" />
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => handleSubscribe('plan_monthly_01')}
        disabled={loading}
      >
        <Text>{loading ? 'Processing...' : 'Subscribe Now'}</Text>
      </TouchableOpacity>
    </View>
  )
}
```

---

## 🧪 Testing

### Test Credentials

**Razorpay Test Cards:**
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
OTP: 123456
```

**Stripe Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Test Payment Flow

1. **Create Test Plan in Admin Portal**
   - Go to Subscriptions → Plans
   - Create a plan with price ₹100 or $1 for easy testing

2. **Test in Development**
   - Use test payment credentials above
   - Check backend logs: `npm run logs`
   - Verify payment in Supabase: `payments` table

3. **Verify Backend Working**
   ```bash
   curl -X GET https://your-domain.replit.dev/api/payments/config
   ```

---

## ⚠️ Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid publishable key" | Stripe key misconfigured | Check `STRIPE_PUBLISHABLE_KEY` in backend |
| "Signature verification failed" | Payment integrity issue | Ensure correct gateway secret in backend |
| "Plan not found" | Invalid plan ID | Verify plan exists in admin portal |
| "User not authenticated" | Missing userId | Ensure user is logged in before payment |
| "Network timeout" | Backend unreachable | Check backend is running and CORS enabled |

### Implement Error Boundary

```typescript
async function withErrorHandling(fn: () => Promise<any>) {
  try {
    return await fn()
  } catch (error: any) {
    if (error.message.includes('Network')) {
      throw new Error('Network error. Please check your connection.')
    }
    if (error.message.includes('Signature')) {
      throw new Error('Payment verification failed. Please contact support.')
    }
    throw error
  }
}
```

---

## 🔒 Security Best Practices

1. **Never expose secrets** - Keep `STRIPE_SECRET_KEY` and `RAZORPAY_SECRET` on backend only
2. **Validate user ID** - Ensure userId matches authenticated user before processing
3. **Verify signatures** - Always verify payment signatures from gateways
4. **Use HTTPS only** - Never make API calls over HTTP
5. **Token refresh** - Refresh auth tokens before payment initiation
6. **Rate limiting** - Implement rate limiting on payment endpoints

---

## 📊 Response Status Codes

| Code | Meaning | Retry? |
|------|---------|--------|
| 200 | Success | No |
| 400 | Bad request (missing fields) | No |
| 404 | Resource not found | No |
| 500 | Server error | Yes (with exponential backoff) |

---

## 📞 Support

**For API Issues:**
1. Check backend logs: View in Replit console
2. Test endpoint: Use Postman or curl
3. Verify credentials: Check env vars in Replit secrets

**For Payment Issues:**
- Stripe: https://stripe.com/docs
- Razorpay: https://razorpay.com/docs

---

**Version:** 1.0  
**Last Updated:** November 24, 2025  
**Status:** Production Ready ✅
