# Authentication Guide - Jeeva Admin Portal

## Overview

The Jeeva Admin Portal uses Supabase Authentication integrated with a custom AuthContext for managing user sessions, login/logout, and role-based access control.

## Architecture

### Components

1. **AuthContext** (`/src/context/AuthContext.tsx`)
   - Manages authentication state globally
   - Provides login/logout functions
   - Checks admin user roles from the `admin_users` table
   - Handles session persistence

2. **Supabase Client** (`/src/lib/supabase.ts`)
   - Configured with environment variables
   - Used throughout the app for auth operations

3. **Auth Hook** (`useAuth()`)
   - Easy access to auth state and functions
   - Must be used within `AuthProvider`

## Usage

### 1. Access Auth State in Components

```tsx
import { useAuth } from '@/context'

function MyComponent() {
  const { user, adminUser, loading, login, logout } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <p>Welcome, {adminUser?.email}</p>
      <p>Role: {adminUser?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### 2. Login Flow

```tsx
import { useAuth } from '@/context'

function LoginForm() {
  const { login } = useAuth()
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
      // User is automatically redirected after successful login
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
}
```

### 3. Protected Routes

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Protect any route
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

// Restrict by role
<Route 
  path="/admin-users" 
  element={
    <ProtectedRoute allowedRoles={['superadmin']}>
      <AdminUsers />
    </ProtectedRoute>
  } 
/>
```

### 4. Role-Based Access

The `adminUser` object contains role information:

```tsx
const { adminUser } = useAuth()

// Check role
if (adminUser?.role === 'superadmin') {
  // Show superadmin features
}

// Conditional rendering
{adminUser?.role !== 'moderator' && (
  <Button>Edit Content</Button>
)}
```

## Auth State Properties

### `user`
- Type: `User | null`
- Supabase auth user object
- Contains: id, email, metadata

### `adminUser`
- Type: `AdminUser | null`
- Admin-specific data from `admin_users` table
- Contains: id, email, role, is_active

### `session`
- Type: `Session | null`
- Current Supabase session
- Contains: access_token, refresh_token

### `loading`
- Type: `boolean`
- True while checking authentication status
- Use for loading states

## Auth Functions

### `login(email: string, password: string)`
- Signs in user with Supabase
- Verifies user is an active admin
- Throws error if not authorized

### `logout()`
- Signs out current user
- Clears session and state
- Redirects to login

### `checkAdminRole()`
- Queries `admin_users` table
- Returns AdminUser or null
- Used internally by AuthContext

## Database Requirements

Your Supabase database must have an `admin_users` table:

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'editor', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

Required in `.env`:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Security Notes

1. **Row Level Security (RLS)** must be enabled on all tables
2. Only active admins (`is_active = true`) can log in
3. Session tokens are stored securely by Supabase
4. Never expose `SUPABASE_SERVICE_KEY` to the client

## Example: Complete Auth Flow

```tsx
// App.tsx
import { AuthProvider } from './context'

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Your routes */}
      </Router>
    </AuthProvider>
  )
}

// Protected Page
import { useAuth } from '@/context'

function Dashboard() {
  const { adminUser } = useAuth()
  
  return (
    <div>
      <h1>Welcome, {adminUser?.role}</h1>
    </div>
  )
}
```

## Troubleshooting

**Login fails with "User is not an active admin"**
- Ensure user exists in `admin_users` table
- Check `is_active` is `true`
- Verify RLS policies allow read access

**Infinite loading state**
- Check Supabase credentials are correct
- Verify network connection
- Check browser console for errors

**Session not persisting**
- Supabase handles persistence automatically
- Check browser local storage is enabled
- Ensure cookies are not blocked
