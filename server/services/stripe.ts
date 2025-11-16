import Stripe from 'stripe'
import type {
  CreateStripePaymentIntentInput,
  PaymentCustomer,
  Payment,
} from '../../src/types/payments'

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

  getPublishableKey() {
    return process.env.STRIPE_PUBLISHABLE_KEY || ''
  },
}
