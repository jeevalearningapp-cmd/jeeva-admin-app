import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { supabase } from "../lib/supabase.js";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia" as any,
});

/**
 * POST /api/sync-stripe-coupons
 * Sync all Stripe coupons to Supabase database
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const stripeCoupons = await stripe.coupons.list({ limit: 100 });

    const syncResults = {
      created: 0,
      updated: 0,
      errors: 0,
      total: stripeCoupons.data.length,
    };

    for (const stripeCoupon of stripeCoupons.data) {
      if (stripeCoupon.deleted) continue;

      try {
        // Check if coupon exists in Supabase
        const { data: existingCoupon } = await supabase
          .from("discount_coupons")
          .select("id")
          .eq("stripe_coupon_id", stripeCoupon.id)
          .single();

        const couponData = {
          code: stripeCoupon.id,
          description:
            stripeCoupon.metadata?.description || stripeCoupon.name || null,
          discount_type: stripeCoupon.percent_off
            ? "percentage"
            : "fixed_amount",
          discount_value:
            stripeCoupon.percent_off ||
            (stripeCoupon.amount_off ? stripeCoupon.amount_off / 100 : 0),
          currency: stripeCoupon.currency?.toUpperCase() || "USD",
          duration: stripeCoupon.duration as "once" | "repeating" | "forever",
          duration_in_months: stripeCoupon.duration_in_months || null,
          usage_limit: stripeCoupon.max_redemptions || null,
          times_redeemed: stripeCoupon.times_redeemed || 0,
          valid_from: new Date(stripeCoupon.created * 1000).toISOString(),
          valid_until: stripeCoupon.redeem_by
            ? new Date(stripeCoupon.redeem_by * 1000).toISOString()
            : null,
          is_active: stripeCoupon.valid,
          stripe_coupon_id: stripeCoupon.id,
          metadata: stripeCoupon.metadata || {},
          updated_at: new Date().toISOString(),
        };

        if (existingCoupon) {
          // Update existing coupon
          await supabase
            .from("discount_coupons")
            .update(couponData)
            .eq("id", existingCoupon.id);

          syncResults.updated++;
        } else {
          // Create new coupon
          await supabase.from("discount_coupons").insert([
            {
              ...couponData,
              created_at: new Date(stripeCoupon.created * 1000).toISOString(),
            },
          ]);

          syncResults.created++;
        }
      } catch (error) {
        console.error(`Error syncing coupon ${stripeCoupon.id}:`, error);
        syncResults.errors++;
      }
    }

    res.json({
      success: true,
      message: "Stripe coupons synced successfully",
      results: syncResults,
    });
  } catch (error: any) {
    console.error("❌ Error syncing Stripe coupons:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sync-stripe-coupons/:couponId
 * Sync a specific Stripe coupon to Supabase
 */
router.post("/:couponId", async (req: Request, res: Response) => {
  try {
    const { couponId } = req.params;

    const stripeCoupon = await stripe.coupons.retrieve(couponId);

    if (stripeCoupon.deleted) {
      return res.status(400).json({ error: "Coupon is deleted in Stripe" });
    }

    // Check if coupon exists in Supabase
    const { data: existingCoupon } = await supabase
      .from("discount_coupons")
      .select("id")
      .eq("stripe_coupon_id", stripeCoupon.id)
      .single();

    const couponData = {
      code: stripeCoupon.id,
      description:
        stripeCoupon.metadata?.description || stripeCoupon.name || null,
      discount_type: stripeCoupon.percent_off ? "percentage" : "fixed_amount",
      discount_value:
        stripeCoupon.percent_off ||
        (stripeCoupon.amount_off ? stripeCoupon.amount_off / 100 : 0),
      currency: stripeCoupon.currency?.toUpperCase() || "USD",
      duration: stripeCoupon.duration as "once" | "repeating" | "forever",
      duration_in_months: stripeCoupon.duration_in_months || null,
      usage_limit: stripeCoupon.max_redemptions || null,
      times_redeemed: stripeCoupon.times_redeemed || 0,
      valid_from: new Date(stripeCoupon.created * 1000).toISOString(),
      valid_until: stripeCoupon.redeem_by
        ? new Date(stripeCoupon.redeem_by * 1000).toISOString()
        : null,
      is_active: stripeCoupon.valid,
      stripe_coupon_id: stripeCoupon.id,
      metadata: stripeCoupon.metadata || {},
      updated_at: new Date().toISOString(),
    };

    if (existingCoupon) {
      // Update existing coupon
      await supabase
        .from("discount_coupons")
        .update(couponData)
        .eq("id", existingCoupon.id);

      res.json({
        success: true,
        message: "Coupon updated successfully",
        action: "updated",
      });
    } else {
      // Create new coupon
      await supabase.from("discount_coupons").insert([
        {
          ...couponData,
          created_at: new Date(stripeCoupon.created * 1000).toISOString(),
        },
      ]);

      res.json({
        success: true,
        message: "Coupon created successfully",
        action: "created",
      });
    }
  } catch (error: any) {
    console.error("❌ Error syncing Stripe coupon:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
