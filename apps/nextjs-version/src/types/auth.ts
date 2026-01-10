export interface UserPreferences {
  notifications: {
    orderUpdates: boolean
    promotions: boolean
    announcements: boolean
    systemNotifications: boolean
  }
  notificationsEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  language: string
  currency: string
}

export interface User {
  _id: string
  id?: string // Keeping for backward compatibility if needed, though API returns _id
  fullName: string
  email: string
  emailVerified: boolean
  phoneVerified: boolean
  role: string
  loyaltyPoints: number
  loyaltyTier: string
  totalOrders: number
  totalSpent: number
  status: string
  createdAt: string
  updatedAt: string
  referralCode: string
  lastLoginAt: string
  lastLogoutAt: string
  dateOfBirth: string
  gender: string
  phoneNumber: string
  preferences: UserPreferences
  profileImage?: string
}

export interface AuthResponseData {
  user: User
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  statusCode: number
  data: AuthResponseData
  message: string
  success: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LogoutPayload {
  refreshToken: string
}

export interface LogoutResponse {
  statusCode: number
  data: {
    message: string
  }
  message: string
  success: boolean
}

export interface ProfileResponse {
  statusCode: number
  data: User
  message: string
  success: boolean
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
}

export interface RegisterResponse {
  statusCode: number
  data: {
    message: string
    email: string
    otpExpiresAt: string
  }
  message: string
  success: boolean
}

export interface VerifyOtpPayload {
  email: string
  otpCode: string
  fullName?: string
  password?: string
}

export interface VerifyOtpResponse {
  statusCode: number
  data: AuthResponseData
  message: string
  success: boolean
}

export interface ResendOtpPayload {
  email: string
  verificationType: "registration" | "password_reset"
}

export interface ResendOtpResponse {
  statusCode: number
  data: {
    message: string
    otpExpiresAt: string
  }
  message: string
  success: boolean
}
