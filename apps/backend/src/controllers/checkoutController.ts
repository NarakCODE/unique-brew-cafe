import type { Request, Response } from 'express';
import { checkoutService } from '../services/checkoutService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const validateCheckout = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const validation = await checkoutService.validateCheckout(req.userId);

    res.status(200).json({
      success: true,
      data: validation,
    });
  }
);

export const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const session = await checkoutService.createCheckoutSession(req.userId);

    res.status(201).json({
      success: true,
      data: session,
    });
  }
);

export const getCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { checkoutId } = req.params;

    if (!req.userId || !checkoutId) {
      throw new AppError('User not authenticated or checkout ID missing', 401);
    }

    const session = await checkoutService.getCheckoutSession(
      req.userId,
      checkoutId
    );

    res.status(200).json({
      success: true,
      data: session,
    });
  }
);

export const getPaymentMethods = asyncHandler(
  async (req: Request, res: Response) => {
    const paymentMethods = await checkoutService.getPaymentMethods();

    res.status(200).json({
      success: true,
      data: paymentMethods,
    });
  }
);

export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { checkoutId } = req.params;
  const { couponCode } = req.body;

  if (!req.userId || !checkoutId) {
    throw new AppError('User not authenticated or checkout ID missing', 401);
  }

  if (!couponCode) {
    throw new AppError('Coupon code is required', 400);
  }

  const session = await checkoutService.applyCoupon(
    req.userId,
    checkoutId,
    couponCode
  );

  res.status(200).json({
    success: true,
    data: session,
    message: 'Coupon applied successfully',
  });
});

export const removeCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const { checkoutId } = req.params;

    if (!req.userId || !checkoutId) {
      throw new AppError('User not authenticated or checkout ID missing', 401);
    }

    const session = await checkoutService.removeCoupon(req.userId, checkoutId);

    res.status(200).json({
      success: true,
      data: session,
      message: 'Coupon removed successfully',
    });
  }
);

export const getDeliveryCharges = asyncHandler(
  async (req: Request, res: Response) => {
    const { addressId } = req.query;

    if (!addressId || typeof addressId !== 'string') {
      throw new AppError('Address ID is required', 400);
    }

    const deliveryFee =
      await checkoutService.calculateDeliveryCharges(addressId);

    res.status(200).json({
      success: true,
      data: {
        deliveryFee,
        currency: 'USD',
      },
    });
  }
);

export const confirmCheckout = asyncHandler(
  async (req: Request, res: Response) => {
    const { checkoutId } = req.params;
    const { paymentMethod } = req.body;

    if (!req.userId || !checkoutId) {
      throw new AppError('User not authenticated or checkout ID missing', 401);
    }

    if (!paymentMethod) {
      throw new AppError('Payment method is required', 400);
    }

    const order = await checkoutService.confirmCheckout(
      req.userId,
      checkoutId,
      paymentMethod
    );

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  }
);
