import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as categoryService from '../../../src/services/categoryService.js';
import { Category } from '../../../src/models/Category.js';

// Mock dependencies
vi.mock('../../../src/models/Category.js');

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all active categories ordered by displayOrder', async () => {
      const mockCategories = [
        {
          _id: 'cat1',
          name: 'Category 1',
          slug: 'category-1',
          displayOrder: 1,
          isActive: true,
        },
        {
          _id: 'cat2',
          name: 'Category 2',
          slug: 'category-2',
          displayOrder: 2,
          isActive: true,
        },
      ];

      vi.mocked(Category.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockCategories),
      } as any);

      const result = await categoryService.getAllCategories();

      expect(Category.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getCategoryById', () => {
    it('should return category by ID', async () => {
      const categoryId = 'cat123';
      const mockCategory = {
        _id: categoryId,
        name: 'Test Category',
        slug: 'test-category',
        isActive: true,
      };

      vi.mocked(Category.findOne).mockResolvedValue(mockCategory as any);

      const result = await categoryService.getCategoryById(categoryId);

      expect(Category.findOne).toHaveBeenCalledWith({
        _id: categoryId,
        isActive: true,
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw error if category not found', async () => {
      const categoryId = 'nonexistent';
      vi.mocked(Category.findOne).mockResolvedValue(null);

      await expect(categoryService.getCategoryById(categoryId)).rejects.toThrow(
        'Category not found'
      );
    });

    it('should throw error if category is inactive', async () => {
      const categoryId = 'cat123';
      vi.mocked(Category.findOne).mockResolvedValue(null);

      await expect(categoryService.getCategoryById(categoryId)).rejects.toThrow(
        'Category not found'
      );
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return category by slug', async () => {
      const slug = 'test-category';
      const mockCategory = {
        _id: 'cat123',
        name: 'Test Category',
        slug,
        isActive: true,
      };

      vi.mocked(Category.findOne).mockResolvedValue(mockCategory as any);

      const result = await categoryService.getCategoryBySlug(slug);

      expect(Category.findOne).toHaveBeenCalledWith({
        slug,
        isActive: true,
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw error if category not found', async () => {
      const slug = 'nonexistent';
      vi.mocked(Category.findOne).mockResolvedValue(null);

      await expect(categoryService.getCategoryBySlug(slug)).rejects.toThrow(
        'Category not found'
      );
    });
  });

  describe('getSubcategories', () => {
    it('should return subcategories for a parent category', async () => {
      const parentCategoryId = 'parent123';
      const mockSubcategories = [
        {
          _id: 'sub1',
          name: 'Subcategory 1',
          slug: 'subcategory-1',
          parentId: parentCategoryId,
          displayOrder: 1,
          isActive: true,
        },
        {
          _id: 'sub2',
          name: 'Subcategory 2',
          slug: 'subcategory-2',
          parentId: parentCategoryId,
          displayOrder: 2,
          isActive: true,
        },
      ];

      vi.mocked(Category.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockSubcategories),
      } as any);

      const result = await categoryService.getSubcategories(parentCategoryId);

      expect(Category.find).toHaveBeenCalledWith({
        parentId: parentCategoryId,
        isActive: true,
      });
      expect(result).toEqual(mockSubcategories);
    });

    it('should return empty array if no subcategories exist', async () => {
      const parentCategoryId = 'parent123';

      vi.mocked(Category.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await categoryService.getSubcategories(parentCategoryId);

      expect(result).toEqual([]);
    });
  });

  describe('reorderCategories', () => {
    it('should reorder categories successfully', async () => {
      const categoryOrders = [
        { categoryId: 'cat1', displayOrder: 2 },
        { categoryId: 'cat2', displayOrder: 1 },
      ];

      const mockCategories = [
        { _id: 'cat1', name: 'Category 1' },
        { _id: 'cat2', name: 'Category 2' },
      ];

      vi.mocked(Category.find).mockResolvedValue(mockCategories as any);
      vi.mocked(Category.bulkWrite).mockResolvedValue({} as any);

      await categoryService.reorderCategories(categoryOrders);

      expect(Category.find).toHaveBeenCalledWith({
        _id: { $in: ['cat1', 'cat2'] },
      });
      expect(Category.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: 'cat1' },
            update: { $set: { displayOrder: 2 } },
          },
        },
        {
          updateOne: {
            filter: { _id: 'cat2' },
            update: { $set: { displayOrder: 1 } },
          },
        },
      ]);
    });

    it('should throw error if one or more categories not found', async () => {
      const categoryOrders = [
        { categoryId: 'cat1', displayOrder: 2 },
        { categoryId: 'nonexistent', displayOrder: 1 },
      ];

      // Only return one category when two were requested
      vi.mocked(Category.find).mockResolvedValue([
        { _id: 'cat1', name: 'Category 1' },
      ] as any);

      await expect(
        categoryService.reorderCategories(categoryOrders)
      ).rejects.toThrow('One or more categories not found');
    });

    it('should handle empty array', async () => {
      const categoryOrders: Array<{
        categoryId: string;
        displayOrder: number;
      }> = [];

      vi.mocked(Category.find).mockResolvedValue([] as any);
      vi.mocked(Category.bulkWrite).mockResolvedValue({} as any);

      await categoryService.reorderCategories(categoryOrders);

      expect(Category.bulkWrite).toHaveBeenCalledWith([]);
    });
  });
});
