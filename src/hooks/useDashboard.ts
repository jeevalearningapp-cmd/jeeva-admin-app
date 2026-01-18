import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.getDashboardData,
  });
};

export const useDashboardAnalyticsData = () => {
  return useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: dashboardApi.getAnalyticsData,
  });
};
