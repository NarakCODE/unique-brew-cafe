import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  QrCode,
  Store,
  Wallet,
} from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import type {
  CheckoutPaymentMethod,
  CheckoutPaymentMethodId,
  CheckoutSession,
} from "../../packages/api/src";

import { formatCurrency } from "@/components/account/my-account-helpers";
import { ScreenLayout } from "@/components/layout/screen-layout";
import { ScreenTopBar } from "@/components/layout/screen-topbar";
import { StableBackButton } from "@/components/navigation/stable-back-button";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useCart } from "@/hooks/use-cart";
import {
  useCheckoutPaymentMethods,
  useCheckoutSession,
  useConfirmCheckout,
  useCreateCheckoutSession,
  useValidateCheckout,
} from "@/hooks/use-checkout";

const CHECKOUT_COPY = {
  title: "Checkout",
  summaryTitle: "Order summary",
  paymentTitle: "Payment method",
  pickupTitle: "Pickup",
  deliveryTitle: "Delivery",
  pickupDescription:
    "No delivery address selected. This order will be prepared for pickup.",
  placeOrder: "Place order",
  placeOrderLoading: "Placing order...",
  emptyTitle: "Your cart is empty",
  emptyDescription: "Add something from the menu before checking out.",
  backToMenu: "Back to menu",
  paymentPendingTitle: "Scan to pay",
  paymentPendingDescription:
    "Open your banking app, scan this KHQR, and keep this screen open while we confirm the payment.",
  paymentSuccessTitle: "Order placed",
  paymentSuccessDescription:
    "Your order is confirmed. You can follow progress from order history.",
  paymentExpiredTitle: "Payment expired",
  paymentExpiredDescription:
    "This KHQR session expired before payment completed. Start checkout again to generate a new code.",
  viewOrders: "View orders",
  subtotal: "Subtotal",
  tax: "Tax",
  deliveryFee: "Delivery fee",
  discount: "Discount",
  total: "Total",
  refreshing: "Refreshing payment status...",
  orderNumber: "Order number",
  qrExpires: "QR expires in",
  unavailablePayment: "No payment method is currently available.",
} as const;

