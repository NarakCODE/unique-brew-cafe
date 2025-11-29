import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Otp } from '../../../src/models/Otp.js';

describe('Otp Model', () => {
  beforeEach(async () => {
    // Clear the collection before each test
    await Otp.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create OTP with valid data', async () => {
      const otpData = {
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const otp = await Otp.create(otpData);

      expect(otp).toBeDefined();
      expect(otp.email).toBe(otpData.email);
      expect(otp.otpCode).toBe(otpData.otpCode);
      expect(otp.verificationType).toBe(otpData.verificationType);
      expect(otp.expiresAt).toEqual(otpData.expiresAt);
    });

    it('should require email field', async () => {
      const otpData = {
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      await expect(Otp.create(otpData)).rejects.toThrow();
    });

    it('should require otpCode field', async () => {
      const otpData = {
        email: 'test@example.com',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      await expect(Otp.create(otpData)).rejects.toThrow();
    });

    it('should require verificationType field', async () => {
      const otpData = {
        email: 'test@example.com',
        otpCode: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      await expect(Otp.create(otpData)).rejects.toThrow();
    });

    it('should require expiresAt field', async () => {
      const otpData = {
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
      };

      await expect(Otp.create(otpData)).rejects.toThrow();
    });

    it('should only accept valid verification types', async () => {
      const validTypes: Array<
        'registration' | 'password_reset' | 'email_verification'
      > = ['registration', 'password_reset', 'email_verification'];

      for (const type of validTypes) {
        const otpData = {
          email: 'test@example.com',
          otpCode: '123456',
          verificationType: type,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        };

        const otp = await Otp.create(otpData);
        expect(otp.verificationType).toBe(type);
        await Otp.deleteOne({ _id: otp._id });
      }
    });

    it('should reject invalid verification type', async () => {
      const otpData = {
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'invalid_type',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      await expect(Otp.create(otpData)).rejects.toThrow();
    });

    it('should normalize email to lowercase', async () => {
      const otpData = {
        email: 'Test@Example.COM',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const otp = await Otp.create(otpData);
      expect(otp.email).toBe('test@example.com');
    });

    it('should trim email whitespace', async () => {
      const otpData = {
        email: '  test@example.com  ',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const otp = await Otp.create(otpData);
      expect(otp.email).toBe('test@example.com');
    });
  });

  describe('Default Values', () => {
    it('should set verified to false by default', async () => {
      const otpData = {
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const otp = await Otp.create(otpData);
      expect(otp.verified).toBe(false);
    });

    it('should set attempts to 0 by default', async () => {
      const otpData = {
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const otp = await Otp.create(otpData);
      expect(otp.attempts).toBe(0);
    });

    it('should set maxAttempts to 5 by default', async () => {
      const otpData = {
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const otp = await Otp.create(otpData);
      expect(otp.maxAttempts).toBe(5);
    });
  });

  describe('Optional Fields', () => {
    it('should accept userId when provided', async () => {
      const userId = new mongoose.Types.ObjectId();
      const otpData = {
        userId,
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'password_reset',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const otp = await Otp.create(otpData);
      expect(otp.userId).toEqual(userId);
    });

    it('should work without userId', async () => {
      const otpData = {
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const otp = await Otp.create(otpData);
      expect(otp.userId).toBeUndefined();
    });

    it('should accept verifiedAt when provided', async () => {
      const verificationDate = new Date();
      const otpData = {
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: true,
        verifiedAt: verificationDate,
      };

      const otp = await Otp.create(otpData);
      expect(otp.verifiedAt).toEqual(verificationDate);
    });

    it('should work without verifiedAt', async () => {
      const otpData = {
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const otp = await Otp.create(otpData);
      expect(otp.verifiedAt).toBeUndefined();
    });
  });

  describe('Timestamps', () => {
    it('should auto-generate createdAt timestamp', async () => {
      const beforeCreate = new Date();
      const otpData = {
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const otp = await Otp.create(otpData);
      const afterCreate = new Date();

      expect(otp.createdAt).toBeDefined();
      expect(otp.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(otp.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });
  });

  describe('Verification Workflow', () => {
    it('should update attempts and keep OTP unverified on failed attempt', async () => {
      const otp = await Otp.create({
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      otp.attempts += 1;
      await otp.save();

      const updatedOtp = await Otp.findById(otp._id);
      expect(updatedOtp?.attempts).toBe(1);
      expect(updatedOtp?.verified).toBe(false);
    });

    it('should mark OTP as verified with verifiedAt timestamp', async () => {
      const otp = await Otp.create({
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const verificationTime = new Date();
      otp.verified = true;
      otp.verifiedAt = verificationTime;
      await otp.save();

      const updatedOtp = await Otp.findById(otp._id);
      expect(updatedOtp?.verified).toBe(true);
      expect(updatedOtp?.verifiedAt).toEqual(verificationTime);
    });
  });

  describe('Query Operations', () => {
    it('should find OTP by email and verification type', async () => {
      const email = 'test@example.com';
      const verificationType = 'registration';

      await Otp.create({
        email,
        otpCode: '123456',
        verificationType,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const found = await Otp.findOne({ email, verificationType });
      expect(found).toBeDefined();
      expect(found?.email).toBe(email);
      expect(found?.verificationType).toBe(verificationType);
    });

    it('should find most recent OTP when multiple exist', async () => {
      const email = 'test@example.com';
      const verificationType = 'registration';

      // Create first OTP
      await Otp.create({
        email,
        otpCode: '111111',
        verificationType,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Create second OTP
      const secondOtp = await Otp.create({
        email,
        otpCode: '222222',
        verificationType,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const found = await Otp.findOne({ email, verificationType }).sort({
        createdAt: -1,
      });

      expect(found?.otpCode).toBe('222222');
      expect((found?._id as mongoose.Types.ObjectId).toString()).toBe(
        (secondOtp._id as mongoose.Types.ObjectId).toString()
      );
    });

    it('should filter by verified status', async () => {
      const email = 'test@example.com';

      await Otp.create({
        email,
        otpCode: '123456',
        verificationType: 'registration',
        verified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      await Otp.create({
        email,
        otpCode: '654321',
        verificationType: 'password_reset',
        verified: true,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const unverified = await Otp.find({ email, verified: false });
      const verified = await Otp.find({ email, verified: true });

      expect(unverified).toHaveLength(1);
      expect(verified).toHaveLength(1);
      expect(unverified[0].otpCode).toBe('123456');
      expect(verified[0].otpCode).toBe('654321');
    });

    it('should delete multiple OTPs by email and type', async () => {
      const email = 'test@example.com';
      const verificationType = 'registration';

      await Otp.create({
        email,
        otpCode: '111111',
        verificationType,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      await Otp.create({
        email,
        otpCode: '222222',
        verificationType,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      await Otp.deleteMany({ email, verificationType });

      const remaining = await Otp.find({ email, verificationType });
      expect(remaining).toHaveLength(0);
    });
  });

  describe('Indexes', () => {
    it('should have compound index on email and verificationType', async () => {
      const indexes = await Otp.collection.getIndexes();
      const compoundIndex = Object.keys(indexes).find(
        (key) => key.includes('email') && key.includes('verificationType')
      );
      expect(compoundIndex).toBeDefined();
    });

    it('should have TTL index on expiresAt', async () => {
      const indexes = await Otp.collection.getIndexes();
      const ttlIndex = Object.keys(indexes).find((key) =>
        key.includes('expiresAt')
      );
      expect(ttlIndex).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle expired OTP dates', async () => {
      const expiredDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      const otp = await Otp.create({
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: expiredDate,
      });

      expect(otp.expiresAt.getTime()).toBeLessThan(Date.now());
    });

    it('should handle maximum attempts reached', async () => {
      const otp = await Otp.create({
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 5,
        maxAttempts: 5,
      });

      expect(otp.attempts).toBe(otp.maxAttempts);
    });

    it('should allow custom maxAttempts value', async () => {
      const customMax = 10;
      const otp = await Otp.create({
        email: 'test@example.com',
        otpCode: '123456',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        maxAttempts: customMax,
      });

      expect(otp.maxAttempts).toBe(customMax);
    });

    it('should handle multiple verification types for same email', async () => {
      const email = 'test@example.com';

      await Otp.create({
        email,
        otpCode: '111111',
        verificationType: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      await Otp.create({
        email,
        otpCode: '222222',
        verificationType: 'password_reset',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      await Otp.create({
        email,
        otpCode: '333333',
        verificationType: 'email_verification',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const allOtps = await Otp.find({ email });
      expect(allOtps).toHaveLength(3);

      const types = allOtps.map((otp) => otp.verificationType);
      expect(types).toContain('registration');
      expect(types).toContain('password_reset');
      expect(types).toContain('email_verification');
    });
  });
});
