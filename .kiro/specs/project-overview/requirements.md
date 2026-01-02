# Requirements Document

## Introduction

The Jeeva Admin Portal is a comprehensive web-based administration dashboard for managing the Jeeva Learning mobile application ecosystem. Jeeva Learning is an NMC CBT (Nursing and Midwifery Council Computer-Based Test) exam preparation platform for nursing students. The admin portal provides tools for content management, user management, subscription handling, payment processing, analytics, and AI chatbot administration.

## Glossary

- **Admin Portal**: The React-based web application for administrators to manage the Jeeva Learning platform
- **Mobile App**: The React Native/Expo student-facing application for NMC CBT exam preparation
- **NMC CBT**: Nursing and Midwifery Council Computer-Based Test - the UK nursing registration exam
- **Supabase**: Backend-as-a-Service providing PostgreSQL database, authentication, and storage
- **JeevaBot**: AI-powered chatbot using Google Gemini for student assistance
- **Trial Module**: Free trial content allowing users to experience the platform before subscribing
- **RLS**: Row Level Security - PostgreSQL security policies for data access control

## Requirements

### Requirement 1: Authentication & Authorization

**User Story:** As an administrator, I want to securely log in to the admin portal with role-based access, so that I can manage platform resources according to my permissions.

#### Acceptance Criteria

1. WHEN an admin user enters valid credentials THEN the Admin_Portal SHALL authenticate the user via Supabase Auth and redirect to the dashboard
2. WHEN an admin user has role 'superadmin' THEN the Admin_Portal SHALL grant access to all system features including settings, analytics, and user management
3. WHEN an admin user has role 'editor' THEN the Admin_Portal SHALL grant access to content management, user management, and discount coupons
4. WHEN an admin user has role 'moderator' THEN the Admin_Portal SHALL grant access only to content approval workflows
5. WHEN an unauthenticated user attempts to access protected routes THEN the Admin_Portal SHALL redirect to the login page

### Requirement 2: Content Management System

**User Story:** As a content editor, I want to manage educational content in a hierarchical structure (Modules → Topics → Lessons → Questions/Flashcards), so that students can access organized learning materials.

#### Acceptance Criteria

1. WHEN an editor creates a new module THEN the Admin_Portal SHALL store the module with title, description, thumbnail, display order, and active status
2. WHEN an editor creates a topic within a module THEN the Admin_Portal SHALL associate the topic with its parent module and maintain display ordering
3. WHEN an editor creates a lesson THEN the Admin_Portal SHALL support rich text content, video URLs, audio URLs, and duration tracking
4. WHEN an editor creates a question THEN the Admin_Portal SHALL require question text, type (multiple_choice/true_false/short_answer), difficulty level, and explanation
5. WHEN an editor creates question options THEN the Admin_Portal SHALL require at least one option marked as correct
6. WHEN an editor uploads content via CSV THEN the Admin_Portal SHALL validate the data format and provide error feedback for invalid entries
7. WHEN content is created or modified THEN the Admin_Portal SHALL submit it to the approval workflow if the user is not a superadmin

### Requirement 3: User Management

**User Story:** As an administrator, I want to manage student users and admin users, so that I can maintain platform access and monitor user activity.

#### Acceptance Criteria

1. WHEN an admin views the students page THEN the Admin_Portal SHALL display user profiles with full name, email, subscription status, and activity metrics
2. WHEN an admin searches for users THEN the Admin_Portal SHALL filter results by name, email, or subscription status
3. WHEN an admin updates a user's status THEN the Admin_Portal SHALL toggle the is_active flag and reflect changes immediately
4. WHEN a superadmin creates an admin user THEN the Admin_Portal SHALL require email, full name, and role assignment
5. WHEN a superadmin modifies admin roles THEN the Admin_Portal SHALL update permissions immediately without requiring re-login

### Requirement 4: Subscription & Payment Management

**User Story:** As an administrator, I want to manage subscription plans and process payments, so that users can access premium content through a seamless payment experience.

#### Acceptance Criteria

1. WHEN an admin creates a subscription plan THEN the Admin_Portal SHALL store name, description, price in USD, duration in days, and feature list
2. WHEN an admin creates a discount coupon THEN the Admin_Portal SHALL store code, discount type (percentage/fixed), value, validity period, and usage limits
3. WHEN a payment is processed via Stripe THEN the Admin_Portal SHALL record transaction details, update subscription status, and send confirmation email
4. WHEN viewing payment analytics THEN the Admin_Portal SHALL display total revenue, successful/failed payments, and subscription distribution
5. WHEN a subscription expires THEN the Admin_Portal SHALL update the status to 'expired' and trigger appropriate notifications

