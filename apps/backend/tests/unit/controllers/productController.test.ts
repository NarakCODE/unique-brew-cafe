import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as productController from '../../../src/controllers/productController.js';
import * as productService from '../../../src/services/productService.js';
import { Request, Response } from 'express';
import { BadRequestError } from '../../../src/utils/AppError.js';

vi.mock('../../../src/services/productService.js');

describe('ProductController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: ReturnType<typeof vi.fn>;
  let status: ReturnType<typeof vi.fn>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    json = vi.fn();
    status = vi.fn().mockReturnValue({ json });
    req = { query: {}, params: {}, body: {} };
    res = { status, json };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return products with default pagination', async () => {
      const mockResult = {
        data: [{ id: '1', name: 'Coffee' }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      vi.mocked(productService.getProducts).mockResolvedValue(mockResult);

      await productController.getProducts(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProducts).toHaveBeenCalledWith(
        {},
        expect.any(Object)
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        pagination: mockResult.pagination,
      });
    });

    it('should apply category filter', async () => {
      req.query = { categoryId: 'cat-123' };
      const mockResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      };
      vi.mocked(productService.getProducts).mockResolvedValue(mockResult);

      await productController.getProducts(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'cat-123' }),
        expect.any(Object)
      );
    });

    it('should apply isFeatured filter', async () => {
      req.query = { isFeatured: 'true' };
      const mockResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      };
      vi.mocked(productService.getProducts).mockResolvedValue(mockResult);

      await productController.getProducts(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ isFeatured: true }),
        expect.any(Object)
      );
    });

    it('should apply price range filters', async () => {
      req.query = { minPrice: '5', maxPrice: '20' };
      const mockResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      };
      vi.mocked(productService.getProducts).mockResolvedValue(mockResult);

      await productController.getProducts(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ minPrice: 5, maxPrice: 20 }),
        expect.any(Object)
      );
    });

    it('should throw error for invalid minPrice', async () => {
      req.query = { minPrice: 'invalid' };

      await productController.getProducts(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should throw error for negative maxPrice', async () => {
      req.query = { maxPrice: '-10' };

      await productController.getProducts(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should handle tags as array', async () => {
      req.query = { tags: ['coffee', 'hot'] };
      const mockResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      };
      vi.mocked(productService.getProducts).mockResolvedValue(mockResult);

      await productController.getProducts(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['coffee', 'hot'] }),
        expect.any(Object)
      );
    });

    it('should handle tags as single string', async () => {
      req.query = { tags: 'coffee' };
      const mockResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      };
      vi.mocked(productService.getProducts).mockResolvedValue(mockResult);

      await productController.getProducts(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['coffee'] }),
        expect.any(Object)
      );
    });

    it('should apply search filter', async () => {
      req.query = { search: 'latte' };
      const mockResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      };
      vi.mocked(productService.getProducts).mockResolvedValue(mockResult);

      await productController.getProducts(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'latte' }),
        expect.any(Object)
      );
    });

    it('should pass pagination params', async () => {
      req.query = { page: '2', limit: '20', sortBy: 'name', sortOrder: 'asc' };
      const mockResult = {
        data: [],
        pagination: { page: 2, limit: 20, total: 0 },
      };
      vi.mocked(productService.getProducts).mockResolvedValue(mockResult);

      await productController.getProducts(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          page: 2,
          limit: 20,
          sortBy: 'name',
          sortOrder: 'asc',
        })
      );
    });
  });

  describe('getProductById', () => {
    it('should return product by ID', async () => {
      req.params = { id: 'prod-123' };
      const mockProduct = { id: 'prod-123', name: 'Espresso' };
      vi.mocked(productService.getProductById).mockResolvedValue(
        mockProduct as any
      );

      await productController.getProductById(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProductById).toHaveBeenCalledWith('prod-123');
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
    });

    it('should throw error when ID is missing', async () => {
      req.params = {};

      await productController.getProductById(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('getProductBySlug', () => {
    it('should return product by slug', async () => {
      req.params = { slug: 'espresso-coffee' };
      const mockProduct = { id: 'prod-123', slug: 'espresso-coffee' };
      vi.mocked(productService.getProductBySlug).mockResolvedValue(
        mockProduct as any
      );

      await productController.getProductBySlug(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProductBySlug).toHaveBeenCalledWith(
        'espresso-coffee'
      );
      expect(status).toHaveBeenCalledWith(200);
    });

    it('should throw error when slug is missing', async () => {
      req.params = {};

      await productController.getProductBySlug(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('searchProducts', () => {
    it('should search products with query', async () => {
      req.query = { q: 'coffee' };
      const mockResult = {
        data: [{ id: '1', name: 'Coffee' }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      vi.mocked(productService.searchProducts).mockResolvedValue(mockResult);

      await productController.searchProducts(
        req as Request,
        res as Response,
        next
      );

      expect(productService.searchProducts).toHaveBeenCalledWith(
        'coffee',
        {},
        expect.any(Object)
      );
      expect(status).toHaveBeenCalledWith(200);
    });

    it('should throw error when search query is missing', async () => {
      req.query = {};

      await productController.searchProducts(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should apply filters to search', async () => {
      req.query = { q: 'latte', categoryId: 'cat-1', isFeatured: 'true' };
      const mockResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      };
      vi.mocked(productService.searchProducts).mockResolvedValue(mockResult);

      await productController.searchProducts(
        req as Request,
        res as Response,
        next
      );

      expect(productService.searchProducts).toHaveBeenCalledWith(
        'latte',
        expect.objectContaining({ categoryId: 'cat-1', isFeatured: true }),
        expect.any(Object)
      );
    });
  });

  describe('updateProductStatus', () => {
    it('should update product availability to true', async () => {
      req.params = { productId: 'prod-123' };
      req.body = { isAvailable: true };
      const mockProduct = { id: 'prod-123', isAvailable: true };
      vi.mocked(productService.updateProductStatus).mockResolvedValue(
        mockProduct as any
      );

      await productController.updateProductStatus(
        req as Request,
        res as Response,
        next
      );

      expect(productService.updateProductStatus).toHaveBeenCalledWith(
        'prod-123',
        true
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('activated'),
        })
      );
    });

    it('should update product availability to false', async () => {
      req.params = { productId: 'prod-123' };
      req.body = { isAvailable: false };
      const mockProduct = { id: 'prod-123', isAvailable: false };
      vi.mocked(productService.updateProductStatus).mockResolvedValue(
        mockProduct as any
      );

      await productController.updateProductStatus(
        req as Request,
        res as Response,
        next
      );

      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('deactivated'),
        })
      );
    });

    it('should throw error when productId is missing', async () => {
      req.params = {};
      req.body = { isAvailable: true };

      await productController.updateProductStatus(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should throw error when isAvailable is not boolean', async () => {
      req.params = { productId: 'prod-123' };
      req.body = { isAvailable: 'yes' };

      await productController.updateProductStatus(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('duplicateProduct', () => {
    it('should duplicate product', async () => {
      req.params = { productId: 'prod-123' };
      const mockDuplicate = { id: 'prod-456', name: 'Coffee (Copy)' };
      vi.mocked(productService.duplicateProduct).mockResolvedValue(
        mockDuplicate as any
      );

      await productController.duplicateProduct(
        req as Request,
        res as Response,
        next
      );

      expect(productService.duplicateProduct).toHaveBeenCalledWith('prod-123');
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        success: true,
        message: 'Product duplicated successfully',
        data: mockDuplicate,
      });
    });

    it('should throw error when productId is missing', async () => {
      req.params = {};

      await productController.duplicateProduct(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('getProductCustomizations', () => {
    it('should return product customizations', async () => {
      req.params = { id: 'prod-123' };
      const mockCustomizations = [{ id: 'cust-1', name: 'Size' }];
      vi.mocked(productService.getProductCustomizations).mockResolvedValue(
        mockCustomizations as any
      );

      await productController.getProductCustomizations(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProductCustomizations).toHaveBeenCalledWith(
        'prod-123'
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: {
          productId: 'prod-123',
          customizations: mockCustomizations,
        },
      });
    });
  });

  describe('getProductAddOns', () => {
    it('should return product add-ons', async () => {
      req.params = { id: 'prod-123' };
      const mockAddOns = [{ id: 'addon-1', name: 'Extra Shot' }];
      vi.mocked(productService.getProductAddOns).mockResolvedValue(
        mockAddOns as any
      );

      await productController.getProductAddOns(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProductAddOns).toHaveBeenCalledWith('prod-123');
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: {
          productId: 'prod-123',
          addOns: mockAddOns,
        },
      });
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products by category', async () => {
      req.params = { categoryId: 'cat-123' };
      const mockResult = {
        data: [{ id: '1', name: 'Latte' }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      vi.mocked(productService.getProductsByCategory).mockResolvedValue(
        mockResult
      );

      await productController.getProductsByCategory(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProductsByCategory).toHaveBeenCalledWith(
        'cat-123',
        expect.any(Object)
      );
      expect(status).toHaveBeenCalledWith(200);
    });

    it('should throw error when categoryId is missing', async () => {
      req.params = {};

      await productController.getProductsByCategory(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('getStoreMenu', () => {
    it('should return store menu', async () => {
      req.params = { storeId: 'store-123' };
      const mockResult = {
        data: [{ id: '1', name: 'Espresso' }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      vi.mocked(productService.getProductsByStore).mockResolvedValue(
        mockResult
      );

      await productController.getStoreMenu(
        req as Request,
        res as Response,
        next
      );

      expect(productService.getProductsByStore).toHaveBeenCalledWith(
        'store-123',
        {},
        expect.any(Object)
      );
      expect(status).toHaveBeenCalledWith(200);
    });

    it('should throw error when storeId is missing', async () => {
      req.params = {};

      await productController.getStoreMenu(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });
});
