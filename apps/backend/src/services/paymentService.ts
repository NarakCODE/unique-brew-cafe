import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/env.js';

interface PaymentIntent {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  providerIntentId?: string;
  createdAt: Date;
}

interface PaymentDetails {
  paymentMethod: string;
  providerTransactionId?: string;
  // Additional payment-specific fields can be added here
}

interface PaymentResult {
  success: boolean;
  transactionId?: string | undefined;
  message: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
  };
}

class PaymentService {
  // In-memory storage for payment intents (in production, use Redis or database)
  private paymentIntents: Map<string, PaymentIntent> = new Map();

  /**
   * Create a payment intent for an order
   * This prepares the payment with the payment provider
   */
  async createPaymentIntent(
    orderId: string,
    userId: string
  ): Promise<PaymentIntent> {
    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Verify order belongs to user
    if (order.userId.toString() !== userId) {
      throw new AppError('Unauthorized access to order', 403);
    }

    // Check if order is in correct state for payment
    if (order.paymentStatus !== 'pending') {
      throw new AppError(
        `Order payment status is ${order.paymentStatus}. Cannot create payment intent.`,
        400
      );
    }

    // Generate payment intent ID
    const intentId = new mongoose.Types.ObjectId().toString();

    // In production, this would call the actual payment provider API
    // For now, we create a mock payment intent
    const providerIntentId = this.generateProviderIntentId(order.paymentMethod);

    const paymentIntent: PaymentIntent = {
      id: intentId,
      orderId: orderId,
      amount: order.total,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      status: 'pending',
      providerIntentId,
      createdAt: new Date(),
    };

    // Store payment intent
    this.paymentIntents.set(intentId, paymentIntent);

    // Update order payment status to processing
    order.paymentStatus = 'processing';
    await order.save();

    return paymentIntent;
  }

  /**
   * Confirm payment and update order status
   */
  async confirmPayment(
    orderId: string,
    paymentDetails: PaymentDetails
  ): Promise<PaymentResult> {
    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if order is in correct state for payment confirmation
    if (order.paymentStatus === 'completed') {
      throw new AppError('Payment already completed for this order', 400);
    }

    try {
      // In production, this would verify payment with the payment provider
      // For now, we simulate payment verification
      const paymentVerified = await this.verifyPaymentWithProvider(
        order,
        paymentDetails
      );

      if (!paymentVerified) {
        // Payment failed
        order.paymentStatus = 'failed';
        await order.save();

        return {
          success: false,
          message: 'Payment verification failed',
          order: {
            id: String(order._id),
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            total: order.total,
          },
        };
      }

      // Payment successful - update order
      order.paymentStatus = 'completed';
      order.status = 'confirmed';
      if (paymentDetails.providerTransactionId) {
        order.paymentProviderTransactionId =
          paymentDetails.providerTransactionId;
      }

      await order.save();

      return {
        success: true,
        transactionId: paymentDetails.providerTransactionId || undefined,
        message: 'Payment completed successfully',
        order: {
          id: String(order._id),
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          total: order.total,
        },
      };
    } catch (error) {
      // Payment processing error - maintain pending status
      order.paymentStatus = 'failed';
      await order.save();

      throw new AppError(
        `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  /**
   * Mock payment completion for development/testing
   * Only available in non-production environments
   */
  async mockPaymentComplete(orderId: string): Promise<void> {
    // Only allow in development environment
    if (config.nodeEnv === 'production') {
      throw new AppError(
        'Mock payment endpoint is not available in production',
        403
      );
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if order is in correct state
    if (order.paymentStatus === 'completed') {
      throw new AppError('Payment already completed for this order', 400);
    }

    // Generate mock transaction ID
    const mockTransactionId = `MOCK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Update order
    order.paymentStatus = 'completed';
    order.status = 'confirmed';
    order.paymentProviderTransactionId = mockTransactionId;

    await order.save();
  }

  /**
   * Generate a mock provider intent ID
   * In production, this would come from the actual payment provider
   */
  private generateProviderIntentId(paymentMethod: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const methodPrefix = paymentMethod.substring(0, 3).toUpperCase();

    return `${methodPrefix}-INTENT-${timestamp}-${random}`;
  }

  /**
   * Verify payment with payment provider
   * In production, this would make actual API calls to payment providers
   */
  private async verifyPaymentWithProvider(
    _order: typeof Order.prototype,
    _paymentDetails: PaymentDetails
  ): Promise<boolean> {
    // Simulate payment provider verification
    // In production, this would call the actual payment provider API

    // For development, we'll simulate a successful payment
    // In production, implement actual provider-specific verification:
    // - ABA Bank API verification
    // - ACLEDA Bank API verification
    // - Wing Money API verification
    // - etc.

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // For now, always return true (successful payment)
    // In production, this would check with the actual payment provider
    return true;
  }
}

export const paymentService = new PaymentService();
