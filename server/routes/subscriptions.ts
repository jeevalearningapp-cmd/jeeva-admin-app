import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

/**
 * POST /api/subscriptions/validate-coupon
 * Validate a discount coupon code
 */
router.post('/validate-coupon', async (req: Request, res: Response) => {
  try {
    const { code, planId } = req.body

    if (!code || !planId) {
      return res.status(400).json({
        valid: false,
        error: 'Missing code or planId'
      })
    }

    // Fetch coupon from database
    const { data: coupon, error: couponError } = await supabase
      .from('discount_coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (couponError || !coupon) {
      return res.status(200).json({
        valid: false,
        error: 'Invalid or expired coupon'
      })
    }

    // Check if coupon has expired
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return res.status(200).json({
        valid: false,
        error: 'Coupon has expired'
      })
    }

    // Check if coupon has reached usage limit
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return res.status(200).json({
        valid: false,
        error: 'Coupon usage limit reached'
      })
    }

    // Check if coupon is applicable to this plan
    if (coupon.applicable_plans && coupon.applicable_plans.length > 0) {
      if (!coupon.applicable_plans.includes(planId)) {
        return res.status(200).json({
          valid: false,
          error: 'This coupon is not applicable to this plan'
        })
      }
    }

    // Return valid coupon
    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      description: coupon.description
    })

  } catch (error) {
    console.error('❌ Error validating coupon:', error)
    res.status(500).json({
      valid: false,
      error: 'Failed to validate coupon'
    })
  }
})

/**
 * GET /api/subscriptions/plans
 * Get all active subscription plans
 */
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (error) throw error

    res.json(plans || [])
  } catch (error) {
    console.error('❌ Error fetching subscription plans:', error)
    res.status(500).json({
      error: 'Failed to fetch subscription plans'
    })
  }
})

export default router
