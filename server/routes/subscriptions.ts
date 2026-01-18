import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

/**
 * POST /api/subscriptions/validate-coupon
 * Validate a discount coupon code via Stripe API
 */
router.post("/validate-coupon", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        valid: false,
        error: "Missing code",
      });
    }

    // Validate via Stripe coupons - delegated to stripe-coupons endpoint
    // This is now handled by POST /api/stripe-coupons/validate
    res.status(410).json({
      error: "Deprecated: Use POST /api/stripe-coupons/validate instead",
      deprecated: true,
    });
  } catch (error) {
    console.error("❌ Error validating coupon:", error);
    res.status(500).json({
      valid: false,
      error: "Failed to validate coupon",
    });
  }
});

/**
 * GET /api/subscriptions/plans
 * Get all active subscription plans from Stripe
 */
router.get("/plans", async (req: Request, res: Response) => {
  try {
    // Plans are now managed through Stripe Admin API
    // This endpoint is deprecated - use /api/stripe-admin/prices instead
    res.status(410).json({
      error:
        "Deprecated: Use /api/stripe-admin/prices for Stripe-managed plans",
      deprecated: true,
    });
  } catch (error) {
    console.error("❌ Error fetching subscription plans:", error);
    res.status(500).json({
      error: "Failed to fetch subscription plans",
    });
  }
});

/**
 * GET /api/subscriptions/coupons
 * Get all active discount coupons (deprecated - use Stripe API)
 */
router.get("/coupons", async (req: Request, res: Response) => {
  try {
    res.status(410).json({
      error: "Deprecated: Use GET /api/stripe-coupons instead",
      deprecated: true,
    });
  } catch (error) {
    console.error("❌ Error fetching coupons:", error);
    res.status(500).json({
      error: "Failed to fetch coupons",
    });
  }
});

export default router;
