# Implementation Plan

- [x] 1. Fix default currency to GBP
  - [x] 1.1 Update CountryDetection.ts default country to GB
    - Change `setDefaultCountry()` function to use 'GB' instead of 'US'
    - Update default currency to 'gbp' and symbol to '£'
    - Update `CountryUtils.getSymbol()` and `CountryUtils.getCurrency()` fallbacks to use 'gbp'
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 Update usePricing.ts default country code
    - Change default countryCode from 'US' to 'GB' in the hook
    - _Requirements: 1.3_
  - [x] 1.3 Update currency.ts fallback currency
    - Change fallback currency in `formatForPaymentIntent()` from 'USD' to 'GBP'
    - _Requirements: 1.4_
  - [x] 1.4 Write property test for default currency
    - **Property 1: Default Currency is GBP**
    - **Validates: Requirements 1.1, 1.2, 1.4**

- [x] 2. Implement subscription activation after payment
  - [x] 2.1 Implement activateSubscription function in payment.ts
    - Query subscription record by ID
    - Query subscription_plan to get billing_cycle
    - Calculate end_date based on billing_cycle (30 days monthly, 365 days yearly)
    - Update subscription status to 'active', set start_date, end_date, last_payment_date
    - Calculate and set next_payment_date for recurring subscriptions
    - _Requirements: 2.1, 2.2, 2.3, 3.2, 3.3_
  - [x] 2.2 Update user_profiles subscription_status
    - After subscription activation, update user_profiles.subscription_status to 'active'
    - _Requirements: 2.4_
  - [x] 2.3 Write property test for subscription activation
    - **Property 3: Subscription Activation Updates Status**
    - **Validates: Requirements 2.1**
  - [x] 2.4 Write property test for end date calculation
    - **Property 4: End Date Calculation Correctness**
    - **Validates: Requirements 2.3**

- [x] 3. Link payments to subscriptions
  - [x] 3.1 Create subscription record before payment
    - Modify createPayment to create a subscription record first
    - Link payment to subscription via subscription_id
    - _Requirements: 3.1_
  - [x] 3.2 Write property test for payment-subscription linkage
    - **Property 5: Payment-Subscription Linkage**
    - **Validates: Requirements 3.1**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
