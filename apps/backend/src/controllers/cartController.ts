import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as cartService from '../services/cartService.js';
import { BadRequestError } from '../utils/AppError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

/**
 * Get cart for authenticated user
 * GET /api/cart
 */
export const getCart = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const result = await cartService.getCart(req.userId);

    res
      .status(200)
      .json(new ApiResponse(200, result, 'Cart fetched successfully'));
  }
);

/**
 * Add item to cart
 * POST /api/cart/items
 */
export const addItem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const { productId, quantity, customization, addOns, notes } = req.body;

    // Validate required fields
    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }

    if (!quantity || quantity < 1) {
      throw new BadRequestError('Quantity must be at least 1');
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new BadRequestError('Invalid product ID format');
    }

    // Validate addOns if provided
    if (addOns && Array.isArray(addOns)) {
      for (const addOnId of addOns) {
        if (!mongoose.Types.ObjectId.isValid(addOnId)) {
          throw new BadRequestError(`Invalid add-on ID format: ${addOnId}`);
        }
      }
    }

    const result = await cartService.addItem(req.userId, {
      productId,
      quantity,
      customization,
      addOns,
      notes,
    });

    res
      .status(200)
      .json(new ApiResponse(200, result, 'Item added to cart successfully'));
  }
);

/**
 * Update cart item quantity
 * PATCH /api/cart/items/:itemId
 */
export const updateItemQuantity = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    // Validate itemId
    if (!itemId) {
      throw new BadRequestError('Item ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new BadRequestError('Invalid item ID format');
    }

    // Validate quantity
    if (!quantity || quantity < 1) {
      throw new BadRequestError('Quantity must be at least 1');
    }

    const result = await cartService.updateItemQuantity(
      req.userId,
      itemId,
      quantity
    );

    res
      .status(200)
      .json(new ApiResponse(200, result, 'Cart item updated successfully'));
  }
);

/**
 * Remove item from cart
 * DELETE /api/cart/items/:itemId
 */
export const removeItem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const { itemId } = req.params;

    // Validate itemId
    if (!itemId) {
      throw new BadRequestError('Item ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new BadRequestError('Invalid item ID format');
    }

    const result = await cartService.removeItem(req.userId, itemId);

    res
      .status(200)
      .json(
        new ApiResponse(200, result, 'Item removed from cart successfully')
      );
  }
);

/**
 * Clear cart
 * DELETE /api/cart
 */
export const clearCart = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const result = await cartService.clearCart(req.userId);

    res
      .status(200)
      .json(new ApiResponse(200, result, 'Cart cleared successfully'));
  }
);

/**
 * Validate cart
 * POST /api/cart/validate
 */
export const validateCart = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const result = await cartService.validateCart(req.userId);

    res
      .status(200)
      .json(new ApiResponse(200, result, 'Cart validated successfully'));
  }
);

/**
 * Set delivery address
 * PATCH /api/cart/address
 */
export const setDeliveryAddress = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const { addressId } = req.body;

    // Validate addressId
    if (!addressId) {
      throw new BadRequestError('Address ID is required');
    }

    const result = await cartService.setDeliveryAddress(req.userId, addressId);

    res
      .status(200)
      .json(
        new ApiResponse(200, result, 'Delivery address updated successfully')
      );
  }
);

/**
 * Set cart notes
 * PATCH /api/cart/notes
 */
export const setNotes = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const { notes } = req.body;

    // Validate notes
    if (notes === undefined || notes === null) {
      throw new BadRequestError('Notes field is required');
    }

    const result = await cartService.setNotes(req.userId, notes);

    res
      .status(200)
      .json(new ApiResponse(200, result, 'Cart notes updated successfully'));
  }
);

/**
 * Get cart summary
 * GET /api/cart/summary
 */
export const getCartSummary = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('User ID not found in request');
    }

    const result = await cartService.getCartSummary(req.userId);

    res
      .status(200)
      .json(new ApiResponse(200, result, 'Cart summary fetched successfully'));
  }
);
