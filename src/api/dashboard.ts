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

    // Get active users from analytics_sessions using optimized RPC function
    const { data: activeUsersCount } = await supabase
      .rpc('count_distinct_active_users', { days_ago: 30 })

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

    // Get DAU (users with sessions today) using optimized RPC function
    const today = new Date()
    const todayDate = today.toISOString().split('T')[0]
    
    const { data: dauCount } = await supabase
      .rpc('count_distinct_users_by_day', { target_date: todayDate })

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

      // Get active users for this day using optimized RPC function
      const dayDateString = date.toISOString().split('T')[0]
      const { data: dayActiveUsers } = await supabase
        .rpc('count_distinct_users_by_day', { target_date: dayDateString })

      userGrowth.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: count || 0,
        activeUsers: dayActiveUsers || 0,
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

    // Get real content engagement data using count queries (no large data fetches)
    const [
      totalLearningCount,
      completedLearningCount,
      totalPracticeCount,
      completedPracticeCount,
      totalMocksCount,
      completedMocksCount
    ] = await Promise.all([
      supabase.from('learning_completions').select('id', { count: 'exact', head: true }),
      supabase.from('learning_completions').select('id', { count: 'exact', head: true }).eq('completed', true),
      supabase.from('practice_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('practice_sessions').select('id', { count: 'exact', head: true }).not('completed_at', 'is', null),
      supabase.from('mock_exams').select('id', { count: 'exact', head: true }),
      supabase.from('mock_exams').select('id', { count: 'exact', head: true }).not('completed_at', 'is', null),
    ])

    const contentEngagement = [
      { contentType: 'Lessons', views: totalLearningCount.count || 0, completions: completedLearningCount.count || 0 },
      { contentType: 'Practice', views: totalPracticeCount.count || 0, completions: completedPracticeCount.count || 0 },
      { contentType: 'Mock Exams', views: totalMocksCount.count || 0, completions: completedMocksCount.count || 0 },
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

    // Calculate average engagement time using aggregation (no large data fetch)
    const { data: avgDurationData } = await supabase
      .from('analytics_sessions')
      .select('duration_seconds')
      .not('duration_seconds', 'is', null)
      .limit(1000) // Limit to recent sessions for performance
    
    const avgEngagementTime = avgDurationData && avgDurationData.length > 0
      ? avgDurationData.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / avgDurationData.length / 60 // Convert to minutes
      : 0

    // Calculate retention rate using optimized RPC function (users active in last 7 days vs total users)
    const { data: activeUsersLast7Days } = await supabase
      .rpc('count_distinct_active_users', { days_ago: 7 })
    
    const retentionRate = (totalSignups && totalSignups > 0)
      ? ((activeUsersLast7Days || 0) / totalSignups) * 100
      : 0

    // Calculate churn rate (subscriptions that expired or cancelled in last 30 days)
    const thirtyDaysAgoChurn = new Date()
    thirtyDaysAgoChurn.setDate(thirtyDaysAgoChurn.getDate() - 30)
    
    const { count: totalSubs } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
    
    const { count: churnedSubs } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['expired', 'cancelled'])
      .gte('updated_at', thirtyDaysAgoChurn.toISOString())
    
    const safeTotalSubs = (totalSubs && totalSubs > 0) ? totalSubs : 1
    const churnRate = ((churnedSubs || 0) / safeTotalSubs) * 100

    // Get real content performance using count queries
    const [modulesCount, lessonsCount, totalCompletionsCount, completedCount] = await Promise.all([
      supabase.from('modules').select('id', { count: 'exact', head: true }),
      supabase.from('lessons').select('id', { count: 'exact', head: true }),
      supabase.from('learning_completions').select('id', { count: 'exact', head: true }),
      supabase.from('learning_completions').select('id', { count: 'exact', head: true }).eq('completed', true),
    ])

    const totalLessons = lessonsCount.count || 0
    const totalCompletions = completedCount.count || 0
    const totalAttempts = totalCompletionsCount.count || 0
    const averageCompletion = totalAttempts > 0 ? (totalCompletions / totalAttempts) * 100 : 0

    // Get top performing lessons - limit to recent 500 completions for performance
    const { data: recentCompletions } = await supabase
      .from('learning_completions')
      .select('completed, lesson_id')
      .order('created_at', { ascending: false })
      .limit(500)

    const lessonCompletionMap: Record<string, { total: number; completed: number }> = {}
    recentCompletions?.forEach(c => {
      if (!lessonCompletionMap[c.lesson_id]) {
        lessonCompletionMap[c.lesson_id] = { total: 0, completed: 0 }
      }
      lessonCompletionMap[c.lesson_id].total++
      if (c.completed) lessonCompletionMap[c.lesson_id].completed++
    })

    const topLessonIds = Object.entries(lessonCompletionMap)
      .filter(([_, stats]) => stats.total >= 3) // Only include lessons with at least 3 attempts
      .map(([id, stats]) => ({
        id,
        completionRate: (stats.completed / stats.total) * 100,
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3)

    // Get lesson titles for top performers (only if we have lessons)
    let topPerformingContent: Array<{ id: string; title: string; completionRate: number }> = []
    
    if (topLessonIds.length > 0) {
      const { data: topLessons } = await supabase
        .from('lessons')
        .select('id, title')
        .in('id', topLessonIds.map(l => l.id))

      topPerformingContent = topLessonIds.map(lesson => {
        const lessonData = topLessons?.find(l => l.id === lesson.id)
        return {
          id: lesson.id,
          title: lessonData?.title || 'Unknown Lesson',
          completionRate: Math.round(lesson.completionRate * 10) / 10, // Round to 1 decimal
        }
      })
    }

    // Get real revenue from active subscriptions with actual plan pricing
    const { data: activeSubscriptionsData } = await supabase
      .from('subscriptions')
      .select('plan_type, amount_paid_usd')
      .eq('status', 'active')

    const totalRevenue = activeSubscriptionsData?.reduce((sum, sub) => sum + (sub.amount_paid_usd || 0), 0) || 0
    const monthlyRecurringRevenue = totalRevenue // For now, all active subs contribute to MRR
    
    const safeUserCountRevenue = (totalSignups && totalSignups > 0) ? totalSignups : 1
    const averageRevenuePerUser = totalRevenue / safeUserCountRevenue

    // Revenue by plan type
    const planRevenue: Record<string, number> = {}
    activeSubscriptionsData?.forEach(sub => {
      const planType = sub.plan_type || 'Unknown'
      planRevenue[planType] = (planRevenue[planType] || 0) + (sub.amount_paid_usd || 0)
    })

    const revenueByPlan = Object.entries(planRevenue).map(([plan, revenue]) => ({
      plan,
      revenue: Math.round(revenue),
    }))

    return {
      userAnalytics: {
        totalSignups: totalSignups || 0,
        retentionRate: Math.round(retentionRate * 10) / 10,
        averageEngagementTime: Math.round(avgEngagementTime * 10) / 10,
        churnRate: Math.round(churnRate * 10) / 10,
      },
      contentPerformance: {
        totalModules: modulesCount.count || 0,
        totalLessons,
        averageCompletion: Math.round(averageCompletion * 10) / 10,
        topPerformingContent,
      },
      revenueMetrics: {
        totalRevenue: Math.round(totalRevenue),
        monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue),
        averageRevenuePerUser: Math.round(averageRevenuePerUser * 10) / 10,
        revenueByPlan,
      },
    }
  },

  async getDashboardHeroes(): Promise<DashboardHero[]> {
    const { data, error } = await supabase
      .from('hero_sections')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createDashboardHero(hero: Omit<DashboardHero, 'id' | 'created_at' | 'updated_at'>): Promise<DashboardHero> {
    const { data, error } = await supabase
      .from('hero_sections')
      .insert(hero)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateDashboardHero(id: string, updates: Partial<DashboardHero>): Promise<DashboardHero> {
    const { data, error } = await supabase
      .from('hero_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteDashboardHero(id: string): Promise<void> {
    const { error } = await supabase
      .from('hero_sections')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
