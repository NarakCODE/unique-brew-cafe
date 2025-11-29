import { z } from 'zod';

/**
 * Common validation rules
 */
const emailValidation = z
  .string()
  .email('Invalid email format')
  .trim()
  .toLowerCase();

const passwordValidation = z
  .string()
  .min(6, 'Password must be at least 6 characters');

const otpCodeValidation = z
  .string()
  .regex(/^\d{6}$/, 'OTP code must be 6 digits');

/**
 * Login Schema
 */
export const loginSchema = z.object({
  body: z
    .object({
      email: emailValidation,
      password: passwordValidation,
    })
    .strict(),
});

/**
 * Registration Initiation Schema
 */
export const initiateRegistrationSchema = z.object({
  body: z
    .object({
      fullName: z.string().min(1, 'Full name is required').trim(),
      email: emailValidation,
      password: passwordValidation,
    })
    .strict(),
});

/**
 * Registration Verification Schema
 */
export const verifyRegistrationSchema = z.object({
  body: z
    .object({
      fullName: z.string().min(1, 'Full name is required').trim(),
      email: emailValidation,
      password: passwordValidation,
      otpCode: otpCodeValidation,
    })
    .strict(),
});

/**
 * Legacy Registration Schema (without OTP)
 */
export const registerSchema = z.object({
  body: z
    .object({
      fullName: z.string().min(1, 'Full name is required').trim(),
      email: emailValidation,
      password: passwordValidation,
    })
    .strict(),
});

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  body: z
    .object({
      email: emailValidation,
    })
    .strict(),
});

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z.object({
  body: z
    .object({
      email: emailValidation,
      otpCode: otpCodeValidation,
      newPassword: passwordValidation,
    })
    .strict(),
});

/**
 * Resend OTP Schema
 */
export const resendOtpSchema = z.object({
  body: z
    .object({
      email: emailValidation,
      verificationType: z.enum(['registration', 'password_reset'], {
        error: () => ({
          message:
            'Verification type must be "registration" or "password_reset"',
        }),
      }),
    })
    .strict(),
});

/**
 * Refresh Token Schema
 */
export const refreshTokenSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(1, 'Refresh token is required'),
    })
    .strict(),
});

/**
 * Logout Schema
 */
export const logoutSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(1, 'Refresh token is required'),
    })
    .strict(),
});

/**
 * Type exports
 */
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type InitiateRegistrationInput = z.infer<
  typeof initiateRegistrationSchema
>['body'];
export type VerifyRegistrationInput = z.infer<
  typeof verifyRegistrationSchema
>['body'];
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type ResendOtpInput = z.infer<typeof resendOtpSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type LogoutInput = z.infer<typeof logoutSchema>['body'];
