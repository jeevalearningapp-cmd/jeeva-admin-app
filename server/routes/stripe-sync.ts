import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { supabase } from '../lib/supabase.js'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

/**
 * POST /api/stripe-sync/payments
 * Sync historical payments from Stripe to Supabase
 * Imports checkout sessions and payment intents that aren't already in the database
 */
router.post('/payments', async (req: Request, res: Response) => {
  try {
    const { limit = 100, startingAfter } = req.body
    
    console.log('🔄 Starting Stripe payment sync...')
    
    let imported = 0
    let skipped = 0
    let failed = 0
    const errors: string[] = []
    
    // Fetch checkout sessions from Stripe (completed ones)
    const sessions = await stripe.checkout.sessions.list({
      limit: Math.min(limit, 100),
      starting_after: startingAfter,
      expand: ['data.payment_intent'],
    })
    
    for (const session of sessions.data) {
      try {
        // Skip incomplete sessions
        if (session.status !== 'complete') {
          skipped++
          continue
        }
        
        // Check if already exists in database
        const { data: existing } = await supabase
          .from('payments')
          .select('id')
          .eq('stripe_checkout_session_id', session.id)
          .maybeSingle()
        
        if (existing) {
          skipped++
          continue
        }
        
        // Also check by payment intent ID
        const paymentIntentId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent?.id
        
        if (paymentIntentId) {
          const { data: existingByIntent } = await supabase
            .from('payments')
            .select('id')
            .eq('stripe_payment_intent_id', paymentIntentId)
            .maybeSingle()
          
          if (existingByIntent) {
            skipped++
            continue
          }
        }
        
        // Extract presentment data
        const presentmentCurrency = session.currency?.toUpperCase() || 'GBP'
        const presentmentAmount = (session.amount_total || 0) / 100
        
        // Extract GBP amount from currency_conversion if present
        let gbpAmount: number | null = null
        let fxRate: number | null = null
        
        const currencyConversion = (session as any).currency_conversion
        if (currencyConversion) {
          const sourceAmountCents = currencyConversion.amount_subtotal || currencyConversion.amount_total
          if (sourceAmountCents && currencyConversion.source_currency?.toLowerCase() === 'gbp') {
            gbpAmount = sourceAmountCents / 100
            if (gbpAmount > 0 && presentmentAmount > 0) {
              fxRate = presentmentAmount / gbpAmount
            }
          }
        }
        
        // If no conversion (GBP payment), set GBP amount
        if (gbpAmount === null && presentmentCurrency === 'GBP') {
          gbpAmount = presentmentAmount
          fxRate = 1.0
        }
        
        // Extract metadata
        const metadata = session.metadata || {}
        const userId = metadata.userId || null
        const subscriptionPlanId = metadata.subscriptionPlanId || null
        
        // Validate userId is a valid UUID if present
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        const validUserId = userId && uuidRegex.test(userId) ? userId : null
        
        // Skip if no valid user_id (required field in database)
        if (!validUserId) {
          console.log(`⚠️ Skipping session ${session.id}: No valid user_id in metadata`)
          skipped++
          continue
        }
        
        // Verify user exists in auth.users
        const { data: userExists } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_id', validUserId)
          .maybeSingle()
        
        if (!userExists) {
          console.log(`⚠️ Skipping session ${session.id}: User ${validUserId} not found in database`)
          skipped++
          continue
        }
        
        // Get country from customer details
        const countryDetected = session.customer_details?.address?.country || null
        
        // Get discount amount
        const discountAmount = session.total_details?.amount_discount 
          ? session.total_details.amount_discount / 100 
          : 0
        
        // Create payment record
        const paymentData: any = {
          user_id: validUserId,
          gateway: 'stripe',
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: paymentIntentId,
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
          
          // Presentment fields
          amount_charged_local: presentmentAmount,
          currency_charged_local: presentmentCurrency,
          amount_charged_gbp: gbpAmount,
          fx_rate_applied: fxRate,
          country_detected: countryDetected,
          
          // Standard fields
          amount: gbpAmount || presentmentAmount,
          currency: 'GBP',
          original_amount: gbpAmount || presentmentAmount,
          discount_amount: discountAmount,
          final_amount: gbpAmount || presentmentAmount,
          
          // Subscription
          subscription_plan_id: subscriptionPlanId,
          
          // Status
          status: 'succeeded',
          
          // Metadata
          metadata: metadata,
          created_at: new Date(session.created * 1000).toISOString(),
          completed_at: new Date(session.created * 1000).toISOString(),
        }
        
        // Insert into database
        const { error: insertError } = await supabase
          .from('payments')
          .insert(paymentData)
        
        if (insertError) {
          console.error(`Failed to import session ${session.id}:`, insertError.message)
          errors.push(`${session.id}: ${insertError.message}`)
          failed++
        } else {
          imported++
          console.log(`✅ Imported session: ${session.id}`)
        }
      } catch (sessionError: any) {
        console.error(`Error processing session ${session.id}:`, sessionError.message)
        errors.push(`${session.id}: ${sessionError.message}`)
        failed++
      }
    }
    
    console.log(`🏁 Sync complete: ${imported} imported, ${skipped} skipped, ${failed} failed`)
    
    res.json({
      success: true,
      imported,
      skipped,
      failed,
      errors: errors.slice(0, 10), // Return first 10 errors
      hasMore: sessions.has_more,
      nextCursor: sessions.data[sessions.data.length - 1]?.id,
    })
  } catch (error: any) {
    console.error('❌ Stripe sync error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stripe-sync/status
 * Get sync status - compare Stripe vs database counts
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    // Get count from Stripe (approximate)
    const stripePayments = await stripe.paymentIntents.list({ limit: 1 })
    
    // Get count from database
    const { count: dbCount, error } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('gateway', 'stripe')
    
    if (error) throw error
    
    // Get recent Stripe sessions count
    const recentSessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 }, // Last 30 days
    })
    
    const completedSessions = recentSessions.data.filter(s => s.status === 'complete').length
    
    res.json({
      stripeRecentSessions: completedSessions,
      databasePayments: dbCount || 0,
      lastSyncCheck: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ Sync status error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
