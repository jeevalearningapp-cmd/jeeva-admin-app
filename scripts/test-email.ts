import { emailService } from "../server/services/emailService";
import dotenv from "dotenv";
import path from "path";

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testEmail() {
  const recipient = process.argv[2];

  if (!recipient) {
    console.error(
      "❌ Please provide a recipient email address: npx tsx scripts/test-email.ts your@email.com",
    );
    process.exit(1);
  }

  console.log(`🧪 Attempting to send test email to: ${recipient}...`);

  try {
    const result = await emailService.sendEmail({
      to: recipient,
      subject: "🚀 Jeeva Learning - Brevo Integration Test",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #007aff;">Email System Active!</h2>
          <p>This is a successful test of the <strong>Brevo</strong> integration for Jeeva Learning.</p>
          <p><strong>Sender:</strong> ${process.env.FROM_EMAIL || "Not Set"}</p>
          <p><strong>Method:</strong> API / SMTP</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">This email was triggered manually via script.</p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully!");
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Failed to send email:");
    console.error(error);
  }
}

testEmail();
