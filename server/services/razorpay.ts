import Razorpay from 'razorpay'
import crypto from 'crypto'
import type { CreateRazorpayOrderInput } from '../../src/types/payments'

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set')
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export const razorpayService = {
  async createOrder(input: CreateRazorpayOrderInput) {
    try {
      const order = await razorpay.orders.create({
        amount: Math.round(input.amount * 100),
        currency: input.currency,
        receipt: input.receipt || `receipt_${Date.now()}`,
        notes: input.notes || {},
      })

      return {
        id: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      }
    } catch (error: any) {
      console.error('Razorpay order creation failed:', error)
      throw new Error(`Failed to create order: ${error.message}`)
    }
  },

  async createCustomer(email: string, name?: string, contact?: string) {
    try {
      const customer = await razorpay.customers.create({
        email,
        name,
        contact,
        fail_existing: 0,
      })

      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        contact: customer.contact,
      }
    } catch (error: any) {
      console.error('Razorpay customer creation failed:', error)
      throw new Error(`Failed to create customer: ${error.message}`)
    }
  },

  async getCustomer(customerId: string) {
    try {
      const customer = await razorpay.customers.fetch(customerId)

      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        contact: customer.contact,
      }
    } catch (error: any) {
      console.error('Razorpay get customer failed:', error)
      throw new Error(`Failed to get customer: ${error.message}`)
    }
  },

  async fetchPayment(paymentId: string) {
    try {
      const payment = await razorpay.payments.fetch(paymentId)

      return {
        id: payment.id,
        orderId: payment.order_id,
        status: payment.status,
        amount: payment.amount / 100,
        currency: payment.currency,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        errorCode: payment.error_code,
        errorDescription: payment.error_description,
      }
    } catch (error: any) {
      console.error('Razorpay fetch payment failed:', error)
      throw new Error(`Failed to fetch payment: ${error.message}`)
    }
  },

  async createRefund(paymentId: string, amount?: number) {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount ? Math.round(amount * 100) : undefined,
      })

      return {
        id: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
      }
    } catch (error: any) {
      console.error('Razorpay refund creation failed:', error)
      throw new Error(`Failed to create refund: ${error.message}`)
    }
  },

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    try {
      const text = `${orderId}|${paymentId}`
      const secret = process.env.RAZORPAY_KEY_SECRET!

      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(text)
        .digest('hex')

      return generatedSignature === signature
    } catch (error: any) {
      console.error('Razorpay signature verification failed:', error)
      return false
    }
  },

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!webhookSecret) {
      throw new Error('RAZORPAY_WEBHOOK_SECRET is not set')
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex')

      return expectedSignature === signature
    } catch (error: any) {
      console.error('Razorpay webhook signature verification failed:', error)
      return false
    }
  },

  async handleWebhookEvent(event: any) {
    console.log(`Processing Razorpay webhook: ${event.event}`)

    switch (event.event) {
      case 'payment.authorized':
      case 'payment.captured':
        return {
          type: 'payment_succeeded',
          data: {
            paymentId: event.payload.payment.entity.id,
            orderId: event.payload.payment.entity.order_id,
            amount: event.payload.payment.entity.amount / 100,
            currency: event.payload.payment.entity.currency,
            method: event.payload.payment.entity.method,
            email: event.payload.payment.entity.email,
          },
        }

      case 'payment.failed':
        return {
          type: 'payment_failed',
          data: {
            paymentId: event.payload.payment.entity.id,
            orderId: event.payload.payment.entity.order_id,
            errorCode: event.payload.payment.entity.error_code,
            errorDescription: event.payload.payment.entity.error_description,
          },
        }

      case 'refund.processed':
        return {
          type: 'refund_processed',
          data: {
            refundId: event.payload.refund.entity.id,
            paymentId: event.payload.refund.entity.payment_id,
            amount: event.payload.refund.entity.amount / 100,
            status: event.payload.refund.entity.status,
          },
        }

      default:
        console.log(`Unhandled Razorpay event type: ${event.event}`)
        return { type: 'unhandled', data: event.payload }
    }
  },

  getKeyId() {
    return process.env.RAZORPAY_KEY_ID || ''
  },
}
