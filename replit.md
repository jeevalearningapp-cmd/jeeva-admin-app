# Jeeva Admin Portal

## Overview

The Jeeva Admin Portal is a React-based web application built with TypeScript and Vite, designed to manage the Jeeva Learning ecosystem. It provides administrators with tools for user, content (modules, topics, lessons, flashcards, questions), subscription, analytics, and platform settings management. The portal supports role-based access control (superadmin, editor, moderator) and integrates with Supabase for backend services. The project's vision is to deliver an intuitive and comprehensive platform for educational content and user management, targeting significant market potential in online learning administration.

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
- **Subscription Management System:** CRUD for Subscription Plans and User Subscriptions, analytics, and status tracking.
- **Content Management System:** Hierarchical CRUD for Modules, Topics, Lessons, Questions, and Flashcards with media upload support. Lessons now support `audio_url` for podcast-style content.
- **CSV Bulk Upload System:** Comprehensive bulk upload for Lessons, Questions, and Flashcards with downloadable templates, parsing, validation, preview, and error reporting.
- **Analytics & Dashboard:** Date-range filtering, key metric cards, trend charts, top content, CSV export.
- **Dashboard Hero Management:** CRUD for hero sections with image upload.
- **User & Admin User Management:** Data tables, search, pagination, detail drawers, CRUD operations, status management, role assignment.
- **Comprehensive Dashboard:** Real-time metrics, data visualizations, recent activity, quick actions, system status.
- **Content Approvals System:** Full approval workflow with status management, reviewer assignment, and approval stats.
- **Settings Management:** Platform configuration UI for general, security, and notification settings, including email templates.
- **Security & Stability:** ErrorBoundary, SnackbarProvider, ErrorHandler utility, and security utilities.

## External Dependencies

**Third-Party Services:**
- **Supabase:** Primary backend service for PostgreSQL database, authentication, user management, RLS, and storage.
- **Resend:** Email service for sending transactional emails (3,000 emails/month, 100 emails/day free tier).

**Key NPM Packages:**
- **UI & Styling:** `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`.
- **State & Data:** `zustand`, `@tanstack/react-query`, `@supabase/supabase-js`.
- **Utilities:** `react-router-dom`, `notistack`, `date-fns`, `clsx`.

**Environment Configuration:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `RESEND_API_KEY` (for email service)

**Database Schema:**
Supabase PostgreSQL database with tables such as `users`, `user_profiles`, `subscriptions`, `admin_users`, `modules`, `topics`, `lessons`, `flashcards`, `questions`, `question_options`, `practice_sessions`, `mock_exams`, `learning_completions`, `ai_recommendations`, and `email_templates`. Comprehensive RLS policies are implemented across content tables.

**Email System:**
- Utilizes an Express.js backend API server (`server/index.ts`) on port 3001 for secure email sending via Resend.
- Frontend API client at `src/api/email.ts` interacts with the backend.
- Available email templates: Test, Welcome, Subscription Confirmation, Payment Receipt, Subscription Expiring.
- Email templates are stored in the `email_templates` Supabase table.