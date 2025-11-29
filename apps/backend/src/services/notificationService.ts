import Notification, { type INotification } from '../models/Notification.js';
import NotificationLog, {
  type INotificationLog,
} from '../models/NotificationLog.js';
import DeviceToken, { type IDeviceToken } from '../models/DeviceToken.js';
import { User } from '../models/User.js';
import { NotFoundError } from '../utils/AppError.js';
import mongoose from 'mongoose';

interface RegisterDeviceDTO {
  fcmToken: string;
  deviceId?: string;
  deviceType: 'ios' | 'android';
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
}

interface CreateNotificationDTO {
  type: 'order_status' | 'promotion' | 'announcement' | 'system';
  title: string;
  message: string;
  imageUrl?: string;
  actionType?: 'order_details' | 'promotion' | 'external_url' | 'none';
  actionValue?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface NotificationFilters {
  type?: string;
  isRead?: boolean;
  limit?: number;
  skip?: number;
}

interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  announcements: boolean;
  systemNotifications: boolean;
}

interface SegmentCriteria {
  role?: string;
  loyaltyTier?: string;
  lastActiveBefore?: string;
}

interface UserSegmentQuery {
  isActive: boolean;
  role?: string;
  loyaltyTier?: string;
  lastLoginAt?: { $lt: Date };
}

interface TypeDistribution {
  _id: string;
  count: number;
}

interface NotificationStats {
  totalSent: number;
  readCount: number;
  unreadCount: number;
  readRate: number;
  typeDistribution: TypeDistribution[];
}

