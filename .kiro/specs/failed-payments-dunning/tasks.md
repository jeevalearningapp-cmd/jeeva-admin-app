# Implementation Plan

## Phase 1: Database Schema & Core Models

- [ ] 1. Create database schema for dunning system
  - [ ] 1.1 Create payment_retries table
    - Add columns: id, payment_id, attempt_number, retry_type, scheduled_for, attempted_at, status, failure_code, failure_message, triggered_by, created_at, updated_at
    - Add foreign key to payments table
    - Add indexes on payment_id, status, scheduled_for
    - _Requirements: 3.3, 5.1, 5.2_
  - [ ] 1.2 Create grace_periods table
    - Add columns: id, payment_id, subscription_id, user_id, start_date, end_date, duration_days, status, cancelled_at, cancelled_by, created_at, updated_at
    - Add foreign keys to payments and subscriptions tables
    - Add indexes on payment_id, subscription_id, status, end_date
    - _Requirements: 7.1, 7.2_
  - [ ] 1.3 Create alert_logs table
    - Add columns: id, alert_type, payment_id, user_id, severity, message, metadata, sent_to, sent_at, acknowledged_by, acknowledged_at, created_at
    - Add indexes on alert_type, payment_id, user_id, sent_at
    - _Requirements: 11.1, 11.3, 11.4_
  - [ ] 1.4 Enhance payments table with failure tracking fields
    - Add columns: failure_code, failure_message, failure_type, failed_at, retry_count, last_retry_at, next_retry_at, recovered_at, permanently_failed_at, reviewed_by, reviewed_at
    - Add indexes on failure_type, failed_at, status
    - _Requirements: 1.2, 2.1-2.5_
  - [ ] 1.5 Write property test for payment record completeness
    - **Property 2: Failed Payment Completeness**
    - **Validates: Requirements 1.2**

- [ ] 2. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Failure Classification & Webhook Integration

- [ ] 3. Implement failure classification service
  - [ ] 3.1 Create classifyFailure function
    - Map Stripe error codes to soft_decline or hard_decline
    - Handle error codes: insufficient_funds, card_declined (soft), expired_card, invalid_card, fraudulent (hard)
    - Return classification type
    - _Requirements: 1.3, 2.1-2.5_
  - [ ] 3.2 Write property test for failure classification consistency
    - **Property 3: Failure Classification Consistency**
    - **Validates: Requirements 1.3, 2.1-2.5**

- [ ] 4. Enhance webhook handler for payment failures
  - [ ] 4.1 Update payment_intent.payment_failed webhook handler
    - Extract failure_code and failure_message from webhook payload
    - Classify failure using classifyFailure function
    - Store failure details in payments table
    - Set failed_at timestamp
    - _Requirements: 10.1, 10.2_
  - [ ] 4.2 Update charge.failed webhook handler
    - Extract failure details from charge object
    - Update payment record with failure information
    - _Requirements: 10.2_
  - [ ] 4.3 Add webhook retry logic
    - Implement retry mechanism for failed webhook processing
    - Log errors and retry up to 3 times
    - _Requirements: 10.5_
  - [ ] 4.4 Write property test for webhook failure extraction
    - **Property 37: Webhook Failure Extraction**
    - **Validates: Requirements 10.1**
  - [ ] 4.5 Write property test for webhook retry on failure
    - **Property 41: Webhook Retry on Failure**
    - **Validates: Requirements 10.5**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Retry Scheduling Service

- [ ] 6. Implement retry scheduler service
  - [ ] 6.1 Create scheduleRetries function
    - Accept payment ID and failure type
    - For soft declines: create 3 retry records at 24h, 72h, 7d intervals
    - For hard declines: do not create retry records
    - Set status to 'pending' for all scheduled retries
    - _Requirements: 4.1, 4.2_
  - [ ] 6.2 Create cancelScheduledRetries function
    - Find all pending retries for payment
    - Update status to 'cancelled'
    - _Requirements: 4.3_
  - [ ] 6.3 Create getNextRetryDate function
    - Query earliest pending retry for payment
    - Return scheduled_for date or null
    - _Requirements: 5.4_
  - [ ] 6.4 Create processScheduledRetries cron job
    - Query all pending retries where scheduled_for <= now
    - For each retry: attempt payment via Stripe API
    - Update retry status and payment record based on result
    - _Requirements: 4.3, 4.4_
  - [ ] 6.5 Write property test for soft decline retry scheduling
    - **Property 10: Soft Decline Retry Scheduling**
    - **Validates: Requirements 4.1**
  - [ ] 6.6 Write property test for hard decline no retry
    - **Property 11: Hard Decline No Retry**
    - **Validates: Requirements 4.2**
  - [ ] 6.7 Write property test for successful retry cleanup
    - **Property 12: Successful Retry Cleanup**
    - **Validates: Requirements 4.3**

