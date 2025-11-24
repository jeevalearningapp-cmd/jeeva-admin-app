# Jeeva Learning Platform

## Overview

Jeeva Learning is an educational technology platform designed to assist Indian nurses in preparing for the UK NMC CBT exam to facilitate their certification to work in the UK healthcare system. The platform offers a mobile app with practice MCQs, learning content, mock exams, AI-powered features (JeevaBot, personalized recommendations), performance tracking, and dual payment integration. An accompanying admin portal provides comprehensive content, user, and subscription management, along with analytics and role-based access control. The primary goal is to help Indian nursing graduates pass their certification, with flexible subscription plans available.

## User Preferences

Preferred communication style: Simple, everyday language.

### UI/UX Customizations
- **Header Design**: Clean, minimal dashboard header with modern styling
- **Theme Icons**: WbSunnyOutlined (Light mode), ContrastOutlined (Dark mode)
- **User Display**: Simple avatar with dropdown menu (role visible in menu)

## System Architecture

### Frontend Architecture

**Technology Stack:** React 18, TypeScript, Vite 5, Material-UI (MUI) v7 with Emotion, React Router DOM v7, Zustand, TanStack React Query (v5), Notistack.

**Design Patterns:** Component-based architecture by feature, path aliases (`@/*`), strict TypeScript, CSS-in-JS (Emotion).

**Routing Structure:** Public (`/login`) and protected routes (`/dashboard`, `/content/*`), with nested and dynamic routes, utilizing `ProtectedRoute` and `MainLayout`.

**UI/UX Approach:** Material Design with custom theming (8px borderRadius), full-height collapsible sidebar, responsive header, modal/drawer overlays with gradients, role-adaptive menus, consistent color palette (primary #007aff, secondary #181C32), Inter font family, professional form components, interactive card layouts, light/dark mode support with `localStorage` persistence.

### Backend Architecture

**Backend-as-a-Service:** Supabase (PostgreSQL database, authentication, real-time) with Row Level Security (RLS).

**Authentication & Authorization:** Supabase Auth, role-based access (Superadmin, Editor, Moderator), `AuthContext` for global state, `ProtectedRoute` for enforcement.

**Data Architecture:** Relational model with UUID primary keys.

**Backend API Server:** Express.js server providing email services, AI chat endpoints (JeevaBot), payment processing endpoints, and server-side operations bypassing RLS policies where necessary.

**Payment Gateway Architecture:** Dual payment gateway system with smart country-based routing (Stripe for international, Razorpay for India). Backend services include `stripe.ts`, `razorpay.ts`, and `payment.ts` (unified routing).

### Feature Specifications

**Admin Portal Features:**
- **Content Management System:** CRUD for a 3-module structure (Practice, Learning, Mock Exams) with hierarchical content, rich text editing, and bulk CSV upload.
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
- **Payment Integration:** Country-based routing to Stripe or Razorpay.
- **Core Learning Modules:** Practice MCQs, Learning Content (text, images, audio), Mock Exams.
- **Performance Dashboard:** Progress tracking, exam readiness scores.
- **AI-Powered Features:** JeevaBot (chatbot), personalized weekly study recommendations.
- **Push Notifications:** Expo Push Notifications with deep linking, automated and manual notifications.
- **In-App Notifications:** Notification inbox with read/unread status, badge counts, and user preferences.
- **Hero Sections:** Promotional banners with custom colors.
- **Voice Tutoring:** Real-time voice tutoring with instructors (premium feature, pending implementation).

### Module Architecture & Question Logic

**1. Practice Module:** Familiarization with exam scenarios. Free navigation, unlimited practice, immediate feedback with explanations.
**2. Learning Module:** Structured sequential learning with assessment. Content viewing (video, audio, readable lesson) followed by assessment questions. Requires ≥80% to unlock the next subtopic, unlimited attempts.
**3. Mock Exam Module:** Real exam simulation. Timed format (3 hours 45 minutes), full question bank, mark for review, auto-submit. Provides detailed results including pass/fail, topic breakdown, and comparison.

### Database Schema for Questions

Questions table includes: `module_type`, `category`, `subdivision`, `lesson_id`, `question_type`, `difficulty`, `points`, `explanation`, `is_active`.

## External Dependencies

**Third-Party Services:**
- **Supabase:** Database, authentication, user management, RLS, storage.
- **Resend:** Transactional email service.
- **Stripe:** International payment processing.
- **Razorpay:** Indian payment processing.
- **Google Gemini AI:** Powers JeevaBot and AI recommendations.
- **Expo Push:** Mobile push notification service.

**Key NPM Packages:**
- **UI & Styling:** `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`.
- **State & Data:** `zustand`, `@tanstack/react-query`, `@supabase/supabase-js`.
- **Utilities:** `react-router-dom`, `notistack`, `date-fns`, `clsx`.
- **Export & PDF:** `jsPDF`, `html2canvas`, `papaparse`.

**Environment Configuration:**
- Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Backend Server: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `EXPO_ACCESS_TOKEN`
- Payment Gateways: `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

**Database Schema:** Supabase PostgreSQL with tables for users, admin, content, learning data, AI, payments, platform, and analytics. Key tables include `user_profiles`, `admin_users`, `modules`, `topics`, `lessons`, `flashcards`, `questions`, `subscriptions`, `subscription_plans`, `discount_coupons`, `hero_sections`, `email_templates`, `analytics_sessions`, `chat_conversations`, `chat_messages`, `ai_usage_stats`, `push_tokens`, `notifications`, `notification_targets`, `notification_queue`, `user_notification_reads`, `notification_preferences`, `payment_customers`, `payments`, `payment_refunds`, `payment_methods`, `payment_webhook_events`, `learning_progress`, `mock_exam_attempts`. Utilizes PostgreSQL RPC functions and comprehensive RLS policies.