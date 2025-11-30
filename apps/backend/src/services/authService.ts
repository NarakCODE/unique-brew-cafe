import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import {
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../utils/AppError.js';
import {
  createRegistrationOtp,
  createPasswordResetOtp,
  verifyOtp,
  resendOtp,
} from './otpService.js';
import { sendWelcomeEmail } from './emailService.js';

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}

interface DeviceInfo {
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  deviceInfo?: string | undefined;
}

interface RegisterInitResponse {
  message: string;
  email: string;
  otpExpiresAt: Date;
}

interface VerifyOtpResponse extends AuthResponse {
  message: string;
}

/**
 * Initiate user registration by sending OTP
 * @param data - User registration data
 * @returns OTP sent confirmation
 * @throws BadRequestError if email already exists
 */
export const initiateRegistration = async (
  data: RegisterInput
): Promise<RegisterInitResponse> => {
  const { fullName, email } = data;

  // Create and send OTP
  const { otpExpiresAt } = await createRegistrationOtp(email, fullName);

  return {
    message: 'OTP sent to your email. Please verify to complete registration.',
    email,
    otpExpiresAt,
  };
};

/**
 * Complete user registration after OTP verification
 * @param data - User registration data
 * @param otpCode - OTP code for verification
 * @param deviceInfo - Device information for token tracking
 * @returns User object with tokens
 * @throws BadRequestError if OTP is invalid or email already exists
 */
