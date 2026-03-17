import { Redirect } from "expo-router";

import { OnboardingScreen } from "@/components/auth/onboarding-screen";
import { useAuth } from "@/providers/auth-provider";

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <OnboardingScreen />;
}
