import mongoose from 'mongoose';
import {
  Product,
  type IProduct,
  type INutritionalInfo,
} from '../models/Product.js';
import {
  ProductCustomization,
  type IProductCustomization,
  type ICustomizationOption,
} from '../models/ProductCustomization.js';
import { AddOn } from '../models/AddOn.js';
import { ProductAddOn } from '../models/ProductAddOn.js';
import { Category } from '../models/Category.js';
import { NotFoundError, BadRequestError } from '../utils/AppError.js';
import { getAddOnsByProductId } from './addonService.js';
import {
  parsePaginationParams,
  buildPaginationResult,
  type PaginationParams,
  type PaginationResult,
} from '../utils/pagination.js';

interface ProductFilters {
  categoryId?: string;
  isFeatured?: boolean;
  isBestSelling?: boolean;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface ProductCustomizationResult {
  id: string;
  productId: mongoose.Types.ObjectId;
  customizationType: IProductCustomization['customizationType'];
  options: ICustomizationOption[];
  isRequired: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PopulatedCategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  imageUrl?: string;
  icon?: string;
}

export interface ProductResponse {
  id: string;
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  categoryId: PopulatedCategory | mongoose.Types.ObjectId;
  category: PopulatedCategory | mongoose.Types.ObjectId;
  images: string[];
  basePrice: number;
  currency: 'USD' | 'KHR';
  preparationTime: number;
  calories?: number;
  rating?: number;
  totalReviews: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSelling: boolean;
  allergens: string[];
  tags: string[];
  nutritionalInfo?: INutritionalInfo;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ProductAddOnResponse {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  // isDefault: boolean;
}

export interface ProductDetailResponse extends ProductResponse {
  customizations: ProductCustomizationResult[];
  addOns: ProductAddOnResponse[];
}

/**
 * Get products with optional filtering and pagination
 * @param filters - Optional filters for products
 * @param paginationParams - Pagination parameters
 * @returns Paginated products
 */
export const getProducts = async (
  filters?: ProductFilters,
  paginationParams?: PaginationParams
): Promise<PaginationResult<ProductResponse>> => {
  // Build query
  const query: mongoose.FilterQuery<IProduct> = {
    isAvailable: true,
    deletedAt: null,
  };

  // Category filter
  if (filters?.categoryId) {
    query.categoryId = filters.categoryId;
  }

  // Featured filter
  if (filters?.isFeatured !== undefined) {
    query.isFeatured = filters.isFeatured;
  }

  // Best selling filter
  if (filters?.isBestSelling !== undefined) {
    query.isBestSelling = filters.isBestSelling;
  }

  // Tags filter
  if (filters?.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  // Price range filter
  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    query.basePrice = {};
    if (filters.minPrice !== undefined) {
      query.basePrice.$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      query.basePrice.$lte = filters.maxPrice;
    }
  }

  // Search filter (name or description)
  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  // Parse pagination parameters
  const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(
    paginationParams || {}
  );

  // Build sort object - default to displayOrder, then name
  const sort: Record<string, 1 | -1> =
    sortBy === 'createdAt'
      ? { [sortBy]: sortOrder }
      : { displayOrder: 1, name: 1 };

  // Execute query with pagination and projection
  const [products, total] = await Promise.all([
    Product.find(query)
      .select('-__v') // Exclude version key
      .populate('categoryId', 'name slug imageUrl icon')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  const mappedProducts = products.map((product) => ({
    ...product,
    id: product._id?.toString(),
    category: product.categoryId,
  })) as unknown as ProductResponse[];

  return buildPaginationResult(mappedProducts, total, page, limit);
};

/**
 * Get product by ID with full details
 * @param productId - Product ID
 * @returns Product details with customizations and add-ons
 * @throws NotFoundError if product not found or unavailable
 */
export const getProductById = async (
  productId: string
): Promise<ProductDetailResponse> => {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new BadRequestError('Invalid product ID');
  }

  const product = await Product.findOne({
    _id: productId,
    isAvailable: true,
    deletedAt: null,
  })
    .populate('categoryId', 'name slug imageUrl icon')
    .lean();

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Get customizations
  const customizations = await ProductCustomization.find({
    productId: product._id,
  })
    .sort({ displayOrder: 1 })
    .lean();

  // Get add-ons
  const addOns = await getAddOnsByProductId(product._id.toString());

  return {
    ...product,
    id: product._id?.toString(),
    category: product.categoryId,
    customizations: customizations.map((c) => ({
      ...c,
      id: c._id?.toString(),
    })),
    addOns,
  } as unknown as ProductDetailResponse;
};

/**
 * Get product by slug with full details
 * @param slug - Product slug
 * @returns Product details with customizations and add-ons
 * @throws NotFoundError if product not found or unavailable
 */
export const getProductBySlug = async (
  slug: string
): Promise<ProductDetailResponse> => {
  const product = await Product.findOne({
    slug,
    isAvailable: true,
    deletedAt: null,
  })
    .populate('categoryId', 'name slug imageUrl icon')
    .lean();

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Get customizations
  const customizations = await ProductCustomization.find({
    productId: product._id,
  })
    .sort({ displayOrder: 1 })
    .lean();

  // Get add-ons
  const addOns = await getAddOnsByProductId(product._id.toString());

  return {
    ...product,
    id: product._id?.toString(),
    category: product.categoryId,
    customizations: customizations.map((c) => ({
      ...c,
      id: c._id?.toString(),
    })),
    addOns,
  } as unknown as ProductDetailResponse;
};

/**
 * Search products by query string
 * @param query - Search query
 * @param filters - Optional additional filters
 * @param paginationParams - Pagination parameters
 * @returns Paginated matching products
 */
export const searchProducts = async (
  query: string,
  filters?: Omit<ProductFilters, 'search'>,
  paginationParams?: PaginationParams
): Promise<PaginationResult<ProductResponse>> => {
  return getProducts(
    {
      ...filters,
      search: query,
    },
    paginationParams
  );
};

/**
 * Get products by store (menu for a specific store)
 * Note: StoreInventory model not yet implemented, so returning all available products
 * @param storeId - Store ID
 * @param filters - Optional filters
 * @param paginationParams - Pagination parameters
 * @returns Paginated products available at the store
 */
export const getProductsByStore = async (
  storeId: string,
  filters?: ProductFilters,
  paginationParams?: PaginationParams
): Promise<PaginationResult<ProductResponse>> => {
  // Validate store ID
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new BadRequestError('Invalid store ID');
  }

  // TODO: When StoreInventory is implemented, filter by store availability
  // For now, return all available products
  return getProducts(filters, paginationParams);
};

/**
 * Get product customizations
 * @param productId - Product ID
 * @returns Array of customization options
 */
export const getProductCustomizations = async (
  productId: string
): Promise<ProductCustomizationResult[]> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new BadRequestError('Invalid product ID');
  }

