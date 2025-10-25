# Jeeva Learning Platform

## Overview

**Jeeva Learning** is a comprehensive educational technology platform designed specifically for **Indian nurses preparing for the UK NMC CBT (Nursing and Midwifery Council Computer-Based Test)**. The platform helps nursing professionals pass their certification exam to work in the UK healthcare system.

The ecosystem consists of two main components:

### 1. Mobile App (React Native/Expo - iOS & Android)
A student-facing mobile application offering:
- **3 Core Learning Modules:** Practice MCQs, Learning Content, and Mock Exams
- **Scenario-based Learning:** Clinical scenarios covering Numeracy, Clinical Knowledge, and NMC Code (Professional Standards)
- **AI-Powered Features:** JeevaBot chatbot for instant doubt clearing and weekly personalized study recommendations
- **Profile Performance Dashboard:** Track progress, exam readiness scores, and weak area identification
- **Dual Payment Integration:** Stripe (international) and Razorpay (India) with duration-based subscriptions
- **Free Trial Mode:** Access to 1 learning module + 1 practice module before purchase

### 2. Admin Portal (React + TypeScript + Vite - Web)
A powerful administrative dashboard for content creators and platform managers featuring:
- **Content Management System:** Create and manage modules, topics, lessons, flashcards, and questions
- **Student User Management:** View all registered students, subscription status, and performance analytics
- **Subscription & Payment Management:** Manage subscription plans, discount coupons, and payment tracking
- **Dashboard Hero Management:** Configure promotional banners for mobile app home screen
- **Analytics & Reporting:** Real-time metrics, usage statistics, and CSV data exports
- **Role-Based Access Control:** Superadmin, Editor, and Moderator roles with granular permissions

**Target Market:** Indian nursing graduates preparing for UK NMC CBT examination
**Subscription Plans:** 30/60/90/120 days access in USD ($49-$149)
**Revenue Model:** Duration-based subscriptions with trial-to-paid conversion

## Recent Changes (October 2025)

### NMC Course Structure Restructuring

**Major architectural change:** Converted from flexible CMS to fixed 3-module NMC-specific structure.

**3 Fixed Modules:**
1. **Practice Module** - Topic-wise practice with 50+ questions per subdivision
   - Numeracy: Dosage Calculations, Unit Conversions, IV Flow Rates, Fluid Balance
   - Clinical Knowledge: Medical-Surgical, Pharmacology, Infection Control, Wound Care, Palliative Care

2. **Learning Module** - Structured lessons (video + audio + text + quiz)
   - 8 fixed topics: Numeracy, NMC Code, Mental Capacity Act, Safeguarding, Consent & Confidentiality, Equality & Diversity, Duty of Candour, Cultural Adaptation
   - Each topic requires 80% quiz score to progress

3. **Mock Exams** - Real exam simulator with random question selection
   - Part A: 15 numeracy questions, 30 minutes, no calculator
   - Part B: 120 clinical questions, 150 minutes
   - Questions randomly selected from 500+ question pool

**Database Changes:**
- Added question tagging: `module_type`, `category`, `subdivision`, `exam_part`
- Modules are now fixed (cannot be created/deleted by admins)
- Questions managed via centralized Content Management page
- Bulk CSV upload support for efficient question entry

**Admin Panel Changes:**
- New unified Content Management page replacing separate module/topic/question pages
- Module selector (3 fixed options) with dynamic category/subdivision selectors
- Question management with filtering by module type, category, and subdivision
- CSV bulk upload with downloadable templates

**Latest Implementation (October 25, 2025):**
✅ **Complete Question Management System**
- Fixed SQL migration CHECK constraint bug for exam_part column
- Added 10 diverse sample questions covering all module types
- Implemented Supabase React Query hooks with filtering support
- Built QuestionManager component with full CRUD operations
- Created CSVBulkUpload component with preview and validation
- Integrated delete confirmation dialogs
- Real-time question filtering by module/category/subdivision/exam_part
- Loading states and error handling throughout

✅ **Flashcard System for Learning Module**
- Added `category` column to flashcards table for topic-level organization
- Extended flashcardsAPI with `getByCategory` method for topic filtering
- Created `useFlashcardsByCategory` React Query hook with proper cache invalidation
- Built FlashcardManager component with full CRUD interface (front/back cards)
- Implemented FlashcardCSVUpload component with template download and preview
- Integrated Flashcards tab into Learning Module ContentManagementPage
- Database migration to add category support and make lesson_id nullable
- Fixed React Query invalidation for category-scoped cache consistency
- Comprehensive documentation in FLASHCARD_SETUP.md

