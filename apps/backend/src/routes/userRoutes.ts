import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadAvatar,
  deleteAccount,
  getAllUsersAdmin,
  getUserByIdAdmin,
  getUserOrdersAdmin,
  updateUserStatusAdmin,
} from '../controllers/userController.js';
import { validateUser } from '../middlewares/validateRequest.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { upload } from '../config/multer.js';
import { validate } from '../middlewares/validate.js';
import {
  getUsersQuerySchema,
  userParamSchema,
  updateUserStatusSchema,
  deleteAccountSchema,
} from '../schemas/index.js';

const router = express.Router();

/**
 * AUTHENTICATED: Upload avatar
 * Requirements: 18.3
 * PATCH /api/users/me/avatar
 */
router.patch('/me/avatar', authenticate, upload.single('avatar'), uploadAvatar);

/**
 * AUTHENTICATED: Delete own account
 * Requirements: 18.4
 * DELETE /api/users/me
 */
router.delete(
  '/me',
  authenticate,
  validate(deleteAccountSchema),
  deleteAccount
);

/**
 * ADMIN: Get all users with pagination
 * Requirements: 19.1
 * GET /api/users?page=1&limit=20&status=active&role=user&search=john
 */
router.get(
  '/',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(getUsersQuerySchema),
  getAllUsersAdmin
);

/**
 * ADMIN: Get user details by ID
 * Requirements: 19.2
 * GET /api/users/:userId
 */
router.get(
  '/:userId',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(userParamSchema),
  getUserByIdAdmin
);

/**
 * ADMIN: Get user order history
 * Requirements: 19.3
 * GET /api/users/:userId/orders
 */
router.get(
  '/:userId/orders',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(userParamSchema),
  getUserOrdersAdmin
);

/**
 * ADMIN: Update user status (active/suspended)
 * Requirements: 19.4
 * PATCH /api/users/:userId/status
 */
router.patch(
  '/:userId/status',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(updateUserStatusSchema),
  updateUserStatusAdmin
);

// Legacy endpoints for backward compatibility
router.get(
  '/legacy/all',
  authenticate,
  authorize({ roles: ['admin'] }),
  getAllUsers
);

router.get(
  '/legacy/:id',
  authenticate,
  authorize({
    roles: ['admin'],
    allowSelf: true,
    resourceOwnerParam: 'id',
  }),
  getUserById
);

router.post(
  '/legacy/create',
  authenticate,
  authorize({ roles: ['admin'] }),
  validateUser,
  createUser
);

router.put(
  '/legacy/:id',
  authenticate,
  authorize({
    roles: ['admin'],
    allowSelf: true,
    resourceOwnerParam: 'id',
  }),
  updateUser
);

router.delete(
  '/legacy/:id',
  authenticate,
  authorize({
    roles: ['admin'],
    allowSelf: true,
    resourceOwnerParam: 'id',
  }),
  deleteUser
);

export default router;
