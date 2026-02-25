"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import {
  useForgotPassword,
  useResetPassword,
  useVerifyOtpRequest,
} from "@/hooks/use-forgot-password";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter, Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const OTP_LENGTH = 6;

export function ForgotPasswordForm2({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const t = useTranslations("Auth");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutate: forgotPassword, isPending: isForgotPending } =
    useForgotPassword();
  const { mutate: verifyOtp, isPending: isVerifyPending } =
    useVerifyOtpRequest();
  const { mutate: resetPassword, isPending: isResetPending } =
    useResetPassword();

  const isPending = isForgotPending || isVerifyPending || isResetPending;

  const submitOtpVerification = (code: string) => {
    verifyOtp(
      { email, otpCode: code },
      {
        onSuccess: () => {
          toast.success(t("otpVerifiedSuccess"));
          setStep(3);
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || t("invalidOtp"));
        },
      },
    );
  };

  const handleOtpChange = (value: string) => {
    setOtpCode(value);

    if (
      step === 2 &&
      value.length === OTP_LENGTH &&
      !isVerifyPending &&
      email.trim()
    ) {
      submitOtpVerification(value);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step === 1) {
      forgotPassword(
        { email },
        {
          onSuccess: (response) => {
            toast.success(response.message);
            setStep(2);
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || t("somethingWentWrong"),
            );
          },
        },
      );
    } else if (step === 2) {
      submitOtpVerification(otpCode);
    } else if (step === 3) {
      if (newPassword !== confirmPassword) {
        toast.error(t("validation.passwordMismatch"));
        return;
      }
      resetPassword(
        { email, otpCode, newPassword },
        {
          onSuccess: (response) => {
            toast.success(response.message);
            router.push("/sign-in");
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || t("somethingWentWrong"),
            );
          },
        },
      );
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {step === 1 && t("forgotPassword")}
          {step === 2 && t("enterOtpTitle")}
          {step === 3 && t("resetPasswordTitle")}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {step === 1 && t("forgotPasswordSubtitle")}
          {step === 2 && t("enterOtpSubtitle")}
          {step === 3 && t("resetPasswordSubtitle")}
        </p>
      </div>
      <div className="grid gap-6">
        {step === 1 && (
          <div className="grid gap-3">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3">
            <Label htmlFor="otp">{t("otpLabel")}</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={OTP_LENGTH}
                value={otpCode}
                onChange={handleOtpChange}
                disabled={isPending}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            <div className="grid gap-3">
              <Label htmlFor="newPassword">{t("newPasswordLabel")}</Label>
              <PasswordInput
                id="newPassword"
                placeholder={t("newPasswordPlaceholder")}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder={t("confirmPasswordPlaceholder")}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isPending}
              />
            </div>
          </>
        )}

        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {step === 1 && t("sendResetLinkButton")}
          {step === 2 && t("verifyOtpButton")}
          {step === 3 && t("resetPasswordButton")}
        </Button>
      </div>
      <div className="text-center text-sm">
        {t("rememberPassword")}{" "}
        <Link href="/sign-in" className="underline underline-offset-4">
          {t("backToSignIn")}
        </Link>
      </div>
    </form>
  );
}
