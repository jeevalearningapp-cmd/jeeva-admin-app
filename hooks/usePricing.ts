import { useCountryDetection } from '../CountryDetection'
import {
  formatSubscriptionPrice,
  getMonthlyEquivalent,
  getPriceInCents,
  formatForPaymentIntent,
} from '../utils/currency'

/**
 * Custom hook for pricing operations
 * Combines country detection with currency utilities
 */
export function usePricing() {
  const { country, loading, formatPrice, convertPrice } = useCountryDetection(
    'https://jeeva-admin-portal.vollskick.replit.dev'
  )

  const countryCode = country?.countryCode || 'US'

  return {
    // Country info
    country,
    countryCode,
    loading,

    // Price formatting
    formatPrice: (usdPrice: number) => formatPrice(usdPrice, countryCode),
    convertPrice: (usdPrice: number) => convertPrice(usdPrice, countryCode),

    // Subscription pricing
    formatSubscriptionPrice: (
      usdPrice: number,
      billingCycle: 'monthly' | 'yearly' = 'monthly'
    ) => formatSubscriptionPrice(usdPrice, countryCode, billingCycle),

    // Yearly to monthly equivalent
    getMonthlyEquivalent: (yearlyUsdPrice: number) =>
      getMonthlyEquivalent(yearlyUsdPrice, countryCode),

    // Payment processing
    getPriceInCents: (usdPrice: number) => getPriceInCents(usdPrice, countryCode),
    formatForPaymentIntent: (usdPrice: number) =>
      formatForPaymentIntent(usdPrice, countryCode),
  }
}

export default usePricing