- [ ] 7. Integrate retry scheduling with webhook handler
  - [ ] 7.1 Call scheduleRetries after payment failure webhook processing
    - Pass payment ID and failure type
    - Log scheduling results
    - _Requirements: 10.3_
  - [ ] 7.2 Write property test for webhook triggers retry scheduling
    - **Property 39: Webhook Triggers Retry Scheduling**
    - **Validates: Requirements 10.3**

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Manual Retry & Retry History

- [ ] 9. Implement manual retry functionality
  - [ ] 9.1 Create retryPayment function
    - Accept payment ID and admin user ID
    - Validate payment is in failed state
    - Check retry count limit (warn if > 5)
    - Attempt payment via Stripe API
    - Create retry record with type 'manual'
    - Update payment metadata with admin ID and timestamp
    - _Requirements: 3.1, 3.4_
  - [ ] 9.2 Handle successful manual retry
    - Update payment status to 'succeeded'
    - Set recovered_at timestamp
    - Activate associated subscription
    - Cancel scheduled retries
    - _Requirements: 3.2_
  - [ ] 9.3 Handle failed manual retry
    - Increment retry_count
    - Create retry record with failure details
    - Update last_retry_at timestamp
    - _Requirements: 3.3_
  - [ ] 9.4 Write property test for manual retry invocation
    - **Property 6: Manual Retry Invocation**
    - **Validates: Requirements 3.1**
  - [ ] 9.5 Write property test for successful retry state transition
    - **Property 7: Successful Retry State Transition**
    - **Validates: Requirements 3.2**
  - [ ] 9.6 Write property test for failed retry logging
    - **Property 8: Failed Retry Logging**
    - **Validates: Requirements 3.3**
  - [ ] 9.7 Write property test for retry audit trail
    - **Property 9: Retry Audit Trail**
    - **Validates: Requirements 3.4**

- [ ] 10. Implement retry history service
  - [ ] 10.1 Create getRetryHistory function
    - Query all retry records for payment
    - Order by attempt_number ascending
    - Return array of retry attempts with details
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ] 10.2 Create getRetryStatistics function
    - Calculate total retries, successful retries, remaining scheduled retries
    - Return statistics object
    - _Requirements: 5.5_
  - [ ] 10.3 Write property test for retry history completeness
    - **Property 15: Retry History Completeness**
    - **Validates: Requirements 5.1**
  - [ ] 10.4 Write property test for retry statistics accuracy
    - **Property 19: Retry Statistics Accuracy**
    - **Validates: Requirements 5.5**

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Grace Period Management

- [ ] 12. Implement grace period service
  - [ ] 12.1 Create createGracePeriod function
    - Accept payment ID and duration in days (default 7)
    - Calculate end_date from failed_at + duration
    - Create grace_periods record with status 'active'
    - _Requirements: 7.1_
  - [ ] 12.2 Create getGracePeriod function
    - Query grace period by payment ID
    - Calculate days_remaining from end_date - current_date
    - Return grace period with calculated fields
    - _Requirements: 7.3_
  - [ ] 12.3 Create extendGracePeriod function
    - Accept payment ID and additional days
    - Update end_date by adding additional days
    - Update subscription end_date accordingly
    - _Requirements: 7.4_
  - [ ] 12.4 Create cancelGracePeriod function
    - Update grace period status to 'cancelled'
    - Set cancelled_at timestamp and cancelled_by admin ID
    - _Requirements: 12.5_
  - [ ] 12.5 Create processExpiredGracePeriods cron job
    - Query all active grace periods where end_date <= now
    - For each: suspend subscription if payment not recovered
    - Update grace period status to 'expired'
    - _Requirements: 7.2_
  - [ ] 12.6 Write property test for grace period activation
    - **Property 24: Grace Period Activation**
    - **Validates: Requirements 7.1**
  - [ ] 12.7 Write property test for grace period expiration suspension
    - **Property 25: Grace Period Expiration Suspension**
    - **Validates: Requirements 7.2**
  - [ ] 12.8 Write property test for grace period days calculation
    - **Property 26: Grace Period Days Calculation**
    - **Validates: Requirements 7.3**
  - [ ] 12.9 Write property test for grace period extension on recovery
    - **Property 27: Grace Period Extension on Recovery**
    - **Validates: Requirements 7.4**

