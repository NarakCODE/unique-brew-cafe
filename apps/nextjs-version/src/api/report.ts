import { apiClient } from "@/lib/api-client";
import {
  DashboardStatsResponse,
  SalesReportResponse,
  ProductPerformanceResponse,
} from "@/types/report";

export const getDashboardStats = async (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<DashboardStatsResponse> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  return apiClient.get(`/reports/dashboard?${params.toString()}`);
};

export const getSalesReport = async (filters?: {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "month";
}): Promise<SalesReportResponse> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.groupBy) params.append("groupBy", filters.groupBy);
  return apiClient.get(`/reports/sales?${params.toString()}`);
};

export const getProductPerformance = async (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<ProductPerformanceResponse> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  return apiClient.get(`/reports/products?${params.toString()}`);
};
