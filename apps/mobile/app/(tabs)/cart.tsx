import { Image } from "expo-image";
import { Trash2 } from "lucide-react-native";
import * as React from "react";
import { Alert, Pressable, View } from "react-native";
import { FadeInUp } from "react-native-reanimated";

import { formatCurrency } from "@/components/account/my-account-helpers";
import { ScreenLayout } from "@/components/layout/screen-layout";
import {
  DEFAULT_EMPTY_ILLUSTRATION,
  EmptyState,
} from "@/components/ui/empty-state";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
  useValidateCart,
} from "@/hooks/use-cart";
import type { CartCustomization, CartItem } from "../../../../packages/api/src";

const CART_SCREEN_COPY = {
  title: "Cart",
  loadingErrorTitle: "Unable to load your cart",
  emptyTitle: "Your cart is empty",
  emptyDescription: "Items you add from the menu will appear here.",
  removeTitle: "Remove item",
  removeFallbackName: "this item",
  clearTitle: "Clear cart",
  clearDescription: "This will remove all items from your cart.",
  clearAction: "Clear",
  cancelAction: "Cancel",
  removeAction: "Remove",
  currentOrder: "Current order",
  cartNeedsAttention: "Cart needs attention",
  summaryTitle: "Summary",
  orderNotesTitle: "Order notes",
  proceedAction: "Proceed to checkout",
  tryAgainAction: "Try again",
  checkingAction: "Checking...",
  validateAction: "Validate",
  clearingAction: "Clearing...",
  clearButton: "Clear",
  removingAction: "Removing...",
  removeButton: "Remove",
  noImage: "No image",
  subtotalLabel: "Subtotal",
  taxLabel: "Tax",
  deliveryFeeLabel: "Delivery fee",
  discountLabel: "Discount",
  totalLabel: "Total",
  availableLabel: "Available",
  unavailableLabel: "Unavailable",
} as const;

