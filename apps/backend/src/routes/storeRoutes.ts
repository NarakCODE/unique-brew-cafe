import express from 'express';
import * as storeController from '../controllers/storeController.js';
import * as productController from '../controllers/productController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  createStoreSchema,
  getStoresQuerySchema,
  storeSlugParamSchema,
  idParamSchema,
  getPickupTimesSchema,
  storeIdParamSchema,
  getStoreMenuSchema,
  updateStoreSchema,
} from '../schemas/index.js';

const router = express.Router();

// Admin-only routes - Create store
router.post(
  '/',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(createStoreSchema),
  storeController.createStore
);

/**
 * GET /api/stores/admin/all
 * Get all stores including inactive ones (Admin only)
 */
router.get(
  '/admin/all',
  authenticate,
  authorize({ roles: ['admin'] }),
  storeController.getAllStoresAdmin
);

/**
 * GET /api/stores
 * Get all active stores
 * Query params:
 * - latitude: User's latitude (optional)
 * - longitude: User's longitude (optional)
 * - radius: Search radius in kilometers (optional)
 */
router.get('/', validate(getStoresQuerySchema), storeController.getAllStores);

/**
 * GET /api/stores/slug/:slug
 * Get store by slug
 */
router.get(
  '/slug/:slug',
  validate(storeSlugParamSchema),
  storeController.getStoreBySlug
);

/**
 * GET /api/stores/:id
 * Get store by ID
 */
router.get('/:id', validate(idParamSchema), storeController.getStoreById);

/**
 * GET /api/stores/:id/pickup-times
 * Get available pickup times for a store
 * Query params:
 * - date: Target date in ISO format (optional, defaults to today)
 */
router.get(
  '/:id/pickup-times',
  validate(getPickupTimesSchema),
  storeController.getPickupTimes
);

/**
 * GET /api/stores/:storeId/gallery
 * Get store gallery images
 */
router.get(
  '/:storeId/gallery',
  validate(storeIdParamSchema),
  storeController.getStoreGallery
);

/**
 * GET /api/stores/:storeId/hours
 * Get store opening hours and special hours
 */
router.get(
  '/:storeId/hours',
  validate(storeIdParamSchema),
  storeController.getStoreHours
);

/**
 * GET /api/stores/:storeId/location
 * Get store location details
 */
router.get(
  '/:storeId/location',
  validate(storeIdParamSchema),
  storeController.getStoreLocation
);

/**
 * GET /api/stores/:storeId/menu
 * Get menu (products) for a specific store
 * Query params:
 * - categoryId: Filter by category (optional)
 * - isFeatured: Filter featured products (optional)
 * - isBestSelling: Filter best selling products (optional)
 * - tags: Filter by tags (optional)
 * - minPrice: Minimum price filter (optional)
 * - maxPrice: Maximum price filter (optional)
 */
router.get(
  '/:storeId/menu',
  validate(getStoreMenuSchema),
  productController.getStoreMenu
);

// Admin-only routes - Update, Delete, Toggle Status
/**
 * PUT /api/stores/:id
 * Update store details (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(updateStoreSchema),
  storeController.updateStore
);

/**
 * DELETE /api/stores/:id
 * Delete store (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(idParamSchema),
  storeController.deleteStore
);

/**
 * PATCH /api/stores/:id/status
 * Toggle store active status (Admin only)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(idParamSchema),
  storeController.toggleStoreStatus
);

export default router;
