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

  const containerBackground = isDarkColorScheme ? "#F4D0A8" : "#3B2A20";
  const iconBackground = isDarkColorScheme
    ? "rgba(38, 24, 16, 0.12)"
    : "rgba(255, 248, 240, 0.14)";
  const primaryText = isDarkColorScheme ? "#241912" : "#FFF8F2";
  const secondaryText = isDarkColorScheme
    ? withOpacity("#241912", 0.72)
    : "rgba(255, 248, 240, 0.78)";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View cart with ${cartSummaryQuery.data.itemCount} items`}
      className="flex-row items-center justify-between rounded-[22px] px-4 py-3 active:opacity-95"
      style={{
        backgroundColor: containerBackground,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDarkColorScheme ? 0.18 : 0.1,
        shadowRadius: 18,
        elevation: 8,
      }}
      onPress={onPress}
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBackground }}
        >
          <ShoppingCart size={20} color={primaryText} strokeWidth={2.1} />
        </View>

        <View className="flex-1 gap-0.5">
          <Text className="text-base font-semibold" style={{ color: primaryText }}>
            View cart ({formatItemCount(cartSummaryQuery.data.itemCount)})
          </Text>
          <Text className="text-xs font-medium" style={{ color: secondaryText }}>
            Ready to review your order
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-1">
        <Text className="text-base font-semibold" style={{ color: primaryText }}>
          {formatCurrency(cartSummaryQuery.data.total, "USD")}
        </Text>
        <ChevronRight size={18} color={primaryText} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

function formatItemCount(itemCount: number) {
  return `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
}
