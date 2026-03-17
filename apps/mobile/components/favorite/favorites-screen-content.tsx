import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Clock3, Heart } from "lucide-react-native";
import * as React from "react";
import { Alert, Pressable, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { FavoriteItem } from "../../../../packages/api/src";

import { formatCurrency } from "@/components/account/my-account-helpers";
import { ScreenTopBar } from "@/components/layout/screen-topbar";
import {
  formatFavoriteLatestDate,
  formatFavoriteSavedDate,
  getFavoriteImageUri,
} from "@/components/favorite/favorite-utils";
import {
  DEFAULT_EMPTY_ILLUSTRATION,
  EmptyState,
} from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { useFavorites, useRemoveFavorite } from "@/hooks/use-favorites";
import { AccountActionHeader } from "../account/account-action-header";

const FAVORITE_SCREEN_COPY = {
  title: "Saved",
  sectionTitle: "Saved items",
  sectionMetaFallback: "0 items",
  summaryLabel: "Latest save",
  emptyTitle: "Nothing saved yet",
  emptyDescription:
    "Save the drinks you return to most and they will appear here for quick access.",
  errorTitle: "Unable to load saved items",
  tryAgainAction: "Try again",
  removeTitle: "Remove favorite",
  cancelAction: "Cancel",
  removeAction: "Remove",
  removingAction: "Removing...",
  removeButton: "Remove",
  availableLabel: "Available",
  unavailableLabel: "Unavailable",
  noImage: "No image",
  noLatestSave: "None yet",
  latestSavePrefix: "Saved",
  profileAction: "Manage in account",
} as const;

type FavoritesScreenContentProps = {
  showTitle?: boolean;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  bottomInsetOffset?: number;
  headerComponent?: React.ReactNode;
};

export function FavoritesScreenContent({
  showTitle = true,
  emptyActionLabel = FAVORITE_SCREEN_COPY.profileAction,
  onEmptyAction,
  bottomInsetOffset = 168,
  headerComponent,
}: FavoritesScreenContentProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const favoritesQuery = useFavorites();
  const removeFavoriteMutation = useRemoveFavorite();

  const favorites = favoritesQuery.data?.items ?? [];
  const latestSaved = favorites[0]?.favoritedAt
    ? formatFavoriteLatestDate(favorites[0].favoritedAt)
    : FAVORITE_SCREEN_COPY.noLatestSave;

  const handleRefresh = React.useCallback(() => {
    void favoritesQuery.refetch();
  }, [favoritesQuery]);

  const handleRemoveFavorite = React.useCallback(
    (favorite: FavoriteItem) => {
      Alert.alert(
        FAVORITE_SCREEN_COPY.removeTitle,
        `Remove ${favorite.name} from your saved items?`,
        [
          { text: FAVORITE_SCREEN_COPY.cancelAction, style: "cancel" },
          {
            text: FAVORITE_SCREEN_COPY.removeAction,
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

  const handleEmptyAction = React.useCallback(() => {
    if (onEmptyAction) {
      onEmptyAction();
      return;
    }

    router.navigate("/account/favorites");
  }, [onEmptyAction, router]);

  const renderFavoriteItem = React.useCallback(
    ({ item }: { item: FavoriteItem }) => (
      <FavoriteCard
        favorite={item}
        isRemoving={
          removeFavoriteMutation.isPending &&
          removeFavoriteMutation.variables === item.productId
        }
        onPress={() => {
          router.push(`/product/${item.productId}`);
        }}
        onRemove={handleRemoveFavorite}
      />
    ),
    [
      handleRemoveFavorite,
      removeFavoriteMutation.isPending,
      removeFavoriteMutation.variables,
      router,
    ],
  );

  if (favoritesQuery.isLoading) {
    return (
      <View>
        <AccountActionHeader title="Favorite" />
        <FavoriteLoadingState
          showTitle={showTitle}
          headerComponent={headerComponent}
        />
      </View>
    );
  }

  return (
    <FlashList
      data={favorites}
      renderItem={renderFavoriteItem}
      keyExtractor={(item) => item.favoriteId}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + bottomInsetOffset,
      }}
      ItemSeparatorComponent={FavoriteSeparator}
      ListHeaderComponent={
        <View>
          {headerComponent ? (
            <View className="mb-4 pt-2">{headerComponent}</View>
          ) : null}
          <FavoritesHeader
            count={favoritesQuery.data?.count ?? 0}
            latestSaved={latestSaved}
            showTitle={showTitle}
          />
        </View>
      }
      ListHeaderComponentStyle={{ paddingBottom: favorites.length ? 12 : 0 }}
      ListEmptyComponent={
        <FavoritesState
          isError={favoritesQuery.isError}
          errorMessage={favoritesQuery.error?.message}
          isRefreshing={favoritesQuery.isRefetching}
          onRetry={handleRefresh}
          onAction={handleEmptyAction}
          actionLabel={emptyActionLabel}
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={favoritesQuery.isRefetching}
          onRefresh={handleRefresh}
        />
      }
    />
  );
}

function FavoritesHeader({
  count,
  latestSaved,
  showTitle,
}: {
  count: number;
  latestSaved: string;
  showTitle: boolean;
}) {
  return (
    <View className="gap-6">
      {showTitle ? <ScreenTopBar title={FAVORITE_SCREEN_COPY.title} /> : null}

      <View className="gap-3">
        <View className="flex-row items-center justify-between px-1">
          <Text className="text-base font-semibold text-foreground">
            {FAVORITE_SCREEN_COPY.sectionTitle}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {count > 0
              ? `${count} ${count === 1 ? "item" : "items"}`
              : FAVORITE_SCREEN_COPY.sectionMetaFallback}
          </Text>
        </View>

        <View className="rounded-[20px] border border-border bg-card px-4 py-4">
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="text-sm font-medium text-muted-foreground">
                {FAVORITE_SCREEN_COPY.summaryLabel}
              </Text>
              <Text className="text-base font-semibold text-foreground">
                {latestSaved}
              </Text>
            </View>

            <View className="h-11 w-11 items-center justify-center rounded-full bg-muted/50">
              <Heart size={18} color="#7B6A59" strokeWidth={2} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function FavoriteCard({
  favorite,
  isRemoving,
  onPress,
  onRemove,
}: {
  favorite: FavoriteItem;
  isRemoving: boolean;
  onPress: () => void;
  onRemove: (favorite: FavoriteItem) => void;
}) {
  const imageUri = getFavoriteImageUri(favorite.images);

  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-[20px] border border-border bg-card px-4 py-4 active:opacity-90"
      onPress={onPress}
    >
      <View className="flex-row gap-4">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            contentFit="cover"
            transition={120}
            style={{ width: 88, height: 88, borderRadius: 16 }}
          />
        ) : (
          <View className="h-[88px] w-[88px] items-center justify-center rounded-[16px] bg-muted/40">
            <Text className="text-xs font-medium text-muted-foreground">
              {FAVORITE_SCREEN_COPY.noImage}
            </Text>
          </View>
        )}

        <View className="flex-1 gap-2">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-foreground">
                {favorite.name}
              </Text>
              <Text
                className="text-sm leading-5 text-muted-foreground"
                numberOfLines={2}
              >
                {favorite.description}
              </Text>
            </View>

            <View
              className={`rounded-full px-2.5 py-1 ${
                favorite.isAvailable
                  ? "border border-border bg-secondary"
                  : "border border-border bg-background"
              }`}
            >
              <Text className="text-[10px] font-medium text-foreground">
                {favorite.isAvailable
                  ? FAVORITE_SCREEN_COPY.availableLabel
                  : FAVORITE_SCREEN_COPY.unavailableLabel}
              </Text>
            </View>
          </View>

          <Text className="text-base font-semibold text-foreground">
            {formatCurrency(favorite.basePrice, favorite.currency)}
          </Text>

          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-row items-center gap-2">
              <Clock3 size={14} color="#7B6A59" strokeWidth={2} />
              <Text className="text-sm text-muted-foreground">
                {favorite.preparationTime} min prep
              </Text>
            </View>

            <Text className="text-sm text-muted-foreground">
              {FAVORITE_SCREEN_COPY.latestSavePrefix}{" "}
              {formatFavoriteSavedDate(favorite.favoritedAt)}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-end border-t border-border pt-4">
        <Pressable
          accessibilityRole="button"
          className="rounded-full px-3 py-2 active:opacity-80"
          disabled={isRemoving}
          onPress={(event) => {
            event.stopPropagation();
            onRemove(favorite);
          }}
        >
          <Text className="text-sm font-medium text-destructive">
            {isRemoving
              ? FAVORITE_SCREEN_COPY.removingAction
              : FAVORITE_SCREEN_COPY.removeButton}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function FavoritesState({
  isError,
  errorMessage,
  isRefreshing,
  onRetry,
  onAction,
  actionLabel,
}: {
  isError: boolean;
  errorMessage?: string;
  isRefreshing: boolean;
  onRetry: () => void;
  onAction?: () => void;
  actionLabel?: string;
}) {
  if (isRefreshing) {
    return null;
  }

  if (isError) {
    return (
      <View className="pt-3">
        <EmptyState
          title={FAVORITE_SCREEN_COPY.errorTitle}
          description={errorMessage}
          variant="error"
          centered
          actionLabel={FAVORITE_SCREEN_COPY.tryAgainAction}
          onAction={onRetry}
        />
      </View>
    );
  }

  return (
    <View className="pt-3">
      <EmptyState
        title={FAVORITE_SCREEN_COPY.emptyTitle}
        description={FAVORITE_SCREEN_COPY.emptyDescription}
        illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
        centered
        className="border-dashed"
        actionLabel={actionLabel}
        onAction={onAction}
      />
    </View>
  );
}

function FavoriteLoadingState({
  showTitle,
  headerComponent,
}: {
  showTitle: boolean;
  headerComponent?: React.ReactNode;
}) {
  return (
    <View className="flex-1 bg-background px-4 pt-10">
      {headerComponent ? (
        <View className="mb-4 pt-2 -mt-8">{headerComponent}</View>
      ) : null}

      {showTitle ? (
        <View className="items-center">
          <View className="h-8 w-24 rounded-full bg-muted" />
        </View>
      ) : null}

      <View className={`${showTitle ? "mt-8" : "mt-2"} gap-3`}>
        <View className="flex-row items-center justify-between px-1">
          <View className="h-5 w-28 rounded-full bg-muted" />
          <View className="h-4 w-16 rounded-full bg-muted" />
        </View>

        <View className="rounded-[20px] border border-border bg-card px-4 py-4">
          <View className="flex-row items-center justify-between">
            <View className="gap-2">
              <View className="h-4 w-20 rounded-full bg-muted" />
              <View className="h-5 w-28 rounded-full bg-muted" />
            </View>
            <View className="h-11 w-11 rounded-full bg-muted" />
          </View>
        </View>
      </View>

      <View className="mt-6 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <View
            key={`favorite-loading-${index}`}
            className="rounded-[20px] border border-border bg-card px-4 py-4"
          >
            <View className="flex-row gap-4">
              <View className="h-[88px] w-[88px] rounded-[16px] bg-muted" />
              <View className="flex-1 gap-3">
                <View className="h-5 w-2/3 rounded-full bg-muted" />
                <View className="h-4 w-full rounded-full bg-muted" />
                <View className="h-4 w-5/6 rounded-full bg-muted" />
                <View className="h-4 w-1/3 rounded-full bg-muted" />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function FavoriteSeparator() {
  return <View className="h-4" />;
}
