import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userSubscriptionsAPI } from "@/api/userSubscriptions";
import {
  CreateUserSubscriptionInput,
  UpdateUserSubscriptionInput,
} from "@/types/subscription";
import { useSnackbar } from "notistack";

export const useUserSubscriptions = () => {
  return useQuery({
    queryKey: ["user-subscriptions"],
    queryFn: userSubscriptionsAPI.getAll,
  });
};

export const useUserSubscriptionsByStatus = (status: string) => {
  return useQuery({
    queryKey: ["user-subscriptions", "status", status],
    queryFn: () => userSubscriptionsAPI.getByStatus(status),
    enabled: !!status,
  });
};

export const useUserSubscriptionsByUser = (userId: string) => {
  return useQuery({
    queryKey: ["user-subscriptions", "user", userId],
    queryFn: () => userSubscriptionsAPI.getByUserId(userId),
    enabled: !!userId,
  });
};

export const useUserSubscription = (id: string) => {
  return useQuery({
    queryKey: ["user-subscriptions", id],
    queryFn: () => userSubscriptionsAPI.getById(id),
    enabled: !!id,
  });
};

export const useSubscriptionAnalytics = () => {
  return useQuery({
    queryKey: ["subscription-analytics"],
    queryFn: userSubscriptionsAPI.getAnalytics,
  });
};

export const useCreateUserSubscription = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (input: CreateUserSubscriptionInput) =>
      userSubscriptionsAPI.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-subscriptions"] });
      enqueueSnackbar("Subscription created successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to create subscription", {
        variant: "error",
      });
    },
  });
};

export const useUpdateUserSubscription = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateUserSubscriptionInput;
    }) => userSubscriptionsAPI.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-subscriptions"] });
      enqueueSnackbar("Subscription updated successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to update subscription", {
        variant: "error",
      });
    },
  });
};

export const useDeleteUserSubscription = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => userSubscriptionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-subscriptions"] });
      enqueueSnackbar("Subscription deleted successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to delete subscription", {
        variant: "error",
      });
    },
  });
};
