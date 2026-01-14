"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useRouter } from "next/navigation";

export function ForgotPasswordForm2({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
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
              error.response?.data?.message || "Something went wrong"
            );
          },
        }
      );
    } else if (step === 2) {
      verifyOtp(
        { email, otpCode },
        {
          onSuccess: (response) => {
            toast.success("OTP Verified Successfully");
            setStep(3);
          },
          onError: (error) => {
            toast.error(error.response?.data?.message || "Invalid OTP");
          },
        }
      );
    } else if (step === 3) {
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      resetPassword(
        { email, otpCode, newPassword },
        {
          onSuccess: (response) => {
            toast.success(response.message);
            router.push("/sign-in-2");
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || "Something went wrong"
            );
          },
        }
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
          {step === 1 && "Forgot your password?"}
          {step === 2 && "Enter OTP"}
          {step === 3 && "Reset Password"}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {step === 1 &&
            "Enter your email address and we'll send you a link to reset your password"}
          {step === 2 && "Enter the 6-digit code sent to your email."}
          {step === 3 && "Enter your new password."}
        </p>
      </div>
      <div className="grid gap-6">
        {step === 1 && (
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3">
            <Label htmlFor="otp">OTP Code</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={(value) => setOtpCode(value)}
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
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="New Password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
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
          {step === 1 && "Send Reset Link"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Reset Password"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Remember your password?{" "}
        <a href="/sign-in-2" className="underline underline-offset-4">
          Back to sign in
        </a>
      </div>
    </form>
  );
}
