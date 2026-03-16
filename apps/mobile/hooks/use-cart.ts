import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddCartItemPayload,
  SetCartDeliveryAddressPayload,
  SetCartNotesPayload,
  UpdateCartItemQuantityPayload,
} from "../../../packages/api/src";

import {
  addCartItem,
  clearCart,
  getCart,
  getCartSummary,
  removeCartItem,
  setCartDeliveryAddress,
  setCartNotes,
  updateCartItemQuantity,
  validateCart,
} from "@/services/cart.service";

export const cartKeys = {
  root: ["cart"] as const,
  detail: () => ["cart", "detail"] as const,
  summary: () => ["cart", "summary"] as const,
};

export function useCart() {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: getCart,
    staleTime: 1000 * 30,
  });
}

export function useCartSummary() {
  return useQuery({
    queryKey: cartKeys.summary(),
    queryFn: getCartSummary,
    staleTime: 1000 * 30,
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCartItemPayload) => addCartItem(payload),
    onSuccess: async () => {
      await invalidateCartQueries(queryClient);
    },
  });
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: UpdateCartItemQuantityPayload;
    }) => updateCartItemQuantity(itemId, payload),
    onSuccess: async () => {
      await invalidateCartQueries(queryClient);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: async () => {
      await invalidateCartQueries(queryClient);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: async () => {
      await invalidateCartQueries(queryClient);
    },
  });
}

export function useValidateCart() {
  return useMutation({
    mutationFn: validateCart,
  });
}

export function useSetCartDeliveryAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SetCartDeliveryAddressPayload) =>
      setCartDeliveryAddress(payload),
    onSuccess: async () => {
      await invalidateCartQueries(queryClient);
    },
  });
}

export function useSetCartNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SetCartNotesPayload) => setCartNotes(payload),
    onSuccess: async () => {
      await invalidateCartQueries(queryClient);
    },
  });
}

async function invalidateCartQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: cartKeys.detail() }),
    queryClient.invalidateQueries({ queryKey: cartKeys.summary() }),
  ]);
}
