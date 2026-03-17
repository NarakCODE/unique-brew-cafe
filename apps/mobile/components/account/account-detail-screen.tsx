import { ReactNode } from "react";
import { View } from "react-native";

import { ScreenLayout } from "@/components/layout/screen-layout";

type AccountDetailScreenProps = {
  header?: ReactNode;
  children?: ReactNode;
};

export function AccountDetailScreen({
  header,
  children,
}: AccountDetailScreenProps) {
  return (
    <ScreenLayout className="px-4">
      {header ? <View className="pb-4 pt-2">{header}</View> : null}
      {children}
    </ScreenLayout>
  );
}
