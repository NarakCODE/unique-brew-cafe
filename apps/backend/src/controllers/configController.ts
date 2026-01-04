import type { Request, Response } from 'express';
import { configService } from '../services/configService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Get public configuration
 * GET /config/app
 */
export const getPublicConfig = asyncHandler(
  async (_req: Request, res: Response) => {
    const config = await configService.getPublicConfig();

    res
      .status(200)
      .json(new ApiResponse(200, config, 'Public config fetched successfully'));
  }
);

/**
 * Get delivery zones
 * GET /config/delivery-zones
 */
export const getDeliveryZones = asyncHandler(
  async (req: Request, res: Response) => {
    // If admin, can see all (including inactive) if requested?
    // For now, public endpoint returns only active. Admin endpoint might be separate or use query param.
    // Let's assume this is the public endpoint.
    const zones = await configService.getDeliveryZones(true);

    res
      .status(200)
      .json(new ApiResponse(200, zones, 'Delivery zones fetched successfully'));
  }
);

/**
 * Get system health
 * GET /health
 */
export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const health = await configService.getSystemHealth();

  res
    .status(200)
    .json(new ApiResponse(200, health, 'System health fetched successfully'));
});

/**
 * Update app configuration (Admin)
 * PATCH /config/app
 */
export const updateAppConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const { key, value, description, isPublic, type } = req.body;

    if (!key || value === undefined) {
      throw new BadRequestError('Key and value are required');
    }

    const config = await configService.updateConfig(
      key,
      value,
      description,
      isPublic,
      type
    );

    res
      .status(200)
      .json(new ApiResponse(200, config, 'App config updated successfully'));
  }
);

/**
 * Create delivery zone (Admin)
 * POST /config/delivery-zones
 */
export const createDeliveryZone = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      deliveryFee,
      minOrderAmount,
      coordinates,
      estimatedDeliveryTime,
    } = req.body;

    if (!name || deliveryFee === undefined) {
      throw new BadRequestError('Name and delivery fee are required');
    }

    const zone = await configService.createDeliveryZone({
      name,
      deliveryFee,
      minOrderAmount,
      coordinates,
      estimatedDeliveryTime,
    });

    res
      .status(201)
      .json(new ApiResponse(201, zone, 'Delivery zone created successfully'));
  }
);

/**
 * Update delivery zone (Admin)
 * PATCH /config/delivery-zones/:id
 */
export const updateDeliveryZone = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('Delivery zone ID is required');
    }

    const zone = await configService.updateDeliveryZone(id, updateData);

    res
      .status(200)
      .json(new ApiResponse(200, zone, 'Delivery zone updated successfully'));
  }
);

/**
 * Delete delivery zone (Admin)
 * DELETE /config/delivery-zones/:id
 */
export const deleteDeliveryZone = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Delivery zone ID is required');
    }

    await configService.deleteDeliveryZone(id);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Delivery zone deleted successfully'));
  }
);
