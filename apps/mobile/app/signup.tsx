import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

import type {
  InitiateRegistrationInput,
  ResendOtpInput,
  VerifyRegistrationInput,
} from "../../../packages/api/src";
import { createAuthApi } from "../../../packages/api/src";

import { AuthFormField } from "@/components/auth/auth-form-field";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { getErrorMessage } from "@/lib/api-errors";
import { mobileApiClient } from "@/lib/mobile-api-client";
import { useAuth } from "@/providers/auth-provider";

const authApi = createAuthApi(mobileApiClient);
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

type SignupValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  otpCode: string;
};

type SignupErrors = Partial<Record<keyof SignupValues, string>>;

function validateSignupDetails(values: SignupValues) {
  const errors: SignupErrors = {};
  const normalizedEmail = values.email.trim().toLowerCase();

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!normalizedEmail) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function validateOtpCode(value: string) {
  if (!value.trim()) {
    return "OTP code is required.";
  }

  if (!/^\d{6}$/.test(value.trim())) {
    return "OTP code must be 6 digits.";
  }

  return undefined;
}

export default function SignupScreen() {
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const router = useRouter();
  const otpInputRef = React.useRef<TextInput>(null);
  const [step, setStep] = React.useState<"details" | "otp">("details");
  const [values, setValues] = React.useState<SignupValues>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    otpCode: "",
  });
  const [errors, setErrors] = React.useState<SignupErrors>({});
  const [submissionError, setSubmissionError] = React.useState<string | null>(
    null,
  );
  const [otpExpiresAt, setOtpExpiresAt] = React.useState<string | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = React.useState<number>(0);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    React.useState(false);
  const [secondsUntilResend, setSecondsUntilResend] = React.useState(0);

  const initiateRegistrationMutation = useMutation({
    mutationFn: async (payload: InitiateRegistrationInput) => {
      return authApi.initiateRegistration(payload);
    },
    onSuccess: (response) => {
      setOtpExpiresAt(response.data.otpExpiresAt);
      setResendAvailableAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
      setStep("otp");
      setSubmissionError(null);
      setErrors((currentErrors) => ({
        ...currentErrors,
        otpCode: undefined,
      }));
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 50);
    },
    onError: (error) => {
      setSubmissionError(
        getErrorMessage(error, "Unable to send the verification code."),
      );
    },
  });

  const verifyRegistrationMutation = useMutation({
    mutationFn: async (payload: VerifyRegistrationInput) => {
      return authApi.verifyRegistration(payload);
    },
    onSuccess: async (response) => {
      await signIn(response);
    },
    onError: (error) => {
      setSubmissionError(
        getErrorMessage(error, "Unable to verify the code right now."),
      );
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async (payload: ResendOtpInput) => {
      return authApi.resendOtp(payload);
    },
    onSuccess: (response) => {
      setOtpExpiresAt(response.data.otpExpiresAt);
      setResendAvailableAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
      setSubmissionError(null);
    },
    onError: (error) => {
      setSubmissionError(
        getErrorMessage(error, "Unable to resend the verification code."),
      );
    },
  });

  React.useEffect(() => {
    if (resendAvailableAt <= Date.now()) {
      setSecondsUntilResend(0);
      return;
    }

    const timer = setInterval(() => {
      const secondsRemaining = Math.max(
        0,
        Math.ceil((resendAvailableAt - Date.now()) / 1000),
      );

      setSecondsUntilResend(secondsRemaining);

      if (secondsRemaining === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [resendAvailableAt]);

  function setFieldValue(field: keyof SignupValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: undefined,
      };
    });

    if (submissionError) {
      setSubmissionError(null);
    }
  }

  async function submitDetails() {
    const nextErrors = validateSignupDetails(values);

    if (
      nextErrors.fullName ||
      nextErrors.email ||
      nextErrors.password ||
      nextErrors.confirmPassword
    ) {
      setErrors(nextErrors);
      return;
    }

    const payload: InitiateRegistrationInput = {
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
    };

    await initiateRegistrationMutation.mutateAsync(payload);
  }

  async function submitOtpVerification() {
    const otpError = validateOtpCode(values.otpCode);

    if (otpError) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        otpCode: otpError,
      }));
      return;
    }

    const payload: VerifyRegistrationInput = {
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      otpCode: values.otpCode.trim(),
    };

    await verifyRegistrationMutation.mutateAsync(payload);
  }

  async function handleResendOtp() {
    if (secondsUntilResend > 0 || resendOtpMutation.isPending) {
      return;
    }

    await resendOtpMutation.mutateAsync({
      email: values.email.trim().toLowerCase(),
      verificationType: "registration",
    });
  }

  function goBackToDetailsStep() {
    setStep("details");
    setSubmissionError(null);
  }

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const isBusy =
    initiateRegistrationMutation.isPending ||
    verifyRegistrationMutation.isPending ||
    resendOtpMutation.isPending;
  const otpExpiryLabel = formatOtpExpiry(otpExpiresAt);

  return (
    <View className="flex-1 bg-[#FBF6EF]">
      <AuthScreenShell
        title={step === "details" ? "Create your account" : "Verify your email"}
        subtitle={
          step === "details"
            ? "Start building your coffee routine. Enter your details below to set up your Unique Brew account."
            : `We sent a 6-digit code to ${values.email.trim().toLowerCase() || "your email"}. Enter it to complete your registration.`
        }
        footer={
          <View className="items-center gap-3">
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
        <View className="gap-5">
          {step === "otp" ? <StepIndicator currentStep={step} /> : null}

          {step === "details" ? (
            <View className="gap-5">
              <AuthFormField
                autoCapitalize="words"
                autoComplete="name"
                placeholder="Full name"
                textContentType="name"
                label="Full name"
                value={values.fullName}
                error={errors.fullName}
                onChangeText={(value) => setFieldValue("fullName", value)}
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
                value={values.email}
                error={errors.email}
                onChangeText={(value) => setFieldValue("email", value)}
                className="border border-[#E5D3C3] bg-white text-[#2F1B10]"
              />

              <PasswordField
                label="Password"
                placeholder="Create a password"
                helperText="Passwords must be at least 6 characters."
                value={values.password}
                error={errors.password}
                isVisible={isPasswordVisible}
                onChangeText={(value) => setFieldValue("password", value)}
                onToggleVisibility={() => {
                  setIsPasswordVisible((current) => !current);
                }}
              />

              <PasswordField
                label="Confirm password"
                placeholder="Confirm your password"
                value={values.confirmPassword}
                error={errors.confirmPassword}
                isVisible={isConfirmPasswordVisible}
                onChangeText={(value) =>
                  setFieldValue("confirmPassword", value)
                }
                onToggleVisibility={() => {
                  setIsConfirmPasswordVisible((current) => !current);
                }}
              />

              {submissionError ? (
                <ErrorPanel message={submissionError} />
              ) : null}

              <Button
                size="lg"
                className="mt-2 h-14 rounded-[22px] bg-[#5A3421]"
                disabled={isBusy}
                onPress={() => {
                  void submitDetails();
                }}
              >
                <Text className="text-lg font-semibold text-white">
                  {initiateRegistrationMutation.isPending
                    ? "Sending code..."
                    : "Send verification code"}
                </Text>
              </Button>
            </View>
          ) : (
            <View className="gap-5">
              <View className="gap-2">
                <Label className="text-[#3D2415]">Verification code</Label>

                <Input
                  ref={otpInputRef}
                  value={values.otpCode}
                  onChangeText={(value) => {
                    const numericValue = value.replace(/\D/g, "").slice(0, 6);
                    setFieldValue("otpCode", numericValue);
                  }}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  placeholder="123456"
                  maxLength={OTP_LENGTH}
                  className="h-16 rounded-2xl border border-[#E5D3C3] bg-white px-4 text-center text-2xl tracking-[10px] text-[#2F1B10]"
                />

                {errors.otpCode ? (
                  <Text variant="caption1" className="text-red-500">
                    {errors.otpCode}
                  </Text>
                ) : (
                  <Text variant="caption1" className="text-[#8F7765]">
                    {otpExpiryLabel
                      ? `Enter the 6-digit code we emailed you. It expires at ${otpExpiryLabel}.`
                      : "Enter the 6-digit code we emailed you."}
                  </Text>
                )}
              </View>

              {submissionError ? (
                <ErrorPanel message={submissionError} />
              ) : null}

              <Button
                size="lg"
                className="h-14 rounded-[22px] bg-[#5A3421]"
                disabled={isBusy}
                onPress={() => {
                  void submitOtpVerification();
                }}
              >
                <Text className="text-lg font-semibold text-white">
                  {verifyRegistrationMutation.isPending
                    ? "Verifying..."
                    : "Complete registration"}
                </Text>
              </Button>

              <View className="flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 flex-1 rounded-[18px] border-[#D8C2AE] bg-transparent"
                  disabled={isBusy}
                  onPress={goBackToDetailsStep}
                >
                  <Text className="font-semibold text-[#5B341E]">Back</Text>
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="h-12 flex-1 rounded-[18px] bg-[#E9D8C6]"
                  disabled={secondsUntilResend > 0 || isBusy}
                  onPress={() => {
                    void handleResendOtp();
                  }}
                >
                  <Text className="font-semibold text-[#5B341E]">
                    {secondsUntilResend > 0
                      ? `Resend in ${secondsUntilResend}s`
                      : resendOtpMutation.isPending
                        ? "Resending..."
                        : "Resend code"}
                  </Text>
                </Button>
              </View>
            </View>
          )}
        </View>
      </AuthScreenShell>
    </View>
  );
}

