import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';
import { BadRequestError } from '../utils/AppError.js';

/**
 * Initiate registration by sending OTP
 * POST /api/auth/register/initiate
 */
export const initiateRegistration = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      throw new BadRequestError('Full name, email, and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError('Invalid email format');
    }

    // Validate password length
    if (password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters');
    }

    // Initiate registration
    const result = await authService.initiateRegistration({
      fullName,
      email,
      password,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Complete registration with OTP verification
 * POST /api/auth/register/verify
 */
export const verifyRegistration = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password, otpCode } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !otpCode) {
      throw new BadRequestError(
        'Full name, email, password, and OTP code are required'
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otpCode)) {
      throw new BadRequestError('OTP code must be 6 digits');
    }

    // Extract device info
    const deviceInfo = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };

    // Complete registration
    const result = await authService.completeRegistration(
      { fullName, email, password },
      otpCode,
      deviceInfo
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Register a new user (legacy endpoint without OTP)
 * POST /api/auth/register
 * @deprecated Use /api/auth/register/initiate and /api/auth/register/verify
 */
export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      throw new BadRequestError('Full name, email, and password are required');
    }

    // Extract device info
    const deviceInfo = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };

    // Register user
    const result = await authService.registerUser(
      { fullName, email, password },
      deviceInfo
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    // Extract device info
    const deviceInfo = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };

    // Login user
    const result = await authService.loginUser({ email, password }, deviceInfo);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getMe = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // userId is attached by auth middleware
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const user = await authService.getUserById(req.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

/**
 * Initiate password reset by sending OTP
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      throw new BadRequestError('Email is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError('Invalid email format');
    }

    // Initiate password reset
    const result = await authService.initiatePasswordReset(email);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Reset password with OTP verification
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, otpCode, newPassword } = req.body;

    // Validate required fields
    if (!email || !otpCode || !newPassword) {
      throw new BadRequestError(
        'Email, OTP code, and new password are required'
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otpCode)) {
      throw new BadRequestError('OTP code must be 6 digits');
    }

    // Validate password length
    if (newPassword.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters');
    }

    // Reset password
    const result = await authService.resetPassword(email, otpCode, newPassword);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Resend OTP code
 * POST /api/auth/resend-otp
 */
export const resendOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, verificationType } = req.body;

    // Validate required fields
    if (!email || !verificationType) {
      throw new BadRequestError('Email and verification type are required');
    }

    // Validate verification type
    if (!['registration', 'password_reset'].includes(verificationType)) {
      throw new BadRequestError(
        'Verification type must be "registration" or "password_reset"'
      );
    }

    // Resend OTP
    const result = await authService.resendOtpCode(
      email,
      verificationType as 'registration' | 'password_reset'
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    // Validate required fields
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    // Refresh access token
    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    // Validate required fields
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    // Logout user
    const result = await authService.logoutUser(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);
