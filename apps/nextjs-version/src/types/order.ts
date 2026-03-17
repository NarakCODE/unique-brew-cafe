export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "completed"
  | "cancelled";

export interface OrderItemSnapshot {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: {
    size?: string;
    sugarLevel?: string;
    iceLevel?: string;
    coffeeLevel?: string;
  };
  addOns?: { id: string; name: string; price: number }[];
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  storeId: string | { name: string; address: string; city: string };
  status: OrderStatus;
  paymentStatus: "pending" | "processing" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  currency: string;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  deliveryAddress?: string;
  estimatedReadyTime?: string;
  actualReadyTime?: string;
  pickedUpAt?: string;
  notes?: string;
  internalNotes?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  completedAt?: string;
  cancelledAt?: string;
  items?: OrderItemSnapshot[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetOrdersResponse {
  statusCode: number;
  data: {
    items: Order[];
    pagination: OrderPagination;
  };
  message: string;
  success: boolean;
}

export interface GetOrderResponse {
  statusCode: number;
  data: Order;
  message: string;
  success: boolean;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  note?: string;
}

export interface UpdateOrderStatusResponse {
  statusCode: number;
  data: Order;
  message: string;
  success: boolean;
}

export interface OrderFilters {
  status?: OrderStatus;
  storeId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Valid next statuses for each current status (mirrors the backend transition map) */
export const VALID_NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> =
  {
    pending_payment: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["picked_up", "cancelled"],
    picked_up: ["completed"],
    completed: [],
    cancelled: [],
  };

/** Human-readable labels */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Order Received",
  confirmed: "Order Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  picked_up: "Picked Up",
  completed: "Completed",
  cancelled: "Cancelled",
};
