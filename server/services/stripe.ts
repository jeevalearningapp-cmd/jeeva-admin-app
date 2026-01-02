import Stripe from 'stripe'
import type {
  CreateStripePaymentIntentInput,
  PaymentCustomer,
  Payment,
} from '../../src/types/payments'

// Checkout Session types for Adaptive Pricing
export interface CreateCheckoutSessionInput {
  priceIdGbp: string          // Stripe Price ID (GBP)
  userId: string              // Internal user ID
  customerEmail: string       // Customer email for Stripe
  successUrl: string          // Redirect on success
  cancelUrl: string           // Redirect on cancel
  subscriptionPlanId?: string // Optional subscription plan ID for metadata
}

export interface CheckoutSessionResult {
  sessionId: string           // cs_xxx
  sessionUrl: string          // Checkout page URL
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
})

export const stripeService = {
  async createPaymentIntent(input: CreateStripePaymentIntentInput) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(input.amount * 100),
        currency: input.currency.toLowerCase(),
        customer: input.customerId,
        payment_method: input.paymentMethodId,
        metadata: input.metadata || {},
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      })

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
      }
    } catch (error: any) {
      console.error('Stripe payment intent creation failed:', error)
      throw new Error(`Failed to create payment intent: ${error.message}`)
    }
  },

  async createCustomer(email: string, name?: string, phone?: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        phone,
      })

      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      }
    } catch (error: any) {
      console.error('Stripe customer creation failed:', error)
      throw new Error(`Failed to create customer: ${error.message}`)
    }
  },

  async getCustomer(customerId: string) {
    try {
      const customer = await stripe.customers.retrieve(customerId)
      
      if (customer.deleted) {
        throw new Error('Customer has been deleted')
      }

      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      }
    } catch (error: any) {
      console.error('Stripe get customer failed:', error)
      throw new Error(`Failed to get customer: ${error.message}`)
    }
  },

  async retrievePaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        customerId: paymentIntent.customer as string,
        paymentMethodId: paymentIntent.payment_method as string,
        receiptEmail: paymentIntent.receipt_email,
        metadata: paymentIntent.metadata,
      }
    } catch (error: any) {
      console.error('Stripe retrieve payment intent failed:', error)
      throw new Error(`Failed to retrieve payment intent: ${error.message}`)
    }
  },

  async createRefund(paymentIntentId: string, amount?: number, reason?: string) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason as any,
      })

      return {
        id: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
        currency: refund.currency.toUpperCase(),
        reason: refund.reason,
      }
    } catch (error: any) {
      console.error('Stripe refund creation failed:', error)
      throw new Error(`Failed to create refund: ${error.message}`)
    }
  },

  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set')
    }

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      )
      return event
    } catch (error: any) {
      console.error('Stripe webhook signature verification failed:', error)
      throw new Error(`Webhook signature verification failed: ${error.message}`)
    }
  },

  async handleWebhookEvent(event: Stripe.Event) {
    console.log(`Processing Stripe webhook: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed':
        return this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)

      case 'payment_intent.succeeded':
        return {
          type: 'payment_succeeded',
          data: {
            paymentIntentId: event.data.object.id,
            amount: (event.data.object as Stripe.PaymentIntent).amount / 100,
            currency: (event.data.object as Stripe.PaymentIntent).currency.toUpperCase(),
            customerId: (event.data.object as Stripe.PaymentIntent).customer,
            metadata: (event.data.object as Stripe.PaymentIntent).metadata,
          },
        }

      case 'payment_intent.payment_failed':
        return {
          type: 'payment_failed',
          data: {
            paymentIntentId: event.data.object.id,
            error: (event.data.object as Stripe.PaymentIntent).last_payment_error,
          },
        }

      case 'charge.refunded':
        return {
          type: 'charge_refunded',
          data: {
            chargeId: event.data.object.id,
            amount: (event.data.object as Stripe.Charge).amount_refunded / 100,
            refunds: (event.data.object as Stripe.Charge).refunds,
          },
        }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
        return { type: 'unhandled', data: event.data.object }
    }
  },

  /**
   * Handles checkout.session.completed webhook event for Adaptive Pricing.
   * Extracts presentment data including local currency, GBP amount, and FX rate.
   * 
   * Requirements: 2.3 - Extract and store presentment currency, local amount, GBP amount, and FX rate
   */
  handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    // Extract session identifiers
    const sessionId = session.id
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id || null
    
    // Extract customer info
    const customerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id || null
    const customerEmail = session.customer_email || session.customer_details?.email || null
    
    // Extract presentment currency and amount (what customer paid)
    const presentmentCurrency = session.currency?.toUpperCase() || 'GBP'
    const presentmentAmountCents = session.amount_total || 0
    const presentmentAmount = presentmentAmountCents / 100
    
    // Extract metadata
    const metadata = session.metadata || {}
    const userId = metadata.userId || null
    const subscriptionPlanId = metadata.subscriptionPlanId || null
    
    // Extract GBP amount and FX rate from currency_conversion if present
    // Stripe Adaptive Pricing provides this when converting from GBP to local currency
    let gbpAmount: number | null = null
    let fxRate: number | null = null
    let chargeId: string | null = null
    
    // Access currency_conversion data if available (Adaptive Pricing)
    // Note: currency_conversion is available on the session when Adaptive Pricing is used
    const currencyConversion = (session as any).currency_conversion
    
    if (currencyConversion) {
      // source_currency is the original price currency (GBP)
      // amount_total is in the destination currency (presentment)
      const sourceAmountCents = currencyConversion.amount_subtotal || currencyConversion.amount_total
      if (sourceAmountCents && currencyConversion.source_currency?.toLowerCase() === 'gbp') {
        gbpAmount = sourceAmountCents / 100
        
        // Compute FX rate: local_amount / gbp_amount
        if (gbpAmount > 0 && presentmentAmount > 0) {
          fxRate = presentmentAmount / gbpAmount
        }
      }
    }
    
    // If no currency conversion (payment was in GBP), GBP amount equals presentment amount
    if (gbpAmount === null && presentmentCurrency === 'GBP') {
      gbpAmount = presentmentAmount
      fxRate = 1.0
    }
    
    // Extract country from customer details
    const countryDetected = session.customer_details?.address?.country || null
    
    // Extract coupon/discount info if present
    const totalDiscount = session.total_details?.amount_discount 
      ? session.total_details.amount_discount / 100 
      : 0
    
    console.log('📦 Checkout session completed:', {
      sessionId,
      paymentIntentId,
      presentmentCurrency,
      presentmentAmount,
      gbpAmount,
      fxRate,
      userId,
      subscriptionPlanId,
      countryDetected,
    })
    
    return {
      type: 'checkout_session_completed',
      data: {
        sessionId,
        paymentIntentId,
        chargeId,
        customerId,
        customerEmail,
        presentmentCurrency,
        presentmentAmount,
        gbpAmount,
        fxRate,
        countryDetected,
        userId,
        subscriptionPlanId,
        totalDiscount,
        metadata,
      },
    }
  },

  getPublishableKey() {
    return process.env.STRIPE_PUBLISHABLE_KEY || ''
  },

  /**
   * Creates a Stripe Checkout Session for Adaptive Pricing.
   * Uses GBP price ID and lets Stripe handle currency conversion automatically.
   * 
   * @param input - Checkout session configuration
   * @returns Session ID and URL for redirect
   */
  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult> {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price: input.priceIdGbp,
            quantity: 1,
          },
        ],
        customer_email: input.customerEmail,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        allow_promotion_codes: true,
        metadata: {
          userId: input.userId,
          subscriptionPlanId: input.subscriptionPlanId || '',
        },
      })

      if (!session.url) {
        throw new Error('Checkout session URL not returned by Stripe')
      }

      return {
        sessionId: session.id,
        sessionUrl: session.url,
      }
    } catch (error: any) {
      console.error('Stripe checkout session creation failed:', error)
      throw new Error(`Failed to create checkout session: ${error.message}`)
    }
  },
}
