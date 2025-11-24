import { useState, useEffect } from 'react'
import type { CountryInfo } from '@/types/subscription'

/**
 * Hook to detect user's country and handle currency conversion
 * Uses backend endpoint to avoid CORS and IP lookup 403 errors
 */
export function useCountryDetection() {
  const [country, setCountry] = useState<CountryInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    detectCountry()
  }, [])

  async function detectCountry() {
    try {
      setLoading(true)
      setError(null)

      // Get the API base URL from environment or use current domain
      const apiBaseUrl = import.meta.env.VITE_API_URL || window.location.origin

      // Call backend endpoint - no CORS issues, no 403 errors
      const response = await fetch(`${apiBaseUrl}/api/country/detect`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Country detection failed with status ${response.status}`)
      }

      const data = await response.json()
      setCountry(data)
    } catch (err) {
      console.error('Error detecting country:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Default to US
      setDefaultCountry()
    } finally {
      setLoading(false)
    }
  }

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
   * Convert USD price to user's local currency
   */
  function convertPrice(usdPrice: number, countryCode?: string): number {
    if (!country && !countryCode) return usdPrice

    const rate = country?.exchangeRate || 1
    return Math.round(usdPrice * rate * 100) / 100
  }

  /**
   * Format price with currency symbol
   */
  function formatPrice(usdPrice: number, countryCode?: string): string {
    const converted = convertPrice(usdPrice, countryCode)
    const symbol = country?.currencySymbol || '$'
    return `${symbol}${converted.toFixed(2)}`
  }

  /**
   * Get exchange rates for all countries
   */
  async function getExchangeRates() {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || window.location.origin
      const response = await fetch(`${apiBaseUrl}/api/country/rates`)

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates')
      }

      return await response.json()
    } catch (err) {
      console.error('Error fetching exchange rates:', err)
      return null
    }
  }

  return {
    country,
    loading,
    error,
    convertPrice,
    formatPrice,
    getExchangeRates,
    refetch: detectCountry,
  }
}
