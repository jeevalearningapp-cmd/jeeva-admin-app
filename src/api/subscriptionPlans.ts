import { supabase } from '@/lib/supabase'
import { SubscriptionPlan, CreateSubscriptionPlanInput, UpdateSubscriptionPlanInput } from '@/types/subscription'

const mapToSubscriptionPlan = (data: any): SubscriptionPlan => ({
  id: data.id,
  name: data.name,
  description: data.description,
  price: data.price,
  billingCycle: data.billing_cycle,
  features: data.features || [],
  maxUsers: data.max_users,
  isActive: data.is_active,
  displayOrder: data.display_order,
  createdAt: data.created_at,
  updatedAt: data.updated_at
})

export const subscriptionPlansAPI = {
  async getAll(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapToSubscriptionPlan)
  },

  async getActive(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapToSubscriptionPlan)
  },

  async getById(id: string): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapToSubscriptionPlan(data)
  },

  async create(input: CreateSubscriptionPlanInput): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert([{
        name: input.name,
        description: input.description,
        price: input.price,
        billing_cycle: input.billingCycle,
        features: input.features,
        max_users: input.maxUsers,
        is_active: input.isActive ?? true,
        display_order: input.displayOrder ?? 0
      }])
      .select()
      .single()

    if (error) throw error
    return mapToSubscriptionPlan(data)
  },

  async update(id: string, input: UpdateSubscriptionPlanInput): Promise<SubscriptionPlan> {
    const updateData: any = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.price !== undefined) updateData.price = input.price
    if (input.billingCycle !== undefined) updateData.billing_cycle = input.billingCycle
    if (input.features !== undefined) updateData.features = input.features
    if (input.maxUsers !== undefined) updateData.max_users = input.maxUsers
    if (input.isActive !== undefined) updateData.is_active = input.isActive
    if (input.displayOrder !== undefined) updateData.display_order = input.displayOrder

    const { data, error } = await supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapToSubscriptionPlan(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
