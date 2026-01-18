import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsAPI } from "@/api/notifications";
import type {
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
  NotificationFilters,
  NotificationStats,
  UserTargetingOption,
} from "@/types/notifications";
import { useSnackbar } from "notistack";

import { LocalNotificationStore } from "@/utils/LocalNotificationStore";
import { useEffect } from "react";

export const useNotifications = (filters?: NotificationFilters) => {
  const query = useQuery({
    queryKey: ["notifications", filters],
    queryFn: async () => {
      const data = await notificationsAPI.getNotifications(filters);
      // Only persist if no filters (or specific logic) to avoid overwriting cache with partial data
      // For now, let's persist everything if it's the main list
      if (!filters || Object.keys(filters).length === 0) {
        LocalNotificationStore.saveNotifications(data);
      }
      return data;
    },
    // Use local data as placeholder if available and no filters
    placeholderData:
      !filters || Object.keys(filters).length === 0
        ? LocalNotificationStore.getAllNotifications()
        : undefined,
  });

  // Sync effect (optional, strictly queryFn handling is enough for react-query)
  return query;
};

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: ["notifications", id],
    queryFn: () => notificationsAPI.getNotificationById(id),
    enabled: !!id,
  });
};

export const useNotificationStats = (id: string) => {
  return useQuery({
    queryKey: ["notifications", id, "stats"],
    queryFn: () => notificationsAPI.getNotificationStats(id),
    enabled: !!id,
  });
};

export const useUserTargetingOptions = () => {
  return useQuery({
    queryKey: ["notifications", "targeting-options"],
    queryFn: () => notificationsAPI.getUserTargetingOptions(),
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (input: CreateNotificationInput) =>
      notificationsAPI.createNotification(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      enqueueSnackbar("Notification created successfully", {
        variant: "success",
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to create notification: ${error.message}`, {
        variant: "error",
      });
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateNotificationInput;
    }) => notificationsAPI.updateNotification(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      enqueueSnackbar("Notification updated successfully", {
        variant: "success",
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to update notification: ${error.message}`, {
        variant: "error",
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => notificationsAPI.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      enqueueSnackbar("Notification deleted successfully", {
        variant: "success",
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to delete notification: ${error.message}`, {
        variant: "error",
      });
    },
  });
};

export const useScheduleNotification = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, scheduledFor }: { id: string; scheduledFor: string }) =>
      notificationsAPI.scheduleNotification(id, scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      enqueueSnackbar("Notification scheduled successfully", {
        variant: "success",
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to schedule notification: ${error.message}`, {
        variant: "error",
      });
    },
  });
};

export const useCancelNotification = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) =>
      notificationsAPI.cancelScheduledNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      enqueueSnackbar("Notification cancelled successfully", {
        variant: "success",
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to cancel notification: ${error.message}`, {
        variant: "error",
      });
    },
  });
};

export const useRetryNotification = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => notificationsAPI.retryFailedNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      enqueueSnackbar("Retrying failed deliveries...", { variant: "info" });
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to retry notification: ${error.message}`, {
        variant: "error",
      });
    },
  });
};

/**
 * Hook for sending direct push notifications without database storage
 */
export const useSendDirectPush = () => {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (input: {
      title: string;
      body: string;
      imageUrl?: string;
      data?: Record<string, any>;
      audienceFilter: {
        type: string;
        subscriptionTier?: string;
        userIds?: string[];
      };
    }) => notificationsAPI.sendDirectPush(input),
    onSuccess: (result) => {
      if (result.sent > 0) {
        enqueueSnackbar(
          `Push notification sent to ${result.sent} device${result.sent > 1 ? "s" : ""}`,
          { variant: "success" },
        );
      }
      if (result.failed > 0) {
        enqueueSnackbar(
          `${result.failed} delivery failure${result.failed > 1 ? "s" : ""}`,
          { variant: "warning" },
        );
      }
      if (result.sent === 0 && result.failed === 0) {
        enqueueSnackbar("No devices found to send push notification", {
          variant: "info",
        });
      }
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to send push notification: ${error.message}`, {
        variant: "error",
      });
    },
  });
};
