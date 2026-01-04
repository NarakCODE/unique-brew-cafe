"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

// --- IMPORT YOUR TYPES & HOOKS HERE ---
import { useUpdateProfile } from "@/hooks/use-profile";
import {
    updateProfileSchema,
    type UpdateProfileSchemaType,
} from "@/schemas/profile-schema";
import type { User } from "@/types";

// We extract just the body shape for the form validation
const formSchema = updateProfileSchema.shape.body;

interface ProfileInfoFormProps {
    user: User;
}

export function ProfileInfoForm({ user }: ProfileInfoFormProps) {
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

    console.log("User profile in form ----------->>>>", user);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phoneNumber: "",
            preferences: {
                language: "en",
                currency: "USD",
                notificationsEnabled: true,
                emailNotifications: true,
                smsNotifications: true,
                pushNotifications: true,
                notifications: {
                    orderUpdates: true,
                    promotions: true,
                    announcements: true,
                    systemNotifications: true,
                },
            },
        },
        values: user
            ? {
                  fullName: user.fullName,
                  email: user.email,
                  phoneNumber: user.phoneNumber || "",
                  gender: user.gender
                      ? (user.gender.toLowerCase() as
                            | "male"
                            | "female"
                            | "other")
                      : undefined,
                  dateOfBirth: user.dateOfBirth
                      ? new Date(user.dateOfBirth)
                      : undefined,
                  preferences: {
                      language: user.preferences?.language as "en" | "km",
                      currency: user.preferences?.currency as "USD" | "KHR",
                      notificationsEnabled:
                          user.preferences?.notificationsEnabled,
                      emailNotifications: user.preferences?.emailNotifications,
                      smsNotifications: user.preferences?.smsNotifications,
                      pushNotifications: user.preferences?.pushNotifications,
                      notifications: {
                          orderUpdates:
                              user.preferences?.notifications?.orderUpdates,
                          promotions:
                              user.preferences?.notifications?.promotions,
                          announcements:
                              user.preferences?.notifications?.announcements,
                          systemNotifications:
                              user.preferences?.notifications
                                  ?.systemNotifications,
                      },
                  },
              }
            : undefined,
    });

    function onSubmit(data: UpdateProfileSchemaType) {
        updateProfile(data, {
            onSuccess: () => {
                toast.success("Profile updated", {
                    description: "Your changes have been saved successfully.",
                });
            },
            onError: (error) => {
                toast.error("Error", {
                    description: error.message || "Failed to update profile.",
                });
            },
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
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
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="john@example.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="+1234567890"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="male">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="female">
                                            Female
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date of birth</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(
                                                        field.value as Date,
                                                        "PPP"
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            // FIX 2: Explicitly cast the value to satisfy the component prop
                                            selected={
                                                field.value as Date | undefined
                                            }
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() ||
                                                date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* --- Preferences Section --- */}
                <div className="pt-6">
                    <h3 className="text-lg font-medium">Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your app settings.
                    </p>
                </div>
                <Separator />

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="preferences.language"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Language</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="en">
                                                English
                                            </SelectItem>
                                            <SelectItem value="km">
                                                Khmer
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="preferences.currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Currency</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="USD">
                                                USD ($)
                                            </SelectItem>
                                            <SelectItem value="KHR">
                                                KHR (៛)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-4 border rounded-lg p-4 mt-4 bg-muted/20">
                        <h4 className="font-medium text-sm">
                            General Notifications
                        </h4>
                        <FormField
                            control={form.control}
                            name="preferences.notificationsEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 shadow-sm bg-background border">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Enable All Notifications
                                        </FormLabel>
                                        <FormDescription>
                                            Master switch to toggle all
                                            notifications.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="preferences.emailNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 shadow-sm bg-background border">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Email Notifications
                                        </FormLabel>
                                        <FormDescription>
                                            Receive notifications via email.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="preferences.smsNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 shadow-sm bg-background border">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            SMS Notifications
                                        </FormLabel>
                                        <FormDescription>
                                            Receive notifications via SMS.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="preferences.pushNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 shadow-sm bg-background border">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Push Notifications
                                        </FormLabel>
                                        <FormDescription>
                                            Receive push notifications on your
                                            device.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-4 border rounded-lg p-4 mt-4 bg-muted/20">
                        <h4 className="font-medium text-sm">
                            Detailed Settings
                        </h4>
                        <FormField
                            control={form.control}
                            name="preferences.notifications.orderUpdates"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 shadow-sm bg-background border">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Order Updates
                                        </FormLabel>
                                        <FormDescription>
                                            Get notified about your order
                                            status.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="preferences.notifications.promotions"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 shadow-sm bg-background border">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Promotions
                                        </FormLabel>
                                        <FormDescription>
                                            Receive news about promotions and
                                            sales.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="preferences.notifications.announcements"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 shadow-sm bg-background border">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Announcements
                                        </FormLabel>
                                        <FormDescription>
                                            Receive important announcements.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="preferences.notifications.systemNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 shadow-sm bg-background border">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            System Notifications
                                        </FormLabel>
                                        <FormDescription>
                                            Receive system-related alerts.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" disabled={isUpdating}>
                    {isUpdating && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Profile
                </Button>
            </form>
        </Form>
    );
}
