import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as addonService from '../services/addonService.js';
import { BadRequestError } from '../utils/AppError.js';

/**
 * Create a new add-on
 * POST /api/addons
 * Admin only
 */
export const createAddOn = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const addOnData = req.body;

    const addOn = await addonService.createAddOn(addOnData);

    res.status(201).json({
      success: true,
      message: 'Add-on created successfully',
      data: addOn,
    });
  }
);

/**
 * Get all add-ons
 * GET /api/addons
 */
export const getAllAddOns = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const addOns = await addonService.getAllAddOns();

    res.status(200).json({
      success: true,
      data: {
        addOns,
        count: addOns.length,
      },
    });
  }
);

/**
 * Update an add-on
 * PUT /api/addons/:id
 * Admin only
 */
export const updateAddOn = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('Add-on ID is required');
    }

    const addOn = await addonService.updateAddOn(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Add-on updated successfully',
      data: addOn,
    });
  }
);

/**
 * Delete an add-on (soft delete)
 * DELETE /api/addons/:id
 * Admin only
 */
export const deleteAddOn = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Add-on ID is required');
    }

    await addonService.deleteAddOn(id);

    res.status(200).json({
      success: true,
      message: 'Add-on deleted successfully',
    });
  }
);
