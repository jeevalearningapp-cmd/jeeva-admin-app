import express from 'express'
import { paymentService } from '../services/payment'
import { stripeService } from '../services/stripe'
import { paymentsDB } from '../lib/paymentsDB'

const router = express.Router()

router.post('/create', async (req, res) => {
  try {
    const { userId, subscriptionPlanId, discountCouponCode, countryCode, metadata } = req.body

    if (!userId || !subscriptionPlanId || !countryCode) {
      return res.status(400).json({
        error: 'Missing required fields: userId, subscriptionPlanId, countryCode',
      })
    }

    const result = await paymentService.createPayment({
      userId,
      subscriptionPlanId,
      discountCouponCode,
      countryCode,
      metadata,
      amount: 0,
      currency: 'USD',
    })

    res.json(result)
  } catch (error: any) {
    console.error('Payment creation error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const {
      paymentId,
      gateway,
      stripePaymentIntentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body

    if (!paymentId || !gateway) {
      return res.status(400).json({ error: 'Missing required fields: paymentId, gateway' })
    }

    const result = await paymentService.verifyPayment({
      paymentId,
      gateway,
      stripePaymentIntentId,
    })

    res.json(result)
  } catch (error: any) {
    console.error('Payment verification error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount, reason, refundedBy } = req.body

    if (!paymentId || !refundedBy) {
      return res.status(400).json({ error: 'Missing required fields: paymentId, refundedBy' })
    }

    const result = await paymentService.createRefund(paymentId, amount, reason, refundedBy)

    res.json(result)
  } catch (error: any) {
    console.error('Refund creation error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/config', async (req, res) => {
  try {
    res.json({
      stripe: {
        publishableKey: stripeService.getPublishableKey(),
      },
    })
  } catch (error: any) {
    console.error('Config fetch error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'] as string

  if (!signature) {
    return res.status(400).send('Missing stripe-signature header')
  }

  try {
    const event = stripeService.verifyWebhookSignature(req.body, signature)

    await paymentsDB.logWebhookEvent('stripe', event.id, event.type, event)

    const result = await stripeService.handleWebhookEvent(event)

    if (result.type === 'payment_succeeded') {
      const { supabase } = await import('../lib/supabase')

      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('stripe_payment_intent_id', (result.data as any).id)
        .single()

      if (payments) {
        await paymentsDB.updatePayment(payments.id, {
          status: 'succeeded',
          gatewayResponse: result.data,
        })

        if (payments.subscription_id) {
          await paymentService.activateSubscription(payments.subscription_id)
        }
      }
    }

    await paymentsDB.markWebhookProcessed('stripe', event.id, true)

    res.json({ received: true })
  } catch (error: any) {
    console.error('Stripe webhook error:', error)
    await paymentsDB.markWebhookProcessed('stripe', 'unknown', false, error.message)
    res.status(400).send(`Webhook Error: ${error.message}`)
  }
})

router.post('/webhooks/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] as string

  if (!signature) {
    return res.status(400).send('Missing x-razorpay-signature header')
  }

  try {
    const isValid = razorpayService.verifyWebhookSignature(
      JSON.stringify(req.body),
      signature
    )

    if (!isValid) {
      return res.status(400).send('Invalid signature')
    }

    const { event, payload } = req.body
    await paymentsDB.logWebhookEvent('razorpay', payload.payment?.entity?.id || 'unknown', event, req.body)

    const result = await razorpayService.handleWebhookEvent(req.body)

    if (result.type === 'payment_succeeded') {
      const { supabase } = await import('../lib/supabase')

      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('razorpay_order_id', result.data.orderId)
        .single()

      if (payments) {
        await paymentsDB.updatePayment(payments.id, {
          status: 'succeeded',
          razorpayPaymentId: result.data.paymentId,
          paymentMethodType: result.data.method,
          gatewayResponse: result.data,
        })

        if (payments.subscription_id) {
          await paymentService.activateSubscription(payments.subscription_id)
        }
      }
    }

    await paymentsDB.markWebhookProcessed('razorpay', payload.payment?.entity?.id || 'unknown', true)

    res.json({ status: 'ok' })
  } catch (error: any) {
    console.error('Razorpay webhook error:', error)
    res.status(500).send(`Webhook Error: ${error.message}`)
  }
})

export default router