export const completeRegistration = async (
  data: RegisterInput,
  otpCode: string,
  deviceInfo?: DeviceInfo
): Promise<VerifyOtpResponse> => {
  const { fullName, email, password } = data;

  // Verify OTP
  await verifyOtp(email, otpCode, 'registration');

  // Check if user already exists (double-check)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('Email is already registered');
  }

  // Create new user
  const user = await User.create({
    fullName,
    email,
    password,
  });

  // Send welcome email
  await sendWelcomeEmail({ email, userName: fullName });

  // Generate tokens
  const userId = String(user._id);
  const accessToken = generateAccessToken(userId, user.email, user.role);
  const { token: refreshToken, tokenId } = generateRefreshToken(userId);

  // Store refresh token in database
  await storeRefreshToken(userId, tokenId, refreshToken, deviceInfo);

  return {
    message: 'Registration completed successfully',
    user: {
      id: userId,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Register a new user (legacy - without OTP)
 * @param data - User registration data
 * @param deviceInfo - Device information for token tracking
 * @returns User object with tokens
 * @throws BadRequestError if email already exists
 * @deprecated Use initiateRegistration and completeRegistration instead
 */
export const registerUser = async (
  data: RegisterInput,
  deviceInfo?: DeviceInfo
): Promise<AuthResponse> => {
  const { fullName, email, password } = data;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('Email is already registered');
  }

  // Create new user
  const user = await User.create({
    fullName,
    email,
    password,
  });

  // Generate tokens
  const userId = String(user._id);
  const accessToken = generateAccessToken(userId, user.email, user.role);
  const { token: refreshToken, tokenId } = generateRefreshToken(userId);

  // Store refresh token in database
  await storeRefreshToken(userId, tokenId, refreshToken, deviceInfo);

  return {
    user: {
      id: userId,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Login user with email and password
 * @param data - Login credentials
 * @param deviceInfo - Device information for token tracking
 * @returns User object with tokens
 * @throws UnauthorizedError if credentials are invalid
 */
export const loginUser = async (
  data: LoginInput,
  deviceInfo?: DeviceInfo
): Promise<AuthResponse> => {
  const { email, password } = data;

  // Find user with password field (normally excluded)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Update last login timestamp
  user.lastLoginAt = new Date();
  await user.save();

  // Generate tokens
  const userId = String(user._id);
  const accessToken = generateAccessToken(userId, user.email, user.role);
  const { token: refreshToken, tokenId } = generateRefreshToken(userId);

  // Store refresh token in database
  await storeRefreshToken(userId, tokenId, refreshToken, deviceInfo);

  return {
    user: {
      id: userId,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Get user profile by ID
 * @param userId - User ID
 * @returns User object
 * @throws NotFoundError if user not found
 */
export const getUserById = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Initiate password reset by sending OTP
 * @param email - User email
 * @returns OTP sent confirmation
 * @throws NotFoundError if user not found
 */
export const initiatePasswordReset = async (
  email: string
): Promise<{ message: string; otpExpiresAt: Date }> => {
  const { otpExpiresAt } = await createPasswordResetOtp(email);

  return {
    message: 'Password reset OTP sent to your email',
    otpExpiresAt,
  };
};

/**
 * Reset password after OTP verification
 * @param email - User email
 * @param otpCode - OTP code
 * @param newPassword - New password
 * @returns Success message
 * @throws BadRequestError if OTP is invalid
 * @throws NotFoundError if user not found
 */
export const resetPassword = async (
  email: string,
  otpCode: string,
  newPassword: string
): Promise<{ message: string }> => {
  // Verify OTP
  await verifyOtp(email, otpCode, 'password_reset');

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update password (will be hashed by pre-save hook)
  user.password = newPassword;
  await user.save();

  return {
    message: 'Password reset successfully',
  };
};

/**
 * Resend OTP for registration or password reset
 * @param email - User email
 * @param verificationType - Type of verification
 * @returns OTP expiration time
 */
export const resendOtpCode = async (
  email: string,
  verificationType: 'registration' | 'password_reset'
): Promise<{ message: string; otpExpiresAt: Date }> => {
  const { otpExpiresAt } = await resendOtp(email, verificationType);

  return {
    message: 'OTP resent successfully',
    otpExpiresAt,
  };
};

/**
 * Store refresh token in database
 * @param userId - User ID
 * @param tokenId - Unique token identifier
 * @param token - Refresh token string
 * @param deviceInfo - Device information
 */
const storeRefreshToken = async (
  userId: string,
  tokenId: string,
  token: string,
  deviceInfo?: DeviceInfo
): Promise<void> => {
  // Calculate expiration date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    userId,
    tokenId,
    token,
    deviceInfo: deviceInfo?.deviceInfo,
    ipAddress: deviceInfo?.ipAddress,
    userAgent: deviceInfo?.userAgent,
    isRevoked: false,
    expiresAt,
  });
};

/**
 * Refresh access token using refresh token
 * @param refreshTokenString - Refresh token string
 * @returns New access token and refresh token
 * @throws UnauthorizedError if refresh token is invalid or revoked
 */
export const refreshAccessToken = async (
  refreshTokenString: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Verify refresh token
  const decoded = verifyRefreshToken(refreshTokenString);

  // Check if token exists in database and is not revoked
  const tokenRecord = await RefreshToken.findOne({
    tokenId: decoded.tokenId,
    isRevoked: false,
  });

  if (!tokenRecord) {
    throw new UnauthorizedError('Invalid or revoked refresh token');
  }

  // Check if token has expired
  if (tokenRecord.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token has expired');
  }

  // Verify user still exists
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  // Generate new tokens
  const userId = String(user._id);
  const accessToken = generateAccessToken(userId, user.email, user.role);
  const { token: newRefreshToken, tokenId: newTokenId } =
    generateRefreshToken(userId);

  // Revoke old refresh token
  tokenRecord.isRevoked = true;
  await tokenRecord.save();

  // Store new refresh token
  await storeRefreshToken(userId, newTokenId, newRefreshToken, {
    deviceInfo: tokenRecord.deviceInfo,
    ipAddress: tokenRecord.ipAddress,
    userAgent: tokenRecord.userAgent,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logout user by revoking refresh token and invalidating access tokens
 * @param refreshTokenString - Refresh token string
 * @throws UnauthorizedError if refresh token is invalid
 */
export const logoutUser = async (
  refreshTokenString: string
): Promise<{ message: string }> => {
  // Verify refresh token
  const decoded = verifyRefreshToken(refreshTokenString);

  // Find and revoke token
  const tokenRecord = await RefreshToken.findOne({
    tokenId: decoded.tokenId,
  });

  if (tokenRecord && !tokenRecord.isRevoked) {
    tokenRecord.isRevoked = true;
    await tokenRecord.save();
  }

  // Update user's lastLogoutAt to invalidate all current access tokens
  await User.findByIdAndUpdate(decoded.userId, {
    lastLogoutAt: new Date(),
  });

  return {
    message: 'Logged out successfully',
  };
};

/**
 * Revoke all refresh tokens for a user
 * @param userId - User ID
 */
export const revokeAllUserTokens = async (
  userId: string
): Promise<{ message: string; revokedCount: number }> => {
  const result = await RefreshToken.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );

  return {
    message: 'All refresh tokens revoked successfully',
    revokedCount: result.modifiedCount,
  };
};
