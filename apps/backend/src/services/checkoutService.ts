import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { CartItem } from '../models/CartItem.js';
import { PromoCode } from '../models/PromoCode.js';
import { PromoCodeUsage } from '../models/PromoCodeUsage.js';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { AppError } from '../utils/AppError.js';

interface CheckoutItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: object;
  addOns?: Array<{ id: string; name: string; price: number }>;
  notes?: string;
}

interface CheckoutSession {
  id: string;
  userId: string;
  cartId: string;
  items: CheckoutItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string | undefined;
  promoCode?: {
    code: string;
    discountAmount: number;
  };
  expiresAt: Date;
  createdAt: Date;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

class CheckoutService {
  private readonly CHECKOUT_SESSION_EXPIRY = 15 * 60 * 1000; // 15 minutes
  private readonly TAX_RATE = 0.1; // 10% tax

  // In-memory storage for checkout sessions (in production, use Redis)
  private checkoutSessions: Map<string, CheckoutSession> = new Map();

  async validateCheckout(userId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get active cart
    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      errors.push('No active cart found');
      return { isValid: false, errors, warnings };
    }

    // Get cart items
    const cartItems = await CartItem.find({ cartId: cart._id }).populate(
      'productId'
    );
    if (cartItems.length === 0) {
      errors.push('Cart is empty');
      return { isValid: false, errors, warnings };
    }

    // Validate delivery address
    if (!cart.deliveryAddress) {
      errors.push('Delivery address is required');
    }

    // Validate product availability and prices
    for (const item of cartItems) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product = item.productId as any;

      if (!product) {
        errors.push(`Product not found for item ${item._id}`);
        continue;
      }

      if (!product.isAvailable) {
        errors.push(`Product "${product.name}" is no longer available`);
      }

