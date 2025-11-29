import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authService from '../../../src/services/authService.js';
import { User } from '../../../src/models/User.js';
import { RefreshToken } from '../../../src/models/RefreshToken.js';
import { createTestUser } from '../../utils/testHelpers.js';
import * as otpService from '../../../src/services/otpService.js';
import * as emailService from '../../../src/services/emailService.js';

// Mock dependencies
vi.mock('../../../src/services/otpService.js');
vi.mock('../../../src/services/emailService.js');

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initiateRegistration', () => {
    it('should initiate registration and send OTP', async () => {
      const data = {
        fullName: 'New User',
        email: 'new@example.com',
        password: 'Password123!',
      };

      const mockOtpResponse = {
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      vi.mocked(otpService.createRegistrationOtp).mockResolvedValue(
        mockOtpResponse as any
      );

      const result = await authService.initiateRegistration(data);

      expect(otpService.createRegistrationOtp).toHaveBeenCalledWith(
        data.email,
        data.fullName
      );
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('email', data.email);
      expect(result).toHaveProperty('otpExpiresAt');
    });
  });

  describe('completeRegistration', () => {
    it('should complete registration with valid OTP', async () => {
      const data = {
        fullName: 'Verified User',
        email: 'verified@example.com',
        password: 'Password123!',
      };
      const otpCode = '123456';

      vi.mocked(otpService.verifyOtp).mockResolvedValue(true as any);
      vi.mocked(emailService.sendWelcomeEmail).mockResolvedValue(undefined);

      const result = await authService.completeRegistration(data, otpCode);

      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        data.email,
        otpCode,
        'registration'
      );
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith({
        email: data.email,
        userName: data.fullName,
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(data.email);

      const user = await User.findOne({ email: data.email });
      expect(user).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      await createTestUser({ email: 'existing@example.com' });
      const data = {
        fullName: 'Existing User',
        email: 'existing@example.com',
        password: 'Password123!',
      };

      vi.mocked(otpService.verifyOtp).mockResolvedValue(true as any);

      await expect(
        authService.completeRegistration(data, '123456')
      ).rejects.toThrow('Email is already registered');
    });
  });

  describe('loginUser', () => {
    it('should login user with valid credentials', async () => {
      await createTestUser({
        email: 'login@example.com',
        password: 'password123',
      });

      const result = await authService.loginUser({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('login@example.com');
    });

    it('should throw error with invalid credentials', async () => {
      await createTestUser({
        email: 'login@example.com',
        password: 'password123',
      });

      await expect(
        authService.loginUser({
          email: 'login@example.com',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('getUserById', () => {
    it('should return user profile', async () => {
      const user = await createTestUser();
      const result = await authService.getUserById(String(user._id));

      expect(result.email).toBe(user.email);
      expect(result.fullName).toBe(user.fullName);
    });

    it('should throw error if user not found', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      await expect(authService.getUserById(nonExistentId)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('initiatePasswordReset', () => {
    it('should initiate password reset', async () => {
      const email = 'reset@example.com';
      const mockOtpResponse = {
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      vi.mocked(otpService.createPasswordResetOtp).mockResolvedValue(
        mockOtpResponse as any
      );

      const result = await authService.initiatePasswordReset(email);

      expect(otpService.createPasswordResetOtp).toHaveBeenCalledWith(email);
      expect(result).toHaveProperty('message');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid OTP', async () => {
      const user = await createTestUser({
        email: 'reset@example.com',
        password: 'OldPassword123!',
      });
      const otpCode = '123456';
      const newPassword = 'NewPassword123!';

      vi.mocked(otpService.verifyOtp).mockResolvedValue(true as any);

      await authService.resetPassword(user.email, otpCode, newPassword);

      const updatedUser = await User.findById(user._id).select('+password');
      const isMatch = await updatedUser?.comparePassword(newPassword);
      expect(isMatch).toBe(true);
    });
  });

  describe('resendOtpCode', () => {
    it('should resend OTP', async () => {
      const email = 'resend@example.com';
      const type = 'registration';
      const mockOtpResponse = {
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      vi.mocked(otpService.resendOtp).mockResolvedValue(mockOtpResponse as any);

      const result = await authService.resendOtpCode(email, type);

      expect(otpService.resendOtp).toHaveBeenCalledWith(email, type);
      expect(result).toHaveProperty('otpExpiresAt');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token', async () => {
      const user = await createTestUser();

      const loginResult = await authService.loginUser({
        email: user.email,
        password: 'password123',
      });

      const result = await authService.refreshAccessToken(
        loginResult.refreshToken
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('logoutUser', () => {
    it('should logout user', async () => {
      const user = await createTestUser();
      const loginResult = await authService.loginUser({
        email: user.email,
        password: 'password123',
      });

      await authService.logoutUser(loginResult.refreshToken);

      const token = await RefreshToken.findOne({
        token: loginResult.refreshToken,
      });
      expect(token?.isRevoked).toBe(true);
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all tokens for user', async () => {
      const user = await createTestUser();
      const loginResult = await authService.loginUser({
        email: user.email,
        password: 'password123',
      });

      await authService.revokeAllUserTokens(user.id.toString());

      const token = await RefreshToken.findOne({
        token: loginResult.refreshToken,
      });
      expect(token?.isRevoked).toBe(true);
    });
  });
});
