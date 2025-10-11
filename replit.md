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
- Modern, polished design with subtle rounded corners (8px borderRadius) throughout.
- Full-height sidebar (100vh) with app branding at top and collapsible icon-only mode.
- Responsive header positioned right of sidebar with full content width.
- Modal/drawer overlays with gradient backgrounds and layered shadows.
- Role-adaptive menus based on user permissions.
- Consistent color palette with primary #007aff, secondary #181C32, and semantic colors.
- White backgrounds and light grey borders for cards and papers.
- Refined typography with Inter font family and optimized sizes.
- Professional form components (FormDialog, FormField, FormSelect) with reduced heights.
- Interactive card layouts with hover effects and smooth transitions.

**Theme Configuration:**
- Supports light and dark modes with dynamic switching and `localStorage` persistence.
- `ThemeContext` manages theme state.
- Global borderRadius: 8 (subtle rounded corners) enforced via theme configuration.
- Custom theme includes adaptive color palette, refined typography (Inter font), and centralized component styling.
- Enhanced component overrides: Button, Card (with hover effects), Paper, TextField (optimized padding), Dialog (gradient backgrounds, layered shadows), DialogTitle/Content/Actions, Backdrop, Drawer, Chip, Alert, Select, and Autocomplete.

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

## Recent Changes (October 11, 2025)

### UI/UX Refinement & Polish (Completed)
**Comprehensive visual enhancement for a modern, polished user experience:**

1. **Splash Screen & Branding:**
   - Animated splash screen with logo pop effect (scale 0.5 → 1.2 → 1.0)
   - Auto-redirect to login after 2-3 seconds
   - Footer with "Developed by vollstek Business solutions" branding
   - Email support button (vollstek@gmail.com) in footer

2. **Design Language Update:**
   - Changed from sharp corners (0px) to subtle rounded corners (8px borderRadius)
   - Modern, approachable aesthetic while maintaining professionalism
   - Applied consistently across all components: buttons, modals, cards, inputs, chips, alerts

3. **Input Field Optimization:**
   - Reduced TextField padding: 10px vertical, 14px horizontal (vs default ~16px)
   - Optimized Select padding to match: 10px 14px
   - Enhanced Autocomplete/search bars: 6px 14px inner padding
   - Label positioning adjusted for smaller inputs
   - ~30% reduction in input height for better density

4. **Typography Refinement:**
   - Reduced h5: 1.25rem → 1.125rem (18px)
   - Reduced h6: 1.125rem → 1rem (16px)
   - Reduced body1: 1rem → 0.9375rem (15px)
   - Added body2: 0.875rem (14px)
   - Button text: 0.9375rem, weight 600 (refined from 700)
   - DialogTitle: 1.125rem (18px), optimized padding 16px 24px
   - DialogContent: 0.9375rem (15px), optimized padding 20px 24px
   - Overall ~6-10% text size reduction for better visual proportions

5. **Modal & Component Enhancement:**
   - **Dialogs:** Layered shadows (8px + 2px), subtle gradient backgrounds
   - **Backdrop:** Enhanced opacity (0.4 light / 0.7 dark) for better focus
   - **Drawers:** Gradient backgrounds, enhanced shadows (4px 16px)
   - **Cards:** Interactive hover effects (translateY -2px), layered shadows, smooth transitions
   - **Paper:** Subtle shadows for depth
   - Premium visual depth and polish throughout

**Design Philosophy:** Modern, polished interface with subtle rounded corners (8px), optimized density, refined typography, and premium visual effects creating an advanced web application experience.

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