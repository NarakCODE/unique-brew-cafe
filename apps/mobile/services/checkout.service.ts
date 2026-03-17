import type {
  CheckoutPaymentMethodsResponse,
  CheckoutSession,
  CheckoutSessionResponse,
  CheckoutValidationResponse,
  ConfirmCheckoutPayload,
} from "../../../packages/api/src";

import { mobileApiClient } from "@/lib/mobile-api-client";

export async function validateCheckout() {
  const response =
    await mobileApiClient.post<undefined, CheckoutValidationResponse>(
      "/checkout/validate",
    );

  return response.data;
}

export async function createCheckoutSession() {
  const response = await mobileApiClient.post<undefined, CheckoutSessionResponse>(
    "/checkout",
  );

  return normalizeCheckoutSession(response.data);
}

export async function getCheckoutSession(checkoutId: string) {
  const response = await mobileApiClient.get<CheckoutSessionResponse>(
    `/checkout/${checkoutId}`,
  );

  return normalizeCheckoutSession(response.data);
}

export async function getCheckoutPaymentMethods() {
  const response = await mobileApiClient.get<CheckoutPaymentMethodsResponse>(
    "/checkout/payment-methods",
  );

  return response.data;
}

export async function confirmCheckout(
  checkoutId: string,
  payload: ConfirmCheckoutPayload,
) {
  const response = await mobileApiClient.post<
    ConfirmCheckoutPayload,
    CheckoutSessionResponse
  >(`/checkout/${checkoutId}/confirm`, payload);

  return normalizeCheckoutSession(response.data);
}

function normalizeCheckoutSession(session: CheckoutSession): CheckoutSession {
  return {
    ...session,
    payment: session.payment
      ? {
          ...session.payment,
          expiresAt: session.payment.expiresAt,
        }
      : undefined,
  };
}
