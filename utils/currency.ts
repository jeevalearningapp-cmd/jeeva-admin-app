import { CountryUtils } from '../CountryDetection'

/**
 * Currency utility functions for pricing, formatting, and conversions
 */

export interface PriceFormatOptions {
  showCurrency?: boolean
  decimals?: number
  countryCode?: string
}

/**
 * Format price for subscription display
 */
export function formatSubscriptionPrice(
  usdPrice: number,
  countryCode: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly'
): string {
  const price = CountryUtils.formatPrice(usdPrice, countryCode)
  const cycle = billingCycle === 'yearly' ? '/year' : '/month'
  return `${price}${cycle}`
}

/**
 * Get comparison pricing (e.g., per-month for yearly plans)
 */
export function getMonthlyEquivalent(
  yearlyUsdPrice: number,
  countryCode: string
): string {
  const monthlyUsd = yearlyUsdPrice / 12
  const monthlyPrice = CountryUtils.formatPrice(monthlyUsd, countryCode)
  return `${monthlyPrice}/month`
}

/**
 * Check if price is free
 */
export function isFreePrice(usdPrice: number): boolean {
  return usdPrice === 0
}

/**
 * Get price in cents for payment processing
 */
export function getPriceInCents(
  usdPrice: number,
  countryCode: string
): number {
  const converted = CountryUtils.convertToLocalCurrency(usdPrice, countryCode)
  return Math.round(converted * 100)
}

/**
 * Format price for payment intent (Stripe)
 */
export function formatForPaymentIntent(
  usdPrice: number,
  countryCode: string
): { amount: number; currency: string } {
  const currency = CountryUtils.getCurrency(countryCode)
  const converted = CountryUtils.convertToLocalCurrency(usdPrice, countryCode)
  const amount = Math.round(converted * 100) // Convert to cents

  return {
    amount,
    currency,
  }
}

/**
 * Parse payment amount from Stripe response
 */
export function parsePaymentAmount(
  amountCents: number,
  countryCode: string
): number {
  return amountCents / 100 // Convert from cents to decimal
}

/**
 * Get display price range (e.g., for multiple subscription tiers)
 */
export function getPriceRange(
  minUsdPrice: number,
  maxUsdPrice: number,
  countryCode: string
): string {
  const min = CountryUtils.formatPrice(minUsdPrice, countryCode)
  const max = CountryUtils.formatPrice(maxUsdPrice, countryCode)
  return `${min} - ${max}`
}

/**
 * Check if price meets minimum threshold
 */
export function meetsMinimumPrice(
  usdPrice: number,
  minUsdPrice: number
): boolean {
  return usdPrice >= minUsdPrice
}

export default {
  formatSubscriptionPrice,
  getMonthlyEquivalent,
  isFreePrice,
  getPriceInCents,
  formatForPaymentIntent,
  parsePaymentAmount,
  getPriceRange,
  meetsMinimumPrice,
}
