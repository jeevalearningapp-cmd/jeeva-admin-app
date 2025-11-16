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

## External Dependencies

**Third-Party Services:**
- **Supabase:** Database, authentication, user management, RLS, storage.
- **Resend:** Transactional email service.
- **Stripe:** International payment processing.
- **Razorpay:** Indian payment processing.
- **Google Gemini AI:** Powers JeevaBot and AI recommendations.

**Key NPM Packages:**
- **UI & Styling:** `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`.
- **State & Data:** `zustand`, `@tanstack/react-query`, `@supabase/supabase-js`.
- **Utilities:** `react-router-dom`, `notistack`, `date-fns`, `clsx`.

**Environment Configuration:**
- Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Backend Server: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `RESEND_API_KEY`
- Payment Gateways: `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

**Database Schema:** Supabase PostgreSQL with tables for users, admin, content, learning data, AI, payments, platform, and analytics. Key tables include `user_profiles`, `admin_users`, `modules`, `topics`, `lessons`, `flashcards`, `questions`, `subscriptions`, `subscription_plans` (with `config` JSONB for technical settings like AI limits), `discount_coupons`, `hero_sections`, `email_templates`, `analytics_sessions`, `chat_conversations`, `chat_messages`, `ai_usage_stats`, `push_tokens`, `notifications`, `notification_targets`, `notification_queue`, `user_notification_reads` (tracks read status), `notification_preferences` (user notification settings), `payment_customers` (gateway customer records), `payments` (payment transactions with Stripe/Razorpay IDs), `payment_refunds` (refund records), `payment_methods` (saved payment methods), `payment_webhook_events` (webhook event log for debugging). Utilizes PostgreSQL RPC functions (`get_user_notifications_with_read_status`, `get_unread_notification_count`) and comprehensive RLS policies.