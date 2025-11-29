import { Otp } from '../models/Otp.js';
import { User } from '../models/User.js';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from '../utils/AppError.js';
import { sendOtpEmail, sendPasswordResetEmail } from './emailService.js';

/**
 * Generate a random 6-digit OTP code
 */
const generateOtpCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create and send OTP for registration
 * @param email - User email
 * @param userName - User name (optional)
 * @returns OTP expiration time
 */
export const createRegistrationOtp = async (
  email: string,
  userName?: string
): Promise<{ otpExpiresAt: Date }> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('Email is already registered');
  }

  // Delete any existing OTPs for this email and type
  await Otp.deleteMany({
    email,
    verificationType: 'registration',
  });

  // Generate OTP code
  const otpCode = generateOtpCode();

  // Set expiration to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Create OTP record
  await Otp.create({
    email,
    otpCode,
    verificationType: 'registration',
    expiresAt,
  });

  // Send OTP email
  await sendOtpEmail({ email, otpCode, userName });

  return { otpExpiresAt: expiresAt };
};

/**
 * Create and send OTP for password reset
 * @param email - User email
 * @returns OTP expiration time
 */
export const createPasswordResetOtp = async (
  email: string
): Promise<{ otpExpiresAt: Date }> => {
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError('No account found with this email');
  }

  // Delete any existing OTPs for this email and type
  await Otp.deleteMany({
    email,
    verificationType: 'password_reset',
  });

  // Generate OTP code
  const otpCode = generateOtpCode();

  // Set expiration to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Create OTP record
  await Otp.create({
    userId: user._id,
    email,
    otpCode,
    verificationType: 'password_reset',
    expiresAt,
  });

  // Send password reset email
  await sendPasswordResetEmail({ email, otpCode, userName: user.fullName });

  return { otpExpiresAt: expiresAt };
};

/**
 * Create and send OTP for email verification
 * @param userId - User ID
 * @param email - User email
 * @param userName - User name
 * @returns OTP expiration time
 */
export const createEmailVerificationOtp = async (
  userId: string,
  email: string,
  userName: string
): Promise<{ otpExpiresAt: Date }> => {
  // Delete any existing OTPs for this email and type
  await Otp.deleteMany({
    email,
    verificationType: 'email_verification',
  });

  // Generate OTP code
  const otpCode = generateOtpCode();

  // Set expiration to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Create OTP record
  await Otp.create({
    userId,
    email,
    otpCode,
    verificationType: 'email_verification',
    expiresAt,
  });

  // Send OTP email
  await sendOtpEmail({ email, otpCode, userName });

  return { otpExpiresAt: expiresAt };
};

/**
 * Verify OTP code
 * @param email - User email
 * @param otpCode - OTP code to verify
 * @param verificationType - Type of verification
 * @returns Success status
 */
export const verifyOtp = async (
  email: string,
  otpCode: string,
  verificationType: 'registration' | 'password_reset' | 'email_verification'
): Promise<{ success: boolean }> => {
  // Find the most recent OTP for this email and type
  const otp = await Otp.findOne({
    email,
    verificationType,
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otp) {
    throw new BadRequestError('No OTP found. Please request a new one.');
  }

  // Check if OTP has expired
  if (otp.expiresAt < new Date()) {
    throw new BadRequestError('OTP has expired. Please request a new one.');
  }

  // Check if max attempts exceeded
  if (otp.attempts >= otp.maxAttempts) {
    throw new BadRequestError(
      'Maximum verification attempts exceeded. Please request a new OTP.'
    );
  }

  // Increment attempts
  otp.attempts += 1;
  await otp.save();

  // Verify OTP code
  if (otp.otpCode !== otpCode) {
    const remainingAttempts = otp.maxAttempts - otp.attempts;
    throw new UnauthorizedError(
      `Invalid OTP code. ${remainingAttempts} attempt(s) remaining.`
    );
  }

  // Mark as verified
  otp.verified = true;
  otp.verifiedAt = new Date();
  await otp.save();

  return { success: true };
};

/**
 * Resend OTP
 * @param email - User email
 * @param verificationType - Type of verification
 * @returns OTP expiration time
 */
export const resendOtp = async (
  email: string,
  verificationType: 'registration' | 'password_reset' | 'email_verification'
): Promise<{ otpExpiresAt: Date }> => {
  // Check if there's a recent OTP request (prevent spam)
  const recentOtp = await Otp.findOne({
    email,
    verificationType,
  }).sort({ createdAt: -1 });

  if (recentOtp) {
    const timeSinceCreation = Date.now() - recentOtp.createdAt.getTime();
    const oneMinute = 60 * 1000;

    if (timeSinceCreation < oneMinute) {
      throw new BadRequestError(
        'Please wait at least 1 minute before requesting a new OTP'
      );
    }
  }

  // Create new OTP based on type
  if (verificationType === 'registration') {
    return createRegistrationOtp(email);
  } else if (verificationType === 'password_reset') {
    return createPasswordResetOtp(email);
  } else {
    // For email verification, we need the user
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return createEmailVerificationOtp(String(user._id), email, user.fullName);
  }
};

/**
 * Check if OTP is verified
 * @param email - User email
 * @param verificationType - Type of verification
 * @returns Verification status
 */
export const isOtpVerified = async (
  email: string,
  verificationType: 'registration' | 'password_reset' | 'email_verification'
): Promise<boolean> => {
  const otp = await Otp.findOne({
    email,
    verificationType,
    verified: true,
  }).sort({ createdAt: -1 });

  if (!otp) {
    return false;
  }

  // Check if verification is still valid (within 30 minutes)
  const timeSinceVerification = Date.now() - (otp.verifiedAt?.getTime() || 0);
  const thirtyMinutes = 30 * 60 * 1000;

  return timeSinceVerification < thirtyMinutes;
};
