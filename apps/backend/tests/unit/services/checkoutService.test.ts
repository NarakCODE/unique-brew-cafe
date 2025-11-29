import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkoutService } from '../../../src/services/checkoutService.js';
import { Cart } from '../../../src/models/Cart.js';
import { CartItem } from '../../../src/models/CartItem.js';
import { PromoCode } from '../../../src/models/PromoCode.js';
import { PromoCodeUsage } from '../../../src/models/PromoCodeUsage.js';
import { Order } from '../../../src/models/Order.js';
import { OrderItem } from '../../../src/models/OrderItem.js';
import mongoose from 'mongoose';

// Mock dependencies
vi.mock('../../../src/models/Cart.js');
vi.mock('../../../src/models/CartItem.js');
vi.mock('../../../src/models/PromoCode.js');
vi.mock('../../../src/models/PromoCodeUsage.js');
vi.mock('../../../src/models/Order.js');
vi.mock('../../../src/models/OrderItem.js');

describe('CheckoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear checkout sessions between tests
    (checkoutService as any).checkoutSessions.clear();
  });

  describe('validateCheckout', () => {
    it('should return error if no active cart found', async () => {
      const userId = 'user123';
      vi.mocked(Cart.findOne).mockResolvedValue(null);

      const result = await checkoutService.validateCheckout(userId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No active cart found');
    });

    it('should return error if cart is empty', async () => {
      const userId = 'user123';
      const mockCart = { _id: 'cart123', userId, status: 'active' };

      vi.mocked(Cart.findOne).mockResolvedValue(mockCart as any);
      vi.mocked(CartItem.find).mockReturnValue({
        populate: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await checkoutService.validateCheckout(userId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cart is empty');
    });

    it('should return error if delivery address is missing', async () => {
      const userId = 'user123';
      const mockCart = {
        _id: 'cart123',
        userId,
        status: 'active',
        deliveryAddress: undefined,
      };
      const mockCartItems = [
        {
          _id: 'item1',
          productId: {
            _id: 'prod1',
            name: 'Product 1',
            isAvailable: true,
            basePrice: 10,
          },
          unitPrice: 10,
        },
      ];

      vi.mocked(Cart.findOne).mockResolvedValue(mockCart as any);
      vi.mocked(CartItem.find).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockCartItems),
      } as any);

      const result = await checkoutService.validateCheckout(userId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Delivery address is required');
    });

    it('should return error if product is not available', async () => {
      const userId = 'user123';
      const mockCart = {
        _id: 'cart123',
        userId,
        status: 'active',
        deliveryAddress: 'address123',
      };
      const mockCartItems = [
        {
          _id: 'item1',
          productId: {
            _id: 'prod1',
            name: 'Product 1',
            isAvailable: false,
            basePrice: 10,
          },
          unitPrice: 10,
        },
      ];

      vi.mocked(Cart.findOne).mockResolvedValue(mockCart as any);
      vi.mocked(CartItem.find).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockCartItems),
      } as any);

      const result = await checkoutService.validateCheckout(userId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Product "Product 1" is no longer available'
      );
    });

    it('should return warning if product price has changed', async () => {
      const userId = 'user123';
      const mockCart = {
        _id: 'cart123',
        userId,
        status: 'active',
        deliveryAddress: 'address123',
      };
      const mockCartItems = [
        {
          _id: 'item1',
          productId: {
            _id: 'prod1',
            name: 'Product 1',
            isAvailable: true,
            basePrice: 15,
          },
          unitPrice: 10,
        },
      ];

      vi.mocked(Cart.findOne).mockResolvedValue(mockCart as any);
      vi.mocked(CartItem.find).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockCartItems),
      } as any);

      const result = await checkoutService.validateCheckout(userId);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        'Price for "Product 1" has changed from $10 to $15'
      );
    });

    it('should validate successfully with valid cart', async () => {
      const userId = 'user123';
      const mockCart = {
        _id: 'cart123',
        userId,
        status: 'active',
        deliveryAddress: 'address123',
      };
      const mockCartItems = [
        {
          _id: 'item1',
          productId: {
            _id: 'prod1',
            name: 'Product 1',
            isAvailable: true,
            basePrice: 10,
          },
          unitPrice: 10,
        },
      ];

      vi.mocked(Cart.findOne).mockResolvedValue(mockCart as any);
      vi.mocked(CartItem.find).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockCartItems),
      } as any);

      const result = await checkoutService.validateCheckout(userId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('createCheckoutSession', () => {
    it('should throw error if validation fails', async () => {
      const userId = 'user123';
      vi.mocked(Cart.findOne).mockResolvedValue(null);

      await expect(
        checkoutService.createCheckoutSession(userId)
      ).rejects.toThrow('Checkout validation failed');
    });

    it('should create checkout session successfully', async () => {
      const userId = 'user123';
      const mockCart = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        status: 'active',
        deliveryAddress: 'address123',
        subtotal: 100,
        discount: 0,
        tax: 10,
        deliveryFee: 5,
        total: 115,
      };
      const mockCartItems = [
        {
          _id: 'item1',
          productId: {
            _id: 'prod1',
            name: 'Product 1',
            images: ['image1.jpg'],
            isAvailable: true,
            basePrice: 100,
          },
          quantity: 1,
          unitPrice: 100,
          totalPrice: 100,
          customization: {},
          addOns: [],
          notes: 'Test note',
        },
      ];

      vi.mocked(Cart.findOne).mockResolvedValue(mockCart as any);
      vi.mocked(CartItem.find).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockCartItems),
      } as any);

      const session = await checkoutService.createCheckoutSession(userId);

      expect(session).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.items).toHaveLength(1);
      expect(session.subtotal).toBe(100);
      expect(session.total).toBe(115);
    });
  });

  describe('getCheckoutSession', () => {
    it('should throw error if session not found', async () => {
      const userId = 'user123';
      const checkoutId = 'checkout123';

      await expect(
        checkoutService.getCheckoutSession(userId, checkoutId)
      ).rejects.toThrow('Checkout session not found');
    });

    it('should throw error if session belongs to different user', async () => {
      const userId1 = 'user123';
      const userId2 = 'user456';
      const checkoutId = 'checkout123';

      // Create a session for userId1
      const mockSession = {
        id: checkoutId,
        userId: userId1,
        expiresAt: new Date(Date.now() + 1000000),
      };
      (checkoutService as any).checkoutSessions.set(checkoutId, mockSession);

      await expect(
        checkoutService.getCheckoutSession(userId2, checkoutId)
      ).rejects.toThrow('Unauthorized access to checkout session');
    });

    it('should throw error if session has expired', async () => {
      const userId = 'user123';
      const checkoutId = 'checkout123';

      const mockSession = {
        id: checkoutId,
        userId,
        expiresAt: new Date(Date.now() - 1000), // Expired
      };
      (checkoutService as any).checkoutSessions.set(checkoutId, mockSession);

      await expect(
        checkoutService.getCheckoutSession(userId, checkoutId)
      ).rejects.toThrow('Checkout session has expired');
    });

    it('should return session successfully', async () => {
      const userId = 'user123';
      const checkoutId = 'checkout123';

      const mockSession = {
        id: checkoutId,
        userId,
        expiresAt: new Date(Date.now() + 1000000),
      };
      (checkoutService as any).checkoutSessions.set(checkoutId, mockSession);

      const session = await checkoutService.getCheckoutSession(
        userId,
        checkoutId
      );

      expect(session).toEqual(mockSession);
    });
  });

  describe('getPaymentMethods', () => {
    it('should return list of payment methods', async () => {
      const methods = await checkoutService.getPaymentMethods();

      expect(methods).toHaveLength(4);
      expect(methods[0]).toHaveProperty('id');
      expect(methods[0]).toHaveProperty('name');
      expect(methods[0]).toHaveProperty('type');
      expect(methods[0]).toHaveProperty('isActive');
    });
  });

  describe('applyCoupon', () => {
    it('should throw error if promo code not found', async () => {
      const userId = 'user123';
      const checkoutId = 'checkout123';
      const couponCode = 'INVALID';

      const mockSession = {
        id: checkoutId,
        userId,
        cartId: 'cart123',
        subtotal: 100,
        expiresAt: new Date(Date.now() + 1000000),
      };
      (checkoutService as any).checkoutSessions.set(checkoutId, mockSession);

      vi.mocked(PromoCode.findOne).mockResolvedValue(null);

      await expect(
        checkoutService.applyCoupon(userId, checkoutId, couponCode)
      ).rejects.toThrow('Invalid promo code');
    });

    it('should throw error if promo code is not valid at this time', async () => {
      const userId = 'user123';
      const checkoutId = 'checkout123';
      const couponCode = 'EXPIRED';

      const mockSession = {
        id: checkoutId,
        userId,
        cartId: 'cart123',
        subtotal: 100,
        expiresAt: new Date(Date.now() + 1000000),
      };
      (checkoutService as any).checkoutSessions.set(checkoutId, mockSession);

      const mockPromoCode = {
        _id: 'promo123',
        code: 'EXPIRED',
        isActive: true,
        validFrom: new Date(Date.now() - 1000000),
        validUntil: new Date(Date.now() - 500000), // Expired
        discountType: 'percentage',
        discountValue: 10,
      };

      vi.mocked(PromoCode.findOne).mockResolvedValue(mockPromoCode as any);

      await expect(
        checkoutService.applyCoupon(userId, checkoutId, couponCode)
      ).rejects.toThrow('Promo code is not valid at this time');
    });

    it('should apply percentage discount successfully', async () => {
      const userId = 'user123';
      const checkoutId = 'checkout123';
      const couponCode = 'SAVE10';

      const mockSession = {
        id: checkoutId,
        userId,
        cartId: 'cart123',
        subtotal: 100,
        tax: 9,
        deliveryFee: 5,
        discount: 0,
        expiresAt: new Date(Date.now() + 1000000),
      };
      (checkoutService as any).checkoutSessions.set(checkoutId, mockSession);

      const mockPromoCode = {
        _id: 'promo123',
        code: 'SAVE10',
        isActive: true,
        validFrom: new Date(Date.now() - 1000000),
        validUntil: new Date(Date.now() + 1000000),
        discountType: 'percentage',
        discountValue: 10,
      };

      vi.mocked(PromoCode.findOne).mockResolvedValue(mockPromoCode as any);
      vi.mocked(Cart.findByIdAndUpdate).mockResolvedValue({} as any);

      const updatedSession = await checkoutService.applyCoupon(
        userId,
        checkoutId,
        couponCode
      );

      expect(updatedSession.discount).toBe(10); // 10% of 100
      expect(updatedSession.total).toBe(104); // 100 - 10 + 9 + 5
    });

    it('should apply fixed discount successfully', async () => {
      const userId = 'user123';
      const checkoutId = 'checkout123';
      const couponCode = 'SAVE20';

      const mockSession = {
        id: checkoutId,
        userId,
        cartId: 'cart123',
        subtotal: 100,
        tax: 9,
        deliveryFee: 5,
        discount: 0,
        expiresAt: new Date(Date.now() + 1000000),
      };
      (checkoutService as any).checkoutSessions.set(checkoutId, mockSession);

      const mockPromoCode = {
        _id: 'promo123',
        code: 'SAVE20',
        isActive: true,
        validFrom: new Date(Date.now() - 1000000),
        validUntil: new Date(Date.now() + 1000000),
        discountType: 'fixed',
        discountValue: 20,
      };

      vi.mocked(PromoCode.findOne).mockResolvedValue(mockPromoCode as any);
      vi.mocked(Cart.findByIdAndUpdate).mockResolvedValue({} as any);

      const updatedSession = await checkoutService.applyCoupon(
        userId,
        checkoutId,
        couponCode
      );

      expect(updatedSession.discount).toBe(20);
      expect(updatedSession.total).toBe(94); // 100 - 20 + 9 + 5
    });
  });

  describe('removeCoupon', () => {
    it('should remove coupon and recalculate totals', async () => {
      const userId = 'user123';
      const checkoutId = 'checkout123';

      const mockSession = {
        id: checkoutId,
        userId,
        cartId: 'cart123',
        subtotal: 100,
        tax: 9,
        deliveryFee: 5,
        discount: 10,
        promoCode: { code: 'SAVE10', discountAmount: 10 },
        expiresAt: new Date(Date.now() + 1000000),
      };
      (checkoutService as any).checkoutSessions.set(checkoutId, mockSession);

      vi.mocked(Cart.findByIdAndUpdate).mockResolvedValue({} as any);

      const updatedSession = await checkoutService.removeCoupon(
        userId,
        checkoutId
      );

      expect(updatedSession.discount).toBe(0);
      expect(updatedSession.total).toBe(114); // 100 + 9 + 5
      expect(updatedSession.promoCode).toBeUndefined();
    });
  });

  describe('calculateDeliveryCharges', () => {
    it('should return base delivery fee', async () => {
      const addressId = 'address123';
      const fee = await checkoutService.calculateDeliveryCharges(addressId);

      expect(fee).toBe(2.5);
    });
  });
});
