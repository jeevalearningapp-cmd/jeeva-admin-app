import { supabase } from '../lib/supabase'
import { stripeService } from './stripe'
import { razorpayService } from './razorpay'
import { paymentsAPI } from '../../src/api/payments'
import type {
  PaymentGateway,
  CurrencyCode,
  CreatePaymentInput,
  VerifyPaymentInput,
  PricingCalculation,
} from '../../src/types/payments'

export const paymentService = {
  selectGateway(countryCode: string): PaymentGateway {
    return countryCode === 'IN' ? 'razorpay' : 'stripe'
  },

  async calculatePricing(
    subscriptionPlanId: string,
    discountCouponCode?: string
  ): Promise<PricingCalculation> {
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscriptionPlanId)
      .single()

    if (planError || !plan) {
      throw new Error('Subscription plan not found')
    }

    const originalAmount = parseFloat(plan.price)
    let discountAmount = 0
    let discountPercent: number | undefined
    let couponCode: string | undefined

    if (discountCouponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from('discount_coupons')
        .select('*')
        .eq('code', discountCouponCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (coupon && !couponError) {
        const now = new Date()
        const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null

        if (
          (!validFrom || validFrom <= now) &&
          (!validUntil || validUntil >= now)
        ) {
          if (coupon.discount_type === 'percentage') {
            discountPercent = parseFloat(coupon.discount_value)
            discountAmount = (originalAmount * discountPercent) / 100
          } else if (coupon.discount_type === 'fixed') {
            discountAmount = parseFloat(coupon.discount_value)
          }

          couponCode = coupon.code
        }
      }
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount)

    return {
      originalAmount,
      discountAmount,
      discountPercent,
      finalAmount,
      currency: (plan.currency || 'USD') as CurrencyCode,
      couponCode,
      trialDays: plan.trial_days || 0,
    }
  },

  async createPayment(input: CreatePaymentInput) {
    const gateway = input.gatewayOverride || this.selectGateway(input.countryCode)
    
    const pricing = await this.calculatePricing(
      input.subscriptionPlanId!,
      input.discountCouponCode
    )

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('email, full_name, phone_number')
      .eq('user_id', input.userId)
      .single()

    if (profileError || !profile) {
      throw new Error('User profile not found')
    }

    const email = profile.email || ''
    const fullName = profile.full_name
    const phone = profile.phone_number

    let paymentCustomer = await paymentsAPI.getPaymentCustomer(input.userId, gateway)

    if (gateway === 'stripe') {
      if (!paymentCustomer) {
        const stripeCustomer = await stripeService.createCustomer(email, fullName, phone)

        paymentCustomer = await paymentsAPI.createPaymentCustomer({
          userId: input.userId,
          gateway: 'stripe',
          stripeCustomerId: stripeCustomer.id,
          email,
          fullName,
          phone,
          countryCode: input.countryCode,
        })
      }

      const paymentIntent = await stripeService.createPaymentIntent({
        amount: pricing.finalAmount,
        currency: pricing.currency,
        customerId: paymentCustomer.stripeCustomerId,
        metadata: {
          userId: input.userId,
          subscriptionPlanId: input.subscriptionPlanId,
          ...input.metadata,
        },
      })

      const payment = await paymentsAPI.createPayment({
        userId: input.userId,
        gateway: 'stripe',
        amount: pricing.finalAmount,
        currency: pricing.currency,
        subscriptionPlanId: input.subscriptionPlanId,
        originalAmount: pricing.originalAmount,
        discountAmount: pricing.discountAmount,
        stripePaymentIntentId: paymentIntent.id,
        metadata: input.metadata,
      })

      return {
        paymentId: payment.id,
        gateway: 'stripe',
        clientSecret: paymentIntent.clientSecret,
        amount: pricing.finalAmount,
        currency: pricing.currency,
      }
    } else {
      if (!paymentCustomer) {
        const razorpayCustomer = await razorpayService.createCustomer(
          email,
          fullName,
          phone
        )

        paymentCustomer = await paymentsAPI.createPaymentCustomer({
          userId: input.userId,
          gateway: 'razorpay',
          razorpayCustomerId: razorpayCustomer.id,
          email,
          fullName,
          phone,
          countryCode: input.countryCode,
        })
      }

      const order = await razorpayService.createOrder({
        amount: pricing.finalAmount,
        currency: pricing.currency,
        receipt: `order_${Date.now()}`,
        notes: {
          userId: input.userId,
          subscriptionPlanId: input.subscriptionPlanId,
          ...input.metadata,
        },
      })

      const payment = await paymentsAPI.createPayment({
        userId: input.userId,
        gateway: 'razorpay',
        amount: pricing.finalAmount,
        currency: pricing.currency,
        subscriptionPlanId: input.subscriptionPlanId,
        originalAmount: pricing.originalAmount,
        discountAmount: pricing.discountAmount,
        razorpayOrderId: order.id,
        metadata: input.metadata,
      })

      return {
        paymentId: payment.id,
        gateway: 'razorpay',
        orderId: order.id,
        amount: pricing.finalAmount,
        currency: pricing.currency,
      }
    }
  },

  async verifyPayment(input: VerifyPaymentInput) {
    const payment = await paymentsAPI.getPayment(input.paymentId)

    if (input.gateway === 'stripe') {
      if (!input.stripePaymentIntentId) {
        throw new Error('Stripe payment intent ID is required')
      }

      const paymentIntent = await stripeService.retrievePaymentIntent(
        input.stripePaymentIntentId
      )

      if (paymentIntent.status === 'succeeded') {
        await paymentsAPI.updatePayment(payment.id, {
          status: 'succeeded',
          gatewayResponse: paymentIntent,
        })

        if (payment.subscriptionId) {
          await this.activateSubscription(payment.subscriptionId)
        }

        return {
          success: true,
          payment: await paymentsAPI.getPayment(payment.id),
        }
      } else {
        await paymentsAPI.updatePayment(payment.id, {
          status: 'failed',
          failureMessage: 'Payment not succeeded',
          gatewayResponse: paymentIntent,
        })

        return {
          success: false,
          error: 'Payment not succeeded',
        }
      }
    } else {
      if (!input.razorpayOrderId || !input.razorpayPaymentId || !input.razorpaySignature) {
        throw new Error('Razorpay verification details are required')
      }

      const isValid = razorpayService.verifyPaymentSignature(
        input.razorpayOrderId,
        input.razorpayPaymentId,
        input.razorpaySignature
      )

      if (!isValid) {
        await paymentsAPI.updatePayment(payment.id, {
          status: 'failed',
          failureMessage: 'Invalid payment signature',
        })

        return {
          success: false,
          error: 'Invalid payment signature',
        }
      }

      const razorpayPayment = await razorpayService.fetchPayment(input.razorpayPaymentId)

      if (razorpayPayment.status === 'authorized' || razorpayPayment.status === 'captured') {
        await paymentsAPI.updatePayment(payment.id, {
          status: 'succeeded',
          razorpayPaymentId: input.razorpayPaymentId,
          paymentMethodType: razorpayPayment.method,
          gatewayResponse: razorpayPayment,
        })

        if (payment.subscriptionId) {
          await this.activateSubscription(payment.subscriptionId)
        }

        return {
          success: true,
          payment: await paymentsAPI.getPayment(payment.id),
        }
      } else {
        await paymentsAPI.updatePayment(payment.id, {
          status: 'failed',
          razorpayPaymentId: input.razorpayPaymentId,
          failureCode: razorpayPayment.errorCode,
          failureMessage: razorpayPayment.errorDescription,
          gatewayResponse: razorpayPayment,
        })

        return {
          success: false,
          error: razorpayPayment.errorDescription || 'Payment failed',
        }
      }
    }
  },

  async activateSubscription(subscriptionId: string) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('id', subscriptionId)

    if (error) {
      console.error('Failed to activate subscription:', error)
    }
  },

  async createRefund(paymentId: string, amount?: number, reason?: string, refundedBy?: string) {
    const payment = await paymentsAPI.getPayment(paymentId)

    const refund = await paymentsAPI.createRefund({
      paymentId,
      amount,
      reason,
      refundedBy: refundedBy || '',
    })

    try {
      if (payment.gateway === 'stripe' && payment.stripePaymentIntentId) {
        const stripeRefund = await stripeService.createRefund(
          payment.stripePaymentIntentId,
          amount,
          reason
        )

        await paymentsAPI.updateRefund(refund.id, {
          status: 'succeeded',
          stripeRefundId: stripeRefund.id,
        })

        return {
          success: true,
          refund: await paymentsAPI.getPayment(payment.id),
        }
      } else if (payment.gateway === 'razorpay' && payment.razorpayPaymentId) {
        const razorpayRefund = await razorpayService.createRefund(
          payment.razorpayPaymentId,
          amount
        )

        await paymentsAPI.updateRefund(refund.id, {
          status: 'succeeded',
          razorpayRefundId: razorpayRefund.id,
        })

        return {
          success: true,
          refund: await paymentsAPI.getPayment(payment.id),
        }
      } else {
        throw new Error('Invalid payment gateway or payment ID')
      }
    } catch (error: any) {
      await paymentsAPI.updateRefund(refund.id, {
        status: 'failed',
      })

      throw error
    }
  },
}
