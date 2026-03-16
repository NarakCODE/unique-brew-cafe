import { useRouter } from "expo-router";
import { View } from "react-native";
import { FadeInUp } from "react-native-reanimated";

import { FavoriteListCard } from "@/components/favorite/favorite-list-card";
import { formatFavoriteLatestDate } from "@/components/favorite/favorite-utils";
import { TabScreenShell } from "@/components/navigation/tab-screen-shell";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_EMPTY_ILLUSTRATION,
  EmptyState,
} from "@/components/ui/empty-state";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Text } from "@/components/ui/text";
import { useFavorites } from "@/hooks/use-favorites";

const FAVORITE_CARD_COLORS = ["#F4E7D6", "#EBD8C0", "#EFE5D8"] as const;

export default function FavoriteScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useFavorites();

  const previewFavorites = data?.items.slice(0, 3) ?? [];
  const latestSaved = previewFavorites[0]?.favoritedAt
    ? formatFavoriteLatestDate(previewFavorites[0].favoritedAt)
    : "None yet";

  return (
    <TabScreenShell
      eyebrow="Saved"
      title="Keep your regulars one tap away."
      description="Your go-to coffees and pastries stay pinned here for quick reorders whenever the next craving hits."
      stats={[
        { label: "Saved drinks", value: String(data?.count ?? 0) },
        { label: "Latest save", value: latestSaved },
      ]}
    >
      {isLoading ? (
        Array.from({ length: 2 }).map((_, index) => (
          <NativeOnlyAnimatedView
            key={`favorite-loading-${index}`}
            entering={FadeInUp.delay(120 + index * 70).duration(420)}
          >
            <View className="overflow-hidden rounded-[28px] border border-border bg-card px-5 py-5">
              <View className="h-24 rounded-[20px] bg-muted" />
              <View className="mt-4 h-5 w-1/2 rounded-full bg-muted" />
              <View className="mt-3 h-4 w-full rounded-full bg-muted" />
              <View className="mt-2 h-4 w-2/3 rounded-full bg-muted" />
            </View>
          </NativeOnlyAnimatedView>
        ))
      ) : null}

      {!isLoading && isError ? (
        <EmptyState
          title="Unable to load saved items"
          description={error?.message}
          variant="error"
          centered
        />
      ) : null}

      {!isLoading && !isError && previewFavorites.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Bookmark the drinks you return to most and they will show up here for quick access."
          illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
          centered
        />
      ) : null}

      {!isLoading && !isError
        ? previewFavorites.map((favorite, index) => (
            <NativeOnlyAnimatedView
              key={favorite.favoriteId}
              entering={FadeInUp.delay(120 + index * 70).duration(420)}
            >
              <FavoriteListCard
                favorite={favorite}
                accentColor={
                  FAVORITE_CARD_COLORS[index % FAVORITE_CARD_COLORS.length]
                }
              />
            </NativeOnlyAnimatedView>
          ))
        : null}

      {!isLoading && !isError && data && data.count > previewFavorites.length ? (
        <NativeOnlyAnimatedView entering={FadeInUp.delay(340).duration(420)}>
          <View className="rounded-[28px] border border-border bg-card px-5 py-5">
            <Text className="text-lg font-semibold text-foreground">
              More saved picks waiting
            </Text>
            <Text color="tertiary" variant="subhead" className="mt-2 leading-6">
              Open the full favorites manager from your account to remove or
              review every saved item.
            </Text>

            <Button
              variant="outline"
              className="mt-5 h-11 rounded-[20px]"
              onPress={() => {
                router.navigate("/account/favorites");
              }}
            >
              <Text className="font-semibold">View all favorites</Text>
            </Button>
          </View>
        </NativeOnlyAnimatedView>
      ) : null}

      {!isLoading && !isError && isRefetching ? (
        <Text color="tertiary" variant="footnote" className="px-1">
          Refreshing saved items...
        </Text>
      ) : null}

      {!isLoading && isError ? (
        <Button
          variant="outline"
          className="h-11 rounded-[20px]"
          onPress={() => {
            void refetch();
          }}
        >
          <Text className="font-semibold">Try again</Text>
        </Button>
      ) : null}
    </TabScreenShell>
  );
}
