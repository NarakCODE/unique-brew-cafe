import { ChevronLeft, X } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type ActionHeaderMode = "back" | "close";

export type ActionHeaderProps = {
  mode?: ActionHeaderMode;
  label: string;
  leftAccessibilityLabel?: string;
  onLeftPress: () => void;
  rightAccessory?: ReactNode;
  className?: string;
};

export function ActionHeader({
  mode = "back",
  label,
  leftAccessibilityLabel,
  onLeftPress,
  rightAccessory,
  className,
}: ActionHeaderProps) {
  return (
    <View className={cn("flex-row items-center justify-between", className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={leftAccessibilityLabel}
        className="flex-row items-center gap-1 rounded-full px-1 py-2 active:opacity-80"
        hitSlop={10}
        onPress={onLeftPress}
      >
        {mode === "close" ? (
          <X size={18} color="#1F1A16" strokeWidth={2.4} />
        ) : (
          <ChevronLeft size={20} color="#1F1A16" strokeWidth={2.4} />
        )}
        <Text className="text-base font-medium text-foreground">{label}</Text>
      </Pressable>

      <View className="flex-row items-center gap-3">{rightAccessory}</View>
    </View>
  );
}

export function HeaderIconButton({
  children,
  accessibilityLabel,
  disabled,
  onPress,
}: {
  children: ReactNode;
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="h-11 w-11 items-center justify-center rounded-full border bg-card active:opacity-80"
      style={{ borderColor: "#E6DDD6", opacity: disabled ? 0.6 : 1 }}
      disabled={disabled}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}