### Requirement 5: Trial Module Administration

**User Story:** As an administrator, I want to configure and monitor the trial module, so that new users can experience the platform before subscribing.

#### Acceptance Criteria

1. WHEN configuring trial practice THEN the Admin_Portal SHALL allow selection of 6 questions (3 numerical, 3 clinical) with unlimited attempts
2. WHEN configuring trial learning THEN the Admin_Portal SHALL allow selection of 2 lessons with 60% unlock threshold
3. WHEN configuring trial mock exam THEN the Admin_Portal SHALL set 20 questions, 30-minute time limit, and 50% passing score
4. WHEN viewing trial analytics THEN the Admin_Portal SHALL display total trial users, completion rates, average scores, and conversion metrics
5. WHEN a trial user completes all sections THEN the Admin_Portal SHALL track conversion readiness for upgrade prompts

### Requirement 6: Analytics & Dashboard

**User Story:** As an administrator, I want to view comprehensive analytics and KPIs, so that I can make data-driven decisions about platform performance.

#### Acceptance Criteria

1. WHEN loading the dashboard THEN the Admin_Portal SHALL display total users, active users, total subscriptions, and content metrics
2. WHEN filtering analytics by date range THEN the Admin_Portal SHALL recalculate all metrics for the selected period
3. WHEN viewing content performance THEN the Admin_Portal SHALL show top modules, lessons, and completion rates
4. WHEN exporting analytics data THEN the Admin_Portal SHALL generate CSV files with the requested metrics
5. WHEN viewing real-time metrics THEN the Admin_Portal SHALL refresh data at configurable intervals

### Requirement 7: Push Notifications

**User Story:** As an administrator, I want to send push notifications to mobile app users, so that I can communicate important updates and engagement reminders.

#### Acceptance Criteria

1. WHEN creating a notification THEN the Admin_Portal SHALL require title, body, notification type, and audience filter
2. WHEN scheduling a notification THEN the Admin_Portal SHALL queue it for delivery at the specified time
3. WHEN targeting specific users THEN the Admin_Portal SHALL filter by subscription status, activity level, or custom user lists
4. WHEN a notification is sent THEN the Admin_Portal SHALL track delivery status and receipt confirmations
5. WHEN viewing notification history THEN the Admin_Portal SHALL display sent count, delivery rate, and engagement metrics

### Requirement 8: AI Chatbot Administration

**User Story:** As an administrator, I want to monitor and configure the JeevaBot AI assistant, so that students receive helpful and appropriate responses.

#### Acceptance Criteria

1. WHEN viewing AI usage stats THEN the Admin_Portal SHALL display daily message counts, token usage, and cost estimates
2. WHEN configuring rate limits THEN the Admin_Portal SHALL enforce maximum messages per user per day (default: 50)
3. WHEN reviewing chat conversations THEN the Admin_Portal SHALL display conversation history with user context
4. WHEN AI costs exceed thresholds THEN the Admin_Portal SHALL alert administrators via dashboard notifications

### Requirement 9: Email System

**User Story:** As an administrator, I want to manage email templates and send transactional emails, so that users receive timely communications.

#### Acceptance Criteria

1. WHEN creating an email template THEN the Admin_Portal SHALL store name, subject, HTML body, and template variables
2. WHEN sending a welcome email THEN the Admin_Portal SHALL use the Resend API with the configured template
3. WHEN sending subscription confirmations THEN the Admin_Portal SHALL include plan details, expiry date, and receipt information
4. WHEN testing email delivery THEN the Admin_Portal SHALL provide a test interface for superadmins at /email-test

### Requirement 10: System Settings & Configuration

**User Story:** As a superadmin, I want to configure platform-wide settings, so that I can customize the application behavior.

#### Acceptance Criteria

1. WHEN updating app settings THEN the Admin_Portal SHALL store key-value pairs for site name, maintenance mode, and feature flags
2. WHEN managing hero sections THEN the Admin_Portal SHALL allow creation of dashboard banners with title, subtitle, image, and CTA links
3. WHEN enabling maintenance mode THEN the Admin_Portal SHALL display appropriate messaging to mobile app users
4. WHEN configuring security settings THEN the Admin_Portal SHALL enforce password policies and session timeouts
