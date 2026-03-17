import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type ScreenTopBarProps = {
  title: string;
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
  className?: string;
  titleClassName?: string;
};

export function ScreenTopBar({
  title,
  leftAccessory,
  rightAccessory,
  className,
  titleClassName,
}: ScreenTopBarProps) {
  return (
    <View
      className={cn(
        "min-h-[44px] flex-row items-center px-1 pt-1",
        className,
      )}
    >
      <View className="w-24 items-start justify-center">
        {leftAccessory}
      </View>

      <View className="flex-1 items-center justify-center px-2">
        <Text
          className={cn(
            "text-[22px] font-semibold leading-7 text-foreground",
            titleClassName,
          )}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <View className="w-24 items-end justify-center">
        {rightAccessory}
      </View>
    </View>
  );
}
