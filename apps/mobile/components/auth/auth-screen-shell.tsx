import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

type AuthScreenShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  contentContainerClassName?: string;
};

export function AuthScreenShell({
  title,
  subtitle,
  children,
  footer,
  contentContainerClassName,
}: AuthScreenShellProps) {
  return (
    <SafeAreaView edges={["bottom"]} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow px-6"
        >
          <View
            className={cn(
              "mx-auto w-full max-w-[420px] flex-1 justify-center gap-8 py-4",
              contentContainerClassName,
            )}
          >
            <View className="items-center gap-4">
              <Logo size={80} />

              <View className="items-center gap-2">
                <Text
                  variant="title1"
                  className="text-center font-semibold text-black dark:text-white"
                >
                  {title}
                </Text>
                <Text
                  color="tertiary"
                  className="max-w-[320px] text-center leading-6"
                >
                  {subtitle}
                </Text>
              </View>
            </View>

            {children}

            {footer ? (
              <View className="items-center pt-2">{footer}</View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
