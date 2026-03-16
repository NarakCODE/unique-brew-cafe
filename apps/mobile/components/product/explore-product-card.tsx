import { Image } from "expo-image";
import { Clock3, Coffee, Star } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { formatCurrency } from "@/components/account/my-account-helpers";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import type { MobileProduct } from "@/services/product.service";

export function ExploreProductCard({
  product,
  onPress,
}: {
  product: MobileProduct;
  onPress?: () => void;
}) {
  const imageUri = getPrimaryImage(product.images);
  const description = normalizeDescription(product.description);
  const Container = onPress ? Pressable : View;

  return (
    <Container
      className="flex-1 overflow-hidden rounded-[18px] border border-border bg-card active:opacity-90"
      onPress={onPress}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          contentFit="cover"
          transition={150}
          style={{ width: "100%", height: 136 }}
        />
      ) : (
        <View className="h-[136px] items-center justify-center bg-muted/40">
          <View className="items-center gap-2">
            <View className="rounded-full bg-background p-3">
              <Coffee size={20} color="#7B6551" strokeWidth={2.1} />
            </View>
            <Text className="text-xs font-medium text-muted-foreground">
              No image
            </Text>
          </View>
        </View>
      )}

      <View className="gap-3 px-4 py-3.5">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 gap-1">
            <Text
              className="text-[15px] font-semibold text-foreground"
              numberOfLines={2}
            >
              {product.name}
            </Text>
            <Text className="text-sm font-semibold text-foreground">
              {formatCurrency(product.basePrice, product.currency)}
            </Text>
          </View>

          <Badge
            variant={product.isAvailable ? "secondary" : "outline"}
            className="rounded-full px-2 py-1"
          >
            <Text className="text-[10px] font-medium">
              {product.isAvailable ? "Available" : "Unavailable"}
            </Text>
          </Badge>
        </View>

        <Text
          color="tertiary"
          variant="footnote"
          className="leading-5"
          numberOfLines={3}
        >
          {description || "Freshly prepared and ready for your next pickup."}
        </Text>

        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-1.5">
            <Clock3 size={13} color="#7C806F" strokeWidth={2} />
            <Text className="text-xs font-medium text-muted-foreground">
              {product.preparationTime} min
            </Text>
          </View>

          {typeof product.rating === "number" ? (
            <View className="flex-row items-center gap-1.5">
              <Star size={13} color="#D97706" fill="#F59E0B" strokeWidth={1.8} />
              <Text className="text-xs font-medium text-foreground">
                {product.rating.toFixed(1)}
              </Text>
            </View>
          ) : (
            <Text className="text-xs font-medium text-muted-foreground">
              {product.totalReviews > 0
                ? `${product.totalReviews} reviews`
                : "New item"}
            </Text>
          )}
        </View>
      </View>
    </Container>
  );
}

function getPrimaryImage(images?: string[]) {
  const firstImage = images?.[0]?.trim();

  return firstImage ? firstImage : null;
}

function normalizeDescription(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
