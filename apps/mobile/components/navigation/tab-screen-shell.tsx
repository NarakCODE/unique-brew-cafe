import { ReactNode } from "react";
import { View } from "react-native";
import { FadeInDown, FadeInUp } from "react-native-reanimated";

import { ScreenLayout } from "@/components/layout/screen-layout";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Text } from "@/components/ui/text";

type TabScreenStat = {
  label: string;
  value: string;
};

type TabScreenShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats?: TabScreenStat[];
  children: ReactNode;
};

export function TabScreenShell({
  eyebrow,
  title,
  description,
  stats,
  children,
}: TabScreenShellProps) {
  return (
    <ScreenLayout contentClassName="gap-5 px-4 pt-2">
      <NativeOnlyAnimatedView entering={FadeInDown.duration(450)}>
        <View className="overflow-hidden rounded-[32px] border border-border bg-card px-5 py-6">
          <View className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10" />
          <View className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-amber-200/35 dark:bg-primary/10" />

          <Text
            variant="footnote"
            className="self-start rounded-full bg-primary/10 px-3 py-1 uppercase tracking-[1.8px] text-primary"
          >
            {eyebrow}
          </Text>

          <Text
            variant="largeTitle"
            className="mt-4 text-[29px] font-extrabold leading-9 tracking-[-0.7px]"
          >
            {title}
          </Text>

          <Text color="tertiary" variant="subhead" className="mt-3 leading-6">
            {description}
          </Text>

          {stats?.length ? (
            <View className="mt-5 flex-row flex-wrap gap-3">
              {stats.map((stat) => (
                <View
                  key={stat.label}
                  className="min-w-[132px] flex-1 rounded-[24px] bg-background/80 px-4 py-4"
                >
                  <Text variant="title3" className="font-bold">
                    {stat.value}
                  </Text>
                  <Text
                    variant="footnote"
                    color="tertiary"
                    className="mt-1 uppercase tracking-[1.1px]"
                  >
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </NativeOnlyAnimatedView>

      <NativeOnlyAnimatedView entering={FadeInUp.delay(80).duration(450)}>
        <View className="gap-4">{children}</View>
      </NativeOnlyAnimatedView>
    </ScreenLayout>
  );
}
