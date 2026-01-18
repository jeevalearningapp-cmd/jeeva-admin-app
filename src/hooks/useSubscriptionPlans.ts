import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionPlansAPI } from "@/api/subscriptionPlans";
import {
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
} from "@/types/subscription";
import { useSnackbar } from "notistack";

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: subscriptionPlansAPI.getAll,
  });
};

export const useActiveSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["subscription-plans", "active"],
    queryFn: subscriptionPlansAPI.getActive,
  });
};

export const useSubscriptionPlan = (id: string) => {
  return useQuery({
    queryKey: ["subscription-plans", id],
    queryFn: () => subscriptionPlansAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (input: CreateSubscriptionPlanInput) =>
      subscriptionPlansAPI.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      enqueueSnackbar("Subscription plan created successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to create subscription plan", {
        variant: "error",
      });
    },
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateSubscriptionPlanInput;
    }) => subscriptionPlansAPI.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      enqueueSnackbar("Subscription plan updated successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to update subscription plan", {
        variant: "error",
      });
    },
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => subscriptionPlansAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      enqueueSnackbar("Subscription plan deleted successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to delete subscription plan", {
        variant: "error",
      });
    },
  });
};
