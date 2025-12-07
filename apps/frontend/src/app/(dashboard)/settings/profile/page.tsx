"use client";

import { useState } from "react";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    Settings,
    Gift,
    Camera,
    Save,
    Lock,
    Bell,
    Globe,
    DollarSign,
    Award,
    TrendingUp,
    Clock,
} from "lucide-react";
import {
    useProfile,
    useUpdateProfile,
    useUpdateSettings,
    useReferralStats,
} from "@/hooks/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type {
    UserProfile,
    UpdateProfileData,
    UpdateSettingsData,
} from "@/types/profile";

// ============================================================================
// LOADING SKELETON
// ============================================================================

function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="flex-1 space-y-2 text-center sm:text-left">
                            <Skeleton className="mx-auto h-8 w-48 sm:mx-0" />
                            <Skeleton className="mx-auto h-4 w-32 sm:mx-0" />
                            <div className="flex justify-center gap-2 sm:justify-start">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <Skeleton className="mx-auto h-8 w-20" />
                            <Skeleton className="mx-auto mt-2 h-4 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs Skeleton */}
            <Card>
                <CardContent className="pt-6">
                    <Skeleton className="h-10 w-full max-w-md" />
                    <div className="mt-6 space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    gradient: string;
}

function StatCard({ icon, label, value, gradient }: StatCardProps) {
    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
            <div
                className={`absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10 ${gradient}`}
            />
            <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${gradient} text-white shadow-lg`}
                    >
                        {icon}
                    </div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// PROFILE INFO TAB
// ============================================================================

interface ProfileInfoTabProps {
    profile: UserProfile;
    onUpdate: (data: UpdateProfileData) => void;
    isUpdating: boolean;
}

function ProfileInfoTab({
    profile,
    onUpdate,
    isUpdating,
}: ProfileInfoTabProps) {
    const [formData, setFormData] = useState<UpdateProfileData>({
        fullName: profile.fullName,
        email: profile.email,
        phoneNumber: profile.phoneNumber ?? "",
        dateOfBirth: profile.dateOfBirth?.split("T")[0] ?? "",
        gender: profile.gender,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="fullName"
                            placeholder="Enter your full name"
                            className="pl-10"
                            value={formData.fullName}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    fullName: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1234567890"
                            className="pl-10"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    phoneNumber: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="dateOfBirth"
                            type="date"
                            className="pl-10"
                            value={formData.dateOfBirth}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    dateOfBirth: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label>Gender</Label>
                    <div className="flex flex-wrap gap-4">
                        {(["male", "female", "other"] as const).map(
                            (gender) => (
                                <label
                                    key={gender}
                                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
                                        formData.gender === gender
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="gender"
                                        value={gender}
                                        checked={formData.gender === gender}
                                        onChange={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                gender,
                                            }))
                                        }
                                        className="sr-only"
                                    />
                                    <span className="capitalize">{gender}</span>
                                </label>
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                        <>
                            <span className="mr-2 h-4 w-4 animate-spin">
                                ⏳
                            </span>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}

// ============================================================================
// SETTINGS TAB
// ============================================================================

interface SettingsTabProps {
    profile: UserProfile;
    onUpdate: (data: UpdateSettingsData) => void;
    isUpdating: boolean;
}

function SettingsTab({ profile, onUpdate, isUpdating }: SettingsTabProps) {
    const [settings, setSettings] = useState<UpdateSettingsData>({
        notificationsEnabled: profile.preferences.notificationsEnabled,
        emailNotifications: profile.preferences.emailNotifications,
        smsNotifications: profile.preferences.smsNotifications,
        pushNotifications: profile.preferences.pushNotifications,
        language: profile.preferences.language,
        currency: profile.preferences.currency,
    });

    const handleToggle = (
        key: keyof UpdateSettingsData,
        value: boolean | string
    ) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        onUpdate({ [key]: value });
    };

    return (
        <div className="space-y-6">
            {/* Notification Settings */}
            <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                </h3>
                <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="notificationsEnabled">
                                Enable Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Master toggle for all notifications
                            </p>
                        </div>
                        <Switch
                            id="notificationsEnabled"
                            checked={settings.notificationsEnabled}
                            onCheckedChange={(checked) =>
                                handleToggle("notificationsEnabled", checked)
                            }
                            disabled={isUpdating}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="emailNotifications">
                                Email Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications via email
                            </p>
                        </div>
                        <Switch
                            id="emailNotifications"
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) =>
                                handleToggle("emailNotifications", checked)
                            }
                            disabled={
                                isUpdating || !settings.notificationsEnabled
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="smsNotifications">
                                SMS Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications via SMS
                            </p>
                        </div>
                        <Switch
                            id="smsNotifications"
                            checked={settings.smsNotifications}
                            onCheckedChange={(checked) =>
                                handleToggle("smsNotifications", checked)
                            }
                            disabled={
                                isUpdating || !settings.notificationsEnabled
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="pushNotifications">
                                Push Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Receive push notifications
                            </p>
                        </div>
                        <Switch
                            id="pushNotifications"
                            checked={settings.pushNotifications}
                            onCheckedChange={(checked) =>
                                handleToggle("pushNotifications", checked)
                            }
                            disabled={
                                isUpdating || !settings.notificationsEnabled
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Locale Settings */}
            <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Globe className="h-5 w-5" />
                    Locale Settings
                </h3>
                <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <select
                            id="language"
                            value={settings.language}
                            onChange={(e) =>
                                handleToggle(
                                    "language",
                                    e.target.value as "en" | "km"
                                )
                            }
                            disabled={isUpdating}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="en">English</option>
                            <option value="km">ភាសាខ្មែរ (Khmer)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <select
                            id="currency"
                            value={settings.currency}
                            onChange={(e) =>
                                handleToggle(
                                    "currency",
                                    e.target.value as "USD" | "KHR"
                                )
                            }
                            disabled={isUpdating}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="KHR">KHR (៛)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// REFERRAL TAB
// ============================================================================

function ReferralTab() {
    const { data: stats, isLoading } = useReferralStats();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Unable to load referral statistics
            </div>
        );
    }

    const copyReferralCode = () => {
        navigator.clipboard.writeText(stats.referralCode);
        toast.success("Referral code copied to clipboard!");
    };

    return (
        <div className="space-y-6">
            {/* Referral Code */}
            <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-primary/10">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <Gift className="mx-auto mb-4 h-12 w-12 text-primary" />
                        <h3 className="mb-2 text-lg font-semibold">
                            Your Referral Code
                        </h3>
                        <div className="mx-auto flex max-w-xs items-center gap-2 rounded-lg border-2 border-dashed border-primary/50 bg-background px-4 py-3">
                            <code className="flex-1 text-center text-xl font-bold tracking-wider">
                                {stats.referralCode}
                            </code>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={copyReferralCode}
                                title="Copy code"
                            >
                                📋
                            </Button>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Share this code with friends and earn rewards!
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats.totalReferrals}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Total Referrals
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                                <Award className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats.pointsEarned}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Points Earned
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN PROFILE PAGE
// ============================================================================

export default function ProfilePage() {
    const { data: profile, isLoading, error } = useProfile();
    const updateProfile = useUpdateProfile();
    const updateSettings = useUpdateSettings();

    const handleUpdateProfile = (data: UpdateProfileData) => {
        updateProfile.mutate(data, {
            onSuccess: () => toast.success("Profile updated successfully!"),
            onError: (error) =>
                toast.error(error.message || "Failed to update profile"),
        });
    };

    const handleUpdateSettings = (data: UpdateSettingsData) => {
        updateSettings.mutate(data, {
            onSuccess: () => toast.success("Settings updated!"),
            onError: (error) =>
                toast.error(error.message || "Failed to update settings"),
        });
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (error || !profile) {
        return (
            <Card className="border-destructive/20">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <Shield className="mx-auto mb-4 h-12 w-12 text-destructive" />
                        <h3 className="text-lg font-semibold">
                            Failed to load profile
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {error?.message ?? "Please try again later."}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    const getLoyaltyColor = (tier: string) => {
        const colors: Record<string, string> = {
            bronze: "bg-amber-700",
            silver: "bg-gray-400",
            gold: "bg-amber-400",
            platinum: "bg-gradient-to-r from-purple-400 to-pink-400",
        };
        return colors[tier] ?? "bg-gray-500";
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: profile.preferences.currency,
        }).format(amount);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <Card className="overflow-hidden">
                <div className="h-24 bg-linear-to-r from-primary/20 via-primary/10 to-primary/5" />
                <CardContent className="-mt-12">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarImage
                                    src={profile.profileImage}
                                    alt={profile.fullName}
                                />
                                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                                    {getInitials(profile.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow"
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                                <h1 className="text-2xl font-bold">
                                    {profile.fullName}
                                </h1>
                                <Badge
                                    variant={
                                        profile.role === "admin"
                                            ? "destructive"
                                            : "secondary"
                                    }
                                >
                                    {profile.role}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                {profile.email}
                            </p>
                            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                                <Badge
                                    className={`${getLoyaltyColor(
                                        profile.loyaltyTier
                                    )} capitalize`}
                                >
                                    {profile.loyaltyTier} Member
                                </Badge>
                                <Badge variant="outline">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Joined {formatDate(profile.createdAt)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<TrendingUp className="h-5 w-5" />}
                    label="Total Orders"
                    value={profile.totalOrders}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    icon={<DollarSign className="h-5 w-5" />}
                    label="Total Spent"
                    value={formatCurrency(profile.totalSpent)}
                    gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
                />
                <StatCard
                    icon={<Award className="h-5 w-5" />}
                    label="Loyalty Tier"
                    value={
                        profile.loyaltyTier.charAt(0).toUpperCase() +
                        profile.loyaltyTier.slice(1)
                    }
                    gradient="bg-gradient-to-br from-amber-500 to-amber-600"
                />
                <StatCard
                    icon={<Shield className="h-5 w-5" />}
                    label="Account Status"
                    value={
                        profile.status.charAt(0).toUpperCase() +
                        profile.status.slice(1)
                    }
                    gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                />
            </div>

            {/* Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                        Manage your profile information and preferences
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="profile">
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </TabsTrigger>
                            <TabsTrigger value="settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </TabsTrigger>
                            <TabsTrigger value="referral">
                                <Gift className="mr-2 h-4 w-4" />
                                Referral
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="mt-6">
                            <ProfileInfoTab
                                profile={profile}
                                onUpdate={handleUpdateProfile}
                                isUpdating={updateProfile.isPending}
                            />
                        </TabsContent>

                        <TabsContent value="settings" className="mt-6">
                            <SettingsTab
                                profile={profile}
                                onUpdate={handleUpdateSettings}
                                isUpdating={updateSettings.isPending}
                            />
                        </TabsContent>

                        <TabsContent value="referral" className="mt-6">
                            <ReferralTab />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="border-amber-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-amber-500" />
                        Security
                    </CardTitle>
                    <CardDescription>
                        Manage your account security settings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Change Password</p>
                            <p className="text-sm text-muted-foreground">
                                Update your password to keep your account secure
                            </p>
                        </div>
                        <Button variant="outline">
                            <Lock className="mr-2 h-4 w-4" />
                            Update Password
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
