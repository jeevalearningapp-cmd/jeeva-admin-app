import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Send, Email, CheckCircle } from "@mui/icons-material";
import { emailAPI } from "@/api/email";

export const EmailTestPage: React.FC = () => {
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setResult({ success: false, message: "Please enter an email address" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      await emailAPI.sendTestEmail(testEmail);
      setResult({
        success: true,
        message: "Test email sent successfully! Check your inbox.",
      });
      setTestEmail("");
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Failed to send test email",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          📧 Email System Testing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test your Brevo email integration and send sample emails
        </Typography>
      </Box>

      {result && (
        <Alert severity={result.success ? "success" : "error"} sx={{ mb: 3 }}>
          {result.message}
        </Alert>
      )}

      <Card sx={{ maxWidth: 600, mx: "auto" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Send sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">Quick Test Email</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Send a simple test email to verify your Brevo integration is working
          </Typography>

          <TextField
            fullWidth
            label="Your Email Address"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your@email.com"
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSendTestEmail}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          >
            {loading ? "Sending..." : "Send Test Email"}
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Note:</strong> Make sure your Brevo account is verified and
            you're using a verified sender email domain. The API server must be
            running on port 3001 for these tests to work.
          </Typography>
        </Alert>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Alert severity="success">
          <Typography variant="body2">
            <strong>✅ Email Templates Available:</strong>
          </Typography>
          <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
            <li>Welcome Email (POST /api/email/welcome)</li>
            <li>
              Subscription Confirmation (POST
              /api/email/subscription-confirmation)
            </li>
            <li>Test Email (POST /api/email/test)</li>
          </ul>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Use the API endpoints directly or integrate them into your
            application logic.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default EmailTestPage;
