import mongoose from 'mongoose';
import { AddOn } from '../models/AddOn.js';
import { Cart } from '../models/Cart.js';
import { CartItem } from '../models/CartItem.js';
import {
  CheckoutSession,
  type CheckoutPaymentMethod,
  type CheckoutSessionStatus,
  type ICheckoutSession,
} from '../models/CheckoutSession.js';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { PromoCode } from '../models/PromoCode.js';
import { PromoCodeUsage } from '../models/PromoCodeUsage.js';
import { cleanImageUrls } from './productService.js';
import { bakongKhqrService } from './bakongKhqrService.js';
import {
  AppError,
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../utils/AppError.js';

interface CheckoutItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: object | undefined;
  addOns: Array<{ id: string; name: string; price: number }>;
  notes?: string | undefined;
}

interface CheckoutSessionData {
  id: string;
  userId: string;
  cartId: string;
  storeId: string;
  status: CheckoutSessionStatus;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod?: CheckoutPaymentMethod | undefined;
  fulfillmentType: 'pickup' | 'delivery';
  items: CheckoutItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  currency: string;
  deliveryAddress?: string | undefined;
  notes?: string | undefined;
  promoCode?: {
    code: string;
    discountAmount: number;
  } | undefined;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    total: number;
    currency: string;
  } | undefined;
  payment?: {
    provider: 'bakong';
    qrPayload: string;
    qrImageDataUrl: string;
    md5: string;
    expiresAt: Date;
  } | undefined;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | undefined;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface PaymentMethod {
  id: CheckoutPaymentMethod;
  name: string;
  type: 'khqr' | 'cash';
  description: string;
  isActive: boolean;
}

class CheckoutService {
  private readonly CHECKOUT_SESSION_EXPIRY = 15 * 60 * 1000;
  private readonly TAX_RATE = 0.1;

  async validateCheckout(userId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      errors.push('No active cart found');
      return { isValid: false, errors, warnings };
    }

    const cartItems = await CartItem.find({ cartId: cart._id }).populate(
      'productId'
    );

    if (cartItems.length === 0) {
      errors.push('Cart is empty');
      return { isValid: false, errors, warnings };
    }

    if (!cart.deliveryAddress) {
      warnings.push(
        'No delivery address selected. This order will be prepared for pickup.'
      );
    }

