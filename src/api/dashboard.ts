import { supabase } from '@/lib/supabase'
import { DashboardData, DashboardMetrics, AnalyticsData, DashboardHero } from '@/types/dashboard'

export const dashboardApi = {
  async getDashboardData(): Promise<DashboardData> {
    // Get metrics
    const [usersCount, subscriptionsCount] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }),
    ])

    const totalUsers = usersCount.count || 0
    const totalSubscriptions = subscriptionsCount.count || 0

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: activeUsersCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('last_sign_in_at', thirtyDaysAgo.toISOString())

    // Get active subscriptions
    const { count: activeSubscriptionsCount } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get total content (modules + lessons)
    const [modulesCount, lessonsCount] = await Promise.all([
      supabase.from('modules').select('id', { count: 'exact', head: true }),
      supabase.from('lessons').select('id', { count: 'exact', head: true }),
    ])

    const totalContent = (modulesCount.count || 0) + (lessonsCount.count || 0)

    // Get DAU (users active today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: dauCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('last_sign_in_at', today.toISOString())

    const metrics: DashboardMetrics = {
      totalUsers,
      activeUsers: activeUsersCount || 0,
      totalSubscriptions,
      activeSubscriptions: activeSubscriptionsCount || 0,
      totalContent,
      dailyActiveUsers: dauCount || 0,
    }

    // Get user growth data (last 7 days)
    const userGrowth = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .lt('created_at', nextDate.toISOString())

      userGrowth.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: count || 0,
        activeUsers: Math.floor((count || 0) * 0.7), // Estimate active users as 70%
      })
    }

    // Get subscription distribution
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('plan_type')

    const planCounts: Record<string, number> = {}
    subscriptions?.forEach((sub) => {
      planCounts[sub.plan_type] = (planCounts[sub.plan_type] || 0) + 1
    })

    const total = subscriptions?.length || 1
    const subscriptionDistribution = Object.entries(planCounts).map(([planType, count]) => ({
      planType,
      count,
      percentage: Math.round((count / total) * 100),
    }))

    // Mock content engagement (would need actual view/completion data)
    const contentEngagement = [
      { contentType: 'Modules', views: 1234, completions: 856 },
      { contentType: 'Lessons', views: 3456, completions: 2134 },
      { contentType: 'Quizzes', views: 2345, completions: 1567 },
      { contentType: 'Flashcards', views: 1890, completions: 1234 },
    ]

    // Get recent activity
    const { data: recentUsers } = await supabase
      .from('users')
      .select('email, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    const recentActivity = recentUsers?.map((user) => ({
      id: user.email,
      type: 'user' as const,
      message: `New user registered: ${user.email}`,
      timestamp: user.created_at,
    })) || []

    return {
      metrics,
      userGrowth,
      subscriptionDistribution,
      contentEngagement,
      recentActivity,
    }
  },

  async getAnalyticsData(): Promise<AnalyticsData> {
    // Get total signups
    const { count: totalSignups } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })

    // Mock analytics data (would need actual tracking)
    return {
      userAnalytics: {
        totalSignups: totalSignups || 0,
        retentionRate: 68.5,
        averageEngagementTime: 24.3,
        churnRate: 5.2,
      },
      contentPerformance: {
        totalModules: 12,
        totalLessons: 48,
        averageCompletion: 72.4,
        topPerformingContent: [
          { id: '1', title: 'Introduction to Biology', completionRate: 89.2 },
          { id: '2', title: 'Chemistry Basics', completionRate: 84.7 },
          { id: '3', title: 'Physics Fundamentals', completionRate: 78.3 },
        ],
      },
      revenueMetrics: {
        totalRevenue: 45600,
        monthlyRecurringRevenue: 12800,
        averageRevenuePerUser: 24.5,
        revenueByPlan: [
          { plan: 'Free', revenue: 0 },
          { plan: 'Basic', revenue: 15200 },
          { plan: 'Premium', revenue: 30400 },
        ],
      },
    }
  },

  async getDashboardHeroes(): Promise<DashboardHero[]> {
    const { data, error } = await supabase
      .from('dashboard_heroes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createDashboardHero(hero: Omit<DashboardHero, 'id' | 'created_at' | 'updated_at'>): Promise<DashboardHero> {
    const { data, error } = await supabase
      .from('dashboard_heroes')
      .insert(hero)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateDashboardHero(id: string, updates: Partial<DashboardHero>): Promise<DashboardHero> {
    const { data, error } = await supabase
      .from('dashboard_heroes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteDashboardHero(id: string): Promise<void> {
    const { error } = await supabase
      .from('dashboard_heroes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
