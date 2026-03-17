import { ApiResponse } from "./api";

export interface OrderStore {
  id: string;
  name: string;
  address: string;
  city: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "completed"
  | "cancelled";

export type OrderPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type OrderPaymentMethod = "cash" | "card" | "aba" | "khqr" | "other";

export interface Order {
  id: string;
  userId: string;
  store: OrderStore;
  status: OrderStatus | string;
  paymentStatus: OrderPaymentStatus | string;
  paymentMethod: OrderPaymentMethod | string;
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
}

export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface OrdersListData {
  items: Order[];
  pagination: OrdersPagination;
}

export type OrdersListResponse = ApiResponse<OrdersListData>;
