import type { Request, Response } from 'express';
import { paymentService } from '../services/paymentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

/**
 * Create payment intent for an order
 * POST /payments/:orderId/intent
 */
export const createPaymentIntent = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }

    const paymentIntent = await paymentService.createPaymentIntent(
      orderId,
      req.userId
    );

    res.status(200).json({
      success: true,
      data: paymentIntent,
      message: 'Payment intent created successfully',
    });
  }
);

/**
 * Confirm payment for an order
 * POST /payments/:orderId/confirm
 */
export const confirmPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { paymentMethod, providerTransactionId } = req.body;

    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }

    if (!paymentMethod) {
      throw new AppError('Payment method is required', 400);
    }

    const result = await paymentService.confirmPayment(orderId, {
      paymentMethod,
      providerTransactionId,
    });

    const statusCode = result.success ? 200 : 400;

    res.status(statusCode).json({
      success: result.success,
      data: result.order,
      transactionId: result.transactionId,
      message: result.message,
    });
  }
);

/**
 * Mock payment completion for development/testing
 * POST /payments/mock/:orderId/complete
 * Only available in non-production environments
 */
export const mockPaymentComplete = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }

    await paymentService.mockPaymentComplete(orderId);

    res.status(200).json({
      success: true,
      message: 'Mock payment completed successfully',
    });
  }
);
