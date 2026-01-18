import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export const emailService = {
  /**
   * Send email using Brevo SMTP
   */
  async sendEmail(params: SendEmailParams) {
    const {
      BREVO_SMTP_SERVER,
      BREVO_SMTP_PORT,
      BREVO_SMTP_LOGIN,
      BREVO_SMTP_KEY,
      BREVO_API_KEY,
      FROM_EMAIL = "noreply@jeevalearning.com",
      FROM_NAME = "Jeeva Learning",
    } = process.env;

    // Map to Brevo API if API Key is present (often more reliable)
    if (BREVO_API_KEY) {
      try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            accept: "application/json",
            "api-key": BREVO_API_KEY,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: FROM_NAME, email: FROM_EMAIL },
            to: (Array.isArray(params.to) ? params.to : [params.to]).map(
              (email) => ({ email }),
            ),
            subject: params.subject,
            htmlContent: params.html,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Brevo API Error");
        }

        return await response.json();
      } catch (error) {
        console.warn("Brevo API failed, falling back to SMTP...", error);
      }
    }

    // Fallback or Primary: SMTP
    if (!BREVO_SMTP_SERVER || !BREVO_SMTP_LOGIN || !BREVO_SMTP_KEY) {
      throw new Error(
        "Email service not configured. Missing BREVO environment variables.",
      );
    }

    const transporter = nodemailer.createTransport({
      host: BREVO_SMTP_SERVER,
      port: parseInt(BREVO_SMTP_PORT || "587"),
      secure: BREVO_SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: BREVO_SMTP_LOGIN,
        pass: BREVO_SMTP_KEY,
      },
    });

    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: Array.isArray(params.to) ? params.to.join(", ") : params.to,
      subject: params.subject,
      html: params.html,
    });

    return info;
  },
};
