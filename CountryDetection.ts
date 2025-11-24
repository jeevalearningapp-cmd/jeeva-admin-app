import { useState, useEffect } from 'react'

export interface CountryInfo {
  countryCode: string
  countryName: string
  currency: string
  currencySymbol: string
  exchangeRate: number
  paymentProvider: 'stripe'
}

// Exchange rates - USD base
const EXCHANGE_RATES: Record<string, number> = {
  IN: 83.5,
  US: 1,
  GB: 0.79,
  CA: 1.36,
  AU: 1.53,
  NZ: 1.64,
  SG: 1.35,
  AE: 3.67,
}

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

export function useCountryDetection(customApiUrl?: string) {
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

      const baseUrl = customApiUrl || getDefaultApiUrl()
      const response = await fetch(`${baseUrl}/api/country/detect`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data: CountryInfo = await response.json()
      setCountry(data)
    } catch (err) {
      console.error('Country detection error:', err)
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

  function convertPrice(usdPrice: number, countryCode?: string): number {
    if (typeof usdPrice !== 'number' || usdPrice < 0) return 0
    const cc = countryCode || country?.countryCode || 'US'
    const rate = EXCHANGE_RATES[cc] || 1
    return Math.round(usdPrice * rate * 100) / 100
  }

  function formatPrice(usdPrice: number, countryCode?: string): string {
    const converted = convertPrice(usdPrice, countryCode)
    const symbol = getCurrencySymbol(countryCode)
    return `${symbol}${converted.toFixed(2)}`
  }

  function getCurrencySymbol(countryCode?: string): string {
    const cc = countryCode || country?.countryCode || 'US'
    const currency = CURRENCY_MAP[cc] || 'usd'
    return CURRENCY_SYMBOLS[currency] || '$'
  }

  function getCurrencyForCountry(countryCode?: string): string {
    const cc = countryCode || country?.countryCode || 'US'
    return CURRENCY_MAP[cc] || 'usd'
  }

  function getPaymentProvider(): 'stripe' {
    return 'stripe'
  }

  function getAllExchangeRates(): Record<string, number> {
    return { ...EXCHANGE_RATES }
  }

  function isSupportedCountry(countryCode: string): boolean {
    return countryCode in EXCHANGE_RATES
  }

  function getSupportedCountries() {
    return Object.entries(EXCHANGE_RATES).map(([code, rate]) => ({
      code,
      name: COUNTRY_NAMES[code] || code,
      currency: CURRENCY_MAP[code] || 'usd',
      symbol: CURRENCY_SYMBOLS[CURRENCY_MAP[code]] || '$',
      rate,
    }))
  }

  function retry() {
    detectCountry()
  }

  return {
    country,
    loading,
    error,
    convertPrice,
    formatPrice,
    getCurrencySymbol,
    getCurrencyForCountry,
    getPaymentProvider,
    getAllExchangeRates,
    isSupportedCountry,
    getSupportedCountries,
    retry,
  }
}

function getDefaultApiUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin
  }
  return 'https://jeeva-admin-portal.vollskick.replit.dev'
}

export const CountryUtils = {
  convertToLocalCurrency(usdAmount: number, countryCode: string): number {
    if (typeof usdAmount !== 'number' || usdAmount < 0) return 0
    const rate = EXCHANGE_RATES[countryCode] || 1
    return Math.round(usdAmount * rate * 100) / 100
  },

  getCurrency(countryCode: string): string {
    return CURRENCY_MAP[countryCode] || 'usd'
  },

  getSymbol(countryCode: string): string {
    const currency = CURRENCY_MAP[countryCode] || 'usd'
    return CURRENCY_SYMBOLS[currency] || '$'
  },

  getCountryName(countryCode: string): string {
    return COUNTRY_NAMES[countryCode] || 'Unknown'
  },

  formatPrice(usdAmount: number, countryCode: string): string {
    const converted = CountryUtils.convertToLocalCurrency(usdAmount, countryCode)
    const symbol = CountryUtils.getSymbol(countryCode)
    return `${symbol}${converted.toFixed(2)}`
  },

  getExchangeRate(countryCode: string): number {
    return EXCHANGE_RATES[countryCode] || 1
  },

  getSupportedCountries() {
    return [
      { code: 'US', name: 'United States', currency: 'usd', symbol: '$', rate: 1 },
      { code: 'GB', name: 'United Kingdom', currency: 'gbp', symbol: '£', rate: 0.79 },
      { code: 'IN', name: 'India', currency: 'inr', symbol: '₹', rate: 83.5 },
      { code: 'CA', name: 'Canada', currency: 'cad', symbol: 'C$', rate: 1.36 },
      { code: 'AU', name: 'Australia', currency: 'aud', symbol: 'A$', rate: 1.53 },
      { code: 'NZ', name: 'New Zealand', currency: 'nzd', symbol: 'NZ$', rate: 1.64 },
      { code: 'SG', name: 'Singapore', currency: 'sgd', symbol: 'S$', rate: 1.35 },
      { code: 'AE', name: 'United Arab Emirates', currency: 'aed', symbol: 'AED', rate: 3.67 },
    ]
  },

  isSupportedCountry(countryCode: string): boolean {
    return countryCode in EXCHANGE_RATES
  },
}

export default useCountryDetection
