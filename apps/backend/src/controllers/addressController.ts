import type { Request, Response } from 'express';
import { addressService } from '../services/addressService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';

/**
 * Get all addresses for authenticated user
 * Requirements: 20.1
 * GET /api/users/me/addresses
 */
export const getAddresses = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const addresses = await addressService.getAddresses(userId);

    res.json({
      success: true,
      data: addresses,
    });
  }
);

/**
 * Add a new address
 * Requirements: 20.2, 20.6
 * POST /api/users/me/addresses
 */
export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const {
    label,
    fullName,
    phoneNumber,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    latitude,
    longitude,
    isDefault,
    deliveryInstructions,
  } = req.body;

  // Validate required fields
  if (!label || !fullName || !phoneNumber || !addressLine1 || !city || !state) {
    throw new BadRequestError(
      'Label, full name, phone number, address line 1, city, and state are required'
    );
  }

  const address = await addressService.addAddress(userId, {
    label,
    fullName,
    phoneNumber,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    latitude,
    longitude,
    isDefault,
    deliveryInstructions,
  });

  res.status(201).json({
    success: true,
    data: address,
    message: 'Address added successfully',
  });
});

/**
 * Update an existing address
 * Requirements: 20.3, 20.6
 * PATCH /api/users/me/addresses/:addressId
 */
export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const addressId = req.params.addressId as string;

    if (!addressId) {
      throw new BadRequestError('Address ID is required');
    }

    const {
      label,
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      deliveryInstructions,
    } = req.body;

    const address = await addressService.updateAddress(userId, addressId, {
      label,
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      deliveryInstructions,
    });

    res.json({
      success: true,
      data: address,
      message: 'Address updated successfully',
    });
  }
);

/**
 * Delete an address
 * Requirements: 20.4
 * DELETE /api/users/me/addresses/:addressId
 */
export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const addressId = req.params.addressId as string;

    if (!addressId) {
      throw new BadRequestError('Address ID is required');
    }

    await addressService.deleteAddress(userId, addressId);

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  }
);

/**
 * Set an address as default
 * Requirements: 20.5
 * PATCH /api/users/me/addresses/:addressId/default
 */
export const setDefaultAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const addressId = req.params.addressId as string;

    if (!addressId) {
      throw new BadRequestError('Address ID is required');
    }

    const address = await addressService.setDefaultAddress(userId, addressId);

    res.json({
      success: true,
      data: address,
      message: 'Default address updated successfully',
    });
  }
);
