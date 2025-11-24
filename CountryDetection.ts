import { useState, useEffect } from 'react'

// Type definitions
export interface CountryInfo {
  countryCode: string
  countryName: string
  currency: string
  currencySymbol: string
  exchangeRate: number
  paymentProvider: 'stripe'
}

// Exchange rates for all supported countries (USD base)
const EXCHANGE_RATES: Record<string, number> = {
  IN: 83.5,    // India
  US: 1,       // United States
  GB: 0.79,    // United Kingdom
  CA: 1.36,    // Canada
  AU: 1.53,    // Australia
  NZ: 1.64,    // New Zealand
  SG: 1.35,    // Singapore
  AE: 3.67,    // UAE
  DEFAULT: 1,
}

// Currency mapping for countries
const CURRENCY_MAP: Record<string, string> = {
  IN: 'inr',
  US: 'usd',
  GB: 'gbp',
  CA: 'cad',
  AU: 'aud',
  NZ: 'nzd',
  SG: 'sgd',
  AE: 'aed',
}

// Currency symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: '$',
  inr: '₹',
  gbp: '£',
  cad: 'C$',
  aud: 'A$',
  nzd: 'NZ$',
  sgd: 'S$',
  aed: 'AED',
}

// Country names
const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  NZ: 'New Zealand',
  SG: 'Singapore',
  AE: 'United Arab Emirates',
}

/**
 * Hook for detecting user's country and handling currency conversion
 * Uses backend endpoint to avoid CORS and external API 403 errors
 *
 * @param apiBaseUrl - Optional custom API base URL (defaults to current domain)
 * @returns Country info, loading state, and helper functions
 */
