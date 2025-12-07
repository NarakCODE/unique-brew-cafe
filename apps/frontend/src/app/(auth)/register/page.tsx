"use client";

import Link from "next/link";
import { useState } from "react";

import { RegisterForm } from "@/components/forms/register-form";
import { OtpVerificationForm } from "@/components/forms/otp-verification-form";
import { GoogleButton } from "@/components/forms/google-button";
import { InitiateRegistrationInput } from "@/types/auth";

export default function RegisterV1() {
    const [step, setStep] = useState<"details" | "otp">("details");
    const [registrationData, setRegistrationData] =
        useState<InitiateRegistrationInput | null>(null);

    const handleRegistrationSuccess = (data: InitiateRegistrationInput) => {
        setRegistrationData(data);
        setStep("otp");
    };

    const handleBackToRegister = () => {
        setStep("details");
    };

    return (
        <div className="flex h-dvh">
            <div className="bg-background flex w-full items-center justify-center p-8 lg:w-2/3">
                <div className="w-full max-w-md space-y-10 py-24 lg:py-32">
                    {step === "details" ? (
                        <>
                            <div className="space-y-4 text-center">
                                <div className="font-medium tracking-tight">
                                    Register
                                </div>
                                <div className="text-muted-foreground mx-auto max-w-xl">
                                    Fill in your details below. We promise not
                                    to quiz you about your first pet&apos;s name
                                    (this time).
                                </div>
                            </div>
                            <div className="space-y-4">
                                <RegisterForm
                                    onSuccess={handleRegistrationSuccess}
                                />
                                <GoogleButton
                                    className="w-full"
                                    variant="outline"
                                />
                                <p className="text-muted-foreground text-center text-xs">
                                    Already have an account?{" "}
                                    <Link href="login" className="text-primary">
                                        Login
                                    </Link>
                                </p>
                            </div>
                        </>
                    ) : (
                        <OtpVerificationForm
                            email={registrationData?.email || ""}
                            registrationData={registrationData!}
                            onBack={handleBackToRegister}
                        />
                    )}
                </div>
            </div>

            <div
                className="hidden lg:block lg:w-1/3"
                style={{
                    backgroundImage:
                        "url('https://plus.unsplash.com/premium_vector-1723779116555-c361f9648ba4?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* <div className="flex h-full flex-col items-center justify-center p-12 text-center">
                    <div className="space-y-6">
                        <Command className="text-primary-foreground mx-auto size-12" />
                        <div className="space-y-2">
                            <h1 className="text-primary-foreground text-5xl font-light">
                                Welcome!
                            </h1>
                            <p className="text-primary-foreground/80 text-xl">
                                You&apos;re in the right place.
                            </p>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