- [ ] 13. Integrate grace period with webhook handler
  - [ ] 13.1 Call createGracePeriod after payment failure webhook processing
    - Create grace period for soft declines
    - Log grace period creation
    - _Requirements: 7.1_

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Notification Service

- [ ] 15. Implement notification service
  - [ ] 15.1 Create sendPaymentFailureNotification function
    - Accept payment failure data
    - Generate email with failure reason, amount, update payment URL
    - Include retry schedule for soft declines
    - Send email via email service
    - _Requirements: 6.1, 6.2_
  - [ ] 15.2 Create sendRetryFailureNotification function
    - Accept retry failure data
    - Generate follow-up email
    - Send to customer
    - _Requirements: 6.3_
  - [ ] 15.3 Create sendFinalNotice function
    - Accept payment data
    - Generate final notice with service suspension warning
    - Send to customer
    - _Requirements: 6.5_
  - [ ] 15.4 Create sendCustomNotification function
    - Accept payment ID and custom message
    - Allow admin to customize email content
    - Send to customer
    - _Requirements: 6.4_
  - [ ] 15.5 Write property test for initial notification timing
    - **Property 20: Initial Notification Timing**
    - **Validates: Requirements 6.1**
  - [ ] 15.6 Write property test for notification content completeness
    - **Property 21: Notification Content Completeness**
    - **Validates: Requirements 6.2**

- [ ] 16. Integrate notifications with webhook and retry handlers
  - [ ] 16.1 Call sendPaymentFailureNotification after webhook processing
    - Schedule notification within 1 hour of failure
    - _Requirements: 10.4_
  - [ ] 16.2 Call sendRetryFailureNotification after failed retry
    - Send notification for each failed retry attempt
    - _Requirements: 6.3_
  - [ ] 16.3 Call sendFinalNotice when retries exhausted
    - Send when all scheduled retries have failed
    - _Requirements: 6.5_
  - [ ] 16.4 Write property test for webhook triggers initial notification
    - **Property 40: Webhook Triggers Initial Notification**
    - **Validates: Requirements 10.4**

- [ ] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Alert Service

- [ ] 18. Implement alert service
  - [ ] 18.1 Create sendHighValueFailureAlert function
    - Check if payment amount exceeds threshold (default £100)
    - Send email alert to admin users
    - Log alert in alert_logs table
    - _Requirements: 11.1_
  - [ ] 18.2 Create sendFraudAlert function
    - Check if failure code is 'fraudulent'
    - Send immediate alert to admin team
    - Log alert with 'critical' severity
    - _Requirements: 11.2_
  - [ ] 18.3 Create sendHighFailureRateAlert function
    - Calculate daily failure rate
    - Check if rate exceeds threshold (default 10%)
    - Send alert to admin users
    - _Requirements: 11.3_
  - [ ] 18.4 Create sendConsecutiveFailureAlert function
    - Check if user has 3 consecutive failures
    - Send alert to admin users
    - _Requirements: 11.4_
  - [ ] 18.5 Create updateAlertConfig function
    - Allow admins to configure alert thresholds
    - Store config in settings table
    - _Requirements: 11.5_
  - [ ] 18.6 Write property test for high value alert threshold
    - **Property 42: High Value Alert Threshold**
    - **Validates: Requirements 11.1**
  - [ ] 18.7 Write property test for daily failure rate alert
    - **Property 43: Daily Failure Rate Alert**
    - **Validates: Requirements 11.3**
  - [ ] 18.8 Write property test for consecutive failure alert
    - **Property 44: Consecutive Failure Alert**
    - **Validates: Requirements 11.4**

- [ ] 19. Integrate alerts with webhook handler
  - [ ] 19.1 Call alert functions after payment failure processing
    - Check high value threshold
    - Check fraud flag
    - Check consecutive failures
    - _Requirements: 11.1, 11.2, 11.4_
  - [ ] 19.2 Create daily cron job for failure rate monitoring
    - Calculate daily failure rate
    - Trigger alert if threshold exceeded
    - _Requirements: 11.3_

- [ ] 20. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 8: Recovery Analytics Service

