import type { ComponentProps, ReactNode } from "react";
import { View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[30px] border border-border bg-card py-0">
      <CardContent className="gap-4 px-5 py-5">
        <Text variant="title3" className="text-[19px] font-semibold">
          {title}
        </Text>
        <View className="gap-3">{children}</View>
      </CardContent>
    </Card>
  );
}

export function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      className="rounded-[24px] border border-border bg-background p-4"
      style={{ width: "48.5%" }}
    >
      <Text color="tertiary" className="text-sm">
        {label}
      </Text>
      <Text className="mt-2 text-[22px] font-semibold leading-7">{value}</Text>
    </View>
  );
}

export function InfoRow({
  icon,
  label,
  value,
  trailing,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  trailing?: ReactNode;
}) {
  return (
    <View className="rounded-[24px] border border-border bg-background px-4 py-4">
      <View className="flex-row items-start gap-3">
        {icon ? <View className="pt-1">{icon}</View> : null}
        <View className="flex-1 gap-1">
          <Text color="tertiary" className="text-sm">
            {label}
          </Text>
          <Text className="text-base leading-6 text-foreground">{value}</Text>
        </View>
        {trailing ? <View className="items-end">{trailing}</View> : null}
      </View>
    </View>
  );
}

export function PreferenceRow({
  label,
  description,
  value,
}: {
  label: string;
  description: string;
  value: boolean;
}) {
  return (
    <View className="flex-row items-center gap-4 rounded-[24px] border border-border bg-background px-4 py-4">
      <View className="flex-1 gap-1">
        <Text className="text-base font-medium text-foreground">{label}</Text>
        <Text color="tertiary" className="text-sm leading-6">
          {description}
        </Text>
      </View>
      <Switch checked={value} disabled onCheckedChange={() => {}} />
    </View>
  );
}

export function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Icon>["as"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Button
      variant="outline"
      className="flex-row items-center justify-between rounded-[24px] px-5 py-4"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        <Icon as={icon} size={18} className="text-foreground" />
        <Text className="font-semibold">{label}</Text>
      </View>
      <Text color="tertiary" className="text-sm">
        Open
      </Text>
    </Button>
  );
}

export function StatusBadge({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <Badge
      variant={active ? "secondary" : "outline"}
      className="rounded-full px-3 py-1.5"
    >
      <Text>{label}</Text>
    </Badge>
  );
}
