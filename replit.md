# Jeeva Learning Platform

## Overview

Jeeva Learning is an educational technology platform designed to assist Indian nurses in preparing for the UK NMC CBT exam. It aims to facilitate their certification to work in the UK healthcare system. The platform offers a mobile app with practice MCQs, learning content, mock exams, AI-powered features (JeevaBot, personalized recommendations), performance tracking, and dual payment integration. An accompanying admin portal provides comprehensive content, user, and subscription management, along with analytics and role-based access control. The primary goal is to help Indian nursing graduates pass their certification, with flexible subscription plans available.

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

**Routing Structure:** Public (`/login`) and protected routes (`/dashboard`, `/content/*`), with nested and dynamic routes. Protected routes utilize `ProtectedRoute` and `MainLayout`.

**UI/UX Approach:** Material Design with custom theming (8px borderRadius), full-height collapsible sidebar, responsive header, modal/drawer overlays with gradients, role-adaptive menus, consistent color palette (primary #007aff, secondary #181C32), Inter font family, professional form components, interactive card layouts, light/dark mode support with `localStorage` persistence.

### Backend Architecture

**Backend-as-a-Service:** Supabase (PostgreSQL database, authentication, real-time) with Row Level Security (RLS).

**Authentication & Authorization:** Supabase Auth, role-based access (Superadmin, Editor, Moderator), `AuthContext` for global state, `ProtectedRoute` for enforcement.

**Data Architecture:** Relational model with UUID primary keys.

**Backend API Server:** Express.js server (`server/index.ts`) providing email services, AI chat endpoints (JeevaBot), payment processing endpoints (Stripe/Razorpay), and server-side operations bypassing RLS policies where necessary.

**Payment Gateway Architecture:** Dual payment gateway system with smart country-based routing. Stripe handles international payments (UK, US, etc.) while Razorpay handles Indian payments (offering 0% UPI fees). Backend services in `server/services/` include stripe.ts, razorpay.ts, and payment.ts (unified routing). Payment API endpoints at `/api/payments` for creation, verification, refunds, and webhook handling. Mobile integration guides provided in `docs/mobile-app-payment-gateway/` for React Native team.

### Feature Specifications

**Admin Portal Features:**
- **Content Management System:** CRUD for a 3-module structure (Practice, Learning, Mock Exams) with hierarchical content (topics, lessons, questions, flashcards), rich text editing (TipTap), and bulk CSV upload.
- **User Management:** Student and Admin user profiles, OAuth tracking, subscription status, performance metrics, role assignment.
- **Subscription Management:** CRUD for plans and user subscriptions, discount codes, and management of AI message limits and plan configurations via inline editing.
- **Dashboard Hero Management:** CRUD for mobile app promotional banners.
- **Push Notifications:** Compose and send notifications to mobile users, user targeting (all, subscription tier, active users), scheduling, delivery tracking, campaign history with metrics, automated triggers for events (subscription expiring, content approved/rejected, welcome messages).
- **Analytics & Dashboard:** Real-time metrics, date-range filtering, trend charts, content analysis, CSV export.
- **Content Approvals System:** Workflow with status and reviewer assignment.
- **Payment Management:** View all transactions, process refunds, filter by status/gateway/date, export payment statements (CSV/PDF).
- **Export Functionality:** CSV and PDF export with Jeeva branding, period selection, multi-content filtering.

**Mobile App Features:**
- **Authentication:** Google/Apple Sign-In, profile completion.
- **Content Gating:** Free trial mode with upgrade prompts.
- **Payment Integration:** Country-based routing to Stripe (international) or Razorpay (India).
- **Core Learning Modules:** Practice MCQs, Learning Content (text, images, audio), Mock Exams.
- **Performance Dashboard:** Progress tracking, exam readiness scores.
- **AI-Powered Features:** JeevaBot (chatbot), personalized weekly study recommendations.
- **Push Notifications:** Expo Push Notifications with deep linking, automated and manual notifications from admin portal.
- **In-App Notifications:** Notification inbox with read/unread status, badge counts, mark as read functionality, notification preferences (push/email/in-app channels, notification types, quiet hours).
- **Hero Sections:** Promotional banners.

## Module Architecture & Question Logic

### Three Distinct Modules

**1. Practice Module** - Familiarization with exam scenarios
- Topics: Numeracy (Dosage, Unit Conversions, IV Flow, Fluid Balance), Clinical Knowledge (Medical-Surgical, Pharmacology, Infection Control, Wound Care, Palliative Care)
- User Flow: Select Topic → Select Subtopic → Answer Questions → See Results
- Question Logic: Free navigation, no progression requirements, unlimited practice, immediate feedback with explanations
- Display: One question at a time with 4 options (A, B, C, D)

**2. Learning Module** - Structured sequential learning with assessment
- Topics: 8 sequential topics (Numeracy 1.1-1.4, NMC Code 2.1-2.4, MCA 3.1-3.4, Safeguarding 4.1-4.3, Consent & Confidentiality 5.1-5.3, Equality & Diversity 6.1-6.3, Duty of Candour 7.1-7.2, Cultural Adaptation 8.1-8.2)
- Content per Subtopic: Video (10-15 min) + Podcast/Audio (15-20 min) + Readable Lesson (accordion format)
- Question Logic: 10-15 assessment questions per subtopic after content viewing, must achieve 80% to unlock next subtopic, unlimited attempts
- User Flow: View Content → Start Assessment → Answer Questions → Calculate Score → If ≥80% pass, unlock next; if <80%, retry
- Display: Questions only shown after content consumption, sequential unlock, progress bar shows completed/locked/current topics

**3. Mock Exam Module** - Real exam simulation
- Structure: Full question bank from all topics combined
- Duration: 3 hours 45 minutes (matches real NMC CBT)
- Question Logic: Timed format, all questions visible with navigation, can mark for review, auto-submit on time end
- User Flow: Start Exam → Answer Questions with Timer → Submit → View Detailed Results
- Results Include: Final score, pass/fail status, topic-wise breakdown, comparison with previous attempts

### Database Schema for Questions

Questions table includes: `module_type` ('practice'|'learning'|'mock_exam'), `category` (topic name), `subdivision` (subtopic code like 1.1), `lesson_id` (for learning module), `question_type`, `difficulty`, `points`, `explanation`, `is_active`

## External Dependencies

**Third-Party Services:**
- **Supabase:** Database, authentication, user management, RLS, storage.
- **Resend:** Transactional email service.
- **Stripe:** International payment processing.
- **Razorpay:** Indian payment processing.
- **Google Gemini AI:** Powers JeevaBot and AI recommendations.
- **Expo Push:** Mobile push notification service (fully integrated with automatic queue processing).

**Key NPM Packages:**
- **UI & Styling:** `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`.
- **State & Data:** `zustand`, `@tanstack/react-query`, `@supabase/supabase-js`.
- **Utilities:** `react-router-dom`, `notistack`, `date-fns`, `clsx`.
- **Export & PDF:** `jsPDF`, `html2canvas`, `papaparse`.

**Environment Configuration:**
- Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Backend Server: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `EXPO_ACCESS_TOKEN`
- Payment Gateways: `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

**Database Schema:** Supabase PostgreSQL with tables for users, admin, content, learning data, AI, payments, platform, and analytics. Key tables include `user_profiles`, `admin_users`, `modules`, `topics`, `lessons`, `flashcards`, `questions`, `subscriptions`, `subscription_plans` (with `config` JSONB for technical settings like AI limits), `discount_coupons`, `hero_sections`, `email_templates`, `analytics_sessions`, `chat_conversations`, `chat_messages`, `ai_usage_stats`, `push_tokens`, `notifications`, `notification_targets`, `notification_queue`, `user_notification_reads` (tracks read status), `notification_preferences` (user notification settings), `payment_customers` (gateway customer records), `payments` (payment transactions with Stripe/Razorpay IDs), `payment_refunds` (refund records), `payment_methods` (saved payment methods), `payment_webhook_events` (webhook event log for debugging), `learning_progress` (tracks user progress through learning modules), `mock_exam_attempts` (tracks mock exam attempts). Utilizes PostgreSQL RPC functions and comprehensive RLS policies.

## Current Status

### ✅ Complete - Admin Portal
- Dashboard with analytics
- Content Management (CRUD for modules, topics, lessons, questions, flashcards)
- User Management with role-based access
- Subscription management with inline editing
- Payment management with transaction history, refunds, and export
- Push notifications with admin UI (compose, schedule, track delivery)
- In-app notification inbox ready for mobile
- Email template management
- Settings (logo, favicon, notification images)
- Export functionality (CSV & PDF with Jeeva branding)
- 56 passing tests validating all critical features

### 🚀 Production Ready
- Backend API with Express.js
- Push notification service with automatic queue processing (2-minute intervals) and receipt tracking (5-minute intervals)
- Expo integration configured
- All environment secrets set up
- RLS policies for data security
- Mobile implementation checklist with 16 phases including voice tutoring feature

### 📱 Mobile Implementation Pending
- Modules: Practice (9 subtopics), Learning (21 subtopics with sequential unlock), Mock Exam (full simulation)
- Authentication (OAuth + email)
- Content consumption (video, audio, lesson viewing)
- Question rendering with module-specific logic
- Learning progress tracking (80% pass requirement, sequential unlock)
- Mock exam timer and navigation
- Payment integration (Stripe/Razorpay country routing)
- Push and in-app notifications
- Real-time voice tutoring with instructors (premium feature)

## Recent Changes (November 21, 2025)

- ✅ Completed Push Notifications Phase 4 - Expo integration with automatic queue & receipt processing
- ✅ Implemented Payment Management Page with export functionality
- ✅ Created comprehensive test suite (56 tests, 100% pass rate)
- ✅ Added Real-time Voice Tutoring documentation to mobile checklist
- ✅ Finalized Module & Question Logic documentation for all three modules
- ✅ Updated MOBILE_IMPLEMENTATION_CHECKLIST with voice tutoring integration