  const customizations = await ProductCustomization.find({
    productId,
  })
    .sort({ displayOrder: 1 })
    .lean();

  return customizations.map((c) => ({
    ...c,
    id: c._id?.toString(),
  }));
};

/**
 * Get product add-ons
 * @param productId - Product ID
 * @returns Array of available add-ons
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getProductAddOns = async (productId: string): Promise<any[]> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new BadRequestError('Invalid product ID');
  }

  const addOns = await getAddOnsByProductId(productId);

  return addOns;
};

/**
 * Calculate product price with customizations and add-ons
 * @param productId - Product ID
 * @param customizationSelections - Selected customization options
 * @param addOnIds - Selected add-on IDs
 * @returns Total price
 */
export const calculateProductPrice = async (
  productId: string,
  customizationSelections: { customizationType: string; optionId: string }[],
  addOnIds: string[]
): Promise<number> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new BadRequestError('Invalid product ID');
  }

  // Get product
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  let totalPrice = product.basePrice;

  // Add customization price modifiers
  for (const selection of customizationSelections) {
    const customization = await ProductCustomization.findOne({
      productId,
      customizationType: selection.customizationType,
    });

    if (customization) {
      const option = customization.options.find(
        (opt) => opt.id === selection.optionId
      );
      if (option) {
        totalPrice += option.priceModifier;
      }
    }
  }

  // Add add-on prices
  for (const addOnId of addOnIds) {
    if (mongoose.Types.ObjectId.isValid(addOnId)) {
      const addOn = await AddOn.findById(addOnId);
      if (addOn && addOn.isAvailable) {
        totalPrice += addOn.price;
      }
    }
  }

  return totalPrice;
};

/**
 * Get products by category
 * @param categoryId - Category ID
 * @param paginationParams - Pagination parameters
 * @returns Paginated products in the category
 */
export const getProductsByCategory = async (
  categoryId: string,
  paginationParams?: PaginationParams
): Promise<PaginationResult<ProductResponse>> => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new BadRequestError('Invalid category ID');
  }

  // Verify category exists
  const category = await Category.findOne({ _id: categoryId, isActive: true });
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  return getProducts({ categoryId }, paginationParams);
};

