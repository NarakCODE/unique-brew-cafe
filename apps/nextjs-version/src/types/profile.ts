// Sub-interface for the detailed notification settings
export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  announcements: boolean;
  systemNotifications: boolean;
}

// Sub-interface for the preferences object
export interface UserPreferences {
  notifications: NotificationSettings;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  language: string; // Could be 'en' | 'es' | 'fr' etc.
  currency: string; // Could be 'USD' | 'EUR' etc.
}

// Main User Interface
export interface User {
  _id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  phoneNumber: string;
  gender: "male" | "female" | "other" | string; // Union type for better safety
  dateOfBirth: string; // ISO Date string
  profileImage: string;

  // Roles & Status
  role: "admin" | "user" | string;
  status: "active" | "inactive" | "suspended" | string;

  // Loyalty & Stats
  loyaltyPoints: number;
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum" | string;
  totalOrders: number;
  totalSpent: number;

  // Metadata & Timestamps
  referralCode: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  lastLoginAt: string; // ISO Date string
  lastLogoutAt: string; // ISO Date string

  // The nested preferences object
  preferences: UserPreferences;
}

export interface UpdateProfileSettingsRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | string;
  preferences: UserPreferences;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
}
