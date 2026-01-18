import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Typography,
  Fade,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  isValid?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  showActions?: boolean;
  customActions?: React.ReactNode;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isSubmitting = false,
  isValid = true,
  maxWidth = "md",
  showActions = true,
  customActions,
}) => {
  const handleSubmit = () => {
    if (onSubmit && !isSubmitting) {
      onSubmit();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
      PaperProps={{
        sx: {
          borderRadius: 0,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          px: 3,
          py: 3,
          "& > *:first-of-type": {
            mt: 0,
          },
        }}
      >
        {children}
      </DialogContent>

      {showActions && (
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: 1,
            borderColor: "divider",
            gap: 1,
            bgcolor: "background.paper",
          }}
        >
          {customActions || (
            <>
              <Button
                onClick={onClose}
                disabled={isSubmitting}
                sx={{
                  borderRadius: 0,
                  px: 3,
                  textTransform: "none",
                }}
              >
                {cancelLabel}
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={!isValid || isSubmitting}
                sx={{
                  borderRadius: 0,
                  px: 3,
                  textTransform: "none",
                  minWidth: 120,
                  position: "relative",
                }}
              >
                {isSubmitting ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    <span>Processing...</span>
                  </Box>
                ) : (
                  submitLabel
                )}
              </Button>
            </>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};
