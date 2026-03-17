import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import {
  ChevronDown,
  Flame,
  Grid2x2,
  Sparkles,
  ShoppingBag,
  Store as StoreIcon,
  Timer,
  Search,
  X,
} from "lucide-react-native";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenLayout } from "@/components/layout/screen-layout";
import { ScreenTopBar } from "@/components/layout/screen-topbar";
import { ExploreProductCard } from "@/components/product/explore-product-card";
import { SearchSheet } from "@/components/search/search-sheet";
import { StoreSelectionSheet } from "@/components/store/store-selection-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { useProducts } from "@/hooks/use-products";
import { useStores } from "@/hooks/use-stores";
import { useColorScheme } from "@/lib/color-scheme";
import { cn } from "@/lib/utils";
import type { MobileProduct } from "@/services/product.service";
import type { MobileStore } from "@/services/store.service";

type QuickFilterKey = "all" | "featured" | "best-selling" | "ready-fast";

type QuickFilterOption = {
  key: QuickFilterKey;
  label: string;
  Icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
};

const QUICK_FILTER_OPTIONS: QuickFilterOption[] = [
  { key: "all", label: "All", Icon: Grid2x2 },
  { key: "featured", label: "Featured", Icon: Sparkles },
  { key: "best-selling", label: "Best Seller", Icon: Flame },
  { key: "ready-fast", label: "Ready < 10m", Icon: Timer },
];

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const storeSheetRef = React.useRef<BottomSheetModal>(null);
  const searchSheetRef = React.useRef<BottomSheetModal>(null);
  const sheetSnapPoints = React.useMemo(() => ["62%"], []);
  const searchSnapPoints = React.useMemo(() => ["100%"], []);

  const [selectedStoreId, setSelectedStoreId] = React.useState<
    string | undefined
  >();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeQuickFilter, setActiveQuickFilter] =
    React.useState<QuickFilterKey>("all");
  const deferredSearchQuery = React.useDeferredValue(searchQuery.trim());
  const { colors } = useColorScheme();

  // --- QUERIES ---
  const storesQuery = useStores({ limit: 50 });
  const productsQuery = useProducts({
    storeId: selectedStoreId,
    search: deferredSearchQuery || undefined,
    limit: 100,
  });

  // --- MEMOIZED DATA ---
  const stores = React.useMemo(
    () => storesQuery.data?.items ?? [],
    [storesQuery.data?.items],
  );
  const products = React.useMemo(
    () => productsQuery.data?.items ?? [],
    [productsQuery.data?.items],
  );
  const selectedStore = stores.find((store) => store.id === selectedStoreId);
  const filteredProducts = React.useMemo(
    () => applyQuickFilter(products, activeQuickFilter),
    [activeQuickFilter, products],
  );
  const productRows = React.useMemo(
    () => groupProducts(filteredProducts),
    [filteredProducts],
  );

  // --- DERIVED STATE ---
  const isInitialStoreLoading = storesQuery.isLoading && !storesQuery.data;
  const isInitialProductLoading =
    productsQuery.isLoading && !productsQuery.data;
  const hasStoreError = storesQuery.isError && !stores.length;
  const hasNoStores =
    !isInitialStoreLoading && !hasStoreError && stores.length === 0;
  const hasFiltersApplied =
    Boolean(deferredSearchQuery) || activeQuickFilter !== "all";

  const sectionTitle = hasFiltersApplied ? "Filtered Menu" : "Discover Today";
  const sectionSubtitle = hasFiltersApplied
    ? getFilterSubtitle({
        searchQuery: deferredSearchQuery,
        quickFilter: activeQuickFilter,
      })
    : (selectedStore?.name ?? "Choose a store to begin");

  const errorMessage =
    storesQuery.error?.message ??
    productsQuery.error?.message ??
    "Unable to load the cafe menu.";

  // --- EFFECTS & HANDLERS ---
  React.useEffect(() => {
    if (!stores.length) return;
    const selectedStoreExists = stores.some(
      (store) => store.id === selectedStoreId,
    );
    if (!selectedStoreId || !selectedStoreExists) {
      setSelectedStoreId(stores[0]?.id);
    }
  }, [selectedStoreId, stores]);

  const handleRetry = React.useCallback(() => {
    void storesQuery.refetch();
    void productsQuery.refetch();
  }, [productsQuery, storesQuery]);

  const handleClearFilters = React.useCallback(() => {
    setSearchQuery("");
    setActiveQuickFilter("all");
  }, []);

  const handleSelectStore = React.useCallback((storeId: string) => {
    setSelectedStoreId(storeId);
    storeSheetRef.current?.dismiss();
  }, []);

  const handleOpenStoreSheet = React.useCallback(() => {
    if (stores.length) storeSheetRef.current?.present();
  }, [stores.length]);

  const handleOpenSearchSheet = React.useCallback(() => {
    searchSheetRef.current?.present();
  }, []);

  const handleOpenProduct = React.useCallback(
    (productId: string) => router.push(`/product/${productId}`),
    [router],
  );

  const handleClearSearch = React.useCallback(() => {
    setSearchQuery("");
  }, []);

  return (
    <>
      <ScreenLayout bottomInsetOffset={168} contentClassName="gap-5 px-4">
        <ScreenTopBar title="Explore" />

        <ExploreHeroSection
          isStoreLoading={isInitialStoreLoading}
          selectedStore={selectedStore}
          hasStores={stores.length > 0}
          onOpenStoreSheet={handleOpenStoreSheet}
          onOpenSearchSheet={handleOpenSearchSheet}
          searchQuery={searchQuery}
          activeQuickFilter={activeQuickFilter}
          onSelectQuickFilter={setActiveQuickFilter}
          onClearFilters={handleClearFilters}
          hasFiltersApplied={hasFiltersApplied}
          onClearSearch={handleClearSearch}
        />

        <View className="gap-5 pb-8">
          <ExploreSectionHeader
            title={sectionTitle}
            subtitle={sectionSubtitle}
            hasFiltersApplied={hasFiltersApplied}
            productCount={filteredProducts.length}
            onClearFilters={handleClearFilters}
            mutedForegroundColor={colors.mutedForeground}
            primaryColor={colors.primary}
          />

          <ExploreContentSection
            hasError={hasStoreError || productsQuery.isError}
            errorMessage={errorMessage}
            hasNoStores={hasNoStores}
            isLoading={isInitialProductLoading}
            products={filteredProducts}
            productRows={productRows}
            hasFiltersApplied={hasFiltersApplied}
            onRetry={handleRetry}
            onClearFilters={handleClearFilters}
            onOpenProduct={handleOpenProduct}
          />
        </View>
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

      <SearchSheet
        ref={searchSheetRef}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleClearSearch}
        products={filteredProducts}
        isLoading={productsQuery.isLoading}
        onOpenProduct={handleOpenProduct}
        snapPoints={searchSnapPoints}
      />
    </>
  );
}

