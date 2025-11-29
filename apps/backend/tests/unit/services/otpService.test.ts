import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as otpService from '../../../src/services/otpService.js';
import { Otp } from '../../../src/models/Otp.js';
import { User } from '../../../src/models/User.js';
import * as emailService from '../../../src/services/emailService.js';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from '../../../src/utils/AppError.js';

// Mock dependencies
vi.mock('../../../src/models/Otp.js');
vi.mock('../../../src/models/User.js');
vi.mock('../../../src/services/emailService.js');

describe('OtpService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now() for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-26T18:45:05+07:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createRegistrationOtp', () => {
    const email = 'test@example.com';
    const userName = 'Test User';

    it('should throw error if user already exists', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        _id: 'user123',
        email,
      } as any);

      await expect(
        otpService.createRegistrationOtp(email, userName)
      ).rejects.toThrow('Email is already registered');
    });

    it('should create OTP and send email for new user', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(Otp.deleteMany).mockResolvedValue({} as any);
      vi.mocked(Otp.create).mockResolvedValue({} as any);
      vi.mocked(emailService.sendOtpEmail).mockResolvedValue();

      const result = await otpService.createRegistrationOtp(email, userName);

      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(Otp.deleteMany).toHaveBeenCalledWith({
        email,
        verificationType: 'registration',
      });
      expect(Otp.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          verificationType: 'registration',
          otpCode: expect.any(String),
          expiresAt: expect.any(Date),
        })
      );
      expect(emailService.sendOtpEmail).toHaveBeenCalledWith({
        email,
        otpCode: expect.any(String),
        userName,
      });
      expect(result).toHaveProperty('otpExpiresAt');
      expect(result.otpExpiresAt).toBeInstanceOf(Date);
    });

    it('should generate 6-digit OTP code', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(Otp.deleteMany).mockResolvedValue({} as any);

      let capturedOtpCode: string | undefined;
      vi.mocked(Otp.create).mockImplementation((data: any) => {
        capturedOtpCode = data.otpCode;
        return Promise.resolve({} as any);
      });
      vi.mocked(emailService.sendOtpEmail).mockResolvedValue();

      await otpService.createRegistrationOtp(email);

      expect(capturedOtpCode).toBeDefined();
      expect(capturedOtpCode).toMatch(/^\d{6}$/);
      expect(Number(capturedOtpCode)).toBeGreaterThanOrEqual(100000);
      expect(Number(capturedOtpCode)).toBeLessThanOrEqual(999999);
    });

    it('should set expiration to 10 minutes from now', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(Otp.deleteMany).mockResolvedValue({} as any);

      let capturedExpiresAt: Date | undefined;
      vi.mocked(Otp.create).mockImplementation((data: any) => {
        capturedExpiresAt = data.expiresAt;
        return Promise.resolve({} as any);
      });
      vi.mocked(emailService.sendOtpEmail).mockResolvedValue();

      const result = await otpService.createRegistrationOtp(email);

      const expectedExpiration = new Date(Date.now() + 10 * 60 * 1000);
      expect(capturedExpiresAt).toBeDefined();
      expect(capturedExpiresAt?.getTime()).toBe(expectedExpiration.getTime());
      expect(result.otpExpiresAt.getTime()).toBe(expectedExpiration.getTime());
    });

    it('should delete existing OTPs before creating new one', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(Otp.deleteMany).mockResolvedValue({} as any);
      vi.mocked(Otp.create).mockResolvedValue({} as any);
      vi.mocked(emailService.sendOtpEmail).mockResolvedValue();

      await otpService.createRegistrationOtp(email);

      expect(Otp.deleteMany).toHaveBeenCalledBefore(
        vi.mocked(Otp.create) as any
      );
    });
  });

  describe('createPasswordResetOtp', () => {
    const email = 'test@example.com';

    it('should throw error if user does not exist', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      await expect(otpService.createPasswordResetOtp(email)).rejects.toThrow(
        'No account found with this email'
      );
      expect(User.findOne).toHaveBeenCalledWith({ email });
    });

    it('should create OTP and send password reset email', async () => {
      const mockUser = {
        _id: 'user123',
        email,
        fullName: 'Test User',
      };
      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(Otp.deleteMany).mockResolvedValue({} as any);
      vi.mocked(Otp.create).mockResolvedValue({} as any);
      vi.mocked(emailService.sendPasswordResetEmail).mockResolvedValue();

      const result = await otpService.createPasswordResetOtp(email);

      expect(Otp.deleteMany).toHaveBeenCalledWith({
        email,
        verificationType: 'password_reset',
      });
      expect(Otp.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser._id,
          email,
          verificationType: 'password_reset',
          otpCode: expect.any(String),
          expiresAt: expect.any(Date),
        })
      );
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith({
        email,
        otpCode: expect.any(String),
        userName: mockUser.fullName,
      });
      expect(result).toHaveProperty('otpExpiresAt');
      expect(result.otpExpiresAt).toBeInstanceOf(Date);
    });

    it('should include userId in OTP record', async () => {
      const mockUser = {
        _id: 'user123',
        email,
        fullName: 'Test User',
      };
      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(Otp.deleteMany).mockResolvedValue({} as any);

      let capturedData: any;
      vi.mocked(Otp.create).mockImplementation((data: any) => {
        capturedData = data;
        return Promise.resolve({} as any);
      });
      vi.mocked(emailService.sendPasswordResetEmail).mockResolvedValue();

      await otpService.createPasswordResetOtp(email);

      expect(capturedData).toBeDefined();
      expect(capturedData.userId).toBe(mockUser._id);
    });
  });

  describe('createEmailVerificationOtp', () => {
    const userId = 'user123';
    const email = 'test@example.com';
    const userName = 'Test User';

    it('should create OTP and send email verification email', async () => {
      vi.mocked(Otp.deleteMany).mockResolvedValue({} as any);
      vi.mocked(Otp.create).mockResolvedValue({} as any);
      vi.mocked(emailService.sendOtpEmail).mockResolvedValue();

      const result = await otpService.createEmailVerificationOtp(
        userId,
        email,
        userName
      );

      expect(Otp.deleteMany).toHaveBeenCalledWith({
        email,
        verificationType: 'email_verification',
      });
      expect(Otp.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          email,
          verificationType: 'email_verification',
          otpCode: expect.any(String),
          expiresAt: expect.any(Date),
        })
      );
      expect(emailService.sendOtpEmail).toHaveBeenCalledWith({
        email,
        otpCode: expect.any(String),
        userName,
      });
      expect(result).toHaveProperty('otpExpiresAt');
    });

    it('should delete existing email verification OTPs', async () => {
      vi.mocked(Otp.deleteMany).mockResolvedValue({} as any);
      vi.mocked(Otp.create).mockResolvedValue({} as any);
      vi.mocked(emailService.sendOtpEmail).mockResolvedValue();

      await otpService.createEmailVerificationOtp(userId, email, userName);

      expect(Otp.deleteMany).toHaveBeenCalledWith({
        email,
        verificationType: 'email_verification',
      });
    });
  });

  describe('verifyOtp', () => {
    const email = 'test@example.com';
    const otpCode = '123456';
    const verificationType = 'registration';

    it('should throw error if no OTP found', async () => {
      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(
        otpService.verifyOtp(email, otpCode, verificationType)
      ).rejects.toThrow('No OTP found. Please request a new one.');
    });

    it('should throw error if OTP has expired', async () => {
      const expiredOtp = {
        _id: 'otp123',
        email,
        otpCode,
        verificationType,
        verified: false,
        attempts: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        save: vi.fn(),
      };

      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(expiredOtp),
      } as any);

      await expect(
        otpService.verifyOtp(email, otpCode, verificationType)
      ).rejects.toThrow('OTP has expired. Please request a new one.');
    });

    it('should throw error if max attempts exceeded', async () => {
      const otp = {
        _id: 'otp123',
        email,
        otpCode,
        verificationType,
        verified: false,
        attempts: 5,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        save: vi.fn(),
      };

      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(otp),
      } as any);

      await expect(
        otpService.verifyOtp(email, otpCode, verificationType)
      ).rejects.toThrow(
        'Maximum verification attempts exceeded. Please request a new OTP.'
      );
    });

    it('should increment attempts and throw error for invalid OTP', async () => {
      const otp = {
        _id: 'otp123',
        email,
        otpCode: '654321',
        verificationType,
        verified: false,
        attempts: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        save: vi.fn(),
      };

      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(otp),
      } as any);

      await expect(
        otpService.verifyOtp(email, otpCode, verificationType)
      ).rejects.toThrow('Invalid OTP code. 4 attempt(s) remaining.');

      expect(otp.attempts).toBe(1);
      expect(otp.save).toHaveBeenCalled();
    });

    it('should verify OTP and mark as verified for correct code', async () => {
      const otp = {
        _id: 'otp123',
        email,
        otpCode,
        verificationType,
        verified: false,
        attempts: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verifiedAt: undefined,
        save: vi.fn(),
      };

      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(otp),
      } as any);

      const result = await otpService.verifyOtp(
        email,
        otpCode,
        verificationType
      );

      expect(otp.attempts).toBe(1);
      expect(otp.verified).toBe(true);
      expect(otp.verifiedAt).toBeInstanceOf(Date);
      expect(otp.save).toHaveBeenCalledTimes(2); // Once for incrementing attempts, once for marking verified
      expect(result).toEqual({ success: true });
    });

    it('should query for most recent unverified OTP', async () => {
      const mockSort = vi.fn().mockResolvedValue(null);
      const mockFindOne = vi.fn().mockReturnValue({
        sort: mockSort,
      });
      vi.mocked(Otp.findOne).mockImplementation(mockFindOne as any);

      await expect(
        otpService.verifyOtp(email, otpCode, verificationType)
      ).rejects.toThrow();

      expect(Otp.findOne).toHaveBeenCalledWith({
        email,
        verificationType,
        verified: false,
      });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should handle different verification types', async () => {
      const types: Array<
        'registration' | 'password_reset' | 'email_verification'
      > = ['registration', 'password_reset', 'email_verification'];

      for (const type of types) {
        vi.clearAllMocks();

        const otp = {
          _id: 'otp123',
          email,
          otpCode,
          verificationType: type,
          verified: false,
          attempts: 0,
          maxAttempts: 5,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          verifiedAt: undefined,
          save: vi.fn(),
        };

        vi.mocked(Otp.findOne).mockReturnValue({
          sort: vi.fn().mockResolvedValue(otp),
        } as any);

        const result = await otpService.verifyOtp(email, otpCode, type);

        expect(result).toEqual({ success: true });
        expect(otp.verified).toBe(true);
      }
    });
  });

  describe('resendOtp', () => {
    const email = 'test@example.com';
    const verificationType = 'registration';

    it('should throw error if recent OTP was created less than 1 minute ago', async () => {
      const recentOtp = {
        _id: 'otp123',
        email,
        verificationType,
        createdAt: new Date(Date.now() - 30 * 1000), // 30 seconds ago
      };

      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(recentOtp),
      } as any);

      await expect(
        otpService.resendOtp(email, verificationType)
      ).rejects.toThrow(
        'Please wait at least 1 minute before requesting a new OTP'
      );
    });

    it('should allow resend if last OTP was created more than 1 minute ago', async () => {
      const oldOtp = {
        _id: 'otp123',
        email,
        verificationType,
        createdAt: new Date(Date.now() - 61 * 1000), // 61 seconds ago
      };

      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(oldOtp),
      } as any);
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(Otp.deleteMany).mockResolvedValue({} as any);
      vi.mocked(Otp.create).mockResolvedValue({} as any);
      vi.mocked(emailService.sendOtpEmail).mockResolvedValue();

      const result = await otpService.resendOtp(email, verificationType);

      expect(result).toHaveProperty('otpExpiresAt');
    });

    it('should call createRegistrationOtp for registration type', async () => {
      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(null),
      } as any);
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(Otp.deleteMany).mockResolvedValue({} as any);
      vi.mocked(Otp.create).mockResolvedValue({} as any);
      vi.mocked(emailService.sendOtpEmail).mockResolvedValue();

      await otpService.resendOtp(email, 'registration');

      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(Otp.deleteMany).toHaveBeenCalledWith({
        email,
        verificationType: 'registration',
      });
    });

    it('should call createPasswordResetOtp for password_reset type', async () => {
      const mockUser = {
        _id: 'user123',
        email,
        fullName: 'Test User',
      };

      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(null),
      } as any);
      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(Otp.deleteMany).mockResolvedValue({} as any);
      vi.mocked(Otp.create).mockResolvedValue({} as any);
      vi.mocked(emailService.sendPasswordResetEmail).mockResolvedValue();

      await otpService.resendOtp(email, 'password_reset');

      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(Otp.deleteMany).toHaveBeenCalledWith({
        email,
        verificationType: 'password_reset',
      });
    });

    it('should call createEmailVerificationOtp for email_verification type', async () => {
      const mockUser = {
        _id: 'user123',
        email,
        fullName: 'Test User',
      };

      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(null),
      } as any);
      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(Otp.deleteMany).mockResolvedValue({} as any);
      vi.mocked(Otp.create).mockResolvedValue({} as any);
      vi.mocked(emailService.sendOtpEmail).mockResolvedValue();

      await otpService.resendOtp(email, 'email_verification');

      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(Otp.deleteMany).toHaveBeenCalledWith({
        email,
        verificationType: 'email_verification',
      });
    });

    it('should throw error if user not found for email_verification type', async () => {
      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(null),
      } as any);
      vi.mocked(User.findOne).mockResolvedValue(null);

      await expect(
        otpService.resendOtp(email, 'email_verification')
      ).rejects.toThrow('User not found');
    });
  });

  describe('isOtpVerified', () => {
    const email = 'test@example.com';
    const verificationType = 'registration';

    it('should return false if no verified OTP found', async () => {
      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(null),
      } as any);

      const result = await otpService.isOtpVerified(email, verificationType);

      expect(result).toBe(false);
      expect(Otp.findOne).toHaveBeenCalledWith({
        email,
        verificationType,
        verified: true,
      });
    });

    it('should return false if verification is older than 30 minutes', async () => {
      const oldVerifiedOtp = {
        _id: 'otp123',
        email,
        verificationType,
        verified: true,
        verifiedAt: new Date(Date.now() - 31 * 60 * 1000), // 31 minutes ago
      };

      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(oldVerifiedOtp),
      } as any);

      const result = await otpService.isOtpVerified(email, verificationType);

      expect(result).toBe(false);
    });

    it('should return true if verification is within 30 minutes', async () => {
      const recentVerifiedOtp = {
        _id: 'otp123',
        email,
        verificationType,
        verified: true,
        verifiedAt: new Date(Date.now() - 29 * 60 * 1000), // 29 minutes ago
      };

      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(recentVerifiedOtp),
      } as any);

      const result = await otpService.isOtpVerified(email, verificationType);

      expect(result).toBe(true);
    });

    it('should return true if verification just happened', async () => {
      const justVerifiedOtp = {
        _id: 'otp123',
        email,
        verificationType,
        verified: true,
        verifiedAt: new Date(Date.now() - 1000), // 1 second ago
      };

      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(justVerifiedOtp),
      } as any);

      const result = await otpService.isOtpVerified(email, verificationType);

      expect(result).toBe(true);
    });

    it('should handle missing verifiedAt gracefully', async () => {
      const otpWithoutVerifiedAt = {
        _id: 'otp123',
        email,
        verificationType,
        verified: true,
        verifiedAt: undefined,
      };

      vi.mocked(Otp.findOne).mockReturnValue({
        sort: vi.fn().mockResolvedValue(otpWithoutVerifiedAt),
      } as any);

      const result = await otpService.isOtpVerified(email, verificationType);

      expect(result).toBe(false);
    });

    it('should query for most recent verified OTP', async () => {
      const mockSort = vi.fn().mockResolvedValue(null);
      const mockFindOne = vi.fn().mockReturnValue({
        sort: mockSort,
      });
      vi.mocked(Otp.findOne).mockImplementation(mockFindOne as any);

      await otpService.isOtpVerified(email, verificationType);

      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });
});
