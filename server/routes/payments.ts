import express from "express";
import { paymentService } from "../services/payment";
import { stripeService } from "../services/stripe";
import { paymentsDB } from "../lib/paymentsDB";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const {
      userId,
      subscriptionPlanId,
      discountCouponCode,
      countryCode,
      metadata,
    } = req.body;

    if (!userId || !subscriptionPlanId || !countryCode) {
      return res.status(400).json({
        error:
          "Missing required fields: userId, subscriptionPlanId, countryCode",
      });
    }

    const result = await paymentService.createPayment({
      userId,
      subscriptionPlanId,
      discountCouponCode,
      countryCode,
      metadata,
      amount: 0,
      currency: "USD",
    });

    res.json(result);
  } catch (error: any) {
    console.error("Payment creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const {
      paymentId,
      gateway,
      stripePaymentIntentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!paymentId || !gateway) {
      return res
        .status(400)
        .json({ error: "Missing required fields: paymentId, gateway" });
    }

    const result = await paymentService.verifyPayment({
      paymentId,
      gateway,
      stripePaymentIntentId,
    });

    res.json(result);
  } catch (error: any) {
    console.error("Payment verification error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/refund", async (req, res) => {
  try {
    const { paymentId, amount, reason, refundedBy } = req.body;

    if (!paymentId || !refundedBy) {
      return res
        .status(400)
        .json({ error: "Missing required fields: paymentId, refundedBy" });
    }

    const result = await paymentService.createRefund(
      paymentId,
      amount,
      reason,
      refundedBy,
    );

    res.json(result);
  } catch (error: any) {
    console.error("Refund creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/config", async (req, res) => {
  try {
    res.json({
      stripe: {
        publishableKey: stripeService.getPublishableKey(),
      },
    });
  } catch (error: any) {
    console.error("Config fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      return res.status(400).send("Missing stripe-signature header");
    }

    try {
      const event = stripeService.verifyWebhookSignature(req.body, signature);

      await paymentsDB.logWebhookEvent("stripe", event.id, event.type, event);

      const result = await stripeService.handleWebhookEvent(event);

      if (result.type === "checkout_session_completed") {
        // Handle Stripe Checkout Session completed (Adaptive Pricing flow)
        // Requirements: 2.3, 2.4, 4.4
        await handleCheckoutSessionCompleted(
          result.data as CheckoutSessionCompletedData,
        );
      } else if (result.type === "payment_succeeded") {
        // Handle legacy PaymentIntent flow
        const { supabase } = await import("../lib/supabase");

        const { data: payments } = await supabase
          .from("payments")
          .select("*")
          .eq("stripe_payment_intent_id", (result.data as any).id)
          .single();

        if (payments) {
          await paymentsDB.updatePayment(payments.id, {
            status: "succeeded",
            gatewayResponse: result.data,
          });

          if (payments.subscription_id) {
            await paymentService.activateSubscription(payments.subscription_id);
          }
        }
      }

      await paymentsDB.markWebhookProcessed("stripe", event.id, true);

      res.json({ received: true });
    } catch (error: any) {
      console.error("Stripe webhook error:", error);
      await paymentsDB.markWebhookProcessed(
        "stripe",
        "unknown",
        false,
        error.message,
      );
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  },
);

/**
 * Data structure for checkout.session.completed webhook event
 */
interface CheckoutSessionCompletedData {
  sessionId: string;
  paymentIntentId: string | null;
  chargeId: string | null;
  customerId: string | null;
  customerEmail: string | null;
  presentmentCurrency: string;
  presentmentAmount: number;
  gbpAmount: number | null;
  fxRate: number | null;
  countryDetected: string | null;
  userId: string | null;
  subscriptionPlanId: string | null;
  totalDiscount: number;
  metadata: Record<string, string>;
}

/**
 * Handles checkout.session.completed webhook event.
 * Creates payment record with presentment data and activates subscription.
 *
 * Requirements:
 * - 2.3: Extract and store presentment currency, local amount, GBP amount, and FX rate
 * - 2.4: Activate user's subscription in the database
 * - 4.4: Persist stripe_checkout_session_id, amount_charged_gbp, amount_charged_local,
 *        currency_charged_local, and computed fx_rate
 */
async function handleCheckoutSessionCompleted(
  data: CheckoutSessionCompletedData,
): Promise<void> {
  const { supabase } = await import("../lib/supabase");

  console.log(
    "🔄 Processing checkout.session.completed webhook:",
    data.sessionId,
  );

  // Validate required fields
  if (!data.userId) {
    console.error("❌ Missing userId in checkout session metadata");
    throw new Error("Missing userId in checkout session metadata");
  }

  // Check if payment already exists for this session (idempotency)
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id")
    .eq("stripe_checkout_session_id", data.sessionId)
    .maybeSingle();

  if (existingPayment) {
    console.log("⚠️ Payment already exists for session:", data.sessionId);
    return;
  }

  // Create subscription record if subscriptionPlanId is provided
  let subscriptionId: string | null = null;
  if (data.subscriptionPlanId) {
    subscriptionId = await paymentService.createSubscriptionRecord(
      data.userId,
      data.subscriptionPlanId,
    );
  }

  // Create payment record with presentment data (Requirements: 4.4)
  const paymentData = {
    user_id: data.userId,
    gateway: "stripe",
    stripe_checkout_session_id: data.sessionId,
    stripe_payment_intent_id: data.paymentIntentId,
    stripe_customer_id: data.customerId,

    // Presentment fields (Adaptive Pricing)
    amount_charged_local: data.presentmentAmount,
    currency_charged_local: data.presentmentCurrency,
    amount_charged_gbp: data.gbpAmount,
    fx_rate_applied: data.fxRate,
    country_detected: data.countryDetected,

    // Standard payment fields
    amount: data.gbpAmount || data.presentmentAmount,
    currency: "GBP",
    original_amount: data.gbpAmount || data.presentmentAmount,
    discount_amount: data.totalDiscount,
    final_amount: data.gbpAmount || data.presentmentAmount,

    // Subscription linkage
    subscription_id: subscriptionId,
    subscription_plan_id: data.subscriptionPlanId,

    // Status
    status: "succeeded",

    // Metadata
    metadata: data.metadata,
  };

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert(paymentData)
    .select("id")
    .single();

  if (paymentError) {
    console.error("❌ Failed to create payment record:", paymentError);
    throw new Error(`Failed to create payment: ${paymentError.message}`);
  }

  console.log("✅ Payment record created:", payment.id);

  // Activate subscription if created (Requirements: 2.4)
  if (subscriptionId) {
    await paymentService.activateSubscription(subscriptionId);
    console.log("✅ Subscription activated:", subscriptionId);
  }
}

router.post("/webhooks/razorpay", async (req, res) => {
  const signature = req.headers["x-razorpay-signature"] as string;

  if (!signature) {
    return res.status(400).send("Missing x-razorpay-signature header");
  }

  try {
    const isValid = razorpayService.verifyWebhookSignature(
      JSON.stringify(req.body),
      signature,
    );

    if (!isValid) {
      return res.status(400).send("Invalid signature");
    }

    const { event, payload } = req.body;
    await paymentsDB.logWebhookEvent(
      "razorpay",
      payload.payment?.entity?.id || "unknown",
      event,
      req.body,
    );

    const result = await razorpayService.handleWebhookEvent(req.body);

    if (result.type === "payment_succeeded") {
      const { supabase } = await import("../lib/supabase");

      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .eq("razorpay_order_id", result.data.orderId)
        .single();

      if (payments) {
        await paymentsDB.updatePayment(payments.id, {
          status: "succeeded",
          razorpayPaymentId: result.data.paymentId,
          paymentMethodType: result.data.method,
          gatewayResponse: result.data,
        });

        if (payments.subscription_id) {
          await paymentService.activateSubscription(payments.subscription_id);
        }
      }
    }

    await paymentsDB.markWebhookProcessed(
      "razorpay",
      payload.payment?.entity?.id || "unknown",
      true,
    );

    res.json({ status: "ok" });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    res.status(500).send(`Webhook Error: ${error.message}`);
  }
});

export default router;
