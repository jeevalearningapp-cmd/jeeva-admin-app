import express from "express";
import cors from "cors";
import emailRoutes from "./routes/email.js";
import chatRoutes from "./routes/chat.js";
import paymentRoutes from "./routes/payments.js";
import notificationRoutes from "./routes/notifications.js";
import countryRoutes from "./routes/country.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import stripeAdminRoutes from "./routes/stripe-admin.js";
import stripeCouponsRoutes from "./routes/stripe-coupons.js";
import stripeCleanupRoutes from "./routes/stripe-cleanup.js";
import stripeDeactivateRoutes from "./routes/stripe-deactivate.js";
import stripeAnalyticsRoutes from "./routes/stripe-analytics.js";
import { notificationService } from "./services/notifications.js";

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());

app.use("/api/payments/webhooks/stripe", express.raw({ type: "application/json" }));
app.use("/api/payments/webhooks/razorpay", express.json());

app.use(express.json());

app.use("/api/email", emailRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/country", countryRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/stripe-admin", stripeAdminRoutes);
app.use("/api/stripe-coupons", stripeCouponsRoutes);
app.use("/api/stripe-cleanup", stripeCleanupRoutes);
app.use("/api/stripe-deactivate", stripeDeactivateRoutes);
app.use("/api/stripe-analytics", stripeAnalyticsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API server running (Email + AI Chat + Payments + Notifications + Country Detection)" });
});

// Start notification queue processor (runs every 2 minutes)
setInterval(async () => {
  try {
    await notificationService.processNotificationQueue();
  } catch (error) {
    console.error("Error in notification queue processor:", error);
  }
}, 2 * 60 * 1000); // 2 minutes

// Check receipt status every 5 minutes
setInterval(async () => {
  try {
    await notificationService.checkReceiptStatus();
  } catch (error) {
    console.error("Error checking receipt status:", error);
  }
}, 5 * 60 * 1000); // 5 minutes

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API server running on port ${PORT}`);
  console.log(`   - Email API: /api/email`);
  console.log(`   - Chat API: /api/chat`);
  console.log(`   - Payment API: /api/payments`);
  console.log(`   - Notifications API: /api/notifications`);
  console.log(`   - Country API: /api/country`);
  console.log(`   - Subscriptions API: /api/subscriptions`);
  console.log(`   - Stripe Admin API: /api/stripe-admin`);
  console.log(`   - Stripe Coupons API: /api/stripe-coupons`);
  console.log(`\n🔔 Push notification service started`);
  console.log(`   - Queue processor: every 2 minutes`);
  console.log(`   - Receipt checker: every 5 minutes`);
});
