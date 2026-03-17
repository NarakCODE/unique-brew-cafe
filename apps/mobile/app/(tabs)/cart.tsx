import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Trash2 } from "lucide-react-native";
import * as React from "react";
import { Alert, Pressable, View } from "react-native";
import { FadeInUp } from "react-native-reanimated";

import { formatCurrency } from "@/components/account/my-account-helpers";
import { ScreenLayout } from "@/components/layout/screen-layout";
import { ScreenTopBar } from "@/components/layout/screen-topbar";
import { ProductDetailView } from "@/components/product/product-detail-view";
import {
  DEFAULT_EMPTY_ILLUSTRATION,
  EmptyState,
} from "@/components/ui/empty-state";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
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
  quantityLabel: "Qty",
  subtotalLabel: "Subtotal",
  taxLabel: "Tax",
  deliveryFeeLabel: "Delivery fee",
  discountLabel: "Discount",
  totalLabel: "Total",
} as const;

export default function CartScreen() {
  const router = useRouter();
  const productSheetRef = React.useRef<BottomSheetModal>(null);
  const sheetSnapPoints = React.useRef(["92%"]).current;
  const cartQuery = useCart();
  const removeItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const validateCartMutation = useValidateCart();
  const [selectedProductId, setSelectedProductId] = React.useState<
    string | null
  >(null);

  const cart = cartQuery.data;
  const items = cart?.items ?? [];

  const handleRetry = React.useCallback(() => {
    void cartQuery.refetch();
  }, [cartQuery]);

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

  const handleOpenProduct = React.useCallback((item: CartItem) => {
    if (!item.productId) {
      return;
    }

    setSelectedProductId(item.productId);
    productSheetRef.current?.present();
  }, []);

  const handleDismissProductSheet = React.useCallback(() => {
    productSheetRef.current?.dismiss();
    setSelectedProductId(null);
  }, []);

  const renderSheetBackdrop = React.useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.18}
        pressBehavior="close"
      />
    ),
    [],
  );

  if (cartQuery.isLoading) {
    return <CartLoadingState />;
  }

  if (cartQuery.isError) {
    return (
      <ScreenLayout contentClassName="gap-5 px-4 pt-2">
        <ScreenTopBar title={CART_SCREEN_COPY.title} />
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
        <ScreenTopBar title={CART_SCREEN_COPY.title} />
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
    <>
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
                  <Text
                    key={`${issue.itemId}-${issue.issue}`}
                    className="text-sm text-muted-foreground"
                  >
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
                isRemoving={
                  removeItemMutation.isPending &&
                  removeItemMutation.variables === item.id
                }
                onOpen={handleOpenProduct}
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

            <Button
              className="h-11 rounded-[16px]"
              onPress={() => {
                router.push("/checkout");
              }}
            >
              <Text className="font-semibold">
                {CART_SCREEN_COPY.proceedAction}
              </Text>
            </Button>
          </View>
        </NativeOnlyAnimatedView>
      </ScreenLayout>

      <BottomSheetModal
        ref={productSheetRef}
        snapPoints={sheetSnapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        backdropComponent={renderSheetBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#D1C4B8", width: 44 }}
        backgroundStyle={{ backgroundColor: "#F8F5F2" }}
        onDismiss={() => {
          setSelectedProductId(null);
        }}
      >
        <BottomSheetView className="flex-1">
          {selectedProductId ? (
            <ProductDetailView
              productId={selectedProductId}
              presentation="sheet"
              onRequestClose={handleDismissProductSheet}
            />
          ) : null}
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

function ScreenTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return <ScreenTopBar title={title} rightAccessory={action} />;
}

function CartItemCard({
  item,
  isRemoving,
  onOpen,
  onRemove,
}: {
  item: CartItem;
  isRemoving: boolean;
  onOpen: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
}) {
  const imageUri = item.product?.images[0]?.trim();
  const title = item.product?.name ?? "Unavailable item";
  const customizationLabel = formatCustomization(item.customization);

  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-[20px] border border-border bg-card px-4 py-4 active:opacity-95"
      onPress={() => {
        onOpen(item);
      }}
    >
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
          </View>

          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-sm text-muted-foreground">
              {CART_SCREEN_COPY.quantityLabel} {item.quantity}
            </Text>
            {customizationLabel ? (
              <Text className="text-sm text-muted-foreground">
                • {customizationLabel}
              </Text>
            ) : null}
          </View>

          {item.notes ? (
            <Text className="text-sm text-muted-foreground">{item.notes}</Text>
          ) : null}

          <View className="flex-row items-center justify-between pt-1">
            <Text className="text-sm text-muted-foreground">
              {item.product?.preparationTime
                ? `${item.product.preparationTime} min prep`
                : ""}
            </Text>
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center gap-1 rounded-full px-2 py-1 active:opacity-70"
              disabled={isRemoving}
              onPress={(event) => {
                event.stopPropagation();
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
