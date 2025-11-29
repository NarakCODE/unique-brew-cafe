import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService } from '../../../src/services/userService.js';
import { User } from '../../../src/models/User.js';
import mongoose from 'mongoose';

// Mock dependencies
vi.mock('../../../src/models/User.js');
vi.mock('../../../src/utils/validators.js', () => ({
  validateEmail: vi.fn((email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ),
  validatePhoneNumber: vi.fn((phone: string) =>
    /^\+?[1-9]\d{6,14}$/.test(phone)
  ),
  sanitizeString: vi.fn((str: string) => str.trim()),
}));

const createObjectId = () => new mongoose.Types.ObjectId().toString();

const createMockUser = (overrides = {}) => ({
  _id: createObjectId(),
  fullName: 'John Doe',
  email: 'john@example.com',
  phoneNumber: '+1234567890',
  status: 'active',
  role: 'user',
  emailVerified: true,
  phoneVerified: false,
  loyaltyPoints: 100,
  loyaltyTier: 'bronze',
  referralCode: 'REF123ABC',
  totalOrders: 5,
  totalSpent: 150,
  preferences: {
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    language: 'en',
    currency: 'USD',
  },
  save: vi.fn().mockResolvedValue(true),
  comparePassword: vi.fn().mockResolvedValue(true),
  ...overrides,
});

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      const userId = createObjectId();
      const mockUser = createMockUser({ _id: userId });

      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await userService.getUserProfile(userId);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result.fullName).toBe('John Doe');
    });

    it('should throw NotFoundError if user not found', async () => {
      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(
        userService.getUserProfile(createObjectId())
      ).rejects.toThrow('User not found');
    });

    it('should throw NotFoundError if user is deleted', async () => {
      const mockUser = createMockUser({ status: 'deleted' });

      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);

      await expect(
        userService.getUserProfile(createObjectId())
      ).rejects.toThrow('User account has been deleted');
    });

    it('should throw UnauthorizedError if user is suspended', async () => {
      const mockUser = createMockUser({ status: 'suspended' });

      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);

      await expect(
        userService.getUserProfile(createObjectId())
      ).rejects.toThrow('User account has been suspended');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile with valid data', async () => {
      const userId = createObjectId();
      const mockUser = createMockUser({ _id: userId });

      vi.mocked(User.findById).mockResolvedValue(mockUser as any);
      vi.mocked(User.findOne).mockResolvedValue(null);

      const result = await userService.updateProfile(userId, {
        fullName: 'Jane Doe',
      });

      expect(mockUser.save).toHaveBeenCalled();
      expect(result.fullName).toBe('Jane Doe');
    });

    it('should throw BadRequestError for invalid email format', async () => {
      const userId = createObjectId();

      await expect(
        userService.updateProfile(userId, { email: 'invalid-email' })
      ).rejects.toThrow('Invalid email format');
    });

    it('should throw BadRequestError for invalid phone format', async () => {
      const userId = createObjectId();

      await expect(
        userService.updateProfile(userId, { phoneNumber: '123' })
      ).rejects.toThrow('Invalid phone number format');
    });

    it('should throw BadRequestError if email already in use', async () => {
      const userId = createObjectId();
      const mockUser = createMockUser({ _id: userId });

      vi.mocked(User.findById).mockResolvedValue(mockUser as any);
      vi.mocked(User.findOne).mockResolvedValue({
        _id: createObjectId(),
      } as any);

      await expect(
        userService.updateProfile(userId, { email: 'taken@example.com' })
      ).rejects.toThrow('Email is already in use');
    });

    it('should throw NotFoundError if user not found', async () => {
      vi.mocked(User.findById).mockResolvedValue(null);

      await expect(
        userService.updateProfile(createObjectId(), { fullName: 'Test' })
      ).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedError if account is not active', async () => {
      const mockUser = createMockUser({ status: 'suspended' });

      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      await expect(
        userService.updateProfile(createObjectId(), { fullName: 'Test' })
      ).rejects.toThrow('Cannot update inactive account');
    });

    it('should validate full name length', async () => {
      await expect(
        userService.updateProfile(createObjectId(), { fullName: 'A' })
      ).rejects.toThrow('Full name must be at least 2 characters long');
    });
  });

  describe('updateProfileImage', () => {
    it('should update profile image', async () => {
      const userId = createObjectId();
      const mockUser = createMockUser({ _id: userId });

      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      const result = await userService.updateProfileImage(
        userId,
        'new-image.jpg'
      );

      expect(mockUser.save).toHaveBeenCalled();
      expect(result.profileImage).toBe('new-image.jpg');
    });

    it('should throw NotFoundError if user not found', async () => {
      vi.mocked(User.findById).mockResolvedValue(null);

      await expect(
        userService.updateProfileImage(createObjectId(), 'image.jpg')
      ).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedError if account is not active', async () => {
      const mockUser = createMockUser({ status: 'suspended' });

      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      await expect(
        userService.updateProfileImage(createObjectId(), 'image.jpg')
      ).rejects.toThrow('Cannot update inactive account');
    });
  });

  describe('updatePassword', () => {
    it('should update password with valid current password', async () => {
      const userId = createObjectId();
      const mockUser = createMockUser({ _id: userId });

      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await userService.updatePassword(
        userId,
        'currentPassword',
        'newPassword123'
      );

      expect(mockUser.comparePassword).toHaveBeenCalledWith('currentPassword');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toBe('Password updated successfully');
    });

    it('should throw UnauthorizedError for incorrect current password', async () => {
      const mockUser = createMockUser({
        comparePassword: vi.fn().mockResolvedValue(false),
      });

      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);

      await expect(
        userService.updatePassword(
          createObjectId(),
          'wrongPassword',
          'newPassword'
        )
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should throw BadRequestError for short new password', async () => {
      const mockUser = createMockUser();

      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);

      await expect(
        userService.updatePassword(createObjectId(), 'currentPassword', '12345')
      ).rejects.toThrow('New password must be at least 6 characters long');
    });

    it('should throw NotFoundError if user not found', async () => {
      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(
        userService.updatePassword(createObjectId(), 'current', 'newPassword')
      ).rejects.toThrow('User not found');
    });
  });

  describe('updateSettings', () => {
    it('should update user settings', async () => {
      const userId = createObjectId();
      const mockUser = createMockUser({ _id: userId });

      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      const result = await userService.updateSettings(userId, {
        notificationsEnabled: false,
        language: 'km',
        currency: 'KHR',
      });

      expect(mockUser.save).toHaveBeenCalled();
      expect(result.preferences.notificationsEnabled).toBe(false);
      expect(result.preferences.language).toBe('km');
      expect(result.preferences.currency).toBe('KHR');
    });

    it('should throw NotFoundError if user not found', async () => {
      vi.mocked(User.findById).mockResolvedValue(null);

      await expect(
        userService.updateSettings(createObjectId(), { language: 'en' })
      ).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedError if account is not active', async () => {
      const mockUser = createMockUser({ status: 'suspended' });

      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      await expect(
        userService.updateSettings(createObjectId(), { language: 'en' })
      ).rejects.toThrow('Cannot update inactive account');
    });
  });

  describe('getReferralStats', () => {
    it('should return referral statistics', async () => {
      const userId = createObjectId();
      const mockUser = createMockUser({
        _id: userId,
        referralCode: 'REF123ABC',
      });

      vi.mocked(User.findById).mockResolvedValue(mockUser as any);
      vi.mocked(User.countDocuments).mockResolvedValue(5);

      const result = await userService.getReferralStats(userId);

      expect(result.referralCode).toBe('REF123ABC');
      expect(result.totalReferrals).toBe(5);
      expect(result.pointsEarned).toBe(500); // 5 * 100
    });

    it('should throw NotFoundError if user not found', async () => {
      vi.mocked(User.findById).mockResolvedValue(null);

      await expect(
        userService.getReferralStats(createObjectId())
      ).rejects.toThrow('User not found');
    });
  });

  describe('deleteAccount', () => {
    it('should anonymize and delete user account', async () => {
      const userId = createObjectId();
      const mockUser = createMockUser({ _id: userId });

      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await userService.deleteAccount(
        userId,
        'password123',
        'No longer needed'
      );

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.status).toBe('deleted');
      expect(result.message).toBe('Account deleted successfully');
      expect(result.reason).toBe('No longer needed');
    });

    it('should throw UnauthorizedError for incorrect password', async () => {
      const mockUser = createMockUser({
        comparePassword: vi.fn().mockResolvedValue(false),
      });

      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);

      await expect(
        userService.deleteAccount(createObjectId(), 'wrongPassword')
      ).rejects.toThrow('Password is incorrect');
    });

    it('should throw NotFoundError if user not found', async () => {
      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(
        userService.deleteAccount(createObjectId(), 'password')
      ).rejects.toThrow('User not found');
    });
  });

  describe('getAllUsersWithPagination', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        createMockUser({ fullName: 'User 1' }),
        createMockUser({ fullName: 'User 2' }),
      ];

      vi.mocked(User.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockUsers),
      } as any);

      vi.mocked(User.countDocuments).mockResolvedValue(2);

      const result = await userService.getAllUsersWithPagination({
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter users by status', async () => {
      vi.mocked(User.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(User.countDocuments).mockResolvedValue(0);

      await userService.getAllUsersWithPagination({}, { status: 'active' });

      expect(User.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' })
      );
    });

    it('should filter users by role', async () => {
      vi.mocked(User.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(User.countDocuments).mockResolvedValue(0);

      await userService.getAllUsersWithPagination({}, { role: 'admin' });

      expect(User.find).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin' })
      );
    });

    it('should search users by name or email', async () => {
      vi.mocked(User.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(User.countDocuments).mockResolvedValue(0);

      await userService.getAllUsersWithPagination({}, { search: 'john' });

      expect(User.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
        })
      );
    });
  });

  describe('getUserByIdAdmin', () => {
    it('should return user by ID for admin', async () => {
      const userId = createObjectId();
      const mockUser = createMockUser({ _id: userId });

      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await userService.getUserByIdAdmin(userId);

      expect(result.fullName).toBe('John Doe');
    });

    it('should throw NotFoundError if user not found', async () => {
      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(
        userService.getUserByIdAdmin(createObjectId())
      ).rejects.toThrow('User not found');
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status to suspended', async () => {
      const userId = createObjectId();
      const mockUser = createMockUser({ _id: userId, status: 'active' });

      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      const result = await userService.updateUserStatus(userId, 'suspended');

      expect(mockUser.save).toHaveBeenCalled();
      expect(result.status).toBe('suspended');
    });

    it('should update user status to active', async () => {
      const userId = createObjectId();
      const mockUser = createMockUser({ _id: userId, status: 'suspended' });

      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      const result = await userService.updateUserStatus(userId, 'active');

      expect(mockUser.save).toHaveBeenCalled();
      expect(result.status).toBe('active');
    });

    it('should throw NotFoundError if user not found', async () => {
      vi.mocked(User.findById).mockResolvedValue(null);

      await expect(
        userService.updateUserStatus(createObjectId(), 'suspended')
      ).rejects.toThrow('User not found');
    });

    it('should throw BadRequestError if user is deleted', async () => {
      const mockUser = createMockUser({ status: 'deleted' });

      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      await expect(
        userService.updateUserStatus(createObjectId(), 'active')
      ).rejects.toThrow('Cannot modify deleted user account');
    });
  });

  describe('Legacy methods', () => {
    describe('getAllUsers', () => {
      it('should return all active users', async () => {
        const mockUsers = [createMockUser(), createMockUser()];

        vi.mocked(User.find).mockReturnValue({
          select: vi.fn().mockResolvedValue(mockUsers),
        } as any);

        const result = await userService.getAllUsers();

        expect(User.find).toHaveBeenCalledWith({ status: 'active' });
        expect(result).toHaveLength(2);
      });
    });

    describe('getUserById', () => {
      it('should return user by ID', async () => {
        const userId = createObjectId();
        const mockUser = createMockUser({ _id: userId });

        vi.mocked(User.findById).mockReturnValue({
          select: vi.fn().mockResolvedValue(mockUser),
        } as any);

        const result = await userService.getUserById(userId);

        expect(result?.fullName).toBe('John Doe');
      });
    });

    describe('getUserByEmail', () => {
      it('should return user by email', async () => {
        const mockUser = createMockUser();

        vi.mocked(User.findOne).mockResolvedValue(mockUser as any);

        const result = await userService.getUserByEmail('john@example.com');

        expect(User.findOne).toHaveBeenCalledWith({
          email: 'john@example.com',
        });
        expect(result?.email).toBe('john@example.com');
      });
    });

    describe('createUser', () => {
      it('should create a new user', async () => {
        const userData = {
          fullName: 'New User',
          email: 'new@example.com',
          password: 'password123',
        };

        vi.mocked(User.findOne).mockResolvedValue(null);
        vi.mocked(User.create).mockResolvedValue({
          _id: createObjectId(),
          ...userData,
        } as any);

        const result = await userService.createUser(userData);

        expect(User.create).toHaveBeenCalledWith(userData);
        expect(result.fullName).toBe('New User');
      });

      it('should throw BadRequestError if user already exists', async () => {
        vi.mocked(User.findOne).mockResolvedValue(createMockUser() as any);

        await expect(
          userService.createUser({
            fullName: 'Test',
            email: 'existing@example.com',
            password: 'password',
          })
        ).rejects.toThrow('User already exists');
      });
    });

    describe('updateUser', () => {
      it('should update user', async () => {
        const userId = createObjectId();
        const mockUser = createMockUser({
          _id: userId,
          fullName: 'Updated Name',
        });

        vi.mocked(User.findByIdAndUpdate).mockReturnValue({
          select: vi.fn().mockResolvedValue(mockUser),
        } as any);

        const result = await userService.updateUser(userId, {
          fullName: 'Updated Name',
        });

        expect(result?.fullName).toBe('Updated Name');
      });

      it('should throw NotFoundError if user not found', async () => {
        vi.mocked(User.findByIdAndUpdate).mockReturnValue({
          select: vi.fn().mockResolvedValue(null),
        } as any);

        await expect(
          userService.updateUser(createObjectId(), { fullName: 'Test' })
        ).rejects.toThrow('User not found');
      });
    });

    describe('deleteUser', () => {
      it('should delete user', async () => {
        const userId = createObjectId();
        const mockUser = createMockUser({ _id: userId });

        vi.mocked(User.findByIdAndDelete).mockResolvedValue(mockUser as any);

        const result = await userService.deleteUser(userId);

        expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
        expect(result?.fullName).toBe('John Doe');
      });

      it('should throw NotFoundError if user not found', async () => {
        vi.mocked(User.findByIdAndDelete).mockResolvedValue(null);

        await expect(userService.deleteUser(createObjectId())).rejects.toThrow(
          'User not found'
        );
      });
    });
  });
});
