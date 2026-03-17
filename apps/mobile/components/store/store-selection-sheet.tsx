import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Check, ChevronDown, MapPin, Store as StoreIcon } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import type { MobileStore } from "@/services/store.service";

type StoreSelectionSheetProps = {
  stores: MobileStore[];
  selectedStoreId?: string;
  onSelectStore: (storeId: string) => void;
  backgroundColor: string;
  bottomInset?: number;
  snapPoints?: string[];
  title?: string;
  description?: string;
};

export const StoreSelectionSheet = React.forwardRef<
  BottomSheetModal,
  StoreSelectionSheetProps
>(function StoreSelectionSheet(
  {
    stores,
    selectedStoreId,
    onSelectStore,
    backgroundColor,
    bottomInset = 16,
    snapPoints,
    title = "Choose a store",
    description = "The menu and categories update based on the selected store.",
  },
  ref,
) {
  const modalRef = React.useRef<BottomSheetModal>(null);
  const handleModalRef = React.useCallback(
    (instance: BottomSheetModal | null) => {
      modalRef.current = instance;

      if (typeof ref === "function") {
        ref(instance);
        return;
      }

      if (ref) {
        ref.current = instance;
      }
    },
    [ref],
  );
  const resolvedSnapPoints = React.useMemo(
    () => snapPoints ?? ["62%"],
    [snapPoints],
  );

  const renderBackdrop = React.useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.18}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={handleModalRef}
      snapPoints={resolvedSnapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: "rgba(96, 80, 67, 0.24)" }}
      backgroundStyle={{ backgroundColor }}
    >
      <BottomSheetFlatList
        data={stores}
        keyExtractor={(store) => store.id}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{
          paddingTop: 8,
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: Math.max(bottomInset, 16),
        }}
        ListHeaderComponent={
          <View
            className="mb-4 gap-2 border-b border-border pb-3"
            style={{ backgroundColor }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">{title}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close store selector"
                className="h-8 w-8 items-center justify-center rounded-full border border-border bg-background active:opacity-80"
                onPress={() => {
                  modalRef.current?.dismiss();
                }}
              >
                <ChevronDown size={16} color="#6F736C" strokeWidth={2.2} />
              </Pressable>
            </View>
            <Text className="text-sm text-muted-foreground">{description}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <StoreSheetRow
            store={item}
            selected={item.id === selectedStoreId}
            onPress={() => {
              onSelectStore(item.id);
            }}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
      />
    </BottomSheetModal>
  );
});

function StoreSheetRow({
  store,
  selected,
  onPress,
}: {
  store: MobileStore;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : {}}
      className="rounded-[22px] border px-4 py-4 active:opacity-90"
      onPress={onPress}
      style={{
        borderColor: selected ? "#C89A6A" : "#E6DDD6",
        backgroundColor: selected ? "#FAF1E6" : "#FFFFFF",
      }}
    >
      <View className="flex-row items-start gap-3">
        <View className="mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-[#F3E7DA]">
          <StoreIcon size={18} color="#6A4A36" strokeWidth={2.1} />
        </View>

        <View className="flex-1 gap-2">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                {store.name}
              </Text>
              <View className="mt-1 flex-row items-center gap-1.5">
                <MapPin size={14} color="#7C806F" strokeWidth={2.1} />
                <Text className="flex-1 text-sm text-muted-foreground" numberOfLines={2}>
                  {store.address}, {store.city}
                </Text>
              </View>
            </View>

            {selected ? <Check size={18} color="#6A4A36" strokeWidth={2.6} /> : null}
          </View>

          <View className="flex-row items-center gap-2">
            <View
              className="rounded-full px-2.5 py-1"
              style={{
                backgroundColor: store.isOpenNow ? "#E8F4EA" : "#F4ECE7",
              }}
            >
              <Text
                className="text-[11px] font-semibold"
                style={{ color: store.isOpenNow ? "#2F6A3D" : "#765C4B" }}
              >
                {store.isOpenNow ? "Open now" : "Closed"}
              </Text>
            </View>

            <Text className="text-xs text-muted-foreground">
              {store.averagePrepTime} min prep
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
