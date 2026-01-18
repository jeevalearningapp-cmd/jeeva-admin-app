import React from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  CheckCircleOutlined,
  CancelOutlined,
  NotificationsActiveOutlined,
  EmailOutlined,
  PersonAddOutlined,
  DoneOutlined,
  CloseOutlined,
  CalendarTodayOutlined,
  AutorenewOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import { useSettings } from "@/hooks/useSettings";
import { useNavigate } from "react-router-dom";

interface AutomationRule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  trigger: string;
}

export const AutomationTab: React.FC = () => {
  const { settings, isLoading } = useSettings();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const automationRules: AutomationRule[] = [
    {
      id: "new_user_signup",
      title: "Welcome New Users",
      description: "Send a welcome notification when a new user signs up",
      icon: <PersonAddOutlined />,
      enabled: settings?.newUserSignup ?? false,
      trigger: "User Registration",
    },
    {
      id: "content_submitted",
      title: "Content Submitted",
      description: "Notify admins when new content is submitted for review",
      icon: <NotificationsActiveOutlined />,
      enabled: settings?.contentSubmitted ?? false,
      trigger: "Content Submission",
    },
    {
      id: "content_approved",
      title: "Content Approved",
      description: "Notify users when their content is approved",
      icon: <DoneOutlined />,
      enabled: settings?.contentApproved ?? false,
      trigger: "Content Approval",
    },
    {
      id: "content_rejected",
      title: "Content Rejected",
      description: "Notify users when their content is rejected",
      icon: <CloseOutlined />,
      enabled: settings?.contentRejected ?? false,
      trigger: "Content Rejection",
    },
    {
      id: "subscription_expiring",
      title: "Subscription Expiring",
      description: "Notify users 7, 3, and 1 day before subscription expires",
      icon: <CalendarTodayOutlined />,
      enabled: settings?.subscriptionExpiring ?? false,
      trigger: "Subscription Status Check",
    },
    {
      id: "subscription_renewed",
      title: "Subscription Renewed",
      description: "Send confirmation when subscription is renewed",
      icon: <AutorenewOutlined />,
      enabled: settings?.subscriptionRenewed ?? false,
      trigger: "Subscription Renewal",
    },
  ];

  const enabledCount = automationRules.filter((rule) => rule.enabled).length;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Automated Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Configure automatic notifications triggered by platform events
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {enabledCount} of {automationRules.length} automation rules are
              active
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage automation settings in Platform Settings → Notifications
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsOutlined />}
            onClick={() => navigate("/settings")}
            sx={{ borderRadius: 0 }}
          >
            Settings
          </Button>
        </Box>
      </Alert>

      <Stack spacing={2}>
        {automationRules.map((rule) => (
          <Paper key={rule.id} sx={{ borderRadius: 0 }}>
            <ListItem>
              <ListItemIcon>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: rule.enabled ? "success.light" : "grey.200",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: rule.enabled ? "success.dark" : "grey.600",
                  }}
                >
                  {rule.icon}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1" fontWeight={500}>
                      {rule.title}
                    </Typography>
                    <Chip
                      icon={
                        rule.enabled ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CancelOutlined />
                        )
                      }
                      label={rule.enabled ? "Active" : "Disabled"}
                      color={rule.enabled ? "success" : "default"}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {rule.description}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      {settings?.pushNotifications ? (
                        <Chip
                          icon={<NotificationsActiveOutlined />}
                          label="Push"
                          size="small"
                          variant="outlined"
                        />
                      ) : null}
                      {settings?.emailNotifications ? (
                        <Chip
                          icon={<EmailOutlined />}
                          label="Email"
                          size="small"
                          variant="outlined"
                        />
                      ) : null}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: "auto" }}
                      >
                        Trigger: {rule.trigger}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Alert severity="warning" sx={{ borderRadius: 0 }}>
        <Typography variant="body2" fontWeight={500} gutterBottom>
          Note: Automation Features Coming Soon
        </Typography>
        <Typography variant="caption">
          The automation rules are displayed here for visibility. To activate
          them, you'll need to:
          <br />
          1. Create Supabase Edge Functions to handle the triggers
          <br />
          2. Set up database triggers or cron jobs for scheduled checks
          <br />
          3. Configure notification templates for each rule
          <br />
          <br />
          These settings control whether automated notifications can be sent.
          The actual automation logic will be implemented in Phase 4 (Supabase
          Edge Functions).
        </Typography>
      </Alert>
    </Box>
  );
};
