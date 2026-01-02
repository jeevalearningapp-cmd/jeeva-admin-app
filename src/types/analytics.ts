export interface DateRange {
  startDate: string
  endDate: string
}

export interface UserAnalytics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  retentionRate: number
  averageSessionDuration: number
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
}

export interface ContentPerformance {
  totalViews: number
  totalCompletions: number
  averageCompletionRate: number
  topModules: {
    id: string
    name: string
    views: number
    completions: number
    completionRate: number
  }[]
  topLessons: {
    id: string
    name: string
    moduleName: string
    views: number
    completions: number
  }[]
}

export interface RevenueMetrics {
  totalRevenue: number
  monthlyRecurringRevenue: number
  averageRevenuePerUser: number
  subscriptionBreakdown: {
    planType: string
    count: number
    revenue: number
  }[]
  revenueGrowth: number
}

export interface EngagementTrend {
  date: string
  activeUsers: number
  sessions: number
  avgDuration: number
}

export interface ConversionMetric {
  date: string
  signups: number
  conversions: number
  conversionRate: number
}

export interface AnalyticsData {
  userAnalytics: UserAnalytics
  contentPerformance: ContentPerformance
  revenueMetrics: RevenueMetrics
  engagementTrends: EngagementTrend[]
  conversionMetrics: ConversionMetric[]
}

/**
 * Currency breakdown for presentment analytics
 * Used in Stripe Adaptive Pricing analytics
 * 
 * Requirements: 3.1, 3.2
 */
export interface CurrencyBreakdown {
  currency: string          // Currency code (INR, GBP, USD)
  count: number             // Number of payments in this currency
  percentage: number        // Percentage of total payments
  averageLocalAmount: number // Average amount in local currency
  averageGbpAmount: number  // Average amount in GBP
  totalLocalAmount: number  // Total amount in local currency
  totalGbpAmount: number    // Total amount in GBP
}

/**
 * Presentment summary for Stripe Adaptive Pricing
 * Shows distribution of payments across presentment currencies
 * 
 * Requirements: 3.1, 3.2
 */
export interface PresentmentSummary {
  range: string             // Time range (e.g., "30d")
  totalPayments: number     // Total number of payments in range
  byCurrency: CurrencyBreakdown[]
}
