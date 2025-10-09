# Jeeva Admin Portal

## Overview

The Jeeva Admin Portal is a React-based web application for managing the Jeeva Learning ecosystem. Built with TypeScript and Vite, it provides administrators with tools to manage users, content (modules, topics, lessons, flashcards, questions), subscriptions, analytics, and platform settings. The portal supports role-based access control (superadmin, editor, moderator) and integrates with Supabase for backend services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5 for fast development and optimized builds with Hot Module Reloading
- **UI Library:** Material-UI (MUI) v7 with Emotion for styling
- **Routing:** React Router DOM v7 for client-side navigation
- **State Management:** Zustand for global state management
- **Data Fetching:** TanStack React Query (v5) for server state management and caching
- **Notifications:** Notistack for toast notifications
- **Utilities:** clsx for conditional classNames, date-fns for date manipulation

**Design Patterns:**
- Component-based architecture organized by feature domains (auth, users, subscriptions, content, etc.)
- Path aliases using `@/*` for cleaner imports
- Strict TypeScript configuration with `strict: true` for type safety
- CSS-in-JS using Emotion for component styling

**Routing Structure:**
The application uses protected routes with role-based access control:
- Public routes: `/login`
- Protected routes: `/dashboard`, `/users`, `/admin-users`, `/subscriptions`, `/content/*`, `/approvals`, `/settings`, `/analytics`, `/dashboard-hero`, `/profile`
- Nested routes for content management: modules, topics, subtopics, lessons, questions, flashcards
- Dynamic routes with URL parameters for entity details (e.g., `/users/:id`, `/content/modules/:id`)
- All protected routes wrapped with ProtectedRoute component and MainLayout

**Navigation Components:**
- **TopBar** (`/src/components/layout/TopBar.tsx`): Fixed app bar with branding, controls, and user info
  - Light/Dark theme toggle button with icon (sun/moon)
  - Sidebar collapse/expand toggle (desktop only)
  - User avatar with dropdown menu (Profile, Logout)
  - Mobile-responsive hamburger menu toggle
  - Displays admin user name and role
- **SidebarNav** (`/src/components/layout/SidebarNav.tsx`): Persistent sidebar navigation with collapse support
  - Collapsible sidebar: 260px (expanded) or 72px (collapsed, icon-only mode)
  - Icon-only mode with tooltips when collapsed
  - Role-based menu filtering (shows only routes user has access to)
  - Active route highlighting with primary color
  - Responsive drawer (permanent on desktop, temporary on mobile)
  - Smooth transitions for width changes (0.3s)
  - Navigation items with icons for Dashboard, Users, Admin Users, Subscriptions, Content, Approvals, Analytics, Dashboard Hero, Settings
- **MainLayout** (`/src/components/layout/MainLayout.tsx`): Combines TopBar and SidebarNav
  - Wraps all protected page content
  - Manages mobile drawer state and sidebar collapse state
  - Persists sidebar collapse preference in localStorage
  - Provides consistent spacing and background
  - Dynamic content area adjusts to sidebar width

**UI/UX Approach:**
- Material Design system with custom theming
- Responsive layout with persistent sidebar navigation and top bar
- Modal/drawer overlays for detail views and forms
- Role-adaptive menus that show/hide based on user permissions
- Consistent color palette: Primary (#1976D2), Secondary (#181C32), with semantic colors for success, error, warning, and info states

**Theme Configuration:**
- Theme system supports light and dark modes with dynamic switching
- `getTheme()` function in `/src/theme/theme.ts` generates theme based on mode
- **ThemeContext** (`/src/context/ThemeContext.tsx`) manages theme state
  - `useThemeMode()` hook provides access to current mode and toggle function
  - Theme preference persisted in localStorage (`jeeva-admin-theme`)
  - Wraps MUI ThemeProvider with custom theme context
- All components wrapped with ThemeProvider in App.tsx
- CssBaseline applied for consistent baseline styles
- Custom theme includes: color palette (adaptive for light/dark), typography (Inter font family), 8px border radius
- Smooth transitions between theme modes
- See `/docs/theme.md` for complete theme specifications and usage guidelines

### Backend Architecture

**Backend-as-a-Service:**
- **Supabase** provides authentication, database, and real-time capabilities
- Uses Supabase client SDK (`@supabase/supabase-js`) for all backend interactions
- Row Level Security (RLS) policies enforce data access control at the database level

**Authentication & Authorization:**
- Supabase Auth handles user authentication
- Role-based access control with three admin roles:
  - Superadmin: Full system access
  - Editor: Content creation and editing
  - Moderator: Content review and approval only
- Protected route wrapper checks authentication status and role permissions
- Environment variables store sensitive credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

**Authentication Implementation:**
- AuthContext (`/src/context/AuthContext.tsx`) manages global auth state
- `useAuth()` hook provides access to user, session, login/logout functions
- Login flow verifies user exists in `admin_users` table with `is_active = true`
- ProtectedRoute component wraps routes requiring authentication
- Role-based route protection using `allowedRoles` prop
- See `/docs/authentication.md` for complete implementation guide

**Data Architecture:**
The application manages a complex relational data model with the following key entity relationships:
- Users and user profiles (1:1)
- Users and subscriptions (1:many)
- Content hierarchy: modules → topics → subtopics → lessons → questions/flashcards
- Practice sessions and results tracking
- Mock exams and results
- Learning completions and AI recommendations
- Admin users with separate role management
- Audit logging for compliance tracking

### External Dependencies

**Third-Party Services:**
- **Supabase:** Primary backend service providing:
  - PostgreSQL database
  - Authentication and user management
  - Row Level Security for data access control
  - Real-time subscriptions (potential use)
  - Storage for media files (questions, flashcards)

**Key NPM Packages:**
- **UI & Styling:**
  - `@mui/material` & `@mui/icons-material`: Component library
  - `@emotion/react` & `@emotion/styled`: CSS-in-JS styling
  
- **State & Data:**
  - `zustand`: Global state management
  - `@tanstack/react-query`: Server state and caching
  - `@supabase/supabase-js`: Supabase client SDK

- **Utilities:**
  - `react-router-dom`: Client-side routing
  - `notistack`: Toast notifications
  - `date-fns`: Date formatting and manipulation
  - `clsx`: Conditional className utility

**Development Dependencies:**
- TypeScript for type safety
- Vite for build tooling and development server
- React type definitions

**Environment Configuration:**
The application requires environment variables for Supabase integration:
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Public/anonymous API key for client-side usage
- `SUPABASE_SERVICE_KEY`: Admin/service key for server-side operations (optional, never exposed to client)

**Database Schema:**
Supabase PostgreSQL database with tables including: users, user_profiles, subscriptions, admin_users, modules, topics, subtopics, lessons, flashcards, questions, question_options, question_media, practice_sessions, practice_results, lesson_quizzes, mock_exams, mock_exam_results, learning_completions, ai_recommendations, and learning_paths. All tables use UUID primary keys with foreign key relationships enforcing referential integrity.