import React, { useState, useMemo } from "react";
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
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  FormHelperText,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  SearchOutlined as SearchIcon,
  AddOutlined as AddIcon,
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  RefreshOutlined as RefreshIcon,
  LocalOfferOutlined as CouponIcon,
  ContentCopyOutlined as CopyIcon,
  CheckCircleOutlined as CheckIcon,
  CancelOutlined as CancelIcon,
  SyncOutlined as SyncIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { PageLoader } from "@/components/common";
import { format } from "date-fns";
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from "@/hooks/useCoupons";
import {
  CreateCouponInput,
  UpdateCouponInput,
  DiscountCoupon,
} from "@/types/coupon";

interface CouponFormData {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: string;
  currency: string;
  duration: "once" | "repeating" | "forever";
  duration_in_months: string;
  usage_limit: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

const initialFormData: CouponFormData = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  currency: "USD",
  duration: "once",
  duration_in_months: "",
  usage_limit: "",
  valid_from: new Date().toISOString().split("T")[0],
  valid_until: "",
  is_active: true,
};

export const DiscountCouponsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(
    null,
  );
  const [formData, setFormData] = useState<CouponFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { enqueueSnackbar } = useSnackbar();

  // Fetch coupons with search filter
  const {
    data: coupons = [],
    isLoading,
    error,
    refetch,
  } = useCoupons({ search });
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  // Filter and paginate coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter(
      (coupon) =>
        coupon.code.toLowerCase().includes(search.toLowerCase()) ||
        (coupon.description &&
          coupon.description.toLowerCase().includes(search.toLowerCase())),
    );
  }, [coupons, search]);

  const paginatedCoupons = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredCoupons.slice(start, start + rowsPerPage);
  }, [filteredCoupons, page, rowsPerPage]);

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) errors.code = "Code is required";
    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      errors.discount_value = "Discount value must be greater than 0";
    }
    if (
      formData.discount_type === "percentage" &&
      parseFloat(formData.discount_value) > 100
    ) {
      errors.discount_value = "Percentage cannot exceed 100";
    }
    if (formData.discount_type === "fixed_amount" && !formData.currency) {
      errors.currency = "Currency is required for fixed amount discounts";
    }
    if (formData.duration === "repeating" && !formData.duration_in_months) {
      errors.duration_in_months =
        "Duration in months is required for repeating coupons";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingCoupon) {
        // Update existing coupon
        const updateInput: UpdateCouponInput = {
          description: formData.description || undefined,
          is_active: formData.is_active,
          usage_limit: formData.usage_limit
            ? parseInt(formData.usage_limit)
            : undefined,
          valid_until: formData.valid_until || undefined,
        };
        await updateCoupon.mutateAsync({
          id: editingCoupon.id,
          input: updateInput,
        });
      } else {
        // Create new coupon
        const createInput: CreateCouponInput = {
          code: formData.code.toUpperCase(),
          description: formData.description || undefined,
          discount_type: formData.discount_type,
          discount_value: parseFloat(formData.discount_value),
          currency:
            formData.discount_type === "fixed_amount"
              ? formData.currency
              : undefined,
          duration: formData.duration,
          duration_in_months:
            formData.duration === "repeating"
              ? parseInt(formData.duration_in_months)
              : undefined,
          usage_limit: formData.usage_limit
            ? parseInt(formData.usage_limit)
            : undefined,
          valid_from: formData.valid_from,
          valid_until: formData.valid_until || undefined,
          is_active: formData.is_active,
        };
        await createCoupon.mutateAsync(createInput);
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving coupon:", error);
    }
  };

  const handleAddClick = () => {
    setEditingCoupon(null);
    setFormData(initialFormData);
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleEditClick = (coupon: DiscountCoupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      currency: coupon.currency || "USD",
      duration: coupon.duration || "once",
      duration_in_months: coupon.duration_in_months?.toString() || "",
      usage_limit: coupon.usage_limit?.toString() || "",
      valid_from: coupon.valid_from.split("T")[0],
      valid_until: coupon.valid_until ? coupon.valid_until.split("T")[0] : "",
      is_active: coupon.is_active,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleDeleteClick = async (coupon: DiscountCoupon) => {
    if (
      !window.confirm(
        `Are you sure you want to delete coupon "${coupon.code}"?`,
      )
    )
      return;

    try {
      await deleteCoupon.mutateAsync(coupon.id);
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCoupon(null);
    setFormData(initialFormData);
    setFormErrors({});
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    enqueueSnackbar("Coupon code copied to clipboard", { variant: "success" });
  };

  const handleSyncStripe = async () => {
    try {
      const response = await fetch("/api/sync-stripe-coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Sync failed");

      const result = await response.json();
      enqueueSnackbar(
        `Synced ${result.results.total} coupons (${result.results.created} created, ${result.results.updated} updated)`,
        { variant: "success" },
      );
      refetch();
    } catch (error) {
      console.error("Error syncing Stripe coupons:", error);
      enqueueSnackbar("Failed to sync Stripe coupons", { variant: "error" });
    }
  };

  const formatDiscountValue = (coupon: DiscountCoupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}%`;
    }
    return `${coupon.currency} ${coupon.discount_value.toFixed(2)}`;
  };

  const getStatusColor = (
    coupon: DiscountCoupon,
  ): "success" | "error" | "warning" | "default" => {
    if (!coupon.is_active) return "default";
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date())
      return "error";
    if (coupon.usage_limit && coupon.times_redeemed >= coupon.usage_limit)
      return "warning";
    return "success";
  };

  const getStatusLabel = (coupon: DiscountCoupon): string => {
    if (!coupon.is_active) return "Inactive";
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date())
      return "Expired";
    if (coupon.usage_limit && coupon.times_redeemed >= coupon.usage_limit)
      return "Limit Reached";
    return "Active";
  };

  if (isLoading) return <PageLoader />;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ mb: 0.5 }}>
            Discount Coupons
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage discount codes and promotional offers
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Tooltip title="Sync from Stripe">
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
              onClick={handleSyncStripe}
              color="secondary"
            >
              Sync Stripe
            </Button>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Create Coupon
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || "Failed to load coupons"}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Coupons
              </Typography>
              <Typography variant="h4">{coupons.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Active Coupons
              </Typography>
              <Typography variant="h4">
                {coupons.filter((c) => c.is_active).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Redemptions
              </Typography>
              <Typography variant="h4">
                {coupons.reduce((sum, c) => sum + c.times_redeemed, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Expired Coupons
              </Typography>
              <Typography variant="h4">
                {
                  coupons.filter(
                    (c) =>
                      c.valid_until && new Date(c.valid_until) < new Date(),
                  ).length
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Table */}
      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by code or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="center">Usage</TableCell>
                <TableCell>Valid Until</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="textSecondary">
                      {search
                        ? "No coupons found matching your search"
                        : "No coupons created yet"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCoupons.map((coupon) => (
                  <TableRow key={coupon.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace", fontWeight: 600 }}
                        >
                          {coupon.code}
                        </Typography>
                        <Tooltip title="Copy code">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyCode(coupon.code)}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {coupon.description || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatDiscountValue(coupon)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {coupon.duration || "Once"}
                        {coupon.duration === "repeating" &&
                          coupon.duration_in_months &&
                          ` (${coupon.duration_in_months}mo)`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {coupon.times_redeemed}
                        {coupon.usage_limit
                          ? ` / ${coupon.usage_limit}`
                          : " / ∞"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {coupon.valid_until
                          ? format(new Date(coupon.valid_until), "MMM dd, yyyy")
                          : "No expiry"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(coupon)}
                        color={getStatusColor(coupon)}
                        size="small"
                        icon={
                          coupon.is_active &&
                          getStatusColor(coupon) === "success" ? (
                            <CheckIcon />
                          ) : (
                            <CancelIcon />
                          )
                        }
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
                            onClick={() => handleEditClick(coupon)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(coupon)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredCoupons.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Coupon Code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              error={!!formErrors.code}
              helperText={
                formErrors.code || "Unique code for the coupon (e.g., SAVE20)"
              }
              disabled={!!editingCoupon}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              helperText="Optional description for internal reference"
              multiline
              rows={2}
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value as any,
                      })
                    }
                    label="Discount Type"
                    disabled={!!editingCoupon}
                  >
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="fixed_amount">Fixed Amount</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Discount Value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_value: e.target.value })
                  }
                  error={!!formErrors.discount_value}
                  helperText={
                    formErrors.discount_value ||
                    (formData.discount_type === "percentage"
                      ? "Enter percentage (1-100)"
                      : "Enter amount")
                  }
                  disabled={!!editingCoupon}
                  required
                  fullWidth
                  InputProps={{
                    endAdornment:
                      formData.discount_type === "percentage"
                        ? "%"
                        : formData.currency,
                  }}
                />
              </Grid>
            </Grid>

            {formData.discount_type === "fixed_amount" && (
              <FormControl fullWidth required>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  label="Currency"
                  disabled={!!editingCoupon}
                >
                  <MenuItem value="USD">USD - US Dollar</MenuItem>
                  <MenuItem value="GBP">GBP - British Pound</MenuItem>
                  <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                  <MenuItem value="EUR">EUR - Euro</MenuItem>
                </Select>
              </FormControl>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Duration</InputLabel>
                  <Select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: e.target.value as any,
                      })
                    }
                    label="Duration"
                    disabled={!!editingCoupon}
                  >
                    <MenuItem value="once">Once</MenuItem>
                    <MenuItem value="repeating">Repeating</MenuItem>
                    <MenuItem value="forever">Forever</MenuItem>
                  </Select>
                  <FormHelperText>How long the discount applies</FormHelperText>
                </FormControl>
              </Grid>

              {formData.duration === "repeating" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Duration in Months"
                    type="number"
                    value={formData.duration_in_months}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_in_months: e.target.value,
                      })
                    }
                    error={!!formErrors.duration_in_months}
                    helperText={
                      formErrors.duration_in_months ||
                      "Number of months to repeat"
                    }
                    disabled={!!editingCoupon}
                    required
                    fullWidth
                  />
                </Grid>
              )}
            </Grid>

            <TextField
              label="Usage Limit"
              type="number"
              value={formData.usage_limit}
              onChange={(e) =>
                setFormData({ ...formData, usage_limit: e.target.value })
              }
              helperText="Maximum number of times this coupon can be used (leave empty for unlimited)"
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Valid From"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_from: e.target.value })
                  }
                  disabled={!!editingCoupon}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Valid Until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_until: e.target.value })
                  }
                  helperText="Leave empty for no expiry"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createCoupon.isPending || updateCoupon.isPending}
          >
            {editingCoupon ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DiscountCouponsPage;
