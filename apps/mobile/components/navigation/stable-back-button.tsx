import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";

import { Text } from "@/components/ui/text";

export function StableBackButton({ tintColor }: { tintColor?: string }) {
  const router = useRouter();
  const color = tintColor || "#18120E";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      className="flex-row items-center gap-1 active:opacity-50"
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)");
        }
      }}
    >
      <ChevronLeft size={24} color={color} strokeWidth={2.5} />
      <Text className="font-medium" style={{ color }}>
        Back
      </Text>
    </Pressable>
  );
}
