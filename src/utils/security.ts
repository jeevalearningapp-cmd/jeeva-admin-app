/**
 * Security Utilities for Input Sanitization and Validation
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and encodes special characters
 */
export const sanitizeHTML = (input: string): string => {
  if (!input) return ''
  
  // Remove all HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Encode special characters
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  
  sanitized = sanitized.replace(/[&<>"'/]/g, (char) => map[char] || char)
  
  return sanitized.trim()
}

/**
 * Sanitize SQL input to prevent SQL injection
 * Use parameterized queries instead when possible
 */
export const sanitizeSQL = (input: string): string => {
  if (!input) return ''
  
  // Remove SQL keywords and special characters
  return input
    .replace(/[;'"\\]/g, '')
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi, '')
    .trim()
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s+()-]{10,}$/
  return phoneRegex.test(phone)
}

/**
 * Sanitize file name to prevent directory traversal attacks
 */
export const sanitizeFileName = (filename: string): string => {
  if (!filename) return ''
  
  // Remove path separators and special characters
  return filename
    .replace(/[\/\\]/g, '')
    .replace(/[^\w\s.-]/g, '')
    .trim()
    .slice(0, 255) // Limit length
}

/**
 * Check if string contains potentially dangerous patterns
 */
export const containsDangerousPatterns = (input: string): boolean => {
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /data:text\/html/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ]
  
  return dangerousPatterns.some(pattern => pattern.test(input))
}

/**
 * Rate limiting helper (client-side)
 * Tracks action timestamps and enforces limits
 */
export class ClientRateLimiter {
  private timestamps: Map<string, number[]> = new Map()
  
  /**
   * Check if action is allowed
   * @param key - Unique identifier for the action
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMs - Time window in milliseconds
   */
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now()
    const attempts = this.timestamps.get(key) || []
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < windowMs)
    
    if (recentAttempts.length >= maxAttempts) {
      return false
    }
    
    // Add current attempt
    recentAttempts.push(now)
    this.timestamps.set(key, recentAttempts)
    
    return true
  }
  
  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.timestamps.delete(key)
  }
}

/**
 * Content Security Policy helper
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Adjust based on needs
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https://your-supabase-url.supabase.co'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
}

/**
 * Generate CSP header string
 */
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}
