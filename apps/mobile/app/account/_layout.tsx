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
      <Stack.Screen name="my-account" options={{ title: "My Account" }} />
      <Stack.Screen name="order-history" options={{ title: "History" }} />
      <Stack.Screen name="favorites" options={{ title: "Favorites" }} />
      <Stack.Screen name="stores" options={{ title: "Stores" }} />
      <Stack.Screen name="announcements" options={{ title: "Announcements" }} />
      <Stack.Screen
        name="customer-service"
        options={{ title: "Customer Service" }}
      />
      <Stack.Screen name="feedback" options={{ title: "Feedback" }} />
      <Stack.Screen name="faqs" options={{ title: "FAQs" }} />
    </Stack>
  );
}
