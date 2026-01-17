import express, { Router } from 'express';
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

import { mediaUpload } from '../middlewares/mediaUpload.js';

const router: Router = express.Router();

// Helper to handle multipart/form-data
const processMultipart = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const file = (req as any).file;
  if (file && file.path) {
    req.body.imageUrl = file.path;
  }
  next();
};

// All profile routes require authentication
router.use(authenticate);

// Profile management endpoints
router.get('/', getProfile);
router.put('/', validate(updateProfileSchema), updateProfile);
router.post(
  '/image',
  mediaUpload.single('image'), // Accept 'image' field
  processMultipart,
  validate(uploadProfileImageSchema),
  uploadProfileImage
);
router.put('/password', validate(updatePasswordSchema), updatePassword);
router.put('/settings', validate(updateSettingsSchema), updateSettings);
router.get('/referral', getReferralStats);
router.delete('/', validate(deleteAccountSchema), deleteAccount);

export default router;
