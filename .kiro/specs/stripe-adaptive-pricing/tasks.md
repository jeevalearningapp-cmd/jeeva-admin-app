# Implementation Plan

## Phase 1: Backend Foundation

- [x] 1. Database schema updates for presentment data
  - [x] 1.1 Create migration to add new columns to payments table
    - Add `stripe_checkout_session_id` TEXT column
    - Add `amount_charged_local` DECIMAL(12,2) column
    - Add `currency_charged_local` VARCHAR(3) column
    - Add `amount_charged_gbp` DECIMAL(12,2) column
    - Add `fx_rate_applied` DECIMAL(10,6) column
    - Add `country_detected` VARCHAR(2) column
    - _Requirements: 4.4_
  - [ ]* 1.2 Write property test for payment record presentment fields
    - **Property 9: Payment Record Presentment Fields**
    - **Validates: Requirements 4.1, 4.2, 4.4**

- [x] 2. Implement Checkout Session service
  - [x] 2.1 Add createCheckoutSession method to stripe.ts
    - Accept priceIdGbp, userId, customerEmail, successUrl, cancelUrl
    - Configure allow_promotion_codes: true
    - Include userId and subscriptionPlanId in metadata
    - Return sessionId and sessionUrl
    - _Requirements: 2.1, 2.2, 2.5_
  - [ ]* 2.2 Write property test for checkout session configuration
    - **Property 3: Checkout Session Configuration**
    - **Validates: Requirements 2.1, 2.2, 2.5, 6.1**

- [x] 3. Implement checkout.session.completed webhook handler
  - [x] 3.1 Add webhook handler for checkout.session.completed event
    - Extract sessionId, paymentIntentId, chargeId
    - Extract presentment currency and amount
    - Extract GBP amount from currency_conversion if present
    - Compute fx_rate from amounts
    - _Requirements: 2.3_
  - [x] 3.2 Store presentment data in payments table
    - Create payment record with all presentment fields
    - Link to subscription via metadata
    - _Requirements: 4.4_
  - [x] 3.3 Activate subscription on successful checkout
    - Query subscription by ID from metadata
    - Update status to 'active', set dates
    - Update user_profiles subscription_status
    - _Requirements: 2.4_
  - [ ]* 3.4 Write property test for webhook presentment data extraction
    - **Property 4: Webhook Presentment Data Extraction**
    - **Validates: Requirements 2.3, 4.4**
  - [ ]* 3.5 Write property test for subscription activation
    - **Property 5: Subscription Activation on Webhook**
    - **Validates: Requirements 2.4**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: API Routes

- [x] 5. Create checkout session API endpoint
  - [x] 5.1 Add POST /api/checkout/create-session route
    - Accept planPriceIdGbp, userId, successUrl, cancelUrl, customerEmail
    - Call stripeService.createCheckoutSession
    - Return session URL for redirect
    - _Requirements: 2.1_

- [x] 6. Implement GBP-only price enforcement
  - [x] 6.1 Update POST /api/stripe-admin/prices to enforce GBP currency
    - Validate currency === 'gbp' (case-insensitive)
    - Return 400 error with clear message for non-GBP currencies
    - _Requirements: 1.1, 1.3_
  - [ ]* 6.2 Write property test for GBP-only currency validation
    - **Property 1: GBP-Only Currency Validation**
    - **Validates: Requirements 1.1, 1.3**

- [x] 7. Implement catalog API endpoint
  - [x] 7.1 Add GET /api/stripe-admin/catalog route
    - Fetch active GBP prices from Stripe
    - Transform to CatalogPlan format (no country grouping)
    - Return plans array with required fields
    - _Requirements: 1.2, 1.4, 7.3_
  - [ ]* 7.2 Write property test for catalog response structure
    - **Property 2: Catalog Response Structure**
    - **Validates: Requirements 1.2, 1.4, 7.3**

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Analytics APIs

- [x] 9. Implement presentment summary analytics
  - [x] 9.1 Add GET /api/stripe-analytics/presentment-summary route
    - Accept range query param (default 30d)
    - Query payments table for currency distribution
    - Calculate percentages, averages, totals per currency
    - _Requirements: 3.1, 3.2_
  - [ ]* 9.2 Write property test for presentment percentage calculation
    - **Property 6: Presentment Percentage Calculation**
    - **Validates: Requirements 3.1**
  - [ ]* 9.3 Write property test for average amount calculation
    - **Property 7: Average Amount Calculation**
    - **Validates: Requirements 3.2**

