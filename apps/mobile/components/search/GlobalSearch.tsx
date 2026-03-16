import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import {
  Clock3,
  Coffee,
  MapPin,
  Search,
  Star,
  Store,
  X,
} from "lucide-react-native";
import type {
  SearchHistory,
  SearchProduct,
  SearchStore,
  SearchType,
} from "../../../../packages/api/src";

import {
  useDeleteAllRecentSearches,
  useDeleteRecentSearch,
  useGlobalSearch,
  useRecentSearches,
  useSearchSuggestions,
} from "@/hooks/use-global-search";
import { useAuth } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

const SEARCH_TYPE_OPTIONS: {
  label: string;
  value: SearchType;
}[] = [
  { label: "All", value: "all" },
  { label: "Stores", value: "store" },
  { label: "Products", value: "product" },
];

type GlobalSearchProps = {
  autoFocus?: boolean;
  initialQuery?: string;
};

export function GlobalSearch({
  autoFocus = false,
  initialQuery = "",
}: GlobalSearchProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const lastSyncedRecentQueryRef = React.useRef<string | null>(null);
  const [query, setQuery] = React.useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = React.useState(
    initialQuery.trim(),
  );
  const [searchType, setSearchType] = React.useState<SearchType>("all");
  const [isPending, startTransition] = React.useTransition();
  const deferredQuery = React.useDeferredValue(query);
  const normalizedInput = deferredQuery.trim();
  const trimmedInput = query.trim();
  const hasQuery = trimmedInput.length > 0;
  const hasActiveSearch =
    submittedQuery.length > 0 && submittedQuery === trimmedInput;
  const searchResults = useGlobalSearch(submittedQuery, searchType);
  const suggestions = useSearchSuggestions(normalizedInput, 6);
  const recentSearches = useRecentSearches(isAuthenticated && !hasQuery, 8);
  const deleteRecentSearchMutation = useDeleteRecentSearch();
  const deleteAllRecentSearchesMutation = useDeleteAllRecentSearches();

  React.useEffect(() => {
    if (!isAuthenticated) {
      lastSyncedRecentQueryRef.current = null;
      return;
    }

    if (
      searchResults.data &&
      submittedQuery.length > 0 &&
      lastSyncedRecentQueryRef.current !== submittedQuery
    ) {
      lastSyncedRecentQueryRef.current = submittedQuery;
      void queryClient.invalidateQueries({ queryKey: ["recent-searches"] });
    }
  }, [isAuthenticated, queryClient, searchResults.data, submittedQuery]);

  function runSearch(nextQuery = trimmedInput) {
    const normalizedNextQuery = nextQuery.trim();

    setQuery(normalizedNextQuery);
    setSubmittedQuery(normalizedNextQuery);
  }

  function clearSearch() {
    setQuery("");
    setSubmittedQuery("");
  }

  return (
    <View className="gap-4">
      <View className="relative">
        <View className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
          <Search size={18} color="#7C806F" strokeWidth={2.2} />
        </View>

        <Input
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => {
            runSearch();
          }}
          placeholder="Search stores and products..."
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          returnKeyType="search"
          className="h-14 rounded-2xl border-0 bg-white pr-12 pl-12 text-base"
        />

        {hasQuery ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search query"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-muted p-1.5 active:opacity-70"
            onPress={() => {
              clearSearch();
            }}
          >
            <X size={14} color="#575B50" strokeWidth={2.5} />
          </Pressable>
        ) : null}
      </View>

      <View className="flex-row gap-2">
        {SEARCH_TYPE_OPTIONS.map((option) => {
          const isSelected = option.value === searchType;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              className={`rounded-full px-4 py-2.5 ${
                isSelected ? "bg-[#26211D]" : "bg-[#ECE8E1]"
              } active:opacity-80`}
              onPress={() => {
                startTransition(() => {
                  setSearchType(option.value);

                  if (trimmedInput.length > 0) {
                    setSubmittedQuery(trimmedInput);
                  }
                });
              }}
            >
              <Text
                className={`text-sm font-semibold ${
                  isSelected ? "text-white" : "text-[#61584D]"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!hasQuery ? (
        <View className="gap-4">
          <Card className="rounded-[28px] border-0 bg-[#F7F4EE] py-0">
            <CardContent className="gap-4 px-5 py-5">
              <Text className="text-lg font-semibold text-foreground">
                Search everything in one place
              </Text>
              <Text className="text-sm leading-6 text-muted-foreground">
                Find nearby stores, signature drinks, and menu items faster with
                a single search.
              </Text>
            </CardContent>
          </Card>

          {isAuthenticated ? (
            <Card className="rounded-[28px] border-0 bg-[#F7F4EE] py-0">
              <CardContent className="gap-4 px-5 py-5">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      Recent Searches
                    </Text>
                    <Text className="mt-1 text-sm text-muted-foreground">
                      Pick up where you left off.
                    </Text>
                  </View>

                  {recentSearches.data?.length ? (
                    <Pressable
                      accessibilityRole="button"
                      className="rounded-full bg-white px-3 py-2 active:opacity-80"
                      disabled={deleteAllRecentSearchesMutation.isPending}
                      onPress={() => {
                        deleteAllRecentSearchesMutation.mutate();
                      }}
                    >
                      <Text className="text-sm font-medium text-foreground">
                        Clear all
                      </Text>
                    </Pressable>
                  ) : null}
                </View>

                {recentSearches.isLoading ? <RecentSearchSkeleton /> : null}

                {recentSearches.isError ? (
                  <SearchMessageCard
                    title="Unable to load recent searches"
                    description={recentSearches.error.message}
                  />
                ) : null}

                {!recentSearches.isLoading &&
                !recentSearches.isError &&
                !recentSearches.data?.length ? (
                  <SearchMessageCard
                    title="No recent searches yet"
                    description="Your submitted searches will appear here after you run them."
                  />
                ) : null}

                {recentSearches.data?.length ? (
                  <View className="gap-3">
                    {recentSearches.data.map((item) => (
                      <RecentSearchRow
                        key={item.id}
                        item={item}
                        isDeleting={deleteRecentSearchMutation.isPending}
                        onDelete={() => {
                          deleteRecentSearchMutation.mutate(item.id);
                        }}
                        onPress={() => {
                          startTransition(() => {
                            setSearchType(item.searchType);
                          });
                          runSearch(item.query);
                        }}
                      />
                    ))}
                  </View>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </View>
      ) : null}

      {hasQuery && !hasActiveSearch ? (
        <Card className="rounded-[28px] border-0 bg-[#F7F4EE] py-0">
          <CardContent className="gap-4 px-5 py-5">
            <View>
              <Text className="text-lg font-semibold text-foreground">
                Suggestions
              </Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                Tap a suggestion or press search on the keyboard.
              </Text>
            </View>

            {suggestions.isLoading ? <SuggestionSkeleton /> : null}

            {suggestions.isError ? (
              <SearchMessageCard
                title="Unable to load suggestions"
                description={suggestions.error.message}
              />
            ) : null}

            {!suggestions.isLoading &&
            !suggestions.isError &&
            !suggestions.data?.length ? (
              <Pressable
                accessibilityRole="button"
                className="rounded-[22px] bg-white px-4 py-4 active:opacity-80"
                onPress={() => {
                  runSearch();
                }}
              >
                <Text className="text-base font-semibold text-foreground">
                  {`Search for "${trimmedInput}"`}
                </Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  No suggestions found. Run the full search request instead.
                </Text>
              </Pressable>
            ) : null}

            {suggestions.data?.length ? (
              <View className="gap-3">
                {suggestions.data.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    accessibilityRole="button"
                    className="rounded-[22px] bg-white px-4 py-4 active:opacity-80"
                    onPress={() => {
                      runSearch(suggestion);
                    }}
                  >
                    <Text className="text-base font-semibold text-foreground">
                      {suggestion}
                    </Text>
                    <Text className="mt-1 text-sm text-muted-foreground">
                      Search across stores and products.
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {hasActiveSearch ? (
        <Card className="rounded-[28px] border-0 bg-[#F7F4EE] py-0">
          <CardContent className="gap-5 px-5 py-5">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">
                  Search Results
                </Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  {searchResults.isFetching && !searchResults.data
                    ? "Searching..."
                    : `${searchResults.data?.totalResults ?? 0} results for "${submittedQuery}".`}
                </Text>
              </View>

              {isPending || (searchResults.isFetching && searchResults.data) ? (
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  <Text>Updating</Text>
                </Badge>
              ) : null}
            </View>

            {searchResults.isFetching && !searchResults.data ? (
              <SearchResultSkeleton />
            ) : null}

            {searchResults.isError ? (
              <SearchMessageCard
                title="Unable to search right now"
                description={searchResults.error.message}
              />
            ) : null}

            {!searchResults.isFetching &&
            !searchResults.isError &&
            (searchResults.data?.totalResults ?? 0) === 0 ? (
              <SearchMessageCard
                title="No matches found"
                description="Try a broader keyword, or switch between stores and products."
              />
            ) : null}

            {!searchResults.isError &&
            (searchResults.data?.totalResults ?? 0) > 0 ? (
              <View className="gap-5">
                {searchType !== "product" &&
                searchResults.data?.stores?.length ? (
                  <SearchSection
                    title="Stores"
                    description="Branches and cafes that match your search."
                  >
                    {searchResults.data.stores.map((store) => (
                      <StoreResultCard key={store.id} store={store} />
                    ))}
                  </SearchSection>
                ) : null}

                {searchType !== "store" &&
                searchResults.data?.products?.length ? (
                  <SearchSection
                    title="Products"
                    description="Drinks and menu items relevant to your keyword."
                  >
                    {searchResults.data.products.map((product) => (
                      <ProductResultCard key={product.id} product={product} />
                    ))}
                  </SearchSection>
                ) : null}
              </View>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </View>
  );
}

export function GlobalSearchEntry() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open search"
      className="overflow-hidden rounded-[24px] bg-white active:opacity-85"
      onPress={() => {
        router.push("/search");
      }}
    >
      <View className="flex-row items-center gap-3 px-4 py-4">
        <View className="rounded-full bg-[#F0ECE5] p-2.5">
          <Search size={18} color="#5F6256" strokeWidth={2.2} />
        </View>

        <View className="flex-1">
          <Text className="text-base font-medium text-[#3F3B36]">
            Search stores and products
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            Explore coffee, cafes, pastries, and more.
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function SearchSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <View>
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {description}
        </Text>
      </View>
      <View className="gap-3">{children}</View>
    </View>
  );
}

function SearchMessageCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <EmptyState title={title} description={description} surface="soft" />
  );
}

function RecentSearchRow({
  item,
  isDeleting,
  onDelete,
  onPress,
}: {
  item: SearchHistory;
  isDeleting: boolean;
  onDelete: () => void;
  onPress: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-[22px] bg-white px-4 py-4">
      <Pressable
        accessibilityRole="button"
        className="flex-1 active:opacity-80"
        onPress={onPress}
      >
        <View className="flex-row items-center gap-2">
          <Clock3 size={15} color="#7C806F" strokeWidth={2.2} />
          <Text className="text-base font-semibold text-foreground">
            {item.query}
          </Text>
        </View>
        <Text className="mt-2 text-sm text-muted-foreground">
          {item.resultsCount} results • {formatSearchType(item.searchType)}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete recent search ${item.query}`}
        className="rounded-full bg-[#F3EFE7] p-2 active:opacity-80"
        disabled={isDeleting}
        onPress={onDelete}
      >
        <X size={16} color="#5F6256" strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

function StoreResultCard({ store }: { store: SearchStore }) {
  return (
    <View className="overflow-hidden rounded-[24px] bg-white">
      <SearchResultImage imageUri={store.imageUrl} variant="store" />

      <View className="gap-3 px-4 py-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-lg font-semibold text-foreground">
              {store.name}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {buildStoreAddress(store)}
            </Text>
          </View>

          <Badge
            variant={store.isOpen ? "secondary" : "outline"}
            className="rounded-full px-2.5 py-1"
          >
            <Text>{store.isOpen ? "Open" : "Closed"}</Text>
          </Badge>
        </View>

        {store.description ? (
          <Text className="text-sm leading-6 text-muted-foreground">
            {normalizeSnippet(store.description)}
          </Text>
        ) : null}

        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-2">
            <MapPin size={15} color="#7C806F" strokeWidth={2.2} />
            <Text className="text-sm text-muted-foreground">{store.city}</Text>
          </View>

          {typeof store.rating === "number" ? (
            <View className="flex-row items-center gap-1.5">
              <Star
                size={14}
                color="#D97706"
                fill="#F59E0B"
                strokeWidth={1.8}
              />
              <Text className="text-sm font-medium text-foreground">
                {store.rating.toFixed(1)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function ProductResultCard({ product }: { product: SearchProduct }) {
  const imageUri = getFirstImage(product.images);

  return (
    <View className="overflow-hidden rounded-[24px] bg-white">
      <SearchResultImage imageUri={imageUri} variant="product" />

      <View className="gap-3 px-4 py-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-lg font-semibold text-foreground">
              {product.name}
            </Text>
            <Text className="text-sm font-medium text-[#7A5C1E]">
              {formatCurrency(product.basePrice, product.currency)}
            </Text>
          </View>

          <Badge
            variant={product.isAvailable ? "secondary" : "outline"}
            className="rounded-full px-2.5 py-1"
          >
            <Text>{product.isAvailable ? "Available" : "Unavailable"}</Text>
          </Badge>
        </View>

        <Text className="text-sm leading-6 text-muted-foreground">
          {normalizeSnippet(product.description)}
        </Text>

        {typeof product.rating === "number" ? (
          <View className="flex-row items-center gap-1.5">
            <Star size={14} color="#D97706" fill="#F59E0B" strokeWidth={1.8} />
            <Text className="text-sm font-medium text-foreground">
              {product.rating.toFixed(1)}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function SearchResultImage({
  imageUri,
  variant,
}: {
  imageUri?: string | null;
  variant: "store" | "product";
}) {
  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        contentFit="cover"
        transition={150}
        style={{ width: "100%", height: 152 }}
      />
    );
  }

  const Icon = variant === "store" ? Store : Coffee;
  const label = variant === "store" ? "Store image" : "Product image";

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      className="h-[152px] items-center justify-center bg-[#EFE8DB]"
    >
      <View className="items-center gap-3">
        <View className="rounded-full bg-white/80 p-4">
          <Icon size={28} color="#7A6A56" strokeWidth={2.1} />
        </View>
        <Text className="text-sm font-medium text-[#7A6A56]">
          {variant === "store" ? "Store preview" : "Product preview"}
        </Text>
      </View>
    </View>
  );
}

function SearchResultSkeleton() {
  return (
    <View className="gap-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <View
          key={`search-skeleton-${index}`}
          className="gap-3 rounded-[24px] bg-white px-4 py-4"
        >
          <View className="h-36 rounded-[18px] bg-muted" />
          <View className="h-5 w-2/3 rounded-full bg-muted" />
          <View className="h-4 w-full rounded-full bg-muted" />
          <View className="h-4 w-4/5 rounded-full bg-muted" />
        </View>
      ))}
    </View>
  );
}

function SuggestionSkeleton() {
  return (
    <View className="gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={`suggestion-skeleton-${index}`}
          className="h-16 rounded-[22px] bg-white"
        />
      ))}
    </View>
  );
}

function RecentSearchSkeleton() {
  return (
    <View className="gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={`recent-search-skeleton-${index}`}
          className="h-20 rounded-[22px] bg-white"
        />
      ))}
    </View>
  );
}

function buildStoreAddress(store: SearchStore) {
  return [store.address, store.city].filter(Boolean).join(", ");
}

function normalizeSnippet(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function formatSearchType(type: SearchType) {
  if (type === "all") {
    return "all";
  }

  if (type === "store") {
    return "stores";
  }

  return "products";
}
