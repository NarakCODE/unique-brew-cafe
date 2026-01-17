import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getSalesReport,
  getProductPerformance,
} from "@/api/report";
import { ApiErrorResponse } from "@/types/api";

interface DateFilters {
  startDate?: string;
  endDate?: string;
}

export function useDashboardStats(filters?: DateFilters) {
  const query = useQuery({
    queryKey: ["dashboard-stats", filters],
    queryFn: () => getDashboardStats(filters),
  });

  return {
    stats: query.data?.data,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

export function useSalesReport(
  filters?: DateFilters & { groupBy?: "day" | "month" }
) {
  const query = useQuery({
    queryKey: ["sales-report", filters],
    queryFn: () => getSalesReport(filters),
  });

  return {
    sales: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

export function useProductPerformance(filters?: DateFilters) {
  const query = useQuery({
    queryKey: ["product-performance", filters],
    queryFn: () => getProductPerformance(filters),
  });

  return {
    products: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}
