import type { ReactNode } from "react";
import { View } from "react-native";

import { AccountDetailScreen } from "@/components/account/account-detail-screen";
import { Card, CardContent } from "@/components/ui/card";

type MyAccountLoadingStateProps = {
  header?: ReactNode;
};

export function MyAccountLoadingState({ header }: MyAccountLoadingStateProps) {
  return (
    <AccountDetailScreen header={header}>
      <View className="gap-5">
        <Card className="rounded-[30px] border border-border bg-card py-0">
          <CardContent className="gap-5 px-5 py-6">
            <View className="flex-row items-center gap-4">
              <View className="size-[92px] rounded-full bg-muted" />
              <View className="flex-1 gap-3">
                <View className="h-7 w-2/3 rounded-full bg-muted" />
                <View className="h-4 w-full rounded-full bg-muted" />
                <View className="h-4 w-5/6 rounded-full bg-muted" />
              </View>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <View
                  key={`badge-loading-${index}`}
                  className="h-8 w-28 rounded-full bg-muted"
                />
              ))}
            </View>
          </CardContent>
        </Card>

        {Array.from({ length: 4 }).map((_, sectionIndex) => (
          <Card
            key={`section-loading-${sectionIndex}`}
            className="rounded-[30px] border border-border bg-card py-0"
          >
            <CardContent className="gap-4 px-5 py-5">
              <View className="h-5 w-40 rounded-full bg-muted" />
              {sectionIndex === 0 ? (
                <View className="flex-row flex-wrap justify-between gap-3">
                  {Array.from({ length: 4 }).map((__, itemIndex) => (
                    <View
                      key={`metric-loading-${itemIndex}`}
                      className="rounded-[24px] border border-border bg-background p-4"
                      style={{ width: "48.5%" }}
                    >
                      <View className="h-4 w-20 rounded-full bg-muted" />
                      <View className="mt-3 h-7 w-24 rounded-full bg-muted" />
                    </View>
                  ))}
                </View>
              ) : (
                Array.from({ length: 3 }).map((__, rowIndex) => (
                  <View
                    key={`row-loading-${sectionIndex}-${rowIndex}`}
                    className="rounded-[24px] border border-border bg-background px-4 py-4"
                  >
                    <View className="flex-row items-center justify-between gap-4">
                      <View className="flex-1 gap-2">
                        <View className="h-4 w-1/2 rounded-full bg-muted" />
                        <View className="h-4 w-2/3 rounded-full bg-muted" />
                      </View>
                      <View className="h-6 w-11 rounded-full bg-muted" />
                    </View>
                  </View>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </View>
    </AccountDetailScreen>
  );
}
