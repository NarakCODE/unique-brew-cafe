import { apiClient } from "@/lib/api-client";
import {
  DashboardStatsResponse,
  SalesReportResponse,
  ProductPerformanceResponse,
} from "@/types/report";
import { buildQueryString, withQuery } from "@/lib/search-params";

export const getDashboardStats = async (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<DashboardStatsResponse> => {
  const query = buildQueryString({
    startDate: filters?.startDate,
    endDate: filters?.endDate,
  });
  return apiClient.get(withQuery("/reports/dashboard", query));
};

export const getSalesReport = async (filters?: {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "month";
}): Promise<SalesReportResponse> => {
  const query = buildQueryString({
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    groupBy: filters?.groupBy,
  });
  return apiClient.get(withQuery("/reports/sales", query));
};

export const getProductPerformance = async (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<ProductPerformanceResponse> => {
  const query = buildQueryString({
    startDate: filters?.startDate,
    endDate: filters?.endDate,
  });
  return apiClient.get(withQuery("/reports/products", query));
};
