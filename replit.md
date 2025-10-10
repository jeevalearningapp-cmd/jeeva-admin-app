# Jeeva Admin Portal

## Overview

The Jeeva Admin Portal is a React-based web application for managing the Jeeva Learning ecosystem. Built with TypeScript and Vite, it provides administrators with tools to manage users, content (modules, topics, lessons, flashcards, questions), subscriptions, analytics, and platform settings. The portal supports role-based access control (superadmin, editor, moderator) and integrates with Supabase for backend services. The business vision is to provide a comprehensive and intuitive platform for educational content and user management, aiming for significant market potential in online learning administration.

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
- Material Design system with custom theming.
- Modern, premium design with sharp corners (borderRadius: 0) throughout.
- Full-height sidebar (100vh) with app branding at top and collapsible icon-only mode.
- Responsive header positioned right of sidebar with full content width.
- Modal/drawer overlays for detail views and forms.
- Role-adaptive menus based on user permissions.
- Consistent color palette with primary #007aff, secondary #181C32, and semantic colors.
- White backgrounds and light grey borders for cards and papers.
- Standardized typography with Inter font family.
- Professional form components (FormDialog, FormField, FormSelect) with consistent styling.
- Modern card layouts with inline editing capabilities.

**Theme Configuration:**
- Supports light and dark modes with dynamic switching and `localStorage` persistence.
- `ThemeContext` manages theme state.
- Global borderRadius: 0 (sharp corners) enforced via theme configuration.
- Custom theme includes adaptive color palette, typography (Inter font), and centralized component styling.
- Component overrides for Button, Card, Paper, TextField, Dialog, Chip, Alert, and Select.

### Backend Architecture

**Backend-as-a-Service:**
- **Supabase:** Provides authentication, PostgreSQL database, and real-time capabilities.
- Uses Supabase client SDK (`@supabase/supabase-js`).
- Row Level Security (RLS) policies for data access control.

**Authentication & Authorization:**
- Supabase Auth for user authentication.
- Role-based access control with Superadmin, Editor, and Moderator roles.
- `AuthContext` manages global auth state.
- Login verifies user in `admin_users` table with `is_active = true`.
- `ProtectedRoute` component enforces authentication and role-based permissions.

**Data Architecture:**
- Relational data model including Users, Subscriptions, Content (modules, topics, lessons, questions, flashcards), Practice Sessions, Mock Exams, Learning Completions, AI Recommendations, and Admin Users.
- All tables use UUID primary keys with foreign key relationships.

### Feature Specifications
- **Subscription Management System:** CRUD for Subscription Plans and User Subscriptions, analytics (MRR, churn rate), and status tracking.
- **Content Management System:** Hierarchical CRUD for Modules, Topics, Lessons, Questions, and Flashcards with media upload support.
- **Analytics & Dashboard:** Date-range filtering, key metric cards (Total Users, Retention Rate, Revenue, etc.), trend charts, top content, CSV export.
- **Dashboard Hero Management:** CRUD for hero sections with image upload and display order.
- **User & Admin User Management:** Data tables, search, pagination, detail drawers, CRUD operations, status management, role assignment.
- **Comprehensive Dashboard:** Real-time metrics, data visualizations (User Growth, Subscription Distribution, Content Engagement), recent activity, quick actions, system status.
- **Analytics Dashboard:** Ready for future use (requires content tables - modules, topics, lessons). Will automatically activate once content management system is built.
- **Content Approvals System:** Complete approval workflow with status management (pending, approved, rejected), reviewer assignment, approval/rejection actions with comments, approval stats dashboard, and filtering by status/type.
- **Settings Management:** Platform configuration UI with general settings (site info, feature toggles), security settings (session timeout, password requirements), notification settings (email, push, event notifications), and email templates. Proper numeric input handling and type alignment for backend integration. Full Supabase backend integration with comprehensive validation and testing (40 passing tests).
- **Security & Stability:** ErrorBoundary for React error catching, SnackbarProvider for notifications, ErrorHandler utility class, security utilities (sanitization, validation, rate limiting), comprehensive security documentation.

