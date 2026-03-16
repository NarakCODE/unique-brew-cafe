import "../global.css";
import "expo-dev-client";
import { PortalHost } from "@rn-primitives/portal";
import { ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import "react-native-reanimated";

import { StableBackButton } from "@/components/navigation/stable-back-button";
import { useColorScheme } from "@/lib/color-scheme";
import { createQueryClient } from "@/lib/query-client";
import { AuthProvider } from "@/providers/auth-provider";
import { NAV_THEME } from "@/lib/theme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const { colorScheme, colors, isDarkColorScheme } = useColorScheme();
  const [queryClient] = useState(createQueryClient);

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? "light" : "dark"}`}
        style={isDarkColorScheme ? "light" : "dark"}
      />

      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Stack
              screenOptions={{
                headerBackButtonDisplayMode: "minimal",
                headerBackVisible: true,
                headerShadowVisible: false,
                headerTintColor: colors.foreground,
                headerTitleStyle: {
                  color: colors.foreground,
                },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="login"
                options={{
                  title: "",
                  headerTransparent: true,
                }}
              />
              <Stack.Screen
                name="signup"
                options={{
                  title: "",
                  headerTransparent: true,
                }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="search"
                options={{
                  title: "Search",
                  headerBackVisible: false,
                  gestureEnabled: true,
                  headerLeft: ({ tintColor }) => (
                    <StableBackButton tintColor={tintColor} />
                  ),
                }}
              />
              <Stack.Screen name="account" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
              <Stack.Screen
                name="announcement/[id]"
                options={{
                  title: "Announcement",
                  headerBackVisible: false,
                  gestureEnabled: true,
                  headerLeft: ({ tintColor }) => (
                    <StableBackButton tintColor={tintColor} />
                  ),
                }}
              />
              <Stack.Screen
                name="store/[id]"
                options={{
                  title: "Store",
                  headerBackVisible: false,
                  gestureEnabled: true,
                  headerLeft: ({ tintColor }) => (
                    <StableBackButton tintColor={tintColor} />
                  ),
                }}
              />
              <Stack.Screen
                name="product/[id]"
                options={{
                  headerShown: false,
                  gestureEnabled: true,
                }}
              />
            </Stack>
            <PortalHost />
          </AuthProvider>
        </QueryClientProvider>
      </NavThemeProvider>
    </>
  );
}
