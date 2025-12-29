/**
 * CORE ENUMS & TYPES
 * Defined once to avoid duplication
 */
export type UserRole = "admin" | "customer" | "moderator";
export type UserStatus = "active" | "inactive" | "suspended" | "deleted";
export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

/**
 * PREFERENCE INTERFACES
 * Helper interfaces for nested objects
 */
export interface NotificationDetailSettings {
    orderUpdates: boolean;
    promotions: boolean;
    announcements: boolean;
    systemNotifications: boolean;
}

export interface UserPreferences {
    notifications: NotificationDetailSettings;
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    language: string;
    currency: string;
}

/**
 * MAIN USER INTERFACE
 * This is the full database document structure
 */
export interface User {
    _id: string; // Matches MongoDB format
    fullName: string;
    email: string;

    // Verification flags
    emailVerified: boolean;
    phoneVerified: boolean;

    profileImage?: string; // Optional as it wasn't in the JSON, but was in your old type

    // Enums
    role: UserRole;
    status: UserStatus;
    loyaltyTier: LoyaltyTier;

    // Numerical data
    loyaltyPoints: number;
    totalOrders: number;
    totalSpent: number;

    // Nested Preferences
    preferences: UserPreferences;

    // Timestamps & Meta
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    referralCode?: string;
}

/**
 * DATA TRANSFER OBJECTS (DTOs)
 * Used for API requests (Creating/Updating users)
 */

// 1. Data required to create a new user
export interface CreateUserData {
    fullName: string;
    email: string;
    password: string; // Only needed on creation/login, never returned in User interface
    role?: UserRole;
}

// 2. Data allowed when updating a profile
// We use Partial to allow updating just one field (e.g., just the phone number)
export type UpdateUserData = Partial<
    Pick<User, "fullName" | "profileImage" | "status" | "role" | "preferences">
>;

// 3. Specific wrapper for updating status (useful for admin dashboards)
export interface UpdateUserStatusData {
    status: UserStatus;
}

// 4. Password update DTO
export interface UpdatePasswordData {
    currentPassword?: string; // Optional if using OTP
    newPassword: string;
    confirmPassword: string;
}

// 5. Account deletion DTO
export interface DeleteAccountData {
    reason: string;
    password?: string; // Verification before delete
}

// 6. Referral statistics
export interface ReferralHistoryItem {
    user: string; // User Name
    date: string;
    status: "pending" | "completed";
    amount: number;
}

export interface ReferralStats {
    totalReferrals: number;
    totalEarned: number;
    pendingRewards: number;
    referralCode: string;
    history: ReferralHistoryItem[];
}
