import { supabase } from '@/lib/supabase'
import { UserSubscription, CreateUserSubscriptionInput, UpdateUserSubscriptionInput, SubscriptionAnalytics } from '@/types/subscription'

const mapToUserSubscription = (data: any): UserSubscription => ({
  id: data.id,
  userId: data.user_id,
  planId: data.plan_id,
  status: data.status,
  startDate: data.start_date,
  endDate: data.end_date,
  autoRenew: data.auto_renew,
  paymentMethod: data.payment_method,
  lastPaymentDate: data.last_payment_date,
  nextPaymentDate: data.next_payment_date,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  user: data.users ? {
    id: data.users.id,
    email: data.users.email,
    firstName: data.users.first_name,
    lastName: data.users.last_name
  } : undefined,
  plan: data.subscription_plans ? {
    id: data.subscription_plans.id,
    name: data.subscription_plans.name,
    description: data.subscription_plans.description,
    price: data.subscription_plans.price,
    billingCycle: data.subscription_plans.billing_cycle,
    features: data.subscription_plans.features || [],
    maxUsers: data.subscription_plans.max_users,
    isActive: data.subscription_plans.is_active,
    displayOrder: data.subscription_plans.display_order,
    createdAt: data.subscription_plans.created_at,
    updatedAt: data.subscription_plans.updated_at
  } : undefined
})

export const userSubscriptionsAPI = {
  async getAll(): Promise<UserSubscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, users(id, email, first_name, last_name), subscription_plans(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapToUserSubscription)
  },

  async getByStatus(status: string): Promise<UserSubscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, users(id, email, first_name, last_name), subscription_plans(*)')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapToUserSubscription)
  },

  async getByUserId(userId: string): Promise<UserSubscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, users(id, email, first_name, last_name), subscription_plans(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapToUserSubscription)
  },

  async getById(id: string): Promise<UserSubscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, users(id, email, first_name, last_name), subscription_plans(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapToUserSubscription(data)
  },

  async create(input: CreateUserSubscriptionInput): Promise<UserSubscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: input.userId,
        plan_id: input.planId,
        status: input.status || 'active',
        start_date: input.startDate || new Date().toISOString(),
        end_date: input.endDate,
        auto_renew: input.autoRenew ?? true,
        payment_method: input.paymentMethod
      }])
      .select('*, users(id, email, first_name, last_name), subscription_plans(*)')
      .single()

    if (error) throw error
    return mapToUserSubscription(data)
  },

  async update(id: string, input: UpdateUserSubscriptionInput): Promise<UserSubscription> {
    const updateData: any = {}
    if (input.planId !== undefined) updateData.plan_id = input.planId
    if (input.status !== undefined) updateData.status = input.status
    if (input.startDate !== undefined) updateData.start_date = input.startDate
    if (input.endDate !== undefined) updateData.end_date = input.endDate
    if (input.autoRenew !== undefined) updateData.auto_renew = input.autoRenew
    if (input.paymentMethod !== undefined) updateData.payment_method = input.paymentMethod
    if (input.lastPaymentDate !== undefined) updateData.last_payment_date = input.lastPaymentDate
    if (input.nextPaymentDate !== undefined) updateData.next_payment_date = input.nextPaymentDate

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select('*, users(id, email, first_name, last_name), subscription_plans(*)')
      .single()

    if (error) throw error
    return mapToUserSubscription(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getAnalytics(): Promise<SubscriptionAnalytics> {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(*)')

    if (error) throw error

    const total = subscriptions?.length || 0
    const active = subscriptions?.filter(s => s.status === 'active').length || 0
    const cancelled = subscriptions?.filter(s => s.status === 'cancelled').length || 0
    const trial = subscriptions?.filter(s => s.status === 'trial').length || 0

    const mrr = subscriptions
      ?.filter(s => s.status === 'active')
      .reduce((sum, sub) => {
        const plan = sub.subscription_plans
        if (plan?.billing_cycle === 'monthly') {
          return sum + (plan.price || 0)
        } else if (plan?.billing_cycle === 'yearly') {
          return sum + (plan.price || 0) / 12
        }
        return sum
      }, 0) || 0

    const churnRate = total > 0 ? (cancelled / total) * 100 : 0
    const avgValue = active > 0 ? mrr / active : 0

    const planBreakdown: Record<string, { planId: string; planName: string; count: number; revenue: number }> = {}
    subscriptions?.forEach(sub => {
      const plan = sub.subscription_plans
      if (plan && sub.status === 'active') {
        if (!planBreakdown[plan.id]) {
          planBreakdown[plan.id] = {
            planId: plan.id,
            planName: plan.name,
            count: 0,
            revenue: 0
          }
        }
        planBreakdown[plan.id].count += 1
        if (plan.billing_cycle === 'monthly') {
          planBreakdown[plan.id].revenue += plan.price || 0
        } else if (plan.billing_cycle === 'yearly') {
          planBreakdown[plan.id].revenue += (plan.price || 0) / 12
        }
      }
    })

    return {
      totalSubscriptions: total,
      activeSubscriptions: active,
      cancelledSubscriptions: cancelled,
      trialSubscriptions: trial,
      monthlyRecurringRevenue: mrr,
      churnRate,
      averageSubscriptionValue: avgValue,
      subscriptionsByPlan: Object.values(planBreakdown)
    }
  }
}