- [ ] 21. Implement recovery analytics service
  - [ ] 21.1 Create getRecoveryStats function
    - Accept date range
    - Calculate total failed, recovered, permanently failed payments
    - Calculate overall recovery rate
    - Group recovery by attempt number
    - Group recovery by failure type
    - Calculate total revenue recovered
    - Calculate average time to recovery
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ] 21.2 Create getRecoveryTrends function
    - Accept period (daily/weekly/monthly)
    - Calculate recovery trends over time
    - Return time series data
    - _Requirements: 8.1_
  - [ ] 21.3 Write property test for overall recovery rate calculation
    - **Property 29: Overall Recovery Rate Calculation**
    - **Validates: Requirements 8.1**
  - [ ] 21.4 Write property test for recovery rate by attempt
    - **Property 30: Recovery Rate by Attempt**
    - **Validates: Requirements 8.2**
  - [ ] 21.5 Write property test for recovery rate by failure type
    - **Property 31: Recovery Rate by Failure Type**
    - **Validates: Requirements 8.3**
  - [ ] 21.6 Write property test for total revenue recovered
    - **Property 32: Total Revenue Recovered**
    - **Validates: Requirements 8.4**
  - [ ] 21.7 Write property test for average time to recovery
    - **Property 33: Average Time to Recovery**
    - **Validates: Requirements 8.5**

- [ ] 22. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 9: API Routes

- [ ] 23. Create failed payments API endpoints
  - [ ] 23.1 Add GET /api/failed-payments route
    - Accept filters: failure_type, date_from, date_to, search_query, status
    - Query payments table with filters
    - Return failed payments list ordered by failed_at desc
    - _Requirements: 1.1, 1.3, 1.4, 1.5_
  - [ ] 23.2 Add GET /api/failed-payments/:id route
    - Return detailed payment information
    - Include retry history
    - Include grace period details
    - _Requirements: 1.2, 5.1_
  - [ ] 23.3 Add POST /api/failed-payments/:id/retry route
    - Accept admin user ID
    - Call retryPayment function
    - Return retry result
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ] 23.4 Add GET /api/failed-payments/:id/retry-history route
    - Call getRetryHistory function
    - Return retry attempts timeline
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ] 23.5 Write property test for failed payments ordering
    - **Property 1: Failed Payments Ordering**
    - **Validates: Requirements 1.1**
  - [ ] 23.6 Write property test for date range filtering
    - **Property 4: Date Range Filtering**
    - **Validates: Requirements 1.4**
  - [ ] 23.7 Write property test for search result matching
    - **Property 5: Search Result Matching**
    - **Validates: Requirements 1.5**

- [ ] 24. Create bulk actions API endpoints
  - [ ] 24.1 Add POST /api/failed-payments/bulk-retry route
    - Accept array of payment IDs
    - Call retryPayment for each ID
    - Return bulk operation results
    - _Requirements: 9.2_
  - [ ] 24.2 Add POST /api/failed-payments/bulk-notify route
    - Accept array of payment IDs
    - Send notifications to all customers
    - Return bulk operation results
    - _Requirements: 9.3_
  - [ ] 24.3 Add POST /api/failed-payments/bulk-review route
    - Accept array of payment IDs and admin user ID
    - Mark all as reviewed
    - Return bulk operation results
    - _Requirements: 9.4_
  - [ ] 24.4 Write property test for bulk retry completeness
    - **Property 34: Bulk Retry Completeness**
    - **Validates: Requirements 9.2**
  - [ ] 24.5 Write property test for bulk notification completeness
    - **Property 35: Bulk Notification Completeness**
    - **Validates: Requirements 9.3**

- [ ] 25. Create recovery analytics API endpoints
  - [ ] 25.1 Add GET /api/recovery-analytics/stats route
    - Accept date_from and date_to query params
    - Call getRecoveryStats function
    - Return recovery statistics
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ] 25.2 Add GET /api/recovery-analytics/trends route
    - Accept period query param
    - Call getRecoveryTrends function
    - Return trend data
    - _Requirements: 8.1_

- [ ] 26. Create grace period API endpoints
  - [ ] 26.1 Add GET /api/grace-periods/:paymentId route
    - Call getGracePeriod function
    - Return grace period details with days remaining
    - _Requirements: 7.3_
  - [ ] 26.2 Add POST /api/grace-periods/:paymentId/extend route
    - Accept additional_days parameter
    - Call extendGracePeriod function
    - Return updated grace period
    - _Requirements: 7.5_
  - [ ] 26.3 Add POST /api/grace-periods/:paymentId/cancel route
    - Accept admin user ID
    - Call cancelGracePeriod function
    - Return cancellation result
    - _Requirements: 12.5_

