import { Image } from "expo-image";
import { useCallback } from "react";
import type { FavoriteItem } from "../../../../packages/api/src";
import { FlashList } from "@shopify/flash-list";
import {
  Alert,
  RefreshControl,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock3, Heart, Star } from "lucide-react-native";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DEFAULT_EMPTY_ILLUSTRATION,
  EmptyState,
} from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { useFavorites, useRemoveFavorite } from "@/hooks/use-favorites";

export default function AccountFavoritesScreen() {
  const { data, isLoading, isError, error, isRefetching, refetch } =
    useFavorites();
  const removeFavoriteMutation = useRemoveFavorite();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleRemoveFavorite = useCallback(
    (favorite: FavoriteItem) => {
      Alert.alert(
        "Remove favorite",
        `Remove ${favorite.name} from your saved drinks?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              removeFavoriteMutation.mutate(favorite.productId);
            },
          },
        ],
      );
    },
    [removeFavoriteMutation],
  );

  const renderFavoriteItem = useCallback(
    ({ item }: { item: FavoriteItem }) => (
      <FavoriteCard
        favorite={item}
        isRemoving={
          removeFavoriteMutation.isPending &&
          removeFavoriteMutation.variables === item.productId
        }
        onRemove={handleRemoveFavorite}
      />
    ),
    [
      handleRemoveFavorite,
      removeFavoriteMutation.isPending,
      removeFavoriteMutation.variables,
    ],
  );

  const keyExtractor = useCallback(
    (item: FavoriteItem) => item.favoriteId,
    [],
  );

  if (isLoading) {
    return (
      <View className="gap-4 px-4 pt-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={`favorite-loading-${index}`}
            className="rounded-3xl border border-border bg-card py-0"
          >
            <CardContent className="gap-4 px-5 py-5">
              <View className="h-40 rounded-3xl bg-muted" />
              <View className="h-5 w-1/2 rounded-full bg-muted" />
              <View className="h-4 w-full rounded-full bg-muted" />
              <View className="h-4 w-2/3 rounded-full bg-muted" />
            </CardContent>
          </Card>
        ))}
      </View>
    );
  }

  return (
    <FlashList
      data={data?.items ?? []}
      renderItem={renderFavoriteItem}
      keyExtractor={keyExtractor}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: 8,
        paddingBottom: insets.bottom + 28,
        paddingHorizontal: 16,
      }}
      ItemSeparatorComponent={FavoritesSeparator}
      ListEmptyComponent={
        <FavoritesState
          isError={isError}
          errorMessage={error?.message}
          isRefreshing={isRefetching}
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          tintColor={colorScheme === "dark" ? "#F5F5F5" : "#5A3421"}
        />
      }
    />
  );
}

function FavoriteCard({
  favorite,
  isRemoving,
  onRemove,
}: {
  favorite: FavoriteItem;
  isRemoving: boolean;
  onRemove: (favorite: FavoriteItem) => void;
}) {
  const imageUri = getFirstImage(favorite.images);

  return (
    <Card className="overflow-hidden rounded-3xl border border-border bg-card py-0">
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          contentFit="cover"
          transition={150}
          style={styles.image}
        />
      ) : (
        <View className="h-48 items-center justify-center bg-muted">
          <Heart size={28} color="#9A6B3A" strokeWidth={2.2} />
        </View>
      )}

      <CardContent className="gap-4 px-5 py-5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xl font-semibold text-foreground">
              {favorite.name}
            </Text>
            <Text className="mt-1 text-base leading-6 text-muted-foreground">
              {favorite.description}
            </Text>
          </View>

          <Badge
            variant={favorite.isAvailable ? "secondary" : "outline"}
            className="rounded-full px-3 py-1"
          >
            <Text>{favorite.isAvailable ? "Available" : "Unavailable"}</Text>
          </Badge>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-foreground">
            {formatCurrency(favorite.basePrice, favorite.currency)}
          </Text>

          {typeof favorite.rating === "number" ? (
            <View className="flex-row items-center gap-1">
              <Star size={15} color="#D97706" fill="#D97706" />
              <Text className="text-sm font-medium text-foreground">
                {favorite.rating.toFixed(1)} ({favorite.totalReviews})
              </Text>
            </View>
          ) : (
            <Text className="text-sm text-muted-foreground">
              {favorite.totalReviews} reviews
            </Text>
          )}
        </View>

        <View className="flex-row items-center justify-between rounded-2xl bg-muted/50 px-4 py-4">
          <View className="flex-row items-center gap-2">
            <Clock3 size={16} color="#7B6A59" strokeWidth={2.1} />
            <Text className="text-sm font-medium text-foreground">
              {favorite.preparationTime} min prep
            </Text>
          </View>

          <Text className="text-sm text-muted-foreground">
            Saved {formatSavedDate(favorite.favoritedAt)}
          </Text>
        </View>

        <Button
          variant="outline"
          className="rounded-2xl"
          disabled={isRemoving}
          onPress={() => {
            onRemove(favorite);
          }}
        >
          <Text className="font-semibold">
            {isRemoving ? "Removing..." : "Remove from favorites"}
          </Text>
        </Button>
      </CardContent>
    </Card>
  );
}

function FavoritesState({
  isError,
  errorMessage,
  isRefreshing,
}: {
  isError: boolean;
  errorMessage?: string;
  isRefreshing: boolean;
}) {
  if (isRefreshing) {
    return null;
  }

  if (isError) {
    return (
      <EmptyState
        title="Unable to load favorites"
        description={errorMessage}
        variant="error"
      />
    );
  }

  return (
    <EmptyState
      title="Nothing saved yet"
      description="Save the drinks you return to most so they stay close when you need a quick pickup."
      illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
      centered
      className="border-dashed"
    />
  );
}

function FavoritesSeparator() {
  return <View style={styles.separator} />;
}

function getFirstImage(images?: string[]) {
  const firstImage = images?.[0]?.trim();

  if (!firstImage) {
    return null;
  }

  if (firstImage.startsWith("[")) {
    try {
      const parsed = JSON.parse(firstImage) as unknown;

      if (Array.isArray(parsed) && typeof parsed[0] === "string") {
        return parsed[0];
      }
    } catch {
      return firstImage;
    }
  }

  return firstImage;
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatSavedDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 192,
  },
  separator: {
    height: 16,
  },
});
