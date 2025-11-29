import { Router } from 'express';
import {
  registerDevice,
  unregisterDevice,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getSettings,
  updateSettings,
  sendNotification,
  broadcastNotification,
  sendToSegment,
  getNotificationStats,
  getNotificationHistory,
} from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Device token management
router.post('/devices/register', registerDevice);
router.delete('/devices/:tokenId', unregisterDevice);

// Notification management
router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);
router.delete('/', authenticate, deleteAllNotifications);

// Notification settings
router.get('/settings', authenticate, getSettings);
router.patch('/settings', authenticate, updateSettings);

// Admin routes
router.post(
  '/send',
  authenticate,
  authorize({ roles: ['admin'] }),
  sendNotification
);
router.post(
  '/broadcast',
  authenticate,
  authorize({ roles: ['admin'] }),
  broadcastNotification
);
router.post(
  '/segment',
  authenticate,
  authorize({ roles: ['admin'] }),
  sendToSegment
);
router.get(
  '/stats',
  authenticate,
  authorize({ roles: ['admin'] }),
  getNotificationStats
);
router.get(
  '/history',
  authenticate,
  authorize({ roles: ['admin'] }),
  getNotificationHistory
);

export default router;
