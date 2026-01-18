# Security Best Practices - Jeeva Admin Portal

## Overview

This document outlines security measures and best practices implemented in the Jeeva Admin Portal to protect against common vulnerabilities and ensure data security.

## 🔒 Authentication & Authorization

### Implemented

- ✅ Supabase Authentication with JWT tokens
- ✅ Role-based access control (RBAC) - Superadmin, Editor, Moderator
- ✅ Protected routes with role verification
- ✅ Session persistence with secure storage
- ✅ Automatic token refresh

### Best Practices

- Always verify user roles on both frontend and backend
- Use Supabase RLS (Row Level Security) policies for database access
- Never expose sensitive operations to unauthorized roles
- Implement session timeout (configure in Supabase)

## 🛡️ XSS Protection

### Implemented

- ✅ Input sanitization utilities (`sanitizeHTML`)
- ✅ React's built-in XSS protection (JSX escaping)
- ✅ Dangerous pattern detection
- ✅ Content Security Policy (CSP) headers

### Code Example

```typescript
import { sanitizeHTML } from "@/utils/security";

// Sanitize user input before display
const safeContent = sanitizeHTML(userInput);
```

### Recommendations

- Always sanitize user input before rendering
- Use `dangerouslySetInnerHTML` only when absolutely necessary
- Implement CSP headers in production
- Validate and sanitize all form inputs

## 🔐 SQL Injection Prevention

### Implemented

- ✅ Supabase client uses parameterized queries by default
- ✅ SQL sanitization utility for edge cases
- ✅ Input validation on all database operations

### Best Practices

```typescript
// ✅ GOOD - Parameterized query (Supabase handles this)
const { data } = await supabase
  .from("users")
  .select("*")
  .eq("email", userEmail);

// ❌ BAD - Never concatenate user input into queries
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

## 🚦 Rate Limiting

### Client-Side Implementation

```typescript
import { ClientRateLimiter } from "@/utils/security";

const rateLimiter = new ClientRateLimiter();

// Allow max 5 attempts in 1 minute
if (rateLimiter.isAllowed("login", 5, 60000)) {
  await login(email, password);
} else {
  showError("Too many attempts. Please try again later.");
}
```

### Server-Side (Supabase)

- Configure rate limiting in Supabase dashboard
- Set limits for:
  - Login attempts (5 per minute)
  - API requests (100 per minute)
  - Password reset (3 per hour)

## 🔑 CSRF Protection

### Implemented for Supabase

Supabase handles CSRF protection automatically through:

- Same-site cookies
- Token-based authentication
- Origin validation

### Additional Measures

- Verify request origin in critical operations
- Use anti-CSRF tokens for state-changing operations
- Validate referer headers

## 📝 Input Validation

### Implemented

- ✅ Email validation
- ✅ URL validation
- ✅ Phone number validation
- ✅ File name sanitization
- ✅ Password strength validation

### Form Validation Example

```typescript
import { isValidEmail, validatePasswordStrength } from "@/utils/security";

const validate = () => {
  const errors: string[] = [];

  if (!isValidEmail(email)) {
    errors.push("Invalid email format");
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.isValid) {
    errors.push(...passwordCheck.errors);
  }

  return errors;
};
```

## 🔒 Data Encryption

### At Rest

- ✅ Supabase encrypts data at rest using AES-256
- ✅ Passwords hashed with bcrypt

### In Transit

- ✅ All API calls use HTTPS/TLS
- ✅ Supabase enforces SSL connections

## 🎯 Content Security Policy (CSP)

### Recommended Headers

```typescript
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### Implementation (Replit Deployment)

Configure in deployment settings or add to server response headers.

## 🚨 Error Handling

### Implemented

- ✅ Global error boundary for React errors
- ✅ API error interceptor
- ✅ User-friendly error messages
- ✅ Error logging service integration ready

### Best Practices

```typescript
import { ErrorHandler } from "@/utils/errorHandler";

try {
  await riskyOperation();
} catch (error) {
  ErrorHandler.handle(error, "Failed to complete operation");
}
```

## 🔍 Security Headers

### Recommended Headers for Production

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## 📊 Audit Logging

### Recommended Implementation

- Log all admin actions (create, update, delete)
- Track user authentication events
- Monitor failed login attempts
- Record permission changes

### Database Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Secrets Management

### Environment Variables

- ✅ Use Replit Secrets for sensitive data
- ✅ Never commit secrets to git
- ✅ Rotate API keys regularly

### Required Secrets

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
# Add more as needed
```

## 🎯 File Upload Security

### Implemented

- ✅ File name sanitization
- ✅ File type validation
- ✅ Size limits

### Best Practices

```typescript
import { sanitizeFileName } from "@/utils/security";

const handleFileUpload = (file: File) => {
  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type");
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File too large");
  }

  // Sanitize file name
  const safeName = sanitizeFileName(file.name);
};
```

## ✅ Security Checklist for Production

### Pre-Launch

- [ ] Enable Supabase RLS on all tables
- [ ] Configure rate limiting
- [ ] Set up error monitoring (Sentry/LogRocket)
- [ ] Enable HTTPS/SSL
- [ ] Configure CSP headers
- [ ] Review and test all API endpoints
- [ ] Audit admin user permissions
- [ ] Test authentication flows
- [ ] Verify password requirements
- [ ] Check file upload restrictions

### Post-Launch

- [ ] Monitor error logs daily
- [ ] Review audit logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Conduct security audit annually
- [ ] Test backup/restore procedures
- [ ] Update security documentation

## 🚀 Deployment Security

### Replit Deployment

1. Configure environment secrets
2. Enable automatic HTTPS
3. Set up custom domain with SSL
4. Configure deployment protection
5. Enable deployment logs

### Database Security

1. Enable Supabase RLS policies
2. Use connection pooling
3. Enable audit logging
4. Set up automated backups
5. Restrict database access by IP (if possible)

## 📞 Incident Response

### In Case of Security Breach

1. Immediately disable affected accounts
2. Rotate all API keys and secrets
3. Review audit logs for suspicious activity
4. Notify affected users (if applicable)
5. Document incident and resolution
6. Conduct post-mortem analysis
7. Update security measures

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [React Security Best Practices](https://react.dev/learn/security)
- [CSP Generator](https://csper.io/generator)

---

**Last Updated:** 2025-01-09  
**Maintained By:** Development Team
