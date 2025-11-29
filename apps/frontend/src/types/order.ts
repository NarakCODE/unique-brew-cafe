// Order Types
export type OrderStatus =
    | "pending_payment"
    | "confirmed"
    | "preparing"
    | "ready"
    | "picked_up"
    | "completed"
    | "cancelled";

export type PaymentStatus =
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "refunded";

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customizations?: Record<string, string>;
    notes?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    storeId: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    subtotal: number;
    discount: number;
    tax: number;
    deliveryFee: number;
    total: number;
    currency: string;
    items: OrderItem[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderItemData {
    productId: string;
    quantity: number;
    customizations?: Record<string, string>;
    notes?: string;
}

export interface CreateOrderData {
    storeId: string;
    items: CreateOrderItemData[];
    paymentMethod: string;
    notes?: string;
}
