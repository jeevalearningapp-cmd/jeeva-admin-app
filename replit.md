# Jeeva Learning Platform

## Overview

Jeeva Learning is an educational technology platform for Indian nurses preparing for the UK NMC CBT exam. It aims to help nursing professionals pass their certification to work in the UK healthcare system.

The platform includes:
- **Mobile App (React Native/Expo):** Offers practice MCQs, learning content, mock exams, AI-powered features (JeevaBot, personalized recommendations), performance tracking, and dual payment integration (Stripe, Razorpay) with a free trial.
- **Admin Portal (React + TypeScript + Vite):** A dashboard for content creation and management, student and subscription management, analytics, and role-based access control.

The target market is Indian nursing graduates, with subscription plans ranging from 30 to 120 days.

## User Preferences

Preferred communication style: Simple, everyday language.

### UI/UX Customizations
- **Header Design**: Clean, minimal dashboard header with modern styling
- **Theme Icons**: WbSunnyOutlined (Light mode), ContrastOutlined (Dark mode)
- **User Display**: Simple avatar with dropdown menu (role visible in menu)

## Recent Changes

### November 15, 2025 - Subscription Plans Management Feature
- **Admin Portal Enhancement**: Added new Subscription Plans management page (`/subscription-plans`)
- **AI Message Limit Control**: Superadmins can now view and edit AI message limits for each subscription plan through the UI
- **Inline Editing**: Single-click editing with real-time validation and immediate server sync
- **Features**:
  - Table view of all subscription plans with pricing, duration, and AI limits
  - Inline text field editing for `ai_messages_per_day` config values
  - Input validation: enforces positive integers (minimum 1)
  - Null-safe price rendering (displays "N/A" if price not set)
  - Real-time updates with automatic data refetch after successful save
- **Navigation**: Added "Subscription Plans" menu item (Superadmin-only access)
- **Technical Implementation**:
  - Component: `src/pages/SubscriptionPlansPage.tsx`
  - Route: `/subscription-plans` (protected, Superadmin role only)
  - Updates `subscription_plans.config` JSONB field directly in Supabase
  - No database schema changes required (uses existing `config` column)

### November 2, 2025 - Navigation Cleanup & Page Renaming
- **Removed Duplicate Pages**: Eliminated duplicate "Users" page that showed the same data as "Students" page
- **Navigation Reorganization**: Cleaned up admin portal navigation menu:
  - Removed: "Users" page (duplicate)
  - Renamed: "Students" → "Mobile App Users" (clearer naming)
  - Kept: "Admin Users" (for admin portal access management)
- **Route Updates**: Updated all routes and page titles to reflect new naming convention
  - `/students` → `/mobile-app-users`
  - Page title: "Student Users" → "Mobile App Users"
  - Drawer title: "Student Details" → "User Details"
- **Cleanup**: Deleted unused `UsersPage.tsx` file and removed all references

### November 2, 2025 - Phase 1 AI Chatbot Backend (JeevaBot) Implementation
- **AI Integration**: Integrated Google Gemini 2.5-flash model for context-aware chatbot responses
- **Chat API Endpoints**: Created complete REST API for chat functionality:
  - `POST /api/chat/send` - Send messages and receive AI responses
  - `GET /api/chat/conversations/:userId` - Fetch conversation history
  - `GET /api/chat/messages/:conversationId` - Get messages in a conversation
  - `GET /api/chat/rate-limit/:userId` - Check remaining daily messages
- **Subscription-Based Rate Limiting**: AI message limits dynamically controlled via `subscription_plans.config` JSONB field:
  - Free Trial: 10 messages/day
  - 30/60 Day Plans: 50 messages/day
  - 90 Day Plan: 75 messages/day
  - 120 Day Plan: 100 messages/day
- **Context-Aware Responses**: JeevaBot fetches user's current lesson, practice history, and weak topics for personalized responses
- **Database Schema Updates**:
  - Added `config` JSONB column to `subscription_plans` table for technical settings
  - Created `get_user_ai_limit(user_id)` PostgreSQL RPC function to fetch AI limits from subscription config
  - Fixed `price` vs `price_usd` column mapping in TypeScript API layer
- **Documentation Created**:
  - `docs/MOBILE_APP_CHAT_INTEGRATION.md` - Complete React Native integration guide with code examples
  - `docs/SUBSCRIPTION_PLANS_SETUP.md` - Guide for creating/modifying subscription plans and AI limits
- **Environment Variables**: Requires `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` for server-side operations
- **Mobile App Ready**: API endpoints tested and ready for React Native/Expo integration

### November 2, 2025 - Learning Module Structure Update (8 Topics)
- **Numeracy Subtopic Addition**: Added 4 subtopics to Numeracy (previously had none):
  - 1.1 Dosage Calculations: Tablets, liquids, IV medications
  - 1.2 Unit Conversions: mg ↔ mcg, kg ↔ lbs, mL ↔ L
  - 1.3 IV Flow Rate Calculations: Drip rates, infusion times
  - 1.4 Fluid Balance: Fluid charts, BMI, nutrition
- **Subtopic ID Renumbering**: All subtopic IDs renumbered to accommodate Numeracy:
  - The NMC Code: 1.x → 2.x
  - Mental Capacity Act: 2.x → 3.x
  - Safeguarding: 3.x → 4.x
  - Consent & Confidentiality: 4.x → 5.x
  - Equality & Diversity: 5.x → 6.x
  - Duty of Candour: 6.x → 7.x
  - Cultural Adaptation: 7.x → 8.x
