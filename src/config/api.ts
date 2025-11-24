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

  // Priority 2: Check if running in production (published Replit)
  if (window?.location?.hostname === 'jeeva-admin-portal.vollskick.replit.dev') {
    return 'https://jeeva-admin-portal.vollskick.replit.dev'
  }

  // Priority 3: Development - use current origin (works through Replit proxy)
  if (window?.location?.origin) {
    return window.location.origin
  }

  // Fallback
  return 'http://localhost:5000'
}

export const API_BASE_URL = getApiBaseUrl()

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
