import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { supabase } from '../lib/supabase.js'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20',
})

/**
 * POST /api/stripe-admin/products
 * Create or update a Stripe product and save to Supabase
 */
router.post('/products', async (req: Request, res: Response) => {
  try {
    const { name, description, features } = req.body

    // Create product in Stripe
    const stripeProduct = await stripe.products.create({
      name,
      description,
      metadata: { features: JSON.stringify(features) },
    })

    // Save to Supabase
    const { data, error } = await supabase
      .from('stripe_products')
      .insert({
        stripe_id: stripeProduct.id,
        name,
        description,
        features: features || [],
        is_active: true,
      })
      .select()

    if (error) throw error

    res.json({
      success: true,
      product: { ...data?.[0], stripe_id: stripeProduct.id },
    })
  } catch (error: any) {
    console.error('❌ Error creating product:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/stripe-admin/prices
 * Create Stripe prices for different countries/currencies
 */
router.post('/prices', async (req: Request, res: Response) => {
  try {
    const {
      stripe_product_id,
      plan_name,
      plan_duration_days,
      description,
      features,
      prices, // Array of { country_code, amount }
    } = req.body

    const savedPrices = []

    for (const priceConfig of prices) {
      const { country_code, amount } = priceConfig

      // Get currency for country
      const { data: countryData } = await supabase
        .from('country_currency_map')
        .select('currency, currency_symbol, tax_rate')
        .eq('country_code', country_code)
        .single()

      if (!countryData) continue

      // Create price in Stripe
      const stripePrice = await stripe.prices.create({
        product: stripe_product_id,
        unit_amount: Math.round(amount * 100), // Convert to cents
        currency: countryData.currency.toLowerCase(),
        recurring: {
          interval: plan_duration_days === 365 ? 'year' : 'month',
          interval_count: plan_duration_days === 365 ? 1 : Math.ceil(plan_duration_days / 30),
        },
        metadata: {
          country_code,
          plan_duration_days,
        },
      })

      // Save to Supabase
      const { data, error } = await supabase
        .from('prices')
        .upsert({
          stripe_product_id,
          stripe_price_id: stripePrice.id,
          currency: countryData.currency,
          amount,
          country_code,
          plan_name,
          plan_duration_days,
          description,
          features: features || [],
          is_active: true,
        })
        .select()

      if (error) throw error
      savedPrices.push(data?.[0])
    }

    res.json({
      success: true,
      prices: savedPrices,
    })
  } catch (error: any) {
    console.error('❌ Error creating prices:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stripe-admin/prices
 * Get all prices
 */
router.get('/prices', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('prices')
      .select('*')
      .order('stripe_product_id', { ascending: true })
      .order('country_code', { ascending: true })

    if (error) throw error
    res.json(data || [])
  } catch (error: any) {
    console.error('❌ Error fetching prices:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stripe-admin/products
 * Get all products
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('stripe_products')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    res.json(data || [])
  } catch (error: any) {
    console.error('❌ Error fetching products:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PUT /api/stripe-admin/prices/:id
 * Update a price
 */
router.put('/prices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from('prices')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    res.json(data?.[0])
  } catch (error: any) {
    console.error('❌ Error updating price:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/stripe-admin/prices/:id
 * Delete a price
 */
router.delete('/prices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('prices')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error deleting price:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
