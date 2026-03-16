import { FlashList } from "@shopify/flash-list";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import type { StoreItem } from "../../../../packages/api/src";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SlidersHorizontal } from "lucide-react-native";

import { SearchInput } from "@/components/search/SearchInput";
import { StoreCard } from "@/components/store/StoreCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DEFAULT_EMPTY_ILLUSTRATION,
  EmptyState,
} from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { useStores } from "@/hooks/use-stores";

export function StoreList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOpenNowOnly, setShowOpenNowOnly] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const { data, isLoading, isError, error, isRefetching, refetch } = useStores({
    search: deferredSearchQuery,
  });
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const filteredStores = useMemo(() => {
    const stores = data?.items ?? [];

    if (!showOpenNowOnly) {
      return stores;
    }

    return stores.filter((store) => store.isOpenNow);
  }, [data?.items, showOpenNowOnly]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const renderStoreItem = useCallback(
    ({ item }: { item: StoreItem }) => <StoreCard store={item} />,
    [],
  );

  const keyExtractor = useCallback((item: StoreItem) => item.id, []);
  const showInitialLoading = isLoading && !data;

  return (
    <View className="flex-1 px-4 pt-2">
      <StoreSearchBar
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        onClearSearch={handleClearSearch}
      />
      <StoreListFilters
        showOpenNowOnly={showOpenNowOnly}
        onToggleOpenNow={() => {
          setShowOpenNowOnly((current) => !current);
        }}
      />

      {showInitialLoading ? (
        <View className="gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`store-loading-${index}`}
              className="overflow-hidden rounded-[28px] border border-border bg-card py-0"
            >
              <View className="flex-row">
                <View className="h-36 w-40 bg-muted" />
                <CardContent className="flex-1 gap-3 px-4 py-4">
                  <View className="h-6 w-2/3 rounded-full bg-muted" />
                  <View className="h-4 w-full rounded-full bg-muted" />
                  <View className="h-4 w-5/6 rounded-full bg-muted" />
                  <View className="h-4 w-2/3 rounded-full bg-muted" />
                </CardContent>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <FlashList
          data={filteredStores}
          renderItem={renderStoreItem}
          keyExtractor={keyExtractor}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + 28,
          }}
          ItemSeparatorComponent={StoreSeparator}
          ListEmptyComponent={
            <StoreListState
              isError={isError}
              errorMessage={error?.message}
              hasSearch={deferredSearchQuery.trim().length > 0}
              isOpenOnly={showOpenNowOnly}
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
      )}
    </View>
  );
}

function StoreSearchBar({
  searchQuery,
  onChangeSearchQuery,
  onClearSearch,
}: {
  searchQuery: string;
  onChangeSearchQuery: (value: string) => void;
  onClearSearch: () => void;
}) {
  return (
    <View className="pb-3">
      <SearchInput
        value={searchQuery}
        onChangeText={onChangeSearchQuery}
        placeholder="Search stores"
        onClear={onClearSearch}
      />
    </View>
  );
}

function StoreListFilters({
  showOpenNowOnly,
  onToggleOpenNow,
}: {
  showOpenNowOnly: boolean;
  onToggleOpenNow: () => void;
}) {
  return (
    <View className="pb-5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          showOpenNowOnly ? "Show all stores" : "Show only open stores"
        }
        className={`h-14 self-start items-center justify-center rounded-[20px] border px-4 ${
          showOpenNowOnly
            ? "border-[#C89A6A] bg-[#F6EBDD]"
            : "border-border bg-card"
        } active:opacity-80`}
        onPress={onToggleOpenNow}
      >
        <View className="flex-row items-center gap-2">
          <SlidersHorizontal size={18} color="#4A4F47" strokeWidth={2.1} />
          <Text className="text-sm font-medium text-foreground">
            {showOpenNowOnly ? "Showing open stores" : "Filter stores"}
          </Text>
        </View>
      </Pressable>

      {showOpenNowOnly ? (
        <View className="pt-4">
          <Badge
            variant="secondary"
            className="self-start rounded-full px-4 py-2"
          >
            <Text>Open now</Text>
          </Badge>
        </View>
      ) : null}
    </View>
  );
}

function StoreListState({
  isError,
  errorMessage,
  hasSearch,
  isOpenOnly,
}: {
  isError: boolean;
  errorMessage?: string;
  hasSearch: boolean;
  isOpenOnly: boolean;
}) {
  if (isError) {
    return (
      <EmptyState
        title="Unable to load stores"
        description={errorMessage}
        variant="error"
      />
    );
  }

  return (
    <EmptyState
      title={hasSearch || isOpenOnly ? "No matching stores" : "No stores yet"}
      description={
        hasSearch || isOpenOnly
          ? "Try another search or turn off the open-now filter."
          : "Store locations will appear here once they are available."
      }
      illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
      centered
    />
  );
}

function StoreSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  separator: {
    height: 16,
  },
});
