import { ImageBackground } from "expo-image";
import { Redirect } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthFormField } from "@/components/auth/auth-form-field";
import { Button } from "@/components/nativewindui/Button";
import { Text } from "@/components/nativewindui/Text";
import { Logo } from "@/components/ui/logo";
import { useLoginForm } from "@/hooks/use-login-form";
import { useAuth } from "@/providers/auth-provider";

const BACKGROUND_IMAGE = require("@/assets/images/login-bg.png");

export default function LoginScreen() {
  const { isAuthenticated, signIn } = useAuth();
  const form = useLoginForm(async (values) => {
    await signIn(values);
  });

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={{ flex: 1 }}
      contentFit="cover"
    >
      <View className="flex-1 bg-[#2E190C]/55">
        <SafeAreaView edges={["top", "bottom"]} className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="flex-grow justify-between px-6 py-6"
            >
              <View className="items-center pt-3">
                <View className="rounded-[32px] border border-white/30 bg-white/88 p-4 shadow-2xl">
                  <Logo size={88} />
                </View>
              </View>

              <View className="gap-6 pb-8">
                <View className="gap-3">
                  <Text
                    variant="largeTitle"
                    className="max-w-[280px] text-white"
                  >
                    Brew your next order.
                  </Text>
                  <Text
                    variant="body"
                    className="max-w-[320px] leading-6 text-white/80"
                  >
                    Sign in to track pickups, reorder favorites, and keep your
                    coffee routine moving.
                  </Text>
                </View>

                <View className="rounded-[34px] border border-white/20 bg-[#FFF7EE]/92 p-6 shadow-2xl">
                  <View className="gap-5">
                    <View className="gap-1">
                      <Text
                        variant="title2"
                        className="font-semibold text-[#3D2415]"
                      >
                        Welcome back
                      </Text>
                      <Text
                        variant="subhead"
                        className="leading-6 text-[#6F5847]"
                      >
                        Use your account to continue browsing the menu and place
                        your next pickup.
                      </Text>
                    </View>

                    {form.submissionError ? (
                      <View className="rounded-2xl border border-[#C96E4B]/30 bg-[#FFF1EA] p-4">
                        <Text variant="subhead" className="text-[#A24724]">
                          {form.submissionError}
                        </Text>
                      </View>
                    ) : null}

                    <AuthFormField
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      keyboardType="email-address"
                      label="Email address"
                      placeholder="you@example.com"
                      returnKeyType="next"
                      textContentType="emailAddress"
                      value={form.values.email}
                      error={form.errors.email}
                      className="border border-[#E5D3C3] bg-white text-[#2F1B10]"
                      onChangeText={(text) => form.setFieldValue("email", text)}
                    />

                    <AuthFormField
                      autoCapitalize="none"
                      autoComplete="password"
                      helperText="Passwords must be at least 6 characters."
                      label="Password"
                      placeholder="Enter your password"
                      returnKeyType="done"
                      secureTextEntry
                      textContentType="password"
                      value={form.values.password}
                      error={form.errors.password}
                      className="border border-[#E5D3C3] bg-white text-[#2F1B10]"
                      onChangeText={(text) =>
                        form.setFieldValue("password", text)
                      }
                      onSubmitEditing={() => {
                        void form.submit();
                      }}
                    />

                    <Button
                      size="lg"
                      className="mt-2 h-14 rounded-[22px] bg-[#5A3421]"
                      disabled={!form.canSubmit}
                      onPress={() => {
                        void form.submit();
                      }}
                    >
                      <Text className="text-lg font-semibold text-white">
                        {form.isSubmitting ? "Signing in..." : "Sign in"}
                      </Text>
                    </Button>

                    <Text
                      variant="footnote"
                      className="text-center leading-5 text-[#6F5847]"
                    >
                      Authentication uses the backend `/auth/login` endpoint.
                      Set `EXPO_PUBLIC_API_URL` if your API is not running on
                      the local default.
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