- [ ] 27. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 10: Frontend - Failed Payments Dashboard

- [ ] 28. Create FailedPaymentsPage component
  - [ ] 28.1 Create page layout with filters and search
    - Add failure type filter (soft/hard decline)
    - Add date range filter
    - Add search by email/payment ID
    - Add status filter
    - _Requirements: 1.3, 1.4, 1.5_
  - [ ] 28.2 Create failed payments table
    - Display payment ID, user email, amount, currency, failure reason, failure date, retry status
    - Order by failure date descending
    - Add pagination
    - _Requirements: 1.1, 1.2_
  - [ ] 28.3 Add action buttons to table rows
    - Add "Retry Payment" button
    - Add "View Details" button
    - Add "Send Notification" button
    - _Requirements: 3.1, 6.4_
  - [ ] 28.4 Add bulk action controls
    - Add checkbox selection
    - Add "Retry Selected" button
    - Add "Send Notifications" button
    - Add "Mark as Reviewed" button
    - Show progress indicator during bulk operations
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 29. Create PaymentDetailsDrawer component
  - [ ] 29.1 Display payment details
    - Show all payment information
    - Show failure details (code, message, type)
    - Show retry count and next retry date
    - _Requirements: 1.2, 5.4_
  - [ ] 29.2 Display retry history timeline
    - Show all retry attempts with timestamps
    - Indicate manual vs automated retries
    - Show failure reasons for failed retries
    - Show retry statistics
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  - [ ] 29.3 Display grace period information
    - Show grace period status
    - Show days remaining
    - Add "Extend Grace Period" button
    - Add "Cancel Grace Period" button
    - _Requirements: 7.3, 7.5_
  - [ ] 29.4 Add action buttons
    - Add "Retry Now" button with confirmation
    - Add "Send Custom Notification" button
    - Show warning if retry count > 5
    - _Requirements: 3.1, 3.5, 6.4_

- [ ] 30. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 11: Frontend - Recovery Analytics Dashboard

- [ ] 31. Create RecoveryAnalyticsPage component
  - [ ] 31.1 Create summary cards
    - Display overall recovery rate
    - Display total revenue recovered
    - Display average time to recovery
    - Display total failed payments
    - _Requirements: 8.1, 8.4, 8.5_
  - [ ] 31.2 Create recovery by attempt chart
    - Display bar chart of recovery rates by attempt number
    - Show count for each attempt
    - _Requirements: 8.2_
  - [ ] 31.3 Create recovery by failure type chart
    - Display pie chart of recovery rates by soft/hard decline
    - Show counts and percentages
    - _Requirements: 8.3_
  - [ ] 31.4 Create recovery trends chart
    - Display line chart of recovery rate over time
    - Allow selection of daily/weekly/monthly period
    - _Requirements: 8.1_
  - [ ] 31.5 Add date range selector
    - Allow filtering by date range
    - Update all charts and stats on change
    - _Requirements: 8.1, 8.4_

- [ ] 32. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 12: Payment Method Update Tracking

- [ ] 33. Implement payment method update tracking
  - [ ] 33.1 Update payment_customers table on payment method update
    - Record updated_at timestamp
    - _Requirements: 12.1_
  - [ ] 33.2 Add payment method update indicator to failed payments
    - Compare payment method updated_at with payment failed_at
    - Display indicator in UI if updated after failure
    - _Requirements: 12.2_
  - [ ] 33.3 Trigger auto-retry on payment method update
    - Listen for payment method update events
    - Schedule retry within 1 hour if failed payment exists
    - _Requirements: 12.3_
  - [ ] 33.4 Add payment method update analytics
    - Calculate percentage of customers who updated payment methods
    - Display in recovery analytics
    - _Requirements: 12.4_
  - [ ] 33.5 Cancel grace period on payment method update
    - Check for active grace periods
    - Cancel grace period when payment method updated
    - _Requirements: 12.5_
  - [ ] 33.6 Write property test for payment method update timestamp
    - **Property 46: Payment Method Update Timestamp**
    - **Validates: Requirements 12.1**
  - [ ] 33.7 Write property test for auto retry on payment method update
    - **Property 48: Auto Retry on Payment Method Update**
    - **Validates: Requirements 12.3**
  - [ ] 33.8 Write property test for grace period cancellation on update
    - **Property 50: Grace Period Cancellation on Update**
    - **Validates: Requirements 12.5**

- [ ] 34. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