// --- SUB COMPONENTS ---

function ExploreHeroSection({
  isStoreLoading,
  selectedStore,
  hasStores,
  onOpenStoreSheet,
  onOpenSearchSheet,
  searchQuery,
  activeQuickFilter,
  onSelectQuickFilter,
  onClearFilters,
  hasFiltersApplied,
  onClearSearch,
}: {
  isStoreLoading: boolean;
  selectedStore?: MobileStore;
  hasStores: boolean;
  onOpenStoreSheet: () => void;
  onOpenSearchSheet: () => void;
  searchQuery: string;
  activeQuickFilter: QuickFilterKey;
  onSelectQuickFilter: (nextFilter: QuickFilterKey) => void;
  onClearFilters: () => void;
  hasFiltersApplied: boolean;
  onClearSearch: () => void;
}) {
  return (
    <View className="gap-5 pb-2">
      {isStoreLoading ? (
        <StoreSelectorSkeleton />
      ) : (
        <StoreSelectorButton
          store={selectedStore}
          disabled={!hasStores}
          onPress={onOpenStoreSheet}
        />
      )}

      <Pressable
        onPress={onOpenSearchSheet}
        className="flex-row items-center gap-3 rounded-[24px] border border-border bg-card px-4 py-4 active:opacity-80"
      >
        <Search size={21} color="#666C63" strokeWidth={2.2} />
        <Text
          className={cn(
            "flex-1 text-[17px]",
            searchQuery ? "text-foreground" : "text-muted-foreground",
          )}
          numberOfLines={1}
        >
          {searchQuery || "Search for coffee, tea, treats..."}
        </Text>
        {searchQuery ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onClearSearch();
            }}
            className="rounded-full bg-muted p-1.5 active:opacity-80"
          >
            <X size={15} color="#5F655C" strokeWidth={2.6} />
          </Pressable>
        ) : null}
      </Pressable>

      <QuickFilterRow
        activeFilter={activeQuickFilter}
        onSelectFilter={onSelectQuickFilter}
      />
    </View>
  );
}