## User Preferences

Preferred communication style: Simple, everyday language.

### UI/UX Customizations
- **Header Design**: Clean, minimal dashboard header with modern styling
- **Theme Icons**: WbSunnyOutlined (Light mode), ContrastOutlined (Dark mode)
- **User Display**: Simple avatar with dropdown menu (role visible in menu)

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **UI Library:** Material-UI (MUI) v7 with Emotion
- **Routing:** React Router DOM v7
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query (v5)
- **Notifications:** Notistack
- **Utilities:** clsx, date-fns

**Design Patterns:**
- Component-based architecture organized by feature domains.
- Path aliases using `@/*`.
- Strict TypeScript configuration.
- CSS-in-JS using Emotion.

**Routing Structure:**
- Public routes: `/login`.
- Protected routes: `/dashboard`, `/users`, `/admin-users`, `/subscriptions`, `/content/*`, `/approvals`, `/settings`, `/analytics`, `/dashboard-hero`, `/profile`.
- Nested routes for content management (modules, topics, lessons, questions, flashcards).
- Dynamic routes for entity details.
- All protected routes wrapped with `ProtectedRoute` component and `MainLayout`.

**UI/UX Approach:**
- Material Design system with custom theming and subtle rounded corners (8px borderRadius).
- Full-height sidebar with app branding and collapsible icon-only mode.
- Responsive header positioned right of sidebar.
- Modal/drawer overlays with gradient backgrounds and layered shadows.
- Role-adaptive menus based on user permissions.
- Consistent color palette (primary #007aff, secondary #181C32).
- White backgrounds and light grey borders for cards and papers.
- Refined typography with Inter font family.
- Professional form components with reduced heights.
- Interactive card layouts with hover effects.
- Supports light and dark modes with dynamic switching and `localStorage` persistence.
- Custom theme includes adaptive color palette, refined typography, and centralized component styling with enhanced overrides.

### Backend Architecture

**Backend-as-a-Service:**
- **Supabase:** Provides authentication, PostgreSQL database, and real-time capabilities using `supabase-js` SDK.
- Row Level Security (RLS) policies for data access control.

**Authentication & Authorization:**
- Supabase Auth for user authentication.
- Role-based access control (Superadmin, Editor, Moderator).
- `AuthContext` manages global auth state.
- Login verifies user in `admin_users` table with `is_active = true`.
- `ProtectedRoute` component enforces authentication and role-based permissions.

**Data Architecture:**
- Relational data model including Users, Subscriptions, Content (modules, topics, lessons, questions, flashcards), Practice Sessions, Mock Exams, Learning Completions, AI Recommendations, and Admin Users.
- All tables use UUID primary keys with foreign key relationships.

### Feature Specifications

**Admin Portal Features:**
- **Content Management System:** Hierarchical CRUD for Modules, Topics, Lessons, Questions, and Flashcards with media upload support. Lessons support `audio_url` for podcast-style content.
- **Student User Management:** View all registered students, OAuth provider tracking, profile completion status, subscription details, and performance metrics.
- **Subscription Management:** CRUD for Subscription Plans and User Subscriptions with analytics, status tracking, and manual adjustments.
- **Discount/Coupon Management:** Create and manage discount codes (percentage/fixed), set expiry dates, usage limits, and track redemption statistics.
- **Dashboard Hero Management:** CRUD for mobile app hero sections with image upload, CTA configuration, and display order management.
- **CSV Bulk Upload System:** Bulk upload for Lessons, Questions, and Flashcards with downloadable templates, parsing, validation, preview, and error reporting.
- **Analytics & Dashboard:** Real-time metrics with 100% real data from Supabase (zero mock values), optimized RPC functions for performance, date-range filtering, key metric cards, trend charts, top content analysis, CSV export. Uses `analytics_sessions` table for engagement tracking and PostgreSQL functions for efficient distinct user counting.
- **Admin User Management:** Data tables, search, pagination, detail drawers, CRUD operations, status management, role assignment (Superadmin/Editor/Moderator).
- **Content Approvals System:** Full approval workflow with status management, reviewer assignment, and approval stats.
- **Settings Management:** Platform configuration UI for general, security, and notification settings, including email templates.
- **Security & Stability:** ErrorBoundary, SnackbarProvider, ErrorHandler utility, and security utilities.

**Mobile App Features:**
- **OAuth Authentication:** Google Sign-In and Apple Sign-In support with automatic profile creation.
- **Profile Completion Flow:** Mandatory onboarding after first signup collecting essential information (country for payment routing, NMC attempts, nursing preferences).
- **Trial Mode & Content Gating:** Free access to 1 learning module + 1 practice module, with upgrade prompts on premium content (mock exams locked).
- **Dual Payment Integration:** Country-based routing to Stripe (international) or Razorpay (India) with support for cards, UPI, and wallets.
- **3 Core Learning Modules:**
  - **Practice MCQs:** Topic-wise practice questions with instant feedback and explanations
  - **Learning Content:** Structured lessons with text, images, and audio (podcast mode)
  - **Mock Exams:** Full-length timed exams simulating actual NMC CBT test
- **Profile Performance Dashboard:** Progress tracking, completion rates, streak maintenance, exam readiness scores.
- **AI-Powered Features:**
  - **JeevaBot Chatbot:** Context-aware AI tutor for instant doubt clearing and study guidance
  - **Performance Recommendations:** Weekly personalized study plans with weak area identification, daily targets, and motivational messages
- **Hero Sections:** Promotional banners on home screen (managed from admin portal)
- **Subscription Plans:** 30/60/90/120 days access in USD with discount coupon support

## External Dependencies

**Third-Party Services:**
- **Supabase:** Primary backend service for PostgreSQL database, authentication, user management, RLS, and storage.
- **Resend:** Email service for sending transactional emails (3,000 emails/month, 100 emails/day free tier).
- **Stripe:** Payment processing for international students (cards, digital wallets).
- **Razorpay:** Payment processing for Indian students (cards, UPI, wallets, net banking).
- **Google Gemini AI:** Powers JeevaBot chatbot and AI performance recommendations.

**Key NPM Packages:**
- **UI & Styling:** `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`.
- **State & Data:** `zustand`, `@tanstack/react-query`, `@supabase/supabase-js`.
- **Utilities:** `react-router-dom`, `notistack`, `date-fns`, `clsx`.

**Environment Configuration:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key for client-side access
- `RESEND_API_KEY` - Email service API key (admin portal)
- `STRIPE_SECRET_KEY` - Stripe payment processing (mobile app backend)
- `RAZORPAY_KEY_ID` - Razorpay key ID (mobile app)
- `RAZORPAY_KEY_SECRET` - Razorpay secret (mobile app backend)
- `GEMINI_API_KEY` - Google Gemini AI for chatbot and recommendations

**Database Schema:**
Supabase PostgreSQL database with tables:
- **Users & Auth:** `users` (Supabase auth), `user_profiles` (extended profile with nursing fields, OAuth tracking, profile completion status)
- **Admin:** `admin_users` (role-based access for portal)
- **Content:** `modules`, `topics`, `lessons` (with audio support), `flashcards`, `questions`, `question_options`
- **Learning Data:** `practice_sessions`, `mock_exams`, `learning_completions`
- **AI & Recommendations:** `ai_recommendations`, `chatbot_conversations`
- **Payments:** `subscriptions`, `discount_coupons` (with usage tracking)
- **Platform:** `hero_sections` (mobile app banners), `email_templates`
- **Analytics:** `analytics_sessions` (engagement tracking for metrics, separate from auth-focused user_sessions), `daily_stats` (aggregated daily metrics)
- **PostgreSQL RPC Functions:** `count_distinct_active_users(days_ago)`, `count_distinct_users_by_day(target_date)` for optimized performance
- Comprehensive RLS policies implemented across all content tables for secure data access.

**Email System:**
- Utilizes an Express.js backend API server (`server/index.ts`) on port 3001 for secure email sending via Resend.
- Frontend API client at `src/api/email.ts` interacts with the backend.
- Vite proxy configured: `/api/email` → `http://localhost:3001` (enables frontend-backend communication in Replit cloud environment).
- Available email templates: Test, Welcome, Subscription Confirmation, Payment Receipt, Subscription Expiring.
- Email templates are stored in the `email_templates` Supabase table.
- Test page: `/email-test` (Superadmin only) - Quick email sending test interface.