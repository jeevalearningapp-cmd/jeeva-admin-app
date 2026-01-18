/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get API base URL from environment or use current domain
const getApiBaseUrl = (): string => {
  // Priority 1: Explicit environment variable (for overrides)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Priority 2: Use same origin - frontend proxies to backend
  // Vite dev server proxies /api/* to http://localhost:3001
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Fallback
  return "http://localhost:5000";
};

// Always call dynamically to ensure correct environment detection
export const getApiUrl = () => {
  const url = getApiBaseUrl();
  return url;
};

// Lazy static API base URL for when it's needed at module load time
let cachedApiUrl: string | null = null;
export const getStaticApiUrl = () => {
  if (!cachedApiUrl) {
    cachedApiUrl = getApiBaseUrl();
    if (typeof window !== "undefined") {
      console.log("📡 API_BASE_URL:", cachedApiUrl);
    }
  }
  return cachedApiUrl;
};

// API Endpoints - use lazy evaluation
export const getApiEndpoints = () => {
  const baseUrl = getApiUrl();
  return {
    COUNTRY_DETECT: `${baseUrl}/api/country/detect`,
    COUNTRY_RATES: `${baseUrl}/api/country/rates`,
    SUBSCRIPTION_PLANS: `${baseUrl}/api/subscriptions/plans`,
    SUBSCRIPTION_COUPONS: `${baseUrl}/api/subscriptions/coupons`,
    COUPON_VALIDATE: `${baseUrl}/api/subscriptions/validate-coupon`,
    PAYMENTS_CREATE: `${baseUrl}/api/payments/create`,
    PAYMENTS_VERIFY: `${baseUrl}/api/payments/verify`,
  } as const;
};

export type ApiEndpoint = ReturnType<typeof getApiEndpoints>;
