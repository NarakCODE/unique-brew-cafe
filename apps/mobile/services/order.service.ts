import type { OrdersListResponse } from "../../../packages/api/src";

import { mobileApiClient } from "@/lib/mobile-api-client";

type OrdersApiResponse = {
  statusCode: number;
  data: {
    items: Array<{
      _id: string;
      userId: string;
      storeId?: {
        _id: string;
        name: string;
        address: string;
        city: string;
      };
      status: string;
      paymentStatus: string;
      paymentMethod: string;
      subtotal: number;
      discount: number;
      tax: number;
      deliveryFee: number;
      total: number;
      currency: string;
      loyaltyPointsUsed: number;
      loyaltyPointsEarned: number;
      estimatedReadyTime?: string;
      actualReadyTime?: string;
      pickedUpAt?: string;
      notes?: string;
      createdAt: string;
      updatedAt: string;
      orderNumber: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
  success: boolean;
};

export async function getOrders() {
  const response = await mobileApiClient.get<OrdersApiResponse>("/orders");

  const normalized: OrdersListResponse = {
    ...response,
    data: {
      items: response.data.items.map((item) => ({
        id: item._id,
        userId: item.userId,
        store: {
          id: item.storeId?._id ?? "",
          name: item.storeId?.name ?? "Store unavailable",
          address: item.storeId?.address ?? "",
          city: item.storeId?.city ?? "",
        },
        status: item.status,
        paymentStatus: item.paymentStatus,
        paymentMethod: item.paymentMethod,
        subtotal: item.subtotal,
        discount: item.discount,
        tax: item.tax,
        deliveryFee: item.deliveryFee,
        total: item.total,
        currency: item.currency,
        loyaltyPointsUsed: item.loyaltyPointsUsed,
        loyaltyPointsEarned: item.loyaltyPointsEarned,
        estimatedReadyTime: item.estimatedReadyTime,
        actualReadyTime: item.actualReadyTime,
        pickedUpAt: item.pickedUpAt,
        notes: item.notes,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        orderNumber: item.orderNumber,
      })),
      pagination: {
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.pages,
        hasNextPage: response.data.pagination.hasNext,
        hasPrevPage: response.data.pagination.hasPrev,
      },
    },
  };

  return normalized.data;
}
