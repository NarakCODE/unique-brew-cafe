"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import {
  Upload,
  Loader2,
  ChevronDownIcon,
  Bell,
  Mail,
  Smartphone,
  Megaphone,
  ShoppingBag,
  Tag,
  Cpu,
  Globe,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import {
  useProfile,
  useUpdateProfileImage,
  useUpdateProfile,
} from "@/hooks/use-profile";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { format } from "date-fns";

// --- SCHEMA DEFINITIONS ---
// Defining these here based on your prompt, assuming email/phone logic
const emailSchema = z.string().email("Invalid email address");
const phoneSchema = z.string().min(9, "Phone number is too short");
const genderEnum = z.enum(["male", "female", "other"]);

const userPreferencesSchema = z.object({
  notificationsEnabled: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  language: z.enum(["en", "km"]).default("en"),
  currency: z.enum(["USD", "KHR"]).default("USD"),
  notifications: z
    .object({
      orderUpdates: z.boolean().default(true),
      promotions: z.boolean().default(true),
      announcements: z.boolean().default(true),
      systemNotifications: z.boolean().default(true),
    })
    .partial()
    .optional(),
});

// We extract the shape inside 'body' for the frontend form
const formSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name cannot be empty")
    .max(100, "Full name must be 100 characters or less")
    .optional(),
  email: emailSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  dateOfBirth: z.date().optional(), // Changed to z.date for DatePicker compatibility
  gender: genderEnum.optional(),
  preferences: userPreferencesSchema.partial().optional(),
});

type UserFormValues = z.infer<typeof formSchema>;

