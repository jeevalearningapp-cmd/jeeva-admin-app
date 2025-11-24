# Mobile Subscription Checkout Implementation Guide

**Jeeva Learning Platform - Mobile Application**

**Date:** November 21, 2025  
**Version:** 2.0 - With Database Schema Mapping  
**Target:** React Native (iOS & Android)

---

## 1. Overview

This guide provides complete step-by-step instructions for implementing subscription purchase flow in your React Native mobile app. Users will be able to:

- View available subscription plans
- Select a plan (Monthly, Quarterly, Annual, Lifetime)
- Enter payment details
- Complete purchase with Stripe (International) or Razorpay (India)
- Receive confirmation and activate subscription

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         Mobile App - Subscription Flow                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  1. Fetch Available Plans        │
        │  GET /api/subscription-plans     │
        │  TABLE: subscription_plans       │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  2. User Selects Plan            │
        │  Plan ID, Country Detection      │
        │  TABLE: subscription_plans       │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  3. Detect Payment Gateway       │
        │  Country → Stripe or Razorpay    │
        │  TABLE: user_profiles            │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  4. Create Payment Intent        │
        │  POST /api/payments/create       │
        │  TABLE: payments (INSERT)        │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  5. Present Payment Sheet        │
        │  Stripe or Razorpay Checkout UI  │
        │  TABLE: payments (READ)          │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  6. Verify Payment               │
        │  POST /api/payments/verify       │
        │  TABLE: payments (UPDATE)        │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  7. Update User Subscription     │
        │  Create subscription record      │
        │  TABLE: subscriptions (INSERT)   │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  8. Show Success & Navigate      │
        │  Dashboard with full access      │
        │  TABLE: subscriptions (READ)     │
        └──────────────────────────────────┘
