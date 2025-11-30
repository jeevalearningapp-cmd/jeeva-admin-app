import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase.js'
import Stripe from 'stripe'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
})

/**
 * POST /api/stripe-admin/products
 * Create a Stripe product
 */
router.post('/products', async (req: Request, res: Response) => {
  try {
    const { name, description, metadata } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' })
    }

    const product = await stripe.products.create({
      name,
      description: description || '',
      metadata: {
        ...metadata,
        created_via: 'admin_portal',
        created_at: new Date().toISOString(),
      },
    })

    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
      },
    })
  } catch (error: any) {
    console.error('❌ Error creating Stripe product:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/stripe-admin/prices
 * Create a Stripe price and save to database
 */
router.post('/prices', async (req: Request, res: Response) => {
  try {
    const {
      stripe_product_id,
      country_code,
      amount,
      plan_name,
      plan_duration_days = 30,
    } = req.body

    if (!stripe_product_id || !country_code || !amount || !plan_name) {
      return res.status(400).json({
        error: 'Missing required fields: stripe_product_id, country_code, amount, plan_name',
      })
    }

    // Get country details
    const { data: country, error: countryError } = await supabase
      .from('country_currency_map')
      .select('currency')
      .eq('country_code', country_code)
      .single()

    if (countryError || !country) {
      return res.status(400).json({ error: 'Invalid country code' })
    }

    // Create price in Stripe
    const price = await stripe.prices.create({
      product: stripe_product_id,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: country.currency.toLowerCase(),
      recurring: {
        interval: 'month',
        interval_count: Math.ceil(plan_duration_days / 30),
      },
      metadata: {
        plan_name,
        country_code,
        plan_duration_days: plan_duration_days.toString(),
      },
    })

    // Save to database
    const { data: dbPrice, error: dbError } = await supabase
      .from('prices')
      .insert({
        stripe_product_id,
        stripe_price_id: price.id,
        country_code,
        currency: country.currency,
        amount,
        plan_name,
        plan_duration_days,
        is_active: true,
      })
      .select()

    if (dbError) {
      return res.status(400).json({ error: dbError.message })
    }

    res.json({
      success: true,
      price: {
        id: price.id,
        amount,
        currency: country.currency,
        country_code,
        plan_name,
      },
      databaseRecord: dbPrice?.[0],
    })
  } catch (error: any) {
    console.error('❌ Error creating Stripe price:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stripe-admin/prices
 * Get all prices from database
 */
router.get('/prices', async (req: Request, res: Response) => {
  try {
    const { data: prices, error } = await supabase
      .from('prices')
      .select('*')
      .order('plan_name', { ascending: true })

    if (error) throw error

    res.json(prices || [])
  } catch (error: any) {
    console.error('❌ Error fetching prices:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/stripe-admin/prices/:priceId
 * Deactivate a price
 */
router.delete('/prices/:priceId', async (req: Request, res: Response) => {
  try {
    const { priceId } = req.params

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    // Update in database
    const { data, error } = await supabase
      .from('prices')
      .update({ is_active: false })
      .eq('id', priceId)
      .select()

    if (error) throw error

    res.json({
      success: true,
      message: 'Price deactivated successfully',
      price: data?.[0],
    })
  } catch (error: any) {
    console.error('❌ Error deactivating price:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stripe-admin/products
 * List all Stripe products
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await stripe.products.list({
      limit: 100,
      active: true,
    })

    res.json(
      products.data.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        active: p.active,
      }))
    )
  } catch (error: any) {
    console.error('❌ Error fetching Stripe products:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
