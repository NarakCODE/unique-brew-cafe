import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import * as React from "react";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FloatingCartBar } from "@/components/cart/floating-cart-bar";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/color-scheme";
import { withOpacity } from "@/theme/with-opacity";

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDarkColorScheme } = useColorScheme();

  const containerBackground = isDarkColorScheme
    ? withOpacity(colors.card, 0.94)
    : "rgba(255, 248, 240, 0.96)";
  const activeBackground = isDarkColorScheme ? "#F7C899" : "#3B2A20";
  const activeForeground = isDarkColorScheme ? "#221711" : "#FFF8F2";
  const inactiveForeground = isDarkColorScheme
    ? "rgba(255, 236, 214, 0.72)"
    : "rgba(84, 62, 46, 0.66)";
  const inactiveBackground = isDarkColorScheme
    ? "rgba(255,255,255,0.05)"
    : "rgba(59, 42, 32, 0.05)";
  const navigateToTab = navigation.navigate as (
    name: string,
    params?: object,
  ) => void;
  const activeRouteName = state.routes[state.index]?.name;

  const handleCartPress = () => {
    if (activeRouteName === "cart") {
      return;
    }

    if (Platform.OS !== "web") {
      void Haptics.selectionAsync();
    }

    navigateToTab("cart");
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <View
        className="gap-2 border-t px-3 pt-2"
        style={{
          backgroundColor: containerBackground,
          borderTopColor: withOpacity(
            colors.foreground,
            isDarkColorScheme ? 0.08 : 0.06,
          ),
          paddingBottom: Math.max(insets.bottom, 10),
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: isDarkColorScheme ? 0.16 : 0.04,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <FloatingCartBar
          hidden={activeRouteName === "cart"}
          onPress={handleCartPress}
        />

        <View className="flex-row items-center gap-2">
          {state.routes.map((route, index) => {
            const descriptor = descriptors[route.key];
            const options = descriptor.options;
            const isFocused = state.index === index;
            const label = getTabLabel(route.name, options);
            const tintColor = isFocused ? activeForeground : inactiveForeground;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (event.defaultPrevented) {
                return;
              }

              if (!isFocused) {
                if (Platform.OS !== "web") {
                  void Haptics.selectionAsync();
                }

                navigateToTab(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <View key={route.key} className="flex-1">
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarButtonTestID}
                  onLongPress={onLongPress}
                  onPress={onPress}
                  className="min-h-[64px] items-center justify-center overflow-hidden rounded-[24px] px-2 py-2"
                  style={{
                    backgroundColor: isFocused
                      ? activeBackground
                      : inactiveBackground,
                  }}
                >
                  <View className="items-center justify-center">
                    {options.tabBarIcon?.({
                      focused: isFocused,
                      color: tintColor,
                      size: 22,
                    })}
                  </View>

                  <View className="mt-1">
                    <Text
                      className="text-[11px] font-extrabold leading-4 tracking-[0.2px]"
                      style={{ color: tintColor }}
                    >
                      {label}
                    </Text>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function getTabLabel(
  routeName: string,
  options: BottomTabBarProps["descriptors"][string]["options"],
) {
  if (typeof options.tabBarLabel === "string") {
    return options.tabBarLabel;
  }

  if (typeof options.title === "string" && options.title.length > 0) {
    return options.title;
  }

  return routeName;
}
