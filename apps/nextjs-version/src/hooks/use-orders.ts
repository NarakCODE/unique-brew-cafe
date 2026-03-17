/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getOrders, getOrderById, updateOrderStatus } from "@/api/orders";
import { OrderFilters, UpdateOrderStatusPayload } from "@/types/order";
import { ApiErrorResponse } from "@/types/api";

export function useOrders(filters?: OrderFilters) {
  const query = useQuery({
    queryKey: ["orders", filters],
    queryFn: () => getOrders(filters),
    placeholderData: keepPreviousData,
  });

  return {
    orders: query.data?.data.items ?? [],
    pagination: query.data?.data.pagination,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

export function useOrder(orderId: string | null) {
  const query = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: !!orderId,
  });

  return {
    order: query.data?.data,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
  };
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: UpdateOrderStatusPayload;
    }) => updateOrderStatus(orderId, payload),
    onSuccess: (_data, variables) => {
      toast.success("Order status updated successfully");
      // Invalidate both the list and the specific order detail
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: ["order", variables.orderId],
      });
    },
    onError: (error: any) => {
      const message =
        error?.message || "Failed to update order status. Please try again.";
      toast.error(message);
    },
  });
}
