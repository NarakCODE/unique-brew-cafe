// Profile Types

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    profileImage?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    role: "user" | "admin" | "moderator";
    status: "active" | "suspended" | "deleted";
    loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
    totalOrders: number;
    totalSpent: number;
    referralCode?: string;
    preferences: UserPreferences;
    createdAt: string;
    lastLoginAt?: string;
}

export interface UserPreferences {
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    language: "en" | "km";
    currency: "USD" | "KHR";
}

export interface UpdateProfileData {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
}

export interface UpdateSettingsData {
    notificationsEnabled?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    language?: "en" | "km";
    currency?: "USD" | "KHR";
}

export interface UpdatePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface ReferralStats {
    referralCode: string;
    totalReferrals: number;
    pointsEarned: number;
}

export interface DeleteAccountData {
    password: string;
    reason?: string;
}
