import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { CountryUtils } from '../CountryDetection'

interface PriceDisplayProps {
  usdPrice: number
  countryCode?: string
  size?: 'small' | 'medium' | 'large'
  showCurrency?: boolean
  billingCycle?: 'monthly' | 'yearly'
  discounted?: boolean
}

/**
 * Component to display price with currency conversion
 * 
 * @example
 * ```tsx
 * <PriceDisplay 
 *   usdPrice={99} 
 *   countryCode="IN" 
 *   size="large"
 *   billingCycle="monthly"
 * />
 * // Shows: ₹8265.00/month
 * ```
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  usdPrice,
  countryCode,
  size = 'medium',
  showCurrency = true,
  billingCycle,
  discounted = false,
}) => {
  const price = CountryUtils.formatPrice(usdPrice, countryCode || 'US')
  const cycleText = billingCycle ? `/${billingCycle}` : ''

  const styles = getStyles(size, discounted)

  return (
    <View style={styles.container}>
      <Text style={styles.price}>
        {price}
        {cycleText}
      </Text>
    </View>
  )
}

interface OriginalPriceProps {
  originalUsdPrice: number
  discountedUsdPrice: number
  countryCode?: string
  showSavings?: boolean
}

/**
 * Component to show original and discounted price
 */
export const PriceComparison: React.FC<OriginalPriceProps> = ({
  originalUsdPrice,
  discountedUsdPrice,
  countryCode = 'US',
  showSavings = true,
}) => {
  const originalPrice = CountryUtils.formatPrice(originalUsdPrice, countryCode)
  const discountedPrice = CountryUtils.formatPrice(discountedUsdPrice, countryCode)

  const savings = originalUsdPrice - discountedUsdPrice
  const savingsPercent = Math.round((savings / originalUsdPrice) * 100)

  return (
    <View style={styles.comparisonContainer}>
      <Text style={styles.originalPrice}>{originalPrice}</Text>
      <Text style={styles.discountedPrice}>{discountedPrice}</Text>
      {showSavings && savings > 0 && (
        <Text style={styles.savingsText}>Save {savingsPercent}%</Text>
      )}
    </View>
  )
}

interface CurrencyBadgeProps {
  countryCode: string
  size?: 'small' | 'medium' | 'large'
}

/**
 * Component to show currency symbol/code badge
 */
export const CurrencyBadge: React.FC<CurrencyBadgeProps> = ({
  countryCode,
  size = 'medium',
}) => {
  const symbol = CountryUtils.getSymbol(countryCode)
  const currency = CountryUtils.getCurrency(countryCode)

  const badgeSize = size === 'small' ? 20 : size === 'large' ? 40 : 30

  return (
    <View style={[styles.badge, { width: badgeSize, height: badgeSize }]}>
      <Text style={[styles.badgeText, { fontSize: badgeSize / 2 }]}>
        {symbol}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  savingsText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  badge: {
    borderRadius: 50,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '600',
  },
})

function getStyles(size: string, discounted: boolean) {
  const fontSizes = {
    small: 14,
    medium: 18,
    large: 28,
  }

  return StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    price: {
      fontSize: fontSizes[size as keyof typeof fontSizes] || 18,
      fontWeight: '600',
      color: discounted ? '#27AE60' : '#000',
    },
  })
}

export default { PriceDisplay, PriceComparison, CurrencyBadge }
