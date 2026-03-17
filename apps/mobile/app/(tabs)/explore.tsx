import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ChevronDown, Grid2x2, ShoppingBag, Store as StoreIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";
import { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenLayout } from "@/components/layout/screen-layout";
import { ScreenTopBar } from "@/components/layout/screen-topbar";
import { ExploreProductCard } from "@/components/product/explore-product-card";
import { SearchInput } from "@/components/search/SearchInput";
import { StoreSelectionSheet } from "@/components/store/store-selection-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Text } from "@/components/ui/text";
import { useProducts } from "@/hooks/use-products";
import { useStores } from "@/hooks/use-stores";
import { useColorScheme } from "@/lib/color-scheme";
import type { MobileProduct } from "@/services/product.service";
import type { MobileStore } from "@/services/store.service";

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const storeSheetRef = React.useRef<BottomSheetModal>(null);
  const sheetSnapPoints = React.useMemo(() => ["62%"], []);
  const [selectedStoreId, setSelectedStoreId] = React.useState<string | undefined>();
  const [searchQuery, setSearchQuery] = React.useState("");
  const deferredSearchQuery = React.useDeferredValue(searchQuery.trim());
  const { colors } = useColorScheme();

  const storesQuery = useStores({ limit: 50 });
  const productsQuery = useProducts({
    storeId: selectedStoreId,
    search: deferredSearchQuery || undefined,
    limit: 100,
  });

  const stores = React.useMemo(() => storesQuery.data?.items ?? [], [storesQuery.data?.items]);
  const products = React.useMemo(
    () => productsQuery.data?.items ?? [],
    [productsQuery.data?.items],
  );
  const selectedStore = stores.find((store) => store.id === selectedStoreId);
  const productRows = React.useMemo(() => groupProducts(products), [products]);
  const productCount = products.length;
  const errorMessage =
    storesQuery.error?.message ??
    productsQuery.error?.message ??
    "Unable to load the cafe menu.";

  const handleRetry = React.useCallback(() => {
    void storesQuery.refetch();
    void productsQuery.refetch();
  }, [productsQuery, storesQuery]);

  const handleClearSearch = React.useCallback(() => {
    setSearchQuery("");
  }, []);

  React.useEffect(() => {
    if (!stores.length) {
      return;
    }

    const selectedStoreExists = stores.some((store) => store.id === selectedStoreId);

    if (!selectedStoreId || !selectedStoreExists) {
      setSelectedStoreId(stores[0]?.id);
    }
  }, [selectedStoreId, stores]);

  const handleSelectStore = React.useCallback((storeId: string) => {
    setSelectedStoreId(storeId);
    storeSheetRef.current?.dismiss();
  }, []);

  const handleOpenStoreSheet = React.useCallback(() => {
    if (!stores.length) {
      return;
    }

    storeSheetRef.current?.present();
  }, [stores.length]);

  const isInitialStoreLoading = storesQuery.isLoading && !storesQuery.data;
  const isInitialProductLoading = productsQuery.isLoading && !productsQuery.data;
  const hasStoreError = storesQuery.isError && !stores.length;
  const hasNoStores = !isInitialStoreLoading && !hasStoreError && stores.length === 0;
  const hasFiltersApplied = Boolean(deferredSearchQuery);

  return (
    <>
      <ScreenLayout bottomInsetOffset={168} contentClassName="gap-6 px-4 pt-2">
        <ScreenTopBar title="Explore" />

        <NativeOnlyAnimatedView entering={FadeInUp.delay(130).duration(420)}>
          {isInitialStoreLoading ? (
            <StoreSelectorSkeleton />
          ) : (
            <StoreSelectorButton
              store={selectedStore}
              disabled={!stores.length}
              onPress={handleOpenStoreSheet}
            />
          )}
        </NativeOnlyAnimatedView>

        <NativeOnlyAnimatedView entering={FadeInUp.delay(150).duration(420)}>
          <View className="rounded-[20px] border border-border bg-card p-3">
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search"
              onClear={handleClearSearch}
            />
          </View>
        </NativeOnlyAnimatedView>

        <NativeOnlyAnimatedView entering={FadeInUp.delay(210).duration(420)}>
          <View className="gap-4">
            <View className="flex-row items-end justify-between gap-4 px-1">
              <View className="flex-1">
                <Text className="text-xl font-semibold text-foreground">Products</Text>
              </View>

              <View className="items-end gap-2">
                <View className="flex-row items-center gap-2 rounded-full border border-border px-3 py-1.5">
                  <Grid2x2 size={14} color="#6B6F68" strokeWidth={2.2} />
                  <Text className="text-xs font-medium uppercase tracking-[1.1px] text-muted-foreground">
                    {formatItemCount(productCount)}
                  </Text>
                </View>

                {productsQuery.isFetching && productsQuery.data ? <View className="h-4" /> : null}
              </View>
            </View>

            {hasStoreError || productsQuery.isError ? (
              <EmptyState
                title="Unable to load the menu"
                description={errorMessage}
                variant="error"
                centered
                actionLabel="Try again"
                onAction={handleRetry}
              />
            ) : hasNoStores ? (
              <EmptyState
                title="No stores available"
                description="Store locations will appear here once they are available."
                variant="default"
                centered
                icon={StoreIcon}
              />
            ) : isInitialProductLoading ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <EmptyState
                title={hasFiltersApplied ? "No matching products" : "Nothing available yet"}
                variant="default"
                centered
                icon={ShoppingBag}
                actionLabel={hasFiltersApplied ? "Clear search" : undefined}
                onAction={hasFiltersApplied ? handleClearSearch : undefined}
              />
            ) : (
              <View className="gap-4">
                {productRows.map((row, rowIndex) => (
                  <NativeOnlyAnimatedView
                    key={`product-row-${rowIndex}`}
                    entering={FadeInUp.delay(240 + rowIndex * 60).duration(360)}
                  >
                    <View className="flex-row gap-4">
                      {row.map((product) => (
                        <ExploreProductCard
                          key={product.id}
                          product={product}
                          onPress={() => {
                            router.push(`/product/${product.id}`);
                          }}
                        />
                      ))}
                      {row.length === 1 ? <View className="flex-1" /> : null}
                    </View>
                  </NativeOnlyAnimatedView>
                ))}
              </View>
            )}
          </View>
        </NativeOnlyAnimatedView>
      </ScreenLayout>

      <StoreSelectionSheet
        ref={storeSheetRef}
        stores={stores}
        selectedStoreId={selectedStoreId}
        onSelectStore={handleSelectStore}
        backgroundColor={colors.background}
        bottomInset={insets.bottom}
        snapPoints={sheetSnapPoints}
      />
    </>
  );
}

