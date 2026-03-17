import { Image } from "expo-image";
import type { FavoriteItem } from "../../../../packages/api/src";
import { memo } from "react";
import { View } from "react-native";
import { Clock3, Heart, Star } from "lucide-react-native";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  formatFavoriteCurrency,
  formatFavoriteSavedDate,
  getFavoriteImageUri,
} from "@/components/favorite/favorite-utils";

type FavoriteListCardProps = {
  favorite: FavoriteItem;
  accentColor: string;
  isRemoving?: boolean;
  onRemove?: (favorite: FavoriteItem) => void;
};

export const FavoriteListCard = memo(function FavoriteListCard({
  favorite,
  accentColor,
  isRemoving = false,
  onRemove,
}: FavoriteListCardProps) {
  const imageUri = getFavoriteImageUri(favorite.images);

  return (
    <View
      className="overflow-hidden rounded-[28px] border border-border px-5 py-5"
      style={{ backgroundColor: accentColor }}
    >
      <View className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/45" />

      <View className="flex-row items-start gap-4">
        <View className="h-24 w-24 overflow-hidden rounded-[24px] bg-white/80">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              contentFit="cover"
              transition={150}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Heart size={24} color="#9A6B3A" strokeWidth={2.2} />
            </View>
          )}
        </View>

        <View className="flex-1 gap-2">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text variant="heading" className="text-[18px] leading-6">
                {favorite.name}
              </Text>
              <Text
                color="tertiary"
                variant="subhead"
                className="mt-1 leading-5"
                numberOfLines={2}
              >
                {favorite.description}
              </Text>
            </View>

            <Badge
              variant={favorite.isAvailable ? "secondary" : "outline"}
              className="rounded-full border-0 bg-white/80 px-3 py-1"
            >
              <Text className="text-xs font-semibold">
                {favorite.isAvailable ? "Available" : "Unavailable"}
              </Text>
            </Badge>
          </View>

          <View className="flex-row items-center justify-between gap-3">
            <Text variant="title3" className="font-bold">
              {formatFavoriteCurrency(favorite.basePrice, favorite.currency)}
            </Text>

            {typeof favorite.rating === "number" ? (
              <View className="flex-row items-center gap-1">
                <Star size={15} color="#D97706" fill="#D97706" />
                <Text className="text-sm font-medium text-foreground">
                  {favorite.rating.toFixed(1)} ({favorite.totalReviews})
                </Text>
              </View>
            ) : (
              <Text className="text-sm font-medium text-[#6A4E39]">
                {favorite.totalReviews > 0
                  ? `${favorite.totalReviews} reviews`
                  : "New favorite"}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View className="mt-5 rounded-[22px] bg-white/75 px-4 py-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-2">
            <Clock3 size={16} color="#7B6A59" strokeWidth={2.1} />
            <Text className="text-sm font-medium text-foreground">
              {favorite.preparationTime} min prep
            </Text>
          </View>

          <Text className="text-sm font-medium text-[#6A4E39]">
            Saved {formatFavoriteSavedDate(favorite.favoritedAt)}
          </Text>
        </View>
      </View>

      {onRemove ? (
        <Button
          variant="outline"
          className="mt-4 h-11 rounded-[20px] border-0 bg-white/70"
          disabled={isRemoving}
          onPress={() => {
            onRemove(favorite);
          }}
        >
          <Text className="font-semibold text-[#4F3A2C]">
            {isRemoving ? "Removing..." : "Remove from favorites"}
          </Text>
        </Button>
      ) : null}
    </View>
  );
});
