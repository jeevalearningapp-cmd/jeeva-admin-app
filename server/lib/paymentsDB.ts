import { supabase } from './supabase'
import type {
  Payment,
  PaymentCustomer,
  PaymentRefund,
  PaymentGateway,
  PaymentStatus,
  CreatePaymentCustomerInput,
  CreateRefundInput,
} from '../../src/types/payments'

export const paymentsDB = {
  async createPaymentCustomer(input: CreatePaymentCustomerInput): Promise<PaymentCustomer> {
    const { data, error } = await supabase
      .from('payment_customers')
      .insert({
        user_id: input.userId,
        gateway: input.gateway,
        stripe_customer_id: input.gateway === 'stripe' ? input.stripeCustomerId : null,
        razorpay_customer_id: input.gateway === 'razorpay' ? input.razorpayCustomerId : null,
        email: input.email,
        full_name: input.fullName,
        phone: input.phone,
        country_code: input.countryCode,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create payment customer: ${error.message}`)
    }

    return transformPaymentCustomerFromDB(data)
  },

  async getPaymentCustomer(userId: string, gateway: PaymentGateway): Promise<PaymentCustomer | null> {
    const { data, error } = await supabase
      .from('payment_customers')
      .select('*')
      .eq('user_id', userId)
      .eq('gateway', gateway)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to get payment customer: ${error.message}`)
    }

    return data ? transformPaymentCustomerFromDB(data) : null
  },

  async createPayment(input: {
    userId: string
    gateway: PaymentGateway
    amount: number
    currency: string
    subscriptionId?: string
    subscriptionPlanId?: string
    discountCouponId?: string
    originalAmount: number
    discountAmount: number
    stripePaymentIntentId?: string
    razorpayOrderId?: string
    metadata?: any
  }): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: input.userId,
        gateway: input.gateway,
        amount: input.amount,
        currency: input.currency,
        subscription_id: input.subscriptionId,
        subscription_plan_id: input.subscriptionPlanId,
        discount_coupon_id: input.discountCouponId,
        original_amount: input.originalAmount,
        discount_amount: input.discountAmount,
        final_amount: input.amount,
        stripe_payment_intent_id: input.stripePaymentIntentId,
        razorpay_order_id: input.razorpayOrderId,
        status: 'pending',
        metadata: input.metadata || {},
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`)
    }

    return transformPaymentFromDB(data)
  },

  async updatePayment(
    paymentId: string,
    update: {
      status?: PaymentStatus
      razorpayPaymentId?: string
      failureCode?: string
      failureMessage?: string
      gatewayResponse?: any
      paymentMethodType?: string
    }
  ): Promise<Payment> {
    const updateData: any = {}

    if (update.status) updateData.status = update.status
    if (update.razorpayPaymentId) updateData.razorpay_payment_id = update.razorpayPaymentId
    if (update.failureCode) updateData.failure_code = update.failureCode
    if (update.failureMessage) updateData.failure_message = update.failureMessage
    if (update.gatewayResponse) updateData.gateway_response = update.gatewayResponse
    if (update.paymentMethodType) updateData.payment_method_type = update.paymentMethodType

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update payment: ${error.message}`)
    }

    return transformPaymentFromDB(data)
  },

  async getPayment(paymentId: string): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (error) {
      throw new Error(`Failed to get payment: ${error.message}`)
    }

    return transformPaymentFromDB(data)
  },

  async createRefund(input: CreateRefundInput): Promise<PaymentRefund> {
    const payment = await this.getPayment(input.paymentId)

    const { data, error } = await supabase
      .from('payment_refunds')
      .insert({
        payment_id: input.paymentId,
        gateway: payment.gateway,
        amount: input.amount || payment.finalAmount,
        currency: payment.currency,
        reason: input.reason,
        refunded_by: input.refundedBy,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create refund: ${error.message}`)
    }

    return transformPaymentRefundFromDB(data)
  },

  async updateRefund(
    refundId: string,
    update: {
      status?: PaymentStatus
      stripeRefundId?: string
      razorpayRefundId?: string
    }
  ): Promise<PaymentRefund> {
    const updateData: any = {}

    if (update.status) updateData.status = update.status
    if (update.stripeRefundId) updateData.stripe_refund_id = update.stripeRefundId
    if (update.razorpayRefundId) updateData.razorpay_refund_id = update.razorpayRefundId

    const { data, error } = await supabase
      .from('payment_refunds')
      .update(updateData)
      .eq('id', refundId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update refund: ${error.message}`)
    }

    return transformPaymentRefundFromDB(data)
  },

  async logWebhookEvent(gateway: PaymentGateway, eventId: string, eventType: string, payload: any) {
    const { error } = await supabase.from('payment_webhook_events').insert({
      gateway,
      event_id: eventId,
      event_type: eventType,
      payload,
      processed: false,
    })

    if (error && !error.message.includes('duplicate key')) {
      console.error('Failed to log webhook event:', error)
    }
  },

  async markWebhookProcessed(gateway: PaymentGateway, eventId: string, success: boolean, errorMessage?: string) {
    const { error } = await supabase
      .from('payment_webhook_events')
      .update({
        processed: success,
        processed_at: new Date().toISOString(),
        error_message: errorMessage,
        retry_count: success ? 0 : 1,
      })
      .eq('gateway', gateway)
      .eq('event_id', eventId)

    if (error) {
      console.error('Failed to mark webhook processed:', error)
    }
  },
}

