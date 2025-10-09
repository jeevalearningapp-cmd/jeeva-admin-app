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
