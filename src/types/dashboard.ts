export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalContent: number;
  dailyActiveUsers: number;
}

export interface UserGrowthData {
  date: string;
  users: number;
  activeUsers: number;
}

export interface SubscriptionDistribution {
  planType: string;
  count: number;
  percentage: number;
}

export interface ContentEngagement {
  contentType: string;
  views: number;
  completions: number;
}

export interface RecentActivity {
  id: string;
  type: "user" | "subscription" | "content";
  message: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  userGrowth: UserGrowthData[];
  subscriptionDistribution: SubscriptionDistribution[];
  contentEngagement: ContentEngagement[];
  recentActivity: RecentActivity[];
  stripePaymentsThisMonth?: StripePaymentData[];
  newUsersThisMonth?: NewUserData[];
}

export interface StripePaymentData {
  date: string;
  amount: number;
  count: number;
}

export interface NewUserData {
  date: string;
  count: number;
}

export interface AnalyticsData {
  userAnalytics: {
    totalSignups: number;
    retentionRate: number;
    averageEngagementTime: number;
    churnRate: number;
  };
  contentPerformance: {
    totalModules: number;
    totalLessons: number;
    averageCompletion: number;
    topPerformingContent: Array<{
      id: string;
      title: string;
      completionRate: number;
    }>;
  };
  revenueMetrics: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
    revenueByPlan: Array<{
      plan: string;
      revenue: number;
    }>;
  };
}
