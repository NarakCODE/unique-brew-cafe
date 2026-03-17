import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getSalesReport,
  getProductPerformance,
  getOrdersReport,
} from "@/api/report";
import { ApiErrorResponse } from "@/types/api";

interface DateFilters {
  startDate?: string;
  endDate?: string;
}

export function useOrdersReport(filters?: DateFilters) {
  const query = useQuery({
    queryKey: ["orders-report", filters],
    queryFn: () => getOrdersReport(filters),
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data?.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

export function useDashboardStats(filters?: DateFilters) {
  const query = useQuery({
    queryKey: ["dashboard-stats", filters],
    queryFn: () => getDashboardStats(filters),
    placeholderData: keepPreviousData,
  });

  return {
    stats: query.data?.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
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
    placeholderData: keepPreviousData,
  });

  return {
    sales: query.data?.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

export function useProductPerformance(filters?: DateFilters) {
  const query = useQuery({
    queryKey: ["product-performance", filters],
    queryFn: () => getProductPerformance(filters),
    placeholderData: keepPreviousData,
  });

  return {
    products: query.data?.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}
