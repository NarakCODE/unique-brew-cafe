export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  announcements: boolean;
  systemNotifications: boolean;
}

export interface UserPreferences {
  notifications: NotificationSettings;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  currency: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  phoneNumber: string;
  gender: "male" | "female" | "other" | string;
  dateOfBirth: string;
  profileImage: string;
  role: "admin" | "user" | string;
  status: "active" | "inactive" | "suspended" | string;
  loyaltyPoints: number;
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum" | string;
  totalOrders: number;
  totalSpent: number;
  referralCode: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  lastLogoutAt: string;
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
