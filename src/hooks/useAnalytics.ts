import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/api/analytics";
import { DateRange } from "@/types/analytics";

export const useAnalyticsData = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["analytics", dateRange],
    queryFn: () => analyticsAPI.getAnalytics(dateRange),
    staleTime: 5 * 60 * 1000,
  });
};

export const useExportAnalytics = () => {
  const exportToCSV = async (data: any, filename = "analytics-export.csv") => {
    const csvContent = await analyticsAPI.exportAnalyticsCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { exportToCSV };
};