- **Documentation Updates**: Updated all docs to reflect 8 topics with consistent subtopic structure
- **Migration Guide**: Created `docs/LEARNING_MODULE_MIGRATION_GUIDE.md` with complete SQL migration scripts and verification queries
- **Important**: Database migration required before deploying code changes to production

### October 25, 2025 - Learning Module Subtopic Organization & Seed Data
- **Subtopic-Based Content Structure**: Implemented subtopic dropdown selector for Learning Module
  - Content tabs only appear after topic AND subtopic selection (prevents orphaned content)
  - Questions, Lessons, and Flashcards all organized by subtopic ID
- **Database Organization**: Questions use `category` (topic title) and `subdivision` (subtopic ID); Lessons use `category` (subtopic ID)
- **Seed Data Script**: Created SQL seed script (`scripts/seed_learning_complete.sql`) that generates:
  - 63 lessons (3 per subtopic: audio podcast, video tutorial, text intro)
  - 42 questions (2 per subtopic with 4 options each)
  - Common media URLs: NMC Code podcast audio and video tutorial
- **Documentation**: Created comprehensive Learning Module structure guide and seed instructions

## System Architecture

### Frontend Architecture

**Technology Stack:** React 18, TypeScript, Vite 5, Material-UI (MUI) v7 with Emotion, React Router DOM v7, Zustand, TanStack React Query (v5), Notistack.

**Design Patterns:** Component-based architecture by feature, path aliases (`@/*`), strict TypeScript, CSS-in-JS (Emotion).

**Routing Structure:** Public (`/login`) and protected routes (`/dashboard`, `/content/*`, etc.), with nested and dynamic routes. Protected routes use `ProtectedRoute` and `MainLayout`.

**UI/UX Approach:** Material Design with custom theming (8px borderRadius), full-height collapsible sidebar, responsive header, modal/drawer overlays with gradients, role-adaptive menus, consistent color palette (primary #007aff, secondary #181C32), Inter font family, professional form components, interactive card layouts, light/dark mode support with `localStorage` persistence.

### Backend Architecture

**Backend-as-a-Service:** Supabase (PostgreSQL database, authentication, real-time) with Row Level Security (RLS).

**Authentication & Authorization:** Supabase Auth, role-based access (Superadmin, Editor, Moderator), `AuthContext` for global state, `ProtectedRoute` for enforcement.

**Data Architecture:** Relational model with UUID primary keys. Includes Users, Subscriptions, Content (modules, topics, lessons, questions, flashcards), Practice/Mock Sessions, Learning Completions, AI Recommendations, and Admin Users.

### Feature Specifications

**Admin Portal Features:**
- **Content Management System:** CRUD for fixed 3-module structure (Practice, Learning, Mock Exams), with hierarchical content (topics, lessons, questions, flashcards) and media upload. Includes a unified content management page with filtering, rich text editor (TipTap) for lesson content, and bulk CSV upload.
- **Student User Management:** View profiles, OAuth tracking, subscription status, performance metrics.
- **Subscription & Discount Management:** CRUD for plans and user subscriptions, discount codes with expiry/usage limits.
- **Subscription Plans Management:** Superadmin interface for managing AI message limits and plan configurations via inline editing with validation.
- **Dashboard Hero Management:** CRUD for mobile app promotional banners.
- **Analytics & Dashboard:** Real-time metrics from Supabase, date-range filtering, trend charts, content analysis, CSV export, using `analytics_sessions` and PostgreSQL functions.
- **Admin User Management:** CRUD, role assignment, status management.
- **Content Approvals System:** Workflow with status, reviewer assignment.
- **Settings Management:** UI for platform configuration.
- **Security & Stability:** Error handling via ErrorBoundary, SnackbarProvider.

**Mobile App Features:**
- **Authentication:** Google/Apple Sign-In, profile completion flow.
- **Content Gating:** Free trial mode with upgrade prompts.
- **Payment Integration:** Country-based routing to Stripe (international) or Razorpay (India).
- **Core Learning Modules:** Practice MCQs, Learning Content (text, images, audio), Mock Exams (timed simulation).
- **Performance Dashboard:** Progress tracking, exam readiness scores.
- **AI-Powered Features:** JeevaBot (chatbot), personalized weekly study recommendations.
- **Hero Sections:** Promotional banners managed from admin portal.

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

**Database Schema:** Supabase PostgreSQL with tables for users, admin, content, learning data, AI, payments, platform, and analytics. Includes `user_profiles`, `admin_users`, `modules`, `topics`, `lessons`, `flashcards`, `questions`, `subscriptions`, `subscription_plans` (with `config` JSONB for technical settings like AI limits), `discount_coupons`, `hero_sections`, `email_templates`, `analytics_sessions`, `chat_conversations`, `chat_messages`, `ai_usage_stats`. Utilizes PostgreSQL RPC functions (`get_user_ai_limit`, analytics functions) for optimized performance and comprehensive RLS policies.

**Backend API Server:** Express.js server (`server/index.ts`) running on port 3001 provides:
- Email sending via Resend API (integrates with `email_templates` table)
- AI Chat endpoints for JeevaBot (uses Gemini API)
- Server-side operations using `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS policies

**AI Chat System:** 
- Backend uses Google Gemini 2.5-flash for chat responses
- Rate limiting controlled via `subscription_plans.config.ai_messages_per_day`
- Usage tracking in `ai_usage_stats` table (daily message counts and token usage)
- Context includes user's current lesson, practice history, and weak topics
- See `docs/MOBILE_APP_CHAT_INTEGRATION.md` for mobile app integration
- See `docs/SUBSCRIPTION_PLANS_SETUP.md` for managing AI limits and creating new plans