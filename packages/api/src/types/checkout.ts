import { ApiResponse } from "./api";

export type CheckoutPaymentMethodId = "bakong_khqr" | "cash";
export type CheckoutSessionStatus =
  | "pending"
  | "awaiting_payment"
  | "completed"
  | "failed"
  | "expired";

export interface CheckoutAddOnSnapshot {
  id: string;
  name: string;
  price: number;
}

export interface CheckoutItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: Record<string, string>;
  addOns: CheckoutAddOnSnapshot[];
  notes?: string;
}

export interface CheckoutPromoCode {
  code: string;
  discountAmount: number;
}

export interface CheckoutOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  currency: string;
}

export interface CheckoutPaymentData {
  provider: "bakong";
  qrPayload: string;
  qrImageDataUrl: string;
  md5: string;
  expiresAt: string;
}

export interface CheckoutSession {
  id: string;
  userId: string;
  cartId: string;
  storeId: string;
  status: CheckoutSessionStatus;
  paymentStatus: "pending" | "processing" | "completed" | "failed";
  paymentMethod?: CheckoutPaymentMethodId;
  fulfillmentType: "pickup" | "delivery";
  items: CheckoutItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  currency: string;
  deliveryAddress?: string;
  notes?: string;
  promoCode?: CheckoutPromoCode;
  order?: CheckoutOrderSummary;
  payment?: CheckoutPaymentData;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CheckoutPaymentMethod {
  id: CheckoutPaymentMethodId;
  name: string;
  type: "khqr" | "cash";
  description: string;
  isActive: boolean;
}

export interface ConfirmCheckoutPayload {
  paymentMethod: CheckoutPaymentMethodId;
}

export type CheckoutSessionResponse = ApiResponse<CheckoutSession>;
export type CheckoutValidationResponse = ApiResponse<CheckoutValidationResult>;
export type CheckoutPaymentMethodsResponse = ApiResponse<CheckoutPaymentMethod[]>;
