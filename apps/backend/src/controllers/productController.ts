import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as productService from '../services/productService.js';
import { BadRequestError } from '../utils/AppError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Get all products with optional filtering
 * GET /api/products
 * Query params: categoryId, isFeatured, isBestSelling, tags, minPrice, maxPrice, search
 */
export const getProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      categoryId,
      isFeatured,
      isBestSelling,
      tags,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    // Build filters
    const filters: {
      categoryId?: string;
      isFeatured?: boolean;
      isBestSelling?: boolean;
      tags?: string[];
      minPrice?: number;
      maxPrice?: number;
      search?: string;
    } = {};

    if (categoryId) {
      filters.categoryId = categoryId as string;
    }

    if (isFeatured !== undefined) {
      filters.isFeatured = isFeatured === 'true';
    }

    if (isBestSelling !== undefined) {
      filters.isBestSelling = isBestSelling === 'true';
    }

    if (tags) {
      filters.tags = Array.isArray(tags)
        ? (tags as string[])
        : [tags as string];
    }

    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (isNaN(min) || min < 0) {
        throw new BadRequestError('minPrice must be a non-negative number');
      }
      filters.minPrice = min;
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (isNaN(max) || max < 0) {
        throw new BadRequestError('maxPrice must be a non-negative number');
      }
      filters.maxPrice = max;
    }

    if (search) {
      filters.search = search as string;
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

    const result = await productService.getProducts(filters, paginationParams);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { items: result.data, pagination: result.pagination },
          'Products fetched successfully'
        )
      );
  }
);

/**
 * Get product by ID
 * GET /api/products/:id
 */
export const getProductById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Product ID is required');
    }

    const product = await productService.getProductById(id);

    res
      .status(200)
      .json(new ApiResponse(200, product, 'Product fetched successfully'));
  }
);

/**
 * Get product by slug
 * GET /api/products/slug/:slug
 */
export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;

    if (!slug) {
      throw new BadRequestError('Product slug is required');
    }

    const product = await productService.getProductBySlug(slug);

    res
      .status(200)
      .json(new ApiResponse(200, product, 'Product fetched successfully'));
  }
);

/**
 * Search products
 * GET /api/products/search
 * Query params: q (query), categoryId, isFeatured, isBestSelling, tags, minPrice, maxPrice
 */
export const searchProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      q,
      categoryId,
      isFeatured,
      isBestSelling,
      tags,
      minPrice,
      maxPrice,
    } = req.query;

    if (!q) {
      throw new BadRequestError('Search query (q) is required');
    }

    // Build filters
    const filters: {
      categoryId?: string;
      isFeatured?: boolean;
      isBestSelling?: boolean;
      tags?: string[];
      minPrice?: number;
      maxPrice?: number;
    } = {};

    if (categoryId) {
      filters.categoryId = categoryId as string;
    }

    if (isFeatured !== undefined) {
      filters.isFeatured = isFeatured === 'true';
    }

    if (isBestSelling !== undefined) {
      filters.isBestSelling = isBestSelling === 'true';
    }

    if (tags) {
      filters.tags = Array.isArray(tags)
        ? (tags as string[])
        : [tags as string];
    }

    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (isNaN(min) || min < 0) {
        throw new BadRequestError('minPrice must be a non-negative number');
      }
      filters.minPrice = min;
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (isNaN(max) || max < 0) {
        throw new BadRequestError('maxPrice must be a non-negative number');
      }
      filters.maxPrice = max;
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

    const result = await productService.searchProducts(
      q as string,
      filters,
      paginationParams
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { items: result.data, pagination: result.pagination },
          'Products found'
        )
      );
  }
);

/**
 * Get products by store (store menu)
 * GET /api/stores/:storeId/menu
 * Query params: categoryId, isFeatured, isBestSelling, tags, minPrice, maxPrice
 */
