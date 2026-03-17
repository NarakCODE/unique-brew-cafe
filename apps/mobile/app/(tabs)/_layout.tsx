import { Redirect, Tabs } from "expo-router";
import React from "react";

import { FloatingTabBar } from "@/components/navigation/floating-tab-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/lib/color-scheme";
import { useAuth } from "@/providers/auth-provider";

export default function TabLayout() {
  const { colors } = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        sceneStyle: {
          backgroundColor: colors.background,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="magnifyingglass" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="heart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