/**
 * Update product status (availability)
 * @param productId - Product ID
 * @param isAvailable - New availability status
 * @returns Updated product
 * @throws NotFoundError if product not found
 */

export const updateProductStatus = async (
  productId: string,
  isAvailable: boolean
): Promise<ProductResponse> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new BadRequestError('Invalid product ID');
  }

  const product = await Product.findOne({
    _id: productId,
    deletedAt: null,
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  product.isAvailable = isAvailable;
  await product.save();

  const updatedProduct = await Product.findById(productId)
    .populate('categoryId', 'name slug imageUrl icon')
    .lean();

  if (!updatedProduct) {
    throw new NotFoundError('Product not found');
  }

  return {
    ...updatedProduct,
    id: updatedProduct._id.toString(),
    category: updatedProduct.categoryId,
  } as unknown as ProductResponse;
};

/**
 * Duplicate a product
 * Creates a copy of the product with "Copy" appended to the name
 * @param productId - Product ID to duplicate
 * @returns Newly created product copy
 * @throws NotFoundError if product not found
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const duplicateProduct = async (productId: string): Promise<any> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new BadRequestError('Invalid product ID');
  }

  const originalProduct = await Product.findOne({
    _id: productId,
    deletedAt: null,
  }).lean();

  if (!originalProduct) {
    throw new NotFoundError('Product not found');
  }

  // Create new product with copied attributes
  const duplicatedProduct = new Product({
    name: `${originalProduct.name} Copy`,
    description: originalProduct.description,
    categoryId: originalProduct.categoryId,
    images: [...originalProduct.images],
    basePrice: originalProduct.basePrice,
    currency: originalProduct.currency,
    preparationTime: originalProduct.preparationTime,
    calories: originalProduct.calories,
    isAvailable: false, // Set to inactive by default
    isFeatured: false,
    isBestSelling: false,
    allergens: [...originalProduct.allergens],
    tags: [...originalProduct.tags],
    nutritionalInfo: originalProduct.nutritionalInfo
      ? { ...originalProduct.nutritionalInfo }
      : undefined,
    displayOrder: originalProduct.displayOrder,
  });

  await duplicatedProduct.save();

  // Copy customizations
  const customizations = await ProductCustomization.find({
    productId: originalProduct._id,
  }).lean();

  for (const customization of customizations) {
    await ProductCustomization.create({
      productId: duplicatedProduct._id,
      customizationType: customization.customizationType,
      isRequired: customization.isRequired,
      options: customization.options,
      displayOrder: customization.displayOrder,
    });
  }

  // Copy add-ons associations
  const productAddOns = await ProductAddOn.find({
    productId: originalProduct._id,
  }).lean();

  for (const productAddOn of productAddOns) {
    await ProductAddOn.create({
      productId: duplicatedProduct._id,
      addOnId: productAddOn.addOnId,
      isDefault: productAddOn.isDefault,
    });
  }

  // Return the duplicated product with populated data
  const result = await Product.findById(duplicatedProduct._id)
    .populate('categoryId', 'name slug imageUrl icon')
    .lean();

  return {
    ...result,
    id: result?._id?.toString(),
    category: result?.categoryId,
  };
};

/**
 * Create a new product
 * @param productData - Product data
 * @returns Created product
 */
export const createProduct = async (
  productData: Partial<IProduct>
): Promise<ProductResponse> => {
  const product = await Product.create(productData);

  const populatedProduct = await Product.findById(product._id)
    .populate('categoryId', 'name slug imageUrl icon')
    .lean();

  if (!populatedProduct) {
    throw new Error('Failed to create product');
  }

  return {
    ...populatedProduct,
    id: populatedProduct._id.toString(),
    category: populatedProduct.categoryId,
  } as unknown as ProductResponse;
};

/**
 * Update a product
 * @param productId - Product ID
 * @param updateData - Data to update
 * @returns Updated product
 */
export const updateProduct = async (
  productId: string,
  updateData: Partial<IProduct>
): Promise<ProductResponse> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new BadRequestError('Invalid product ID');
  }

  const product = await Product.findByIdAndUpdate(productId, updateData, {
    new: true,
  })
    .populate('categoryId', 'name slug imageUrl icon')
    .lean();

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return {
    ...product,
    id: product._id.toString(),
    category: product.categoryId,
  } as unknown as ProductResponse;
};

/**
 * Delete a product (soft delete)
 * @param productId - Product ID
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new BadRequestError('Invalid product ID');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Soft delete
  product.deletedAt = new Date();
  product.isAvailable = false;
  await product.save();
};
