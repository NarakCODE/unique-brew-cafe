"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { UpdateProfileSettingsRequest } from "@/types/profile";

const notificationsFormSchema = z.object({
  notificationsEnabled: z.boolean(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  notifications: z.object({
    orderUpdates: z.boolean(),
    promotions: z.boolean(),
    announcements: z.boolean(),
    systemNotifications: z.boolean(),
  }),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export default function NotificationSettings() {
  const { user, isLoading } = useProfile();
  const { updateProfile, isUpdating } = useUpdateProfile();

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
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
  });

  useEffect(() => {
    if (user && user.preferences) {
      form.reset({
        notificationsEnabled: user.preferences.notificationsEnabled ?? true,
        emailNotifications: user.preferences.emailNotifications ?? true,
        smsNotifications: user.preferences.smsNotifications ?? true,
        pushNotifications: user.preferences.pushNotifications ?? true,
        notifications: {
          orderUpdates: user.preferences.notifications?.orderUpdates ?? true,
          promotions: user.preferences.notifications?.promotions ?? true,
          announcements: user.preferences.notifications?.announcements ?? true,
          systemNotifications:
            user.preferences.notifications?.systemNotifications ?? true,
        },
      });
    }
  }, [user, form]);

  function onSubmit(data: NotificationsFormValues) {
    if (!user) return;

    // We construct the full update object by merging existing profile data with new preferences.
    // This ensures we satisfy the API requirement for a complete profile object while only updating the preferences.

    const request: UpdateProfileSettingsRequest = {
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      preferences: {
        language: user.preferences?.language || "en",
        currency: user.preferences?.currency || "USD",
        ...data,
      },
    };

    updateProfile(request);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <PageHeader
        title="Notifications"
        description="Configure how you receive notifications."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>
                Turn notifications on or off completely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notificationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable Notifications
                      </FormLabel>
                      <FormDescription>
                        Receive notifications from the application.
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Channels</CardTitle>
              <CardDescription>
                Choose how you want to be notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email</FormLabel>
                      <FormDescription>
                        Receive updates via email.
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
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Push Notifications
                      </FormLabel>
                      <FormDescription>
                        Receive mobile and browser push notifications.
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
                name="smsNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">SMS</FormLabel>
                      <FormDescription>
                        Receive important alerts via SMS.
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>
                Select which types of notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notifications.orderUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Order Updates</FormLabel>
                      <FormDescription>
                        Get notified about your order status (confirmed,
                        shipping, delivered).
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notifications.promotions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Promotions</FormLabel>
                      <FormDescription>
                        Receive emails about new products, features, and
                        marketing promotions.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notifications.announcements"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Announcements</FormLabel>
                      <FormDescription>
                        Important announcements about the platform and service.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notifications.systemNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>System Notifications</FormLabel>
                      <FormDescription>
                        Security alerts, maintenance, and other system-related
                        updates.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
