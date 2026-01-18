import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import {
  SendOutlined,
  PeopleOutlined,
  NotificationsOutlined,
} from "@mui/icons-material";
import {
  useSendDirectPush,
  useUserTargetingOptions,
} from "@/hooks/useNotifications";

/**
 * In-App Notification Tab
 * Sends notifications directly to device storage without triggering system notifications
 * Users will only see these in the app's Notifications tab
 */
export const InAppNotificationTab: React.FC = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetingType, setTargetingType] = useState<string>("all");
  const [lastResult, setLastResult] = useState<{
    sent: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const { data: targetingOptions, isLoading: loadingOptions } =
    useUserTargetingOptions();
  const directPushMutation = useSendDirectPush();

  const handleSendInApp = () => {
    if (!title || !body) {
      return;
    }

    const audienceFilter = getAudienceFilter();

    // Send with silent: true to prevent system notification
    directPushMutation.mutate(
      {
        title,
        body,
        imageUrl: imageUrl || undefined,
        audienceFilter,
        data: {
          type: "in_app",
          silent: true, // This tells the device not to show system notification
        },
      },
      {
        onSuccess: (result) => {
          setLastResult(result);
          if (result.sent > 0) {
            // Clear form on success
            setTitle("");
            setBody("");
            setImageUrl("");
            setTargetingType("all");
          }
        },
      },
    );
  };

  const getAudienceFilter = () => {
    if (targetingType === "all") {
      return { type: "all" as const };
    }

    if (targetingType.startsWith("subscription_")) {
      const planName = targetingType.replace("subscription_", "");
      return {
        type: "subscription_tier" as const,
        subscriptionTier: planName,
      };
    }

    if (targetingType === "active_30_days") {
      return { type: "active_users" as const };
    }

    return { type: "all" as const };
  };

  const getRecipientCount = () => {
    if (loadingOptions || !targetingOptions) return 0;
    const option = targetingOptions.find((opt) => {
      if (targetingType === "all") return opt.id === "all";
      return opt.id === targetingType;
    });
    return option?.count || 0;
  };

  const isFormValid = title && body;
  const isPending = directPushMutation.isPending;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Send In-App Notification
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Send notifications that appear only in the app's Notifications tab (no
        system notification)
      </Typography>
      <Divider sx={{ my: 3 }} />

      <Stack spacing={3}>
        <TextField
          label="Notification Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          placeholder="New course available!"
          inputProps={{ maxLength: 65 }}
          helperText={`${title.length}/65 characters`}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
        />

        <TextField
          label="Message Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          fullWidth
          required
          multiline
          rows={4}
          placeholder="Check out our new advanced nursing course in the Learning tab."
          inputProps={{ maxLength: 240 }}
          helperText={`${body.length}/240 characters`}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
        />

        <TextField
          label="Image URL (Optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          fullWidth
          placeholder="https://example.com/image.jpg"
          helperText="Image will be displayed in the notification"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
        />

        <FormControl fullWidth>
          <InputLabel>Target Audience</InputLabel>
          <Select
            value={targetingType}
            onChange={(e) => setTargetingType(e.target.value)}
            label="Target Audience"
            sx={{ borderRadius: 0 }}
          >
            {loadingOptions ? (
              <MenuItem value="all">Loading...</MenuItem>
            ) : (
              targetingOptions?.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <span>{option.label}</span>
                    <Chip label={`${option.count} users`} size="small" />
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <Paper sx={{ p: 2, bgcolor: "grey.50", borderRadius: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PeopleOutlined color="primary" />
            <Typography variant="body2" color="text.secondary">
              This notification will be sent to{" "}
              <strong>{getRecipientCount()} users</strong>
            </Typography>
          </Box>
        </Paper>

        <Alert
          severity="info"
          sx={{ borderRadius: 0 }}
          icon={<NotificationsOutlined />}
        >
          <Typography variant="body2">
            <strong>In-App Only:</strong> These notifications appear only in the
            app's Notifications tab. Users won't receive a system notification
            sound or banner. Use this for non-urgent updates.
          </Typography>
        </Alert>

        {lastResult && (
          <Alert
            severity={lastResult.sent > 0 ? "success" : "warning"}
            sx={{ borderRadius: 0 }}
            onClose={() => setLastResult(null)}
          >
            <Typography variant="body2">
              <strong>Last send:</strong> {lastResult.sent} delivered,{" "}
              {lastResult.failed} failed
              {lastResult.errors.length > 0 && (
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    mt: 1,
                    fontSize: "0.85em",
                    opacity: 0.8,
                  }}
                >
                  {lastResult.errors.slice(0, 3).join(", ")}
                  {lastResult.errors.length > 3 &&
                    ` and ${lastResult.errors.length - 3} more...`}
                </Box>
              )}
            </Typography>
          </Alert>
        )}

        {!isFormValid && (
          <Alert severity="info" sx={{ borderRadius: 0 }}>
            Please fill in the title and message body to send a notification
          </Alert>
        )}

        <Button
          variant="contained"
          size="large"
          startIcon={<SendOutlined />}
          onClick={handleSendInApp}
          disabled={!isFormValid || isPending}
          sx={{ borderRadius: 0 }}
        >
          {isPending ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
              Sending to Devices...
            </>
          ) : (
            "Send In-App Notification"
          )}
        </Button>
      </Stack>
    </Box>
  );
};
