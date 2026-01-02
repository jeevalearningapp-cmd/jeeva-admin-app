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
 * Create a Stripe price (recurring or one-time)
 * 
 * IMPORTANT: Only GBP prices are allowed. Stripe Adaptive Pricing
 * automatically handles currency conversion for international customers.
 */
router.post('/prices', async (req: Request, res: Response) => {
  try {
    const {
      stripe_product_id,
      currency,
      amount,
      plan_name,
      plan_duration_days = 30,
      recurring = true,
    } = req.body

    if (!stripe_product_id || !amount || !plan_name) {
      return res.status(400).json({
        error: 'Missing required fields: stripe_product_id, amount, plan_name',
      })
    }

    // Enforce GBP-only currency for Adaptive Pricing
    // Currency is optional - defaults to GBP if not provided
    const requestedCurrency = currency?.toUpperCase() || 'GBP'
    
    if (requestedCurrency !== 'GBP') {
      return res.status(400).json({
        error: 'Only GBP prices are allowed. Adaptive Pricing handles currency conversion automatically.',
      })
    }

    // Create price in Stripe with GBP currency
    const priceData: Stripe.PriceCreateParams = {
      product: stripe_product_id,
      unit_amount: Math.round(amount * 100), // Convert to pence
      currency: 'gbp',
      metadata: {
        plan_name,
        plan_duration_days: plan_duration_days.toString(),
        recurring: recurring.toString(),
      },
    }

    // Add recurring config if needed
    if (recurring) {
      priceData.recurring = {
        interval: 'month',
        interval_count: Math.ceil(plan_duration_days / 30),
      }
    }

    const price = await stripe.prices.create(priceData)

    console.log('✅ GBP Price created in Stripe:', price.id)

    res.json({
      success: true,
      price: {
        id: price.id,
        amount,
        currency: 'GBP',
        plan_name,
        recurring,
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
 * GET /api/stripe-admin/catalog
 * Get subscription catalog with GBP prices for Adaptive Pricing.
 * Returns plans grouped by tier (Starter/Growth/Ultimate) with only canonical GBP prices.
 * No country-based grouping - Stripe Adaptive Pricing handles currency conversion.
 * 
 * Requirements: 1.2, 1.4, 7.3
 */
router.get('/catalog', async (req: Request, res: Response) => {
  try {
    // Fetch all active prices from Stripe
    const prices = await stripe.prices.list({
      limit: 100,
      active: true,
      expand: ['data.product'],
    })

    // Filter to only GBP prices and transform to CatalogPlan format
    const catalogPlans = prices.data
      .filter((price) => {
        // Only include GBP prices
        if (price.currency.toLowerCase() !== 'gbp') {
          return false
        }
        // Only include prices with active products
        const product = price.product as Stripe.Product
        return product && !product.deleted && product.active
      })
      .map((price) => {
        const product = price.product as Stripe.Product
        const metadata = price.metadata || {}
        const productMetadata = product.metadata || {}

        // Parse features from product metadata if available
        let features: string[] = []
        try {
          if (productMetadata.features) {
            features = JSON.parse(productMetadata.features)
          }
        } catch {
          features = []
        }

        return {
          planId: product.id,
          name: metadata.plan_name || product.name || 'Plan',
          description: product.description || '',
          durationDays: parseInt(metadata.plan_duration_days || '30', 10),
          stripePriceIdGbp: price.id,
          unitAmountGbp: price.unit_amount || 0, // Amount in pence
          active: price.active && product.active,
          features,
        }
      })
      // Sort by plan tier order: Starter, Growth, Ultimate
      .sort((a, b) => {
        const tierOrder: Record<string, number> = {
          starter: 1,
          growth: 2,
          ultimate: 3,
        }
        const aOrder = tierOrder[a.name.toLowerCase()] || 999
        const bOrder = tierOrder[b.name.toLowerCase()] || 999
        return aOrder - bOrder
      })

    res.json({
      plans: catalogPlans,
    })
  } catch (error: any) {
    console.error('❌ Error fetching catalog:', error)
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

/**
 * POST /api/stripe-admin/setup-plans
 * Setup 3 one-time subscription plans (Starter, Growth, Ultimate) with all currencies
 */
router.post('/setup-plans', async (req: Request, res: Response) => {
  try {
    const plans = [
      {
        name: 'Starter',
        description: 'Perfect for beginners - 30 days of access to all learning materials',
        days: 30,
        priceINR: 3000,
        priceUSD: 34,
        priceGBP: 25,
        features: [
          'Access to Practice MCQs',
          'Access to Learning Content',
          'Basic Study Materials',
          '30 Days Access',
          'Email Support'
        ]
      },
      {
        name: 'Growth',
        description: 'Accelerated learning - 90 days comprehensive study plan with advanced features',
        days: 90,
        priceINR: 8000,
        priceUSD: 90,
        priceGBP: 68,
        features: [
          'All Starter Features',
          'Mock Exams Access',
          'Performance Analytics',
          '90 Days Access',
          'Priority Email Support',
          'Weekly Study Recommendations'
        ]
      },
      {
        name: 'Ultimate',
        description: 'Complete mastery - 150 days intensive preparation with premium support',
        days: 150,
        priceINR: 15000,
        priceUSD: 168,
        priceGBP: 127,
        features: [
          'All Growth Features',
          'Priority Support',
          'AI-Powered JeevaBot Access',
          '150 Days Access',
          'Unlimited Questions',
          'Personalized Study Plan',
          'Voice Tutoring (Coming Soon)'
        ]
      }
    ]

    const results = []

    for (const plan of plans) {
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          plan_type: 'one_time',
          features: JSON.stringify(plan.features),
          created_via: 'setup_endpoint',
        },
      })

      console.log(`✅ Created product: ${plan.name} (${product.id})`)

      const prices = []

      // Create INR price
      const priceINR = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.priceINR * 100,
        currency: 'inr',
        metadata: {
          plan_name: plan.name,
          country_code: 'IN',
          plan_duration_days: plan.days.toString(),
          recurring: 'false',
        },
      })
      prices.push({ currency: 'INR', id: priceINR.id, amount: plan.priceINR })

      // Create USD price
      const priceUSD = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.priceUSD * 100,
        currency: 'usd',
        metadata: {
          plan_name: plan.name,
          country_code: 'US',
          plan_duration_days: plan.days.toString(),
          recurring: 'false',
        },
      })
      prices.push({ currency: 'USD', id: priceUSD.id, amount: plan.priceUSD })

      // Create GBP price
      const priceGBP = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.priceGBP * 100,
        currency: 'gbp',
        metadata: {
          plan_name: plan.name,
          country_code: 'GB',
          plan_duration_days: plan.days.toString(),
          recurring: 'false',
        },
      })
      prices.push({ currency: 'GBP', id: priceGBP.id, amount: plan.priceGBP })

      results.push({
        product: {
          id: product.id,
          name: plan.name,
          description: plan.description,
          features: plan.features,
        },
        prices,
      })
    }

    res.json({
      success: true,
      message: 'All 3 plans created successfully with 3 currencies each (9 prices total)',
      plans: results,
    })
  } catch (error: any) {
    console.error('❌ Error setting up plans:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
