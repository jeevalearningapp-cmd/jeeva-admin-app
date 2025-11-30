import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { supabase } from '../lib/supabase.js'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20',
})

/**
 * POST /api/checkout/session
 * Create Stripe checkout session with country-based price
 */
router.post('/session', async (req: Request, res: Response) => {
  try {
    const { country_code, plan_name, success_url, cancel_url } = req.body

    if (!country_code || !plan_name) {
      return res.status(400).json({
        error: 'Missing country_code or plan_name',
      })
    }

    // Get the price for this country and plan
    const { data: price, error: priceError } = await supabase
      .from('prices')
      .select('*')
      .eq('plan_name', plan_name)
      .eq('country_code', country_code)
      .eq('is_active', true)
      .single()

    if (priceError || !price) {
      return res.status(404).json({
        error: 'Price not found for this country/plan combination',
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url || `${process.env.FRONTEND_URL}/success`,
      cancel_url: cancel_url || `${process.env.FRONTEND_URL}/pricing`,
      automatic_tax: {
        enabled: true,
      },
      customer_creation: 'always',
      metadata: {
        country_code,
        plan_name,
      },
    })

    res.json({
      sessionId: session.id,
      url: session.url,
      price: {
        amount: price.amount,
        currency: price.currency,
        country: country_code,
      },
    })
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
