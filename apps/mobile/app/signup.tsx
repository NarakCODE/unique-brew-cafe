import { ImageBackground } from "expo-image";
import { Redirect, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { AuthFormField } from "@/components/auth/auth-form-field";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { Button } from "@/components/nativewindui/Button";
import { Text } from "@/components/nativewindui/Text";
import { useAuth } from "@/providers/auth-provider";

const BACKGROUND_IMAGE = require("@/assets/images/login-bg.png");

export default function SignupScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={{ flex: 1 }}
      contentFit="cover"
    >
      <View className="flex-1 bg-[#2E190C]/50">
        <AuthScreenShell
          title="Create your account"
          subtitle="Start building your coffee routine. Enter your details below to set up your Unique Brew account."
          contentContainerClassName="justify-between py-4"
          footer={
            <View className="items-center gap-3">
              <Text
                variant="footnote"
                className="text-center leading-5 text-[#6F5847]"
              >
                Mobile registration submission is not wired yet. This screen is
                ready for the `/auth/register` flow.
              </Text>
              <View className="flex-row items-center gap-1">
                <Text variant="subhead" className="text-[#6F5847]">
                  Already have an account?
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Log in"
                  onPress={() => router.push("/login")}
                >
                  <Text
                    variant="subhead"
                    className="font-semibold text-[#3D2415]"
                  >
                    Log in
                  </Text>
                </Pressable>
              </View>
            </View>
          }
        >
          <View className="rounded-[34px] border border-white/20 bg-[#FFF7EE]/92 p-6 shadow-2xl">
            <View className="gap-5">
              <View className="gap-1">
                <Text variant="title2" className="font-semibold text-[#3D2415]">
                  Sign up
                </Text>
                <Text variant="subhead" className="leading-6 text-[#6F5847]">
                  Create a profile to save favorites, manage pickup details, and
                  order faster.
                </Text>
              </View>

              <AuthFormField
                autoCapitalize="words"
                autoComplete="name"
                placeholder="Full name"
                textContentType="name"
                label="Full name"
                className="border border-[#E5D3C3] bg-white text-[#2F1B10]"
              />

              <AuthFormField
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@example.com"
                textContentType="emailAddress"
                label="Email address"
                className="border border-[#E5D3C3] bg-white text-[#2F1B10]"
              />

              <AuthFormField
                autoCapitalize="none"
                autoComplete="new-password"
                helperText="Passwords must be at least 6 characters."
                placeholder="Create a password"
                secureTextEntry
                textContentType="newPassword"
                label="Password"
                className="border border-[#E5D3C3] bg-white text-[#2F1B10]"
              />

              <AuthFormField
                autoCapitalize="none"
                autoComplete="new-password"
                placeholder="Confirm your password"
                secureTextEntry
                textContentType="password"
                label="Confirm password"
                className="border border-[#E5D3C3] bg-white text-[#2F1B10]"
              />

              <Button
                size="lg"
                className="mt-2 h-14 rounded-[22px] bg-[#5A3421]"
                disabled
              >
                <Text className="text-lg font-semibold text-white">
                  Create account
                </Text>
              </Button>
            </View>
          </View>
        </AuthScreenShell>
      </View>
    </ImageBackground>
  );
}
