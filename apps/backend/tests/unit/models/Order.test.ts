import { describe, it, expect, beforeEach } from 'vitest';
import { Order } from '../../../src/models/Order.js';
import { createTestUser, createTestStore } from '../../utils/testHelpers.js';
import mongoose from 'mongoose';

describe('Order Model', () => {
  let userId: mongoose.Types.ObjectId;
  let storeId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user._id as mongoose.Types.ObjectId;

    const store = await createTestStore();
    storeId = store._id as mongoose.Types.ObjectId;
  });

  it('should create an order with valid attributes', async () => {
    const orderData = {
      userId,
      storeId,
      paymentMethod: 'credit_card',
      subtotal: 100,
      tax: 10,
      total: 110,
    };

    const order = await Order.create(orderData);

    expect(order._id).toBeDefined();
    expect(order.orderNumber).toBeDefined();
    expect(order.orderNumber).toMatch(/^ORD-/);
    expect(order.userId.toString()).toBe(userId.toString());
    expect(order.storeId.toString()).toBe(storeId.toString());
    expect(order.status).toBe('pending_payment');
    expect(order.paymentStatus).toBe('pending');
    expect(order.subtotal).toBe(100);
    expect(order.total).toBe(110);
  });

  it('should fail if required fields are missing', async () => {
    const orderData = {
      userId,
      // Missing storeId, paymentMethod, subtotal, total
    };

    await expect(Order.create(orderData)).rejects.toThrow();
  });

  it('should use default values for optional fields', async () => {
    const orderData = {
      userId,
      storeId,
      paymentMethod: 'cash',
      subtotal: 50,
      total: 50,
    };

    const order = await Order.create(orderData);

    expect(order.discount).toBe(0);
    expect(order.tax).toBe(0);
    expect(order.deliveryFee).toBe(0);
    expect(order.loyaltyPointsUsed).toBe(0);
    expect(order.loyaltyPointsEarned).toBe(0);
    expect(order.currency).toBe('USD');
  });

  it('should validate order status enum', async () => {
    const orderData = {
      userId,
      storeId,
      paymentMethod: 'cash',
      subtotal: 50,
      total: 50,
      status: 'invalid_status' as any,
    };

    await expect(Order.create(orderData)).rejects.toThrow();
  });

  it('should validate payment status enum', async () => {
    const orderData = {
      userId,
      storeId,
      paymentMethod: 'cash',
      subtotal: 50,
      total: 50,
      paymentStatus: 'invalid_payment_status' as any,
    };

    await expect(Order.create(orderData)).rejects.toThrow();
  });

  it('should not allow negative subtotal', async () => {
    const orderData = {
      userId,
      storeId,
      paymentMethod: 'cash',
      subtotal: -50,
      total: 50,
    };

    await expect(Order.create(orderData)).rejects.toThrow();
  });

  it('should not allow negative total', async () => {
    const orderData = {
      userId,
      storeId,
      paymentMethod: 'cash',
      subtotal: 50,
      total: -50,
    };

    await expect(Order.create(orderData)).rejects.toThrow();
  });

  it('should store optional fields correctly', async () => {
    const pickupTime = new Date(Date.now() + 3600000);
    const orderData = {
      userId,
      storeId,
      paymentMethod: 'credit_card',
      subtotal: 100,
      total: 110,
      deliveryAddress: '123 Main St',
      pickupTime,
      notes: 'Extra sauce please',
      discount: 10,
      deliveryFee: 5,
    };

    const order = await Order.create(orderData);

    expect(order.deliveryAddress).toBe('123 Main St');
    expect(order.pickupTime?.toISOString()).toBe(pickupTime.toISOString());
    expect(order.notes).toBe('Extra sauce please');
    expect(order.discount).toBe(10);
    expect(order.deliveryFee).toBe(5);
  });

  it('should generate unique order numbers', async () => {
    const order1 = await Order.create({
      userId,
      storeId,
      paymentMethod: 'cash',
      subtotal: 50,
      total: 50,
    });

    const order2 = await Order.create({
      userId,
      storeId,
      paymentMethod: 'cash',
      subtotal: 60,
      total: 60,
    });

    expect(order1.orderNumber).not.toBe(order2.orderNumber);
  });

  it('should transform _id to id in JSON', async () => {
    const order = await Order.create({
      userId,
      storeId,
      paymentMethod: 'cash',
      subtotal: 50,
      total: 50,
    });

    const orderJSON = order.toJSON();

    expect(orderJSON.id).toBeDefined();
    expect(orderJSON.id).toBe(
      (order._id as mongoose.Types.ObjectId).toString()
    );
    expect(orderJSON._id).toBeUndefined();
    expect(orderJSON.__v).toBeUndefined();
  });

  it('should update order status', async () => {
    const order = await Order.create({
      userId,
      storeId,
      paymentMethod: 'cash',
      subtotal: 50,
      total: 50,
    });

    order.status = 'confirmed';
    await order.save();

    const updated = await Order.findById(order._id);
    expect(updated?.status).toBe('confirmed');
  });

  it('should store cancellation details', async () => {
    const order = await Order.create({
      userId,
      storeId,
      paymentMethod: 'cash',
      subtotal: 50,
      total: 50,
    });

    order.status = 'cancelled';
    order.cancellationReason = 'Changed my mind';
    order.cancelledBy = 'customer';
    order.cancelledAt = new Date();
    await order.save();

    const updated = await Order.findById(order._id);
    expect(updated?.status).toBe('cancelled');
    expect(updated?.cancellationReason).toBe('Changed my mind');
    expect(updated?.cancelledBy).toBe('customer');
    expect(updated?.cancelledAt).toBeDefined();
  });

  it('should trim address and notes', async () => {
    const order = await Order.create({
      userId,
      storeId,
      paymentMethod: 'cash',
      subtotal: 50,
      total: 50,
      deliveryAddress: '  123 Main St  ',
      notes: '  Special instructions  ',
    });

    expect(order.deliveryAddress).toBe('123 Main St');
    expect(order.notes).toBe('Special instructions');
  });
});
