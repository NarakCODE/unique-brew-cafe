import { describe, it, expect, beforeEach } from 'vitest';
import Notification from '../../../src/models/Notification.js';
import { createTestUser } from '../../utils/testHelpers.js';
import mongoose from 'mongoose';

describe('Notification Model', () => {
  let userId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user._id as mongoose.Types.ObjectId;
  });

  it('should create a notification with valid attributes', async () => {
    const notificationData = {
      userId,
      type: 'order_status' as const,
      title: 'Order Update',
      message: 'Your order has been confirmed',
      priority: 'high' as const,
    };

    const notification = await Notification.create(notificationData);

    expect(notification._id).toBeDefined();
    expect(notification.userId.toString()).toBe(userId.toString());
    expect(notification.type).toBe('order_status');
    expect(notification.title).toBe('Order Update');
    expect(notification.message).toBe('Your order has been confirmed');
    expect(notification.priority).toBe('high');
    expect(notification.isRead).toBe(false);
    expect(notification.readAt).toBeUndefined();
  });

  it('should fail if required fields are missing', async () => {
    const notificationData = {
      userId,
      title: 'Test',
      // Missing type and message
    };

    await expect(Notification.create(notificationData)).rejects.toThrow();
  });

  it('should use default priority if not specified', async () => {
    const notificationData = {
      userId,
      type: 'promotion' as const,
      title: 'New Promotion',
      message: 'Check out our latest deals',
    };

    const notification = await Notification.create(notificationData);

    expect(notification.priority).toBe('medium');
  });

  it('should validate notification type enum', async () => {
    const notificationData = {
      userId,
      type: 'invalid_type' as any,
      title: 'Test',
      message: 'Test message',
    };

    await expect(Notification.create(notificationData)).rejects.toThrow();
  });

  it('should store optional fields correctly', async () => {
    const notificationData = {
      userId,
      type: 'system' as const,
      title: 'System Update',
      message: 'System maintenance scheduled',
      imageUrl: 'https://example.com/image.jpg',
      actionType: 'external_url' as const,
      actionValue: 'https://example.com',
      priority: 'low' as const,
    };

    const notification = await Notification.create(notificationData);

    expect(notification.imageUrl).toBe('https://example.com/image.jpg');
    expect(notification.actionType).toBe('external_url');
    expect(notification.actionValue).toBe('https://example.com');
  });

  it('should transform _id to id in JSON', async () => {
    const notification = await Notification.create({
      userId,
      type: 'announcement' as const,
      title: 'Announcement',
      message: 'Important announcement',
    });

    const notificationJSON = notification.toJSON();

    expect(notificationJSON.id).toBeDefined();
    expect(notificationJSON.id).toBe(
      (notification._id as mongoose.Types.ObjectId).toString()
    );
    expect(notificationJSON._id).toBeUndefined();
    expect(notificationJSON.__v).toBeUndefined();
  });

  it('should update isRead status', async () => {
    const notification = await Notification.create({
      userId,
      type: 'promotion' as const,
      title: 'Promotion',
      message: 'Special offer',
    });

    expect(notification.isRead).toBe(false);

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    const updated = await Notification.findById(notification._id);
    expect(updated?.isRead).toBe(true);
    expect(updated?.readAt).toBeDefined();
  });

  it('should create multiple notifications for same user', async () => {
    await Notification.create({
      userId,
      type: 'order_status' as const,
      title: 'Order 1',
      message: 'Order 1 message',
    });

    await Notification.create({
      userId,
      type: 'promotion' as const,
      title: 'Promo 1',
      message: 'Promo 1 message',
    });

    const notifications = await Notification.find({ userId });
    expect(notifications).toHaveLength(2);
  });

  it('should trim title whitespace', async () => {
    const notification = await Notification.create({
      userId,
      type: 'system' as const,
      title: '  Test Title  ',
      message: 'Test message',
    });

    expect(notification.title).toBe('Test Title');
  });
});
