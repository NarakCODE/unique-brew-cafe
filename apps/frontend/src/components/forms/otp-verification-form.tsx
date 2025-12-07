"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useVerifyRegistration, useResendVerification } from "@/hooks/use-auth";
import { toast } from "sonner";
import { VerifyRegistrationInput } from "@/types/auth";

const FormSchema = z.object({
    otpCode: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
});

interface OtpVerificationFormProps {
    email: string;
    registrationData: Omit<VerifyRegistrationInput, "otpCode">;
    onBack: () => void;
}

export function OtpVerificationForm({
    email,
    registrationData,
    onBack,
}: OtpVerificationFormProps) {
    const verifyRegistration = useVerifyRegistration();
    const resendVerification = useResendVerification();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            otpCode: "",
        },
    });

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        verifyRegistration.mutate(
            {
                ...registrationData,
                otpCode: data.otpCode,
            },
            {
                onError: (error) => {
                    toast.error("Verification failed", {
                        description: error.message,
                    });
                },
            }
        );
    };

    const handleResend = () => {
        resendVerification.mutate(
            { email, type: "registration" },
            {
                onSuccess: () => {
                    toast.success("OTP resent", {
                        description:
                            "Please check your email for the new code.",
                    });
                },
                onError: (error) => {
                    toast.error("Failed to resend OTP", {
                        description: error.message,
                    });
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Verify your email
                </h1>
                <p className="text-muted-foreground text-sm">
                    We sent a verification code to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                    . Enter the code below to complete your registration.
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <FormField
                        control={form.control}
                        name="otpCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">
                                    One-Time Password
                                </FormLabel>
                                <FormControl>
                                    <div className="flex justify-center">
                                        <InputOTP maxLength={6} {...field}>
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
                                </FormControl>
                                <FormMessage className="text-center" />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col gap-2">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={verifyRegistration.isPending}
                        >
                            {verifyRegistration.isPending && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Verify Account
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={onBack}
                            disabled={verifyRegistration.isPending}
                        >
                            Back to Registration
                        </Button>
                    </div>
                </form>
            </Form>

            <div className="text-center text-sm">
                Didn&apos;t receive the code?{" "}
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendVerification.isPending}
                    className="text-primary hover:underline disabled:opacity-50"
                >
                    {resendVerification.isPending ? "Resending..." : "Resend"}
                </button>
            </div>
        </div>
    );
}
