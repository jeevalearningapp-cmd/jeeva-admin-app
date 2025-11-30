import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { supabase } from '../lib/supabase.js'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
})

/**
 * GET /api/stripe-analytics/transactions
 * Get all Stripe transactions with filtering
 */
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { limit = '50', startingAfter, endingBefore } = req.query

    const params: any = {
      limit: Math.min(parseInt(limit as string), 100),
    }

    if (startingAfter) params.starting_after = startingAfter
    if (endingBefore) params.ending_before = endingBefore

    const paymentIntents = await stripe.paymentIntents.list(params)

    const transactions = paymentIntents.data.map((pi) => ({
      id: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency.toUpperCase(),
      status: pi.status,
      customer: pi.customer,
      description: pi.description,
      metadata: pi.metadata,
      created: new Date(pi.created * 1000).toISOString(),
      charges: pi.charges?.data?.map((charge) => ({
        id: charge.id,
        amount: charge.amount / 100,
        status: charge.status,
        paymentMethod: charge.payment_method_details?.type,
      })) || [],
    }))

    res.json({
      transactions,
      hasMore: paymentIntents.has_more,
      nextCursor: paymentIntents.data[paymentIntents.data.length - 1]?.id,
    })
  } catch (error: any) {
    console.error('❌ Error fetching Stripe transactions:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stripe-analytics/summary
 * Get payment summary (total revenue, successful, failed, etc)
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const paymentIntents = await stripe.paymentIntents.list({ limit: 100 })

    const summary = {
      totalPayments: paymentIntents.data.length,
      totalRevenue: 0,
      successfulPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      refundedAmount: 0,
      averageAmount: 0,
    }

    for (const pi of paymentIntents.data) {
      const amount = pi.amount / 100

      if (pi.status === 'succeeded') {
        summary.successfulPayments++
        summary.totalRevenue += amount
      } else if (pi.status === 'requires_payment_method' || pi.status === 'requires_action') {
        summary.pendingPayments++
      } else if (pi.status === 'canceled') {
        summary.failedPayments++
      }

      // Get refunds
      if (pi.charges?.data) {
        for (const charge of pi.charges.data) {
          if (charge.refunded) {
            summary.refundedAmount += (charge.amount_refunded || 0) / 100
          }
        }
      }
    }

    summary.averageAmount = summary.totalPayments > 0 ? summary.totalRevenue / summary.totalPayments : 0

    res.json(summary)
  } catch (error: any) {
    console.error('❌ Error fetching payment summary:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stripe-analytics/subscribers
 * Get active subscriber count and details
 */
router.get('/subscribers', async (req: Request, res: Response) => {
  try {
    // Get successful payments from Supabase (these represent active subscriptions)
    const { data: payments, error } = await supabase
      .from('payments')
      .select('user_id, gateway, subscription_plan_id, final_amount, currency, created_at')
      .eq('gateway', 'stripe')
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Group by user to get unique subscribers
    const subscriberMap = new Map()
    const totalRevenue = { INR: 0, USD: 0, GBP: 0 }

    for (const payment of payments) {
      if (!subscriberMap.has(payment.user_id)) {
        subscriberMap.set(payment.user_id, payment)
      }
      totalRevenue[payment.currency as keyof typeof totalRevenue] += payment.final_amount
    }

    const uniqueSubscribers = subscriberMap.size

    // Get plan breakdown
    const planBreakdown: Record<string, number> = {}
    for (const payment of payments) {
      const planId = payment.subscription_plan_id || 'unknown'
      planBreakdown[planId] = (planBreakdown[planId] || 0) + 1
    }

    res.json({
      totalSubscribers: uniqueSubscribers,
      totalPayments: payments.length,
      revenue: {
        INR: totalRevenue.INR,
        USD: totalRevenue.USD,
        GBP: totalRevenue.GBP,
        total: totalRevenue.INR + totalRevenue.USD + totalRevenue.GBP,
      },
      planBreakdown,
      latestPayments: payments.slice(0, 10),
    })
  } catch (error: any) {
    console.error('❌ Error fetching subscribers:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stripe-analytics/revenue-by-country
 * Get revenue breakdown by country
 */
router.get('/revenue-by-country', async (req: Request, res: Response) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('currency, final_amount, gateway, status')
      .eq('gateway', 'stripe')
      .eq('status', 'succeeded')

    if (error) throw error

    const revenueByCountry = {
      IN: { currency: 'INR', amount: 0, count: 0 },
      US: { currency: 'USD', amount: 0, count: 0 },
      GB: { currency: 'GBP', amount: 0, count: 0 },
    }

    for (const payment of payments) {
      let country = 'US'
      if (payment.currency === 'inr') country = 'IN'
      else if (payment.currency === 'gbp') country = 'GB'

      revenueByCountry[country as keyof typeof revenueByCountry].amount += payment.final_amount
      revenueByCountry[country as keyof typeof revenueByCountry].count++
    }

    res.json(revenueByCountry)
  } catch (error: any) {
    console.error('❌ Error fetching revenue by country:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stripe-analytics/recent-payments
 * Get recent successful payments
 */
router.get('/recent-payments', async (req: Request, res: Response) => {
  try {
    const { limit = '20' } = req.query

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('gateway', 'stripe')
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string))

    if (error) throw error

    // Enrich with user info
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name, email')
          .eq('user_id', payment.user_id)
          .single()

        return {
          id: payment.id,
          userId: payment.user_id,
          userName: profile?.full_name || 'Unknown',
          userEmail: profile?.email,
          amount: payment.final_amount,
          currency: payment.currency,
          planId: payment.subscription_plan_id,
          createdAt: payment.created_at,
        }
      })
    )

    res.json(enrichedPayments)
  } catch (error: any) {
    console.error('❌ Error fetching recent payments:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
