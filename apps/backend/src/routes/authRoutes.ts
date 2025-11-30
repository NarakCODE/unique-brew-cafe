import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  initiateRegistrationSchema,
  verifyRegistrationSchema,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../schemas/auth.schema.js';

const router = express.Router();

/**
 * POST /api/auth/register/initiate
 * Initiate registration by sending OTP to email
 */
router.post(
  '/register/initiate',
  validate(initiateRegistrationSchema),
  authController.initiateRegistration
);

/**
 * POST /api/auth/register/verify
 * Complete registration with OTP verification
 */
router.post(
  '/register/verify',
  validate(verifyRegistrationSchema),
  authController.verifyRegistration
);

/**
 * POST /api/auth/register
 * Register a new user (legacy endpoint without OTP)
 * @deprecated Use /register/initiate and /register/verify instead
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * POST /api/auth/login
 * Login user with email and password
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * POST /api/auth/forgot-password
 * Initiate password reset by sending OTP to email
 */
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Reset password with OTP verification
 */
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
);

/**
 * POST /api/auth/resend-otp
 * Resend OTP code for registration or password reset
 */
router.post('/resend-otp', validate(resendOtpSchema), authController.resendOtp);

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 * Requires authentication
 */
router.get('/me', authenticate, authController.getMe);

/**
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token
 */
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  authController.refreshToken
);

/**
 * POST /api/auth/logout
 * Logout user by revoking refresh token
 */
router.post('/logout', validate(logoutSchema), authController.logout);

export default router;
