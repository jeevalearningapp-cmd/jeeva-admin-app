# Requirements Document

## Introduction

This document specifies the requirements for migrating the Jeeva Admin Portal from a multi-currency price management system to Stripe Adaptive Pricing. The current system manually manages prices in INR, GBP, and USD per subscription plan. The new system will use a single canonical GBP price per plan, with Stripe Checkout automatically handling foreign exchange (FX) conversion and local currency presentment. This migration transforms the admin portal from a "multi-currency price manager" to a "GBP catalog manager" with presentment analytics.

## Glossary

- **Adaptive Pricing**: Stripe feature that automatically converts prices to local currencies at checkout based on customer location
- **Presentment Currency**: The currency displayed and charged to the customer (e.g., INR, USD)
- **Settlement Currency**: The currency in which funds are deposited to the merchant account (GBP for Jeeva)
- **Canonical Price**: The single authoritative price in GBP from which all presentment amounts are derived
- **Checkout Session**: Stripe-hosted payment page that handles payment collection, FX conversion, and compliance
- **Payment Intent (PI)**: Stripe object representing a payment attempt
- **FX Rate**: Foreign exchange rate applied during currency conversion
- **Plan Tier**: Subscription level (Starter, Growth, Ultimate) independent of currency

## Requirements

### Requirement 1: GBP-Only Price Management

**User Story:** As an admin, I want to manage subscription plans with a single GBP price each, so that Stripe Adaptive Pricing can automatically handle currency conversion for international customers.

#### Acceptance Criteria

1. WHEN an admin creates a new subscription price THEN the System SHALL accept only GBP as the currency and reject requests with other currencies
2. WHEN an admin views the subscription catalog THEN the System SHALL display plans grouped by tier (Starter/Growth/Ultimate) with only the canonical GBP price shown
3. WHEN an admin attempts to create an INR or USD price THEN the System SHALL reject the request with an error message explaining that Adaptive Pricing handles currency conversion automatically
4. WHEN the catalog API is called THEN the System SHALL return plan data including planId, name, duration, stripe_price_id_gbp, unit_amount_gbp, and active status

### Requirement 2: Stripe Checkout Session Integration

**User Story:** As a developer, I want to replace PaymentIntent-based payments with Stripe Checkout Sessions, so that Adaptive Pricing can automatically present local currencies to customers.

#### Acceptance Criteria

1. WHEN a payment is initiated THEN the System SHALL create a Stripe Checkout Session using the canonical GBP price ID
2. WHEN a Checkout Session is created THEN the System SHALL include the user ID, success URL, cancel URL, and customer email in the session configuration
3. WHEN the checkout.session.completed webhook fires THEN the System SHALL extract and store the presentment currency, local amount, GBP amount, and FX rate
4. WHEN the checkout.session.completed webhook fires THEN the System SHALL activate the user's subscription in the database
5. WHEN a Checkout Session is created THEN the System SHALL enable promotion codes by setting allow_promotion_codes to true

### Requirement 3: Presentment Analytics Dashboard

**User Story:** As an admin, I want to view analytics on how payments are distributed across presentment currencies, so that I can understand my international customer base.

#### Acceptance Criteria

1. WHEN an admin views the Subscription Plans page THEN the System SHALL display a presentment summary section showing percentage of purchases by currency (INR/GBP/USD)
2. WHEN an admin views presentment analytics THEN the System SHALL show average presentment amount per currency for the last 30 days
3. WHEN the presentment summary API is called THEN the System SHALL query the local payments database for aggregated currency statistics
4. WHEN an admin views coupon analytics THEN the System SHALL display redemption counts grouped by presentment currency

### Requirement 4: Enhanced Payments Display

**User Story:** As an admin, I want to see both the local presentment amount and the GBP base amount for each payment, so that I can understand the actual amounts customers paid.

#### Acceptance Criteria

1. WHEN an admin views the Payments page THEN the System SHALL display columns for local amount, GBP base amount, and FX rate used
2. WHEN a payment record is displayed THEN the System SHALL show the Stripe Checkout Session ID alongside the Payment Intent ID
3. WHEN an admin clicks on a payment THEN the System SHALL provide a drill-down view showing Checkout Session, Payment Intent, and Charge details
4. WHEN storing payment data from webhooks THEN the System SHALL persist stripe_checkout_session_id, amount_charged_gbp, amount_charged_local, currency_charged_local, and computed fx_rate

### Requirement 5: Student Subscription Display Enhancement

**User Story:** As an admin, I want to see what currency and amount a student last paid in, so that I can provide better customer support.

#### Acceptance Criteria

1. WHEN an admin views a student's subscription details THEN the System SHALL display the last payment currency and amount
2. WHEN an admin views a student's subscription details THEN the System SHALL indicate the payment source as "Stripe Checkout"

### Requirement 6: Coupon System Compatibility

**User Story:** As an admin, I want coupons to work seamlessly with Adaptive Pricing, so that discounts are applied correctly regardless of presentment currency.

#### Acceptance Criteria

1. WHEN a Checkout Session is created with coupons enabled THEN the System SHALL set allow_promotion_codes to true
2. WHEN validating a coupon for mobile THEN the System SHALL check only eligibility (plan, active status, max_redemptions) without validating against dynamic amounts
3. WHEN an admin views coupon analytics THEN the System SHALL display redemption statistics grouped by presentment currency (INR/GBP/USD)

### Requirement 7: Deprecation of Multi-Currency Features

**User Story:** As a system maintainer, I want legacy multi-currency features to be deprecated with clear warnings, so that admins understand the new Adaptive Pricing model.

#### Acceptance Criteria

1. WHEN an admin accesses the Stripe Products page THEN the System SHALL display a warning that INR/USD prices should not be created manually
2. WHEN the admin UI renders price creation forms THEN the System SHALL disable or hide INR/USD currency options
3. WHEN an admin views subscription plans THEN the System SHALL NOT group plans by country (India/UK/International)

### Requirement 8: Adaptive Pricing Preview

**User Story:** As an admin, I want to preview how Adaptive Pricing will display prices to customers in different regions, so that I can verify the checkout experience.

#### Acceptance Criteria

1. WHEN an admin clicks "Preview Adaptive Pricing" THEN the System SHALL open a test Checkout Session in a new browser tab
2. WHEN previewing Adaptive Pricing THEN the System SHALL use a test email format (test+location_XX@...) to simulate different customer locations

### Requirement 9: Revenue Analytics by Currency

**User Story:** As an admin, I want to view revenue breakdowns by presentment currency, so that I can analyze business performance across markets.

#### Acceptance Criteria

1. WHEN an admin requests revenue analytics THEN the System SHALL return revenue totals grouped by presentment currency
2. WHEN revenue analytics are displayed THEN the System SHALL show both local currency totals and GBP equivalents
