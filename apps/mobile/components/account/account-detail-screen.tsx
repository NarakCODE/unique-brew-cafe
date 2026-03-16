import { ReactNode } from "react";

import { ScreenLayout } from "@/components/layout/screen-layout";

type AccountDetailScreenProps = {
  children?: ReactNode;
};

export function AccountDetailScreen({ children }: AccountDetailScreenProps) {
  return <ScreenLayout className="px-4">{children}</ScreenLayout>;
}
