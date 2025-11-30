import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  updatePassword,
  updateSettings,
  getReferralStats,
  deleteAccount,
} from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  updateProfileSchema,
  uploadProfileImageSchema,
  updatePasswordSchema,
  updateSettingsSchema,
  deleteAccountSchema,
} from '../schemas/index.js';

const router = express.Router();

// All profile routes require authentication
router.use(authenticate);

// Profile management endpoints
router.get('/', getProfile);
router.put('/', validate(updateProfileSchema), updateProfile);
router.post('/image', validate(uploadProfileImageSchema), uploadProfileImage);
router.put('/password', validate(updatePasswordSchema), updatePassword);
router.put('/settings', validate(updateSettingsSchema), updateSettings);
router.get('/referral', getReferralStats);
router.delete('/', validate(deleteAccountSchema), deleteAccount);

export default router;
