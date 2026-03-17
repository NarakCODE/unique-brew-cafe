import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Search, X, ShoppingBag } from "lucide-react-native";
import * as React from "react";
import { Pressable, View, ActivityIndicator } from "react-native";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { ExploreProductCard } from "@/components/product/explore-product-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { MobileProduct } from "@/services/product.service";

type SearchSheetProps = {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
  products: MobileProduct[];
  isLoading: boolean;
  onOpenProduct: (productId: string) => void;
  placeholder?: string;
  snapPoints?: string[];
};

export const SearchSheet = React.forwardRef<BottomSheetModal, SearchSheetProps>(
  (
    {
      value,
      onChangeText,
      onClear,
      products,
      isLoading,
      onOpenProduct,
      placeholder = "Search for coffee, tea, treats...",
      snapPoints,
    },
    ref,
  ) => {
    const modalRef = React.useRef<BottomSheetModal>(null);
    const handleModalRef = React.useCallback(
      (instance: BottomSheetModal | null) => {
        modalRef.current = instance;

        if (typeof ref === "function") {
          ref(instance);
          return;
        }

        if (ref) {
          (ref as React.MutableRefObject<BottomSheetModal | null>).current =
            instance;
        }
      },
      [ref],
    );

    const resolvedSnapPoints = React.useMemo(
      () => snapPoints ?? ["100%"],
      [snapPoints],
    );

    const renderBackdrop = React.useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.3}
          pressBehavior="close"
        />
      ),
      [],
    );

    const productRows = React.useMemo(() => {
      const rows: MobileProduct[][] = [];
      for (let index = 0; index < products.length; index += 2) {
        rows.push(products.slice(index, index + 2));
      }
      return rows;
    }, [products]);

    const hasQuery = value.trim().length > 0;

    return (
      <BottomSheetModal
        ref={handleModalRef}
        index={0}
        snapPoints={resolvedSnapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: "#D1C4B8", width: 44 }}
        backgroundStyle={{ backgroundColor: "#F8F5F2" }}
      >
        <BottomSheetView className="flex-1 px-4 pt-2">
          <View className="gap-4 pb-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">Search</Text>
              <Pressable
                onPress={() => modalRef.current?.dismiss()}
                className="rounded-full bg-muted/50 p-1.5 active:opacity-70"
              >
                <X size={20} color="#575B50" strokeWidth={2.5} />
              </Pressable>
            </View>

            <View className="relative">
              <View className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                <Search size={18} color="#7C806F" strokeWidth={2.2} />
              </View>

              <Input
                autoFocus
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                className="h-14 rounded-2xl border-0 bg-white pl-12 pr-12 text-base"
                returnKeyType="search"
                onSubmitEditing={() => modalRef.current?.dismiss()}
              />

              {value.length > 0 ? (
                <Pressable
                  onPress={onClear}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-muted p-1.5 active:opacity-80"
                >
                  <X size={14} color="#5F655C" strokeWidth={2.6} />
                </Pressable>
              ) : null}
            </View>
          </View>

          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {isLoading ? (
              <View className="py-20 items-center justify-center">
                <ActivityIndicator color="#6A4A36" />
                <Text className="mt-4 text-sm text-muted-foreground">
                  Searching for items...
                </Text>
              </View>
            ) : products.length > 0 ? (
              <View className="gap-5">
                <Text className="text-sm font-medium text-muted-foreground">
                  {products.length} {products.length === 1 ? "Item" : "Items"} found
                </Text>
                {productRows.map((row, rowIndex) => (
                  <View key={`search-row-${rowIndex}`} className="flex-row gap-4">
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
            ) : hasQuery ? (
              <View className="pt-10">
                <EmptyState
                  title="No matching products"
                  description="Try different search terms."
                  variant="default"
                  centered
                  icon={ShoppingBag}
                />
              </View>
            ) : (
              <View className="pt-20 items-center justify-center opacity-40">
                <Search size={48} color="#7C806F" strokeWidth={1.5} />
                <Text className="mt-4 text-center text-sm text-muted-foreground">
                  Enter keywords to find your favorite{"\n"}coffee, tea, and treats.
                </Text>
              </View>
            )}
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

SearchSheet.displayName = "SearchSheet";
