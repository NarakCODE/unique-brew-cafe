import { useCallback } from "react";
import { useRouter } from "expo-router";

import { ActionHeader } from "@/components/layout/action-header";

type AccountActionHeaderProps = {
  title: string;
};

export function AccountActionHeader({ title }: AccountActionHeaderProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/account");
  }, [router]);

  return (
    <ActionHeader
      mode="back"
      label={title}
      leftAccessibilityLabel="Go back"
      onLeftPress={handleBack}
    />
  );
}
