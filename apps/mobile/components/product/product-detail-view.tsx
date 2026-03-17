import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Coffee, Heart, Minus, Plus, Share2 } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import {
  Alert,
  Pressable,
  ScrollView,
  Share as NativeShare,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { CartCustomization } from "../../../../packages/api/src";

import { formatCurrency } from "@/components/account/my-account-helpers";
import {
  ActionHeader,
  HeaderIconButton,
} from "@/components/layout/action-header";
import { ScreenLayout } from "@/components/layout/screen-layout";
import {
  DEFAULT_EMPTY_ILLUSTRATION,
  EmptyState,
} from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { useAddCartItem } from "@/hooks/use-cart";
import {
  useAddFavorite,
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/use-favorites";
import { useProduct } from "@/hooks/use-product";
import type {
  ProductAddOn,
  ProductCustomization,
  ProductDetail,
  ProductNutritionalInfo,
} from "@/services/product.service";

const PRODUCT_DETAIL_COPY = {
  loadErrorTitle: "Unable to load product",
  loadErrorFallback: "The requested product could not be loaded.",
  noDescription: "Freshly prepared and made to order.",
  back: "Back",
  size: "Size",
  sugarLevel: "Sugar Level",
  iceLevel: "Ice Level",
  subtotal: "Subtotal",
  addToCart: "Add to Cart",
  addingToCart: "Adding...",
  unavailable: "Unavailable",
  favoriteError: "Unable to update favorites",
  shareError: "Unable to share product",
  addToCartError: "Unable to add item",
  addToCartSuccess: "Added to cart",
  addToCartSuccessMessage: "Your drink has been added to the cart.",
  imageFallback: "No image available",
  available: "Available today",
  unavailableBadge: "Currently unavailable",
  featured: "Featured",
  bestSelling: "Best seller",
  nutrition: "Nutrition",
  allergens: "Allergens",
  tags: "Tags",
  addOns: "Add-ons",
  gramsUnit: "g",
  milligramsUnit: "mg",
  protein: "Protein",
  carbohydrates: "Carbs",
  fat: "Fat",
  caffeine: "Caffeine",
  addOnAvailable: "Available",
  addOnUnavailable: "Unavailable",
} as const;

const ACCENT_COLOR = "#8B5E3C";
const ACCENT_SURFACE = "#F6EEE8";

type SupportedCustomizationType = "size" | "sugar_level" | "ice_level";

type SelectionOption = {
  id: string;
  label: string;
  detailLabel?: string;
  priceModifier: number;
  cartValue?: string;
};

export type ProductDetailViewProps = {
  productId?: string;
  presentation?: "screen" | "sheet";
  onRequestBack?: () => void;
  onRequestClose?: () => void;
};

export function ProductDetailView({
  productId,
  presentation = "screen",
  onRequestBack,
  onRequestClose,
}: ProductDetailViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data, isLoading, isError, error } = useProduct(productId);
  const favoritesQuery = useFavorites();
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();
  const addCartItemMutation = useAddCartItem();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedSugarId, setSelectedSugarId] = useState<string | null>(null);
  const [selectedIceId, setSelectedIceId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!data) {
      return;
    }

    setActiveImageIndex(0);
    setQuantity(1);
    setSelectedSizeId(
      getDefaultSelectionId(getCustomization(data.customizations, "size")),
    );
    setSelectedSugarId(
      getDefaultSelectionId(
        getCustomization(data.customizations, "sugar_level"),
      ),
    );
    setSelectedIceId(
      getDefaultSelectionId(getCustomization(data.customizations, "ice_level")),
    );
  }, [data]);

  const galleryImages = data?.images.length ? data.images : [""];
  const dotCount = galleryImages.length;
  const imageWidth = width - 32;
  const imageHeight = Math.min(Math.max(width * 0.86, 280), 360);
  const description =
    normalizeText(data?.description) || PRODUCT_DETAIL_COPY.noDescription;
  const sizeOptions = data
    ? buildSelectionOptions(getCustomization(data.customizations, "size"), data)
    : [];
  const sugarOptions = data
    ? buildSelectionOptions(
        getCustomization(data.customizations, "sugar_level"),
        data,
      )
    : [];
  const iceOptions = data
    ? buildSelectionOptions(
        getCustomization(data.customizations, "ice_level"),
        data,
      )
    : [];
  const selectedSizeOption = getSelectedOption(sizeOptions, selectedSizeId);
  const selectedSugarOption = getSelectedOption(sugarOptions, selectedSugarId);
  const selectedIceOption = getSelectedOption(iceOptions, selectedIceId);
  const unitSubtotal =
    (data?.basePrice ?? 0) +
    (selectedSizeOption?.priceModifier ?? 0) +
    (selectedSugarOption?.priceModifier ?? 0) +
    (selectedIceOption?.priceModifier ?? 0);
  const subtotal = unitSubtotal * quantity;
  const isFavorited =
    favoritesQuery.data?.items.some((item) => item.productId === data?.id) ??
    false;
  const isFavoritePending =
    (addFavoriteMutation.isPending &&
      addFavoriteMutation.variables === data?.id) ||
    (removeFavoriteMutation.isPending &&
      removeFavoriteMutation.variables === data?.id);
  const canAddToCart =
    Boolean(data?.isAvailable) && !addCartItemMutation.isPending;
  const nutritionalItems = data?.nutritionalInfo
    ? buildNutritionalItems(data.nutritionalInfo)
    : [];
  const statusBadges = data ? buildStatusBadges(data) : [];
  const isSheet = presentation === "sheet";
  const headerActionLabel = isSheet ? "Close" : PRODUCT_DETAIL_COPY.back;
  const effectiveBottomInset = isSheet ? 8 : insets.bottom;
  const contentBottomOffset = isSheet ? 144 : 168;

  async function handleShare() {
    if (!data) {
      return;
    }

    try {
      await NativeShare.share({
        message: `${data.name} • ${formatCurrency(
          unitSubtotal,
          data.currency,
        )}`,
      });
    } catch (shareError) {
      Alert.alert(PRODUCT_DETAIL_COPY.shareError, getErrorMessage(shareError));
    }
  }

  function handleBack() {
    if (isSheet) {
      onRequestClose?.();
      return;
    }

    if (onRequestBack) {
      onRequestBack();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  }

  function handleToggleFavorite() {
    if (!data || isFavoritePending) {
      return;
    }

    const onError = (favoriteError: unknown) => {
      Alert.alert(
        PRODUCT_DETAIL_COPY.favoriteError,
        getErrorMessage(favoriteError),
      );
    };

    if (isFavorited) {
      removeFavoriteMutation.mutate(data.id, { onError });
      return;
    }

    addFavoriteMutation.mutate(data.id, { onError });
  }

  function handleQuantityChange(nextQuantity: number) {
    setQuantity(Math.max(1, nextQuantity));
  }

  function handleAddToCart() {
    if (!data || !canAddToCart) {
      return;
    }

    addCartItemMutation.mutate(
      {
        productId: data.id,
        quantity,
        customization: buildCartCustomization({
          size: selectedSizeOption?.cartValue,
          sugarLevel: selectedSugarOption?.cartValue,
          iceLevel: selectedIceOption?.cartValue,
        }),
      },
      {
        onSuccess: () => {
          Alert.alert(
            PRODUCT_DETAIL_COPY.addToCartSuccess,
            PRODUCT_DETAIL_COPY.addToCartSuccessMessage,
          );
        },
        onError: (cartError) => {
          Alert.alert(
            PRODUCT_DETAIL_COPY.addToCartError,
            getErrorMessage(cartError),
          );
        },
      },
    );
  }

  function handleImageMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / Math.max(imageWidth, 1),
    );
    setActiveImageIndex(
      Math.max(0, Math.min(nextIndex, galleryImages.length - 1)),
    );
  }

  const content = isLoading ? (
    <>
      <ContentContainer
        asSheet={isSheet}
        className={isSheet ? "gap-7 px-4 pt-4" : "gap-7 px-4"}
        bottomInsetOffset={contentBottomOffset}
      >
        <ProductDetailLoadingState />
      </ContentContainer>
      <BottomActionBarSkeleton bottomInset={effectiveBottomInset} />
    </>
  ) : isError || !data ? (
    <ContentContainer
      asSheet={isSheet}
      className={isSheet ? "justify-center px-4 pt-4" : "justify-center px-4"}
    >
      <EmptyState
        title={PRODUCT_DETAIL_COPY.loadErrorTitle}
        description={error?.message ?? PRODUCT_DETAIL_COPY.loadErrorFallback}
        illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
        variant="error"
        centered
        actionLabel={headerActionLabel}
        onAction={handleBack}
      />
    </ContentContainer>
  ) : (
    <>
      <ContentContainer
        asSheet={isSheet}
        className="gap-7 px-4"
        bottomInsetOffset={contentBottomOffset}
        stickyHeader={
          <ActionHeader
            mode={isSheet ? "close" : "back"}
            label={headerActionLabel}
            leftAccessibilityLabel={
              isSheet ? "Close product details" : "Go back"
            }
            onLeftPress={handleBack}
            rightAccessory={
              <>
                <HeaderIconButton
                  accessibilityLabel="Share product"
                  onPress={handleShare}
                >
                  <Share2 size={18} color="#1F1A16" strokeWidth={2.1} />
                </HeaderIconButton>
                <HeaderIconButton
                  accessibilityLabel={
                    isFavorited ? "Remove favorite" : "Add favorite"
                  }
                  disabled={isFavoritePending}
                  onPress={handleToggleFavorite}
                >
                  <Heart
                    size={18}
                    color={isFavorited ? ACCENT_COLOR : "#1F1A16"}
                    fill={isFavorited ? ACCENT_COLOR : "transparent"}
                    strokeWidth={2.1}
                  />
                </HeaderIconButton>
              </>
            }
          />
        }
      >
        <View className="gap-4">
          <ProductImageScroller
            galleryImages={galleryImages}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            productId={data.id}
            imageFallbackLabel={PRODUCT_DETAIL_COPY.imageFallback}
            onMomentumScrollEnd={handleImageMomentumScrollEnd}
          />
          {dotCount > 1 ? (
            <PaginationDots activeIndex={activeImageIndex} count={dotCount} />
          ) : null}
        </View>

        <View className="gap-3">
          <Text className="text-[26px] font-semibold uppercase text-foreground">
            {data.name}
          </Text>
          <Text className="text-[15px] leading-6 text-muted-foreground">
            {description}
          </Text>
        </View>

        {statusBadges.length ? (
          <View className="flex-row flex-wrap gap-2">
            {statusBadges.map((badge) => (
              <StatusChip key={badge} label={badge} />
            ))}
          </View>
        ) : null}

        {sizeOptions.length ? (
          <SelectionSection title={PRODUCT_DETAIL_COPY.size}>
            <View className="flex-row gap-3">
              {sizeOptions.map((option) => (
                <SizeOptionCard
                  key={option.id}
                  option={option}
                  selected={selectedSizeOption?.id === option.id}
                  onPress={() => {
                    setSelectedSizeId(option.id);
                  }}
                />
              ))}
            </View>
          </SelectionSection>
        ) : null}

        {sugarOptions.length ? (
          <SelectionSection title={PRODUCT_DETAIL_COPY.sugarLevel}>
            <View className="flex-row flex-wrap gap-3">
              {sugarOptions.map((option) => (
                <ChoiceChip
                  key={option.id}
                  label={option.label}
                  selected={selectedSugarOption?.id === option.id}
                  onPress={() => {
                    setSelectedSugarId(option.id);
                  }}
                />
              ))}
            </View>
          </SelectionSection>
        ) : null}

        {iceOptions.length ? (
          <SelectionSection title={PRODUCT_DETAIL_COPY.iceLevel}>
            <View className="flex-row flex-wrap gap-3">
              {iceOptions.map((option) => (
                <ChoiceChip
                  key={option.id}
                  label={option.label}
                  selected={selectedIceOption?.id === option.id}
                  onPress={() => {
                    setSelectedIceId(option.id);
                  }}
                />
              ))}
            </View>
          </SelectionSection>
        ) : null}

        {data.addOns.length ? (
          <SelectionSection title={PRODUCT_DETAIL_COPY.addOns}>
            <View className="gap-3">
              {data.addOns.map((addOn) => (
                <AddOnRow
                  key={addOn.id}
                  addOn={addOn}
                  currency={data.currency}
                />
              ))}
            </View>
          </SelectionSection>
        ) : null}

        {nutritionalItems.length ? (
          <SelectionSection title={PRODUCT_DETAIL_COPY.nutrition}>
            <View className="flex-row flex-wrap gap-3">
              {nutritionalItems.map((item) => (
                <DetailStatCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </View>
          </SelectionSection>
        ) : null}

        {data.allergens.length ? (
          <SelectionSection title={PRODUCT_DETAIL_COPY.allergens}>
            <View className="flex-row flex-wrap gap-2">
              {data.allergens.map((allergen) => (
                <NeutralChip key={allergen} label={allergen} />
              ))}
            </View>
          </SelectionSection>
        ) : null}

        {data.tags.length ? (
          <SelectionSection title={PRODUCT_DETAIL_COPY.tags}>
            <View className="flex-row flex-wrap gap-2">
              {data.tags.map((tag) => (
                <NeutralChip key={tag} label={tag} />
              ))}
            </View>
          </SelectionSection>
        ) : null}
      </ContentContainer>

      <BottomActionBar
        bottomInset={effectiveBottomInset}
        subtotalLabel={PRODUCT_DETAIL_COPY.subtotal}
        subtotalValue={formatCurrency(subtotal, data.currency)}
        quantity={quantity}
        onDecrease={() => {
          handleQuantityChange(quantity - 1);
        }}
        onIncrease={() => {
          handleQuantityChange(quantity + 1);
        }}
        buttonLabel={
          addCartItemMutation.isPending
            ? PRODUCT_DETAIL_COPY.addingToCart
            : data.isAvailable
              ? PRODUCT_DETAIL_COPY.addToCart
              : PRODUCT_DETAIL_COPY.unavailable
        }
        onAddToCart={handleAddToCart}
        disabled={!canAddToCart}
      />
    </>
  );

  return <View className="flex-1 bg-background">{content}</View>;
}

export default ProductDetailView;

function ContentContainer({
  asSheet,
  className,
  bottomInsetOffset,
  stickyHeader,
  children,
}: {
  asSheet: boolean;
  className?: string;
  bottomInsetOffset?: number;
  stickyHeader?: ReactNode;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  if (asSheet) {
    return (
      <BottomSheetScrollView
        stickyHeaderIndices={stickyHeader ? [0] : undefined}
        contentContainerStyle={{
          paddingBottom: (bottomInsetOffset ?? 0) + 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        {stickyHeader ? (
          <View className="bg-background px-4 pb-3 pt-4">{stickyHeader}</View>
        ) : null}
        <View className={className}>{children}</View>
      </BottomSheetScrollView>
    );
  }

  if (stickyHeader) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: insets.bottom + (bottomInsetOffset ?? 28),
        }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View className="bg-background px-4 pb-3">{stickyHeader}</View>
        <View className={className}>{children}</View>
      </ScrollView>
    );
  }

  return (
    <ScreenLayout
      contentClassName={className}
      topInsetOffset={12}
      bottomInsetOffset={bottomInsetOffset}
    >
      {children}
    </ScreenLayout>
  );
}

function ProductImageScroller({
  galleryImages,
  imageWidth,
  imageHeight,
  productId,
  imageFallbackLabel,
  onMomentumScrollEnd,
}: {
  galleryImages: string[];
  imageWidth: number;
  imageHeight: number;
  productId: string;
  imageFallbackLabel: string;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  return (
    <ScrollView
      horizontal
      pagingEnabled
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={onMomentumScrollEnd}
    >
      {galleryImages.map((imageUri, index) => (
        <View key={`${productId}-image-${index}`} style={{ width: imageWidth }}>
          {imageUri.trim() ? (
            <Image
              source={{ uri: imageUri }}
              contentFit="cover"
              transition={160}
              style={[
                styles.productImage,
                {
                  width: imageWidth,
                  height: imageHeight,
                },
              ]}
            />
          ) : (
            <View
              className="items-center justify-center rounded-[28px] bg-card"
              style={{
                width: imageWidth,
                height: imageHeight,
              }}
            >
              <Coffee size={28} color={ACCENT_COLOR} strokeWidth={2.1} />
              <Text className="mt-3 text-sm text-muted-foreground">
                {imageFallbackLabel}
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function SelectionSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3">
      <Text className="text-base font-semibold text-foreground">{title}</Text>
      {children}
    </View>
  );
}

function DetailStatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[150px] flex-1 rounded-[18px] border border-border bg-card px-4 py-4">
      <Text className="text-sm font-medium text-muted-foreground">{label}</Text>
      <Text className="mt-1 text-base font-semibold text-foreground">
        {value}
      </Text>
    </View>
  );
}

function SizeOptionCard({
  option,
  selected,
  onPress,
}: {
  option: SelectionOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-w-[92px] flex-1 rounded-[18px] border px-4 py-4 active:opacity-90"
      style={{
        borderColor: selected ? ACCENT_COLOR : "#E6DDD6",
        backgroundColor: selected ? ACCENT_SURFACE : "#FFFFFF",
      }}
      onPress={onPress}
    >
      <Text
        className="text-center text-lg font-semibold"
        style={{ color: selected ? ACCENT_COLOR : "#1F1A16" }}
      >
        {option.label}
      </Text>
      {option.detailLabel ? (
        <Text className="mt-1 text-center text-sm text-muted-foreground">
          {option.detailLabel}
        </Text>
      ) : null}
    </Pressable>
  );
}

function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-full border px-4 py-3 active:opacity-90"
      style={{
        borderColor: selected ? ACCENT_COLOR : "#E6DDD6",
        backgroundColor: selected ? ACCENT_SURFACE : "#FFFFFF",
      }}
      onPress={onPress}
    >
      <Text
        className="text-sm font-medium"
        style={{ color: selected ? ACCENT_COLOR : "#443730" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StatusChip({ label }: { label: string }) {
  return (
    <View
      className="rounded-full border px-3 py-2"
      style={{ borderColor: "#E5D4C7", backgroundColor: ACCENT_SURFACE }}
    >
      <Text className="text-sm font-medium" style={{ color: ACCENT_COLOR }}>
        {label}
      </Text>
    </View>
  );
}

function NeutralChip({ label }: { label: string }) {
  return (
    <View className="rounded-full border border-border bg-card px-3 py-2">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
    </View>
  );
}

function AddOnRow({
  addOn,
  currency,
}: {
  addOn: ProductAddOn;
  currency: string;
}) {
  return (
    <View className="rounded-[18px] border border-border bg-card px-4 py-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-foreground">
            {addOn.name}
          </Text>
          {addOn.description ? (
            <Text className="text-sm leading-5 text-muted-foreground">
              {addOn.description}
            </Text>
          ) : null}
        </View>

        <Text className="text-sm font-semibold" style={{ color: ACCENT_COLOR }}>
          +{formatCurrency(addOn.price, currency)}
        </Text>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-sm text-muted-foreground">
          {formatAddOnCategory(addOn.category)}
        </Text>
        <Text
          className="text-sm font-medium"
          style={{ color: addOn.isAvailable ? ACCENT_COLOR : "#8A7F78" }}
        >
          {addOn.isAvailable
            ? PRODUCT_DETAIL_COPY.addOnAvailable
            : PRODUCT_DETAIL_COPY.addOnUnavailable}
        </Text>
      </View>
    </View>
  );
}

function PaginationDots({
  activeIndex,
  count,
}: {
  activeIndex: number;
  count: number;
}) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={`pagination-dot-${index}`}
          className="rounded-full"
          style={{
            width: 8,
            height: 8,
            backgroundColor:
              index === activeIndex ? ACCENT_COLOR : "rgba(68, 55, 48, 0.18)",
          }}
        />
      ))}
    </View>
  );
}

function BottomActionBar({
  bottomInset,
  subtotalLabel,
  subtotalValue,
  quantity,
  onDecrease,
  onIncrease,
  buttonLabel,
  disabled,
  onAddToCart,
}: {
  bottomInset: number;
  subtotalLabel: string;
  subtotalValue: string;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  buttonLabel: string;
  disabled: boolean;
  onAddToCart: () => void;
}) {
  return (
    <View
      className="border-t border-border bg-background px-4 pt-3"
      style={{ paddingBottom: bottomInset + 12 }}
    >
      <View className="mb-3 rounded-[20px] border border-border bg-card px-4 py-3">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-sm font-medium text-muted-foreground">
            {subtotalLabel}
          </Text>
          <Text
            className="text-lg font-semibold"
            style={{ color: ACCENT_COLOR }}
          >
            {subtotalValue}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center rounded-[20px] border border-border bg-card px-2 py-2">
          <StepperButton
            accessibilityLabel="Decrease quantity"
            disabled={quantity <= 1}
            onPress={onDecrease}
          >
            <Minus size={18} color="#1F1A16" strokeWidth={2.1} />
          </StepperButton>
          <Text className="min-w-[34px] text-center text-base font-semibold text-foreground">
            {quantity}
          </Text>
          <StepperButton
            accessibilityLabel="Increase quantity"
            onPress={onIncrease}
          >
            <Plus size={18} color="#1F1A16" strokeWidth={2.1} />
          </StepperButton>
        </View>

        <Pressable
          accessibilityRole="button"
          className="h-14 flex-1 items-center justify-center rounded-[20px] active:opacity-90"
          style={{
            backgroundColor: disabled ? "#D0C3B8" : ACCENT_COLOR,
          }}
          disabled={disabled}
          onPress={onAddToCart}
        >
          <Text className="text-base font-semibold text-white">
            {buttonLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function StepperButton({
  children,
  accessibilityLabel,
  disabled,
  onPress,
}: {
  children: ReactNode;
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="h-10 w-10 items-center justify-center rounded-[14px] active:opacity-80"
      style={{ opacity: disabled ? 0.45 : 1 }}
      disabled={disabled}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}

function ProductDetailLoadingState() {
  return (
    <>
      <View className="flex-row items-center justify-between">
        <View className="h-10 w-20 rounded-full bg-muted" />
        <View className="flex-row gap-3">
          <View className="h-11 w-11 rounded-full bg-muted" />
          <View className="h-11 w-11 rounded-full bg-muted" />
        </View>
      </View>

      <View className="h-[320px] rounded-[28px] bg-muted" />

      <View className="items-center">
        <View className="h-2 w-16 rounded-full bg-muted" />
      </View>

      <View className="gap-3">
        <View className="h-8 w-2/3 rounded-full bg-muted" />
        <View className="h-4 w-full rounded-full bg-muted" />
        <View className="h-4 w-5/6 rounded-full bg-muted" />
      </View>

      {Array.from({ length: 3 }).map((_, index) => (
        <View key={`detail-section-loading-${index}`} className="gap-3">
          <View className="h-5 w-28 rounded-full bg-muted" />
          <View className="h-14 rounded-[18px] bg-muted" />
        </View>
      ))}

      <View className="h-16 rounded-[22px] bg-muted" />
    </>
  );
}

function BottomActionBarSkeleton({ bottomInset }: { bottomInset: number }) {
  return (
    <View
      className="border-t border-border bg-background px-4 pt-3"
      style={{ paddingBottom: bottomInset + 12 }}
    >
      <View className="mb-3 h-[54px] rounded-[20px] border border-border bg-card px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="h-4 w-20 rounded-full bg-muted" />
          <View className="h-6 w-24 rounded-full bg-muted" />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="h-14 w-32 rounded-[20px] bg-muted" />
        <View className="h-14 flex-1 rounded-[20px] bg-muted" />
      </View>
    </View>
  );
}

function getCustomization(
  customizations: ProductCustomization[],
  customizationType: SupportedCustomizationType,
) {
  return (
    customizations.find(
      (customization) => customization.customizationType === customizationType,
    ) ?? null
  );
}

function buildSelectionOptions(
  customization: ProductCustomization | null,
  product: ProductDetail,
) {
  if (!customization) {
    return [];
  }

  return customization.options.map((option) => {
    if (customization.customizationType === "size") {
      const mappedSize = mapSizeOption(option.name);

      return {
        id: option.id,
        label: mappedSize.label,
        detailLabel: formatCurrency(
          product.basePrice + option.priceModifier,
          product.currency,
        ),
        priceModifier: option.priceModifier,
        cartValue: mappedSize.cartValue,
      };
    }

    if (customization.customizationType === "sugar_level") {
      const mappedSugarLevel = mapSugarLevel(option.name);

      return {
        id: option.id,
        label: mappedSugarLevel.label,
        priceModifier: option.priceModifier,
        cartValue: mappedSugarLevel.cartValue,
      };
    }

    const mappedIceLevel = mapIceLevel(option.name);

    return {
      id: option.id,
      label: mappedIceLevel.label,
      priceModifier: option.priceModifier,
      cartValue: mappedIceLevel.cartValue,
    };
  });
}

function getDefaultSelectionId(customization: ProductCustomization | null) {
  if (!customization) {
    return null;
  }

  return (
    customization.options.find((option) => option.isDefault)?.id ??
    customization.options[0]?.id ??
    null
  );
}

function getSelectedOption(
  options: SelectionOption[],
  selectedId: string | null,
) {
  return (
    options.find((option) => option.id === selectedId) ?? options[0] ?? null
  );
}

function buildCartCustomization({
  size,
  sugarLevel,
  iceLevel,
}: {
  size?: string;
  sugarLevel?: string;
  iceLevel?: string;
}) {
  const customization: CartCustomization = {};

  if (isCartSize(size)) {
    customization.size = size;
  }

  if (isCartSweetness(sugarLevel)) {
    customization.sugarLevel = sugarLevel;
  }

  if (isCartSweetness(iceLevel)) {
    customization.iceLevel = iceLevel;
  }

  return Object.keys(customization).length ? customization : undefined;
}

function mapSizeOption(name: string) {
  const normalized = normalizeOptionName(name);

  if (normalized === "s" || normalized.includes("small")) {
    return { label: "S", cartValue: "small" };
  }

  if (
    normalized === "m" ||
    normalized.includes("medium") ||
    normalized.includes("regular")
  ) {
    return { label: "M", cartValue: "medium" };
  }

  if (normalized === "l" || normalized.includes("large")) {
    return { label: "L", cartValue: "large" };
  }

  return {
    label: name.trim().slice(0, 2).toUpperCase() || "M",
    cartValue: undefined,
  };
}

function mapSugarLevel(name: string) {
  const normalized = normalizeOptionName(name);

  if (
    normalized.includes("none") ||
    normalized.includes("no sweet") ||
    normalized.includes("zero")
  ) {
    return { label: "No Sweet", cartValue: "none" };
  }

  if (normalized.includes("less") || normalized.includes("low")) {
    return { label: "Less Sweet", cartValue: "low" };
  }

  if (
    normalized.includes("normal") ||
    normalized.includes("medium") ||
    normalized.includes("regular")
  ) {
    return { label: "Normal Sweet", cartValue: "medium" };
  }

  if (normalized.includes("more") || normalized.includes("high")) {
    return { label: "More Sweet", cartValue: "high" };
  }

  return { label: name.trim(), cartValue: undefined };
}

function mapIceLevel(name: string) {
  const normalized = normalizeOptionName(name);

  if (normalized.includes("none") || normalized.includes("no ice")) {
    return { label: "No Ice", cartValue: "none" };
  }

  if (normalized.includes("less") || normalized.includes("low")) {
    return { label: "Less Ice", cartValue: "low" };
  }

  if (
    normalized.includes("normal") ||
    normalized.includes("medium") ||
    normalized.includes("regular")
  ) {
    return { label: "Normal Ice", cartValue: "medium" };
  }

  if (normalized.includes("more") || normalized.includes("high")) {
    return { label: "More Ice", cartValue: "high" };
  }

  return { label: name.trim(), cartValue: undefined };
}

function normalizeOptionName(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ");
}

function normalizeText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "";
}

function buildStatusBadges(product: ProductDetail) {
  const badges: string[] = [
    product.isAvailable
      ? PRODUCT_DETAIL_COPY.available
      : PRODUCT_DETAIL_COPY.unavailableBadge,
  ];

  if (product.isFeatured) {
    badges.push(PRODUCT_DETAIL_COPY.featured);
  }

  if (product.isBestSelling) {
    badges.push(PRODUCT_DETAIL_COPY.bestSelling);
  }

  return badges;
}

function buildNutritionalItems(nutritionalInfo: ProductNutritionalInfo) {
  return [
    formatNutritionItem(
      PRODUCT_DETAIL_COPY.protein,
      nutritionalInfo.protein,
      PRODUCT_DETAIL_COPY.gramsUnit,
    ),
    formatNutritionItem(
      PRODUCT_DETAIL_COPY.carbohydrates,
      nutritionalInfo.carbohydrates,
      PRODUCT_DETAIL_COPY.gramsUnit,
    ),
    formatNutritionItem(
      PRODUCT_DETAIL_COPY.fat,
      nutritionalInfo.fat,
      PRODUCT_DETAIL_COPY.gramsUnit,
    ),
    formatNutritionItem(
      PRODUCT_DETAIL_COPY.caffeine,
      nutritionalInfo.caffeine,
      PRODUCT_DETAIL_COPY.milligramsUnit,
    ),
  ].filter((item): item is { label: string; value: string } => Boolean(item));
}

function formatNutritionItem(
  label: string,
  value: number | undefined,
  unit: string,
) {
  if (typeof value !== "number") {
    return null;
  }

  return {
    label,
    value: `${value} ${unit}`,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Please try again.";
}

function isCartSize(
  value?: string,
): value is NonNullable<CartCustomization["size"]> {
  return value === "small" || value === "medium" || value === "large";
}

function isCartSweetness(
  value?: string,
): value is NonNullable<CartCustomization["sugarLevel"]> {
  return (
    value === "none" ||
    value === "low" ||
    value === "medium" ||
    value === "high"
  );
}

function formatAddOnCategory(category: ProductAddOn["category"]) {
  return category
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

const styles = StyleSheet.create({
  productImage: {
    borderRadius: 28,
    backgroundColor: "#F3EFEB",
  },
});
