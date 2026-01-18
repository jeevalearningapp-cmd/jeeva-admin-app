import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { supabase } from "../lib/supabase.js";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

/**
 * GET /api/stripe-analytics/transactions
 * Get all Stripe transactions with filtering
 */
router.get("/transactions", async (req: Request, res: Response) => {
  try {
    const { limit = "50", startingAfter, endingBefore } = req.query;

    const params: any = {
      limit: Math.min(parseInt(limit as string), 100),
    };

    if (startingAfter) params.starting_after = startingAfter;
    if (endingBefore) params.ending_before = endingBefore;

    const paymentIntents = await stripe.paymentIntents.list(params);

    const transactions = paymentIntents.data.map((pi) => ({
      id: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency.toUpperCase(),
      status: pi.status,
      customer: pi.customer,
      description: pi.description,
      metadata: pi.metadata,
      created: new Date(pi.created * 1000).toISOString(),
      charges:
        pi.charges?.data?.map((charge) => ({
          id: charge.id,
          amount: charge.amount / 100,
          status: charge.status,
          paymentMethod: charge.payment_method_details?.type,
        })) || [],
    }));

    res.json({
      transactions,
      hasMore: paymentIntents.has_more,
      nextCursor: paymentIntents.data[paymentIntents.data.length - 1]?.id,
    });
  } catch (error: any) {
    console.error("❌ Error fetching Stripe transactions:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stripe-analytics/summary
 * Get payment summary (total revenue, successful, failed, etc)
 */
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const paymentIntents = await stripe.paymentIntents.list({ limit: 100 });

    const summary = {
      totalPayments: paymentIntents.data.length,
      totalRevenue: 0,
      successfulPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      refundedAmount: 0,
      averageAmount: 0,
    };

    for (const pi of paymentIntents.data) {
      const amount = pi.amount / 100;

      if (pi.status === "succeeded") {
        summary.successfulPayments++;
        summary.totalRevenue += amount;
      } else if (
        pi.status === "requires_payment_method" ||
        pi.status === "requires_action"
      ) {
        summary.pendingPayments++;
      } else if (pi.status === "canceled") {
        summary.failedPayments++;
      }

      // Get refunds
      if (pi.charges?.data) {
        for (const charge of pi.charges.data) {
          if (charge.refunded) {
            summary.refundedAmount += (charge.amount_refunded || 0) / 100;
          }
        }
      }
    }

    summary.averageAmount =
      summary.totalPayments > 0
        ? summary.totalRevenue / summary.totalPayments
        : 0;

    res.json(summary);
  } catch (error: any) {
    console.error("❌ Error fetching payment summary:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stripe-analytics/subscribers
 * Get active subscriber count and details
 */
router.get("/subscribers", async (req: Request, res: Response) => {
  try {
    // Get successful payments from Supabase (these represent active subscriptions)
    const { data: payments, error } = await supabase
      .from("payments")
      .select(
        "user_id, gateway, subscription_plan_id, final_amount, currency, created_at",
      )
      .eq("gateway", "stripe")
      .eq("status", "succeeded")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Group by user to get unique subscribers
    const subscriberMap = new Map();
    const totalRevenue = { INR: 0, USD: 0, GBP: 0 };

    for (const payment of payments) {
      if (!subscriberMap.has(payment.user_id)) {
        subscriberMap.set(payment.user_id, payment);
      }
      totalRevenue[payment.currency as keyof typeof totalRevenue] +=
        payment.final_amount;
    }

    const uniqueSubscribers = subscriberMap.size;

    // Get plan breakdown
    const planBreakdown: Record<string, number> = {};
    for (const payment of payments) {
      const planId = payment.subscription_plan_id || "unknown";
      planBreakdown[planId] = (planBreakdown[planId] || 0) + 1;
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
    });
  } catch (error: any) {
    console.error("❌ Error fetching subscribers:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stripe-analytics/revenue-by-country
 * Get revenue breakdown by country
 */
router.get("/revenue-by-country", async (req: Request, res: Response) => {
  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select("currency, final_amount, gateway, status")
      .eq("gateway", "stripe")
      .eq("status", "succeeded");

    if (error) throw error;

    const revenueByCountry = {
      IN: { currency: "INR", amount: 0, count: 0 },
      US: { currency: "USD", amount: 0, count: 0 },
      GB: { currency: "GBP", amount: 0, count: 0 },
    };

    for (const payment of payments) {
      let country = "US";
      if (payment.currency === "inr") country = "IN";
      else if (payment.currency === "gbp") country = "GB";

      revenueByCountry[country as keyof typeof revenueByCountry].amount +=
        payment.final_amount;
      revenueByCountry[country as keyof typeof revenueByCountry].count++;
    }

    res.json(revenueByCountry);
  } catch (error: any) {
    console.error("❌ Error fetching revenue by country:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stripe-analytics/presentment-summary
 * Get presentment currency distribution analytics for Stripe Adaptive Pricing
 *
 * Query params:
 * - range: Time range for analytics (default: "30d")
 *   Supported values: "7d", "30d", "90d", "365d"
 *
 * Requirements: 3.1, 3.2
 */
router.get("/presentment-summary", async (req: Request, res: Response) => {
  try {
    const { range = "30d" } = req.query;

    // Parse range to get date filter
    const rangeStr = String(range);
    const daysMatch = rangeStr.match(/^(\d+)d$/);
    const days = daysMatch ? parseInt(daysMatch[1], 10) : 30;

    // Calculate the start date based on range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Query payments with presentment data within the date range
    const { data: payments, error } = await supabase
      .from("payments")
      .select(
        "currency_charged_local, amount_charged_local, amount_charged_gbp",
      )
      .eq("gateway", "stripe")
      .eq("status", "succeeded")
      .gte("created_at", startDateStr)
      .not("currency_charged_local", "is", null);

    if (error) throw error;

    // If no payments with presentment data, return empty summary
    if (!payments || payments.length === 0) {
      return res.json({
        range: rangeStr,
        totalPayments: 0,
        byCurrency: [],
      });
    }

    // Group payments by currency and calculate statistics
    const currencyStats: Record<
      string,
      {
        count: number;
        totalLocalAmount: number;
        totalGbpAmount: number;
      }
    > = {};

    for (const payment of payments) {
      const currency =
        payment.currency_charged_local?.toUpperCase() || "UNKNOWN";
      const localAmount = parseFloat(payment.amount_charged_local) || 0;
      const gbpAmount = parseFloat(payment.amount_charged_gbp) || 0;

      if (!currencyStats[currency]) {
        currencyStats[currency] = {
          count: 0,
          totalLocalAmount: 0,
          totalGbpAmount: 0,
        };
      }

      currencyStats[currency].count++;
      currencyStats[currency].totalLocalAmount += localAmount;
      currencyStats[currency].totalGbpAmount += gbpAmount;
    }

    const totalPayments = payments.length;

    // Transform to response format with percentages and averages
    const byCurrency = Object.entries(currencyStats).map(
      ([currency, stats]) => ({
        currency,
        count: stats.count,
        percentage:
          totalPayments > 0
            ? Math.round((stats.count / totalPayments) * 10000) / 100
            : 0,
        averageLocalAmount:
          stats.count > 0
            ? Math.round((stats.totalLocalAmount / stats.count) * 100) / 100
            : 0,
        averageGbpAmount:
          stats.count > 0
            ? Math.round((stats.totalGbpAmount / stats.count) * 100) / 100
            : 0,
        totalLocalAmount: Math.round(stats.totalLocalAmount * 100) / 100,
        totalGbpAmount: Math.round(stats.totalGbpAmount * 100) / 100,
      }),
    );

    // Sort by count descending
    byCurrency.sort((a, b) => b.count - a.count);

    res.json({
      range: rangeStr,
      totalPayments,
      byCurrency,
    });
  } catch (error: any) {
    console.error("❌ Error fetching presentment summary:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stripe-analytics/coupon-presentment
 * Get coupon redemption analytics grouped by presentment currency.
 * Returns counts of coupon redemptions per currency per coupon.
 *
 * Requirements: 3.4, 6.3
 */
router.get("/coupon-presentment", async (req: Request, res: Response) => {
  try {
    // Step 1: Get all payments with discounts from our database
    // These are payments where a coupon was applied
    const { data: paymentsWithDiscounts, error: paymentsError } = await supabase
      .from("payments")
      .select(
        "id, stripe_checkout_session_id, currency_charged_local, discount_amount, metadata",
      )
      .eq("gateway", "stripe")
      .eq("status", "succeeded")
      .gt("discount_amount", 0)
      .not("stripe_checkout_session_id", "is", null);

    if (paymentsError) throw paymentsError;

    // If no payments with discounts, return empty response
    if (!paymentsWithDiscounts || paymentsWithDiscounts.length === 0) {
      return res.json({
        coupons: [],
        totalRedemptions: 0,
      });
    }

    // Step 2: Fetch checkout sessions from Stripe to get coupon codes
    // We need to retrieve each session to get the discount details
    const couponRedemptions: Map<string, Map<string, number>> = new Map();
    const couponDetails: Map<string, { id: string; code: string }> = new Map();

    // Process payments in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < paymentsWithDiscounts.length; i += batchSize) {
      const batch = paymentsWithDiscounts.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (payment) => {
          try {
            if (!payment.stripe_checkout_session_id) return;

            // Retrieve the checkout session with line items and discounts expanded
            const session = await stripe.checkout.sessions.retrieve(
              payment.stripe_checkout_session_id,
              {
                expand: ["total_details.breakdown.discounts", "discounts"],
              },
            );

            // Get the coupon code from the session
            // Discounts are applied via promotion codes in Checkout
            const discounts = (session as any).discounts || [];
            const totalDetailsDiscounts =
              (session as any).total_details?.breakdown?.discounts || [];

            // Try to get coupon info from discounts array
            let couponCode: string | null = null;
            let couponId: string | null = null;

            // Check discounts array (promotion codes)
            if (discounts.length > 0) {
              const discount = discounts[0];
              if (discount.promotion_code) {
                // Promotion code was used - get the coupon from it
                try {
                  const promoCode = await stripe.promotionCodes.retrieve(
                    discount.promotion_code as string,
                  );
                  couponId = promoCode.coupon.id;
                  couponCode = promoCode.code;
                } catch (e) {
                  // Fallback to coupon ID
                  couponId = discount.coupon?.id || "unknown";
                  couponCode = couponId;
                }
              } else if (discount.coupon) {
                couponId = discount.coupon.id || discount.coupon;
                couponCode = couponId;
              }
            }

            // Fallback: check total_details breakdown
            if (!couponCode && totalDetailsDiscounts.length > 0) {
              const discount = totalDetailsDiscounts[0];
              if (discount.discount?.coupon) {
                couponId =
                  discount.discount.coupon.id || discount.discount.coupon;
                couponCode = couponId;
              }
            }

            // If we found a coupon, record the redemption
            if (couponCode && couponId) {
              const currency =
                payment.currency_charged_local?.toUpperCase() || "GBP";

              // Store coupon details
              if (!couponDetails.has(couponId)) {
                couponDetails.set(couponId, { id: couponId, code: couponCode });
              }

              // Initialize coupon map if needed
              if (!couponRedemptions.has(couponId)) {
                couponRedemptions.set(couponId, new Map());
              }

              // Increment count for this currency
              const currencyMap = couponRedemptions.get(couponId)!;
              currencyMap.set(currency, (currencyMap.get(currency) || 0) + 1);
            }
          } catch (sessionError: any) {
            // Log but don't fail - session might have been deleted
            console.warn(
              `⚠️ Could not retrieve session ${payment.stripe_checkout_session_id}:`,
              sessionError.message,
            );
          }
        }),
      );
    }

    // Step 3: Transform to response format
    const coupons: Array<{
      couponId: string;
      code: string;
      redemptionsByCurrency: Array<{ currency: string; count: number }>;
      totalRedemptions: number;
    }> = [];

    let totalRedemptions = 0;

    for (const [couponId, currencyMap] of couponRedemptions) {
      const details = couponDetails.get(couponId);
      const redemptionsByCurrency: Array<{ currency: string; count: number }> =
        [];
      let couponTotal = 0;

      for (const [currency, count] of currencyMap) {
        redemptionsByCurrency.push({ currency, count });
        couponTotal += count;
      }

      // Sort by count descending
      redemptionsByCurrency.sort((a, b) => b.count - a.count);

      coupons.push({
        couponId,
        code: details?.code || couponId,
        redemptionsByCurrency,
        totalRedemptions: couponTotal,
      });

      totalRedemptions += couponTotal;
    }

    // Sort coupons by total redemptions descending
    coupons.sort((a, b) => b.totalRedemptions - a.totalRedemptions);

    res.json({
      coupons,
      totalRedemptions,
    });
  } catch (error: any) {
    console.error("❌ Error fetching coupon presentment analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stripe-analytics/revenue-by-currency
 * Get revenue breakdown by presentment currency for Stripe Adaptive Pricing.
 * Returns local currency totals and GBP equivalents for each presentment currency.
 *
 * Query params:
 * - range: Time range for analytics (default: "30d")
 *   Supported values: "7d", "30d", "90d", "365d", "all"
 *
 * Requirements: 9.1, 9.2
 */
router.get("/revenue-by-currency", async (req: Request, res: Response) => {
  try {
    const { range = "30d" } = req.query;

    // Parse range to get date filter
    const rangeStr = String(range);
    let startDateStr: string | null = null;

    if (rangeStr !== "all") {
      const daysMatch = rangeStr.match(/^(\d+)d$/);
      const days = daysMatch ? parseInt(daysMatch[1], 10) : 30;

      // Calculate the start date based on range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDateStr = startDate.toISOString();
    }

    // Build query for payments with presentment data
    let query = supabase
      .from("payments")
      .select(
        "currency_charged_local, amount_charged_local, amount_charged_gbp",
      )
      .eq("gateway", "stripe")
      .eq("status", "succeeded")
      .not("currency_charged_local", "is", null);

    // Apply date filter if not "all"
    if (startDateStr) {
      query = query.gte("created_at", startDateStr);
    }

    const { data: payments, error } = await query;

    if (error) throw error;

    // If no payments with presentment data, return empty response
    if (!payments || payments.length === 0) {
      return res.json({
        range: rangeStr,
        currencies: [],
        totalGbpRevenue: 0,
        totalTransactions: 0,
      });
    }

    // Group payments by currency and calculate totals
    const currencyStats: Record<
      string,
      {
        totalLocal: number;
        totalGbp: number;
        transactionCount: number;
      }
    > = {};

    let totalGbpRevenue = 0;

    for (const payment of payments) {
      const currency =
        payment.currency_charged_local?.toUpperCase() || "UNKNOWN";
      const localAmount = parseFloat(payment.amount_charged_local) || 0;
      const gbpAmount = parseFloat(payment.amount_charged_gbp) || 0;

      if (!currencyStats[currency]) {
        currencyStats[currency] = {
          totalLocal: 0,
          totalGbp: 0,
          transactionCount: 0,
        };
      }

      currencyStats[currency].totalLocal += localAmount;
      currencyStats[currency].totalGbp += gbpAmount;
      currencyStats[currency].transactionCount++;
      totalGbpRevenue += gbpAmount;
    }

    // Transform to response format
    const currencies = Object.entries(currencyStats).map(
      ([currency, stats]) => ({
        currency,
        totalLocal: Math.round(stats.totalLocal * 100) / 100,
        totalGbp: Math.round(stats.totalGbp * 100) / 100,
        transactionCount: stats.transactionCount,
      }),
    );

    // Sort by GBP total descending (highest revenue first)
    currencies.sort((a, b) => b.totalGbp - a.totalGbp);

    res.json({
      range: rangeStr,
      currencies,
      totalGbpRevenue: Math.round(totalGbpRevenue * 100) / 100,
      totalTransactions: payments.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching revenue by currency:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stripe-analytics/recent-payments
 * Get recent successful payments
 */
router.get("/recent-payments", async (req: Request, res: Response) => {
  try {
    const { limit = "20" } = req.query;

    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("gateway", "stripe")
      .eq("status", "succeeded")
      .order("created_at", { ascending: false })
      .limit(parseInt(limit as string));

    if (error) throw error;

    // Enrich with user info
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("full_name, email")
          .eq("user_id", payment.user_id)
          .single();

        return {
          id: payment.id,
          userId: payment.user_id,
          userName: profile?.full_name || "Unknown",
          userEmail: profile?.email,
          amount: payment.final_amount,
          currency: payment.currency,
          planId: payment.subscription_plan_id,
          createdAt: payment.created_at,
        };
      }),
    );

    res.json(enrichedPayments);
  } catch (error: any) {
    console.error("❌ Error fetching recent payments:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
