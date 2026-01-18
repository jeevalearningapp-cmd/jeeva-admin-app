import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CurrencyPound as CurrencyPoundIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { PageLoader } from "@/components/common";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";

export const SubscriptionPlansPage: React.FC = () => {
  const {
    data: plans = [],
    isLoading: loading,
    error,
    refetch,
  } = useSubscriptionPlans();
  const { enqueueSnackbar } = useSnackbar();

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    enqueueSnackbar("Refreshing subscription plans...", { variant: "info" });
  };

  // Format price
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  // Get billing cycle label
  const getBillingCycleLabel = (cycle: string): string => {
    if (cycle === "monthly") return "Monthly";
    if (cycle === "yearly") return "Yearly";
    if (cycle === "lifetime") return "Lifetime";
    return cycle;
  };

  // Get tier color
  const getTierColor = (
    name: string,
  ): "default" | "primary" | "secondary" | "success" | "warning" | "info" => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("starter") || lowerName.includes("basic"))
      return "info";
    if (lowerName.includes("growth") || lowerName.includes("pro"))
      return "primary";
    if (lowerName.includes("ultimate") || lowerName.includes("premium"))
      return "success";
    return "default";
  };

  if (loading) return <PageLoader />;

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Subscription Plans
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage subscription plans and pricing tiers for your application.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>
              enqueueSnackbar("Add plan feature coming soon", {
                variant: "info",
              })
            }
          >
            Add Plan
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || "Failed to load subscription plans"}
        </Alert>
      )}

      {/* Subscription Plans Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <CurrencyPoundIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6">Subscription Plans</Typography>
        </Box>

        {plans.length === 0 && !loading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              No subscription plans found. Create your first plan to get
              started.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() =>
                enqueueSnackbar("Add plan feature coming soon", {
                  variant: "info",
                })
              }
            >
              Create First Plan
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>Plan Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Price (USD)</TableCell>
                  <TableCell>Billing Cycle</TableCell>
                  <TableCell>Features</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>
                      <Chip
                        label={plan.name}
                        color={getTierColor(plan.name)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 400 }}>
                        {plan.description || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", fontWeight: 600 }}
                      >
                        {formatPrice(plan.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getBillingCycleLabel(plan.billingCycle)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {plan.features.slice(0, 3).map((feature, idx) => (
                          <Chip
                            key={idx}
                            label={feature}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        ))}
                        {plan.features.length > 3 && (
                          <Chip
                            label={`+${plan.features.length - 3} more`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plan.isActive ? "Active" : "Inactive"}
                        color={plan.isActive ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() =>
                              enqueueSnackbar("Edit feature coming soon", {
                                variant: "info",
                              })
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              enqueueSnackbar("Delete feature coming soon", {
                                variant: "info",
                              })
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default SubscriptionPlansPage;
