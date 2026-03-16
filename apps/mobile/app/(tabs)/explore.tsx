import { Grid2x2, ShoppingBag } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { FadeInUp } from "react-native-reanimated";

import { ScreenLayout } from "@/components/layout/screen-layout";
import { ExploreProductCard } from "@/components/product/explore-product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Text } from "@/components/ui/text";
import { useCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";
import { useColorScheme } from "@/lib/color-scheme";
import type { MobileCategory } from "@/services/category.service";
import type { MobileProduct } from "@/services/product.service";

const ALL_CATEGORY = {
  id: "all",
  name: "All",
  slug: "all",
} as const;

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<
    string | undefined
  >(undefined);
  const { colors, isDarkColorScheme } = useColorScheme();
  const categoriesQuery = useCategories();
  const productsQuery = useProducts({
    categoryId: selectedCategoryId,
  });

  const categories = React.useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const products = React.useMemo(
    () => productsQuery.data?.items ?? [],
    [productsQuery.data?.items],
  );
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const productRows = React.useMemo(() => groupProducts(products), [products]);
  const productCount = productsQuery.data?.pagination.total ?? 0;
  const errorMessage =
    categoriesQuery.error?.message ??
    productsQuery.error?.message ??
    "Unable to load the cafe menu.";

  const handleRetry = React.useCallback(() => {
    void categoriesQuery.refetch();
    void productsQuery.refetch();
  }, [categoriesQuery, productsQuery]);

  const categoryChips = React.useMemo(
    () => [ALL_CATEGORY, ...categories],
    [categories],
  );

  return (
    <ScreenLayout contentClassName="gap-5">
      <NativeOnlyAnimatedView entering={FadeInUp.delay(120).duration(420)}>
        <View className="items-center">
          <Text className="text-2xl font-semibold text-foreground">
            Explore
          </Text>
        </View>
      </NativeOnlyAnimatedView>

      <NativeOnlyAnimatedView entering={FadeInUp.delay(160).duration(420)}>
        <View className="gap-3">
          {categoriesQuery.isLoading ? (
            <CategoryChipSkeleton />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 8 }}
            >
              <View className="flex-row gap-3">
                {categoryChips.map((category) => {
                  const isSelected =
                    (selectedCategoryId ?? ALL_CATEGORY.id) === category.id;

                  return (
                    <Pressable
                      key={category.id}
                      accessibilityRole="button"
                      accessibilityState={isSelected ? { selected: true } : {}}
                      className="rounded-full border px-4 py-2.5"
                      onPress={() => {
                        setSelectedCategoryId(
                          category.id === ALL_CATEGORY.id
                            ? undefined
                            : category.id,
                        );
                      }}
                      style={{
                        backgroundColor: isSelected
                          ? isDarkColorScheme
                            ? colors.cardForeground
                            : colors.foreground
                          : isDarkColorScheme
                            ? colors.card
                            : colors.card,
                        borderColor: isSelected
                          ? isDarkColorScheme
                            ? colors.cardForeground
                            : colors.foreground
                          : colors.border,
                      }}
                    >
                      <Text
                        className="text-sm font-semibold"
                        style={{
                          color: isSelected
                            ? isDarkColorScheme
                              ? colors.background
                              : colors.background
                            : colors.foreground,
                        }}
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      </NativeOnlyAnimatedView>

      <NativeOnlyAnimatedView entering={FadeInUp.delay(180).duration(420)}>
        <View className="gap-4 px-4">
          <View className="flex-row items-end justify-between px-1">
            <View className="flex-1 pr-4">
              <Text className="text-xl font-semibold text-foreground">
                {selectedCategory?.name ?? "All products"}
              </Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                {buildSectionDescription(selectedCategory, productCount)}
              </Text>
            </View>

            <View className="flex-row items-center gap-2 rounded-full border border-border px-3 py-1.5">
              <Grid2x2
                size={14}
                color={colors.mutedForeground}
                strokeWidth={2.2}
              />
              <Text className="text-xs font-medium uppercase tracking-[1.1px] text-muted-foreground">
                {productCount} items
              </Text>
            </View>
          </View>

          {categoriesQuery.isError || productsQuery.isError ? (
            <EmptyState
              title="Unable to load the menu"
              description={errorMessage}
              variant="error"
              centered
              actionLabel="Try again"
              onAction={handleRetry}
            />
          ) : categoriesQuery.isLoading || productsQuery.isLoading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <EmptyState
              title="Nothing available here yet"
              description="Switch categories or come back later for fresh menu updates."
              variant="default"
              centered
              icon={ShoppingBag}
            />
          ) : (
            <View className="gap-4">
              {productRows.map((row, rowIndex) => (
                <NativeOnlyAnimatedView
                  key={`product-row-${rowIndex}`}
                  entering={FadeInUp.delay(220 + rowIndex * 60).duration(360)}
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
  );
}

function CategoryChipSkeleton() {
  return (
    <View className="mt-4 flex-row gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={`category-skeleton-${index}`}
          className="h-11 w-24 rounded-full bg-muted"
        />
      ))}
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
              className="flex-1 overflow-hidden rounded-[24px] border border-border bg-card"
            >
              <View className="h-36 bg-muted" />
              <View className="gap-3 px-4 py-4">
                <View className="h-5 w-4/5 rounded-full bg-muted" />
                <View className="h-4 w-1/2 rounded-full bg-muted" />
                <View className="h-4 w-full rounded-full bg-muted" />
                <View className="h-4 w-2/3 rounded-full bg-muted" />
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

function buildSectionDescription(
  category: MobileCategory | undefined,
  productCount: number,
) {
  if (category) {
    return `${productCount} items in ${category.name.toLowerCase()}.`;
  }

  return `${productCount} available picks across the full menu.`;
}