## Testing & Quality Assurance

**Testing Framework:**
- **Vitest** with React Testing Library for comprehensive test coverage
- **Test Coverage:** 40 passing tests across validation, hooks, and components
- **Test Scripts:** 
  - `npm test` - Run all tests
  - `npm run test:ui` - Interactive test UI
  - `npm run test:coverage` - Coverage reports

**Test Organization:**
- Validation tests: `src/utils/__tests__/` (24 tests)
- Hook tests: `src/hooks/__tests__/` (5 tests)
- Component tests: `src/pages/__tests__/` (11 tests)
- Documentation: `src/test/README.md`

## External Dependencies

**Third-Party Services:**
- **Supabase:** Primary backend service for PostgreSQL database, authentication, user management, RLS, and storage.

**Key NPM Packages:**
- **UI & Styling:** `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`.
- **State & Data:** `zustand`, `@tanstack/react-query`, `@supabase/supabase-js`.
- **Utilities:** `react-router-dom`, `notistack`, `date-fns`, `clsx`.

**Environment Configuration:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

**Database Schema:**
Supabase PostgreSQL database with tables like `users`, `user_profiles`, `subscriptions`, `admin_users`, `modules`, `topics`, `lessons`, `flashcards`, `questions`, `practice_sessions`, `mock_exams`, `learning_completions`, and `ai_recommendations`.

**Content Management Database:**
- Migration file ready: `database/migrations/create_content_tables.sql`
- Creates 6 tables: modules, topics, lessons, flashcards, questions, question_options
- Includes comprehensive RLS policies for role-based access (superadmin/editor/moderator)
- Schema aligned with TypeScript types for seamless frontend integration
- Instructions: `database/migrations/SETUP_INSTRUCTIONS.md`

## Recent Changes (October 10, 2025)

### UI/UX Modernization (Completed)
**Comprehensive design transformation to create a premium, advanced web application:**

1. **Sidebar Transformation:**
   - Full-height (100vh) sidebar with app branding at top
   - Collapsible icon-only mode for space efficiency
   - Sharp corners (borderRadius: 0) throughout
   - Improved spacing and visual hierarchy

2. **Header Repositioning:**
   - Responsive header positioned right of sidebar
   - Full content width utilization
   - Modern, minimal design with sharp corners

3. **Form Components Enhancement:**
   - Created reusable FormDialog, FormField, and FormSelect components
   - Consistent validation feedback and error handling
   - Professional loading states and animations
   - Clear action buttons (Save/Cancel) pattern

4. **Profile Page Redesign:**
   - Modern card layout with better information hierarchy
   - Inline edit mode with React Query mutations
   - Avatar handling with visual feedback
   - Sharp corner design language

5. **Settings Page Overhaul:**
   - Professional tabbed interface (General, Security, Notifications, Email Templates)
   - Toggle switches for all boolean settings
   - Organized sections with proper dividers
   - Comprehensive validation with error display

6. **Global Theme Refinement:**
   - Centralized borderRadius: 0 in theme configuration
   - Component overrides for Button, Card, Paper, TextField, Dialog, Chip, Alert, and Select
   - Eliminated need for inline style overrides
   - Consistent sharp corner design across all components

**Design Philosophy:** Sharp, modern, professional interface with borderRadius: 0 as the global standard, creating a premium web application experience.

### Content Management Database Migration
- Created comprehensive SQL migration for content management system
- **Tables Created:** 
  - `modules` - Course modules with thumbnails and display ordering
  - `topics` - Topics within modules with hierarchical relationships
  - `lessons` - Individual lessons with video support and duration
  - `flashcards` - Study flashcards (front/back/image) linked to lessons
  - `questions` - Quiz questions with difficulty levels, points, and optional lesson linkage
  - `question_options` - Answer choices for questions
- **Security:** Row Level Security policies for superadmin (full CRUD), editor (create/read/update), moderator (read-only)
- **Relationships:** Cascade delete support maintains data integrity
- **Status:** Ready to deploy - user needs to run migration in Supabase SQL Editor