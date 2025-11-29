import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as storeService from '../services/storeService.js';
import { BadRequestError } from '../utils/AppError.js';

export const createStore = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const storeData = req.body;

    const store = await storeService.createStore(storeData);

    res.status(201).json({
      success: true,
      data: store,
    });
  }
);

/**
 * Get all stores including inactive ones (Admin only)
 * GET /api/stores/admin/all
 */
export const getAllStoresAdmin = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // Parse pagination params
    const paginationParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    // Parse filters
    const filters = {
      city: req.query.city as string,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
    };

    const result = await storeService.getAllStoresAdmin(
      paginationParams,
      filters
    );

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

/**
 * Get all stores with optional location-based filtering
 * GET /api/stores
 * Query params: latitude, longitude, radius (in km)
 */
export const getAllStores = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { latitude, longitude, radius, city } = req.query;

    // Parse and validate location filters if provided
    let filters: {
      latitude?: number;
      longitude?: number;
      radius?: number;
      city?: string;
    } = {};

    if (latitude || longitude || radius) {
      // Validate that all location params are provided together
      if (!latitude || !longitude || !radius) {
        throw new BadRequestError(
          'Latitude, longitude, and radius must all be provided together'
        );
      }

      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const rad = parseFloat(radius as string);

      // Validate numeric values
      if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
        throw new BadRequestError(
          'Latitude, longitude, and radius must be valid numbers'
        );
      }

      // Validate latitude range
      if (lat < -90 || lat > 90) {
        throw new BadRequestError('Latitude must be between -90 and 90');
      }

      // Validate longitude range
      if (lng < -180 || lng > 180) {
        throw new BadRequestError('Longitude must be between -180 and 180');
      }

      // Validate radius is positive
      if (rad <= 0) {
        throw new BadRequestError('Radius must be greater than 0');
      }

      filters = {
        latitude: lat,
        longitude: lng,
        radius: rad,
      };
    }

    if (city) {
      filters.city = city as string;
    }

    // Parse pagination params
    const paginationParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await storeService.getAllStores(filters, paginationParams);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

/**
 * Get store by ID
 * GET /api/stores/:id
 */
export const getStoreById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Store ID is required');
    }

    const store = await storeService.getStoreById(id);

    res.status(200).json({
      success: true,
      data: store,
    });
  }
);

/**
 * Get store by slug
 * GET /api/stores/slug/:slug
 */
export const getStoreBySlug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;

    if (!slug) {
      throw new BadRequestError('Store slug is required');
    }

    const store = await storeService.getStoreBySlug(slug);

    res.status(200).json({
      success: true,
      data: store,
    });
  }
);

/**
 * Get available pickup times for a store
 * GET /api/stores/:id/pickup-times
 * Query params: date (optional, ISO string)
 */
export const getPickupTimes = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { date } = req.query;

    if (!id) {
      throw new BadRequestError('Store ID is required');
    }

    // Parse date if provided
    let targetDate: Date | undefined;
    if (date) {
      targetDate = new Date(date as string);
      if (isNaN(targetDate.getTime())) {
        throw new BadRequestError('Invalid date format');
      }
    }

    const pickupTimes = await storeService.getAvailablePickupTimes(
      id,
      targetDate
    );

    res.status(200).json({
      success: true,
      data: pickupTimes,
    });
  }
);

/**
 * Get store gallery images
 * GET /api/stores/:storeId/gallery
 */
export const getStoreGallery = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;

    if (!storeId) {
      throw new BadRequestError('Store ID is required');
    }

    const gallery = await storeService.getStoreGallery(storeId);

    res.status(200).json({
      success: true,
      data: gallery,
    });
  }
);

/**
 * Get store opening hours
 * GET /api/stores/:storeId/hours
 */
export const getStoreHours = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;

    if (!storeId) {
      throw new BadRequestError('Store ID is required');
    }

    const hours = await storeService.getStoreHours(storeId);

    res.status(200).json({
      success: true,
      data: hours,
    });
  }
);

/**
 * Get store location details
 * GET /api/stores/:storeId/location
 */
export const getStoreLocation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;

    if (!storeId) {
      throw new BadRequestError('Store ID is required');
    }

    const location = await storeService.getStoreLocation(storeId);

    res.status(200).json({
      success: true,
      data: location,
    });
  }
);

/**
 * Update store details (Admin only)
 * PUT /api/stores/:id
 */
export const updateStore = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('Store ID is required');
    }

    const store = await storeService.updateStore(id, updateData);

    res.status(200).json({
      success: true,
      data: store,
      message: 'Store updated successfully',
    });
  }
);

/**
 * Delete store (Admin only)
 * DELETE /api/stores/:id
 */
export const deleteStore = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Store ID is required');
    }

    await storeService.deleteStore(id);

    res.status(200).json({
      success: true,
      message: 'Store deleted successfully',
    });
  }
);

/**
 * Toggle store status (Admin only)
 * PATCH /api/stores/:id/status
 */
export const toggleStoreStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Store ID is required');
    }

    const store = await storeService.toggleStoreStatus(id);

    res.status(200).json({
      success: true,
      data: store,
      message: `Store ${store.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  }
);
