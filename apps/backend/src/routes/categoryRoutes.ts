import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import * as productController from '../controllers/productController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  categorySlugParamSchema,
  idParamSchema,
  categoryIdParamSchema,
  reorderCategoriesSchema,
} from '../schemas/index.js';

const router = express.Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get(
  '/slug/:slug',
  validate(categorySlugParamSchema),
  categoryController.getCategoryBySlug
);
router.get('/:id', validate(idParamSchema), categoryController.getCategoryById);
router.get(
  '/:id/subcategories',
  validate(idParamSchema),
  categoryController.getSubcategories
);
router.get(
  '/:categoryId/products',
  validate(categoryIdParamSchema),
  productController.getProductsByCategory
);

// Admin routes
router.patch(
  '/reorder',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(reorderCategoriesSchema),
  categoryController.reorderCategories
);

export default router;