      // Check if price has changed
      if (product.basePrice !== item.unitPrice) {
        warnings.push(
          `Price for "${product.name}" has changed from $${item.unitPrice} to $${product.basePrice}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async createCheckoutSession(userId: string): Promise<CheckoutSession> {
    // Validate checkout first
    const validation = await this.validateCheckout(userId);
    if (!validation.isValid) {
      throw new AppError(
        `Checkout validation failed: ${validation.errors.join(', ')}`,
        400
      );
    }

    // Get cart and items
    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const cartItems = await CartItem.find({ cartId: cart._id }).populate(
      'productId'
    );

    // Build checkout items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: CheckoutItem[] = cartItems.map((item: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product = item.productId as any;
      return {
        productId: product._id.toString(),
        productName: product.name,
        productImage: product.images?.[0] || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        customization: item.customization,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addOns: item.addOns as any,
        notes: item.notes,
      };
    });

    // Create session
    const sessionId = new mongoose.Types.ObjectId().toString();
    const expiresAt = new Date(Date.now() + this.CHECKOUT_SESSION_EXPIRY);

    const session: CheckoutSession = {
      id: sessionId,
      userId: userId,
      cartId: String(cart._id),
      items,
      subtotal: cart.subtotal,
      discount: cart.discount,
      tax: cart.tax,
      deliveryFee: cart.deliveryFee,
      total: cart.total,
      deliveryAddress: cart.deliveryAddress,
      ...(cart.promoCode && {
        promoCode: {
          code: cart.promoCode,
          discountAmount: cart.discount,
        },
      }),
      expiresAt,
      createdAt: new Date(),
    };

    this.checkoutSessions.set(sessionId, session);

    // Clean up expired sessions
    this.cleanupExpiredSessions();

    return session;
  }

  async getCheckoutSession(
    userId: string,
    checkoutId: string
  ): Promise<CheckoutSession> {
    const session = this.checkoutSessions.get(checkoutId);

    if (!session) {
      throw new AppError('Checkout session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('Unauthorized access to checkout session', 403);
    }

    if (new Date() > session.expiresAt) {
      this.checkoutSessions.delete(checkoutId);
      throw new AppError('Checkout session has expired', 400);
    }

    return session;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    // Return available payment methods
    return [
      {
        id: 'aba',
        name: 'ABA Bank',
        type: 'bank_transfer',
        isActive: true,
      },
      {
        id: 'acleda',
        name: 'ACLEDA Bank',
        type: 'bank_transfer',
        isActive: true,
      },
      {
        id: 'wing',
        name: 'Wing Money',
        type: 'mobile_wallet',
        isActive: true,
      },
      {
        id: 'cash',
        name: 'Cash on Delivery',
        type: 'cash',
        isActive: true,
      },
    ];
  }

  async applyCoupon(
    userId: string,
    checkoutId: string,
    couponCode: string
  ): Promise<CheckoutSession> {
    const session = await this.getCheckoutSession(userId, checkoutId);

    // Find promo code
    const promoCode = await PromoCode.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (!promoCode) {
      throw new AppError('Invalid promo code', 404);
    }

    // Validate promo code
    const now = new Date();
    if (now < promoCode.validFrom || now > promoCode.validUntil) {
      throw new AppError('Promo code is not valid at this time', 400);
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      throw new AppError('Promo code usage limit reached', 400);
    }

    // Check user usage limit
    if (promoCode.userUsageLimit) {
      const userUsageCount = await PromoCodeUsage.countDocuments({
        promoCodeId: promoCode._id,
        userId,
      });

      if (userUsageCount >= promoCode.userUsageLimit) {
        throw new AppError(
          'You have reached the usage limit for this promo code',
          400
        );
      }
    }

    // Check minimum order amount
    if (
      promoCode.minOrderAmount &&
      session.subtotal < promoCode.minOrderAmount
    ) {
      throw new AppError(
        `Minimum order amount of $${promoCode.minOrderAmount} required`,
        400
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.discountType === 'percentage') {
      discountAmount = (session.subtotal * promoCode.discountValue) / 100;
    } else {
      discountAmount = promoCode.discountValue;
    }

    // Apply max discount limit
    if (
      promoCode.maxDiscountAmount &&
      discountAmount > promoCode.maxDiscountAmount
    ) {
      discountAmount = promoCode.maxDiscountAmount;
    }

    // Update session
    session.discount = discountAmount;
    session.total =
      session.subtotal - discountAmount + session.tax + session.deliveryFee;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (session as any).promoCode = {
      code: promoCode.code,
      discountAmount,
    };

    this.checkoutSessions.set(checkoutId, session);

    // Update cart
    await Cart.findByIdAndUpdate(session.cartId, {
      discount: discountAmount,
      total: session.total,
      promoCode: promoCode.code,
    });

    return session;
  }

  async removeCoupon(
    userId: string,
    checkoutId: string
  ): Promise<CheckoutSession> {
    const session = await this.getCheckoutSession(userId, checkoutId);

    // Recalculate totals without discount
    session.discount = 0;
    session.total = session.subtotal + session.tax + session.deliveryFee;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (session as any).promoCode;

    this.checkoutSessions.set(checkoutId, session);

    // Update cart
    await Cart.findByIdAndUpdate(session.cartId, {
      discount: 0,
      total: session.total,
      $unset: { promoCode: 1 },
    });

    return session;
  }

  async calculateDeliveryCharges(_addressId: string): Promise<number> {
    // Simple delivery fee calculation
    // In production, this would calculate based on distance and delivery zones
    const baseDeliveryFee = 2.5;

    // For now, return a fixed delivery fee
    // TODO: Implement actual distance calculation with delivery zones
    return baseDeliveryFee;
  }

  async confirmCheckout(
    userId: string,
    checkoutId: string,
    paymentMethod: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const session = await this.getCheckoutSession(userId, checkoutId);

    // Get cart
    const cart = await Cart.findById(session.cartId);
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    // Get cart items with product details
    const cartItems = await CartItem.find({ cartId: cart._id }).populate(
      'productId'
    );

    // Start a database transaction
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      // Create order
      const order = new Order({
        userId,
        storeId: cart.storeId,
        status: 'pending_payment',
        paymentStatus: 'pending',
        paymentMethod,
        subtotal: session.subtotal,
        discount: session.discount,
        tax: session.tax,
        deliveryFee: session.deliveryFee,
        total: session.total,
        currency: 'USD',
        deliveryAddress: session.deliveryAddress,
        notes: cart.notes,
        promoCodeId: session.promoCode
          ? (await PromoCode.findOne({ code: session.promoCode.code }))?._id
          : undefined,
      });

      await order.save({ session: mongoSession });

      // Create order items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderItems = cartItems.map((item: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const product = item.productId as any;
        return new OrderItem({
          orderId: order._id,
          productId: product._id,
          productName: product.name,
          productImage: product.images?.[0] || '',
          quantity: item.quantity,
          customization: item.customization,
          addOns: item.addOns,
          notes: item.notes,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        });
      });

      await OrderItem.insertMany(orderItems, { session: mongoSession });

      // Update cart status
      cart.status = 'checked_out';
      await cart.save({ session: mongoSession });

      // Commit transaction
      await mongoSession.commitTransaction();

      // Clean up checkout session
      this.checkoutSessions.delete(checkoutId);

      // Return plain object to avoid complex union type
      return {
        id: String(order._id),
        orderNumber: order.orderNumber,
        userId: String(order.userId),
        storeId: String(order.storeId),
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        deliveryFee: order.deliveryFee,
        total: order.total,
        currency: order.currency,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes,
        createdAt: order.createdAt,
      };
    } catch (error) {
      await mongoSession.abortTransaction();
      throw error;
    } finally {
      mongoSession.endSession();
    }
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.checkoutSessions.entries()) {
      if (now > session.expiresAt) {
        this.checkoutSessions.delete(sessionId);
      }
    }
  }
}

export const checkoutService = new CheckoutService();
