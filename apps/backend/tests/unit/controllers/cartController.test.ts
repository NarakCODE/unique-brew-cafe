import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cartController from '../../../src/controllers/cartController.js';
import * as cartService from '../../../src/services/cartService.js';
import { Request, Response } from 'express';
import { BadRequestError } from '../../../src/utils/AppError.js';
import mongoose from 'mongoose';

vi.mock('../../../src/services/cartService.js');

describe('CartController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: ReturnType<typeof vi.fn>;
  let status: ReturnType<typeof vi.fn>;
  let next: ReturnType<typeof vi.fn>;

  const validObjectId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    json = vi.fn();
    status = vi.fn().mockReturnValue({ json });
    req = { query: {}, params: {}, body: {}, userId: 'user-123' };
    res = { status, json };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return cart for authenticated user', async () => {
      const mockCart = { items: [], subtotal: 0 };
      vi.mocked(cartService.getCart).mockResolvedValue(mockCart as any);

      await cartController.getCart(req as Request, res as Response, next);

      expect(cartService.getCart).toHaveBeenCalledWith('user-123');
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockCart,
      });
    });

    it('should throw error when userId is missing', async () => {
      req.userId = undefined;

      await cartController.getCart(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('addItem', () => {
    it('should add item to cart', async () => {
      req.body = { productId: validObjectId, quantity: 2 };
      const mockCart = { items: [{ productId: validObjectId, quantity: 2 }] };
      vi.mocked(cartService.addItem).mockResolvedValue(mockCart as any);

      await cartController.addItem(req as Request, res as Response, next);

      expect(cartService.addItem).toHaveBeenCalledWith('user-123', {
        productId: validObjectId,
        quantity: 2,
        customization: undefined,
        addOns: undefined,
        notes: undefined,
      });
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockCart,
        message: 'Item added to cart',
      });
    });

    it('should add item with customization and addOns', async () => {
      const addOnId = new mongoose.Types.ObjectId().toString();
      req.body = {
        productId: validObjectId,
        quantity: 1,
        customization: { size: 'large' },
        addOns: [addOnId],
        notes: 'Extra hot',
      };
      vi.mocked(cartService.addItem).mockResolvedValue({} as any);

      await cartController.addItem(req as Request, res as Response, next);

      expect(cartService.addItem).toHaveBeenCalledWith('user-123', {
        productId: validObjectId,
        quantity: 1,
        customization: { size: 'large' },
        addOns: [addOnId],
        notes: 'Extra hot',
      });
    });

    it('should throw error when productId is missing', async () => {
      req.body = { quantity: 2 };

      await cartController.addItem(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should throw error when quantity is less than 1', async () => {
      req.body = { productId: validObjectId, quantity: 0 };

      await cartController.addItem(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should throw error for invalid productId format', async () => {
      req.body = { productId: 'invalid-id', quantity: 1 };

      await cartController.addItem(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should throw error for invalid addOn ID format', async () => {
      req.body = {
        productId: validObjectId,
        quantity: 1,
        addOns: ['invalid-addon-id'],
      };

      await cartController.addItem(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should throw error when userId is missing', async () => {
      req.userId = undefined;
      req.body = { productId: validObjectId, quantity: 1 };

      await cartController.addItem(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', async () => {
      req.params = { itemId: validObjectId };
      req.body = { quantity: 5 };
      const mockCart = { items: [{ id: validObjectId, quantity: 5 }] };
      vi.mocked(cartService.updateItemQuantity).mockResolvedValue(
        mockCart as any
      );

      await cartController.updateItemQuantity(
        req as Request,
        res as Response,
        next
      );

      expect(cartService.updateItemQuantity).toHaveBeenCalledWith(
        'user-123',
        validObjectId,
        5
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockCart,
        message: 'Cart item updated',
      });
    });

    it('should throw error when itemId is missing', async () => {
      req.params = {};
      req.body = { quantity: 5 };

      await cartController.updateItemQuantity(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should throw error for invalid itemId format', async () => {
      req.params = { itemId: 'invalid-id' };
      req.body = { quantity: 5 };

      await cartController.updateItemQuantity(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should throw error when quantity is less than 1', async () => {
      req.params = { itemId: validObjectId };
      req.body = { quantity: 0 };

      await cartController.updateItemQuantity(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      req.params = { itemId: validObjectId };
      const mockCart = { items: [] };
      vi.mocked(cartService.removeItem).mockResolvedValue(mockCart as any);

      await cartController.removeItem(req as Request, res as Response, next);

      expect(cartService.removeItem).toHaveBeenCalledWith(
        'user-123',
        validObjectId
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockCart,
        message: 'Item removed from cart',
      });
    });

    it('should throw error when itemId is missing', async () => {
      req.params = {};

      await cartController.removeItem(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should throw error for invalid itemId format', async () => {
      req.params = { itemId: 'invalid-id' };

      await cartController.removeItem(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('clearCart', () => {
    it('should clear cart', async () => {
      const mockResult = { message: 'Cart cleared' };
      vi.mocked(cartService.clearCart).mockResolvedValue(mockResult as any);

      await cartController.clearCart(req as Request, res as Response, next);

      expect(cartService.clearCart).toHaveBeenCalledWith('user-123');
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it('should throw error when userId is missing', async () => {
      req.userId = undefined;

      await cartController.clearCart(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('validateCart', () => {
    it('should validate cart', async () => {
      const mockResult = { isValid: true, errors: [] };
      vi.mocked(cartService.validateCart).mockResolvedValue(mockResult as any);

      await cartController.validateCart(req as Request, res as Response, next);

      expect(cartService.validateCart).toHaveBeenCalledWith('user-123');
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });
  });

  describe('setDeliveryAddress', () => {
    it('should set delivery address', async () => {
      req.body = { addressId: 'addr-123' };
      const mockCart = { deliveryAddressId: 'addr-123' };
      vi.mocked(cartService.setDeliveryAddress).mockResolvedValue(
        mockCart as any
      );

      await cartController.setDeliveryAddress(
        req as Request,
        res as Response,
        next
      );

      expect(cartService.setDeliveryAddress).toHaveBeenCalledWith(
        'user-123',
        'addr-123'
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockCart,
        message: 'Delivery address updated',
      });
    });

    it('should throw error when addressId is missing', async () => {
      req.body = {};

      await cartController.setDeliveryAddress(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('setNotes', () => {
    it('should set cart notes', async () => {
      req.body = { notes: 'Please deliver to back door' };
      const mockCart = { notes: 'Please deliver to back door' };
      vi.mocked(cartService.setNotes).mockResolvedValue(mockCart as any);

      await cartController.setNotes(req as Request, res as Response, next);

      expect(cartService.setNotes).toHaveBeenCalledWith(
        'user-123',
        'Please deliver to back door'
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockCart,
        message: 'Cart notes updated',
      });
    });

    it('should allow empty string notes', async () => {
      req.body = { notes: '' };
      vi.mocked(cartService.setNotes).mockResolvedValue({} as any);

      await cartController.setNotes(req as Request, res as Response, next);

      expect(cartService.setNotes).toHaveBeenCalledWith('user-123', '');
    });

    it('should throw error when notes field is missing', async () => {
      req.body = {};

      await cartController.setNotes(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('getCartSummary', () => {
    it('should return cart summary', async () => {
      const mockSummary = {
        itemCount: 3,
        subtotal: 25.99,
        tax: 2.6,
        total: 28.59,
      };
      vi.mocked(cartService.getCartSummary).mockResolvedValue(
        mockSummary as any
      );

      await cartController.getCartSummary(
        req as Request,
        res as Response,
        next
      );

      expect(cartService.getCartSummary).toHaveBeenCalledWith('user-123');
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockSummary,
      });
    });
  });
});
