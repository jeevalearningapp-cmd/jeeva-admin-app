import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  InputAdornment,
} from "@mui/material";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  ImageOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import {
  useModules,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useUploadThumbnail,
} from "@/hooks/useModules";
import { PageLoader } from "@/components/common";
import { Module, CreateModuleInput } from "@/types/content";

export const ModulesPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<CreateModuleInput>({
    title: "",
    description: "",
    thumbnailUrl: "",
    isActive: true,
    displayOrder: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const { data: modules, isLoading } = useModules();
  const createMutation = useCreateModule();
  const updateMutation = useUpdateModule();
  const deleteMutation = useDeleteModule();
  const uploadMutation = useUploadThumbnail();

  React.useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isLoading, initialLoad]);

  if (isLoading && initialLoad) {
    return <PageLoader />;
  }

  const filteredModules = modules?.filter(
    (module) =>
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenDialog = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        title: module.title,
        description: module.description,
        thumbnailUrl: module.thumbnailUrl,
        isActive: module.isActive,
        displayOrder: module.displayOrder,
      });
    } else {
      setEditingModule(null);
      setFormData({
        title: "",
        description: "",
        thumbnailUrl: "",
        isActive: true,
        displayOrder: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingModule(null);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadMutation.mutateAsync(file);
      setFormData({ ...formData, thumbnailUrl: url });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (editingModule) {
      await updateMutation.mutateAsync({
        id: editingModule.id,
        input: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this module? This will also delete all related topics and lessons.",
      )
    ) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleActive = async (module: Module) => {
    await updateMutation.mutateAsync({
      id: module.id,
      input: { isActive: !module.isActive },
    });
  };

  return (
    <Box>
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
          <Typography variant="h4" gutterBottom>
            Modules
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage learning modules and course content
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => handleOpenDialog()}
        >
          Add Module
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search modules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Modules Table */}
      <TableContainer component={Paper} sx={{ bgcolor: "background.paper" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Thumbnail</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredModules?.map((module) => (
              <TableRow key={module.id}>
                <TableCell>
                  <Avatar
                    src={module.thumbnailUrl}
                    variant="rounded"
                    sx={{ width: 80, height: 60 }}
                  >
                    <ImageOutlined />
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {module.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ maxWidth: 400 }}
                  >
                    {module.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={module.displayOrder} size="small" />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={module.isActive}
                    onChange={() => handleToggleActive(module)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(module)}
                    sx={{ mr: 1 }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(module.id)}
                    color="error"
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!filteredModules || filteredModules.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery
                      ? "No modules found matching your search."
                      : 'No modules yet. Click "Add Module" to create one.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingModule ? "Edit Module" : "Add Module"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              multiline
              rows={4}
              required
            />

            {/* Thumbnail Upload */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Module Thumbnail
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageOutlined />}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                {formData.thumbnailUrl && (
                  <Avatar
                    src={formData.thumbnailUrl}
                    variant="rounded"
                    sx={{ width: 120, height: 80 }}
                  />
                )}
              </Box>
              <TextField
                label="Or enter image URL"
                value={formData.thumbnailUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
                fullWidth
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <TextField
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  displayOrder: parseInt(e.target.value) || 0,
                })
              }
              fullWidth
              helperText="Lower numbers appear first"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title || !formData.description}
          >
            {editingModule ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
