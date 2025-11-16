import express from "express";
import cors from "cors";
import emailRoutes from "./routes/email.js";
import chatRoutes from "./routes/chat.js";
import paymentRoutes from "./routes/payments.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use("/api/payments/webhooks/stripe", express.raw({ type: "application/json" }));
app.use("/api/payments/webhooks/razorpay", express.json());

app.use(express.json());

app.use("/api/email", emailRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API server running (Email + AI Chat + Payments)" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API server running on port ${PORT}`);
  console.log(`   - Email API: /api/email`);
  console.log(`   - Chat API: /api/chat`);
  console.log(`   - Payment API: /api/payments`);
});
