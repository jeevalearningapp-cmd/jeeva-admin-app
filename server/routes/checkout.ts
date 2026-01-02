import { Router, Request, Response } from 'express'
import { stripeService } from '../services/stripe.js'

const router = Router()

/**
 * POST /api/checkout/create-session
 * Creates a Stripe Checkout Session for Adaptive Pricing.
 * Uses GBP price ID and lets Stripe handle currency conversion automatically.
 * 
 * Requirements: 2.1 - Create Stripe Checkout Session using canonical GBP price ID
 */
router.post('/create-session', async (req: Request, res: Response) => {
  try {
    const {
      planPriceIdGbp,
      userId,
      successUrl,
      cancelUrl,
      customerEmail,
      subscriptionPlanId,
    } = req.body

    // Validate required fields
    if (!planPriceIdGbp) {
      return res.status(400).json({ error: 'Missing required field: planPriceIdGbp' })
    }
    if (!userId) {
      return res.status(400).json({ error: 'Missing required field: userId' })
    }
    if (!successUrl) {
      return res.status(400).json({ error: 'Missing required field: successUrl' })
    }
    if (!cancelUrl) {
      return res.status(400).json({ error: 'Missing required field: cancelUrl' })
    }
    if (!customerEmail) {
      return res.status(400).json({ error: 'Missing required field: customerEmail' })
    }

    // Create checkout session using the stripe service
    const result = await stripeService.createCheckoutSession({
      priceIdGbp: planPriceIdGbp,
      userId,
      customerEmail,
      successUrl,
      cancelUrl,
      subscriptionPlanId,
    })

    console.log('✅ Checkout session created:', result.sessionId)

    res.json({
      success: true,
      sessionId: result.sessionId,
      sessionUrl: result.sessionUrl,
    })
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
