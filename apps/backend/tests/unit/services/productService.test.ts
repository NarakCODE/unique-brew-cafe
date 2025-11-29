import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import * as productService from '../../../src/services/productService.js';
import { Product } from '../../../src/models/Product.js';
import { ProductCustomization } from '../../../src/models/ProductCustomization.js';
import { AddOn } from '../../../src/models/AddOn.js';
import { Category } from '../../../src/models/Category.js';

// Mock dependencies
vi.mock('../../../src/models/Product.js');
vi.mock('../../../src/models/ProductCustomization.js');
vi.mock('../../../src/models/AddOn.js');
vi.mock('../../../src/models/Category.js');
vi.mock('../../../src/services/addonService.js', () => ({
  getAddOnsByProductId: vi.fn().mockResolvedValue([]),
}));

// Helper to create valid ObjectId
const createObjectId = () => new mongoose.Types.ObjectId().toString();

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return paginated products with default filters', async () => {
      const mockProducts = [
        {
          _id: createObjectId(),
          name: 'Latte',
          slug: 'latte',
          basePrice: 4.5,
          categoryId: { _id: createObjectId(), name: 'Coffee', slug: 'coffee' },
          isAvailable: true,
        },
      ];

      vi.mocked(Product.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockProducts),
      } as any);

      vi.mocked(Product.countDocuments).mockResolvedValue(1);

      const result = await productService.getProducts();

      expect(Product.find).toHaveBeenCalledWith({
        isAvailable: true,
        deletedAt: null,
      });
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter products by categoryId', async () => {
      const categoryId = createObjectId();
      const mockProducts: any[] = [];

      vi.mocked(Product.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockProducts),
      } as any);

      vi.mocked(Product.countDocuments).mockResolvedValue(0);

      await productService.getProducts({ categoryId });

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId,
          isAvailable: true,
          deletedAt: null,
        })
      );
    });

    it('should filter products by isFeatured', async () => {
      vi.mocked(Product.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Product.countDocuments).mockResolvedValue(0);

      await productService.getProducts({ isFeatured: true });

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          isFeatured: true,
        })
      );
    });

    it('should filter products by price range', async () => {
      vi.mocked(Product.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Product.countDocuments).mockResolvedValue(0);

      await productService.getProducts({ minPrice: 5, maxPrice: 10 });

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          basePrice: { $gte: 5, $lte: 10 },
        })
      );
    });

    it('should filter products by tags', async () => {
      vi.mocked(Product.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Product.countDocuments).mockResolvedValue(0);

      await productService.getProducts({ tags: ['hot', 'popular'] });

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: { $in: ['hot', 'popular'] },
        })
      );
    });

    it('should search products by name or description', async () => {
      vi.mocked(Product.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Product.countDocuments).mockResolvedValue(0);

      await productService.getProducts({ search: 'latte' });

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: [
            { name: { $regex: 'latte', $options: 'i' } },
            { description: { $regex: 'latte', $options: 'i' } },
          ],
        })
      );
    });

    it('should apply pagination correctly', async () => {
      const mockProducts = Array(5).fill({
        _id: createObjectId(),
        name: 'Product',
        categoryId: {},
      });

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockProducts),
      };

      vi.mocked(Product.find).mockReturnValue(mockChain as any);
      vi.mocked(Product.countDocuments).mockResolvedValue(25);

      const result = await productService.getProducts(
        {},
        { page: 2, limit: 5 }
      );

      expect(mockChain.skip).toHaveBeenCalledWith(5);
      expect(mockChain.limit).toHaveBeenCalledWith(5);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.pages).toBe(5);
    });
  });

  describe('getProductById', () => {
    it('should return product with customizations and add-ons', async () => {
      const productId = createObjectId();
      const mockProduct = {
        _id: productId,
        name: 'Cappuccino',
        slug: 'cappuccino',
        description: 'Classic cappuccino',
        basePrice: 5.0,
        categoryId: { _id: createObjectId(), name: 'Coffee', slug: 'coffee' },
        isAvailable: true,
        deletedAt: null,
      };

      const mockCustomizations = [
        {
          _id: createObjectId(),
          productId,
          customizationType: 'size',
          options: [
            { id: 'small', name: 'Small', priceModifier: 0, isDefault: true },
          ],
          isRequired: true,
          displayOrder: 1,
        },
      ];

      vi.mocked(Product.findOne).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockProduct),
      } as any);

      vi.mocked(ProductCustomization.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockCustomizations),
      } as any);

      const result = await productService.getProductById(productId);

      expect(Product.findOne).toHaveBeenCalledWith({
        _id: productId,
        isAvailable: true,
        deletedAt: null,
      });
      expect(result.name).toBe('Cappuccino');
      expect(result.customizations).toHaveLength(1);
    });

    it('should throw BadRequestError for invalid product ID', async () => {
      await expect(productService.getProductById('invalid-id')).rejects.toThrow(
        'Invalid product ID'
      );
    });

    it('should throw NotFoundError if product not found', async () => {
      const productId = createObjectId();

      vi.mocked(Product.findOne).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(productService.getProductById(productId)).rejects.toThrow(
        'Product not found'
      );
    });
  });

  describe('getProductBySlug', () => {
    it('should return product by slug with customizations and add-ons', async () => {
      const slug = 'espresso';
      const mockProduct = {
        _id: createObjectId(),
        name: 'Espresso',
        slug,
        description: 'Strong espresso',
        basePrice: 3.5,
        categoryId: { _id: createObjectId(), name: 'Coffee', slug: 'coffee' },
        isAvailable: true,
        deletedAt: null,
      };

      vi.mocked(Product.findOne).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockProduct),
      } as any);

      vi.mocked(ProductCustomization.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await productService.getProductBySlug(slug);

      expect(Product.findOne).toHaveBeenCalledWith({
        slug,
        isAvailable: true,
        deletedAt: null,
      });
      expect(result.slug).toBe(slug);
    });

    it('should throw NotFoundError if product not found by slug', async () => {
      vi.mocked(Product.findOne).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(
        productService.getProductBySlug('non-existent-slug')
      ).rejects.toThrow('Product not found');
    });
  });

  describe('searchProducts', () => {
    it('should search products by query string', async () => {
      vi.mocked(Product.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Product.countDocuments).mockResolvedValue(0);

      await productService.searchProducts('mocha');

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: [
            { name: { $regex: 'mocha', $options: 'i' } },
            { description: { $regex: 'mocha', $options: 'i' } },
          ],
        })
      );
    });

    it('should combine search with additional filters', async () => {
      const categoryId = createObjectId();

      vi.mocked(Product.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Product.countDocuments).mockResolvedValue(0);

      await productService.searchProducts('coffee', {
        categoryId,
        isFeatured: true,
      });

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId,
          isFeatured: true,
          $or: expect.any(Array),
        })
      );
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products for a valid category', async () => {
      const categoryId = createObjectId();

      vi.mocked(Category.findOne).mockResolvedValue({
        _id: categoryId,
        name: 'Coffee',
        isActive: true,
      } as any);

      vi.mocked(Product.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Product.countDocuments).mockResolvedValue(0);

      await productService.getProductsByCategory(categoryId);

      expect(Category.findOne).toHaveBeenCalledWith({
        _id: categoryId,
        isActive: true,
      });
      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId })
      );
    });

    it('should throw BadRequestError for invalid category ID', async () => {
      await expect(
        productService.getProductsByCategory('invalid-id')
      ).rejects.toThrow('Invalid category ID');
    });

    it('should throw NotFoundError if category not found', async () => {
      const categoryId = createObjectId();

      vi.mocked(Category.findOne).mockResolvedValue(null);

      await expect(
        productService.getProductsByCategory(categoryId)
      ).rejects.toThrow('Category not found');
    });
  });

  describe('getProductsByStore', () => {
    it('should return products for a valid store', async () => {
      const storeId = createObjectId();

      vi.mocked(Product.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Product.countDocuments).mockResolvedValue(0);

      const result = await productService.getProductsByStore(storeId);

      expect(result.data).toEqual([]);
    });

    it('should throw BadRequestError for invalid store ID', async () => {
      await expect(
        productService.getProductsByStore('invalid-id')
      ).rejects.toThrow('Invalid store ID');
    });
  });

  describe('getProductCustomizations', () => {
    it('should return customizations for a product', async () => {
      const productId = createObjectId();
      const mockCustomizations = [
        {
          _id: createObjectId(),
          productId,
          customizationType: 'size',
          options: [
            { id: 'small', name: 'Small', priceModifier: 0, isDefault: true },
            {
              id: 'medium',
              name: 'Medium',
              priceModifier: 0.5,
              isDefault: false,
            },
            {
              id: 'large',
              name: 'Large',
              priceModifier: 1.0,
              isDefault: false,
            },
          ],
          isRequired: true,
          displayOrder: 1,
        },
        {
          _id: createObjectId(),
          productId,
          customizationType: 'sugar_level',
          options: [
            { id: 'normal', name: 'Normal', priceModifier: 0, isDefault: true },
            {
              id: 'less',
              name: 'Less Sugar',
              priceModifier: 0,
              isDefault: false,
            },
          ],
          isRequired: false,
          displayOrder: 2,
        },
      ];

      vi.mocked(ProductCustomization.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockCustomizations),
      } as any);

      const result = await productService.getProductCustomizations(productId);

      expect(ProductCustomization.find).toHaveBeenCalledWith({ productId });
      expect(result).toHaveLength(2);
      expect(result[0].customizationType).toBe('size');
    });

    it('should throw BadRequestError for invalid product ID', async () => {
      await expect(
        productService.getProductCustomizations('invalid-id')
      ).rejects.toThrow('Invalid product ID');
    });
  });

  describe('getProductAddOns', () => {
    it('should return add-ons for a product', async () => {
      const productId = createObjectId();

      const result = await productService.getProductAddOns(productId);

      expect(result).toEqual([]);
    });

    it('should throw BadRequestError for invalid product ID', async () => {
      await expect(
        productService.getProductAddOns('invalid-id')
      ).rejects.toThrow('Invalid product ID');
    });
  });

  describe('calculateProductPrice', () => {
    it('should calculate price with customizations and add-ons', async () => {
      const productId = createObjectId();
      const mockProduct = {
        _id: productId,
        basePrice: 5.0,
      };

      const mockCustomization = {
        productId,
        customizationType: 'size',
        options: [
          { id: 'small', name: 'Small', priceModifier: 0, isDefault: true },
          { id: 'large', name: 'Large', priceModifier: 1.5, isDefault: false },
        ],
      };

      const mockAddOn = {
        _id: createObjectId(),
        price: 0.75,
        isAvailable: true,
      };

      vi.mocked(Product.findById).mockResolvedValue(mockProduct as any);
      vi.mocked(ProductCustomization.findOne).mockResolvedValue(
        mockCustomization as any
      );
      vi.mocked(AddOn.findById).mockResolvedValue(mockAddOn as any);

      const result = await productService.calculateProductPrice(
        productId,
        [{ customizationType: 'size', optionId: 'large' }],
        [mockAddOn._id.toString()]
      );

      // Base price (5.0) + size large modifier (1.5) + add-on (0.75) = 7.25
      expect(result).toBe(7.25);
    });

    it('should return base price when no customizations or add-ons', async () => {
      const productId = createObjectId();
      const mockProduct = {
        _id: productId,
        basePrice: 4.5,
      };

      vi.mocked(Product.findById).mockResolvedValue(mockProduct as any);

      const result = await productService.calculateProductPrice(
        productId,
        [],
        []
      );

      expect(result).toBe(4.5);
    });

    it('should throw BadRequestError for invalid product ID', async () => {
      await expect(
        productService.calculateProductPrice('invalid-id', [], [])
      ).rejects.toThrow('Invalid product ID');
    });

    it('should throw NotFoundError if product not found', async () => {
      const productId = createObjectId();

      vi.mocked(Product.findById).mockResolvedValue(null);

      await expect(
        productService.calculateProductPrice(productId, [], [])
      ).rejects.toThrow('Product not found');
    });

    it('should skip unavailable add-ons in price calculation', async () => {
      const productId = createObjectId();
      const mockProduct = { _id: productId, basePrice: 5.0 };
      const unavailableAddOn = {
        _id: createObjectId(),
        price: 1.0,
        isAvailable: false,
      };

      vi.mocked(Product.findById).mockResolvedValue(mockProduct as any);
      vi.mocked(AddOn.findById).mockResolvedValue(unavailableAddOn as any);

      const result = await productService.calculateProductPrice(
        productId,
        [],
        [unavailableAddOn._id.toString()]
      );

      expect(result).toBe(5.0); // Only base price, add-on not included
    });
  });

  describe('updateProductStatus', () => {
    it('should update product availability status', async () => {
      const productId = createObjectId();
      const mockProduct = {
        _id: productId,
        name: 'Latte',
        isAvailable: true,
        deletedAt: null,
        save: vi.fn().mockResolvedValue(true),
      };

      const updatedProduct = {
        ...mockProduct,
        isAvailable: false,
        categoryId: { _id: createObjectId(), name: 'Coffee', slug: 'coffee' },
      };

      vi.mocked(Product.findOne).mockResolvedValue(mockProduct as any);
      vi.mocked(Product.findById).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(updatedProduct),
      } as any);

      const result = await productService.updateProductStatus(productId, false);

      expect(mockProduct.save).toHaveBeenCalled();
      expect(result.isAvailable).toBe(false);
    });

    it('should throw BadRequestError for invalid product ID', async () => {
      await expect(
        productService.updateProductStatus('invalid-id', true)
      ).rejects.toThrow('Invalid product ID');
    });

    it('should throw NotFoundError if product not found', async () => {
      const productId = createObjectId();

      vi.mocked(Product.findOne).mockResolvedValue(null);

      await expect(
        productService.updateProductStatus(productId, true)
      ).rejects.toThrow('Product not found');
    });
  });

  describe('duplicateProduct', () => {
    it('should throw BadRequestError for invalid product ID', async () => {
      await expect(
        productService.duplicateProduct('invalid-id')
      ).rejects.toThrow('Invalid product ID');
    });

    it('should throw NotFoundError if product not found', async () => {
      const productId = createObjectId();

      vi.mocked(Product.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(productService.duplicateProduct(productId)).rejects.toThrow(
        'Product not found'
      );
    });

    it('should call findOne with correct parameters when duplicating', async () => {
      const productId = createObjectId();

      vi.mocked(Product.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as unknown);

      try {
        await productService.duplicateProduct(productId);
      } catch {
        // Expected to throw NotFoundError
      }

      expect(Product.findOne).toHaveBeenCalledWith({
        _id: productId,
        deletedAt: null,
      });
    });
  });
});
