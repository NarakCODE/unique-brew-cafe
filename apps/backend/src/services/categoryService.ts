import { Category } from '../models/Category.js';
import type { ICategory } from '../models/Category.js';
import { NotFoundError } from '../utils/AppError.js';

/**
 * Get all active categories ordered by displayOrder
 */
export const getAllCategories = async (): Promise<ICategory[]> => {
  const categories = await Category.find({ isActive: true }).sort({
    displayOrder: 1,
    name: 1,
  });

  return categories;
};

/**
 * Get category by ID
 */
export const getCategoryById = async (
  categoryId: string
): Promise<ICategory> => {
  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  return category;
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (slug: string): Promise<ICategory> => {
  const category = await Category.findOne({
    slug,
    isActive: true,
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  return category;
};

/**
 * Get subcategories for a parent category
 */
export const getSubcategories = async (
  parentCategoryId: string
): Promise<ICategory[]> => {
  const subcategories = await Category.find({
    parentId: parentCategoryId,
    isActive: true,
  }).sort({
    displayOrder: 1,
    name: 1,
  });

  return subcategories;
};

/**
 * Reorder categories by updating displayOrder for multiple categories
 * @param categoryOrders - Array of objects containing categoryId and new displayOrder
 */
export const reorderCategories = async (
  categoryOrders: Array<{ categoryId: string; displayOrder: number }>
): Promise<void> => {
  // Validate that all categories exist
  const categoryIds = categoryOrders.map((item) => item.categoryId);
  const categories = await Category.find({ _id: { $in: categoryIds } });

  if (categories.length !== categoryIds.length) {
    throw new NotFoundError('One or more categories not found');
  }

  // Perform bulk update
  const bulkOps = categoryOrders.map((item) => ({
    updateOne: {
      filter: { _id: item.categoryId },
      update: { $set: { displayOrder: item.displayOrder } },
    },
  }));

  await Category.bulkWrite(bulkOps);
};
