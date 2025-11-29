import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as cartService from '../../../src/services/cartService.js';
import { Cart } from '../../../src/models/Cart.js';
import { CartItem } from '../../../src/models/CartItem.js';
import { Product } from '../../../src/models/Product.js';
import { Store } from '../../../src/models/Store.js';
import mongoose from 'mongoose';

// Mock dependencies
vi.mock('../../../src/models/Cart.js');
vi.mock('../../../src/models/CartItem.js');
vi.mock('../../../src/models/Product.js');
vi.mock('../../../src/models/Store.js');

// Mock mongoose.model for Category
const mockCategoryFindById = vi.fn();
vi.spyOn(mongoose, 'model').mockReturnValue({
  findById: mockCategoryFindById,
} as any);

describe('CartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return empty cart structure if no active cart exists', async () => {
      const userId = 'user123';
      vi.mocked(Cart.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      } as any);

      const result = await cartService.getCart(userId);

      expect(Cart.findOne).toHaveBeenCalledWith({ userId, status: 'active' });
      expect(result).toEqual({
        cart: null,
        items: [],
        itemCount: 0,
      });
    });

    it('should return populated cart if active cart exists', async () => {
      const userId = 'user123';
      const mockCart = { _id: 'cart123', userId, status: 'active' };
      const mockItems = [
        { _id: 'item1', productId: 'prod1', quantity: 2 },
        { _id: 'item2', productId: 'prod2', quantity: 1 },
      ];

      vi.mocked(Cart.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockCart),
      } as any);

      vi.mocked(CartItem.find).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockItems),
      } as any);

      const result = await cartService.getCart(userId);

      expect(Cart.findOne).toHaveBeenCalledWith({ userId, status: 'active' });
      expect(CartItem.find).toHaveBeenCalledWith({ cartId: mockCart._id });
      expect(result).toEqual({
        cart: mockCart,
        items: mockItems,
        itemCount: 2,
      });
    });
  });

  describe('addItem', () => {
    const userId = 'user123';
    const itemData = {
      productId: 'prod123',
      quantity: 2,
    };

    it('should throw error if product not found', async () => {
      vi.mocked(Product.findById).mockResolvedValue(null);

      await expect(cartService.addItem(userId, itemData)).rejects.toThrow(
        'Product not found'
      );
    });

    it('should throw error if product not available', async () => {
      vi.mocked(Product.findById).mockResolvedValue({
        isAvailable: false,
      } as any);

      await expect(cartService.addItem(userId, itemData)).rejects.toThrow(
        'Product is not available'
      );
    });

    it('should throw error if product category not found', async () => {
      vi.mocked(Product.findById).mockResolvedValue({
        isAvailable: true,
        categoryId: 'cat123',
      } as any);

      mockCategoryFindById.mockResolvedValue(null);

      await expect(cartService.addItem(userId, itemData)).rejects.toThrow(
        'Product category not found'
      );
    });

    it('should throw error if store not found', async () => {
      vi.mocked(Product.findById).mockResolvedValue({
        isAvailable: true,
        categoryId: 'cat123',
      } as any);

      mockCategoryFindById.mockResolvedValue({
        storeId: 'store123',
      });

      vi.mocked(Store.findById).mockResolvedValue(null);

      await expect(cartService.addItem(userId, itemData)).rejects.toThrow(
        'Store not found'
      );
    });

    it('should throw error if store is not active', async () => {
      vi.mocked(Product.findById).mockResolvedValue({
        isAvailable: true,
        categoryId: 'cat123',
      } as any);

      mockCategoryFindById.mockResolvedValue({
        storeId: 'store123',
      });

      vi.mocked(Store.findById).mockResolvedValue({
        isActive: false,
      } as any);

      await expect(cartService.addItem(userId, itemData)).rejects.toThrow(
        'Store is not active'
      );
    });

    it('should create new cart and add item if no cart exists', async () => {
      const storeId = 'store123';
      const product = {
        _id: 'prod123',
        isAvailable: true,
        categoryId: 'cat123',
        basePrice: 10,
      };

      vi.mocked(Product.findById).mockResolvedValue(product as any);

      mockCategoryFindById.mockResolvedValue({
        storeId,
      });

      vi.mocked(Store.findById).mockResolvedValue({
        isActive: true,
        _id: storeId,
      } as any);

      vi.mocked(Cart.findOne).mockResolvedValue(null);

      const newCart = {
        _id: 'newCart123',
        userId,
        storeId,
        status: 'active',
        save: vi.fn(),
      };
      vi.mocked(Cart.create).mockResolvedValue(newCart as any);
      vi.mocked(Cart.findById).mockResolvedValue(newCart as any);
      vi.mocked(CartItem.create).mockResolvedValue({} as any);
      // For calculateTotals
      vi.mocked(CartItem.find).mockResolvedValueOnce([
        { totalPrice: 20 },
      ] as any);

      // For getCart
      vi.mocked(CartItem.find).mockReturnValueOnce({
        populate: vi.fn().mockResolvedValue([]),
      } as any);

      // Mock getCart to return something
      vi.mocked(Cart.findOne)
        .mockReturnValueOnce(null) // First call for check
        .mockReturnValueOnce({
          // Second call inside getCart
          populate: vi.fn().mockResolvedValue(newCart),
        } as any);

      await cartService.addItem(userId, itemData);

      expect(Cart.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          storeId,
          status: 'active',
        })
      );
      expect(CartItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cartId: newCart._id,
          productId: itemData.productId,
          quantity: itemData.quantity,
          unitPrice: product.basePrice,
          totalPrice: product.basePrice * itemData.quantity,
        })
      );
    });
  });

  describe('updateItemQuantity', () => {
    const userId = 'user123';
    const itemId = 'item123';
    const quantity = 3;

    it('should throw error if quantity is less than 1', async () => {
      await expect(
        cartService.updateItemQuantity(userId, itemId, 0)
      ).rejects.toThrow('Quantity must be at least 1');
    });

    it('should throw error if cart item not found', async () => {
      vi.mocked(CartItem.findById).mockResolvedValue(null);

      await expect(
        cartService.updateItemQuantity(userId, itemId, quantity)
      ).rejects.toThrow('Cart item not found');
    });

    it('should throw error if cart not found or does not belong to user', async () => {
      vi.mocked(CartItem.findById).mockResolvedValue({
        cartId: 'cart123',
      } as any);

      vi.mocked(Cart.findOne).mockResolvedValue(null);

      await expect(
        cartService.updateItemQuantity(userId, itemId, quantity)
      ).rejects.toThrow('Cart not found or does not belong to user');
    });

    it('should throw error if product is no longer available', async () => {
      vi.mocked(CartItem.findById).mockResolvedValue({
        cartId: 'cart123',
        productId: 'prod123',
      } as any);

      vi.mocked(Cart.findOne).mockResolvedValue({ _id: 'cart123' } as any);

      vi.mocked(Product.findById).mockResolvedValue({
        isAvailable: false,
      } as any);

      await expect(
        cartService.updateItemQuantity(userId, itemId, quantity)
      ).rejects.toThrow('Product is no longer available');
    });

    it('should update quantity and recalculate totals', async () => {
      const mockCartItem = {
        _id: itemId,
        cartId: 'cart123',
        productId: 'prod123',
        unitPrice: 10,
        quantity: 1,
        totalPrice: 10,
        save: vi.fn(),
      };

      vi.mocked(CartItem.findById).mockResolvedValue(mockCartItem as any);

      vi.mocked(Cart.findOne).mockReturnValue({
        _id: 'cart123',
        populate: vi.fn().mockResolvedValue({ _id: 'cart123' }),
      } as any);

      vi.mocked(Product.findById).mockResolvedValue({
        isAvailable: true,
      } as any);

      vi.mocked(Cart.findById).mockResolvedValue({
        _id: 'cart123',
        discount: 0,
        save: vi.fn(),
      } as any);

      // For calculateTotals
      vi.mocked(CartItem.find).mockResolvedValueOnce([mockCartItem] as any);

      // For getCart
      vi.mocked(CartItem.find).mockReturnValueOnce({
        populate: vi.fn().mockResolvedValue([mockCartItem]),
      } as any);

      await cartService.updateItemQuantity(userId, itemId, quantity);

      expect(mockCartItem.quantity).toBe(quantity);
      expect(mockCartItem.totalPrice).toBe(30); // 10 * 3
      expect(mockCartItem.save).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    const userId = 'user123';
    const itemId = 'item123';

    it('should remove item and recalculate totals', async () => {
      const mockCartItem = {
        _id: itemId,
        cartId: 'cart123',
      };

      vi.mocked(CartItem.findById).mockResolvedValue(mockCartItem as any);

      vi.mocked(Cart.findOne).mockReturnValue({
        _id: 'cart123',
        populate: vi.fn().mockResolvedValue({ _id: 'cart123' }),
      } as any);

      vi.mocked(CartItem.findByIdAndDelete).mockResolvedValue(true as any);
      vi.mocked(CartItem.countDocuments).mockResolvedValue(1); // Still items left

      vi.mocked(Cart.findById).mockResolvedValue({
        _id: 'cart123',
        discount: 0,
        save: vi.fn(),
      } as any);

      // For calculateTotals
      vi.mocked(CartItem.find).mockResolvedValueOnce([] as any);

      // For getCart
      vi.mocked(CartItem.find).mockReturnValueOnce({
        populate: vi.fn().mockResolvedValue([]),
      } as any);

      await cartService.removeItem(userId, itemId);

      expect(CartItem.findByIdAndDelete).toHaveBeenCalledWith(itemId);
    });

    it('should delete cart if last item removed', async () => {
      const mockCartItem = {
        _id: itemId,
        cartId: 'cart123',
      };

      vi.mocked(CartItem.findById).mockResolvedValue(mockCartItem as any);

      vi.mocked(Cart.findOne).mockResolvedValue({
        _id: 'cart123',
      } as any);

      vi.mocked(CartItem.findByIdAndDelete).mockResolvedValue(true as any);
      vi.mocked(CartItem.countDocuments).mockResolvedValue(0); // No items left

      vi.mocked(Cart.findByIdAndDelete).mockResolvedValue(true as any);

      const result = await cartService.removeItem(userId, itemId);

      expect(Cart.findByIdAndDelete).toHaveBeenCalledWith('cart123');
      expect(result).toEqual({
        cart: null,
        items: [],
        itemCount: 0,
      });
    });
  });

  describe('clearCart', () => {
    const userId = 'user123';

    it('should clear cart and delete it', async () => {
      vi.mocked(Cart.findOne).mockResolvedValue({
        _id: 'cart123',
      } as any);

      await cartService.clearCart(userId);

      expect(CartItem.deleteMany).toHaveBeenCalledWith({ cartId: 'cart123' });
      expect(Cart.findByIdAndDelete).toHaveBeenCalledWith('cart123');
    });

    it('should throw error if no active cart found', async () => {
      vi.mocked(Cart.findOne).mockResolvedValue(null);

      await expect(cartService.clearCart(userId)).rejects.toThrow(
        'No active cart found'
      );
    });
  });
});
