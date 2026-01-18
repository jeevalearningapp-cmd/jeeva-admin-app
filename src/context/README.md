# Context Providers

## AuthContext

The AuthContext manages authentication state throughout the application using Supabase.

### Setup

Already configured in `App.tsx`:

```tsx
import { AuthProvider } from "./context";

<AuthProvider>
  <YourApp />
</AuthProvider>;
```

### Usage

```tsx
import { useAuth } from "@/context";

function MyComponent() {
  const {
    user, // Supabase user object
    adminUser, // Admin user from admin_users table
    session, // Current session
    loading, // Auth loading state
    login, // Login function
    logout, // Logout function
  } = useAuth();

  return <div>{adminUser && <p>Role: {adminUser.role}</p>}</div>;
}
```

### Key Features

- ✅ Automatic session persistence
- ✅ Role-based access control
- ✅ Admin user verification
- ✅ Protected route support
- ✅ Loading states

See `/docs/authentication.md` for complete documentation.
