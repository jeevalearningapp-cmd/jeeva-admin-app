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

    // Note: Prices are now stored in Stripe only (no Supabase dependency)
    console.log('✅ Price created in Stripe:', price.id)

    res.json({
      success: true,
      price: {
        id: price.id,
        amount,
        currency: country.currency,
        country_code,
        plan_name,
      },
    })
  } catch (error: any) {
    console.error('❌ Error creating Stripe price:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stripe-admin/prices
 * Get all prices from Stripe (no Supabase dependency)
 */
router.get('/prices', async (req: Request, res: Response) => {
  try {
    // Fetch all prices from Stripe
    const prices = await stripe.prices.list({ limit: 100 })
    
    // Transform Stripe prices to our format with country mapping
    const transformedPrices = prices.data
      .filter(p => p.active) // Only active prices
      .map((price, index) => ({
        id: String(index + 1),
        stripe_product_id: typeof price.product === 'string' ? price.product : price.product?.id,
        stripe_price_id: price.id,
        currency: price.currency.toUpperCase(),
        amount: (price.unit_amount || 0) / 100, // Convert from cents
        country_code: price.metadata?.country_code || 'US',
        plan_name: price.metadata?.plan_name || 'Plan',
        plan_duration_days: parseInt(price.metadata?.plan_duration_days || '30'),
        is_active: price.active,
      }))
      .sort((a, b) => {
        // Sort by country then plan name
        const countryOrder = { IN: 1, GB: 2, US: 3 }
        const aOrder = countryOrder[a.country_code as keyof typeof countryOrder] || 999
        const bOrder = countryOrder[b.country_code as keyof typeof countryOrder] || 999
        return aOrder - bOrder || a.plan_name.localeCompare(b.plan_name)
      })

    res.json(transformedPrices)
  } catch (error: any) {
    console.error('❌ Error fetching prices from Stripe:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/stripe-admin/prices/:priceId
 * Deactivate a price in Stripe
 */
router.delete('/prices/:priceId', async (req: Request, res: Response) => {
  try {
    const { priceId } = req.params

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    // Deactivate in Stripe (prices can't be deleted, only deactivated)
    const deactivatedPrice = await stripe.prices.update(priceId, {
      active: false,
    })

    res.json({
      success: true,
      message: 'Price deactivated successfully',
      priceId: deactivatedPrice.id,
      active: deactivatedPrice.active,
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
