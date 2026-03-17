import { apiClient } from "@/lib/api-client";
import { buildQueryString, withQuery } from "@/lib/search-params";
import {
  GetOrdersResponse,
  GetOrderResponse,
  UpdateOrderStatusPayload,
  UpdateOrderStatusResponse,
  OrderFilters,
} from "@/types/order";

function buildOrderQuery(filters?: OrderFilters): string {
  return buildQueryString({
    status: filters?.status,
    storeId: filters?.storeId,
    userId: filters?.userId,
    dateFrom: filters?.startDate,
    dateTo: filters?.endDate,
    page: filters?.page,
    limit: filters?.limit,
    sortBy: filters?.sortBy,
    sortOrder: filters?.sortOrder,
  });
}

/** GET /orders — admin sees all, user sees own */
export const getOrders = async (
  filters?: OrderFilters,
): Promise<GetOrdersResponse> => {
  return apiClient.get(withQuery("/orders", buildOrderQuery(filters)));
};

/** GET /orders/:id */
export const getOrderById = async (
  orderId: string,
): Promise<GetOrderResponse> => {
  return apiClient.get(`/orders/${orderId}`);
};

/** PATCH /orders/:id/status — admin only */
export const updateOrderStatus = async (
  orderId: string,
  payload: UpdateOrderStatusPayload,
): Promise<UpdateOrderStatusResponse> => {
  return apiClient.patch(`/orders/${orderId}/status`, payload);
};

/** POST /orders/:id/cancel */
export const cancelOrder = async (
  orderId: string,
  reason: string,
): Promise<GetOrderResponse> => {
  return apiClient.post(`/orders/${orderId}/cancel`, { reason });
};
