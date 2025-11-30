import express, { Router } from 'express';
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePublish,
  getAnnouncements,
  getAnnouncement,
  trackView,
  trackClick,
} from '../controllers/announcementController.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router: Router = express.Router();

// Public routes (some with optional auth for targeting)
router.get('/', optionalAuthenticate, getAnnouncements);
router.get('/:id', getAnnouncement);
router.post('/:id/view', trackView);
router.post('/:id/click', trackClick);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize({ roles: ['admin'] }),
  createAnnouncement
);
router.put(
  '/:id',
  authenticate,
  authorize({ roles: ['admin'] }),
  updateAnnouncement
);
router.delete(
  '/:id',
  authenticate,
  authorize({ roles: ['admin'] }),
  deleteAnnouncement
);
router.patch(
  '/:id/publish',
  authenticate,
  authorize({ roles: ['admin'] }),
  togglePublish
);

export default router;
