import type {
  AddCartItemPayload,
  CartClearResponse,
  CartData,
  CartItem,
  CartRecord,
  CartResponse,
  CartSummary,
  CartSummaryResponse,
  CartValidationResponse,
  SetCartDeliveryAddressPayload,
  SetCartNotesPayload,
  UpdateCartItemQuantityPayload,
} from "../../../packages/api/src";

import { mobileApiClient } from "@/lib/mobile-api-client";

type RawCartStore = {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  address: string;
  city: string;
} | string | null;

type RawCart = {
  _id?: string;
  id?: string;
  userId?: string;
  storeId: RawCartStore | string;
  subtotal: number;
  discount?: number;
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
};

type RawCartProduct = {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  images?: unknown[];
  basePrice: number;
  currency: string;
  isAvailable: boolean;
  preparationTime: number;
  categoryId: string;
} | string | null;

type RawCartItem = {
  _id?: string;
  id?: string;
  cartId: string;
  productId: RawCartProduct;
  quantity: number;
  customization?: CartItem["customization"];
  addOns?: Array<string | { _id?: string; id?: string }>;
  notes?: string;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
};

type RawCartData = {
  cart: RawCart | null;
  items: RawCartItem[];
  itemCount: number;
  subtotal?: number;
  discount?: number;
  tax?: number;
  deliveryFee?: number;
  total?: number;
};

export async function getCart() {
  const response = await mobileApiClient.get<CartResponse>("/cart");
  return normalizeCartData(response.data as unknown as RawCartData);
}

export async function addCartItem(payload: AddCartItemPayload) {
  const response = await mobileApiClient.post<AddCartItemPayload, CartResponse>(
    "/cart/items",
    payload,
  );

  return normalizeCartData(response.data as unknown as RawCartData);
}

export async function updateCartItemQuantity(
  itemId: string,
  payload: UpdateCartItemQuantityPayload,
) {
  const response = await mobileApiClient.patch<
    UpdateCartItemQuantityPayload,
    CartResponse
  >(`/cart/items/${itemId}`, payload);

  return normalizeCartData(response.data as unknown as RawCartData);
}

export async function removeCartItem(itemId: string) {
  const response = await mobileApiClient.delete<unknown, CartResponse>(
    `/cart/items/${itemId}`,
  );

  return normalizeCartData(response.data as unknown as RawCartData);
}

export async function clearCart() {
  const response = await mobileApiClient.delete<unknown, CartClearResponse>(
    "/cart",
  );

  return response.data;
}

export async function validateCart() {
  const response = await mobileApiClient.post<undefined, CartValidationResponse>(
    "/cart/validate",
  );

  return response.data;
}

export async function setCartDeliveryAddress(
  payload: SetCartDeliveryAddressPayload,
) {
  const response = await mobileApiClient.patch<
    SetCartDeliveryAddressPayload,
    CartResponse
  >("/cart/address", payload);

  return normalizeCartData(response.data as unknown as RawCartData);
}

export async function setCartNotes(payload: SetCartNotesPayload) {
  const response = await mobileApiClient.patch<SetCartNotesPayload, CartResponse>(
    "/cart/notes",
    payload,
  );

  return normalizeCartData(response.data as unknown as RawCartData);
}

export async function getCartSummary() {
  const response = await mobileApiClient.get<CartSummaryResponse>("/cart/summary");
  return response.data;
}

function normalizeCartData(raw: RawCartData): CartData {
  const normalizedCart = raw.cart ? normalizeCart(raw.cart) : null;

  return {
    cart: normalizedCart,
    items: raw.items.map(normalizeCartItem),
    itemCount: raw.itemCount,
    subtotal: raw.subtotal ?? normalizedCart?.subtotal ?? 0,
    discount: raw.discount ?? normalizedCart?.discount ?? 0,
    tax: raw.tax ?? normalizedCart?.tax ?? 0,
    deliveryFee: raw.deliveryFee ?? normalizedCart?.deliveryFee ?? 0,
    total: raw.total ?? normalizedCart?.total ?? 0,
  };
}

function normalizeCart(raw: RawCart): CartRecord {
  const normalizedStore = normalizeCartStore(raw.storeId);

  return {
    id: raw.id ?? raw._id ?? "",
    userId: raw.userId,
    storeId:
      typeof raw.storeId === "string"
        ? raw.storeId
        : normalizedStore?.id ?? "",
    store: normalizedStore,
    subtotal: raw.subtotal,
    discount: raw.discount ?? 0,
    tax: raw.tax,
    deliveryFee: raw.deliveryFee,
    total: raw.total,
    promoCode: raw.promoCode,
    deliveryAddress: raw.deliveryAddress,
    notes: raw.notes,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    expiresAt: raw.expiresAt,
  };
}

function normalizeCartItem(raw: RawCartItem): CartItem {
  const normalizedProduct = normalizeCartProduct(raw.productId);

  return {
    id: raw.id ?? raw._id ?? "",
    cartId: raw.cartId,
    productId:
      typeof raw.productId === "string"
        ? raw.productId
        : normalizedProduct?.id ?? "",
    product: normalizedProduct,
    quantity: raw.quantity,
    customization: raw.customization,
    addOns: (raw.addOns ?? []).map((entry) =>
      typeof entry === "string" ? entry : entry.id ?? entry._id ?? "",
    ),
    notes: raw.notes,
    unitPrice: raw.unitPrice,
    totalPrice: raw.totalPrice,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function normalizeCartStore(raw: RawCartStore) {
  if (!raw || typeof raw === "string") {
    return null;
  }

  return {
    id: raw.id ?? raw._id ?? "",
    name: raw.name,
    slug: raw.slug,
    address: raw.address,
    city: raw.city,
  };
}

function normalizeCartProduct(raw: RawCartProduct) {
  if (!raw || typeof raw === "string") {
    return null;
  }

  return {
    id: raw.id ?? raw._id ?? "",
    name: raw.name,
    slug: raw.slug,
    images: cleanImageUrls(raw.images),
    basePrice: raw.basePrice,
    currency: raw.currency,
    isAvailable: raw.isAvailable,
    preparationTime: raw.preparationTime,
    categoryId: raw.categoryId,
  };
}

function cleanImageUrls(images?: unknown[]) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.flatMap((image) => {
    if (typeof image !== "string") {
      return [];
    }

    const trimmed = image.trim();

    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith("[") || trimmed.startsWith("\"")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;

        if (Array.isArray(parsed)) {
          return parsed.filter(
            (entry): entry is string =>
              typeof entry === "string" && entry.trim().length > 0,
          );
        }

        if (typeof parsed === "string" && parsed.trim().length > 0) {
          return [parsed];
        }
      } catch {
        return [trimmed];
      }
    }

    return [trimmed];
  });
}
