import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

type ScreenLayoutProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  padded?: boolean;
  topInsetOffset?: number;
  bottomInsetOffset?: number;
  showsVerticalScrollIndicator?: boolean;
};

export function ScreenLayout({
  children,
  className,
  contentClassName,
  padded = false,
  topInsetOffset = 8,
  bottomInsetOffset = 28,
  showsVerticalScrollIndicator = false,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className={cn("flex-1 bg-background", className)}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingTop: topInsetOffset,
        paddingBottom: insets.bottom + bottomInsetOffset,
      }}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    >
      <View className={cn("gap-6", padded && "px-5", contentClassName)}>
        {children}
      </View>
    </ScrollView>
  );
}
