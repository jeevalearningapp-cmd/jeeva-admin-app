// Discount Coupon Types

export interface DiscountCoupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  currency: string | null
  duration: 'once' | 'repeating' | 'forever' | null
  duration_in_months: number | null
  applicable_plans: string[] | null
  usage_limit: number | null
  times_redeemed: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  stripe_coupon_id: string | null
  stripe_promotion_code_id: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreateCouponInput {
  code: string
  description?: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  currency?: string
  duration?: 'once' | 'repeating' | 'forever'
  duration_in_months?: number
  applicable_plans?: string[]
  usage_limit?: number
  valid_from: string
  valid_until?: string
  is_active?: boolean
  metadata?: Record<string, any>
  create_in_stripe?: boolean
}

export interface UpdateCouponInput {
  description?: string
  is_active?: boolean
  usage_limit?: number
  valid_until?: string
  metadata?: Record<string, any>
}

export interface CouponValidationResult {
  valid: boolean
  coupon?: DiscountCoupon
  error?: string
  discount_amount?: number
}

export interface CouponUsageStats {
  total_redemptions: number
  redemptions_by_currency: Array<{
    currency: string
    count: number
    percentage: number
  }>
  redemptions_by_plan: Array<{
    plan_id: string
    plan_name: string
    count: number
  }>
  revenue_impact: {
    total_discount_given: number
    currency: string
  }
}

export interface StripeCouponParams {
  name: string
  duration: 'once' | 'repeating' | 'forever'
  percent_off?: number
  amount_off?: number
  currency?: string
  duration_in_months?: number
  max_redemptions?: number
  redeem_by?: number
  metadata?: Record<string, any>
}