    for (const item of cartItems) {
      const product = item.productId as unknown as {
        _id: mongoose.Types.ObjectId;
        name: string;
        isAvailable: boolean;
      } | null;

      if (!product) {
        errors.push(`Product not found for cart item ${item._id}`);
        continue;
      }

      if (!product.isAvailable) {
        errors.push(`Product "${product.name}" is no longer available`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async createCheckoutSession(userId: string): Promise<CheckoutSessionData> {
    const validation = await this.validateCheckout(userId);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Checkout validation failed: ${validation.errors.join(', ')}`
      );
    }

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const cartItems = await CartItem.find({ cartId: cart._id }).populate(
      'productId'
    );
    const items = await this.buildCheckoutItems(cartItems);
    const expiresAt = new Date(Date.now() + this.CHECKOUT_SESSION_EXPIRY);
    const fulfillmentType = cart.deliveryAddress ? 'delivery' : 'pickup';

    const session = await CheckoutSession.findOneAndUpdate(
      {
        userId,
        cartId: cart._id,
        status: 'pending',
      },
      {
        userId,
        cartId: cart._id,
        storeId: cart.storeId,
        status: 'pending',
        paymentStatus: 'pending',
        fulfillmentType,
        items,
        subtotal: cart.subtotal,
        discount: cart.discount,
        tax: cart.tax,
        deliveryFee: cart.deliveryFee,
        total: cart.total,
        currency: 'USD',
        deliveryAddress: cart.deliveryAddress,
        notes: cart.notes,
        promoCode: cart.promoCode
          ? {
              code: cart.promoCode,
              discountAmount: cart.discount,
            }
          : undefined,
        paymentMethod: undefined,
        orderId: undefined,
        payment: undefined,
        completedAt: undefined,
        expiresAt,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return this.serializeCheckoutSession(session);
  }

  async getCheckoutSession(
    userId: string,
    checkoutId: string
  ): Promise<CheckoutSessionData> {
    const session = await this.getOwnedSession(userId, checkoutId);
    const refreshedSession = await this.refreshSessionState(session);

    return this.serializeCheckoutSession(refreshedSession);
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return [
      {
        id: 'bakong_khqr',
        name: 'Bakong KHQR',
        type: 'khqr',
        description: 'Pay by scanning KHQR with any supported Cambodian bank app.',
        isActive: bakongKhqrService.isConfigured(),
      },
      {
        id: 'cash',
        name: 'Pay in store',
        type: 'cash',
        description: 'Place the order now and pay when you collect it.',
        isActive: true,
      },
    ];
  }

  async applyCoupon(
    userId: string,
    checkoutId: string,
    couponCode: string
  ): Promise<CheckoutSessionData> {
    const session = await this.getOwnedSession(userId, checkoutId);
    await this.ensureCheckoutMutable(session);

    const promoCode = await PromoCode.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (!promoCode) {
      throw new NotFoundError('Invalid promo code');
    }

    const now = new Date();
    if (now < promoCode.validFrom || now > promoCode.validUntil) {
      throw new BadRequestError('Promo code is not valid at this time');
    }

    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      throw new BadRequestError('Promo code usage limit reached');
    }

    if (promoCode.userUsageLimit) {
      const userUsageCount = await PromoCodeUsage.countDocuments({
        promoCodeId: promoCode._id,
        userId,
      });

      if (userUsageCount >= promoCode.userUsageLimit) {
        throw new BadRequestError(
          'You have reached the usage limit for this promo code'
        );
      }
    }

    if (promoCode.minOrderAmount && session.subtotal < promoCode.minOrderAmount) {
      throw new BadRequestError(
        `Minimum order amount of $${promoCode.minOrderAmount} required`
      );
    }

    let discountAmount = 0;
    if (promoCode.discountType === 'percentage') {
      discountAmount = (session.subtotal * promoCode.discountValue) / 100;
    } else {
      discountAmount = promoCode.discountValue;
    }

    if (
      promoCode.maxDiscountAmount &&
      discountAmount > promoCode.maxDiscountAmount
    ) {
      discountAmount = promoCode.maxDiscountAmount;
    }

    const tax = this.calculateTax(session.subtotal, discountAmount);
    const total = session.subtotal - discountAmount + tax + session.deliveryFee;

    session.discount = discountAmount;
    session.tax = tax;
    session.total = total;
    session.promoCode = {
      code: promoCode.code,
      discountAmount,
    };
    await session.save();

    await Cart.findByIdAndUpdate(session.cartId, {
      discount: discountAmount,
      tax,
      total,
      promoCode: promoCode.code,
    });

    return this.serializeCheckoutSession(session);
  }

  async removeCoupon(
    userId: string,
    checkoutId: string
  ): Promise<CheckoutSessionData> {
    const session = await this.getOwnedSession(userId, checkoutId);
    await this.ensureCheckoutMutable(session);

    const tax = this.calculateTax(session.subtotal, 0);
    const total = session.subtotal + tax + session.deliveryFee;

    session.discount = 0;
    session.tax = tax;
    session.total = total;
    session.promoCode = undefined;
    await session.save();

    await Cart.findByIdAndUpdate(session.cartId, {
      discount: 0,
      tax,
      total,
      $unset: { promoCode: 1 },
    });

    return this.serializeCheckoutSession(session);
  }

  async calculateDeliveryCharges(_addressId: string): Promise<number> {
    return 2.5;
  }

  async confirmCheckout(
    userId: string,
    checkoutId: string,
    paymentMethod: CheckoutPaymentMethod
  ): Promise<CheckoutSessionData> {
    const session = await this.getOwnedSession(userId, checkoutId);
    await this.ensureCheckoutMutable(session);

    const cart = await Cart.findById(session.cartId);
    if (!cart || cart.status !== 'active') {
      throw new NotFoundError('Active cart not found for checkout');
    }

    const cartItems = await CartItem.find({ cartId: cart._id }).populate(
      'productId'
    );
    if (cartItems.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    if (paymentMethod === 'bakong_khqr' && !bakongKhqrService.isConfigured()) {
      throw new AppError('Bakong KHQR is not available right now', 503);
    }

    if (session.orderId) {
      const refreshedSession = await this.refreshSessionState(session);
      return this.serializeCheckoutSession(refreshedSession);
    }

    const khqrPayment =
      paymentMethod === 'bakong_khqr'
        ? await bakongKhqrService.generateMerchantKhqr({
            amount: session.total,
            billNumber: `CHK-${session._id.toString().slice(-8).toUpperCase()}`,
            storeLabel: cart.storeId.toString().slice(-6).toUpperCase(),
          })
        : null;

    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      const order = new Order({
        userId,
        storeId: cart.storeId,
        status: paymentMethod === 'cash' ? 'confirmed' : 'pending_payment',
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
        paymentMethod,
        subtotal: session.subtotal,
        discount: session.discount,
        tax: session.tax,
        deliveryFee: session.deliveryFee,
        total: session.total,
        currency: session.currency,
        deliveryAddress: session.deliveryAddress,
        notes: session.notes,
        promoCodeId: session.promoCode
          ? (await PromoCode.findOne({ code: session.promoCode.code }))?._id
          : undefined,
      });

      await order.save({ session: mongoSession });

      const checkoutItems = await this.buildCheckoutItems(cartItems);
      const orderItems = checkoutItems.map((item) => ({
        orderId: order._id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        customization: item.customization,
        addOns: item.addOns,
        notes: item.notes,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      }));

      await OrderItem.insertMany(orderItems, { session: mongoSession });

      cart.status = 'checked_out';
      await cart.save({ session: mongoSession });

      session.orderId = order._id as mongoose.Types.ObjectId;
      session.paymentMethod = paymentMethod;
      session.status =
        paymentMethod === 'cash' ? 'completed' : 'awaiting_payment';
      session.paymentStatus =
        paymentMethod === 'cash' ? 'pending' : 'processing';
      session.completedAt = paymentMethod === 'cash' ? new Date() : undefined;
      session.payment = khqrPayment
        ? {
            provider: 'bakong',
            qrPayload: khqrPayment.qrPayload,
            qrImageDataUrl: khqrPayment.qrImageDataUrl,
            md5: khqrPayment.md5,
            expiresAt: khqrPayment.expiresAt,
          }
        : undefined;

      await session.save({ session: mongoSession });

      await mongoSession.commitTransaction();

      const refreshedSession = await this.refreshSessionState(session);
      return this.serializeCheckoutSession(refreshedSession);
    } catch (error) {
      await mongoSession.abortTransaction();
      throw error;
    } finally {
      mongoSession.endSession();
    }
  }

  private async buildCheckoutItems(
    cartItems: Array<
      mongoose.Document & {
        _id: mongoose.Types.ObjectId;
        productId: unknown;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        customization?: object;
        addOns?: Array<mongoose.Types.ObjectId>;
        notes?: string;
      }
    >
  ): Promise<CheckoutItem[]> {
    return Promise.all(
      cartItems.map(async (item) => {
        const product = item.productId as {
          _id: mongoose.Types.ObjectId;
          name: string;
          images?: unknown[];
        } | null;

        const image = cleanImageUrls(product?.images)?.[0] ?? '';
        const addOns = await this.resolveAddOns(
          item.addOns?.map((entry) => entry.toString()) ?? []
        );

        return {
          productId: product?._id.toString() ?? '',
          productName: product?.name ?? 'Unavailable product',
          productImage: image,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          customization: item.customization,
          addOns,
          notes: item.notes,
        };
      })
    );
  }

  private async resolveAddOns(addOnIds: string[]) {
    if (addOnIds.length === 0) {
      return [];
    }

    const addOnDocs = await AddOn.find({ _id: { $in: addOnIds } });
    return addOnIds.flatMap((addOnId) => {
      const addOn = addOnDocs.find((entry) => entry._id.toString() === addOnId);
      if (!addOn) {
        return [];
      }

      return [
        {
          id: addOn._id.toString(),
          name: addOn.name,
          price: addOn.price,
        },
      ];
    });
  }

  private async getOwnedSession(userId: string, checkoutId: string) {
    const session = await CheckoutSession.findById(checkoutId);

    if (!session) {
      throw new NotFoundError('Checkout session not found');
    }

    if (session.userId.toString() !== userId) {
      throw new ForbiddenError('Unauthorized access to checkout session');
    }

    return session;
  }

  private async refreshSessionState(session: ICheckoutSession) {
    if (session.status === 'completed' || session.status === 'failed') {
      return session;
    }

    if (new Date() > session.expiresAt) {
      return this.expireSession(session);
    }

    if (
      session.status === 'awaiting_payment' &&
      session.paymentMethod === 'bakong_khqr' &&
      session.payment?.md5
    ) {
      if (session.payment.expiresAt < new Date()) {
        return this.expireSession(session);
      }

      const paymentResult = await bakongKhqrService.checkTransactionByMd5(
        session.payment.md5
      );

      if (paymentResult.isPaid) {
        session.status = 'completed';
        session.paymentStatus = 'completed';
        session.completedAt = new Date();
        await session.save();

        if (session.orderId) {
          await Order.findByIdAndUpdate(session.orderId, {
            status: 'confirmed',
            paymentStatus: 'completed',
            paymentProviderTransactionId: paymentResult.transactionId,
          });
        }
      }
    }

    return session;
  }

  private async expireSession(session: ICheckoutSession) {
    if (session.status === 'completed' || session.status === 'expired') {
      return session;
    }

    session.status = 'expired';
    session.paymentStatus = 'failed';
    await session.save();

    if (session.orderId) {
      await Order.findByIdAndUpdate(session.orderId, {
        status: 'cancelled',
        paymentStatus: 'failed',
        cancellationReason: 'Checkout session expired before payment completion',
        cancelledBy: 'system',
        cancelledAt: new Date(),
      });
    }

    return session;
  }

  private async ensureCheckoutMutable(session: ICheckoutSession) {
    const refreshedSession = await this.refreshSessionState(session);
    if (refreshedSession.status !== 'pending') {
      throw new BadRequestError(
        'This checkout session can no longer be modified'
      );
    }
  }

  private calculateTax(subtotal: number, discount: number) {
    return Math.max(subtotal - discount, 0) * this.TAX_RATE;
  }

  private async serializeCheckoutSession(
    session: ICheckoutSession
  ): Promise<CheckoutSessionData> {
    const order = session.orderId ? await Order.findById(session.orderId) : null;

    return {
      id: session._id.toString(),
      userId: session.userId.toString(),
      cartId: session.cartId.toString(),
      storeId: session.storeId.toString(),
      status: session.status,
      paymentStatus: session.paymentStatus,
      paymentMethod: session.paymentMethod,
      fulfillmentType: session.fulfillmentType,
      items: session.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        customization: item.customization,
        addOns: item.addOns.map((entry) => ({
          id: entry.id,
          name: entry.name,
          price: entry.price,
        })),
        notes: item.notes,
      })),
      subtotal: session.subtotal,
      discount: session.discount,
      tax: session.tax,
      deliveryFee: session.deliveryFee,
      total: session.total,
      currency: session.currency,
      deliveryAddress: session.deliveryAddress,
      notes: session.notes,
      promoCode: session.promoCode
        ? {
            code: session.promoCode.code,
            discountAmount: session.promoCode.discountAmount,
          }
        : undefined,
      order: order
        ? {
            id: order._id.toString(),
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            total: order.total,
            currency: order.currency,
          }
        : undefined,
      payment: session.payment
        ? {
            provider: session.payment.provider,
            qrPayload: session.payment.qrPayload,
            qrImageDataUrl: session.payment.qrImageDataUrl,
            md5: session.payment.md5,
            expiresAt: session.payment.expiresAt,
          }
        : undefined,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      completedAt: session.completedAt,
    };
  }
}

export const checkoutService = new CheckoutService();