export default function CheckoutScreen() {
  const router = useRouter();
  const cartQuery = useCart();
  const paymentMethodsQuery = useCheckoutPaymentMethods();
  const validateCheckoutMutation = useValidateCheckout();
  const createCheckoutMutation = useCreateCheckoutSession();
  const confirmCheckoutMutation = useConfirmCheckout();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    React.useState<CheckoutPaymentMethodId>("cash");
  const [activeCheckoutId, setActiveCheckoutId] = React.useState<string | null>(
    null,
  );
  const [shouldPollCheckout, setShouldPollCheckout] = React.useState(false);
  const [validationWarnings, setValidationWarnings] = React.useState<string[]>(
    [],
  );
  const [countdownLabel, setCountdownLabel] = React.useState<string>("");
  const [cartSnapshot, setCartSnapshot] = React.useState(
    cartQuery.data ?? null,
  );

  const checkoutSessionQuery = useCheckoutSession(activeCheckoutId, {
    enabled: Boolean(activeCheckoutId),
    refetchInterval: shouldPollCheckout ? 4000 : false,
  });

  const availablePaymentMethods = React.useMemo(
    () => (paymentMethodsQuery.data ?? []).filter((method) => method.isActive),
    [paymentMethodsQuery.data],
  );

  const checkoutSession =
    checkoutSessionQuery.data ??
    confirmCheckoutMutation.data ??
    createCheckoutMutation.data ??
    null;
  const checkoutStatus = checkoutSession?.status ?? null;
  const checkoutError =
    validateCheckoutMutation.error?.message ??
    createCheckoutMutation.error?.message ??
    confirmCheckoutMutation.error?.message ??
    checkoutSessionQuery.error?.message;

  React.useEffect(() => {
    if (cartQuery.data?.cart) {
      setCartSnapshot(cartQuery.data);
    }
  }, [cartQuery.data]);

  React.useEffect(() => {
    if (confirmCheckoutMutation.data?.status === "awaiting_payment") {
      setShouldPollCheckout(true);
    }
  }, [confirmCheckoutMutation.data?.status]);

  React.useEffect(() => {
    if (!checkoutSessionQuery.data) {
      return;
    }

    if (checkoutSessionQuery.data.status !== "awaiting_payment") {
      setShouldPollCheckout(false);
    }
  }, [checkoutSessionQuery.data]);

  React.useEffect(() => {
    const firstPaymentMethod = availablePaymentMethods[0];
    if (!firstPaymentMethod) {
      return;
    }

    const selectedStillAvailable = availablePaymentMethods.some(
      (method) => method.id === selectedPaymentMethod,
    );

    if (!selectedStillAvailable) {
      setSelectedPaymentMethod(firstPaymentMethod.id);
    }
  }, [availablePaymentMethods, selectedPaymentMethod]);

  React.useEffect(() => {
    if (!checkoutSession?.payment?.expiresAt) {
      setCountdownLabel("");
      return;
    }

    const updateCountdown = () => {
      const remainingMs =
        new Date(checkoutSession.payment?.expiresAt ?? "").getTime() -
        Date.now();

      if (remainingMs <= 0) {
        setCountdownLabel("00:00");
        return;
      }

      const remainingSeconds = Math.floor(remainingMs / 1000);
      const minutes = Math.floor(remainingSeconds / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

      setCountdownLabel(`${minutes}:${seconds}`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [checkoutSession?.payment?.expiresAt]);

  const handlePlaceOrder = React.useCallback(async () => {
    const validation = await validateCheckoutMutation.mutateAsync();
    setValidationWarnings(validation.warnings);

    if (!validation.isValid) {
      return;
    }

    const session = await createCheckoutMutation.mutateAsync();
    setActiveCheckoutId(session.id);

    const confirmedSession = await confirmCheckoutMutation.mutateAsync({
      checkoutId: session.id,
      payload: {
        paymentMethod: selectedPaymentMethod,
      },
    });

    setShouldPollCheckout(confirmedSession.status === "awaiting_payment");
  }, [
    confirmCheckoutMutation,
    createCheckoutMutation,
    selectedPaymentMethod,
    validateCheckoutMutation,
  ]);

  const displayCart = cartQuery.data?.cart ? cartQuery.data : cartSnapshot;
  const displayStoreName = displayCart?.cart?.store?.name ?? "Selected store";
  const isBusy =
    validateCheckoutMutation.isPending ||
    createCheckoutMutation.isPending ||
    confirmCheckoutMutation.isPending;

  if (!displayCart?.cart || displayCart.items.length === 0) {
    return (
      <ScreenLayout contentClassName="gap-5 px-4">
        <ScreenTopBar
          title={CHECKOUT_COPY.title}
          leftAccessory={<StableBackButton />}
        />
        <EmptyCheckoutState
          title={CHECKOUT_COPY.emptyTitle}
          description={CHECKOUT_COPY.emptyDescription}
          actionLabel={CHECKOUT_COPY.backToMenu}
          onAction={() => {
            router.replace("/(tabs)/explore");
          }}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout contentClassName="gap-5 px-4" bottomInsetOffset={96}>
      <ScreenTopBar
        title={CHECKOUT_COPY.title}
        leftAccessory={<StableBackButton />}
      />

      <View className="rounded-[20px] border border-border bg-card px-4 py-4">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Store size={18} color="#7C5134" />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-foreground">
              {displayStoreName}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {displayCart.cart.deliveryAddress
                ? CHECKOUT_COPY.deliveryTitle
                : CHECKOUT_COPY.pickupTitle}
            </Text>
          </View>
        </View>
        {!displayCart.cart.deliveryAddress ? (
          <Text className="mt-3 text-sm text-muted-foreground">
            {CHECKOUT_COPY.pickupDescription}
          </Text>
        ) : null}
      </View>

      {validationWarnings.length > 0 ? (
        <InlineNotice
          title="Checkout note"
          description={validationWarnings.join(" ")}
        />
      ) : null}

      {checkoutError ? (
        <InlineNotice
          title="Checkout error"
          description={checkoutError}
          tone="error"
        />
      ) : null}

      <View className="gap-4 rounded-[20px] border border-border bg-card px-4 py-4">
        <Text className="text-base font-semibold text-foreground">
          {CHECKOUT_COPY.summaryTitle}
        </Text>

        {displayCart.items.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center justify-between gap-3 rounded-[16px] bg-muted/35 px-3 py-3"
          >
            <View className="flex-1 gap-1">
              <Text className="text-sm font-semibold text-foreground">
                {item.product?.name ?? "Product"}
              </Text>
              <Text className="text-xs text-muted-foreground">
                Qty {item.quantity}
              </Text>
            </View>
            <Text className="text-sm font-medium text-foreground">
              {formatCurrency(item.totalPrice, item.product?.currency ?? "USD")}
            </Text>
          </View>
        ))}

        <SummaryRow
          label={CHECKOUT_COPY.subtotal}
          value={formatCurrency(displayCart.subtotal, "USD")}
        />
        <SummaryRow
          label={CHECKOUT_COPY.tax}
          value={formatCurrency(displayCart.tax, "USD")}
        />
        <SummaryRow
          label={CHECKOUT_COPY.deliveryFee}
          value={formatCurrency(displayCart.deliveryFee, "USD")}
        />
        {displayCart.discount > 0 ? (
          <SummaryRow
            label={CHECKOUT_COPY.discount}
            value={formatCurrency(displayCart.discount, "USD")}
          />
        ) : null}
        <View className="h-px bg-border" />
        <SummaryRow
          label={CHECKOUT_COPY.total}
          value={formatCurrency(displayCart.total, "USD")}
          emphasized
        />
      </View>

      {checkoutStatus === "awaiting_payment" ||
      checkoutStatus === "completed" ? (
        <CheckoutStatusCard
          session={checkoutSession}
          countdownLabel={countdownLabel}
          isRefreshing={checkoutSessionQuery.isFetching}
          onViewOrders={() => {
            router.replace("/account/order-history");
          }}
        />
      ) : checkoutStatus === "expired" ? (
        <InlineNotice
          title={CHECKOUT_COPY.paymentExpiredTitle}
          description={CHECKOUT_COPY.paymentExpiredDescription}
          tone="error"
        />
      ) : (
        <View className="gap-4 rounded-[20px] border border-border bg-card px-4 py-4">
          <Text className="text-base font-semibold text-foreground">
            {CHECKOUT_COPY.paymentTitle}
          </Text>

          {availablePaymentMethods.length === 0 ? (
            <Text className="text-sm text-muted-foreground">
              {CHECKOUT_COPY.unavailablePayment}
            </Text>
          ) : (
            <View className="gap-3">
              {availablePaymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  selected={selectedPaymentMethod === method.id}
                  onPress={() => {
                    setSelectedPaymentMethod(method.id);
                  }}
                />
              ))}
            </View>
          )}

          <Button
            className="h-12 rounded-[16px]"
            disabled={isBusy || availablePaymentMethods.length === 0}
            onPress={() => {
              void handlePlaceOrder();
            }}
          >
            <Text className="font-semibold">
              {isBusy
                ? CHECKOUT_COPY.placeOrderLoading
                : CHECKOUT_COPY.placeOrder}
            </Text>
          </Button>
        </View>
      )}
    </ScreenLayout>
  );
}

function PaymentMethodCard({
  method,
  selected,
  onPress,
}: {
  method: CheckoutPaymentMethod;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`rounded-[18px] border px-4 py-4 ${
        selected ? "border-primary bg-primary/5" : "border-border bg-muted/20"
      }`}
      onPress={onPress}
    >
      <View className="flex-row items-start gap-3">
        <View
          className={`mt-1 h-10 w-10 items-center justify-center rounded-full ${
            selected ? "bg-primary/10" : "bg-background"
          }`}
        >
          {method.id === "bakong_khqr" ? (
            <QrCode size={18} color="#7C5134" />
          ) : (
            <Wallet size={18} color="#7C5134" />
          )}
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-foreground">
            {method.name}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {method.description}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function CheckoutStatusCard({
  session,
  countdownLabel,
  isRefreshing,
  onViewOrders,
}: {
  session: CheckoutSession | null;
  countdownLabel: string;
  isRefreshing: boolean;
  onViewOrders: () => void;
}) {
  if (!session) {
    return null;
  }

  if (session.status === "completed") {
    return (
      <View className="gap-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-5">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={20} color="#0f766e" />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-foreground">
              {CHECKOUT_COPY.paymentSuccessTitle}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {CHECKOUT_COPY.paymentSuccessDescription}
            </Text>
          </View>
        </View>

        {session.order ? (
          <View className="rounded-[16px] bg-white/80 px-3 py-3">
            <SummaryRow
              label={CHECKOUT_COPY.orderNumber}
              value={session.order.orderNumber}
            />
            <SummaryRow
              label={CHECKOUT_COPY.total}
              value={formatCurrency(
                session.order.total,
                session.order.currency,
              )}
            />
          </View>
        ) : null}

        <Button className="h-11 rounded-[16px]" onPress={onViewOrders}>
          <Text className="font-semibold">{CHECKOUT_COPY.viewOrders}</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="gap-4 rounded-[20px] border border-border bg-card px-4 py-5">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <QrCode size={20} color="#7C5134" />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-foreground">
            {CHECKOUT_COPY.paymentPendingTitle}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {CHECKOUT_COPY.paymentPendingDescription}
          </Text>
        </View>
      </View>

      {session.payment?.qrImageDataUrl ? (
        <View className="items-center rounded-[20px] bg-muted/20 px-4 py-5">
          <Image
            source={{ uri: session.payment.qrImageDataUrl }}
            contentFit="contain"
            style={{ width: 240, height: 240 }}
          />
        </View>
      ) : null}

      <View className="gap-3 rounded-[16px] bg-muted/25 px-3 py-3">
        {session.order ? (
          <SummaryRow
            label={CHECKOUT_COPY.orderNumber}
            value={session.order.orderNumber}
          />
        ) : null}
        {countdownLabel ? (
          <SummaryRow label={CHECKOUT_COPY.qrExpires} value={countdownLabel} />
        ) : null}
        <SummaryRow
          label={CHECKOUT_COPY.total}
          value={formatCurrency(session.total, session.currency)}
          emphasized
        />
      </View>

      {isRefreshing ? (
        <View className="flex-row items-center gap-2">
          <LoaderCircle size={16} color="#7C5134" />
          <Text className="text-sm text-muted-foreground">
            {CHECKOUT_COPY.refreshing}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function SummaryRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text
        className={
          emphasized
            ? "text-base font-semibold text-foreground"
            : "text-sm text-muted-foreground"
        }
      >
        {label}
      </Text>
      <Text
        className={
          emphasized
            ? "text-base font-semibold text-foreground"
            : "text-sm font-medium text-foreground"
        }
      >
        {value}
      </Text>
    </View>
  );
}

function InlineNotice({
  title,
  description,
  tone = "info",
}: {
  title: string;
  description: string;
  tone?: "info" | "error";
}) {
  return (
    <View
      className={`rounded-[18px] border px-4 py-4 ${
        tone === "error"
          ? "border-destructive/20 bg-destructive/5"
          : "border-primary/15 bg-primary/5"
      }`}
    >
      <View className="flex-row items-start gap-3">
        <View className="mt-0.5">
          <CircleAlert
            size={18}
            color={tone === "error" ? "#DC2626" : "#7C5134"}
          />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-sm font-semibold text-foreground">{title}</Text>
          <Text className="text-sm text-muted-foreground">{description}</Text>
        </View>
      </View>
    </View>
  );
}

function EmptyCheckoutState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View className="gap-4 rounded-[22px] border border-dashed border-border bg-card px-5 py-10">
      <Text className="text-center text-xl font-semibold text-foreground">
        {title}
      </Text>
      <Text className="text-center text-sm text-muted-foreground">
        {description}
      </Text>
      <Button className="h-11 rounded-[16px]" onPress={onAction}>
        <Text className="font-semibold">{actionLabel}</Text>
      </Button>
    </View>
  );
}
