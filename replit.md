# Jeeva Learning Platform

## Overview
Jeeva Learning is an educational technology platform designed to assist Indian nurses in preparing for the UK NMC CBT exam. The platform offers a mobile app with practice MCQs, learning content, mock exams, AI-powered features (JeevaBot, personalized recommendations), performance tracking, and dual payment integration. An accompanying admin portal provides comprehensive content, user, and subscription management, along with analytics and role-based access control. The primary goal is to help Indian nursing graduates pass their certification, with flexible subscription plans available, facilitating their certification to work in the UK healthcare system.

## User Preferences
Preferred communication style: Simple, everyday language.

### UI/UX Customizations
- **Header Design**: Clean, minimal dashboard header with modern styling
- **Theme Icons**: WbSunnyOutlined (Light mode), ContrastOutlined (Dark mode)
- **User Display**: Simple avatar with dropdown menu (role visible in menu)

## System Architecture

### Frontend Architecture
**Technology Stack:** React 18, TypeScript, Vite 5, Material-UI (MUI) v7 with Emotion, React Router DOM v7, Zustand, TanStack React Query (v5), Notistack, Recharts (analytics).
**Design Patterns:** Component-based architecture by feature, path aliases (`@/*`), strict TypeScript, CSS-in-JS (Emotion).
**Routing Structure:** Public (`/login`) and protected routes (`/dashboard`, `/content/*`, `/trial-module`), with nested and dynamic routes, utilizing `ProtectedRoute` and `MainLayout`.
**UI/UX Approach:** Material Design with custom theming (8px borderRadius), full-height collapsible sidebar, responsive header, modal/drawer overlays with gradients, role-adaptive menus, consistent color palette (primary #007aff, secondary #181C32), Inter font family, professional form components, interactive card layouts, light/dark mode support with `localStorage` persistence.

### Backend Architecture
**Backend-as-a-Service:** Supabase (PostgreSQL database, authentication, real-time) with Row Level Security (RLS).
**Authentication & Authorization:** Supabase Auth, role-based access (Superadmin, Editor, Moderator), `AuthContext` for global state, `ProtectedRoute` for enforcement.
**Data Architecture:** Relational model with UUID primary keys.
**Backend API Server:** Express.js server providing email services, AI chat endpoints (JeevaBot), Stripe payment processing endpoints, and server-side operations bypassing RLS policies where necessary.
**Payment Gateway Architecture:** Unified Stripe payment system for all countries and all payment methods. Backend service: `stripe.ts` with integrated coupon management via `stripe-coupons.ts`.

### Feature Specifications
**Admin Portal Features:**
- **Content Management System:** CRUD for a 3-module structure (Practice, Learning, Mock Exams) with hierarchical content, rich text editing, and bulk CSV upload.
- **Trial Module Management (NEW):** Dedicated admin page for managing free trial content with 4 tabs:
  - Practice Manager: Add/edit/delete 6 trial questions (3 numerical + 3 clinical), difficulty levels, explanations
  - Learning Manager: Manage 2 trial lessons with 5 content types (video, audio, text, flashcard, MCQ), 60% unlock threshold
  - Mock Exam Manager: Configure 20-question 30-min trial exam with features (mark for review, answer changes, auto-submit, immediate results), detailed results display, topic breakdown, suggestions
  - Analytics Dashboard: KPIs (trial users, completion rate, avg score, conversion), trends, section breakdown, conversion funnel
- **User Management:** Student and Admin user profiles, OAuth tracking, subscription status, performance metrics, role assignment.
- **Subscription Management:** CRUD for plans and user subscriptions, discount codes, AI message limits, and plan configurations.
- **Dashboard Hero Management:** CRUD for mobile app promotional banners with color customization.
- **Push Notifications:** Compose and send notifications to mobile users with targeting, scheduling, delivery tracking, and automated triggers.
- **Analytics & Dashboard:** Real-time metrics, date-range filtering, trend charts, content analysis, CSV export.
- **Content Approvals System:** Workflow with status and reviewer assignment.
- **Payment Management:** View transactions, process refunds, filter, and export payment statements.
- **Export Functionality:** CSV and PDF export with Jeeva branding and filtering.

**Mobile App Features:**
- **Authentication:** Google/Apple Sign-In, profile completion.
- **Content Gating:** Free trial mode with upgrade prompts.
- **Payment Integration:** Stripe payment processing for all countries (global reach).
- **Core Learning Modules:** Practice MCQs, Learning Content (text, images, audio), Mock Exams.
- **Performance Dashboard:** Progress tracking, exam readiness scores.
- **AI-Powered Features:** JeevaBot (chatbot), personalized weekly study recommendations.
- **Push Notifications:** Expo Push Notifications with deep linking, automated and manual notifications.
- **In-App Notifications:** Notification inbox with read/unread status, badge counts, and user preferences.
- **Hero Sections:** Promotional banners with custom colors.
- **Voice Tutoring:** Real-time voice tutoring with instructors (premium feature, pending implementation).

### Module Architecture & Question Logic
**1. Trial Module (NEW):** Free trial with features from all modules. Access by unauthenticated users.
   - Practice: 3 numerical + 3 clinical questions per subtopic, unlimited attempts, immediate feedback
   - Learning: 1 topic with 2 subtopics, 60% unlock threshold, video/audio/text/flashcard/MCQ content
   - Mock Exam: 20 questions, 30 minutes, auto-submit, detailed results with topic breakdown and suggestions

**2. Practice Module:** Free navigation, unlimited practice, immediate feedback with explanations.
**3. Learning Module:** Structured sequential learning with assessment. Requires ≥80% to unlock the next subtopic, unlimited attempts.
**4. Mock Exam Module:** Real exam simulation. Timed format (3 hours 45 minutes), full question bank, mark for review, auto-submit. Provides detailed results including pass/fail, topic breakdown, and comparison.

### Database Schema for Questions
Questions table includes: `module_type`, `category`, `subdivision`, `lesson_id`, `question_type`, `difficulty`, `points`, `explanation`, `is_active`.

## Stripe Subscription Plans (Nov 30, 2025 - UPDATED) ✅ ONE-TIME PURCHASES

**3 One-Time Subscription Plans (CLEANED & RECREATED):**

1. **Starter Plan** (30 Days)
   - Product ID: `prod_TW9ia1yVYrTLf9` (NEW - Deactivated duplicates)
   - INR 3,000 | USD $34 | GBP £25 ✅
   - Features: Practice MCQs, Learning Content, Basic Study Materials, Email Support

2. **Growth Plan** (90 Days)
   - Product ID: `prod_TW9iUXDnA340NL` (NEW - Deactivated duplicates)
   - INR 8,000 | USD $90 | GBP £68 ✅
   - Features: All Starter + Mock Exams, Performance Analytics, Priority Support, Weekly Recommendations

3. **Ultimate Plan** (150 Days)
   - Product ID: `prod_TW9ix6XY2ikEzJ` (NEW - Deactivated duplicates)
   - INR 15,000 | USD $168 | GBP £127 ✅
   - Features: All Growth + AI JeevaBot, Priority Support, Unlimited Questions, Personalized Study Plan

**Payment Model:** One-time purchase (NO automatic recurring charges - manual renewal only)

**Tax Configuration:** 18% GST (India), 20% VAT (UK), auto-calculated by Stripe

**Cleanup Done:**
- ✅ Created 3 fresh products with exact correct pricing
- ✅ Deactivated 9 old duplicate products from previous attempts
- ✅ API now returns only active, correct prices
- ✅ Admin UI displays correct amounts per country

## Supabase Tables - Cleanup Status (Nov 30, 2025) ✅ FULLY MIGRATED

**COMPLETELY REMOVED** (No longer used anywhere):
- ❌ `subscription_plans` - REMOVED from all code
- ❌ `subscriptions` - REMOVED from all code
- ❌ `prices` - REMOVED from all code
- ❌ `discount_coupons` - Migrated to Stripe API

**ACTIVE TABLES** (Still in use):
- ✅ `user_profiles` - User data
- ✅ `payment_customers` - Maps users to Stripe/Razorpay customers
- ✅ `payments` - Payment records
- ✅ `payment_refunds` - Refund tracking
- ✅ `notification_*` - Push notifications
- ✅ `chat_*` - AI chatbot conversations
- ✅ `content_*` - Learning content and approvals

**Code Migration Done (Nov 30, 2025):**
- ✅ Removed Supabase queries from DiscountCouponsPage (now uses Stripe API `/api/stripe-coupons`)
- ✅ Removed Supabase queries from SubscriptionPlansPage (now uses Stripe API)
- ✅ Fixed API URL configuration for Replit preview environment (dynamic domain detection)
- ✅ Updated /api/subscriptions/* endpoints (deprecated, returns 410)
- ✅ Updated /api/stripe-admin/prices to fetch directly from Stripe API
- ✅ Added `/api/stripe-coupons` CRUD endpoints (Create, Read, Update, Delete, Validate)
- ✅ Added `/api/stripe-admin/setup-plans` endpoint to batch create new plans
- ✅ Modified POST /api/stripe-admin/prices to support one-time (non-recurring) pricing
- ✅ Updated DiscountCouponsPage to use Stripe coupons instead of Supabase
- ✅ Full TypeScript implementation with proper error handling

**Result:** All pricing and coupons are now 100% managed by Stripe. Zero Supabase database queries for subscription data.

## External Dependencies

**Third-Party Services:**
- **Supabase:** Database, authentication, user management, RLS, storage.
- **Resend:** Transactional email service.
- **Stripe:** Global payment processing (all countries and currencies).
- **Google Gemini AI:** Powers JeevaBot and AI recommendations.
- **Expo Push:** Mobile push notification service.

**Key NPM Packages:**
- **UI & Styling:** `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`.
- **State & Data:** `zustand`, `@tanstack/react-query`, `@supabase/supabase-js`.
- **Utilities:** `react-router-dom`, `notistack`, `date-fns`, `clsx`.
- **Export & PDF:** `jsPDF`, `html2canvas`, `papaparse`.

**Environment Configuration:**
- Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `STRIPE_PUBLISHABLE_KEY`
- Backend Server: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `EXPO_ACCESS_TOKEN`
- Payment Gateway: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`

**Database Schema:** Supabase PostgreSQL with tables for users, admin, content, learning data, AI, payments, platform, and analytics. Key tables include `user_profiles`, `admin_users`, `modules`, `topics`, `lessons`, `flashcards`, `questions`, `subscriptions`, `subscription_plans`, `discount_coupons`, `hero_sections`, `email_templates`, `analytics_sessions`, `chat_conversations`, `chat_messages`, `ai_usage_stats`, `push_tokens`, `notifications`, `notification_targets`, `notification_queue`, `user_notification_reads`, `notification_preferences`, `payment_customers`, `payments`, `payment_refunds`, `payment_methods`, `payment_webhook_events`, `learning_progress`, `mock_exam_attempts`, `prices`, `stripe_products`, `country_currency_map`. Utilizes PostgreSQL RPC functions and comprehensive RLS policies.

## Documentation

**Complete documentation is organized in `/docs/`:**
- **01-Admin-Portal/** - Admin dashboard UI specs and features
- **02-Mobile-App/** - Mobile app architecture and implementation
- **03-Database/** - Database schema and content structure
- **04-Backend/** - API documentation and services
- **05-Architecture/** - System design and AI implementation
- **06-Development/** - Development guides and testing
- **07-Deployment/** - Deployment and release procedures

**Start with:** [docs/README.md](./docs/README.md) for complete documentation guide.