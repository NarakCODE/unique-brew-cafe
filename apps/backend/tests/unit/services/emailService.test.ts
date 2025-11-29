import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as emailService from '../../../src/services/emailService.js';
import * as brevoConfig from '../../../src/config/brevo.js';

// Mock the brevo config module
vi.mock('../../../src/config/brevo.js', async () => {
  const actual = await vi.importActual<
    typeof import('../../../src/config/brevo.js')
  >('../../../src/config/brevo.js');

  return {
    ...actual,
    brevoEmailApi: {
      sendTransacEmail: vi.fn(),
    },
    getDefaultSender: vi.fn(() => ({
      email: 'test@example.com',
      name: 'Test Sender',
    })),
    isBrevoConfigured: vi.fn(),
    SendSmtpEmail: actual.SendSmtpEmail,
  };
});

describe('EmailService', () => {
  // Spy on console methods
  let consoleWarnSpy: any;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('sendOtpEmail', () => {
    const mockParams = {
      email: 'user@example.com',
      otpCode: '123456',
      userName: 'Test User',
    };

    it('should send OTP email when Brevo is configured', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockResolvedValue(
        {} as any
      );

      await emailService.sendOtpEmail(mockParams);

      expect(brevoConfig.brevoEmailApi.sendTransacEmail).toHaveBeenCalledTimes(
        1
      );
      const callArg = vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mock
        .calls[0][0];

      expect(callArg.subject).toBe('Your Verification Code');
      expect(callArg.to).toEqual([
        { email: mockParams.email, name: mockParams.userName },
      ]);
      expect(callArg.htmlContent).toContain(mockParams.otpCode);
      expect(callArg.htmlContent).toContain(mockParams.userName);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `OTP email sent successfully to ${mockParams.email}`
      );
    });

    it('should send OTP email with default name when userName is not provided', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockResolvedValue(
        {} as any
      );

      const paramsWithoutName = {
        email: 'user@example.com',
        otpCode: '123456',
      };

      await emailService.sendOtpEmail(paramsWithoutName);

      const callArg = vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mock
        .calls[0][0];
      expect(callArg.to).toEqual([
        { email: paramsWithoutName.email, name: paramsWithoutName.email },
      ]);
      expect(callArg.htmlContent).toContain('there');
    });

    it('should log warning and console OTP code when Brevo is not configured', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(false);

      await emailService.sendOtpEmail(mockParams);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Brevo not configured. OTP email not sent.'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `[DEV MODE] OTP Code for ${mockParams.email}: ${mockParams.otpCode}`
      );
      expect(brevoConfig.brevoEmailApi.sendTransacEmail).not.toHaveBeenCalled();
    });

    it('should handle errors when sending OTP email fails', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      const mockError = new Error('Network error');
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockRejectedValue(
        mockError
      );

      await emailService.sendOtpEmail(mockParams);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send OTP email:',
        mockError
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `[FALLBACK] OTP Code for ${mockParams.email}: ${mockParams.otpCode}`
      );
    });

    it('should include correct HTML content for OTP email', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockResolvedValue(
        {} as any
      );

      await emailService.sendOtpEmail(mockParams);

      const callArg = vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mock
        .calls[0][0];
      expect(callArg.htmlContent).toContain('<h2>Verification Code</h2>');
      expect(callArg.htmlContent).toContain('<strong>123456</strong>');
      expect(callArg.htmlContent).toContain(
        'This code will expire in 10 minutes.'
      );
      expect(callArg.htmlContent).toContain('Coffee Pickup Team');
    });
  });

  describe('sendWelcomeEmail', () => {
    const mockParams = {
      email: 'newuser@example.com',
      userName: 'New User',
    };

    it('should send welcome email when Brevo is configured', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockResolvedValue(
        {} as any
      );

      await emailService.sendWelcomeEmail(mockParams);

      expect(brevoConfig.brevoEmailApi.sendTransacEmail).toHaveBeenCalledTimes(
        1
      );
      const callArg = vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mock
        .calls[0][0];

      expect(callArg.subject).toBe('Welcome to Coffee Pickup!');
      expect(callArg.to).toEqual([
        { email: mockParams.email, name: mockParams.userName },
      ]);
      expect(callArg.htmlContent).toContain(mockParams.userName);
      expect(callArg.htmlContent).toContain('Welcome to Coffee Pickup!');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Welcome email sent successfully to ${mockParams.email}`
      );
    });

    it('should log warning when Brevo is not configured', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(false);

      await emailService.sendWelcomeEmail(mockParams);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Brevo not configured. Welcome email not sent.'
      );
      expect(brevoConfig.brevoEmailApi.sendTransacEmail).not.toHaveBeenCalled();
    });

    it('should handle errors when sending welcome email fails', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      const mockError = new Error('API timeout');
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockRejectedValue(
        mockError
      );

      await emailService.sendWelcomeEmail(mockParams);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send welcome email:',
        mockError
      );
    });

    it('should include correct HTML content for welcome email', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockResolvedValue(
        {} as any
      );

      await emailService.sendWelcomeEmail(mockParams);

      const callArg = vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mock
        .calls[0][0];
      expect(callArg.htmlContent).toContain(
        '<h2>Welcome to Coffee Pickup!</h2>'
      );
      expect(callArg.htmlContent).toContain(
        'Thank you for registering with Coffee Pickup'
      );
      expect(callArg.htmlContent).toContain(
        'browse our menu, customize your orders, and schedule pickups'
      );
      expect(callArg.htmlContent).toContain('Coffee Pickup Team');
    });

    it('should use getDefaultSender for sender information', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockResolvedValue(
        {} as any
      );

      await emailService.sendWelcomeEmail(mockParams);

      const callArg = vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mock
        .calls[0][0];
      expect(callArg.sender).toEqual({
        email: 'test@example.com',
        name: 'Test Sender',
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    const mockParams = {
      email: 'user@example.com',
      otpCode: '654321',
      userName: 'Test User',
    };

    it('should send password reset email when Brevo is configured', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockResolvedValue(
        {} as any
      );

      await emailService.sendPasswordResetEmail(mockParams);

      expect(brevoConfig.brevoEmailApi.sendTransacEmail).toHaveBeenCalledTimes(
        1
      );
      const callArg = vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mock
        .calls[0][0];

      expect(callArg.subject).toBe('Password Reset Code');
      expect(callArg.to).toEqual([
        { email: mockParams.email, name: mockParams.userName },
      ]);
      expect(callArg.htmlContent).toContain(mockParams.otpCode);
      expect(callArg.htmlContent).toContain(mockParams.userName);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Password reset email sent successfully to ${mockParams.email}`
      );
    });

    it('should send password reset email with default name when userName is not provided', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockResolvedValue(
        {} as any
      );

      const paramsWithoutName = {
        email: 'user@example.com',
        otpCode: '654321',
      };

      await emailService.sendPasswordResetEmail(paramsWithoutName);

      const callArg = vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mock
        .calls[0][0];
      expect(callArg.to).toEqual([
        { email: paramsWithoutName.email, name: paramsWithoutName.email },
      ]);
      expect(callArg.htmlContent).toContain('there');
    });

    it('should log warning and console reset code when Brevo is not configured', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(false);

      await emailService.sendPasswordResetEmail(mockParams);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Brevo not configured. Password reset email not sent.'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `[DEV MODE] Password Reset OTP for ${mockParams.email}: ${mockParams.otpCode}`
      );
      expect(brevoConfig.brevoEmailApi.sendTransacEmail).not.toHaveBeenCalled();
    });

    it('should handle errors when sending password reset email fails', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      const mockError = new Error('Service unavailable');
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockRejectedValue(
        mockError
      );

      await emailService.sendPasswordResetEmail(mockParams);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send password reset email:',
        mockError
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `[FALLBACK] Password Reset OTP for ${mockParams.email}: ${mockParams.otpCode}`
      );
    });

    it('should include correct HTML content for password reset email', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockResolvedValue(
        {} as any
      );

      await emailService.sendPasswordResetEmail(mockParams);

      const callArg = vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mock
        .calls[0][0];
      expect(callArg.htmlContent).toContain('<h2>Password Reset Request</h2>');
      expect(callArg.htmlContent).toContain('<strong>654321</strong>');
      expect(callArg.htmlContent).toContain(
        'This code will expire in 10 minutes.'
      );
      expect(callArg.htmlContent).toContain(
        "If you didn't request this, please ignore this email"
      );
      expect(callArg.htmlContent).toContain('Coffee Pickup Team');
    });

    it('should call getDefaultSender for each email type', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockResolvedValue(
        {} as any
      );

      await emailService.sendPasswordResetEmail(mockParams);

      expect(brevoConfig.getDefaultSender).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple email sends independently', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockResolvedValue(
        {} as any
      );

      await emailService.sendOtpEmail({
        email: 'user1@example.com',
        otpCode: '111111',
        userName: 'User One',
      });

      await emailService.sendWelcomeEmail({
        email: 'user2@example.com',
        userName: 'User Two',
      });

      await emailService.sendPasswordResetEmail({
        email: 'user3@example.com',
        otpCode: '333333',
        userName: 'User Three',
      });

      expect(brevoConfig.brevoEmailApi.sendTransacEmail).toHaveBeenCalledTimes(
        3
      );
    });

    it('should continue execution even if email sending fails', async () => {
      vi.mocked(brevoConfig.isBrevoConfigured).mockReturnValue(true);
      vi.mocked(brevoConfig.brevoEmailApi.sendTransacEmail).mockRejectedValue(
        new Error('Failed')
      );

      // Should not throw
      await expect(
        emailService.sendOtpEmail({
          email: 'user@example.com',
          otpCode: '123456',
        })
      ).resolves.not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
