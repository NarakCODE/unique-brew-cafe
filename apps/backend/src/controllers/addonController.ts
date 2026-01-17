import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as addonService from '../services/addonService.js';
import { BadRequestError } from '../utils/AppError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Create a new add-on
 * POST /api/addons
 * Admin only
 */
export const createAddOn = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const addOnData = req.body;

    const addOn = await addonService.createAddOn(addOnData);

    res
      .status(201)
      .json(new ApiResponse(201, addOn, 'Add-on created successfully'));
  }
);

/**
 * Get all add-ons
 * GET /api/addons
 */
export const getAllAddOns = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const addOns = await addonService.getAllAddOns();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          addOns,
          count: addOns.length,
        },
        'Add-ons fetched successfully'
      )
    );
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

    res
      .status(200)
      .json(new ApiResponse(200, addOn, 'Add-on updated successfully'));
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

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Add-on deleted successfully'));
  }
);