export default function CartScreen() {
  const cartQuery = useCart();
  const updateQuantityMutation = useUpdateCartItemQuantity();
  const removeItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const validateCartMutation = useValidateCart();

  const cart = cartQuery.data;
  const items = cart?.items ?? [];

  const handleRetry = React.useCallback(() => {
    void cartQuery.refetch();
  }, [cartQuery]);

  const handleDecrease = React.useCallback(
    (item: CartItem) => {
      if (item.quantity <= 1) {
        Alert.alert(
          CART_SCREEN_COPY.removeTitle,
          `Remove ${item.product?.name ?? CART_SCREEN_COPY.removeFallbackName} from your cart?`,
          [
            { text: CART_SCREEN_COPY.cancelAction, style: "cancel" },
            {
              text: CART_SCREEN_COPY.removeAction,
              style: "destructive",
              onPress: () => {
                removeItemMutation.mutate(item.id);
              },
            },
          ],
        );
        return;
      }

      updateQuantityMutation.mutate({
        itemId: item.id,
        payload: { quantity: item.quantity - 1 },
      });
    },
    [removeItemMutation, updateQuantityMutation],
  );

  const handleIncrease = React.useCallback(
    (item: CartItem) => {
      updateQuantityMutation.mutate({
        itemId: item.id,
        payload: { quantity: item.quantity + 1 },
      });
    },
    [updateQuantityMutation],
  );

  const handleRemove = React.useCallback(
    (item: CartItem) => {
      Alert.alert(
        CART_SCREEN_COPY.removeTitle,
        `Remove ${item.product?.name ?? CART_SCREEN_COPY.removeFallbackName} from your cart?`,
        [
          { text: CART_SCREEN_COPY.cancelAction, style: "cancel" },
          {
            text: CART_SCREEN_COPY.removeAction,
            style: "destructive",
            onPress: () => {
              removeItemMutation.mutate(item.id);
            },
          },
        ],
      );
    },
    [removeItemMutation],
  );

  const handleClearCart = React.useCallback(() => {
    Alert.alert(
      CART_SCREEN_COPY.clearTitle,
      CART_SCREEN_COPY.clearDescription,
      [
        { text: CART_SCREEN_COPY.cancelAction, style: "cancel" },
        {
          text: CART_SCREEN_COPY.clearAction,
          style: "destructive",
          onPress: () => {
            clearCartMutation.mutate();
          },
        },
      ],
    );
  }, [clearCartMutation]);

  const handleValidateCart = React.useCallback(() => {
    validateCartMutation.mutate();
  }, [validateCartMutation]);

  if (cartQuery.isLoading) {
    return <CartLoadingState />;
  }

  if (cartQuery.isError) {
    return (
      <ScreenLayout contentClassName="gap-5 px-4 pt-2">
        <ScreenTitle title={CART_SCREEN_COPY.title} />
        <EmptyState
          title={CART_SCREEN_COPY.loadingErrorTitle}
          description={cartQuery.error?.message}
          variant="error"
          centered
          actionLabel={CART_SCREEN_COPY.tryAgainAction}
          onAction={handleRetry}
        />
      </ScreenLayout>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <ScreenLayout contentClassName="gap-5 px-4 pt-2">
        <ScreenTitle title={CART_SCREEN_COPY.title} />
        <EmptyState
          title={CART_SCREEN_COPY.emptyTitle}
          description={CART_SCREEN_COPY.emptyDescription}
          illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
          centered
          className="border-dashed"
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout contentClassName="gap-5 px-4 pt-2">
      <ScreenTitle
        title={CART_SCREEN_COPY.title}
        action={
          <Button
            variant="ghost"
            size="sm"
            disabled={clearCartMutation.isPending}
            onPress={handleClearCart}
          >
            <Text className="font-medium text-destructive">
              {clearCartMutation.isPending
                ? CART_SCREEN_COPY.clearingAction
                : CART_SCREEN_COPY.clearButton}
            </Text>
          </Button>
        }
      />

      <NativeOnlyAnimatedView entering={FadeInUp.delay(120).duration(360)}>
        <View className="flex-row items-center justify-between rounded-[18px] border border-border bg-card px-4 py-3">
          <View className="gap-1">
            <Text className="text-base font-semibold text-foreground">
              {cart.cart?.store?.name ?? CART_SCREEN_COPY.currentOrder}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
            </Text>
          </View>
        </View>
      </NativeOnlyAnimatedView>

      {validateCartMutation.data && !validateCartMutation.data.isValid ? (
        <NativeOnlyAnimatedView entering={FadeInUp.delay(150).duration(320)}>
          <View className="rounded-[18px] border border-destructive/20 bg-destructive/5 px-4 py-4">
            <Text className="text-sm font-semibold text-foreground">
              {CART_SCREEN_COPY.cartNeedsAttention}
            </Text>
            <View className="mt-2 gap-2">
              {validateCartMutation.data.issues.map((issue) => (
                <Text key={`${issue.itemId}-${issue.issue}`} className="text-sm text-muted-foreground">
                  • {issue.issue}
                </Text>
              ))}
            </View>
          </View>
        </NativeOnlyAnimatedView>
      ) : null}

      <View className="gap-4">
        {items.map((item, index) => (
          <NativeOnlyAnimatedView
            key={item.id}
            entering={FadeInUp.delay(170 + index * 50).duration(320)}
          >
            <CartItemCard
              item={item}
              isUpdating={
                updateQuantityMutation.isPending &&
                updateQuantityMutation.variables?.itemId === item.id
              }
              isRemoving={
                removeItemMutation.isPending &&
                removeItemMutation.variables === item.id
              }
              onDecrease={handleDecrease}
              onIncrease={handleIncrease}
              onRemove={handleRemove}
            />
          </NativeOnlyAnimatedView>
        ))}
      </View>

      <NativeOnlyAnimatedView entering={FadeInUp.delay(280).duration(360)}>
        <View className="gap-4 rounded-[20px] border border-border bg-card px-4 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">
              {CART_SCREEN_COPY.summaryTitle}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              disabled={validateCartMutation.isPending}
              onPress={handleValidateCart}
            >
              <Text className="font-medium">
                {validateCartMutation.isPending
                  ? CART_SCREEN_COPY.checkingAction
                  : CART_SCREEN_COPY.validateAction}
              </Text>
            </Button>
          </View>

          <SummaryRow
            label={CART_SCREEN_COPY.subtotalLabel}
            value={formatCurrency(cart.subtotal, "USD")}
          />
          <SummaryRow
            label={CART_SCREEN_COPY.taxLabel}
            value={formatCurrency(cart.tax, "USD")}
          />
          <SummaryRow
            label={CART_SCREEN_COPY.deliveryFeeLabel}
            value={formatCurrency(cart.deliveryFee, "USD")}
          />
          {cart.discount > 0 ? (
            <SummaryRow
              label={CART_SCREEN_COPY.discountLabel}
              value={formatCurrency(cart.discount, "USD")}
            />
          ) : null}

          <View className="h-px bg-border" />

          <SummaryRow
            label={CART_SCREEN_COPY.totalLabel}
            value={formatCurrency(cart.total, "USD")}
            emphasized
          />

          {cart.cart?.notes ? (
            <View className="rounded-[16px] bg-muted/40 px-3 py-3">
              <Text className="text-xs font-semibold uppercase tracking-[1px] text-muted-foreground">
                {CART_SCREEN_COPY.orderNotesTitle}
              </Text>
              <Text className="mt-1 text-sm text-foreground">
                {cart.cart.notes}
              </Text>
            </View>
          ) : null}

          <Button className="h-11 rounded-[16px]">
            <Text className="font-semibold">
              {CART_SCREEN_COPY.proceedAction}
            </Text>
          </Button>
        </View>
      </NativeOnlyAnimatedView>
    </ScreenLayout>
  );
}

function ScreenTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <View className="relative items-center justify-center pt-1">
      <Text className="text-2xl font-semibold text-foreground">{title}</Text>
      {action ? (
        <View className="absolute right-0 top-0">{action}</View>
      ) : null}
    </View>
  );
}

