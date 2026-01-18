import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Switch,
  Alert,
  Typography,
} from "@mui/material";
import { Topic, CreateTopicInput, FIXED_MODULE_IDS } from "@/types/content";
import { useCreateTopic, useUpdateTopic } from "@/hooks/useTopics";
import { coreNotesAPI } from "@/api/coreNotes";
import { flashContentAPI } from "@/api/flashContent";

interface TopicFormModalProps {
  open: boolean;
  onClose: () => void;
  editingTopic?: Topic | null;
}

export const TopicFormModal: React.FC<TopicFormModalProps> = ({
  open,
  onClose,
  editingTopic,
}) => {
  const [formData, setFormData] = useState<CreateTopicInput>({
    moduleId: FIXED_MODULE_IDS.LEARNING,
    title: "",
    description: "",
    isActive: true,
    displayOrder: 0,
  });
  const [touched, setTouched] = useState({ title: false, description: false });
  const [submitError, setSubmitError] = useState<string>("");
  const [isCreatingPlaceholders, setIsCreatingPlaceholders] = useState(false);

  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic();

  useEffect(() => {
    if (editingTopic) {
      setFormData({
        moduleId: editingTopic.moduleId,
        title: editingTopic.title,
        description: editingTopic.description,
        isActive: editingTopic.isActive,
        displayOrder: editingTopic.displayOrder,
      });
    } else {
      setFormData({
        moduleId: FIXED_MODULE_IDS.LEARNING,
        title: "",
        description: "",
        isActive: true,
        displayOrder: 0,
      });
    }
    setTouched({ title: false, description: false });
    setSubmitError("");
  }, [editingTopic, open]);

  const validate = () => {
    return formData.title.trim() !== "" && formData.description.trim() !== "";
  };

  const getFieldError = (field: "title" | "description") => {
    if (!touched[field]) return "";
    if (field === "title" && !formData.title.trim()) return "Title is required";
    if (field === "description" && !formData.description.trim())
      return "Description is required";
    return "";
  };

  const handleSubmit = async () => {
    setTouched({ title: true, description: true });
    if (!validate()) return;

    setSubmitError("");
    setIsCreatingPlaceholders(false);

    try {
      if (editingTopic) {
        // Update existing topic
        await updateMutation.mutateAsync({
          id: editingTopic.id,
          input: formData,
        });
        onClose();
      } else {
        // Create new topic
        setIsCreatingPlaceholders(true);
        const newTopic = await createMutation.mutateAsync(formData);

        // Auto-create placeholders for Core Notes and Flash Content
        try {
          // Create Core Notes placeholder
          await coreNotesAPI.create({
            topicId: newTopic.id,
            content: "",
            sections: [],
            isActive: true,
          });

          // Create Flash Content placeholders (5 screens)
          await flashContentAPI.createPlaceholders(newTopic.id);

          setIsCreatingPlaceholders(false);
          onClose();
        } catch (placeholderError: any) {
          setIsCreatingPlaceholders(false);
          setSubmitError(
            `Topic created but failed to create placeholders: ${
              placeholderError.message || "Unknown error"
            }`,
          );
        }
      }
    } catch (error: any) {
      setIsCreatingPlaceholders(false);
      setSubmitError(error.message || "An error occurred. Please try again.");
    }
  };

  const handleClose = () => {
    if (
      !createMutation.isPending &&
      !updateMutation.isPending &&
      !isCreatingPlaceholders
    ) {
      onClose();
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    isCreatingPlaceholders;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{editingTopic ? "Edit Topic" : "Add New Topic"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {submitError && (
            <Alert severity="error" onClose={() => setSubmitError("")}>
              {submitError}
            </Alert>
          )}

          {isCreatingPlaceholders && (
            <Alert severity="info">
              Creating placeholders for Core Notes and Flash Content...
            </Alert>
          )}

          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            onBlur={() => setTouched({ ...touched, title: true })}
            fullWidth
            required
            error={!!getFieldError("title")}
            helperText={getFieldError("title")}
            disabled={isLoading}
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            onBlur={() => setTouched({ ...touched, description: true })}
            fullWidth
            multiline
            rows={3}
            required
            error={!!getFieldError("description")}
            helperText={getFieldError("description")}
            disabled={isLoading}
          />

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
            disabled={isLoading}
            helperText="Lower numbers appear first"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                disabled={isLoading}
              />
            }
            label="Active"
          />

          {!editingTopic && (
            <Alert severity="info">
              <Typography variant="body2">
                When you create a new topic, placeholders will be automatically
                created for:
              </Typography>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>Core Notes (empty)</li>
                <li>Flash Content (5 empty screens)</li>
              </ul>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{ borderRadius: "12px" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!validate() || isLoading}
          sx={{ borderRadius: "12px" }}
        >
          {isLoading
            ? isCreatingPlaceholders
              ? "Creating..."
              : "Saving..."
            : editingTopic
              ? "Update"
              : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
