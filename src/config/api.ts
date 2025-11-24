/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get API base URL from environment or use current domain
export const API_BASE_URL = import.meta.env.VITE_API_URL || window?.location?.origin || 'http://localhost:5000'

// API Endpoints
export const API_ENDPOINTS = {
  COUNTRY_DETECT: `${API_BASE_URL}/api/country/detect`,
  COUNTRY_RATES: `${API_BASE_URL}/api/country/rates`,
  SUBSCRIPTION_PLANS: `${API_BASE_URL}/api/subscription-plans`,
  PAYMENTS_CREATE: `${API_BASE_URL}/api/payments/create`,
  PAYMENTS_VERIFY: `${API_BASE_URL}/api/payments/verify`,
  COUPON_VALIDATE: `${API_BASE_URL}/api/subscriptions/validate-coupon`,
} as const

export type ApiEndpoint = keyof typeof API_ENDPOINTS
