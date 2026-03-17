import { Stack } from "expo-router";

import { StableBackButton } from "@/components/navigation/stable-back-button";

export default function AccountStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackVisible: false,
        gestureEnabled: true,
        headerLeft: ({ tintColor }) => (
          <StableBackButton tintColor={tintColor} />
        ),
      }}
    >
      <Stack.Screen
        name="my-account"
        options={{ title: "My Account", headerShown: false }}
      />
      <Stack.Screen
        name="order-history"
        options={{ title: "History", headerShown: false }}
      />
      <Stack.Screen
        name="favorites"
        options={{ title: "Favorites", headerShown: false }}
      />
      <Stack.Screen
        name="stores"
        options={{ title: "Stores", headerShown: false }}
      />
      <Stack.Screen
        name="announcements"
        options={{ title: "Announcements", headerShown: false }}
      />
      <Stack.Screen
        name="customer-service"
        options={{ title: "Customer Service", headerShown: false }}
      />
      <Stack.Screen
        name="feedback"
        options={{ title: "Feedback", headerShown: false }}
      />
      <Stack.Screen
        name="faqs"
        options={{ title: "FAQs", headerShown: false }}
      />
    </Stack>
  );
}
