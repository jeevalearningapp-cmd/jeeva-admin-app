import { Router, Request, Response } from "express";
import Stripe from "stripe";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

/**
 * POST /api/stripe-deactivate/old-products
 * Deactivate old duplicate products (keep only latest 3)
 */
router.post("/old-products", async (req: Request, res: Response) => {
  try {
    const keepProductIds = [
      "prod_TW9ia1yVYrTLf9", // New Starter
      "prod_TW9iUXDnA340NL", // New Growth
      "prod_TW9ix6XY2ikEzJ", // New Ultimate
    ];

    const products = await stripe.products.list({ limit: 100 });
    const toDeactivate = products.data.filter(
      (p) => !keepProductIds.includes(p.id),
    );

    const results = [];

    for (const product of toDeactivate) {
      // Get all prices
      const prices = await stripe.prices.list({
        product: product.id,
        limit: 100,
      });

      // Deactivate all prices
      for (const price of prices.data) {
        if (price.active) {
          await stripe.prices.update(price.id, { active: false });
        }
      }

      // Deactivate product
      await stripe.products.update(product.id, { active: false });

      results.push({
        productId: product.id,
        productName: product.name,
        deactivated: true,
      });

      console.log(`✅ Deactivated old product: ${product.name}`);
    }

    res.json({
      success: true,
      message: `Deactivated ${results.length} old products`,
      results,
    });
  } catch (error: any) {
    console.error("❌ Error deactivating products:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