function ExploreSectionHeader({
  title,
  subtitle,
  hasFiltersApplied,
  productCount,
  onClearFilters,
  mutedForegroundColor,
  primaryColor,
}: {
  title: string;
  subtitle?: string;
  hasFiltersApplied: boolean;
  productCount: number;
  onClearFilters: () => void;
  mutedForegroundColor?: string;
  primaryColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between pb-2">
      <View className="flex-1 gap-1.5">
        <Text className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="text-sm font-medium text-muted-foreground"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View className="items-end gap-2">
        <Text className="text-sm font-medium text-muted-foreground">
          {formatItemCount(productCount)}
        </Text>

        {hasFiltersApplied ? (
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-1 active:opacity-70"
            onPress={onClearFilters}
          >
            <Text className="text-sm font-semibold text-primary">Clear</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ExploreContentSection({
  hasError,
  errorMessage,
  hasNoStores,
  isLoading,
  products,
  productRows,
  hasFiltersApplied,
  onRetry,
  onClearFilters,
  onOpenProduct,
}: {
  hasError: boolean;
  errorMessage: string;
  hasNoStores: boolean;
  isLoading: boolean;
  products: MobileProduct[];
  productRows: MobileProduct[][];
  hasFiltersApplied: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onOpenProduct: (productId: string) => void;
}) {
  if (hasError) {
    return (
      <EmptyState
        title="Unable to load the menu"
        description={errorMessage}
        variant="error"
        centered
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }

  if (hasNoStores) {
    return (
      <EmptyState
        title="No stores available"
        description="No active stores right now."
        variant="default"
        centered
        icon={StoreIcon}
      />
    );
  }

  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={
          hasFiltersApplied ? "No matching products" : "Nothing available yet"
        }
        description={
          hasFiltersApplied
            ? "Try different search terms or reset your filters."
            : "Check back later."
        }
        variant="default"
        centered
        icon={ShoppingBag}
        actionLabel={hasFiltersApplied ? "Reset filters" : undefined}
        onAction={hasFiltersApplied ? onClearFilters : undefined}
      />
    );
  }

  return (
    <View className="gap-5">
      {productRows.map((row, rowIndex) => (
        <View key={`product-row-${rowIndex}`} className="flex-row gap-4">
          {row.map((product) => (
            <ExploreProductCard
              key={product.id}
              product={product}
              onPress={() => onOpenProduct(product.id)}
            />
          ))}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
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
      className={cn(
        "flex-row items-center justify-between gap-3 active:opacity-80 py-2",
        disabled && "opacity-50",
      )}
      disabled={disabled}
      onPress={onPress}
    >
      <View className="flex-1">
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pickup Location
        </Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          {store ? (
            <>
              <Text
                className="text-xl font-bold tracking-tight text-foreground"
                numberOfLines={1}
              >
                {store.name}
              </Text>
              <ChevronDown
                size={20}
                className="text-foreground"
                strokeWidth={2.5}
              />
            </>
          ) : (
            <>
              <Text className="text-xl font-bold tracking-tight text-muted-foreground">
                Select a store
              </Text>
              <ChevronDown
                size={20}
                className="text-muted-foreground"
                strokeWidth={2.5}
              />
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function StoreSelectorSkeleton() {
  return (
    <View className="py-2">
      <View className="gap-2">
        <View className="h-3 w-24 rounded-full bg-muted" />
        <View className="h-7 w-48 rounded-full bg-muted" />
      </View>
    </View>
  );
}

function ProductGridSkeleton() {
  return (
    <View className="gap-5">
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <View key={`skeleton-row-${rowIndex}`} className="flex-row gap-4">
          {Array.from({ length: 2 }).map((_, colIndex) => (
            <View
              key={`skeleton-col-${colIndex}`}
              className="flex-1 overflow-hidden rounded-[24px] border border-border bg-card shadow-sm shadow-black/5"
            >
              <View className="h-40 bg-muted" />
              <View className="gap-3 px-4 py-4">
                <View className="h-5 w-4/5 rounded-full bg-muted" />
                <View className="h-4 w-full rounded-full bg-muted" />
                <View className="mt-2 h-6 w-16 rounded-full bg-muted" />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function QuickFilterRow({
  activeFilter,
  onSelectFilter,
}: {
  activeFilter: QuickFilterKey;
  onSelectFilter: (nextFilter: QuickFilterKey) => void;
}) {
  return (
    <View className="gap-0">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8,
          paddingRight: 4,
          paddingBottom: 10,
          paddingTop: 4,
        }}
      >
        {QUICK_FILTER_OPTIONS.map(({ key, label, Icon }) => {
          const isActive = activeFilter === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              className={cn(
                "flex-row items-center gap-2 rounded-full border px-4 py-2.5 active:opacity-80",
                isActive
                  ? "border-primary bg-primary"
                  : "border-border bg-card",
              )}
              onPress={() => onSelectFilter(key)}
            >
              <Icon
                size={14}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? "#FFFFFF" : "#98989D"}
              />
              <Text
                className={cn(
                  "text-[13px] font-medium",
                  isActive ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// --- UTILITIES ---

function groupProducts(products: MobileProduct[]) {
  const rows: MobileProduct[][] = [];
  for (let index = 0; index < products.length; index += 2) {
    rows.push(products.slice(index, index + 2));
  }
  return rows;
}

function formatItemCount(count: number) {
  return `${count} ${count === 1 ? "Item" : "Items"}`;
}

function applyQuickFilter(
  products: MobileProduct[],
  activeQuickFilter: QuickFilterKey,
) {
  switch (activeQuickFilter) {
    case "featured":
      return products.filter((product) => product.isFeatured);
    case "best-selling":
      return products.filter((product) => product.isBestSelling);
    case "ready-fast":
      return products.filter((product) => product.preparationTime <= 10);
    default:
      return products;
  }
}

function getFilterSubtitle({
  searchQuery,
  quickFilter,
}: {
  searchQuery: string;
  quickFilter: QuickFilterKey;
}) {
  const quickFilterLabel =
    QUICK_FILTER_OPTIONS.find((option) => option.key === quickFilter)?.label ??
    "All";

  if (searchQuery && quickFilter !== "all") {
    return `Search "${searchQuery}" + ${quickFilterLabel}`;
  }

  if (searchQuery) {
    return `Search "${searchQuery}"`;
  }

  return quickFilterLabel;
}