function PasswordField({
  label,
  placeholder,
  helperText,
  value,
  error,
  isVisible,
  onChangeText,
  onToggleVisibility,
}: {
  label: string;
  placeholder: string;
  helperText?: string;
  value: string;
  error?: string;
  isVisible: boolean;
  onChangeText: (value: string) => void;
  onToggleVisibility: () => void;
}) {
  return (
    <View className="gap-2">
      <Label className="text-[#3D2415]">{label}</Label>
      <View
        className={`flex-row items-center rounded-2xl border bg-white px-4 ${
          error ? "border-red-500" : "border-[#E5D3C3]"
        }`}
      >
        <Input
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          className="h-14 flex-1 border-0 bg-transparent px-0 pr-3 text-[#2F1B10] shadow-none"
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isVisible ? "Hide password" : "Show password"}
          className="rounded-full p-2 active:opacity-70"
          onPress={onToggleVisibility}
        >
          {isVisible ? (
            <EyeOff size={20} color="#7B6A59" strokeWidth={2.2} />
          ) : (
            <Eye size={20} color="#7B6A59" strokeWidth={2.2} />
          )}
        </Pressable>
      </View>

      {error ? (
        <Text variant="caption1" className="text-red-500">
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption1" className="text-[#8F7765]">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

function StepIndicator({ currentStep }: { currentStep: "details" | "otp" }) {
  const isOtpStep = currentStep === "otp";

  return (
    <View className="flex-row items-center gap-3">
      <StepPill
        index={1}
        label="Details"
        isActive={!isOtpStep}
        isDone={isOtpStep}
      />
      <View className="h-px flex-1 bg-[#D8C2AE]" />
      <StepPill index={2} label="Verify" isActive={isOtpStep} />
    </View>
  );
}

function StepPill({
  index,
  label,
  isActive,
  isDone = false,
}: {
  index: number;
  label: string;
  isActive: boolean;
  isDone?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className={`size-7 items-center justify-center rounded-full ${
          isActive || isDone ? "bg-[#5A3421]" : "bg-[#E7D7C9]"
        }`}
      >
        <Text
          className={`text-sm font-semibold ${isActive || isDone ? "text-white" : "text-[#7F6A58]"}`}
        >
          {index}
        </Text>
      </View>
      <Text
        variant="footnote"
        className={`font-semibold ${
          isActive || isDone ? "text-[#5A3421]" : "text-[#8F7765]"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <View className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
      <Text className="text-sm leading-6 text-red-600">{message}</Text>
    </View>
  );
}

function formatOtpExpiry(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
