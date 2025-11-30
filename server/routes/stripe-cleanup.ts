import { Router, Request, Response } from 'express'
import Stripe from 'stripe'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
})

/**
 * DELETE /api/stripe-cleanup/all-products
 * Delete all products and prices (DANGEROUS - use with caution)
 */
router.delete('/all-products', async (req: Request, res: Response) => {
  try {
    console.log('🗑️ Starting cleanup of all Stripe products...')

    // Get all products
    const products = await stripe.products.list({ limit: 100 })

    let deletedCount = 0
    const results = []

    for (const product of products.data) {
      // Get all prices for this product
      const prices = await stripe.prices.list({ product: product.id, limit: 100 })

      // Delete all prices first
      for (const price of prices.data) {
        await stripe.prices.update(price.id, { active: false })
        console.log(`  ✅ Deactivated price: ${price.id}`)
      }

      // Delete product
      await stripe.products.del(product.id)
      deletedCount++
      results.push({
        productId: product.id,
        productName: product.name,
        pricesCount: prices.data.length,
      })
      console.log(`  ✅ Deleted product: ${product.name} (${product.id})`)
    }

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} products`,
      results,
    })
  } catch (error: any) {
    console.error('❌ Error during cleanup:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/stripe-cleanup/recreate-plans
 * Recreate 3 plans with exact correct pricing
 */
router.post('/recreate-plans', async (req: Request, res: Response) => {
  try {
    console.log('📝 Creating 3 new plans with exact pricing...')

    // Define exact pricing per user request
    const plans = [
      {
        name: 'Starter',
        description: 'Perfect for beginners - 30 days of access to all learning materials',
        days: 30,
        prices: {
          INR: 3000,
          USD: 34,
          GBP: 25,
        },
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
        prices: {
          INR: 8000,
          USD: 90,
          GBP: 68,
        },
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
        prices: {
          INR: 15000,
          USD: 168,
          GBP: 127,
        },
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
          plan_duration_days: plan.days.toString(),
        },
      })

      console.log(`✅ Created product: ${plan.name} (${product.id})`)

      const priceList = []

      // Create INR price (one-time, no recurring)
      const priceINR = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.prices.INR * 100), // ₹3000 = 300000 paise
        currency: 'inr',
        billing_scheme: 'per_unit',
        metadata: {
          plan_name: plan.name,
          country_code: 'IN',
          plan_duration_days: plan.days.toString(),
        },
      })
      priceList.push({ 
        currency: 'INR', 
        priceId: priceINR.id, 
        amount: plan.prices.INR 
      })

      // Create USD price (one-time, no recurring)
      const priceUSD = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.prices.USD * 100), // $34 = 3400 cents
        currency: 'usd',
        billing_scheme: 'per_unit',
        metadata: {
          plan_name: plan.name,
          country_code: 'US',
          plan_duration_days: plan.days.toString(),
        },
      })
      priceList.push({ 
        currency: 'USD', 
        priceId: priceUSD.id, 
        amount: plan.prices.USD 
      })

      // Create GBP price (one-time, no recurring)
      const priceGBP = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.prices.GBP * 100), // £25 = 2500 pence
        currency: 'gbp',
        billing_scheme: 'per_unit',
        metadata: {
          plan_name: plan.name,
          country_code: 'GB',
          plan_duration_days: plan.days.toString(),
        },
      })
      priceList.push({ 
        currency: 'GBP', 
        priceId: priceGBP.id, 
        amount: plan.prices.GBP 
      })

      results.push({
        plan: {
          name: plan.name,
          productId: product.id,
          description: plan.description,
          durationDays: plan.days,
        },
        prices: priceList,
      })

      console.log(`  📊 Created 3 prices for ${plan.name}: INR ${plan.prices.INR}, USD ${plan.prices.USD}, GBP ${plan.prices.GBP}`)
    }

    res.json({
      success: true,
      message: '✅ Successfully created 3 plans with exact pricing (9 prices total)',
      summary: {
        plansCreated: results.length,
        totalPrices: results.length * 3,
      },
      plans: results,
    })
  } catch (error: any) {
    console.error('❌ Error recreating plans:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