- [x] 10. Implement coupon presentment analytics
  - [x] 10.1 Add GET /api/stripe-analytics/coupon-presentment route
    - Query payments with coupon codes
    - Group redemptions by presentment currency
    - Return counts per currency per coupon
    - _Requirements: 3.4, 6.3_
  - [ ]* 10.2 Write property test for coupon redemption grouping
    - **Property 8: Coupon Redemption Grouping**
    - **Validates: Requirements 3.4, 6.3**

- [x] 11. Implement revenue by currency analytics
  - [x] 11.1 Add GET /api/stripe-analytics/revenue-by-currency route
    - Query payments grouped by currency
    - Return local totals and GBP equivalents
    - _Requirements: 9.1, 9.2_
  - [ ]* 11.2 Write property test for revenue analytics completeness
    - **Property 12: Revenue Analytics Completeness**
    - **Validates: Requirements 9.1, 9.2**

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Coupon Validation Update

- [x] 13. Simplify coupon validation for Adaptive Pricing
  - [x] 13.1 Update coupon validation to check eligibility only
    - Remove amount-based validation logic
    - Check only: plan applicability, active status, max_redemptions
    - _Requirements: 6.2_
  - [ ]* 13.2 Write property test for coupon eligibility validation
    - **Property 11: Coupon Eligibility Validation**
    - **Validates: Requirements 6.2**

## Phase 5: Frontend - Payments Page

- [x] 14. Update PaymentsPage to show presentment data
  - [x] 14.1 Update payments API types to include presentment fields
    - Add stripeCheckoutSessionId, amountChargedLocal, currencyChargedLocal
    - Add amountChargedGbp, fxRateApplied
    - _Requirements: 4.1, 4.2_
  - [x] 14.2 Add presentment columns to payments table
    - Add "Paid (local)" column showing local amount and currency
    - Add "Base (GBP)" column showing GBP amount
    - Add "FX Rate" column
    - _Requirements: 4.1_
  - [x] 14.3 Add payment drill-down view
    - Show Checkout Session ID, Payment Intent ID, Charge ID
    - Link to Stripe dashboard
    - _Requirements: 4.3_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Frontend - Stripe Products Page

- [x] 16. Update StripeProductsPage for GBP-only
  - [x] 16.1 Disable multi-currency price creation
    - Remove INR/USD currency options from form
    - Set currency to GBP only (disabled field)
    - _Requirements: 7.2_
  - [x] 16.2 Add Adaptive Pricing warning banner
    - Display warning: "Do not create INR/USD Prices. Adaptive Pricing converts automatically."
    - _Requirements: 7.1_
  - [x] 16.3 Add Preview Adaptive Pricing button
    - Create test checkout session with test email
    - Open in new browser tab
    - _Requirements: 8.1, 8.2_

## Phase 7: Frontend - Subscription Plans Page

- [x] 17. Refactor SubscriptionPlansPage for tier-based display
  - [x] 17.1 Update to use new catalog API
    - Replace GET /api/stripe-admin/prices with GET /api/stripe-admin/catalog
    - Remove country-based grouping
    - Display plans by tier (Starter/Growth/Ultimate)
    - _Requirements: 1.2, 7.3_
  - [x] 17.2 Add presentment summary section
    - Fetch data from GET /api/stripe-analytics/presentment-summary
    - Display currency distribution percentages
    - Display average amounts per currency
    - _Requirements: 3.1, 3.2_

## Phase 8: Frontend - Students Page

- [x] 18. Enhance StudentsPage with payment currency info
  - [x] 18.1 Add last payment currency and amount to student display
    - Query last successful payment for student
    - Display currency and amount in student details
    - _Requirements: 5.1_
  - [x] 18.2 Add payment source indicator
    - Display "Payment source: Stripe Checkout"
    - _Requirements: 5.2_
  - [ ]* 18.3 Write property test for student payment display
    - **Property 10: Student Payment Display**
    - **Validates: Requirements 5.1**

## Phase 9: Frontend - Discount Coupons Page

- [x] 19. Add coupon analytics to DiscountCouponsPage
  - [x] 19.1 Add redemptions by currency section
    - Fetch data from GET /api/stripe-analytics/coupon-presentment
    - Display redemption counts grouped by INR/GBP/USD
    - _Requirements: 6.3_

- [x] 20. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
