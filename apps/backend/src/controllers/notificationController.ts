import type { Request, Response } from 'express';
import { notificationService } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';

/**
 * Register device token for push notifications
 * POST /notifications/devices/register
 */
export const registerDevice = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const {
      fcmToken,
      deviceId,
      deviceType,
      deviceModel,
      osVersion,
      appVersion,
    } = req.body;

    if (!fcmToken || !deviceType) {
      throw new BadRequestError('FCM token and device type are required');
    }

    if (!['ios', 'android'].includes(deviceType)) {
      throw new BadRequestError('Device type must be ios or android');
    }

    const deviceToken = await notificationService.registerDevice(userId, {
      fcmToken,
      deviceId,
      deviceType,
      deviceModel,
      osVersion,
      appVersion,
    });

    res.status(200).json({
      success: true,
      data: deviceToken,
    });
  }
);

/**
 * Unregister device token
 * DELETE /notifications/devices/:tokenId
 */
export const unregisterDevice = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { tokenId } = req.params;

    if (!tokenId) {
      throw new BadRequestError('Token ID is required');
    }

    await notificationService.unregisterDevice(userId, tokenId);

    res.status(200).json({
      success: true,
      message: 'Device token unregistered successfully',
    });
  }
);

/**
 * Get notifications for authenticated user
 * GET /notifications
 */
export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { type, isRead, limit, skip } = req.query;

    const filters: {
      type: string;
      isRead: boolean;
      limit: number;
      skip: number;
    } = {
      type: type as string,
      isRead: isRead === 'true',
      limit: limit ? parseInt(limit as string, 10) : 50,
      skip: skip ? parseInt(skip as string, 10) : 0,
    };

    const notifications = await notificationService.getNotifications(
      userId,
      filters
    );

    res.status(200).json({
      success: true,
      data: notifications,
    });
  }
);

/**
 * Get unread notification count
 * GET /notifications/unread-count
 */
export const getUnreadCount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;

    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count },
    });
  }
);

/**
 * Mark notification as read
 * PATCH /notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Notification ID is required');
  }

  await notificationService.markAsRead(userId, id);

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
  });
});

/**
 * Mark all notifications as read
 * PATCH /notifications/read-all
 */
export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;

    await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  }
);

/**
 * Delete a notification
 * DELETE /notifications/:id
 */
export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Notification ID is required');
    }

    await notificationService.deleteNotification(userId, id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  }
);

/**
 * Delete all notifications
 * DELETE /notifications
 */
export const deleteAllNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;

    await notificationService.deleteAllNotifications(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications deleted successfully',
    });
  }
);

/**
 * Get notification settings
 * GET /notifications/settings
 */
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  const settings = await notificationService.getSettings(userId);

  res.status(200).json({
    success: true,
    data: settings,
  });
});

/**
 * Update notification settings
 * PATCH /notifications/settings
 */
export const updateSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { orderUpdates, promotions, announcements, systemNotifications } =
      req.body;

    const settings = {
      orderUpdates: orderUpdates ?? true,
      promotions: promotions ?? true,
      announcements: announcements ?? true,
      systemNotifications: systemNotifications ?? true,
    };

    await notificationService.updateSettings(userId, settings);

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings,
    });
  }
);

/**
 * Admin: Send notification to a specific user
 * POST /notifications/send
 */
export const sendNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const adminId = req.userId!;
    const { userId, type, title, message, imageUrl, actionType, actionValue } =
      req.body;

    if (!userId || !title || !message) {
      throw new BadRequestError('User ID, title, and message are required');
    }

    const notification = await notificationService.sendToUser(adminId, userId, {
      type: type || 'system',
      title,
      message,
      imageUrl,
      actionType,
      actionValue,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  }
);

/**
 * Admin: Broadcast notification to all users
 * POST /notifications/broadcast
 */
export const broadcastNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const adminId = req.userId!;
    const { type, title, message, imageUrl, actionType, actionValue } =
      req.body;

    if (!title || !message) {
      throw new BadRequestError('Title and message are required');
    }

    const log = await notificationService.broadcast(adminId, {
      type: type || 'announcement',
      title,
      message,
      imageUrl,
      actionType,
      actionValue,
    });

    res.status(200).json({
      success: true,
      message: 'Broadcast initiated successfully',
      data: log,
    });
  }
);

/**
 * Admin: Send notification to user segment
 * POST /notifications/segment
 */
export const sendToSegment = asyncHandler(
  async (req: Request, res: Response) => {
    const adminId = req.userId!;
    const {
      criteria,
      type,
      title,
      message,
      imageUrl,
      actionType,
      actionValue,
    } = req.body;

    if (!criteria || !title || !message) {
      throw new BadRequestError('Criteria, title, and message are required');
    }

    const log = await notificationService.sendToSegment(adminId, criteria, {
      type: type || 'promotion',
      title,
      message,
      imageUrl,
      actionType,
      actionValue,
    });

    res.status(200).json({
      success: true,
      message: 'Segment notification initiated successfully',
      data: log,
    });
  }
);

/**
 * Admin: Get notification statistics
 * GET /notifications/stats
 */
export const getNotificationStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await notificationService.getStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);

/**
 * Admin: Get notification history
 * GET /notifications/history
 */
export const getNotificationHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, skip } = req.query;

    const history = await notificationService.getHistory(
      limit ? parseInt(limit as string, 10) : 20,
      skip ? parseInt(skip as string, 10) : 0
    );

    res.status(200).json({
      success: true,
      data: history,
    });
  }
);