function StoreSelectorButton({
  store,
  disabled,
  onPress,
}: {
  store?: MobileStore;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={store ? `Choose store, currently ${store.name}` : "Choose store"}
      className="rounded-[20px] border border-border bg-card px-4 py-3 active:opacity-90"
      disabled={disabled}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between gap-3">
        {store ? (
          <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={1}>
            {store.name}
          </Text>
        ) : (
          <View className="flex-row items-center gap-2">
            <StoreIcon size={16} color="#7C806F" strokeWidth={2} />
            <Text className="text-sm text-muted-foreground">Select store</Text>
          </View>
        )}
        <ChevronDown size={18} color="#7C806F" strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

function StoreSelectorSkeleton() {
  return (
    <View className="rounded-[24px] border border-border bg-card px-4 py-4">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 rounded-full bg-muted" />
        <View className="flex-1 gap-2">
          <View className="h-3 w-20 rounded-full bg-muted" />
          <View className="h-5 w-40 rounded-full bg-muted" />
          <View className="h-4 w-32 rounded-full bg-muted" />
        </View>
        <View className="h-5 w-14 rounded-full bg-muted" />
      </View>
    </View>
  );
}

function ProductGridSkeleton() {
  return (
    <View className="gap-4">
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <View
          key={`product-grid-skeleton-${rowIndex}`}
          className="flex-row gap-4"
        >
          {Array.from({ length: 2 }).map((_, columnIndex) => (
            <View
              key={`product-card-skeleton-${rowIndex}-${columnIndex}`}
              className="flex-1 overflow-hidden rounded-[18px] border border-border bg-card"
            >
              <View className="h-36 bg-muted" />
              <View className="gap-3 px-4 py-4">
                <View className="h-5 w-4/5 rounded-full bg-muted" />
                <View className="h-4 w-full rounded-full bg-muted" />
                <View className="flex-row gap-2">
                  <View className="h-7 w-20 rounded-full bg-muted" />
                  <View className="h-7 w-16 rounded-full bg-muted" />
                </View>
                <View className="flex-row items-center gap-3">
                  <View className="h-4 w-20 rounded-full bg-muted" />
                  <View className="h-11 w-11 rounded-full bg-muted" />
                </View>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function groupProducts(products: MobileProduct[]) {
  const rows: MobileProduct[][] = [];

  for (let index = 0; index < products.length; index += 2) {
    rows.push(products.slice(index, index + 2));
  }

  return rows;
}

function formatItemCount(count: number) {
  return `${count} ${count === 1 ? "item" : "items"}`;
}
