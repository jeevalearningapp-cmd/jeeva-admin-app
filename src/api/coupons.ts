import { supabase } from '@/lib/supabase'
import { DiscountCoupon, CreateCouponInput, UpdateCouponInput, CouponValidationResult } from '@/types/coupon'

const mapToCoupon = (data: any): DiscountCoupon => ({
  id: data.id,
  code: data.code,
  description: data.description,
  discount_type: data.discount_type,
  discount_value: parseFloat(data.discount_value),
  currency: data.currency,
  duration: data.duration,
  duration_in_months: data.duration_in_months,
  applicable_plans: data.applicable_plans,
  usage_limit: data.usage_limit,
  times_redeemed: data.times_redeemed || 0,
  valid_from: data.valid_from,
  valid_until: data.valid_until,
  is_active: data.is_active,
  stripe_coupon_id: data.stripe_coupon_id,
  stripe_promotion_code_id: data.stripe_promotion_code_id,
  metadata: data.metadata || {},
  created_at: data.created_at,
  updated_at: data.updated_at,
})

export const couponsAPI = {
  /**
   * Get all coupons with optional filtering
   */
  async getAll(filters?: { active_only?: boolean; search?: string }): Promise<DiscountCoupon[]> {
    let query = supabase
      .from('discount_coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.active_only) {
      query = query.eq('is_active', true)
    }

    if (filters?.search) {
      query = query.or(`code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(mapToCoupon)
  },

  /**
   * Get active coupons with computed stats
   */
  async getActiveWithStats(): Promise<any[]> {
    const { data, error } = await supabase
      .from('active_coupons_with_stats')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get coupon by ID
   */
  async getById(id: string): Promise<DiscountCoupon> {
    const { data, error } = await supabase
      .from('discount_coupons')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapToCoupon(data)
  },

  /**
   * Get coupon by code
   */
  async getByCode(code: string): Promise<DiscountCoupon | null> {
    const { data, error } = await supabase
      .from('discount_coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return mapToCoupon(data)
  },

  /**
   * Create a new coupon
   */
  async create(input: CreateCouponInput): Promise<DiscountCoupon> {
    const insertData: any = {
      code: input.code.toUpperCase(),
      description: input.description,
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      currency: input.currency || (input.discount_type === 'fixed_amount' ? 'USD' : null),
      duration: input.duration || 'once',
      duration_in_months: input.duration_in_months,
      applicable_plans: input.applicable_plans,
      usage_limit: input.usage_limit,
      valid_from: input.valid_from,
      valid_until: input.valid_until,
      is_active: input.is_active ?? true,
      times_redeemed: 0,
      metadata: input.metadata || {},
    }

    const { data, error } = await supabase
      .from('discount_coupons')
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return mapToCoupon(data)
  },

  /**
   * Update an existing coupon
   */
  async update(id: string, input: UpdateCouponInput): Promise<DiscountCoupon> {
    const updateData: any = {}
    
    if (input.description !== undefined) updateData.description = input.description
    if (input.is_active !== undefined) updateData.is_active = input.is_active
    if (input.usage_limit !== undefined) updateData.usage_limit = input.usage_limit
    if (input.valid_until !== undefined) updateData.valid_until = input.valid_until
    if (input.metadata !== undefined) updateData.metadata = input.metadata

    const { data, error } = await supabase
      .from('discount_coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapToCoupon(data)
  },

  /**
   * Delete a coupon
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('discount_coupons')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Validate a coupon code
   */
  async validate(code: string, planId?: string): Promise<CouponValidationResult> {
    const coupon = await this.getByCode(code)

    if (!coupon) {
      return { valid: false, error: 'Coupon not found' }
    }

    if (!coupon.is_active) {
      return { valid: false, error: 'Coupon is inactive', coupon }
    }

    const now = new Date()
    const validFrom = new Date(coupon.valid_from)
    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null

    if (now < validFrom) {
      return { valid: false, error: 'Coupon is not yet valid', coupon }
    }

    if (validUntil && now > validUntil) {
      return { valid: false, error: 'Coupon has expired', coupon }
    }

    if (coupon.usage_limit && coupon.times_redeemed >= coupon.usage_limit) {
      return { valid: false, error: 'Coupon usage limit reached', coupon }
    }

    if (planId && coupon.applicable_plans && coupon.applicable_plans.length > 0) {
      if (!coupon.applicable_plans.includes(planId)) {
        return { valid: false, error: 'Coupon not applicable to this plan', coupon }
      }
    }

    return { valid: true, coupon }
  },

  /**
   * Increment coupon usage count
   */
  async incrementUsage(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_coupon_usage', { coupon_id: id })
    
    if (error) {
      // Fallback to manual increment if function doesn't exist
      const { data: coupon } = await supabase
        .from('discount_coupons')
        .select('times_redeemed')
        .eq('id', id)
        .single()

      if (coupon) {
        await supabase
          .from('discount_coupons')
          .update({ times_redeemed: (coupon.times_redeemed || 0) + 1 })
          .eq('id', id)
      }
    }
  },

  /**
   * Sync coupon with Stripe
   */
  async syncWithStripe(id: string, stripeCouponId: string): Promise<DiscountCoupon> {
    const { data, error } = await supabase
      .from('discount_coupons')
      .update({ stripe_coupon_id: stripeCouponId })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapToCoupon(data)
  },
}

// Helper function to create increment_coupon_usage RPC function
export const createIncrementUsageFunction = async () => {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
      RETURNS void AS $$
      BEGIN
        UPDATE discount_coupons
        SET times_redeemed = times_redeemed + 1
        WHERE id = coupon_id;
      END;
      $$ LANGUAGE plpgsql;
    `
  })
  
  if (error) console.error('Failed to create increment_coupon_usage function:', error)
}
