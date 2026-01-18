import React, { forwardRef } from "react";
import { Box, IconButton, Typography, LinearProgress } from "@mui/material";
import {
  CheckCircleOutlined as SuccessIcon,
  ErrorOutline as ErrorIcon,
  WarningAmberOutlined as WarningIcon,
  InfoOutlined as InfoIcon,
  CloseOutlined as CloseIcon,
} from "@mui/icons-material";
import { SnackbarContent, CustomContentProps, useSnackbar } from "notistack";

const CustomToast = forwardRef<HTMLDivElement, CustomContentProps>(
  (props, ref) => {
    const { id, message, variant = "info" } = props;
    const { closeSnackbar } = useSnackbar();

    const getIcon = () => {
      switch (variant) {
        case "success":
          return <SuccessIcon sx={{ fontSize: 22 }} />;
        case "error":
          return <ErrorIcon sx={{ fontSize: 22 }} />;
        case "warning":
          return <WarningIcon sx={{ fontSize: 22 }} />;
        default:
          return <InfoIcon sx={{ fontSize: 22 }} />;
      }
    };

    const getColors = () => {
      switch (variant) {
        case "success":
          return {
            bg: "#4CAF50",
            border: "#45a049",
            icon: "#FFFFFF",
          };
        case "error":
          return {
            bg: "#D32F2F",
            border: "#c62828",
            icon: "#FFFFFF",
          };
        case "warning":
          return {
            bg: "#F9A825",
            border: "#f57f17",
            icon: "#FFFFFF",
          };
        default:
          return {
            bg: "#0288D1",
            border: "#0277BD",
            icon: "#FFFFFF",
          };
      }
    };

    const colors = getColors();

    return (
      <SnackbarContent ref={ref} role="alert">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: colors.bg,
            color: "#FFFFFF",
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0px 4px 12px rgba(0, 0, 0, 0.15), 0px 2px 6px rgba(0, 0, 0, 0.1)",
            minWidth: 320,
            maxWidth: 400,
            p: 1.5,
            pr: 1,
            position: "relative",
            overflow: "hidden",
            animation: "slideInRight 0.3s ease-out",
            "@keyframes slideInRight": {
              from: {
                transform: "translateX(100%)",
                opacity: 0,
              },
              to: {
                transform: "translateX(0)",
                opacity: 1,
              },
            },
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.icon,
              flexShrink: 0,
            }}
          >
            {getIcon()}
          </Box>

          {/* Message */}
          <Typography
            variant="body2"
            sx={{
              flexGrow: 1,
              fontWeight: 500,
              fontSize: "0.9rem",
              lineHeight: 1.4,
            }}
          >
            {message}
          </Typography>

          {/* Close Button */}
          <IconButton
            size="small"
            onClick={() => closeSnackbar(id)}
            sx={{
              color: "#FFFFFF",
              opacity: 0.9,
              "&:hover": {
                opacity: 1,
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
              flexShrink: 0,
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={100}
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              bgcolor: "rgba(255, 255, 255, 0.2)",
              "& .MuiLinearProgress-bar": {
                bgcolor: "rgba(255, 255, 255, 0.4)",
                animation: "shrink 3s linear",
              },
              "@keyframes shrink": {
                from: {
                  transform: "translateX(0)",
                },
                to: {
                  transform: "translateX(-100%)",
                },
              },
            }}
          />
        </Box>
      </SnackbarContent>
    );
  },
);

CustomToast.displayName = "CustomToast";

export default CustomToast;
