import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  searchProductsQuerySchema,
  productSlugParamSchema,
  getProductsQuerySchema,
  idParamSchema,
  updateProductStatusSchema,
  duplicateProductSchema,
} from '../schemas/index.js';

const router = Router();

/**
 * Product Routes
 * Base path: /api/products
 */

// Search products (must be before /:id to avoid conflict)
router.get(
  '/search',
  validate(searchProductsQuerySchema),
  productController.searchProducts
);

// Get product by slug (must be before /:id to avoid conflict)
router.get(
  '/slug/:slug',
  validate(productSlugParamSchema),
  productController.getProductBySlug
);

// Get all products with filtering
router.get(
  '/',
  validate(getProductsQuerySchema),
  productController.getProducts
);

// Get product by ID
router.get('/:id', validate(idParamSchema), productController.getProductById);

// Get product customizations
router.get(
  '/:id/customizations',
  validate(idParamSchema),
  productController.getProductCustomizations
);

// Get product add-ons
router.get(
  '/:id/addons',
  validate(idParamSchema),
  productController.getProductAddOns
);

// Admin only: Update product status
router.patch(
  '/:productId/status',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(updateProductStatusSchema),
  productController.updateProductStatus
);

// Admin only: Duplicate product
router.post(
  '/:productId/duplicate',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(duplicateProductSchema),
  productController.duplicateProduct
);

export default router;
