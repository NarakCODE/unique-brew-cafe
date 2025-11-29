import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notificationService } from '../../../src/services/notificationService.js';
import Notification from '../../../src/models/Notification.js';
import DeviceToken from '../../../src/models/DeviceToken.js';
import { User } from '../../../src/models/User.js';
import { createTestUser } from '../../utils/testHelpers.js';
import mongoose from 'mongoose';

describe('NotificationService', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user._id.toString();
  });

  describe('registerDevice', () => {
    it('should register a new device token', async () => {
      const deviceData = {
        fcmToken: 'test-fcm-token-123',
        deviceType: 'ios' as const,
        deviceId: 'device-123',
        deviceModel: 'iPhone 14',
        osVersion: '16.0',
        appVersion: '1.0.0',
      };

      const result = await notificationService.registerDevice(
        userId,
        deviceData
      );

      expect(result).toBeDefined();
      expect(result.fcmToken).toBe(deviceData.fcmToken);
      expect(result.deviceType).toBe(deviceData.deviceType);
      expect(result.deviceModel).toBe(deviceData.deviceModel);
      expect(result.isActive).toBe(true);
    });

    it('should update existing device token', async () => {
      const deviceData = {
        fcmToken: 'test-fcm-token-456',
        deviceType: 'android' as const,
        deviceId: 'device-456',
      };

      await notificationService.registerDevice(userId, deviceData);

      const updatedData = {
        ...deviceData,
        deviceModel: 'Samsung Galaxy S23',
      };

      const result = await notificationService.registerDevice(
        userId,
        updatedData
      );

      expect(result.deviceModel).toBe('Samsung Galaxy S23');

      const tokens = await DeviceToken.find({ fcmToken: deviceData.fcmToken });
      expect(tokens).toHaveLength(1);
    });
  });

  describe('unregisterDevice', () => {
    it('should unregister a device token', async () => {
      const deviceData = {
        fcmToken: 'test-fcm-token-789',
        deviceType: 'ios' as const,
      };

      const token = await notificationService.registerDevice(
        userId,
        deviceData
      );

      await notificationService.unregisterDevice(userId, token._id.toString());

      const deletedToken = await DeviceToken.findById(token._id);
      expect(deletedToken).toBeNull();
    });

    it('should throw error if device token not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      await expect(
        notificationService.unregisterDevice(userId, nonExistentId)
      ).rejects.toThrow('Device token not found');
    });
  });

  describe('getNotifications', () => {
    beforeEach(async () => {
      await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'order_status',
        title: 'Order 1',
        message: 'Order confirmed',
      });

      await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'promotion',
        title: 'Promo 1',
        message: 'Special offer',
        isRead: true,
      });
    });

    it('should get all notifications for user', async () => {
      const notifications = await notificationService.getNotifications(userId);

      expect(notifications).toHaveLength(2);
    });

    it('should filter notifications by type', async () => {
      const notifications = await notificationService.getNotifications(userId, {
        type: 'order_status',
      });

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('order_status');
    });

    it('should filter notifications by read status', async () => {
      const notifications = await notificationService.getNotifications(userId, {
        isRead: false,
      });

      expect(notifications).toHaveLength(1);
      expect(notifications[0].isRead).toBe(false);
    });

    it('should apply limit and skip', async () => {
      const notifications = await notificationService.getNotifications(userId, {
        limit: 1,
        skip: 1,
      });

      expect(notifications).toHaveLength(1);
    });
  });

  describe('getUnreadCount', () => {
    it('should return correct unread count', async () => {
      await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'order_status',
        title: 'Order 1',
        message: 'Order confirmed',
      });

      await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'promotion',
        title: 'Promo 1',
        message: 'Special offer',
        isRead: true,
      });

      const count = await notificationService.getUnreadCount(userId);

      expect(count).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'announcement',
        title: 'Announcement',
        message: 'Important news',
      });

      await notificationService.markAsRead(userId, notification._id.toString());

      const updated = await Notification.findById(notification._id);
      expect(updated?.isRead).toBe(true);
      expect(updated?.readAt).toBeDefined();
    });

    it('should throw error if notification not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      await expect(
        notificationService.markAsRead(userId, nonExistentId)
      ).rejects.toThrow('Notification not found');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'order_status',
        title: 'Order 1',
        message: 'Order confirmed',
      });

      await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'promotion',
        title: 'Promo 1',
        message: 'Special offer',
      });

      await notificationService.markAllAsRead(userId);

      const unreadCount = await notificationService.getUnreadCount(userId);
      expect(unreadCount).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const notification = await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'system',
        title: 'System',
        message: 'System message',
      });

      await notificationService.deleteNotification(
        userId,
        notification._id.toString()
      );

      const deleted = await Notification.findById(notification._id);
      expect(deleted).toBeNull();
    });

    it('should throw error if notification not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      await expect(
        notificationService.deleteNotification(userId, nonExistentId)
      ).rejects.toThrow('Notification not found');
    });
  });

  describe('deleteAllNotifications', () => {
    it('should delete all notifications for user', async () => {
      await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'order_status',
        title: 'Order 1',
        message: 'Order confirmed',
      });

      await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'promotion',
        title: 'Promo 1',
        message: 'Special offer',
      });

      await notificationService.deleteAllNotifications(userId);

      const notifications = await Notification.find({
        userId: new mongoose.Types.ObjectId(userId),
      });
      expect(notifications).toHaveLength(0);
    });
  });

  describe('getSettings', () => {
    it('should return default notification settings', async () => {
      const settings = await notificationService.getSettings(userId);

      expect(settings).toBeDefined();
      expect(settings.orderUpdates).toBe(true);
      expect(settings.promotions).toBe(true);
      expect(settings.announcements).toBe(true);
      expect(settings.systemNotifications).toBe(true);
    });

    it('should throw error if user not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      await expect(
        notificationService.getSettings(nonExistentId)
      ).rejects.toThrow('User not found');
    });
  });

  describe('updateSettings', () => {
    it('should update notification settings', async () => {
      const newSettings = {
        orderUpdates: true,
        promotions: false,
        announcements: true,
        systemNotifications: false,
      };

      await notificationService.updateSettings(userId, newSettings);

      const user = await User.findById(userId);
      expect(user?.preferences?.notifications?.promotions).toBe(false);
      expect(user?.preferences?.notifications?.systemNotifications).toBe(false);
    });
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const data = {
        type: 'order_status' as const,
        title: 'Order Update',
        message: 'Your order is ready',
        priority: 'high' as const,
      };

      const notification = await notificationService.createNotification(
        userId,
        data
      );

      expect(notification).toBeDefined();
      expect(notification.title).toBe(data.title);
      expect(notification.message).toBe(data.message);
      expect(notification.priority).toBe(data.priority);
    });
  });

  describe('getStats', () => {
    it('should return notification statistics', async () => {
      await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'order_status',
        title: 'Order 1',
        message: 'Order confirmed',
        isRead: true,
      });

      await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'promotion',
        title: 'Promo 1',
        message: 'Special offer',
      });

      const stats = await notificationService.getStats();

      expect(stats.totalSent).toBe(2);
      expect(stats.readCount).toBe(1);
      expect(stats.unreadCount).toBe(1);
      expect(stats.readRate).toBe(50);
      expect(stats.typeDistribution).toBeDefined();
    });
  });
});