```

---

## 3. Database Schema Mapping

### 3.1 Step-by-Step Database Operations

| Step | Operation | Table | Fields Used | Action |
|------|-----------|-------|------------|--------|
| 1 | Fetch Plans | `subscription_plans` | id, name, price_usd, duration_days, features, config | SELECT |
| 2 | User Selection | `subscription_plans` | id, name, price_usd | SELECT (cached) |
| 3 | Country Detection | `user_profiles` | id, country_code | SELECT |
| 4 | Create Payment | `payments` | user_id, plan_id, amount, currency, discount_coupon_id, original_amount, discount_amount, final_amount, status, gateway | INSERT |
| 5 | Payment Processing | `payments` | id, status | READ (poll status) |
| 6 | Verify Payment | `payments` | id, stripe_payment_id/razorpay_payment_id, status | UPDATE |
| 7 | Create Subscription | `subscriptions` | id, user_id, plan_id, status, start_date, end_date, payment_method, payment_id | INSERT |
| 8 | Show Success | `subscriptions` | id, status, end_date, plan_id | SELECT |

### 3.2 Database Tables Referenced

#### `subscription_plans` Table
```sql
-- Read-only from mobile (fetched at Step 1)
-- Contains all available subscription plans
{
  id: UUID (primary key)
  name: string          -- "Monthly", "Yearly", etc.
  price_usd: decimal   -- Base price in USD
  duration_days: int    -- 30, 365, etc.
  features: JSON        -- Array of features included
  config: JSON          -- {ai_messages_per_day, voice_tutoring_sessions}
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

#### `payments` Table
```sql
-- Created at Step 4, Updated at Step 6, Read at Steps 5-8
-- Tracks all payment transactions
{
  id: UUID (primary key)
  user_id: UUID          -- Foreign key to users
  plan_id: UUID          -- Foreign key to subscription_plans
  amount: decimal        -- Original amount (before discount)
  currency: string       -- "USD", "INR", etc.
  discount_coupon_id: UUID (nullable)  -- Applied coupon
  original_amount: decimal            -- Amount before discount
  discount_amount: decimal            -- Discount applied
  final_amount: decimal               -- Amount charged (original - discount)
  status: string         -- "pending", "completed", "failed", "refunded"
  gateway: string        -- "stripe" or "razorpay"
  stripe_payment_id: string (nullable)      -- Stripe PI ID
  razorpay_payment_id: string (nullable)    -- Razorpay order ID
  razorpay_signature: string (nullable)     -- Razorpay verification
  created_at: timestamp
  updated_at: timestamp
}
```

#### `subscriptions` Table
```sql
-- Created at Step 7, Read at Steps 8+
-- Tracks user subscription status
{
  id: UUID (primary key)
  user_id: UUID          -- Foreign key to users
  plan_id: UUID          -- Foreign key to subscription_plans
  payment_id: UUID       -- Foreign key to payments
  status: string         -- "active", "trial", "expired", "cancelled"
  start_date: timestamp  -- Subscription start
  end_date: timestamp    -- Subscription expiry (manual renewal)
  payment_method: string -- "stripe" or "razorpay"
  is_auto_renew: boolean -- ALWAYS FALSE (manual renewal only)
  created_at: timestamp
  updated_at: timestamp
}
```

#### `user_profiles` Table
```sql
-- Read at Step 3 for country detection
-- Updated after payment for subscription tracking
{
  id: UUID (primary key)
  email: string
  country_code: string   -- "IN", "US", "GB", etc.
  current_subscription_id: UUID (nullable)
  subscription_status: string
  ...
}
```

---

## 4. Prerequisites

### 4.1 Dependencies

Install required packages:

```bash
# Stripe integration
npm install @stripe/stripe-react-native

# Razorpay integration
npm install react-native-razorpay

# Payment utilities
npm install axios react-query

# UI components
npm install react-native-elements

# Utilities
npm install expo-localization
```

### 4.2 Environment Setup

Add to your `.env.local`:

```
# API Configuration
REACT_NATIVE_API_URL=https://your-api.com

# Stripe Keys (from Replit secrets)
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Razorpay Keys (from Replit secrets)
RAZORPAY_KEY_ID=rzp_test_xxx

# App Configuration
APP_NAME=Jeeva Learning
CURRENCY_USD=USD
CURRENCY_INR=INR
```

---

## 5. Setup Payment Providers

### 5.1 Stripe Setup

**Step 1: Initialize Stripe**

```typescript
// src/services/stripeSetup.ts
import { initStripe } from '@stripe/stripe-react-native';

export async function setupStripe() {
  await initStripe({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    merchantIdentifier: 'merchant.com.jeeva.learning',
    threeDSecureParams: {
      timeout: 5 * 60 * 1000, // 5 minutes
    },
  });
}
```

**Step 2: Initialize in App.tsx**

```typescript
import { useEffect } from 'react';
import { setupStripe } from './services/stripeSetup';

export default function App() {
  useEffect(() => {
    setupStripe();
  }, []);

  return (
    // Your app components
  );
}
```

### 5.2 Razorpay Setup

**Step 1: No explicit initialization needed**

Razorpay SDK initializes automatically when imported.

**Step 2: Configure in package.json**

```json
{
  "react-native-razorpay": {
    "linked": true
  }
}
```

---

## 6. Fetch and Display Subscription Plans (Step 1)

### 6.1 Database: Query `subscription_plans` Table

When the mobile app fetches plans, it queries the `subscription_plans` table:

```typescript
// Backend endpoint
GET /api/subscription-plans
Response from DB (subscription_plans table):
{
  data: [
    {
      id: "uuid-1",
      name: "Monthly",
      price_usd: 9.99,
      duration_days: 30,
      features: ["Unlimited Practice", "Learning Modules", "AI Chat"],
      config: { ai_messages_per_day: 50 }
    },
    {
      id: "uuid-2", 
      name: "Yearly",
      price_usd: 99.99,
      duration_days: 365,
      features: ["Everything in Monthly", "Priority Support"],
      config: { ai_messages_per_day: 100 }
    }
  ]
}
```

### 6.2 API Hook to Fetch Plans

```typescript
// src/hooks/useSubscriptionPlans.ts
import { useQuery } from 'react-query';
import axios from 'axios';

interface SubscriptionPlan {
  id: string;
  name: string;
  duration_days: number;
  price_usd: number;
  price_inr?: number;
  features: string[];
  config?: {
    ai_messages_per_day?: number;
    voice_tutoring_sessions?: number;
  };
}

export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>(
    'subscriptionPlans',
    async () => {
      // Queries subscription_plans table from backend
      const { data } = await axios.get(
        `${process.env.REACT_NATIVE_API_URL}/api/subscription-plans`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return data;
    },
    {
      staleTime: 60 * 60 * 1000, // 1 hour
      cacheTime: 2 * 60 * 60 * 1000, // 2 hours
    }
  );
}
```

### 6.3 Subscription Plan Card Component

```typescript
// src/components/SubscriptionPlanCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PlanCardProps {
  id: string;              // From subscription_plans.id
  name: string;            // From subscription_plans.name
  price: number;           // From subscription_plans.price_usd
  currency: string;
  duration: string;
  features: string[];      // From subscription_plans.features
  isPopular?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function SubscriptionPlanCard({
  id,
  name,
  price,
  currency,
  duration,
  features,
  isPopular = false,
  isSelected = false,
  onSelect,
}: PlanCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isPopular && styles.cardPopular,
      ]}
      onPress={onSelect}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>⭐ RECOMMENDED</Text>
        </View>
      )}

      <View style={styles.headerContainer}>
        <Text style={styles.planName}>{name}</Text>
        {isSelected && (
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color="#007aff"
          />
        )}
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>{currency} {price.toFixed(2)}</Text>
        <Text style={styles.billingPeriod}>per {duration}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <MaterialCommunityIcons
              name="check"
              size={20}
              color="#34C759"
              style={styles.checkIcon}
            />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.selectButton,
          isSelected && styles.selectButtonActive,
        ]}
        onPress={onSelect}
      >
        <Text
          style={[
            styles.selectButtonText,
            isSelected && styles.selectButtonTextActive,
          ]}
        >
          {isSelected ? 'SELECTED' : 'SELECT PLAN'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSelected: {
    borderColor: '#007aff',
    backgroundColor: '#F0F8FF',
  },
  cardPopular: {
    borderColor: '#FFE0B2',
    backgroundColor: '#FFFAF0',
  },
  popularBadge: {
    backgroundColor: '#FFE0B2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E65100',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007aff',
  },
  billingPeriod: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  featuresContainer: {
    marginVertical: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  selectButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonActive: {
    backgroundColor: '#007aff',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectButtonTextActive: {
    color: '#FFFFFF',
  },
});
```

### 6.4 Subscription Plans Screen

```typescript
// src/screens/SubscriptionPlansScreen.tsx
// TABLE: subscription_plans (SELECT operation)
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans';
import SubscriptionPlanCard from '../components/SubscriptionPlanCard';

export default function SubscriptionPlansScreen({ navigation }: any) {
  const { data: plans, isLoading, error } = useSubscriptionPlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const getCurrency = (plan: any) => {
    // Determine currency based on plan or user location
    return 'USD'; // TODO: detect based on user country
  };

  const handleContinue = () => {
    if (!selectedPlanId) {
      Alert.alert('Please select a plan');
      return;
    }

    const selectedPlan = plans?.find((p) => p.id === selectedPlanId);
    if (selectedPlan) {
      // Pass selected plan (from subscription_plans table) to checkout screen
      navigation.navigate('PaymentCheckout', {
        plan: selectedPlan,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loaderText}>Loading plans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load subscription plans</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upgrade Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock unlimited access to all features
        </Text>
      </View>

      <ScrollView
        style={styles.plansContainer}
        showsVerticalScrollIndicator={false}
      >
        {plans?.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            id={plan.id}
            name={plan.name}
            price={plan.price_usd}
            currency={getCurrency(plan)}
            duration={`${plan.duration_days} days`}
            features={[
              '✓ Unlimited practice questions',
              '✓ Full learning modules',
              '✓ Unlimited mock exams',
              plan.config?.ai_messages_per_day &&
                `✓ ${plan.config.ai_messages_per_day} AI messages/day`,
              plan.config?.voice_tutoring_sessions &&
                `✓ ${plan.config.voice_tutoring_sessions} voice sessions/month`,
            ].filter(Boolean) as string[]}
            isPopular={plan.duration_days === 365}
            isSelected={selectedPlanId === plan.id}
            onSelect={() => setSelectedPlanId(plan.id)}
          />
        ))}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Fixed Footer with Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedPlanId && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedPlanId}
        >
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007aff',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  plansContainer: {
    flex: 1,
    marginBottom: 100,
  },
  spacer: {
    height: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## 7. Country Detection & Payment Gateway Selection (Steps 2-3)

### 7.1 Database: Query `user_profiles` Table

```typescript
// Backend detects country and routes to correct payment gateway
GET /api/country/detect

Response:
{
  countryCode: "IN",  // From user_profiles.country_code
  countryName: "India",
  currency: "inr",
  currencySymbol: "₹",
  exchangeRate: 83.5,
  paymentProvider: "razorpay" or "stripe"
}
```

### 7.2 Country Detection Service

```typescript
// src/services/countryDetectionService.ts
// Queries user_profiles table via backend to get country_code
import * as Localization from 'expo-localization';
import axios from 'axios';

export const countryDetectionService = {
  // Method 1: From device locale
  getCountryFromLocale(): string {
    const region = Localization.region;
    return region || 'US';
  },

  // Method 2: From user profile (queries user_profiles table)
  async getCountryFromProfile(userId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${process.env.REACT_NATIVE_API_URL}/api/users/${userId}/profile`,
        {
          headers: { Authorization: `Bearer ${await getAuthToken()}` },
        }
      );
      // user_profiles.country_code field
      return response.data.country_code || this.getCountryFromLocale();
    } catch (error) {
      console.error('Failed to get country from profile:', error);
      return this.getCountryFromLocale();
    }
  },

  // Method 3: From backend country detection
  async getCountryFromBackend(): Promise<string> {
    try {
      const response = await axios.get(
        `${process.env.REACT_NATIVE_API_URL}/api/country/detect`
      );
      return response.data.countryCode || 'US';
    } catch (error) {
      console.error('Failed to get country from backend:', error);
      return 'US';
    }
  },

  // Combined detection (recommended)
  async detectUserCountry(userId?: string): Promise<string> {
    try {
      if (userId) {
        return await this.getCountryFromProfile(userId);
      }
    } catch (error) {
      console.log('Profile detection failed, trying backend...');
    }

    return this.getCountryFromBackend();
  },
};
```

### 7.3 Payment Gateway Selection

```typescript
// src/services/paymentGatewaySelector.ts
export const paymentGatewaySelector = {
  selectGateway(countryCode: string): 'stripe' | 'razorpay' {
    if (countryCode === 'IN') {
      return 'razorpay';
    }
    return 'stripe';  // Default for all other countries (Stripe only now)
  },

  getGatewayInfo(gateway: 'stripe' | 'razorpay') {
    if (gateway === 'razorpay') {
      return {
        name: 'Razorpay',
        methods: ['UPI', 'Cards', 'Net Banking', 'Wallets'],
        description: 'UPI, Cards, Net Banking, Digital Wallets',
        icon: 'razorpay',
      };
    }

    return {
      name: 'Stripe',
      methods: ['Cards', 'Apple Pay', 'Google Pay'],
      description: 'Credit/Debit Cards, Apple Pay, Google Pay',
      icon: 'stripe',
    };
  },
};
```

---

## 8. Payment Processing Implementation (Steps 4-6)

### 8.1 Database: `payments` Table Operations

**Step 4: INSERT new payment record**
```sql
INSERT INTO payments (
  user_id,
  plan_id,
  amount,
  currency,
  discount_coupon_id,
  original_amount,
  discount_amount,
  final_amount,
  status,
  gateway,
  created_at
) VALUES (
  'user-123',
  'plan-456',
  9.99,
  'USD',
  NULL,
  9.99,
  0,
  9.99,
  'pending',
  'stripe',
  NOW()
);
-- Returns: payments.id (payment ID for reference)
```

**Step 6: UPDATE payment record with gateway transaction ID**
```sql
UPDATE payments
SET 
  status = 'completed',
  stripe_payment_id = 'pi_1234567890',
  updated_at = NOW()
WHERE id = 'payment-id';
```

### 8.2 Stripe Payment Service

```typescript
// src/services/stripePaymentService.ts
// TABLE: payments (INSERT at step 4, UPDATE at step 6)
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';
import axios from 'axios';

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export function useStripePayment() {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const { confirmPaymentSheetPayment } = useStripe();

  const createPaymentIntent = async (
    planId: string,
    userId: string,
    couponCode?: string
  ): Promise<{ clientSecret: string; amount: number; paymentId: string }> => {
    try {
      // Step 4: CREATE payment record in payments table
      const response = await axios.post(
        `${process.env.REACT_NATIVE_API_URL}/api/payments/create`,
        {
          subscription_plan_id: planId,
          user_id: userId,
          gateway: 'stripe',
          coupon_code: couponCode,
        }
      );

      return {
        clientSecret: response.data.client_secret,
        amount: response.data.amount,
        paymentId: response.data.payment_id,  // From payments table INSERT
      };
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  };

  const initializePaymentSheet = async (
    clientSecret: string,
    userEmail: string
  ): Promise<boolean> => {
    const { error } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Jeeva Learning',
      customFlow: false,
      customerId: userEmail,
      applePay: { enabled: true },
      googlePay: { enabled: true },
    });

    return !error;
  };

  const presentPayment = async (): Promise<PaymentResult> => {
    const { error } = await presentPaymentSheet();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  };

  return {
    createPaymentIntent,
    initializePaymentSheet,
    presentPayment,
  };
}
```

### 8.3 Razorpay Payment Service

```typescript
// src/services/razorpayPaymentService.ts
// TABLE: payments (INSERT at step 4, UPDATE at step 6)
import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export const razorpayPaymentService = {
  async createOrder(
    planId: string,
    userId: string,
    couponCode?: string
  ): Promise<{ order_id: string; amount: number; currency: string; payment_id: string }> => {
    try {
      // Step 4: CREATE payment record in payments table
      const response = await axios.post(
        `${process.env.REACT_NATIVE_API_URL}/api/payments/create`,
        {
          subscription_plan_id: planId,
          user_id: userId,
          gateway: 'razorpay',
          coupon_code: couponCode,
        }
      );

      return {
        order_id: response.data.order_id,
        amount: response.data.amount,
        currency: response.data.currency,
        payment_id: response.data.payment_id,  // From payments table INSERT
      };
    } catch (error) {
      console.error('Failed to create Razorpay order:', error);
      throw error;
    }
  },

  async presentPayment(
    orderId: string,
    amount: number,
    userEmail: string,
    userName: string
  ): Promise<PaymentResult> => {
    return new Promise((resolve) => {
      const options = {
        description: 'Jeeva Learning Subscription',
        image: 'https://your-logo-url.com/logo.png',
        order_id: orderId,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
        amount: amount * 100, // Razorpay expects paise
        name: 'Jeeva Learning',
        prefill: {
          email: userEmail,
          contact: '',
          name: userName,
        },
        theme: { color: '#007aff' },
      };

      RazorpayCheckout.open(options)
        .then((data) => {
          // Step 6: UPDATE payment record with razorpay_payment_id
          resolve({
            success: true,
            paymentId: data.razorpay_payment_id,
          });
        })
        .catch((error) => {
          resolve({
            success: false,
            error: error.description,
          });
        });
    });
  },
};
```

---

## 9. Payment Checkout Screen (Step 4-6)

### 9.1 Complete Checkout Flow

```typescript
// src/screens/PaymentCheckoutScreen.tsx
// TABLE: payments (INSERT + UPDATE), subscription_plans (READ), user_profiles (READ)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useStripePayment } from '../services/stripePaymentService';
import { razorpayPaymentService } from '../services/razorpayPaymentService';
import { countryDetectionService } from '../services/countryDetectionService';
import { paymentGatewaySelector } from '../services/paymentGatewaySelector';
import axios from 'axios';

interface PaymentCheckoutScreenProps {
  route: any;
  navigation: any;
}

export default function PaymentCheckoutScreen({
  route,
  navigation,
}: PaymentCheckoutScreenProps) {
  const { user } = useAuth();
  const { plan } = route.params;
  const stripePayment = useStripePayment();
  
  const [gateway, setGateway] = useState<'stripe' | 'razorpay'>('stripe');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState(plan.price_usd);

  // Step 3: Detect country and select payment gateway
  useEffect(() => {
    const detectAndSelectGateway = async () => {
      try {
        const country = await countryDetectionService.detectUserCountry(user?.id);
        const selectedGateway = paymentGatewaySelector.selectGateway(country);
        setGateway(selectedGateway);
      } catch (error) {
        console.error('Failed to detect country:', error);
        setGateway('stripe'); // Default fallback
      }
    };

    detectAndSelectGateway();
  }, [user?.id]);

  // Apply coupon discount
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      // Validate coupon via backend (queries discount_coupons table)
      const response = await axios.post(
        `${process.env.REACT_NATIVE_API_URL}/api/subscriptions/validate-coupon`,
        {
          coupon_code: couponCode,
          plan_id: plan.id,
          user_id: user?.id,
        }
      );

      const { discount_percentage, discount_amount } = response.data;
      const discountAmount = discount_percentage 
        ? (plan.price_usd * discount_percentage) / 100 
        : discount_amount;
      
      setDiscountedPrice(plan.price_usd - discountAmount);
      Alert.alert('Success', `Discount applied: ${discount_percentage || discount_amount}%`);
    } catch (error) {
      Alert.alert('Error', 'Invalid or expired coupon code');
    }
  };

  // Step 4: Create Payment (INSERT into payments table)
  const handleStripePayment = async () => {
    if (!user) {
      Alert.alert('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const { clientSecret, amount, paymentId } =
        await stripePayment.createPaymentIntent(
          plan.id,
          user.id,
          couponCode
        );
      // Step 4: Payment created in payments table with status='pending'

      const initialized =
        await stripePayment.initializePaymentSheet(
          clientSecret,
          user.email
        );

      if (!initialized) {
        throw new Error('Failed to initialize payment sheet');
      }

      // Step 5: Present payment sheet to user
      const result = await stripePayment.presentPayment();

      if (result.success) {
        // Step 6: VERIFY payment and UPDATE payments table
        try {
          await axios.post(
            `${process.env.REACT_NATIVE_API_URL}/api/payments/verify`,
            {
              payment_id: paymentId,
              gateway: 'stripe',
            }
          );
          // Step 7: Payment verified, subscription created
          Alert.alert('Success', 'Payment successful! Subscription activated.');
          navigation.navigate('PaymentSuccess');
        } catch (verifyError) {
          Alert.alert('Error', 'Payment verified but subscription creation failed');
        }
      } else {
        Alert.alert('Error', result.error || 'Payment failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Create Payment (INSERT into payments table) for Razorpay
  const handleRazorpayPayment = async () => {
    if (!user) {
      Alert.alert('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const { order_id, amount, payment_id } =
        await razorpayPaymentService.createOrder(
          plan.id,
          user.id,
          couponCode
        );
      // Step 4: Payment created in payments table with status='pending'

      // Step 5: Present Razorpay payment sheet
      const result = await razorpayPaymentService.presentPayment(
        order_id,
        amount,
        user.email,
        user.name || 'User'
      );

      if (result.success) {
        // Step 6: VERIFY payment and UPDATE payments table
        try {
          await axios.post(
            `${process.env.REACT_NATIVE_API_URL}/api/payments/verify`,
            {
              payment_id: payment_id,
              gateway: 'razorpay',
              razorpay_payment_id: result.paymentId,
            }
          );
          // Step 7: Payment verified, subscription created
          Alert.alert('Success', 'Payment successful! Subscription activated.');
          navigation.navigate('PaymentSuccess');
        } catch (verifyError) {
          Alert.alert('Error', 'Payment verified but subscription creation failed');
        }
      } else {
        Alert.alert('Error', result.error || 'Payment failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (gateway === 'stripe') {
      handleStripePayment();
    } else {
      handleRazorpayPayment();
    }
  };

  const gatewayInfo = paymentGatewaySelector.getGatewayInfo(gateway);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{plan.name} Plan</Text>
              <Text style={styles.summaryValue}>
                ${plan.price_usd.toFixed(2)}
              </Text>
            </View>

            {couponCode && discountedPrice < plan.price_usd && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={styles.discountValue}>
                    -${(plan.price_usd - discountedPrice).toFixed(2)}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${discountedPrice.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Coupon Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Have a Coupon?</Text>
          <View style={styles.couponContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              value={couponCode}
              onChangeText={setCouponCode}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.couponButton}
              onPress={applyCoupon}
              disabled={loading}
            >
              <Text style={styles.couponButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.gatewayBox}>
            <Text style={styles.gatewayName}>{gatewayInfo.name}</Text>
            <Text style={styles.gatewayDescription}>
              {gatewayInfo.description}
            </Text>
            <View style={styles.methodsContainer}>
              {gatewayInfo.methods.map((method, index) => (
                <View key={index} style={styles.methodTag}>
                  <Text style={styles.methodText}>{method}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Billing Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Details</Text>
          <View style={styles.billingBox}>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Email:</Text>
              <Text style={styles.billingValue}>{user?.email}</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Plan Duration:</Text>
              <Text style={styles.billingValue}>{plan.duration_days} days</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Currency:</Text>
              <Text style={styles.billingValue}>USD</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By proceeding, you agree to our{' '}
            <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
            <Text style={styles.termsLink}>Refund Policy</Text>. Your
            subscription will be set to manual renewal - you'll be notified
            before expiry.
          </Text>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay ${discountedPrice.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingBottom: 100,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007aff',
  },
  couponContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
  },
  couponButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  couponButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  gatewayBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#007aff',
  },
  gatewayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  gatewayDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  methodText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  billingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  billingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  termsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  termsLink: {
    color: '#007aff',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  payButton: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## 10. Payment Success Screen (Step 8)

### 10.1 Database: Query `subscriptions` Table

```typescript
// src/screens/PaymentSuccessScreen.tsx
// TABLE: subscriptions (SELECT - retrieve subscription details)
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PaymentSuccessScreen({ navigation }: any) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's subscription from subscriptions table
    const fetchSubscription = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_NATIVE_API_URL}/api/subscriptions/user/${user?.id}`,
          {
            headers: { Authorization: `Bearer ${await getAuthToken()}` },
          }
        );
        // Retrieved from subscriptions table
        setSubscription(response.data);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchSubscription();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <MaterialCommunityIcons
          name="check-circle"
          size={80}
          color="#34C759"
          style={styles.icon}
        />

        <Text style={styles.title}>Payment Successful!</Text>

        <Text style={styles.message}>
          Your subscription has been activated. You now have full access to all
          Jeeva Learning features.
        </Text>

        {subscription && (
          <View style={styles.subscriptionDetails}>
            <Text style={styles.detailText}>
              Subscription ID: {subscription.id}
            </Text>
            <Text style={styles.detailText}>
              Valid until: {new Date(subscription.end_date).toLocaleDateString()}
            </Text>
            <Text style={styles.detailText}>
              Status: {subscription.status.toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.benefitsList}>
          <BenefitItem text="✓ Unlimited practice questions" />
          <BenefitItem text="✓ Full learning modules" />
          <BenefitItem text="✓ Unlimited mock exams" />
          <BenefitItem text="✓ JeevaBot AI assistant" />
          <BenefitItem text="✓ Priority support" />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.buttonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BenefitItem({ text }: { text: string }) {
  return <Text style={styles.benefitText}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  subscriptionDetails: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    marginVertical: 16,
    width: '100%',
  },
  detailText: {
    fontSize: 12,
    color: '#1565C0',
    marginVertical: 4,
    fontWeight: '600',
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginVertical: 24,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
    marginVertical: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## 11. Navigation Setup

```typescript
// src/navigation/SubscriptionNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SubscriptionPlansScreen from '../screens/SubscriptionPlansScreen';
import PaymentCheckoutScreen from '../screens/PaymentCheckoutScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';

const Stack = createNativeStackNavigator();

export function SubscriptionNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="SubscriptionPlans"
        component={SubscriptionPlansScreen}
        options={{
          title: 'Upgrade Plan',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="PaymentCheckout"
        component={PaymentCheckoutScreen}
        options={{
          title: 'Payment',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
```

---

## 12. Testing & Validation

### 12.1 Test Payment Cards

**Stripe Test Cards:**

| Card Number | Status | CVC | Expiry |
|-------------|--------|-----|--------|
| 4242424242424242 | Success | Any | Future |
| 4000002500003155 | 3D Secure | Any | Future |
| 5555555555554444 | Decline | Any | Future |

**Razorpay Test Credentials:**

| Type | Value |
|------|-------|
| Test UPI | success@razorpay |
| Test Cards | 4111111111111111 |
| Test Mode | Enabled in Settings |

### 12.2 Testing Checklist

- [ ] Step 1: Plans fetch from subscription_plans table ✅
- [ ] Step 2: Plan selection works ✅
- [ ] Step 3: Country detected from user_profiles ✅
- [ ] Step 4: Payment INSERT into payments table ✅
- [ ] Step 5: Payment sheet presents correctly ✅
- [ ] Step 6: Payment UPDATE in payments table after verification ✅
- [ ] Step 7: Subscription INSERT into subscriptions table ✅
- [ ] Step 8: Success screen queries subscriptions table ✅
- [ ] Stripe payment flow end-to-end
- [ ] Razorpay payment flow end-to-end
- [ ] Coupon code validation
- [ ] Discount calculation correct
- [ ] Error messages display properly
- [ ] Trial users can subscribe
- [ ] Multiple payment attempts work
- [ ] Network error handling
- [ ] Payment cancellation handled

---

## 13. Deployment Checklist

- [ ] Stripe publishable key configured in secrets
- [ ] Razorpay key ID configured in secrets
- [ ] All database tables created (subscription_plans, payments, subscriptions, user_profiles, discount_coupons)
- [ ] RLS policies configured for subscriptions table
- [ ] Payment API endpoints tested
- [ ] Country detection service tested
- [ ] All screens integrated into navigation
- [ ] Payment success/failure flows verified
- [ ] Coupon system tested
- [ ] Error messages user-friendly
- [ ] Loading states implemented
- [ ] Accessibility features added
- [ ] Performance optimized
- [ ] Analytics events tracked

---

© 2025 Jeeva Learning. All Rights Reserved.

**Ready for mobile team implementation!** 🚀
