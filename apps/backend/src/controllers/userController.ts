import type { Request, Response } from 'express';
import { userService } from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';

/**
 * Get authenticated user's profile
 * Requirements: 3.1
 * GET /api/profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const user = await userService.getUserProfile(userId);

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Update authenticated user's profile
 * Requirements: 3.2, 18.5
 * PUT /api/profile
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const { fullName, email, phoneNumber, dateOfBirth, gender } = req.body;

    const user = await userService.updateProfile(userId, {
      fullName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
    });

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  }
);

/**
 * Upload profile image
 * Requirements: 3.2
 * POST /api/profile/image
 */
export const uploadProfileImage = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      throw new BadRequestError('Image URL is required');
    }

    const result = await userService.updateProfileImage(userId, imageUrl);

    res.json({
      success: true,
      data: result,
      message: 'Profile image updated successfully',
    });
  }
);

/**
 * Upload avatar file
 * Requirements: 18.3
 * PATCH /api/users/me/avatar
 */
export const uploadAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId as string;

    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    // Get the file path
    const filePath = `/uploads/avatars/${req.file.filename}`;

    const result = await userService.uploadAvatar(userId, filePath);

    res.json({
      success: true,
      data: result,
      message: 'Avatar uploaded successfully',
    });
  }
);

/**
 * Update user password
 * Requirements: 3.4
 * PUT /api/profile/password
 */
export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new BadRequestError(
        'Current password and new password are required'
      );
    }

    const result = await userService.updatePassword(
      userId,
      currentPassword,
      newPassword
    );

    res.json({
      success: true,
      message: result.message,
    });
  }
);

/**
 * Update user settings/preferences
 * Requirements: 3.5
 * PUT /api/profile/settings
 */
export const updateSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const {
      notificationsEnabled,
      emailNotifications,
      smsNotifications,
      pushNotifications,
      language,
      currency,
    } = req.body;

    const user = await userService.updateSettings(userId, {
      notificationsEnabled,
      emailNotifications,
      smsNotifications,
      pushNotifications,
      language,
      currency,
    });

    res.json({
      success: true,
      data: user,
      message: 'Settings updated successfully',
    });
  }
);

/**
 * Get referral statistics
 * Requirements: 3.6
 * GET /api/profile/referral
 */
export const getReferralStats = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const stats = await userService.getReferralStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  }
);

/**
 * Delete user account with anonymization
 * Requirements: 18.4
 * DELETE /api/users/me
 */
export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const { password, reason } = req.body;

    if (!password) {
      throw new BadRequestError('Password is required to delete account');
    }

    const result = await userService.deleteAccount(userId, password, reason);

    res.json({
      success: true,
      message: result.message,
    });
  }
);

/**
 * Get all users with pagination (Admin only)
 * Requirements: 19.1
 * GET /api/users
 */
export const getAllUsersAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const status = req.query.status as string;
    const role = req.query.role as string;
    const search = req.query.search as string;

    const filters: { status?: string; role?: string; search?: string } = {};
    if (status) filters.status = status;
    if (role) filters.role = role;
    if (search) filters.search = search;

    // Parse pagination params
    const paginationParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await userService.getAllUsersWithPagination(
      paginationParams,
      filters
    );

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

/**
 * Get user details by ID (Admin only)
 * Requirements: 19.2
 * GET /api/users/:userId
 */
export const getUserByIdAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId as string;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const user = await userService.getUserByIdAdmin(userId);

    res.json({
      success: true,
      data: user,
    });
  }
);

/**
 * Get user order history (Admin only)
 * Requirements: 19.3
 * GET /api/users/:userId/orders
 */
export const getUserOrdersAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId as string;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const orders = await userService.getUserOrders(userId);

    res.json({
      success: true,
      data: orders,
    });
  }
);

/**
 * Update user status (Admin only)
 * Requirements: 19.4
 * PATCH /api/users/:userId/status
 */
export const updateUserStatusAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const { status } = req.body;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    if (!status || !['active', 'suspended'].includes(status)) {
      throw new BadRequestError(
        'Status is required and must be either "active" or "suspended"'
      );
    }

    const user = await userService.updateUserStatus(userId, status);

    res.json({
      success: true,
      data: user,
      message: `User status updated to ${status}`,
    });
  }
);

// Legacy endpoints for backward compatibility
export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    res.json(users);
  }
);

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id as string);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id as string, req.body);
  res.json(user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id as string);
  res.status(204).send();
});
