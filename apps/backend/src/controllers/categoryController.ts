import type { Request, Response } from 'express';
import * as categoryService from '../services/categoryService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';

/**
 * @route   GET /api/v1/categories
 * @desc    Get all active categories
 * @access  Public
 */
export const getCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  }
);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Category ID is required');
    }

    const category = await categoryService.getCategoryById(id);

    res.status(200).json({
      success: true,
      data: category,
    });
  }
);

/**
 * @route   GET /api/v1/categories/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 */
export const getCategoryBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    if (!slug) {
      throw new BadRequestError('Category slug is required');
    }

    const category = await categoryService.getCategoryBySlug(slug);

    res.status(200).json({
      success: true,
      data: category,
    });
  }
);

/**
 * @route   GET /api/v1/categories/:id/subcategories
 * @desc    Get subcategories for a parent category
 * @access  Public
 */
export const getSubcategories = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Category ID is required');
    }

    const subcategories = await categoryService.getSubcategories(id);

    res.status(200).json({
      success: true,
      data: subcategories,
    });
  }
);

/**
 * @route   PATCH /api/v1/categories/reorder
 * @desc    Reorder categories by updating displayOrder
 * @access  Admin only
 */
export const reorderCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      throw new BadRequestError(
        'Categories array is required and must not be empty'
      );
    }

    // Validate each category object has required fields
    for (const category of categories) {
      if (!category.categoryId || typeof category.displayOrder !== 'number') {
        throw new BadRequestError(
          'Each category must have categoryId and displayOrder'
        );
      }
    }

    await categoryService.reorderCategories(categories);

    res.status(200).json({
      success: true,
      message: 'Categories reordered successfully',
    });
  }
);
