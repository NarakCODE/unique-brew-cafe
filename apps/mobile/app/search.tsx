import { ChevronLeft, Search, XCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as React from "react";
import { Platform, Pressable, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/color-scheme";

const RECENT_SEARCHES = [
  "Seasonal Cakes",
  "Open now",
  "Iced Latte",
  "Best sellers",
];

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useColorScheme();
  const [searchQuery, setSearchQuery] = React.useState("");
  const isEmpty = searchQuery.trim().length === 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 border-b border-border px-4 pb-3 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          onPress={() => {
            router.back();
          }}
        >
          <ChevronLeft size={22} color={colors.foreground} strokeWidth={2.2} />
        </Pressable>

        <View className="flex-1 flex-row items-center gap-2 rounded-2xl bg-muted/50 px-3">
          <Search size={18} color={colors.mutedForeground} strokeWidth={2.1} />
          <TextInput
            autoFocus
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
            className="h-12 flex-1 text-base text-foreground placeholder:text-muted-foreground"
          />
          {Platform.OS !== "ios" && searchQuery.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              className="rounded-full active:opacity-80"
              onPress={() => {
                setSearchQuery("");
              }}
            >
              <XCircle size={18} color={colors.mutedForeground} strokeWidth={2.1} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View className="flex-1 px-4 pt-5">
        {isEmpty ? (
          <View className="gap-4">
            <Text className="text-base font-semibold text-foreground">Recent Searches</Text>
            <View className="flex-row flex-wrap gap-2">
              {RECENT_SEARCHES.map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  className="rounded-full border border-border bg-muted/30 px-4 py-2 active:opacity-80"
                  onPress={() => {
                    setSearchQuery(item);
                  }}
                >
                  <Text className="text-sm text-foreground">{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">
              {`Results for "${searchQuery}"`}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
