import { supabase } from '@/lib/supabase'
import { AnalyticsData, DateRange } from '@/types/analytics'
import { formatISO, subDays } from 'date-fns'

const getEmptyAnalyticsData = (): AnalyticsData => ({
  userAnalytics: {
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    retentionRate: 0,
    averageSessionDuration: 0,
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0
  },
  contentPerformance: {
    totalViews: 0,
    totalCompletions: 0,
    averageCompletionRate: 0,
    topModules: [],
    topLessons: []
  },
  revenueMetrics: {
    totalRevenue: 0,
    monthlyRecurringRevenue: 0,
    averageRevenuePerUser: 0,
    subscriptionBreakdown: [],
    revenueGrowth: 0
  },
  engagementTrends: Array.from({ length: 7 }, (_, i) => ({
    date: formatISO(subDays(new Date(), 6 - i), { representation: 'date' }),
    activeUsers: 0,
    sessions: 0,
    avgDuration: 0
  })),
  conversionMetrics: Array.from({ length: 7 }, (_, i) => ({
    date: formatISO(subDays(new Date(), 6 - i), { representation: 'date' }),
    signups: 0,
    conversions: 0,
    conversionRate: 0
  }))
})

export const analyticsAPI = {
  async getAnalytics(dateRange?: DateRange): Promise<AnalyticsData> {
    try {
      const startDate = dateRange?.startDate || formatISO(subDays(new Date(), 30), { representation: 'date' })
      const endDate = dateRange?.endDate || formatISO(new Date(), { representation: 'date' })

      // User Analytics - with error handling
      let users: any[] = []
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, created_at, last_login')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
        
        if (!error && data) users = data
        else if (error) console.warn('Users query failed:', error.message)
      } catch (err) {
        console.warn('Users query error:', err)
      }

      // Subscriptions - with error handling
      let subscriptions: any[] = []
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*, users(id)')
          .eq('status', 'active')
        
        if (!error && data) subscriptions = data
        else if (error) console.warn('Subscriptions query failed:', error.message)
      } catch (err) {
        console.warn('Subscriptions query error:', err)
      }

      // Content Engagement - with error handling (this is likely to fail if table doesn't exist)
      let completions: any[] = []
      try {
        const { data, error } = await supabase
          .from('learning_completions')
          .select('*, lessons(id, title, topics(id, title, modules(id, title)))')
          .gte('completed_at', startDate)
          .lte('completed_at', endDate)
        
        if (!error && data) completions = data
        else if (error) console.warn('Learning completions query failed (table may not exist):', error.message)
      } catch (err) {
        console.warn('Learning completions query error:', err)
      }

      // Calculate metrics with safe defaults
      const totalUsers = users?.length || 0
      const activeUsers = users?.filter(u => u.last_login && new Date(u.last_login) > subDays(new Date(), 7)).length || 0
      
      // Revenue calculations
      const totalRevenue = subscriptions?.reduce((sum, sub: any) => {
        const prices: Record<string, number> = { premium: 29.99, basic: 9.99, trial: 0 }
        return sum + (prices[sub.plan_type] || 0)
      }, 0) || 0

      // Top content - Access module through topic
      const moduleViews: Record<string, { name: string; views: number; completions: number }> = {}
      completions?.forEach((comp: any) => {
        const moduleId = comp.lessons?.topics?.modules?.id
        const moduleName = comp.lessons?.topics?.modules?.title
        if (moduleId) {
          if (!moduleViews[moduleId]) {
            moduleViews[moduleId] = { name: moduleName, views: 0, completions: 0 }
          }
          moduleViews[moduleId].views += 1
          if (comp.is_completed) moduleViews[moduleId].completions += 1
        }
      })

      const topModules = Object.entries(moduleViews)
        .map(([id, data]) => ({
          id,
          name: data.name,
          views: data.views,
          completions: data.completions,
          completionRate: data.views > 0 ? (data.completions / data.views) * 100 : 0
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)

      return {
        userAnalytics: {
          totalUsers,
          activeUsers,
          newUsers: totalUsers,
          retentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
          averageSessionDuration: 0,
          dailyActiveUsers: Math.floor(activeUsers * 0.6),
          weeklyActiveUsers: activeUsers,
          monthlyActiveUsers: totalUsers
        },
        contentPerformance: {
          totalViews: completions?.length || 0,
          totalCompletions: completions?.filter((c: any) => c.is_completed).length || 0,
          averageCompletionRate: topModules.length > 0 
            ? topModules.reduce((sum, m) => sum + m.completionRate, 0) / topModules.length 
            : 0,
          topModules,
          topLessons: []
        },
        revenueMetrics: {
          totalRevenue,
          monthlyRecurringRevenue: totalRevenue,
          averageRevenuePerUser: totalUsers > 0 ? totalRevenue / totalUsers : 0,
          subscriptionBreakdown: [
            { planType: 'Premium', count: subscriptions?.filter((s: any) => s.plan_type === 'premium').length || 0, revenue: 0 },
            { planType: 'Basic', count: subscriptions?.filter((s: any) => s.plan_type === 'basic').length || 0, revenue: 0 },
            { planType: 'Trial', count: subscriptions?.filter((s: any) => s.plan_type === 'trial').length || 0, revenue: 0 }
          ],
          revenueGrowth: 0
        },
        engagementTrends: Array.from({ length: 7 }, (_, i) => ({
          date: formatISO(subDays(new Date(), 6 - i), { representation: 'date' }),
          activeUsers: 0,
          sessions: 0,
          avgDuration: 0
        })),
        conversionMetrics: Array.from({ length: 7 }, (_, i) => ({
          date: formatISO(subDays(new Date(), 6 - i), { representation: 'date' }),
          signups: 0,
          conversions: 0,
          conversionRate: 0
        }))
      }
    } catch (error) {
      // If entire function fails, return safe empty data
      console.error('Analytics API error:', error)
      return getEmptyAnalyticsData()
    }
  },

  async exportAnalyticsCSV(data: AnalyticsData): Promise<string> {
    const headers = ['Metric', 'Value']
    const rows = [
      ['Total Users', data.userAnalytics.totalUsers.toString()],
      ['Active Users', data.userAnalytics.activeUsers.toString()],
      ['New Users', data.userAnalytics.newUsers.toString()],
      ['Retention Rate', `${data.userAnalytics.retentionRate.toFixed(2)}%`],
      ['Total Revenue', `$${data.revenueMetrics.totalRevenue.toFixed(2)}`],
      ['MRR', `$${data.revenueMetrics.monthlyRecurringRevenue.toFixed(2)}`],
      ['ARPU', `$${data.revenueMetrics.averageRevenuePerUser.toFixed(2)}`],
      ['Content Views', data.contentPerformance.totalViews.toString()],
      ['Content Completions', data.contentPerformance.totalCompletions.toString()],
      ['Avg Completion Rate', `${data.contentPerformance.averageCompletionRate.toFixed(2)}%`]
    ]

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    return csvContent
  }
}
