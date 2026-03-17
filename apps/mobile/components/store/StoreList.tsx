import { FlashList } from "@shopify/flash-list";
import { useCallback, useState, type ReactNode } from "react";
import { RefreshControl, StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { StoreItem } from "../../../../packages/api/src";

import { SearchInput } from "@/components/search/SearchInput";
import { StoreCard } from "@/components/store/StoreCard";
import { Card, CardContent } from "@/components/ui/card";
import {
  DEFAULT_EMPTY_ILLUSTRATION,
  EmptyState,
} from "@/components/ui/empty-state";
import { useStores } from "@/hooks/use-stores";
import { useDebounce } from "@/hooks/use-debounce";

export function StoreList({
  headerComponent,
}: {
  headerComponent?: ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 400);

  const { data, isLoading, isError, error, refetch } = useStores({
    search: debouncedSearchQuery,
  });

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const stores = data?.items ?? [];
  const hasSearch = debouncedSearchQuery.length > 0;
  const showInitialLoading = isLoading && !data;

  const handleRefresh = useCallback(async () => {
    setIsPullRefreshing(true);

    try {
      await refetch();
    } finally {
      setIsPullRefreshing(false);
    }
  }, [refetch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const renderStoreItem = useCallback(
    ({ item }: { item: StoreItem }) => <StoreCard store={item} />,
    [],
  );

  const keyExtractor = useCallback((item: StoreItem) => item.id, []);

  const listHeader = headerComponent ? (
    <View className="pb-4 pt-2">{headerComponent}</View>
  ) : null;

  return (
    <View className="flex-1 bg-background">
      {/* Fixed search area */}
      <View className="px-4 pb-3 pt-2">
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search stores and products"
          onClear={handleClearSearch}
        />
      </View>

      {showInitialLoading ? (
        <StoreListSkeleton headerComponent={headerComponent} />
      ) : (
        <FlashList
          data={stores}
          renderItem={renderStoreItem}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={StoreSeparator}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <StoreListState
                isError={isError}
                errorMessage={error?.message}
                hasSearch={hasSearch}
              />
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 24,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isPullRefreshing}
              onRefresh={handleRefresh}
              tintColor={colorScheme === "dark" ? "#F5F5F5" : "#5A3421"}
            />
          }
        />
      )}
    </View>
  );
}

function StoreListSkeleton({
  headerComponent,
}: {
  headerComponent?: ReactNode;
}) {
  return (
    <View className="flex-1 px-4">
      {headerComponent ? (
        <View className="pb-4 pt-2">{headerComponent}</View>
      ) : null}

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
    </View>
  );
}

function StoreListState({
  isError,
  errorMessage,
  hasSearch,
}: {
  isError: boolean;
  errorMessage?: string;
  hasSearch: boolean;
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
      title={hasSearch ? "No matching stores" : "No stores yet"}
      description={
        hasSearch
          ? "Try another search."
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
