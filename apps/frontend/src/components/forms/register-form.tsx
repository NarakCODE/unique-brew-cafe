"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { useInitiateRegistration } from "@/hooks/use-auth";
import { InitiateRegistrationInput } from "@/types/auth";

const FormSchema = z
    .object({
        fullName: z.string().min(1, { message: "Full name is required." }),
        email: z
            .string()
            .email({ message: "Please enter a valid email address." }),
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters." }),
        confirmPassword: z.string().min(6, {
            message: "Confirm Password must be at least 6 characters.",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

interface RegisterFormProps {
    onSuccess: (data: InitiateRegistrationInput) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
    const initiateRegistration = useInitiateRegistration();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        initiateRegistration.mutate(
            {
                fullName: data.fullName,
                email: data.email,
                password: data.password,
            },
            {
                onSuccess: () => {
                    toast.success("Registration initiated", {
                        description:
                            "Please check your email for the verification code.",
                    });
                    onSuccess({
                        fullName: data.fullName,
                        email: data.email,
                        password: data.password,
                    });
                },
                onError: (error) => {
                    toast.error("Registration failed", {
                        description: error.message,
                    });
                },
            }
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    autoComplete="name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    className="w-full"
                    type="submit"
                    disabled={initiateRegistration.isPending}
                >
                    {initiateRegistration.isPending && (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Register
                </Button>
            </form>
        </Form>
    );
}