export const getStoreMenu = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;
    const { categoryId, isFeatured, isBestSelling, tags, minPrice, maxPrice } =
      req.query;

    if (!storeId) {
      throw new BadRequestError('Store ID is required');
    }

    // Build filters
    const filters: {
      categoryId?: string;
      isFeatured?: boolean;
      isBestSelling?: boolean;
      tags?: string[];
      minPrice?: number;
      maxPrice?: number;
    } = {};

    if (categoryId) {
      filters.categoryId = categoryId as string;
    }

    if (isFeatured !== undefined) {
      filters.isFeatured = isFeatured === 'true';
    }

    if (isBestSelling !== undefined) {
      filters.isBestSelling = isBestSelling === 'true';
    }

    if (tags) {
      filters.tags = Array.isArray(tags)
        ? (tags as string[])
        : [tags as string];
    }

    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (isNaN(min) || min < 0) {
        throw new BadRequestError('minPrice must be a non-negative number');
      }
      filters.minPrice = min;
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (isNaN(max) || max < 0) {
        throw new BadRequestError('maxPrice must be a non-negative number');
      }
      filters.maxPrice = max;
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

    const result = await productService.getProductsByStore(
      storeId,
      filters,
      paginationParams
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { items: result.data, pagination: result.pagination },
          'Store menu fetched successfully'
        )
      );
  }
);

/**
 * Get product customizations
 * GET /api/products/:id/customizations
 */
export const getProductCustomizations = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Product ID is required');
    }

    const customizations = await productService.getProductCustomizations(id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { productId: id, customizations },
          'Product customizations fetched successfully'
        )
      );
  }
);

/**
 * Get product add-ons
 * GET /api/products/:id/addons
 */
export const getProductAddOns = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Product ID is required');
    }

    const addOns = await productService.getProductAddOns(id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { productId: id, addOns },
          'Product add-ons fetched successfully'
        )
      );
  }
);

/**
 * Get products by category
 * GET /api/categories/:categoryId/products
 */
export const getProductsByCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { categoryId } = req.params;

    if (!categoryId) {
      throw new BadRequestError('Category ID is required');
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

    const result = await productService.getProductsByCategory(
      categoryId,
      paginationParams
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { items: result.data, pagination: result.pagination },
          'Category products fetched successfully'
        )
      );
  }
);

/**
 * Update product status (availability)
 * PATCH /api/products/:productId/status
 * Admin only
 */
export const updateProductStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;
    const { isAvailable } = req.body;

    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }

    if (typeof isAvailable !== 'boolean') {
      throw new BadRequestError('isAvailable must be a boolean value');
    }

    const product = await productService.updateProductStatus(
      productId,
      isAvailable
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          product,
          `Product ${isAvailable ? 'activated' : 'deactivated'} successfully`
        )
      );
  }
);

/**
 * Duplicate a product
 * POST /api/products/:productId/duplicate
 * Admin only
 */
export const duplicateProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;

    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }

    const duplicatedProduct = await productService.duplicateProduct(productId);

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          duplicatedProduct,
          'Product duplicated successfully'
        )
      );
  }
);

/**
 * Create a new product
 * POST /api/products
 * Admin only
 */
