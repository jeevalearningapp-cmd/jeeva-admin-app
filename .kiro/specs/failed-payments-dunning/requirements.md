# Requirements Document

## Introduction

This document specifies the requirements for implementing a Failed Payments & Dunning Management system in the Jeeva Admin Portal. The system will help administrators identify, track, and recover failed payments through automated retry logic and manual intervention capabilities. This feature is critical for revenue recovery and reducing involuntary churn caused by payment failures.

## Glossary

- **Dunning**: The process of communicating with customers to collect payment for failed or overdue transactions
- **Payment Failure**: A payment attempt that was declined or unsuccessful
- **Retry Logic**: Automated system that attempts to re-process failed payments at scheduled intervals
- **Soft Decline**: Temporary payment failure (e.g., insufficient funds, network error) that may succeed on retry
- **Hard Decline**: Permanent payment failure (e.g., invalid card, fraud) that requires customer action
- **Dunning Campaign**: A series of automated retry attempts and customer notifications for a failed payment
- **Recovery Rate**: Percentage of failed payments successfully recovered through retry attempts
- **Involuntary Churn**: Customer loss due to payment failures rather than intentional cancellation
- **Grace Period**: Time period during which service remains active despite payment failure

## Requirements

### Requirement 1: Failed Payments Dashboard

**User Story:** As an admin, I want to view all failed payments in a centralized dashboard, so that I can quickly identify and address payment issues.

#### Acceptance Criteria

1. WHEN an admin accesses the Failed Payments page THEN the System SHALL display a list of all failed payments ordered by failure date descending
2. WHEN displaying failed payments THEN the System SHALL show payment ID, user email, amount, currency, failure reason, failure date, and retry status for each payment
3. WHEN an admin filters by failure type THEN the System SHALL categorize failures as "soft decline" or "hard decline" based on Stripe error codes
4. WHEN an admin filters by date range THEN the System SHALL return only payments that failed within the specified date range
5. WHEN an admin searches by user email or payment ID THEN the System SHALL return matching failed payments

### Requirement 2: Payment Failure Classification

**User Story:** As an admin, I want failed payments to be automatically classified by failure type, so that I can prioritize recovery efforts appropriately.

#### Acceptance Criteria

1. WHEN a payment fails with error code "insufficient_funds" THEN the System SHALL classify it as a soft decline
2. WHEN a payment fails with error code "card_declined" THEN the System SHALL classify it as a soft decline
3. WHEN a payment fails with error code "expired_card" THEN the System SHALL classify it as a hard decline
4. WHEN a payment fails with error code "invalid_card" THEN the System SHALL classify it as a hard decline
5. WHEN a payment fails with error code "fraudulent" THEN the System SHALL classify it as a hard decline and flag for review

### Requirement 3: Manual Payment Retry

**User Story:** As an admin, I want to manually retry failed payments, so that I can recover revenue after customers update their payment information.

#### Acceptance Criteria

1. WHEN an admin clicks "Retry Payment" on a failed payment THEN the System SHALL attempt to re-process the payment using the stored payment method
2. WHEN a manual retry succeeds THEN the System SHALL update the payment status to "succeeded" and activate the associated subscription
3. WHEN a manual retry fails THEN the System SHALL log the new failure reason and increment the retry count
4. WHEN an admin retries a payment THEN the System SHALL record the admin user ID and timestamp in the payment metadata
5. WHEN a payment has exceeded 5 retry attempts THEN the System SHALL display a warning before allowing additional retries

### Requirement 4: Automated Retry Logic

**User Story:** As a system administrator, I want failed payments to be automatically retried at scheduled intervals, so that temporary payment issues can be resolved without manual intervention.

#### Acceptance Criteria

1. WHEN a payment fails with a soft decline THEN the System SHALL schedule automatic retry attempts at 24 hours, 72 hours, and 7 days after the initial failure
2. WHEN a payment fails with a hard decline THEN the System SHALL NOT schedule automatic retries
3. WHEN an automated retry succeeds THEN the System SHALL update the payment status, activate the subscription, and cancel remaining scheduled retries
4. WHEN an automated retry fails THEN the System SHALL log the failure and proceed to the next scheduled retry
5. WHEN all scheduled retries are exhausted THEN the System SHALL mark the payment as "permanently failed" and notify the admin

### Requirement 5: Retry Status Tracking

**User Story:** As an admin, I want to see the retry history for each failed payment, so that I can understand what recovery attempts have been made.

#### Acceptance Criteria

1. WHEN an admin views a failed payment's details THEN the System SHALL display a timeline of all retry attempts with timestamps and outcomes
2. WHEN displaying retry history THEN the System SHALL show whether each retry was manual or automated
3. WHEN displaying retry history THEN the System SHALL show the failure reason for each unsuccessful retry
4. WHEN a retry is scheduled THEN the System SHALL display the next scheduled retry date and time
5. WHEN an admin views retry statistics THEN the System SHALL show total retries, successful retries, and remaining scheduled retries

### Requirement 6: Customer Notification Management

