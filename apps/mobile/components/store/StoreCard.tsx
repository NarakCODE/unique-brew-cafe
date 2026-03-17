import type { StoreItem } from "../../../../packages/api/src";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Clock3, MapPin, Star, Store as StoreIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import {
  formatDistance,
  getStoreImageUri,
} from "@/components/store/store-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type StoreCardProps = {
  store: StoreItem;
};

export function StoreCard({ store }: StoreCardProps) {
  const router = useRouter();
  const imageUri = getStoreImageUri(store);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View details for ${store.name}`}
      onPress={() =>
        router.navigate({
          pathname: "/store/[id]",
          params: { id: store.id },
        })
      }
    >
      <Card className="overflow-hidden bg-card py-0">
        <View className="flex-row">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              contentFit="cover"
              transition={150}
              style={styles.storeImage}
            />
          ) : (
            <View className="h-full w-[136px] items-center justify-center bg-[#EFE8DB]">
              <View className="items-center gap-2">
                <View className="rounded-full bg-white/80 p-3">
                  <StoreIcon size={24} color="#7A6A56" strokeWidth={2.1} />
                </View>
                <Text className="text-xs font-medium text-[#7A6A56]">
                  Store preview
                </Text>
              </View>
            </View>
          )}

          <CardContent className="flex-1 gap-3 px-4 py-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-[19px] font-semibold leading-7 text-foreground">
                  {store.name}
                </Text>
              </View>

              <Badge
                variant={store.isOpenNow ? "secondary" : "outline"}
                className="rounded-full px-2.5 py-1"
              >
                <Text>{store.isOpenNow ? "Open" : "Closed"}</Text>
              </Badge>
            </View>

            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-1.5">
                <MapPin size={15} color="#7C806F" strokeWidth={2.1} />
                <Text className="text-sm text-muted-foreground">
                  {store.city}
                </Text>
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

            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <Clock3 size={14} color="#7C806F" strokeWidth={2.1} />
                <Text className="text-sm text-muted-foreground">
                  {store.averagePrepTime} min prep
                </Text>
              </View>

              {typeof store.distance === "number" ? (
                <Text className="text-sm text-muted-foreground">
                  {formatDistance(store.distance)}
                </Text>
              ) : null}
            </View>
          </CardContent>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  storeImage: {
    width: 136,
    height: 136,
  },
});
