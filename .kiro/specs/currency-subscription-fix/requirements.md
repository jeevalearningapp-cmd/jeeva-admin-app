# Requirements Document

## Introduction

This feature addresses two critical issues in the Jeeva Admin Portal:
1. **Currency Inconsistency**: The application defaults to USD ($) in various places, but the primary currency should be GBP (£) for UK-based users.
2. **Subscription Status Not Updating**: After a successful payment, the user's subscription status, payment history, and student status are not being updated in the database, causing the admin portal to show incorrect subscription information.

## Glossary

- **GBP**: British Pound Sterling, the primary currency for the application
- **USD**: United States Dollar, previously used as default currency
- **Subscription Status**: The current state of a user's subscription (trial, active, expired, cancelled)
- **Payment Intent**: A Stripe object representing a payment transaction
- **Webhook**: An HTTP callback triggered by Stripe when payment events occur
- **CountryDetection**: A utility module that detects user location and provides currency formatting

## Requirements

### Requirement 1

**User Story:** As an admin, I want all currency displays to default to GBP (£), so that the application is consistent with the UK market focus.

#### Acceptance Criteria

1. WHEN the CountryDetection module fails to detect a country THEN the System SHALL default to 'GB' (United Kingdom) with GBP currency
2. WHEN displaying prices without explicit country context THEN the System SHALL use GBP (£) as the default currency symbol
3. WHEN the usePricing hook initializes without country data THEN the System SHALL default to 'GB' country code
4. WHEN formatting prices for payment processing without country context THEN the System SHALL use 'gbp' as the default currency

### Requirement 2

**User Story:** As an admin, I want to see accurate subscription status for users after they complete payment, so that I can track active subscribers correctly.

#### Acceptance Criteria

1. WHEN a Stripe payment succeeds THEN the System SHALL update the user's subscription status to 'active' in the subscriptions table
2. WHEN a payment is verified successfully THEN the System SHALL create or update a subscription record with the correct start_date and end_date
3. WHEN activating a subscription THEN the System SHALL calculate the end_date based on the subscription plan's billing cycle (30 days for monthly, 365 days for yearly)
4. WHEN a subscription is activated THEN the System SHALL update the user's subscription_status field in user_profiles if it exists

### Requirement 3

**User Story:** As an admin, I want payment history to be accurately linked to subscriptions, so that I can track revenue and user payments.

#### Acceptance Criteria

1. WHEN creating a payment record THEN the System SHALL link it to the corresponding subscription record via subscription_id
2. WHEN a payment succeeds THEN the System SHALL update the subscription's last_payment_date to the current timestamp
3. WHEN a payment succeeds for a recurring subscription THEN the System SHALL calculate and set the next_payment_date based on the billing cycle
