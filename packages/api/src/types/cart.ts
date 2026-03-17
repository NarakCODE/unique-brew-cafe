import { ApiResponse } from "./api";

export type CartCustomization = {
  size?: "small" | "medium" | "large";
  sugarLevel?: "none" | "low" | "medium" | "high";
  iceLevel?: "none" | "low" | "medium" | "high";
  coffeeLevel?: "single" | "double" | "triple";
};

export interface CartStore {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
}

export interface CartProductSummary {
  id: string;
  name: string;
  slug: string;
  images: string[];
  basePrice: number;
  currency: string;
  isAvailable: boolean;
  preparationTime: number;
  categoryId: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: CartProductSummary | null;
  quantity: number;
  customization?: CartCustomization;
  addOns: string[];
  notes?: string;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartRecord {
  id: string;
  userId?: string;
  storeId: string;
  store: CartStore | null;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  promoCode?: string;
  deliveryAddress?: string;
  notes?: string;
  status: "active" | "checked_out" | "abandoned";
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface CartData {
  cart: CartRecord | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

export interface AddCartItemPayload {
  productId: string;
  quantity: number;
  customization?: CartCustomization;
  addOns?: string[];
  notes?: string;
}

export interface UpdateCartItemQuantityPayload {
  quantity: number;
}

export interface SetCartDeliveryAddressPayload {
  addressId: string;
}

export interface SetCartNotesPayload {
  notes: string;
}

export interface CartClearResult {
  message: string;
}

export interface CartValidationIssue {
  itemId: string;
  productId: string;
  issue: string;
}

export interface CartValidationResult {
  isValid: boolean;
  issues: CartValidationIssue[];
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

export type CartResponse = ApiResponse<CartData>;
export type CartClearResponse = ApiResponse<CartClearResult>;
export type CartValidationResponse = ApiResponse<CartValidationResult>;
export type CartSummaryResponse = ApiResponse<CartSummary>;
