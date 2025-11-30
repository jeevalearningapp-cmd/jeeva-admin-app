/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get API base URL from environment or use current domain
const getApiBaseUrl = (): string => {
  // Priority 1: Explicit environment variable (for overrides)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Priority 2: Development - Backend runs on localhost:3001
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001'
  }

  // Priority 3: Production (published Replit)
  if (window?.location?.hostname === 'jeeva-admin-portal.vollskick.replit.dev') {
    return 'https://jeeva-admin-portal.vollskick.replit.dev'
  }

  // Priority 4: Replit preview URLs (for Replit dev environment)
  if (window?.location?.hostname?.includes('spock.replit.dev')) {
    return 'http://localhost:3001'
  }

  // Fallback
  return 'http://localhost:3001'
}

export const API_BASE_URL = getApiBaseUrl()

// Convenience export
export const getApiUrl = () => API_BASE_URL

// Debug helper (remove after testing)
if (typeof window !== 'undefined') {
  console.log('📡 API_BASE_URL:', API_BASE_URL)
}

// API Endpoints
export const API_ENDPOINTS = {
  COUNTRY_DETECT: `${API_BASE_URL}/api/country/detect`,
  COUNTRY_RATES: `${API_BASE_URL}/api/country/rates`,
  SUBSCRIPTION_PLANS: `${API_BASE_URL}/api/subscriptions/plans`,
  SUBSCRIPTION_COUPONS: `${API_BASE_URL}/api/subscriptions/coupons`,
  COUPON_VALIDATE: `${API_BASE_URL}/api/subscriptions/validate-coupon`,
  PAYMENTS_CREATE: `${API_BASE_URL}/api/payments/create`,
  PAYMENTS_VERIFY: `${API_BASE_URL}/api/payments/verify`,
} as const

export type ApiEndpoint = keyof typeof API_ENDPOINTS
