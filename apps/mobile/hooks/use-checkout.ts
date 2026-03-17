import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ConfirmCheckoutPayload } from "../../../packages/api/src";

import {
  confirmCheckout,
  createCheckoutSession,
  getCheckoutPaymentMethods,
  getCheckoutSession,
  validateCheckout,
} from "@/services/checkout.service";
import { cartKeys } from "@/hooks/use-cart";

export const checkoutKeys = {
  root: ["checkout"] as const,
  paymentMethods: () => ["checkout", "payment-methods"] as const,
  detail: (checkoutId: string) => ["checkout", "detail", checkoutId] as const,
};

export function useCheckoutPaymentMethods() {
  return useQuery({
    queryKey: checkoutKeys.paymentMethods(),
    queryFn: getCheckoutPaymentMethods,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCheckoutSession(
  checkoutId: string | null,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  },
) {
  return useQuery({
    queryKey: checkoutId ? checkoutKeys.detail(checkoutId) : checkoutKeys.root,
    queryFn: () => getCheckoutSession(checkoutId ?? ""),
    enabled: Boolean(checkoutId) && (options?.enabled ?? true),
    staleTime: 0,
    refetchInterval: options?.refetchInterval,
  });
}

export function useValidateCheckout() {
  return useMutation({
    mutationFn: validateCheckout,
  });
}

export function useCreateCheckoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: async (session) => {
      await queryClient.setQueryData(
        checkoutKeys.detail(session.id),
        session,
      );
    },
  });
}

export function useConfirmCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      checkoutId,
      payload,
    }: {
      checkoutId: string;
      payload: ConfirmCheckoutPayload;
    }) => confirmCheckout(checkoutId, payload),
    onSuccess: async (session) => {
      await Promise.all([
        queryClient.setQueryData(checkoutKeys.detail(session.id), session),
        queryClient.invalidateQueries({ queryKey: cartKeys.detail() }),
        queryClient.invalidateQueries({ queryKey: cartKeys.summary() }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);
    },
  });
}