function CartItemCard({
  item,
  isUpdating,
  isRemoving,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: CartItem;
  isUpdating: boolean;
  isRemoving: boolean;
  onDecrease: (item: CartItem) => void;
  onIncrease: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
}) {
  const imageUri = item.product?.images[0]?.trim();
  const title = item.product?.name ?? "Unavailable item";
  const customizationLabel = formatCustomization(item.customization);

  return (
    <View className="rounded-[20px] border border-border bg-card px-4 py-4">
      <View className="flex-row gap-4">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            contentFit="cover"
            transition={150}
            style={{ width: 88, height: 88, borderRadius: 16 }}
          />
        ) : (
          <View className="h-[88px] w-[88px] items-center justify-center rounded-[16px] bg-muted/40">
            <Text className="text-xs font-medium text-muted-foreground">
              {CART_SCREEN_COPY.noImage}
            </Text>
          </View>
        )}

        <View className="flex-1 gap-2">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-foreground">
                {title}
              </Text>
              <Text className="text-sm font-medium text-foreground">
                {formatCurrency(item.totalPrice, item.product?.currency ?? "USD")}
              </Text>
            </View>

            <Badge
              variant={item.product?.isAvailable ? "secondary" : "outline"}
              className="rounded-full px-2.5 py-1"
            >
              <Text className="text-[10px] font-medium">
                {item.product?.isAvailable
                  ? CART_SCREEN_COPY.availableLabel
                  : CART_SCREEN_COPY.unavailableLabel}
              </Text>
            </Badge>
          </View>

          {customizationLabel ? (
            <Text className="text-sm text-muted-foreground">
              {customizationLabel}
            </Text>
          ) : null}

          {item.notes ? (
            <Text className="text-sm text-muted-foreground">{item.notes}</Text>
          ) : null}

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center rounded-full border border-border">
              <QuantityButton
                label="-"
                disabled={isUpdating || isRemoving}
                onPress={() => {
                  onDecrease(item);
                }}
              />
              <View className="min-w-[36px] items-center">
                <Text className="text-sm font-semibold text-foreground">
                  {item.quantity}
                </Text>
              </View>
              <QuantityButton
                label="+"
                disabled={isUpdating || isRemoving}
                onPress={() => {
                  onIncrease(item);
                }}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              className="flex-row items-center gap-1 rounded-full px-2 py-1 active:opacity-70"
              disabled={isRemoving}
              onPress={() => {
                onRemove(item);
              }}
            >
              <Trash2 size={14} color="#DC2626" strokeWidth={2} />
              <Text className="text-sm font-medium text-destructive">
                {isRemoving
                  ? CART_SCREEN_COPY.removingAction
                  : CART_SCREEN_COPY.removeButton}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function QuantityButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="h-9 w-9 items-center justify-center active:opacity-70"
      disabled={disabled}
      onPress={onPress}
    >
      <Text className="text-lg font-semibold text-foreground">{label}</Text>
    </Pressable>
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
    <View className="flex-row items-center justify-between">
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

function CartLoadingState() {
  return (
    <ScreenLayout contentClassName="gap-5 px-4 pt-2">
      <ScreenTitle title="Cart" />
      <View className="gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <View
            key={`cart-loading-${index}`}
            className="rounded-[20px] border border-border bg-card px-4 py-4"
          >
            <View className="flex-row gap-4">
              <View className="h-[88px] w-[88px] rounded-[16px] bg-muted" />
              <View className="flex-1 gap-3">
                <View className="h-5 w-2/3 rounded-full bg-muted" />
                <View className="h-4 w-1/3 rounded-full bg-muted" />
                <View className="h-4 w-full rounded-full bg-muted" />
                <View className="h-9 w-28 rounded-full bg-muted" />
              </View>
            </View>
          </View>
        ))}

        <View className="rounded-[20px] border border-border bg-card px-4 py-4">
          <View className="h-5 w-24 rounded-full bg-muted" />
          <View className="mt-4 h-4 w-full rounded-full bg-muted" />
          <View className="mt-3 h-4 w-full rounded-full bg-muted" />
          <View className="mt-3 h-4 w-5/6 rounded-full bg-muted" />
          <View className="mt-5 h-11 rounded-[16px] bg-muted" />
        </View>
      </View>
    </ScreenLayout>
  );
}

function formatCustomization(customization?: CartCustomization) {
  if (!customization) {
    return "";
  }

  const values = [
    customization.size,
    customization.sugarLevel,
    customization.iceLevel,
    customization.coffeeLevel,
  ].filter(Boolean);

  return values
    .map((value) => formatLabel(value as string))
    .join(" • ");
}

function formatLabel(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}
