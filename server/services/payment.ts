import Stripe from "stripe";
import { supabase } from "../lib/supabase";
import { stripeService } from "./stripe";
import { paymentsDB } from "../lib/paymentsDB";
import type {
  PaymentGateway,
  CurrencyCode,
  CreatePaymentInput,
  VerifyPaymentInput,
  PricingCalculation,
} from "../../src/types/payments";

// Initialize Stripe for direct API calls
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export const paymentService = {
  selectGateway(countryCode: string): PaymentGateway {
    return "stripe"; // All countries use Stripe
  },

  /**
   * Get amount from Stripe Price API or fallback sources
   * Returns amount in cents/pence (smallest currency unit)
   */
  async getAmountFromPriceId(
    subscriptionPlanId: string,
    fallbackAmount?: number,
  ): Promise<{ amount: number; currency: string }> {
    // Check if subscriptionPlanId is a Stripe Price ID
    if (subscriptionPlanId && subscriptionPlanId.startsWith("price_")) {
      try {
        const stripePrice = await stripe.prices.retrieve(subscriptionPlanId);
        return {
          amount: stripePrice.unit_amount || 0, // Already in cents/pence
          currency: stripePrice.currency.toUpperCase(),
        };
      } catch (error) {
        console.error("Failed to fetch Stripe price:", error);
      }
    }

    // Fallback: Use amount from request
    if (fallbackAmount && fallbackAmount > 0) {
      return {
        amount: Math.round(fallbackAmount * 100), // Convert to cents
        currency: "USD",
      };
    }

    // Fallback: Try to get from subscription_plans table (legacy)
    if (subscriptionPlanId) {
      const { data: plan } = await supabase
        .from("subscription_plans")
        .select("price_usd")
        .eq("id", subscriptionPlanId)
        .single();

      if (plan?.price_usd) {
        return {
          amount: Math.round(parseFloat(plan.price_usd) * 100), // Convert to cents
          currency: "USD",
        };
      }
    }

    return { amount: 0, currency: "USD" };
  },

  /**
   * Calculate pricing for a subscription plan
   *
   * With Adaptive Pricing, Stripe Checkout handles:
   * - Currency conversion (GBP → local currency)
   * - Coupon discount calculation
   *
   * This method now only validates coupon eligibility (Requirements 6.2)
   * and returns the base GBP price. Actual discount amounts are calculated
   * by Stripe Checkout when allow_promotion_codes is enabled.
   */
  async calculatePricing(
    subscriptionPlanId: string,
    discountCouponCode?: string,
    fallbackAmount?: number,
  ): Promise<PricingCalculation> {
    // Get the original amount from Stripe or fallback
    const { amount: originalAmountCents, currency } =
      await this.getAmountFromPriceId(subscriptionPlanId, fallbackAmount);

    const originalAmount = originalAmountCents / 100; // Convert back to dollars for display
    let couponCode: string | undefined;
    let couponValid = false;

    // Validate coupon eligibility only (no amount-based validation)
    // Requirements 6.2: Check only eligibility (plan, active status, max_redemptions)
    if (discountCouponCode) {
      const eligibility = await this.validateCouponEligibility(
        discountCouponCode,
        subscriptionPlanId,
      );

      if (eligibility.valid) {
        couponCode = eligibility.code;
        couponValid = true;
      }
    }

    // Return base pricing - Stripe Checkout handles discount calculation
    // with Adaptive Pricing when allow_promotion_codes: true
    return {
      originalAmount,
      discountAmount: 0, // Calculated by Stripe Checkout
      discountPercent: undefined, // Calculated by Stripe Checkout
      finalAmount: originalAmount, // Base amount - Stripe applies discount
      currency: currency as CurrencyCode,
      couponCode: couponValid ? couponCode : undefined,
      trialDays: 0,
    };
  },

  /**
   * Validate coupon eligibility only (no amount-based validation)
   *
   * With Adaptive Pricing, Stripe Checkout handles discount calculation.
   * This method checks only:
   * - Coupon exists and is active (not deleted)
   * - Max redemptions not exceeded
   * - Plan applicability (if specified in metadata)
   *
   * Requirements: 6.2
   */
  async validateCouponEligibility(
    couponCode: string,
    planId?: string,
  ): Promise<{ valid: boolean; code?: string; error?: string }> {
    try {
      // Try Stripe coupon first
      const stripeCoupon = await stripe.coupons.retrieve(
        couponCode.toUpperCase(),
      );

      // Check 1: Active status
      if (!stripeCoupon || stripeCoupon.deleted) {
        return { valid: false, error: "COUPON_INACTIVE" };
      }

      // Check 2: Max redemptions not exceeded
      if (
        stripeCoupon.max_redemptions &&
        stripeCoupon.times_redeemed >= stripeCoupon.max_redemptions
      ) {
        return { valid: false, error: "COUPON_EXHAUSTED" };
      }

      // Check 3: Plan applicability (if specified in metadata)
      const applicableProducts = stripeCoupon.metadata?.applicable_products;
      if (applicableProducts && planId) {
        const productList = applicableProducts
          .split(",")
          .map((p: string) => p.trim());
        if (!productList.includes(planId) && !productList.includes("*")) {
          return { valid: false, error: "NOT_APPLICABLE_TO_PLAN" };
        }
      }

      return { valid: true, code: stripeCoupon.id };
    } catch (stripeError) {
      // Fallback to Supabase discount_coupons (legacy) - eligibility check only
      const { data: coupon, error: couponError } = await supabase
        .from("discount_coupons")
        .select("code, is_active, usage_limit, usage_count, applicable_plans")
        .eq("code", couponCode.toUpperCase())
        .single();

      if (couponError || !coupon) {
        return { valid: false, error: "INVALID_COUPON" };
      }

      // Check 1: Active status
      if (!coupon.is_active) {
        return { valid: false, error: "COUPON_INACTIVE" };
      }

      // Check 2: Max redemptions not exceeded
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return { valid: false, error: "COUPON_EXHAUSTED" };
      }

      // Check 3: Plan applicability
      if (
        coupon.applicable_plans &&
        coupon.applicable_plans.length > 0 &&
        planId
      ) {
        if (!coupon.applicable_plans.includes(planId)) {
          return { valid: false, error: "NOT_APPLICABLE_TO_PLAN" };
        }
      }

      return { valid: true, code: coupon.code };
    }
  },

  async createPayment(input: CreatePaymentInput) {
    const gateway =
      input.gatewayOverride || this.selectGateway(input.countryCode);

    // Pass the input amount as fallback
    const pricing = await this.calculatePricing(
      input.subscriptionPlanId!,
      input.discountCouponCode,
      input.amount,
    );

    // Validate minimum amount (Stripe minimum is $0.50 / £0.30 / ₹50)
    const amountInCents = Math.round(pricing.finalAmount * 100);
    if (amountInCents < 50) {
      throw new Error(
        `Invalid amount: ${amountInCents} cents. Minimum is 50 cents ($0.50).`,
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("email, full_name, phone_number")
      .eq("user_id", input.userId)
      .single();

    if (profileError || !profile) {
      throw new Error("User profile not found");
    }

    const email = profile.email || "";
    const fullName = profile.full_name;
    const phone = profile.phone_number;

    let paymentCustomer = await paymentsDB.getPaymentCustomer(
      input.userId,
      gateway,
    );

    if (gateway === "stripe") {
      if (!paymentCustomer) {
        const stripeCustomer = await stripeService.createCustomer(
          email,
          fullName,
          phone,
        );

        paymentCustomer = await paymentsDB.createPaymentCustomer({
          userId: input.userId,
          gateway: "stripe",
          stripeCustomerId: stripeCustomer.id,
          email,
          fullName,
          phone,
          countryCode: input.countryCode,
        });
      }

      // Create subscription record BEFORE payment (Requirements 3.1)
      const subscriptionId = await this.createSubscriptionRecord(
        input.userId,
        input.subscriptionPlanId!,
      );

      const paymentIntent = await stripeService.createPaymentIntent({
        amount: pricing.finalAmount,
        currency: pricing.currency,
        customerId: paymentCustomer.stripeCustomerId,
        metadata: {
          userId: input.userId,
          subscriptionPlanId: input.subscriptionPlanId,
          subscriptionId: subscriptionId,
          ...input.metadata,
        },
      });

      // Link payment to subscription via subscription_id (Requirements 3.1)
      const payment = await paymentsDB.createPayment({
        userId: input.userId,
        gateway: "stripe",
        amount: pricing.finalAmount,
        currency: pricing.currency,
        subscriptionId: subscriptionId,
        subscriptionPlanId: input.subscriptionPlanId,
        originalAmount: pricing.originalAmount,
        discountAmount: pricing.discountAmount,
        stripePaymentIntentId: paymentIntent.id,
        metadata: input.metadata,
      });

      return {
        paymentId: payment.id,
        gateway: "stripe",
        clientSecret: paymentIntent.clientSecret,
        amount: pricing.finalAmount,
        currency: pricing.currency,
        subscriptionId: subscriptionId,
      };
    } else {
      throw new Error("Only Stripe payment gateway is supported");
    }
  },

  /**
   * Creates a subscription record in 'pending' status before payment
   * The subscription will be activated after successful payment
   * Requirements: 3.1
   */
  async createSubscriptionRecord(
    userId: string,
    subscriptionPlanId: string,
  ): Promise<string> {
    console.log(
      "📝 Creating subscription record for user:",
      userId,
      "plan:",
      subscriptionPlanId,
    );

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_id: subscriptionPlanId,
        status: "pending",
        auto_renew: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create subscription record:", error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    console.log("✅ Subscription record created:", subscription.id);
    return subscription.id;
  },

  async verifyPayment(input: VerifyPaymentInput) {
    const payment = await paymentsDB.getPayment(input.paymentId);

    if (input.gateway === "stripe") {
      if (!input.stripePaymentIntentId) {
        throw new Error("Stripe payment intent ID is required");
      }

      const paymentIntent = await stripeService.retrievePaymentIntent(
        input.stripePaymentIntentId,
      );

      if (paymentIntent.status === "succeeded") {
        await paymentsDB.updatePayment(payment.id, {
          status: "succeeded",
          gatewayResponse: paymentIntent,
        });

        if (payment.subscriptionId) {
          await this.activateSubscription(payment.subscriptionId);
        }

        return {
          success: true,
          payment: await paymentsDB.getPayment(payment.id),
        };
      } else {
        await paymentsDB.updatePayment(payment.id, {
          status: "failed",
          failureMessage: "Payment not succeeded",
          gatewayResponse: paymentIntent,
        });

        return {
          success: false,
          error: "Payment not succeeded",
        };
      }
    } else {
      if (
        !input.razorpayOrderId ||
        !input.razorpayPaymentId ||
        !input.razorpaySignature
      ) {
        throw new Error("Razorpay verification details are required");
      }

      const isValid = razorpayService.verifyPaymentSignature(
        input.razorpayOrderId,
        input.razorpayPaymentId,
        input.razorpaySignature,
      );

      if (!isValid) {
        await paymentsDB.updatePayment(payment.id, {
          status: "failed",
          failureMessage: "Invalid payment signature",
        });

        return {
          success: false,
          error: "Invalid payment signature",
        };
      }

      const razorpayPayment = await razorpayService.fetchPayment(
        input.razorpayPaymentId,
      );

      if (
        razorpayPayment.status === "authorized" ||
        razorpayPayment.status === "captured"
      ) {
        await paymentsDB.updatePayment(payment.id, {
          status: "succeeded",
          razorpayPaymentId: input.razorpayPaymentId,
          paymentMethodType: razorpayPayment.method,
          gatewayResponse: razorpayPayment,
        });

        if (payment.subscriptionId) {
          await this.activateSubscription(payment.subscriptionId);
        }

        return {
          success: true,
          payment: await paymentsDB.getPayment(payment.id),
        };
      } else {
        await paymentsDB.updatePayment(payment.id, {
          status: "failed",
          razorpayPaymentId: input.razorpayPaymentId,
          failureCode: razorpayPayment.errorCode,
          failureMessage: razorpayPayment.errorDescription,
          gatewayResponse: razorpayPayment,
        });

        return {
          success: false,
          error: razorpayPayment.errorDescription || "Payment failed",
        };
      }
    }
  },

  async activateSubscription(subscriptionId: string) {
    console.log("🔄 Activating subscription:", subscriptionId);

    try {
      // 1. Query subscription record by ID with subscription_plan details
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("id", subscriptionId)
        .single();

      if (subError || !subscription) {
        console.error("Failed to fetch subscription:", subError);
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      // 2. Get duration_days from subscription_plan (Stripe manages products, we use duration_days)
      // Default to 30 days if not specified
      const durationDays = subscription.subscription_plans?.duration_days || 30;

      // 3. Calculate dates
      const now = new Date();
      const startDate = now.toISOString();

      // Calculate end_date based on duration_days from the plan
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + durationDays);

      // 4. Update subscription status to 'active', set start_date, end_date, last_payment_date
      // Note: No recurring subscriptions - Stripe manages products, we just track duration
      const updateData: Record<string, any> = {
        status: "active",
        start_date: startDate,
        end_date: endDate.toISOString(),
        last_payment_date: startDate,
      };

      const { error: updateError } = await supabase
        .from("subscriptions")
        .update(updateData)
        .eq("id", subscriptionId);

      if (updateError) {
        console.error("Failed to update subscription:", updateError);
        throw new Error(
          `Failed to activate subscription: ${updateError.message}`,
        );
      }

      // 5. Update user_profiles subscription_status to 'active'
      if (subscription.user_id) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .update({ subscription_status: "active" })
          .eq("user_id", subscription.user_id);

        if (profileError) {
          console.error(
            "Failed to update user profile subscription status:",
            profileError,
          );
          // Don't throw - subscription is already activated, profile update is secondary
        }
      }

      console.log(
        "✅ Subscription activated successfully:",
        subscriptionId,
        `(${durationDays} days)`,
      );
      return { success: true, subscriptionId, durationDays };
    } catch (error) {
      console.error("❌ Subscription activation failed:", error);
      throw error;
    }
  },

  async createRefund(
    paymentId: string,
    amount?: number,
    reason?: string,
    refundedBy?: string,
  ) {
    const payment = await paymentsDB.getPayment(paymentId);

    const refund = await paymentsDB.createRefund({
      paymentId,
      amount,
      reason,
      refundedBy: refundedBy || "",
    });

    try {
      if (payment.gateway === "stripe" && payment.stripePaymentIntentId) {
        const stripeRefund = await stripeService.createRefund(
          payment.stripePaymentIntentId,
          amount,
          reason,
        );

        await paymentsDB.updateRefund(refund.id, {
          status: "succeeded",
          stripeRefundId: stripeRefund.id,
        });

        return {
          success: true,
          refund: await paymentsDB.getPayment(payment.id),
        };
      } else if (payment.gateway === "razorpay" && payment.razorpayPaymentId) {
        const razorpayRefund = await razorpayService.createRefund(
          payment.razorpayPaymentId,
          amount,
        );

        await paymentsDB.updateRefund(refund.id, {
          status: "succeeded",
          razorpayRefundId: razorpayRefund.id,
        });

        return {
          success: true,
          refund: await paymentsDB.getPayment(payment.id),
        };
      } else {
        throw new Error("Invalid payment gateway or payment ID");
      }
    } catch (error: any) {
      await paymentsAPI.updateRefund(refund.id, {
        status: "failed",
      });

      throw error;
    }
  },
};
