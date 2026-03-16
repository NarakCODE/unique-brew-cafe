import { Image } from "expo-image";
import type { LucideIcon } from "lucide-react-native";
import { CircleAlert } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  illustrationSource?: React.ComponentProps<typeof Image>["source"];
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "error";
  surface?: "card" | "soft";
  centered?: boolean;
  className?: string;
  contentClassName?: string;
};

export const DEFAULT_EMPTY_ILLUSTRATION = require("@/assets/images/empty.svg");

export function EmptyState({
  title,
  description,
  icon,
  illustrationSource,
  actionLabel,
  onAction,
  variant = "default",
  surface = "card",
  centered = false,
  className,
  contentClassName,
}: EmptyStateProps) {
  const IconComponent = icon ?? (variant === "error" ? CircleAlert : undefined);
  const Container = surface === "card" ? Card : View;

  return (
    <Container
      className={cn(
        surface === "card"
          ? "rounded-3xl border border-border bg-card py-0"
          : "rounded-2xl bg-white",
        className,
      )}
    >
      <CardContent
        className={cn(
          centered
            ? "items-center gap-3 px-5 py-8"
            : "items-start gap-2 px-5 py-5",
          contentClassName,
        )}
      >
        {illustrationSource ? (
          <View className="mb-1 h-40 w-40">
            <Image
              source={illustrationSource}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              accessibilityLabel=""
              accessible={false}
            />
          </View>
        ) : null}

        {IconComponent ? (
          <View
            className={cn(
              "rounded-full p-4",
              variant === "error" ? "bg-destructive/10" : "bg-muted",
            )}
          >
            <Icon
              as={IconComponent}
              size={24}
              strokeWidth={2.2}
              className={
                variant === "error"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }
            />
          </View>
        ) : null}

        <View className={cn("gap-1", centered && "items-center")}>
          <Text
            className={cn(
              "text-base font-semibold text-foreground",
              centered && "text-center",
            )}
          >
            {title}
          </Text>
          {description ? (
            <Text
              className={cn(
                "text-sm leading-6 text-muted-foreground",
                centered && "text-center",
              )}
            >
              {description}
            </Text>
          ) : null}
        </View>

        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            className="rounded-full bg-secondary px-4 py-2 active:opacity-80"
            onPress={onAction}
          >
            <Text className="text-sm font-semibold text-secondary-foreground">
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </CardContent>
    </Container>
  );
}
