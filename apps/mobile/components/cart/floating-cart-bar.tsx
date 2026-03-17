import { ChevronRight, ShoppingCart } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { formatCurrency } from "@/components/account/my-account-helpers";
import { Text } from "@/components/ui/text";
import { useCartSummary } from "@/hooks/use-cart";
import { useColorScheme } from "@/lib/color-scheme";
import { withOpacity } from "@/theme/with-opacity";

type FloatingCartBarProps = {
  hidden?: boolean;
  onPress: () => void;
};

export function FloatingCartBar({
  hidden = false,
  onPress,
}: FloatingCartBarProps) {
  const cartSummaryQuery = useCartSummary();
  const { isDarkColorScheme } = useColorScheme();

  if (hidden || cartSummaryQuery.isLoading || cartSummaryQuery.isError) {
    return null;
  }

  if (!cartSummaryQuery.data || cartSummaryQuery.data.itemCount < 1) {
    return null;
  }

  const containerBackground = isDarkColorScheme
    ? "rgba(244, 208, 168, 0.82)"
    : "rgba(59, 42, 32, 0.78)";
  const iconBackground = isDarkColorScheme
    ? "rgba(38, 24, 16, 0.12)"
    : "rgba(255, 248, 240, 0.18)";
  const primaryText = isDarkColorScheme ? "#241912" : "#FFF8F2";
  const secondaryText = isDarkColorScheme
    ? withOpacity("#241912", 0.72)
    : "rgba(255, 248, 240, 0.78)";
  const borderColor = isDarkColorScheme
    ? "rgba(255, 250, 244, 0.22)"
    : "rgba(255, 248, 240, 0.18)";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View cart with ${cartSummaryQuery.data.itemCount} items`}
      className="flex-row items-center justify-between rounded-[20px] border px-3.5 py-2.5 active:opacity-95"
      style={{
        backgroundColor: containerBackground,
        borderColor,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDarkColorScheme ? 0.12 : 0.08,
        shadowRadius: 14,
        elevation: 6,
      }}
      onPress={onPress}
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBackground }}
        >
          <ShoppingCart size={18} color={primaryText} strokeWidth={2.1} />
        </View>

        <View className="flex-1">
          <Text className="text-[15px] font-semibold" style={{ color: primaryText }}>
            View cart ({formatItemCount(cartSummaryQuery.data.itemCount)})
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-1">
        <Text className="text-[15px] font-semibold" style={{ color: primaryText }}>
          {formatCurrency(cartSummaryQuery.data.total, "USD")}
        </Text>
        <ChevronRight size={16} color={secondaryText} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

function formatItemCount(itemCount: number) {
  return `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
}