function transformPaymentCustomerFromDB(data: any): PaymentCustomer {
  return {
    id: data.id,
    userId: data.user_id,
    gateway: data.gateway,
    stripeCustomerId: data.stripe_customer_id,
    razorpayCustomerId: data.razorpay_customer_id,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
    countryCode: data.country_code,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function transformPaymentFromDB(data: any): Payment {
  return {
    id: data.id,
    userId: data.user_id,
    paymentCustomerId: data.payment_customer_id,
    gateway: data.gateway,
    stripePaymentIntentId: data.stripe_payment_intent_id,
    razorpayOrderId: data.razorpay_order_id,
    razorpayPaymentId: data.razorpay_payment_id,
    amount: parseFloat(data.amount),
    currency: data.currency,
    status: data.status,
    subscriptionId: data.subscription_id,
    subscriptionPlanId: data.subscription_plan_id,
    discountCouponId: data.discount_coupon_id,
    originalAmount: parseFloat(data.original_amount),
    discountAmount: parseFloat(data.discount_amount),
    finalAmount: parseFloat(data.final_amount),
    paymentMethodId: data.payment_method_id,
    paymentMethodType: data.payment_method_type,
    failureCode: data.failure_code,
    failureMessage: data.failure_message,
    gatewayResponse: data.gateway_response,
    receiptUrl: data.receipt_url,
    invoicePdf: data.invoice_pdf,
    metadata: data.metadata,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    completedAt: data.completed_at,
    // Stripe Adaptive Pricing presentment fields
    stripeCheckoutSessionId: data.stripe_checkout_session_id,
    amountChargedLocal: data.amount_charged_local ? parseFloat(data.amount_charged_local) : undefined,
    currencyChargedLocal: data.currency_charged_local,
    amountChargedGbp: data.amount_charged_gbp ? parseFloat(data.amount_charged_gbp) : undefined,
    fxRateApplied: data.fx_rate_applied ? parseFloat(data.fx_rate_applied) : undefined,
    countryDetected: data.country_detected,
  }
}

function transformPaymentRefundFromDB(data: any): PaymentRefund {
  return {
    id: data.id,
    paymentId: data.payment_id,
    gateway: data.gateway,
    stripeRefundId: data.stripe_refund_id,
    razorpayRefundId: data.razorpay_refund_id,
    amount: parseFloat(data.amount),
    currency: data.currency,
    reason: data.reason,
    status: data.status,
    refundedBy: data.refunded_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    completedAt: data.completed_at,
  }
}
