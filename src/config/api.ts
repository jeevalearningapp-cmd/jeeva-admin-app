/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get API base URL from environment or use current domain
// For mobile (React Native/Expo), use production URL
// For web (admin portal), use current domain
const getApiBaseUrl = (): string => {
  // Mobile environment (no window object or Expo)
  if (typeof window === 'undefined') {
    return 'https://jeeva-admin-portal.vollskick.replit.dev'
  }

  // Environment variable takes precedence
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Web: use current domain
  if (window?.location?.origin) {
    return window.location.origin
  }

  // Fallback to production
  return 'https://jeeva-admin-portal.vollskick.replit.dev'
}

export const API_BASE_URL = getApiBaseUrl()

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
