import { useState } from "react";
import { Image } from "expo-image";
import { Plus } from "lucide-react-native";
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Pressable, ScrollView, View } from "react-native";

import { formatCurrency } from "@/components/account/my-account-helpers";
import { Text } from "@/components/ui/text";
import type { MobileProduct } from "@/services/product.service";

export function ExploreProductCard({
  product,
  onPress,
  onAddToCart,
}: {
  product: MobileProduct;
  onPress?: () => void;
  onAddToCart?: () => void;
}) {
  const addAction = onAddToCart ?? onPress;
  const addActionLabel = onAddToCart
    ? `Add ${product.name} to cart`
    : onPress
      ? `View ${product.name} details`
      : undefined;
  const galleryImages = getGalleryImages(product.images);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(0);

  function handleCarouselLayout(event: LayoutChangeEvent) {
    const { width } = event.nativeEvent.layout;

    if (width > 0 && width !== carouselWidth) {
      setCarouselWidth(width);
    }
  }

  function handleCarouselMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const width = event.nativeEvent.layoutMeasurement.width;

    if (!width) {
      return;
    }

    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveImageIndex(Math.max(0, Math.min(nextIndex, galleryImages.length - 1)));
  }

  return (
    <View className="flex-1 overflow-hidden rounded-[18px] border border-border bg-card">
      <View className="relative h-[136px]" onLayout={handleCarouselLayout}>
        {galleryImages.length > 1 && carouselWidth > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleCarouselMomentumScrollEnd}
          >
            {galleryImages.map((imageUri, index) => (
              <CardImage
                key={`${product.id}-image-${index}`}
                imageUri={imageUri}
                width={carouselWidth}
              />
            ))}
          </ScrollView>
        ) : (
          <CardImage imageUri={galleryImages[0] ?? ""} width={carouselWidth || undefined} />
        )}

        {!product.isAvailable ? (
          <View className="absolute left-3 top-3 rounded-full border border-border bg-background/95 px-3 py-1.5">
            <Text className="text-[11px] font-semibold uppercase tracking-[0.9px] text-foreground">
              Sold out
            </Text>
          </View>
        ) : null}

        {galleryImages.length > 1 ? (
          <View className="absolute inset-x-0 bottom-3 flex-row items-center justify-center gap-1.5">
            {galleryImages.map((_, index) => (
              <View
                key={`${product.id}-image-pill-${index}`}
                className="rounded-full"
                style={{
                  width: index === activeImageIndex ? 18 : 6,
                  height: 6,
                  backgroundColor:
                    index === activeImageIndex
                      ? "rgba(255, 255, 255, 0.96)"
                      : "rgba(255, 255, 255, 0.42)",
                }}
              />
            ))}
          </View>
        ) : null}
      </View>

      <View className="gap-3 px-4 py-4">
        {onPress ? (
          <Pressable className="gap-1 active:opacity-90" onPress={onPress}>
            <Text
              className="text-[15px] font-semibold text-foreground"
              numberOfLines={2}
            >
              {product.name}
            </Text>
          </Pressable>
        ) : (
          <View className="gap-1">
            <Text
              className="text-[15px] font-semibold text-foreground"
              numberOfLines={2}
            >
              {product.name}
            </Text>
          </View>
        )}

        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">
              {formatCurrency(product.basePrice, product.currency)}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={addActionLabel}
            className="h-11 w-11 items-center justify-center rounded-full border border-border bg-background active:opacity-90"
            disabled={!addAction || !product.isAvailable}
            onPress={addAction}
            style={{
              opacity: !product.isAvailable ? 0.45 : 1,
            }}
          >
            <Plus size={18} color="#1F1A16" strokeWidth={2.1} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function CardImage({
  imageUri,
  width,
}: {
  imageUri: string;
  width?: number;
}) {
  if (imageUri.trim()) {
    return (
      <Image
        source={{ uri: imageUri }}
        contentFit="cover"
        transition={150}
        style={{ width: width ?? "100%", height: 136 }}
      />
    );
  }

  return <View className="h-[136px] bg-muted" style={{ width: width ?? "100%" }} />;
}

function getGalleryImages(images?: string[]) {
  const normalizedImages =
    images?.map((image) => image.trim()).filter((image) => image.length > 0) ?? [];

  return normalizedImages.length ? normalizedImages : [""];
}