export const createProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productData: Record<string, any> = { ...req.body };

    // Parse JSON strings from FormData for arrays and objects
    if (typeof productData.allergens === 'string') {
      try {
        productData.allergens = JSON.parse(productData.allergens);
      } catch {
        productData.allergens = [];
      }
    }
    if (typeof productData.tags === 'string') {
      try {
        productData.tags = JSON.parse(productData.tags);
      } catch {
        productData.tags = [];
      }
    }
    if (typeof productData.sizes === 'string') {
      try {
        productData.sizes = JSON.parse(productData.sizes);
      } catch {
        productData.sizes = [];
      }
    }
    if (typeof productData.nutritionalInfo === 'string') {
      try {
        productData.nutritionalInfo = JSON.parse(productData.nutritionalInfo);
      } catch {
        productData.nutritionalInfo = undefined;
      }
    }

    // Parse numeric fields from FormData
    if (typeof productData.basePrice === 'string') {
      productData.basePrice = parseFloat(productData.basePrice);
    }
    if (typeof productData.preparationTime === 'string') {
      productData.preparationTime = parseInt(productData.preparationTime, 10);
    }
    if (typeof productData.displayOrder === 'string') {
      productData.displayOrder = parseInt(productData.displayOrder, 10);
    }

    // Parse boolean fields from FormData
    if (typeof productData.isAvailable === 'string') {
      productData.isAvailable = productData.isAvailable === 'true';
    }
    if (typeof productData.isFeatured === 'string') {
      productData.isFeatured = productData.isFeatured === 'true';
    }
    if (typeof productData.isBestSelling === 'string') {
      productData.isBestSelling = productData.isBestSelling === 'true';
    }

    // Handle uploaded files (multiple images)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files = (req as any).files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const uploadedUrls = files.map((file) => file.path);
      // Merge with any existing image URLs from the request
      const existingImages = Array.isArray(productData.images)
        ? productData.images.filter(
            (img: string) => typeof img === 'string' && img.startsWith('http')
          )
        : [];
      productData.images = [...existingImages, ...uploadedUrls];
    }

    // Fallback for single file upload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const singleFile = (req as any).file as Express.Multer.File | undefined;
    if (singleFile && singleFile.path) {
      if (!productData.images || productData.images.length === 0) {
        productData.images = [singleFile.path];
      }
    }

    const product = await productService.createProduct(productData);

    res
      .status(201)
      .json(new ApiResponse(201, product, 'Product created successfully'));
  }
);

/**
 * Update a product
 * PATCH /api/products/:id
 * Admin only
 */
export const updateProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) throw new BadRequestError('Product ID is required');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productData: Record<string, any> = { ...req.body };

    // Parse JSON strings from FormData for arrays and objects
    if (typeof productData.allergens === 'string') {
      try {
        productData.allergens = JSON.parse(productData.allergens);
      } catch {
        productData.allergens = [];
      }
    }
    if (typeof productData.tags === 'string') {
      try {
        productData.tags = JSON.parse(productData.tags);
      } catch {
        productData.tags = [];
      }
    }
    if (typeof productData.sizes === 'string') {
      try {
        productData.sizes = JSON.parse(productData.sizes);
      } catch {
        productData.sizes = [];
      }
    }
    if (typeof productData.nutritionalInfo === 'string') {
      try {
        productData.nutritionalInfo = JSON.parse(productData.nutritionalInfo);
      } catch {
        productData.nutritionalInfo = undefined;
      }
    }

    // Parse numeric fields from FormData
    if (typeof productData.basePrice === 'string') {
      productData.basePrice = parseFloat(productData.basePrice);
    }
    if (typeof productData.preparationTime === 'string') {
      productData.preparationTime = parseInt(productData.preparationTime, 10);
    }
    if (typeof productData.displayOrder === 'string') {
      productData.displayOrder = parseInt(productData.displayOrder, 10);
    }

    // Parse boolean fields from FormData
    if (typeof productData.isAvailable === 'string') {
      productData.isAvailable = productData.isAvailable === 'true';
    }
    if (typeof productData.isFeatured === 'string') {
      productData.isFeatured = productData.isFeatured === 'true';
    }
    if (typeof productData.isBestSelling === 'string') {
      productData.isBestSelling = productData.isBestSelling === 'true';
    }

    // Handle uploaded files (multiple images)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files = (req as any).files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const uploadedUrls = files.map((file) => file.path);
      // Merge with any existing image URLs from the request
      const existingImages = Array.isArray(productData.images)
        ? productData.images.filter(
            (img: string) => typeof img === 'string' && img.startsWith('http')
          )
        : [];
      productData.images = [...existingImages, ...uploadedUrls];
    }

    // Fallback for single file upload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const singleFile = (req as any).file as Express.Multer.File | undefined;
    if (singleFile && singleFile.path) {
      if (!productData.images || productData.images.length === 0) {
        productData.images = [singleFile.path];
      }
    }

    const product = await productService.updateProduct(id, productData);

    res
      .status(200)
      .json(new ApiResponse(200, product, 'Product updated successfully'));
  }
);

/**
 * Delete a product
 * DELETE /api/products/:id
 * Admin only
 */
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) throw new BadRequestError('Product ID is required');

    await productService.deleteProduct(id);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Product deleted successfully'));
  }
);
