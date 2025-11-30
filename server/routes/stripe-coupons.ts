import { Router, Request, Response } from 'express'
import Stripe from 'stripe'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
})

/**
 * POST /api/stripe-coupons
 * Create a Stripe coupon
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, durationMonths, maxRedemptions, description } = req.body

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: code, discountType, discountValue',
      })
    }

    const couponData: Stripe.CouponCreateParams = {
      id: code.toUpperCase(),
      duration: 'repeating',
      duration_in_months: durationMonths || 1,
      max_redemptions: maxRedemptions || undefined,
      metadata: {
        description: description || '',
        createdVia: 'admin_portal',
      },
    }

    if (discountType === 'percentage') {
      couponData.percent_off = Math.min(100, parseFloat(discountValue))
    } else {
      couponData.amount_off = Math.round(parseFloat(discountValue) * 100) // Convert to cents
      couponData.currency = 'usd'
    }

    const coupon = await stripe.coupons.create(couponData)

    res.json({
      success: true,
      coupon: {
        id: coupon.id,
        discountType: discountType,
        discountValue: parseFloat(discountValue),
        maxRedemptions: coupon.max_redemptions,
        timesRedeemed: coupon.times_redeemed,
        description: coupon.metadata?.description || '',
        createdAt: new Date(coupon.created * 1000).toISOString(),
      },
    })
  } catch (error: any) {
    console.error('❌ Error creating Stripe coupon:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stripe-coupons
 * Get all Stripe coupons
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const coupons = await stripe.coupons.list({ limit: 100 })

    const transformedCoupons = coupons.data
      .filter((c) => !c.deleted) // Filter out deleted coupons
      .map((coupon) => ({
        id: coupon.id,
        code: coupon.id,
        discountType: coupon.percent_off ? 'percentage' : 'fixed_amount',
        discountValue: coupon.percent_off || (coupon.amount_off ? coupon.amount_off / 100 : 0),
        currency: coupon.currency || 'usd',
        maxRedemptions: coupon.max_redemptions,
        timesRedeemed: coupon.times_redeemed,
        description: coupon.metadata?.description || '',
        isActive: !coupon.deleted,
        createdAt: new Date(coupon.created * 1000).toISOString(),
        durationMonths: coupon.duration_in_months,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    res.json(transformedCoupons)
  } catch (error: any) {
    console.error('❌ Error fetching Stripe coupons:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stripe-coupons/:couponId
 * Get a specific Stripe coupon
 */
router.get('/:couponId', async (req: Request, res: Response) => {
  try {
    const { couponId } = req.params

    const coupon = await stripe.coupons.retrieve(couponId)

    res.json({
      id: coupon.id,
      code: coupon.id,
      discountType: coupon.percent_off ? 'percentage' : 'fixed_amount',
      discountValue: coupon.percent_off || (coupon.amount_off ? coupon.amount_off / 100 : 0),
      currency: coupon.currency || 'usd',
      maxRedemptions: coupon.max_redemptions,
      timesRedeemed: coupon.times_redeemed,
      description: coupon.metadata?.description || '',
      isActive: !coupon.deleted,
      createdAt: new Date(coupon.created * 1000).toISOString(),
      durationMonths: coupon.duration_in_months,
    })
  } catch (error: any) {
    console.error('❌ Error fetching Stripe coupon:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PUT /api/stripe-coupons/:couponId
 * Update a Stripe coupon (metadata/description only - Stripe doesn't allow editing discount values)
 */
router.put('/:couponId', async (req: Request, res: Response) => {
  try {
    const { couponId } = req.params
    const { description } = req.body

    const coupon = await stripe.coupons.update(couponId, {
      metadata: {
        description: description || '',
      },
    })

    res.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.id,
        description: coupon.metadata?.description || '',
        message: 'Note: Discount values cannot be changed in Stripe. To change discount, delete and recreate the coupon.',
      },
    })
  } catch (error: any) {
    console.error('❌ Error updating Stripe coupon:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/stripe-coupons/:couponId
 * Delete (archive) a Stripe coupon
 */
router.delete('/:couponId', async (req: Request, res: Response) => {
  try {
    const { couponId } = req.params

    // Stripe doesn't support hard delete for coupons, use delete param
    const deletedCoupon = await stripe.coupons.delete(couponId)

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
      couponId: deletedCoupon.id,
      deleted: deletedCoupon.deleted,
    })
  } catch (error: any) {
    console.error('❌ Error deleting Stripe coupon:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/stripe-coupons/validate
 * Validate a Stripe coupon code
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({
        valid: false,
        error: 'Coupon code is required',
      })
    }

    const coupon = await stripe.coupons.retrieve(code.toUpperCase())

    if (!coupon || coupon.deleted) {
      return res.json({
        valid: false,
        error: 'Invalid or deleted coupon',
      })
    }

    // Check if max redemptions reached
    if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
      return res.json({
        valid: false,
        error: 'Coupon usage limit reached',
      })
    }

    res.json({
      valid: true,
      code: coupon.id,
      discountType: coupon.percent_off ? 'percentage' : 'fixed_amount',
      discountValue: coupon.percent_off || (coupon.amount_off ? coupon.amount_off / 100 : 0),
      description: coupon.metadata?.description || '',
      timesRedeemed: coupon.times_redeemed,
      maxRedemptions: coupon.max_redemptions,
    })
  } catch (error: any) {
    console.error('❌ Error validating coupon:', error)
    res.status(500).json({
      valid: false,
      error: 'Failed to validate coupon',
    })
  }
})

export default router