export function useCountryDetection(apiBaseUrl?: string) {
  const [country, setCountry] = useState<CountryInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    detectCountry()
  }, [])

  /**
   * Detect user's country from backend
   */
  async function detectCountry() {
    try {
      setLoading(true)
      setError(null)

      // Use provided base URL or construct from current environment
      const baseUrl = apiBaseUrl || `${getApiBaseUrl()}`

      // Call backend endpoint - handles geolocation server-side
      const response = await fetch(`${baseUrl}/api/country/detect`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Country detection failed with status ${response.status}`)
      }

      const data: CountryInfo = await response.json()
      setCountry(data)
    } catch (err) {
      console.error('Error detecting country:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Default to US on error
      setDefaultCountry()
    } finally {
      setLoading(false)
    }
  }

  /**
   * Set default country (US) when detection fails
   */
  function setDefaultCountry() {
    setCountry({
      countryCode: 'US',
      countryName: 'United States',
      currency: 'usd',
      currencySymbol: '$',
      exchangeRate: 1,
      paymentProvider: 'stripe',
    })
  }

  /**
   * Retry country detection
   */
  function refetchCountry() {
    detectCountry()
  }

  /**
   * Get payment provider for country (always Stripe now)
   */
  function getPaymentProvider(countryCode: string = country?.countryCode || 'US'): 'stripe' {
    return 'stripe' // All payments through Stripe
  }

  /**
   * Get currency for country
   */
  function getCurrencyForCountry(countryCode: string = country?.countryCode || 'US'): string {
    return CURRENCY_MAP[countryCode] || 'usd'
  }

  /**
   * Get currency symbol
   */
  function getCurrencySymbol(currency: string): string {
    return CURRENCY_SYMBOLS[currency] || '$'
  }

  /**
   * Convert USD price to user's local currency
   *
   * @param usdPrice - Price in USD
   * @param countryCode - Optional country code (uses detected country if not provided)
   * @returns Converted price rounded to 2 decimal places
   */
  function convertPrice(usdPrice: number, countryCode?: string): number {
    const cc = countryCode || country?.countryCode || 'US'
    const rate = EXCHANGE_RATES[cc] || EXCHANGE_RATES.DEFAULT
    return Math.round(usdPrice * rate * 100) / 100
  }

  /**
   * Format price with currency symbol
   *
   * @param usdPrice - Price in USD
   * @param countryCode - Optional country code (uses detected country if not provided)
   * @returns Formatted price string (e.g., "$10.00", "₹835.00", "£7.90")
   */
  function formatPrice(usdPrice: number, countryCode?: string): string {
    const cc = countryCode || country?.countryCode || 'US'
    const converted = convertPrice(usdPrice, cc)
    const currency = getCurrencyForCountry(cc)
    const symbol = getCurrencySymbol(currency)
    return `${symbol}${converted.toFixed(2)}`
  }

  /**
   * Format price without currency symbol (just the number)
   */
  function formatPriceAmount(usdPrice: number, countryCode?: string): string {
    const cc = countryCode || country?.countryCode || 'US'
    const converted = convertPrice(usdPrice, cc)
    return converted.toFixed(2)
  }

  /**
   * Get all available exchange rates
   */
  function getExchangeRates(): Record<string, number> {
    return EXCHANGE_RATES
  }

  /**
   * Get all currency mappings
   */
  function getCurrencyMap(): Record<string, string> {
    return CURRENCY_MAP
  }

  return {
    country,
    loading,
    error,
    convertPrice,
    formatPrice,
    formatPriceAmount,
    getPaymentProvider,
    getCurrencyForCountry,
    getCurrencySymbol,
    getExchangeRates,
    getCurrencyMap,
    refetch: refetchCountry,
  }
}

/**
 * Helper to get API base URL based on environment
 */
function getApiBaseUrl(): string {
  // For React Native, you might need to set this based on your environment
  // Example: https://jeeva-admin-portal.vollskick.replit.dev
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin
  }
  // Fallback for React Native - replace with your actual API URL
  return 'https://jeeva-admin-portal.vollskick.replit.dev'
}

/**
 * Standalone utility functions (can be used without React)
 */

export const CountryUtils = {
  /**
   * Convert USD to any currency using local exchange rates
   */
  convertToLocalCurrency(usdAmount: number, countryCode: string): number {
    const rate = EXCHANGE_RATES[countryCode] || EXCHANGE_RATES.DEFAULT
    return Math.round(usdAmount * rate * 100) / 100
  },

  /**
   * Get currency code for country
   */
  getCurrency(countryCode: string): string {
    return CURRENCY_MAP[countryCode] || 'usd'
  },

  /**
   * Get currency symbol for country
   */
  getSymbol(countryCode: string): string {
    const currency = CURRENCY_MAP[countryCode] || 'usd'
    return CURRENCY_SYMBOLS[currency] || '$'
  },

  /**
   * Get country name
   */
  getCountryName(countryCode: string): string {
    return COUNTRY_NAMES[countryCode] || 'Unknown'
  },

  /**
   * Format price for display
   */
  formatPrice(usdAmount: number, countryCode: string): string {
    const converted = CountryUtils.convertToLocalCurrency(usdAmount, countryCode)
    const symbol = CountryUtils.getSymbol(countryCode)
    return `${symbol}${converted.toFixed(2)}`
  },

  /**
   * Get exchange rate for country
   */
  getExchangeRate(countryCode: string): number {
    return EXCHANGE_RATES[countryCode] || 1
  },

  /**
   * All supported countries
   */
  getSupportedCountries(): Array<{
    code: string
    name: string
    currency: string
    symbol: string
    rate: number
  }> {
    return [
      {
        code: 'US',
        name: 'United States',
        currency: 'usd',
        symbol: '$',
        rate: 1,
      },
      {
        code: 'GB',
        name: 'United Kingdom',
        currency: 'gbp',
        symbol: '£',
        rate: 0.79,
      },
      {
        code: 'IN',
        name: 'India',
        currency: 'inr',
        symbol: '₹',
        rate: 83.5,
      },
      {
        code: 'CA',
        name: 'Canada',
        currency: 'cad',
        symbol: 'C$',
        rate: 1.36,
      },
      {
        code: 'AU',
        name: 'Australia',
        currency: 'aud',
        symbol: 'A$',
        rate: 1.53,
      },
      {
        code: 'NZ',
        name: 'New Zealand',
        currency: 'nzd',
        symbol: 'NZ$',
        rate: 1.64,
      },
      {
        code: 'SG',
        name: 'Singapore',
        currency: 'sgd',
        symbol: 'S$',
        rate: 1.35,
      },
      {
        code: 'AE',
        name: 'United Arab Emirates',
        currency: 'aed',
        symbol: 'AED',
        rate: 3.67,
      },
    ]
  },
}

export default useCountryDetection
