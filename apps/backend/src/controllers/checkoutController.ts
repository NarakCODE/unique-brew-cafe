import type { Request, Response } from 'express';
import { checkoutService } from '../services/checkoutService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const validateCheckout = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const validation = await checkoutService.validateCheckout(req.userId);

    res
      .status(200)
      .json(
        new ApiResponse(200, validation, 'Checkout validated successfully')
      );
  }
);

export const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const session = await checkoutService.createCheckoutSession(req.userId);

    res
      .status(201)
      .json(
        new ApiResponse(201, session, 'Checkout session created successfully')
      );
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

    res
      .status(200)
      .json(
        new ApiResponse(200, session, 'Checkout session fetched successfully')
      );
  }
);

export const getPaymentMethods = asyncHandler(
  async (req: Request, res: Response) => {
    const paymentMethods = await checkoutService.getPaymentMethods();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          paymentMethods,
          'Payment methods fetched successfully'
        )
      );
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

  res
    .status(200)
    .json(new ApiResponse(200, session, 'Coupon applied successfully'));
});

export const removeCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const { checkoutId } = req.params;

    if (!req.userId || !checkoutId) {
      throw new AppError('User not authenticated or checkout ID missing', 401);
    }

    const session = await checkoutService.removeCoupon(req.userId, checkoutId);

    res
      .status(200)
      .json(new ApiResponse(200, session, 'Coupon removed successfully'));
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

    res.status(200).json(
      new ApiResponse(
        200,
        {
          deliveryFee,
          currency: 'USD',
        },
        'Delivery charges calculated successfully'
      )
    );
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

    const checkout = await checkoutService.confirmCheckout(
      req.userId,
      checkoutId,
      paymentMethod
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          checkout,
          'Checkout confirmed successfully'
        )
      );
  }
);
