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
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  VisibilityOutlined,
  DeleteOutlined,
  PendingActionsOutlined,
  ThumbUpOutlined,
  ThumbDownOutlined,
} from "@mui/icons-material";
import { PageLoader } from "@/components/common";
import {
  useApprovals,
  useApprovalStats,
  useReviewApproval,
  useDeleteApproval,
} from "@/hooks";
import { ContentApproval, ApprovalStatus, ResourceType } from "@/types";
import { useAuth } from "@/context";
import { format } from "date-fns";

export const ApprovalsPage: React.FC = () => {
  const { adminUser } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    ApprovalStatus | "all"
  >("all");
  const [typeFilter, setTypeFilter] = React.useState<ResourceType | "all">(
    "all",
  );
  const [selectedApproval, setSelectedApproval] =
    React.useState<ContentApproval | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [reviewComments, setReviewComments] = React.useState("");
  const [initialLoad, setInitialLoad] = React.useState(true);

  const {
    data: approvals,
    isLoading,
    error,
  } = useApprovals({
    status: statusFilter,
    resourceType: typeFilter,
    search: searchQuery,
  });

  const { data: stats } = useApprovalStats();
  const reviewMutation = useReviewApproval();
  const deleteMutation = useDeleteApproval();

  React.useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isLoading, initialLoad]);

  const handleOpenDialog = (approval: ContentApproval) => {
    setSelectedApproval(approval);
    setReviewComments(approval.reviewComments || "");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedApproval(null);
    setReviewComments("");
  };

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedApproval || !adminUser) return;

    try {
      await reviewMutation.mutateAsync({
        id: selectedApproval.id,
        status,
        reviewComments: reviewComments.trim() || undefined,
        reviewedBy: adminUser.id,
      });
      handleCloseDialog();
    } catch (error) {
      console.error("Review error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this approval request?")
    ) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getStatusColor = (
    status: ApprovalStatus,
  ): "warning" | "success" | "error" => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  const getTypeLabel = (type: ResourceType): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLoading && initialLoad) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Content Approvals
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load approvals. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Content Approvals
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 3,
            mt: 1,
          }}
        >
          <Card sx={{ bgcolor: "#FFF7ED", borderRadius: "16px" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PendingActionsOutlined sx={{ color: "#F59E0B" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.pending}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: "#ECFDF5", borderRadius: "16px" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircleOutlined sx={{ color: "#10B981" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.approved}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: "#FEF2F2", borderRadius: "16px" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CancelOutlined sx={{ color: "#EF4444" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.rejected}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: "#F3F4F6", borderRadius: "16px" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <VisibilityOutlined sx={{ color: "#6B7280" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: "16px" }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 200, borderRadius: "12px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ApprovalStatus | "all")
              }
              label="Status"
              sx={{ borderRadius: "12px" }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as ResourceType | "all")
              }
              label="Type"
              sx={{ borderRadius: "12px" }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="module">Module</MenuItem>
              <MenuItem value="topic">Topic</MenuItem>
              <MenuItem value="lesson">Lesson</MenuItem>
              <MenuItem value="question">Question</MenuItem>
              <MenuItem value="flashcard">Flashcard</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Approvals Table */}
      <TableContainer component={Paper} sx={{ borderRadius: "16px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Content</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted By</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Reviewed By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {approvals?.map((approval) => (
              <TableRow key={approval.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {approval.resourceTitle}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getTypeLabel(approval.resourceType)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={approval.status.toUpperCase()}
                    color={getStatusColor(approval.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{approval.submittedByName || "Unknown"}</TableCell>
                <TableCell>
                  {format(new Date(approval.createdAt), "MMM dd, yyyy HH:mm")}
                </TableCell>
                <TableCell>{approval.reviewedByName || "-"}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(approval)}
                    sx={{ mr: 1 }}
                  >
                    <VisibilityOutlined fontSize="small" />
                  </IconButton>
                  {approval.status === "pending" &&
                    adminUser?.role === "superadmin" && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(approval.id)}
                        color="error"
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    )}
                </TableCell>
              </TableRow>
            ))}
            {(!approvals || approvals.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ||
                    statusFilter !== "all" ||
                    typeFilter !== "all"
                      ? "No approval requests found matching your filters."
                      : "No approval requests yet."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Review Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Review Content - {selectedApproval?.resourceTitle}
        </DialogTitle>
        <DialogContent>
          {selectedApproval && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Content Type
                </Typography>
                <Typography variant="body1">
                  {getTypeLabel(selectedApproval.resourceType)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current Status
                </Typography>
                <Chip
                  label={selectedApproval.status.toUpperCase()}
                  color={getStatusColor(selectedApproval.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Submitted By
                </Typography>
                <Typography variant="body1">
                  {selectedApproval.submittedByName || "Unknown"}
                </Typography>
              </Box>
              {selectedApproval.reviewedByName && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Reviewed By
                  </Typography>
                  <Typography variant="body1">
                    {selectedApproval.reviewedByName}
                  </Typography>
                </Box>
              )}
              <TextField
                label="Review Comments"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                multiline
                rows={4}
                fullWidth
                placeholder="Add your review comments here..."
                disabled={selectedApproval.status !== "pending"}
              />
              {selectedApproval.reviewComments &&
                selectedApproval.status !== "pending" && (
                  <Alert severity="info">
                    Previous Review: {selectedApproval.reviewComments}
                  </Alert>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: "12px" }}>
            Close
          </Button>
          {selectedApproval?.status === "pending" && (
            <>
              <Button
                onClick={() => handleReview("rejected")}
                variant="outlined"
                color="error"
                startIcon={<ThumbDownOutlined />}
                disabled={reviewMutation.isPending}
                sx={{ borderRadius: "12px" }}
              >
                {reviewMutation.isPending ? "Rejecting..." : "Reject"}
              </Button>
              <Button
                onClick={() => handleReview("approved")}
                variant="contained"
                color="success"
                startIcon={<ThumbUpOutlined />}
                disabled={reviewMutation.isPending}
                sx={{ borderRadius: "12px" }}
              >
                {reviewMutation.isPending ? "Approving..." : "Approve"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalsPage;
