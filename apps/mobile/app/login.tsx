import * as React from "react";
import { Redirect, useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

import { AuthFormField } from "@/components/auth/auth-form-field";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useLoginForm } from "@/hooks/use-login-form";
import { mobileApiClient } from "@/lib/mobile-api-client";
import { useAuth } from "@/providers/auth-provider";
import { createAuthApi } from "../../../packages/api/src";

const authApi = createAuthApi(mobileApiClient);

export default function LoginScreen() {
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const router = useRouter();
  const passwordInputRef = React.useRef<TextInput>(null);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const {
    values,
    errors,
    submissionError,
    isSubmitting,
    canSubmit,
    setFieldValue,
    submit,
  } = useLoginForm(async (credentials) => {
    const response = await authApi.login(credentials);
    await signIn(response);
  });

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View className="flex-1 bg-[#FBF6EF]">
      <AuthScreenShell
        title="Welcome back"
        subtitle="Sign in to keep your favorites, recent searches, and coffee routine synced across Unique Brew."
        footer={
          <View className="items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Text variant="subhead" className="text-[#6F5847]">
                Don&apos;t have an account?
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign up"
                onPress={() => {
                  router.push("/signup");
                }}
              >
                <Text
                  variant="subhead"
                  className="font-semibold text-[#3D2415]"
                >
                  Sign up
                </Text>
              </Pressable>
            </View>
          </View>
        }
      >
        <View>
          <View className="gap-5">
            <AuthFormField
              id="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              returnKeyType="next"
              submitBehavior="submit"
              textContentType="emailAddress"
              value={values.email}
              onChangeText={(value) => setFieldValue("email", value)}
              onSubmitEditing={onEmailSubmitEditing}
              label="Email address"
              error={errors.email}
              className="border border-[#E5D3C3] bg-white text-[#2F1B10]"
            />

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-medium text-[#3D2415]">Password</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password"
                  onPress={() => {
                    // TODO: Navigate to forgot password screen
                  }}
                >
                  <Text className="text-sm font-medium text-[#9A6B3A]">
                    Forgot password?
                  </Text>
                </Pressable>
              </View>

              <View
                className={`flex-row items-center rounded-2xl border bg-white px-4 ${
                  errors.password ? "border-red-500" : "border-[#E5D3C3]"
                }`}
              >
                <Input
                  ref={passwordInputRef}
                  id="password"
                  secureTextEntry={!isPasswordVisible}
                  autoComplete="password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Enter your password"
                  textContentType="password"
                  value={values.password}
                  onChangeText={(value) => setFieldValue("password", value)}
                  returnKeyType="send"
                  submitBehavior="submit"
                  onSubmitEditing={() => {
                    void submit();
                  }}
                  className="h-14 flex-1 border-0 bg-transparent px-0 pr-3 text-[#2F1B10] shadow-none"
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  className="rounded-full p-2 active:opacity-70"
                  onPress={() => {
                    setIsPasswordVisible((current) => !current);
                  }}
                >
                  {isPasswordVisible ? (
                    <EyeOff size={20} color="#7B6A59" strokeWidth={2.2} />
                  ) : (
                    <Eye size={20} color="#7B6A59" strokeWidth={2.2} />
                  )}
                </Pressable>
              </View>

              {errors.password ? (
                <Text variant="caption1" className="text-red-500">
                  {errors.password}
                </Text>
              ) : (
                <Text variant="caption1" className="text-[#8F7765]">
                  Password must be at least 6 characters.
                </Text>
              )}
            </View>

            {submissionError ? (
              <View className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <Text className="text-sm leading-6 text-red-600">
                  {submissionError}
                </Text>
              </View>
            ) : null}

            <Button
              size="lg"
              className="mt-2 h-14 rounded-[22px] bg-[#5A3421]"
              disabled={!canSubmit}
              onPress={() => {
                void submit();
              }}
            >
              <Text className="text-lg font-semibold text-white">
                {isSubmitting ? "Signing in..." : "Log in"}
              </Text>
            </Button>
          </View>
        </View>
      </AuthScreenShell>
    </View>
  );
}
