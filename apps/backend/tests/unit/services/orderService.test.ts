import { describe, it, expect, beforeEach } from 'vitest';
import { OrderService } from '../../../src/services/orderService.js';
import { Order } from '../../../src/models/Order.js';
import { OrderItem } from '../../../src/models/OrderItem.js';
import { OrderStatusHistory } from '../../../src/models/OrderStatusHistory.js';
import { createTestUser, createTestStore } from '../../utils/testHelpers.js';
import mongoose from 'mongoose';

describe('OrderService', () => {
  let orderService: OrderService;
  let userId: string;
  let storeId: string;

  beforeEach(async () => {
    orderService = new OrderService();
    const user = await createTestUser();
    userId = user._id.toString();

    const store = await createTestStore();
    storeId = store._id.toString();
  });

  describe('getOrders', () => {
    beforeEach(async () => {
      await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'confirmed',
      });

      await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'credit_card',
        subtotal: 100,
        total: 110,
        status: 'preparing',
      });
    });

    it('should get user orders for non-admin', async () => {
      const result = await orderService.getOrders(userId, 'user');

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter orders by status', async () => {
      const result = await orderService.getOrders(userId, 'user', {
        status: 'confirmed',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('confirmed');
    });

    it('should paginate results', async () => {
      const result = await orderService.getOrders(
        userId,
        'user',
        {},
        { page: 1, limit: 1 }
      );

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.pages).toBe(2);
    });
  });

  describe('getOrderById', () => {
    it('should get order by id for owner', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
      });

      await OrderItem.create({
        orderId: order._id,
        productId: new mongoose.Types.ObjectId(),
        productName: 'Coffee',
        productImage: 'coffee.jpg',
        quantity: 2,
        unitPrice: 5,
        totalPrice: 10,
      });

      const result = await orderService.getOrderById(
        order._id.toString(),
        userId,
        'user'
      );

      expect(result).toBeDefined();
      expect(result.orderNumber).toBe(order.orderNumber);
    });

    it('should throw error for invalid order id', async () => {
      await expect(
        orderService.getOrderById('invalid-id', userId, 'user')
      ).rejects.toThrow('Invalid order ID');
    });

    it('should throw error if order not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      await expect(
        orderService.getOrderById(nonExistentId, userId, 'user')
      ).rejects.toThrow('Order not found');
    });

    it('should throw error if user does not own order', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });

      const order = await Order.create({
        userId: otherUser._id,
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
      });

      await expect(
        orderService.getOrderById(order._id.toString(), userId, 'user')
      ).rejects.toThrow('You do not have permission to view this order');
    });
  });

  describe('getOrderTracking', () => {
    it('should get order tracking information', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'preparing',
      });

      await OrderStatusHistory.create({
        orderId: order._id,
        status: 'confirmed',
        changedBy: 'system',
      });

      await OrderStatusHistory.create({
        orderId: order._id,
        status: 'preparing',
        changedBy: 'admin',
      });

      const result = await orderService.getOrderTracking(
        order._id.toString(),
        userId
      );

      expect(result.orderNumber).toBe(order.orderNumber);
      expect(result.status).toBe('preparing');
      expect(result.statusHistory).toHaveLength(2);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order within 5 minutes', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'confirmed',
      });

      const result = await orderService.cancelOrder(
        order._id.toString(),
        userId,
        'Changed my mind'
      );

      expect(result.status).toBe('cancelled');
      expect(result.cancellationReason).toBe('Changed my mind');
      expect(result.cancelledBy).toBe('customer');
      expect(result.cancelledAt).toBeDefined();
    });

    it('should throw error if order not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      await expect(
        orderService.cancelOrder(nonExistentId, userId, 'Test reason')
      ).rejects.toThrow('Order not found');
    });

    it('should throw error if already cancelled', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'cancelled',
      });

      await expect(
        orderService.cancelOrder(order._id.toString(), userId, 'Test reason')
      ).rejects.toThrow('Order is already cancelled');
    });

    it('should throw error if order is completed', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'completed',
      });

      await expect(
        orderService.cancelOrder(order._id.toString(), userId, 'Test reason')
      ).rejects.toThrow('Cannot cancel a completed order');
    });

    it('should throw error if past 5 minutes', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'confirmed',
      });

      // Manually update createdAt to be more than 5 minutes ago
      await Order.updateOne(
        { _id: order._id },
        { createdAt: new Date(Date.now() - 6 * 60 * 1000) }
      );

      await expect(
        orderService.cancelOrder(order._id.toString(), userId, 'Test reason')
      ).rejects.toThrow(
        'Order can only be cancelled within 5 minutes of placement'
      );
    });
  });

  describe('rateOrder', () => {
    it('should rate a completed order', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'completed',
      });

      await orderService.rateOrder(
        order._id.toString(),
        userId,
        5,
        'Excellent service!'
      );

      const updated = await Order.findById(order._id);
      expect(updated?.notes).toContain('Rating: 5/5');
      expect(updated?.notes).toContain('Review: Excellent service!');
    });

    it('should throw error for invalid rating', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'completed',
      });

      await expect(
        orderService.rateOrder(order._id.toString(), userId, 6)
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should throw error if order not completed', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'preparing',
      });

      await expect(
        orderService.rateOrder(order._id.toString(), userId, 5)
      ).rejects.toThrow('Only completed orders can be rated');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status with valid transition', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'confirmed',
      });

      const result = await orderService.updateOrderStatus(
        order._id.toString(),
        'preparing'
      );

      expect(result.status).toBe('preparing');

      const history = await OrderStatusHistory.findOne({
        orderId: order._id,
        status: 'preparing',
      });
      expect(history).toBeDefined();
    });

    it('should set actualReadyTime when status is ready', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'preparing',
      });

      const result = await orderService.updateOrderStatus(
        order._id.toString(),
        'ready'
      );

      expect(result.actualReadyTime).toBeDefined();
    });

    it('should throw error for invalid status transition', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'completed',
      });

      await expect(
        orderService.updateOrderStatus(order._id.toString(), 'preparing')
      ).rejects.toThrow('Invalid status transition');
    });
  });

  describe('addInternalNotes', () => {
    it('should add internal notes to order', async () => {
      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
      });

      const result = await orderService.addInternalNotes(
        order._id.toString(),
        'Special handling required'
      );

      expect(result.internalNotes).toContain('Special handling required');
    });
  });

  describe('assignDriver', () => {
    it('should assign driver to order', async () => {
      const driver = await createTestUser({ email: 'driver@example.com' });

      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'confirmed',
      });

      const result = await orderService.assignDriver(
        order._id.toString(),
        driver._id.toString()
      );

      expect(result.assignedDriverId?.toString()).toBe(driver._id.toString());
    });

    it('should throw error for invalid order status', async () => {
      const driver = await createTestUser({ email: 'driver@example.com' });

      const order = await Order.create({
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        paymentMethod: 'cash',
        subtotal: 50,
        total: 50,
        status: 'completed',
      });

      await expect(
        orderService.assignDriver(order._id.toString(), driver._id.toString())
      ).rejects.toThrow('Cannot assign driver to order');
    });
  });
});
