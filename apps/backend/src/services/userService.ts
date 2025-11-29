import { User, type IUser } from '../models/User.js';
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from '../utils/AppError.js';
import {
  parsePaginationParams,
  buildPaginationResult,
  type PaginationParams,
  type PaginationResult,
} from '../utils/pagination.js';

interface UpdateProfileData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
}

interface UpdateSettingsData {
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  language?: 'en' | 'km';
  currency?: 'USD' | 'KHR';
}

import {
  validateEmail,
  validatePhoneNumber,
  sanitizeString,
} from '../utils/validators.js';

export class UserService {
  /**
   * Get user profile by ID
   * Requirements: 3.1
   */
  async getUserProfile(userId: string) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status === 'deleted') {
      throw new NotFoundError('User account has been deleted');
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedError('User account has been suspended');
    }

    return user;
  }

  /**
   * Update user profile information
   * Requirements: 3.2, 18.5
   *
   * @param userId - The ID of the user to update
   * @param profileData - Profile data to update
   * @returns Updated user object
   * @throws {NotFoundError} If user not found
   * @throws {UnauthorizedError} If account is not active
   * @throws {BadRequestError} If validation fails or email/phone already exists
   */
  async updateProfile(userId: string, profileData: UpdateProfileData) {
    // Validate and sanitize inputs before database operations
    const validationErrors: string[] = [];
    const sanitizedData: UpdateProfileData = {};

    // Validate and sanitize email
    if (profileData.email !== undefined) {
      const sanitizedEmail = sanitizeString(profileData.email.toLowerCase());
      if (!validateEmail(sanitizedEmail)) {
        validationErrors.push('Invalid email format');
      } else {
        sanitizedData.email = sanitizedEmail;
      }
    }

    // Validate and sanitize phone number
    if (profileData.phoneNumber !== undefined) {
      const sanitizedPhone = sanitizeString(profileData.phoneNumber);
      if (!validatePhoneNumber(sanitizedPhone)) {
        validationErrors.push(
          'Invalid phone number format. Use international format (e.g., +1234567890)'
        );
      } else {
        sanitizedData.phoneNumber = sanitizedPhone;
      }
    }

    // Sanitize full name
    if (profileData.fullName !== undefined) {
      const sanitizedName = sanitizeString(profileData.fullName);
      if (sanitizedName.length < 2) {
        validationErrors.push('Full name must be at least 2 characters long');
      } else if (sanitizedName.length > 100) {
        validationErrors.push('Full name must not exceed 100 characters');
      } else {
        sanitizedData.fullName = sanitizedName;
      }
    }

    // Validate date of birth
    if (profileData.dateOfBirth !== undefined) {
      const dob = new Date(profileData.dateOfBirth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();

      if (isNaN(dob.getTime())) {
        validationErrors.push('Invalid date of birth');
      } else if (dob > now) {
        validationErrors.push('Date of birth cannot be in the future');
      } else if (age < 13) {
        validationErrors.push('You must be at least 13 years old');
      } else if (age > 120) {
        validationErrors.push('Invalid date of birth');
      } else {
        sanitizedData.dateOfBirth = dob;
      }
    }

    // Validate gender
    if (profileData.gender !== undefined) {
      if (!['male', 'female', 'other'].includes(profileData.gender)) {
        validationErrors.push('Invalid gender value');
      } else {
        sanitizedData.gender = profileData.gender;
      }
    }

    // Throw all validation errors at once
    if (validationErrors.length > 0) {
      throw new BadRequestError(validationErrors.join('; '));
    }

    // Fetch user from database
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Cannot update inactive account');
    }

    // Check if email is already taken by another user
    if (sanitizedData.email && sanitizedData.email !== user.email) {
      const existingUser = await User.findOne({
        email: sanitizedData.email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new BadRequestError('Email is already in use');
      }
      user.email = sanitizedData.email;
    }

    // Check if phone number is already taken by another user
    if (
      sanitizedData.phoneNumber &&
      sanitizedData.phoneNumber !== user.phoneNumber
    ) {
      const existingUser = await User.findOne({
        phoneNumber: sanitizedData.phoneNumber,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new BadRequestError('Phone number is already in use');
      }
      user.phoneNumber = sanitizedData.phoneNumber;
    }

    // Update allowed fields
    if (sanitizedData.fullName !== undefined) {
      user.fullName = sanitizedData.fullName;
    }
    if (sanitizedData.dateOfBirth !== undefined) {
      user.dateOfBirth = sanitizedData.dateOfBirth;
    }
    if (sanitizedData.gender !== undefined) {
      user.gender = sanitizedData.gender;
    }

    await user.save();

    return user;
  }

  /**
   * Update profile image
   * Requirements: 3.2
   */
  async updateProfileImage(userId: string, imageUrl: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Cannot update inactive account');
    }

    user.profileImage = imageUrl;
    await user.save();

    return { profileImage: user.profileImage };
  }

  /**
   * Upload avatar and update profile
   * Requirements: 18.3
   */
  async uploadAvatar(userId: string, filePath: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Cannot update inactive account');
    }

    // In a real application, you would upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll store the file path
    user.profileImage = filePath;
    await user.save();

    return { profileImage: user.profileImage };
  }

  /**
   * Update user password
   * Requirements: 3.4
   */
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    // Fetch user with password field
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Cannot update inactive account');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new BadRequestError(
        'New password must be at least 6 characters long'
      );
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  /**
   * Update user preferences/settings
   * Requirements: 3.5
   */
  async updateSettings(userId: string, settingsData: UpdateSettingsData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Cannot update inactive account');
    }

    // Update preferences
    if (settingsData.notificationsEnabled !== undefined) {
      user.preferences.notificationsEnabled = settingsData.notificationsEnabled;
    }
    if (settingsData.emailNotifications !== undefined) {
      user.preferences.emailNotifications = settingsData.emailNotifications;
    }
    if (settingsData.smsNotifications !== undefined) {
      user.preferences.smsNotifications = settingsData.smsNotifications;
    }
    if (settingsData.pushNotifications !== undefined) {
      user.preferences.pushNotifications = settingsData.pushNotifications;
    }
    if (settingsData.language !== undefined) {
      user.preferences.language = settingsData.language;
    }
    if (settingsData.currency !== undefined) {
      user.preferences.currency = settingsData.currency;
    }

    await user.save();

    return user;
  }

  /**
   * Get user referral statistics
   * Requirements: 3.6
   */
  async getReferralStats(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Count users referred by this user
    const totalReferrals = await User.countDocuments({
      referredBy: user.referralCode,
    });

    // Calculate points earned from referrals (assuming 100 points per referral)
    const pointsEarned = totalReferrals * 100;

    return {
      referralCode: user.referralCode,
      totalReferrals,
      pointsEarned,
    };
  }

  /**
   * Delete user account with anonymization
   * Requirements: 18.4
   */
  async deleteAccount(userId: string, password: string, reason?: string) {
    // Fetch user with password field
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Password is incorrect');
    }

    // Anonymize user data
    const timestamp = Date.now();
    user.fullName = `Deleted User ${timestamp}`;
    user.email = `deleted_${timestamp}@deleted.local`;
    delete user.phoneNumber;
    delete user.profileImage;
    delete user.dateOfBirth;
    delete user.gender;

    // Clear preferences
    user.preferences = {
      notificationsEnabled: false,
      emailNotifications: false,
      smsNotifications: false,
      pushNotifications: false,
      language: 'en',
      currency: 'USD',
    };

    // Mark as deleted
    user.status = 'deleted';
    user.deletedAt = new Date();

    await user.save();

    return { message: 'Account deleted successfully', reason };
  }

  /**
   * Get all users with pagination (Admin only)
   * Requirements: 19.1
   */
  async getAllUsersWithPagination(
    paginationParams: PaginationParams,
    filters?: { status?: string; role?: string; search?: string }
  ): Promise<PaginationResult<IUser>> {
    const query: Record<string, unknown> = {};

    // Apply filters
    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.role) {
      query.role = filters.role;
    }

    // Search by name or email
    if (filters?.search) {
      query.$or = [
        { fullName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Parse pagination parameters
    const { page, limit, skip, sortBy, sortOrder } =
      parsePaginationParams(paginationParams);

    // Build sort object
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    // Execute query with pagination and projection
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password') // Exclude sensitive fields
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return buildPaginationResult(
      users as unknown as IUser[],
      total,
      page,
      limit
    );
  }

  /**
   * Get user by ID (Admin only)
   * Requirements: 19.2
   */
  async getUserByIdAdmin(userId: string) {
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Get user order history (Admin only)
   * Requirements: 19.3
   */
  async getUserOrders(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Import Order model dynamically to avoid circular dependency
    const { Order } = await import('../models/Order.js');

    const orders = await Order.find({ userId })
      .populate('storeId', 'name address city')
      .sort({ createdAt: -1 })
      .lean();

    return orders;
  }

  /**
   * Update user status (Admin only)
   * Requirements: 19.4
   */
  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended'
  ): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status === 'deleted') {
      throw new BadRequestError('Cannot modify deleted user account');
    }

    user.status = status;
    await user.save();

    return user;
  }

  // Legacy methods for backward compatibility
  async getAllUsers() {
    return await User.find({ status: 'active' }).select('-password');
  }

  async getUserById(id: string) {
    return await User.findById(id).select('-password');
  }

  async getUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  async createUser(userData: {
    fullName: string;
    email: string;
    password: string;
  }) {
    const userExists = await this.getUserByEmail(userData.email);

    if (userExists) {
      throw new BadRequestError('User already exists');
    }

    const user = await User.create(userData);
    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    };
  }

  async updateUser(id: string, userData: Partial<IUser>) {
    const user = await User.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async deleteUser(id: string) {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}

export const userService = new UserService();