**User Story:** As an admin, I want to send payment failure notifications to customers, so that they can update their payment information and avoid service interruption.

#### Acceptance Criteria

1. WHEN a payment fails THEN the System SHALL send an automated email notification to the customer within 1 hour
2. WHEN sending a failure notification THEN the System SHALL include the failure reason, amount due, and a link to update payment information
3. WHEN a retry attempt fails THEN the System SHALL send a follow-up notification to the customer
4. WHEN an admin manually sends a notification THEN the System SHALL allow customization of the email message
5. WHEN all retries are exhausted THEN the System SHALL send a final notice indicating service suspension

### Requirement 7: Grace Period Management

**User Story:** As an admin, I want to configure grace periods for failed payments, so that customers have time to resolve payment issues without immediate service interruption.

#### Acceptance Criteria

1. WHEN a payment fails THEN the System SHALL maintain active subscription status for a configurable grace period (default 7 days)
2. WHEN the grace period expires THEN the System SHALL automatically suspend the subscription if payment has not been recovered
3. WHEN an admin views a failed payment THEN the System SHALL display days remaining in the grace period
4. WHEN payment is recovered during the grace period THEN the System SHALL extend the subscription end date by the grace period duration
5. WHEN an admin manually adjusts the grace period THEN the System SHALL update the subscription suspension date accordingly

### Requirement 8: Recovery Analytics

**User Story:** As an admin, I want to view analytics on payment recovery rates, so that I can measure the effectiveness of dunning strategies.

#### Acceptance Criteria

1. WHEN an admin accesses the Recovery Analytics page THEN the System SHALL display the overall recovery rate as a percentage
2. WHEN displaying recovery analytics THEN the System SHALL show recovery rates broken down by retry attempt number (1st retry, 2nd retry, etc.)
3. WHEN displaying recovery analytics THEN the System SHALL show recovery rates by failure type (soft decline vs hard decline)
4. WHEN displaying recovery analytics THEN the System SHALL show total revenue recovered in the selected time period
5. WHEN displaying recovery analytics THEN the System SHALL show average time to recovery for successful retries

### Requirement 9: Bulk Actions

**User Story:** As an admin, I want to perform bulk actions on multiple failed payments, so that I can efficiently manage large volumes of payment failures.

#### Acceptance Criteria

1. WHEN an admin selects multiple failed payments THEN the System SHALL enable bulk action buttons
2. WHEN an admin clicks "Retry Selected" THEN the System SHALL attempt to retry all selected payments sequentially
3. WHEN an admin clicks "Send Notifications" THEN the System SHALL send payment failure emails to all selected customers
4. WHEN an admin clicks "Mark as Reviewed" THEN the System SHALL flag all selected payments as reviewed by an admin
5. WHEN performing bulk actions THEN the System SHALL display a progress indicator and summary of results

### Requirement 10: Webhook Integration for Payment Failures

**User Story:** As a system administrator, I want payment failures to be automatically captured from Stripe webhooks, so that the dunning system has real-time data.

#### Acceptance Criteria

1. WHEN a "payment_intent.payment_failed" webhook is received THEN the System SHALL extract the failure reason and store it in the payments table
2. WHEN a "charge.failed" webhook is received THEN the System SHALL update the payment record with the failure details
3. WHEN a payment failure webhook is processed THEN the System SHALL trigger the automated retry scheduling logic
4. WHEN a payment failure webhook is processed THEN the System SHALL send the initial customer notification
5. WHEN a webhook processing fails THEN the System SHALL log the error and retry webhook processing up to 3 times

### Requirement 11: Admin Alerts for Critical Failures

**User Story:** As an admin, I want to receive alerts for critical payment failures, so that I can take immediate action on high-value or suspicious failures.

#### Acceptance Criteria

1. WHEN a payment over £100 fails THEN the System SHALL send an email alert to designated admin users
2. WHEN a payment fails with a "fraudulent" error code THEN the System SHALL send an immediate alert to the admin team
3. WHEN the daily failure rate exceeds 10% THEN the System SHALL send an alert indicating a potential system issue
4. WHEN a customer's payment fails for the third consecutive time THEN the System SHALL alert admins to contact the customer
5. WHEN an admin configures alert thresholds THEN the System SHALL use the custom thresholds for triggering alerts

### Requirement 12: Payment Method Update Tracking

**User Story:** As an admin, I want to track when customers update their payment methods after a failure, so that I can measure the effectiveness of customer communications.

#### Acceptance Criteria

1. WHEN a customer updates their payment method THEN the System SHALL record the update timestamp in the payment_customers table
2. WHEN displaying failed payment details THEN the System SHALL indicate if the customer has updated their payment method since the failure
3. WHEN a payment method is updated after a failure THEN the System SHALL automatically trigger a retry attempt within 1 hour
4. WHEN generating recovery reports THEN the System SHALL show the percentage of customers who updated payment methods after receiving notifications
5. WHEN a payment method is updated THEN the System SHALL cancel any pending grace period suspension

