import express, { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import * as productController from '../controllers/productController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../middlewares/upload.js';
import {
  searchProductsQuerySchema,
  productSlugParamSchema,
  getProductsQuerySchema,
  idParamSchema,
  updateProductStatusSchema,
  duplicateProductSchema,
  createProductSchema,
  updateProductSchema,
} from '../schemas/index.js';

const router: Router = express.Router();

/**
 * Middleware to process uploaded images after multer
 * Merges uploaded file URLs into req.body.images for validation
 */
const processUploadedImages = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const files = (req as any).files as Express.Multer.File[] | undefined;

  // Get existing images from body (may be JSON string or array)
  let existingImages: string[] = [];
  if (req.body.images) {
    if (typeof req.body.images === 'string') {
      try {
        const parsed = JSON.parse(req.body.images);
        existingImages = Array.isArray(parsed) ? parsed : [req.body.images];
      } catch {
        // If it's not JSON, treat as a single URL
        existingImages = [req.body.images];
      }
    } else if (Array.isArray(req.body.images)) {
      existingImages = req.body.images;
    }
  }

  // Filter to only keep valid URLs
  existingImages = existingImages.filter(
    (img) => typeof img === 'string' && img.startsWith('http')
  );

  // Get uploaded file URLs
  const uploadedUrls: string[] = [];
  if (files && files.length > 0) {
    files.forEach((file) => {
      if (file.path) {
        uploadedUrls.push(file.path);
      }
    });
  }

  // Merge all images
  const allImages = [...existingImages, ...uploadedUrls];

  // Update req.body.images with the merged array
  req.body.images = allImages;

  next();
};

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

// Admin only: Get all products (includes unavailable)
router.get(
  '/admin/all',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(getProductsQuerySchema),
  productController.getAllProductsAdmin
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

// Admin only: Create product
router.post(
  '/',
  authenticate,
  authorize({ roles: ['admin'] }),
  upload.array('images', 10),
  processUploadedImages,
  validate(createProductSchema),
  productController.createProduct
);

// Admin only: Update product
router.patch(
  '/:id',
  authenticate,
  authorize({ roles: ['admin'] }),
  upload.array('images', 10),
  processUploadedImages,
  validate(updateProductSchema),
  productController.updateProduct
);

// Admin only: Delete product
router.delete(
  '/:id',
  authenticate,
  authorize({ roles: ['admin'] }),
  productController.deleteProduct
);

export default router;