export const notificationService = {
  /**
   * Register a device token for push notifications
   */
  async registerDevice(
    userId: string,
    data: RegisterDeviceDTO
  ): Promise<IDeviceToken> {
    // Check if token already exists
    const existingToken = await DeviceToken.findOne({
      fcmToken: data.fcmToken,
    });

    if (existingToken) {
      // Update existing token
      existingToken.userId = new mongoose.Types.ObjectId(userId);
      if (data.deviceId !== undefined) existingToken.deviceId = data.deviceId;
      existingToken.deviceType = data.deviceType;
      if (data.deviceModel !== undefined)
        existingToken.deviceModel = data.deviceModel;
      if (data.osVersion !== undefined)
        existingToken.osVersion = data.osVersion;
      if (data.appVersion !== undefined)
        existingToken.appVersion = data.appVersion;
      existingToken.isActive = true;
      existingToken.lastUsedAt = new Date();
      await existingToken.save();
      return existingToken;
    }

    // Create new token
    const deviceToken = await DeviceToken.create({
      userId: new mongoose.Types.ObjectId(userId),
      ...data,
    });

    return deviceToken;
  },

  /**
   * Unregister a device token
   */
  async unregisterDevice(userId: string, tokenId: string): Promise<void> {
    const deviceToken = await DeviceToken.findOne({
      _id: tokenId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!deviceToken) {
      throw new NotFoundError('Device token not found');
    }

    await DeviceToken.deleteOne({ _id: tokenId });
  },

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    filters: NotificationFilters = {}
  ): Promise<INotification[]> {
    interface Query {
      userId: mongoose.Types.ObjectId;
      type?: string;
      isRead?: boolean;
      $or?: { targetAudience: string }[];
      targetAudience?: string;
    }
    const query: Query = { userId: new mongoose.Types.ObjectId(userId) };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.isRead !== undefined) {
      query.isRead = filters.isRead;
    }

    const limit = filters.limit || 50;
    const skip = filters.skip || 0;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return notifications;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const count = await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false,
    });

    return count;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );
  },

  /**
   * Delete a notification
   */
  async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<void> {
    const result = await Notification.deleteOne({
      _id: notificationId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError('Notification not found');
    }
  },

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<void> {
    await Notification.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });
  },

  /**
   * Get notification settings for a user
   */
  async getSettings(userId: string): Promise<NotificationSettings> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Return settings from user preferences or defaults
    return {
      orderUpdates: user.preferences?.notifications?.orderUpdates ?? true,
      promotions: user.preferences?.notifications?.promotions ?? true,
      announcements: user.preferences?.notifications?.announcements ?? true,
      systemNotifications:
        user.preferences?.notifications?.systemNotifications ?? true,
    };
  },

  /**
   * Update notification settings for a user
   */
  async updateSettings(
    userId: string,
    settings: NotificationSettings
  ): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update user preferences - use set() to handle nested updates properly
    user.set('preferences.notifications', {
      ...user.preferences?.notifications,
      ...settings,
    });

    await user.save();
  },

  /**
   * Create a notification for a user
   */
  async createNotification(
    userId: string,
    data: CreateNotificationDTO
  ): Promise<INotification> {
    const notification = await Notification.create({
      userId: new mongoose.Types.ObjectId(userId),
      ...data,
    });

    // TODO: Send push notification via FCM
    await this.sendPushNotification(userId, notification);

    return notification;
  },

  /**
   * Send push notification via FCM
   * This is a placeholder for FCM integration
   */
  /**
   * Send push notification via FCM
   * This is a placeholder for FCM integration
   */
  async sendPushNotification(
    userId: string,
    notification: INotification
  ): Promise<void> {
    // Get active device tokens for user
    const deviceTokens = await DeviceToken.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    });

    if (deviceTokens.length === 0) {
      return;
    }

    // TODO: Implement FCM push notification
    // This would use Firebase Admin SDK to send notifications
    // For now, this is a placeholder
    console.log(
      `Would send push notification to ${deviceTokens.length} devices for user ${userId}`
    );
    console.log(`Title: ${notification.title}`);
    console.log(`Message: ${notification.message}`);
  },

  /**
   * Admin: Send notification to a specific user and log it
   */
  async sendToUser(
    adminId: string,
    userId: string,
    data: CreateNotificationDTO
  ): Promise<INotification> {
    const notification = await this.createNotification(userId, data);

    // Log the action
    await NotificationLog.create({
      adminId: new mongoose.Types.ObjectId(adminId),
      type: 'individual',
      recipientCount: 1,
      successCount: 1,
      failureCount: 0,
      title: data.title,
      message: data.message,
    });

    return notification;
  },

  /**
   * Admin: Broadcast notification to all users
   */
  async broadcast(
    adminId: string,
    data: CreateNotificationDTO
  ): Promise<INotificationLog> {
    // Find all active users
    const users = await User.find({
      isActive: true,
      // deletedAt: null // Assuming soft delete logic if applicable
    }).select('_id');

    let successCount = 0;
    let failureCount = 0;

    // Process in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const notifications = batch.map((user) => ({
        userId: user._id,
        ...data,
      }));

      try {
        await Notification.insertMany(notifications);
        successCount += batch.length;
        // Trigger push notifications asynchronously for the batch
        // batch.forEach(user => this.sendPushNotification(user._id.toString(), ...));
      } catch (error) {
        console.error('Error broadcasting notifications:', error);
        failureCount += batch.length;
      }
    }

    // Log the action
    const log = await NotificationLog.create({
      adminId: new mongoose.Types.ObjectId(adminId),
      type: 'broadcast',
      recipientCount: users.length,
      successCount,
      failureCount,
      title: data.title,
      message: data.message,
    });

    return log;
  },

  /**
   * Admin: Send notification to a user segment
   */
  async sendToSegment(
    adminId: string,
    criteria: SegmentCriteria,
    data: CreateNotificationDTO
  ): Promise<INotificationLog> {
    // Build query based on criteria
    const query: UserSegmentQuery = { isActive: true };

    if (criteria.role) {
      query.role = criteria.role;
    }

    if (criteria.loyaltyTier) {
      query.loyaltyTier = criteria.loyaltyTier;
    }

    if (criteria.lastActiveBefore) {
      query.lastLoginAt = { $lt: new Date(criteria.lastActiveBefore) };
    }

    const users = await User.find(query).select('_id');

    let successCount = 0;
    let failureCount = 0;

    // Process in batches
    const batchSize = 100;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const notifications = batch.map((user) => ({
        userId: user._id,
        ...data,
      }));

      try {
        await Notification.insertMany(notifications);
        successCount += batch.length;
      } catch (error) {
        console.error('Error sending segment notifications:', error);
        failureCount += batch.length;
      }
    }

    // Log the action
    const log = await NotificationLog.create({
      adminId: new mongoose.Types.ObjectId(adminId),
      type: 'segment',
      recipientCount: users.length,
      successCount,
      failureCount,
      criteria,
      title: data.title,
      message: data.message,
    });

    return log;
  },

  /**
   * Admin: Get notification statistics
   */
  async getStats(): Promise<NotificationStats> {
    const totalSent = await Notification.countDocuments();
    const readCount = await Notification.countDocuments({ isRead: true });
    const unreadCount = await Notification.countDocuments({ isRead: false });

    // Calculate read rate
    const readRate = totalSent > 0 ? (readCount / totalSent) * 100 : 0;

    // Get distribution by type
    const typeDistribution = await Notification.aggregate<TypeDistribution>([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    return {
      totalSent,
      readCount,
      unreadCount,
      readRate: Math.round(readRate * 100) / 100,
      typeDistribution,
    };
  },

  /**
   * Admin: Get notification history
   */
  async getHistory(limit = 20, skip = 0): Promise<INotificationLog[]> {
    return NotificationLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('adminId', 'fullName email');
  },
};