export default function UserSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [useDefaultIcon, setUseDefaultIcon] = useState(true);

  // Hooks
  const { user, isLoading } = useProfile();
  const { updateProfileImage, isLoading: isUploading } =
    useUpdateProfileImage();

  // NOTE: You'll need a hook to update general profile info
  const { updateProfile, isUpdating } = useUpdateProfile();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      gender: undefined,
      preferences: {
        language: "en",
        currency: "USD",
        notificationsEnabled: true,
        notifications: {
          orderUpdates: true,
          promotions: true,
          announcements: true,
          systemNotifications: true,
        },
      },
    },
  });

  // --- POPULATE FORM ---
  useEffect(() => {
    if (user) {
      if (user.profileImage) {
        setProfileImage(user.profileImage);
        setUseDefaultIcon(false);
      }

      form.reset({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        // Cast the string "male" to the specific union type
        gender: (user.gender ? user.gender.toLowerCase() : undefined) as
          | "male"
          | "female"
          | "other"
          | undefined,
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : undefined,

        preferences: {
          language: (user.preferences?.language || "en") as "en" | "km",

          currency: (user.preferences?.currency || "USD") as "USD" | "KHR",

          notificationsEnabled: user.preferences?.notificationsEnabled ?? true,
          emailNotifications: user.preferences?.emailNotifications ?? true,
          smsNotifications: user.preferences?.smsNotifications ?? true,
          pushNotifications: user.preferences?.pushNotifications ?? true,

          notifications: {
            orderUpdates: user.preferences?.notifications?.orderUpdates ?? true,
            promotions: user.preferences?.notifications?.promotions ?? true,
            announcements:
              user.preferences?.notifications?.announcements ?? true,
            systemNotifications:
              user.preferences?.notifications?.systemNotifications ?? true,
          },
        },
      });
    }
  }, [user, form]);

  function onSubmit(data: UserFormValues) {
    // Construct the payload matching the API requirement
    const payload = {
      fullName: data.fullName || "",
      email: data.email || "",
      phoneNumber: data.phoneNumber || "",
      gender: data.gender || "other",
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : "",

      preferences: {
        language: data.preferences?.language || "en",
        currency: data.preferences?.currency || "USD",
        notificationsEnabled: data.preferences?.notificationsEnabled ?? true,
        emailNotifications: data.preferences?.emailNotifications ?? true,
        smsNotifications: data.preferences?.smsNotifications ?? true,
        pushNotifications: data.preferences?.pushNotifications ?? true,

        notifications: {
          orderUpdates: data.preferences?.notifications?.orderUpdates ?? true,
          promotions: data.preferences?.notifications?.promotions ?? true,
          announcements: data.preferences?.notifications?.announcements ?? true,
          systemNotifications:
            data.preferences?.notifications?.systemNotifications ?? true,
        },
      },
    };

    updateProfile(payload, {
      onSuccess: () => {
        // Optional: Any specific actions on success besides the hook's toast
        console.log("Profile updated successfully");
      },
    });
  }

  // --- IMAGE HANDLERS ---
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setUseDefaultIcon(false);
      };
      reader.readAsDataURL(file);

      updateProfileImage(file, {
        onSuccess: (data) => {
          toast.success("Profile image updated successfully");
          if (data.data.profileImage) {
            setProfileImage(data.data.profileImage);
          }
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update profile image");
        },
      });
    }
  };

  const handleResetImage = () => {
    setProfileImage(null);
    setUseDefaultIcon(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      <PageHeader
        title="Profile Settings"
        description="Update your profile information and preferences."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* 1. Identity Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>
                Update your personal identification information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {useDefaultIcon ? (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                    <Logo size={40} />
                  </div>
                ) : (
                  <Avatar className="h-24 w-24 border-2 border-border">
                    <AvatarImage
                      src={profileImage || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback>User</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col gap-2 items-center sm:items-start">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={handleFileUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Change Photo
                    </Button>
                    {!useDefaultIcon && (
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={handleResetImage}
                        className="text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center sm:text-left">
                    Allowed JPG, GIF or PNG. Max size 800KB.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/gif,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <Separator />

              {/* Personal Info Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
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
                        value={field.value}
                        // 1. ADD THIS KEY PROP
                        // This forces the component to re-render when the value changes
                        key={field.value || "gender-empty"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {/* 2. Ensure SelectValue has no children */}
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Ensure these values match your API data exactly (lowercase) */}
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input placeholder="email@example.com" {...field} />
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
                        <Input placeholder="012 345 678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-between font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {/* Check if field.value exists before formatting */}
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <ChevronDownIcon className="h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            captionLayout="dropdown" // Allows jumping between years
                            fromYear={1900} // Safer alternative to startMonth
                            toYear={new Date().getFullYear()} // Limits calendar to current year
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 2. Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences & Region</CardTitle>
              <CardDescription>
                Manage your language and currency settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="preferences.language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="km">Khmer (ខ្មែរ)</SelectItem>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="KHR">KHR (៛)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 3. Notifications Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Manage how and when we communicate with you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* SECTION 1: CHANNELS */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Communication Channels
                </h3>
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="preferences.emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email</FormLabel>
                            <FormDescription>
                              Receive daily summaries and invoices.
                            </FormDescription>
                          </div>
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                          <Smartphone className="h-5 w-5 text-muted-foreground" />
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Push Notifications
                            </FormLabel>
                            <FormDescription>
                              Real-time alerts on your mobile device.
                            </FormDescription>
                          </div>
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

              <Separator />

              {/* SECTION 2: TOPICS / TYPES */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4" /> Notification Topics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Updates */}
                  <FormField
                    control={form.control}
                    name="preferences.notifications.orderUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">
                              Order Updates
                            </FormLabel>
                            <FormDescription>
                              Status changes for your orders.
                            </FormDescription>
                          </div>
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

                  {/* Promotions */}
                  <FormField
                    control={form.control}
                    name="preferences.notifications.promotions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                          <Tag className="h-5 w-5 text-muted-foreground" />
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">
                              Promotions
                            </FormLabel>
                            <FormDescription>
                              Discounts and special offers.
                            </FormDescription>
                          </div>
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

                  {/* System */}
                  <FormField
                    control={form.control}
                    name="preferences.notifications.systemNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                          <Cpu className="h-5 w-5 text-muted-foreground" />
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">
                              System Alerts
                            </FormLabel>
                            <FormDescription>
                              Security and maintenance updates.
                            </FormDescription>
                          </div>
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

                  {/* Announcements */}
                  <FormField
                    control={form.control}
                    name="preferences.notifications.announcements"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                          <Megaphone className="h-5 w-5 text-muted-foreground" />
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">
                              Announcements
                            </FormLabel>
                            <FormDescription>
                              New features and platform news.
                            </FormDescription>
                          </div>
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
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 sticky bottom-6 bg-background p-4 border-t rounded-t-xl z-10 md:static md:bg-transparent md:border-none md:p-0">
            <Button
              variant="outline"
              type="button"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
