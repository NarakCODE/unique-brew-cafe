import mongoose from 'mongoose';
import { Order, type IOrder, type OrderStatus } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { OrderStatusHistory } from '../models/OrderStatusHistory.js';
import { Cart } from '../models/Cart.js';
import { CartItem } from '../models/CartItem.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Store } from '../models/Store.js';
import { AddOn } from '../models/AddOn.js';
import { AppError, BadRequestError } from '../utils/AppError.js';
import PDFDocument from 'pdfkit';
import {
  parsePaginationParams,
  buildPaginationResult,
  type PaginationParams,
  type PaginationResult,
} from '../utils/pagination.js';

interface OrderFilters {
  status?: OrderStatus;
  storeId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

interface OrderTracking {
  orderNumber: string;
  status: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: Date;
    notes?: string;
  }>;
  estimatedReadyTime?: Date | undefined;
  actualReadyTime?: Date | undefined;
  pickedUpAt?: Date | undefined;
}

interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  customization?: {
    size?: string;
    sugarLevel?: string;
    iceLevel?: string;
    coffeeLevel?: string;
  };
  notes?: string;
}

interface CreateOrderInput {
  storeId: string;
  items: CreateOrderItemInput[];
  pickupTime?: Date;
  notes?: string;
  paymentMethod?: string;
}

export class OrderService {
  private extractUserId(
    user:
      | mongoose.Types.ObjectId
      | { _id?: mongoose.Types.ObjectId | string; id?: string }
      | string
  ): string {
    if (typeof user === 'string') {
      return user;
    }

    if (user instanceof mongoose.Types.ObjectId) {
      return user.toString();
    }

    return user.id || user._id?.toString() || '';
  }

  private buildCustomer(
    user:
      | mongoose.Types.ObjectId
      | {
          _id?: mongoose.Types.ObjectId | string;
          id?: string;
          fullName?: string;
          email?: string;
          phoneNumber?: string;
          profileImage?: string;
          role?: string;
        }
      | string
  ) {
    if (typeof user === 'string' || user instanceof mongoose.Types.ObjectId) {
      return null;
    }

    const customerId = user.id || user._id?.toString?.();

    if (!customerId) {
      return null;
    }

    return {
      id: customerId,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      role: user.role,
    };
  }

  private shapeOrderResponse<T extends { userId: unknown }>(
    order: T,
    extra?: Record<string, unknown>
  ): T {
    return {
      ...order,
      userId: this.extractUserId(order.userId as never),
      customer: this.buildCustomer(order.userId as never),
      ...extra,
    } as T;
  }

  private async loadOrderResponse(
    orderId: string,
    includeItems = false
  ): Promise<IOrder> {
    const order = await Order.findById(orderId)
      .populate('userId', 'fullName email phoneNumber profileImage role')
      .populate('storeId', 'name address city phone')
      .lean();

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const items = includeItems
      ? await OrderItem.find({ orderId: order._id }).lean()
      : undefined;

    return this.shapeOrderResponse(order, items ? { items } : undefined) as unknown as IOrder;
  }

  async createOrder(userId: string, input: CreateOrderInput): Promise<IOrder> {
    const { storeId, items, pickupTime, notes, paymentMethod = 'cash' } = input;

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      throw new AppError('Invalid store ID', 400);
    }

    const mongoSession = await mongoose.startSession();
    let createdOrderId: mongoose.Types.ObjectId | null = null;

    try {
      await mongoSession.withTransaction(async () => {
        const store = await Store.findOne({
          _id: storeId,
          isActive: true,
        }).session(mongoSession);

        if (!store) {
          throw new AppError('Store not found or inactive', 404);
        }

        const productIds = items.map((item) => item.productId);
        const uniqueProductIds = [...new Set(productIds)];

        const products = await Product.find({
          _id: { $in: uniqueProductIds },
          isAvailable: true,
          deletedAt: { $exists: false },
        })
          .session(mongoSession);

        if (products.length !== uniqueProductIds.length) {
          throw new AppError(
            'One or more products are unavailable or do not exist',
            400
          );
        }

        const productMap = new Map(
          products.map((product) => [String(product._id), product])
        );

        const categoryIds = [
          ...new Set(products.map((product) => String(product.categoryId))),
        ];
        const categories = await Category.find({
          _id: { $in: categoryIds },
        })
          .select('_id storeId isActive')
          .session(mongoSession)
          .lean();

        const categoryMap = new Map(
          categories.map((category) => [String(category._id), category])
        );

        for (const product of products) {
          const category = categoryMap.get(String(product.categoryId));

          if (!category || !category.isActive) {
            throw new BadRequestError(
              'Product category is inactive or missing',
              undefined,
              [
                {
                  productId: String(product._id),
                  categoryId: String(product.categoryId),
                  requestedStoreId: storeId,
                },
              ]
            );
          }

          if (String(category.storeId) !== storeId) {
            throw new BadRequestError(
              'One or more products do not belong to the selected store',
              undefined,
              [
                {
                  productId: String(product._id),
                  categoryId: String(product.categoryId),
                  categoryStoreId: String(category.storeId),
                  requestedStoreId: storeId,
                },
              ]
            );
          }
        }

        const orderItemDocs = items.map((item) => {
          const product = productMap.get(item.productId);
          if (!product) {
            throw new AppError('Product not found', 400);
          }

          const unitPrice = product.basePrice;
          const totalPrice = unitPrice * item.quantity;

          return {
            productId: product._id,
            productName: product.name,
            productImage: product.images?.[0] || '',
            quantity: item.quantity,
            customization: item.customization,
            notes: item.notes,
            unitPrice,
            totalPrice,
          };
        });

        const subtotal = orderItemDocs.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        );
        const tax = Number((subtotal * 0.1).toFixed(2));
        const total = Number((subtotal + tax).toFixed(2));

        const estimatedReadyTime = pickupTime
          ? undefined
          : new Date(Date.now() + store.averagePrepTime * 60 * 1000);

        const order = new Order({
          userId,
          storeId,
          status: 'received',
          paymentStatus: 'pending',
          paymentMethod,
          subtotal,
          discount: 0,
          tax,
          deliveryFee: 0,
          total,
          currency: 'USD',
          pickupTime,
          estimatedReadyTime,
          notes,
        });

        await order.save({ session: mongoSession });

        await OrderItem.insertMany(
          orderItemDocs.map((item) => ({
            orderId: order._id,
            ...item,
          })),
          { session: mongoSession }
        );

        await OrderStatusHistory.create(
          [
            {
              orderId: order._id,
              status: 'received',
              notes: 'Order received from mobile checkout',
              changedBy: 'customer',
            },
          ],
          { session: mongoSession }
        );

        createdOrderId = order._id as mongoose.Types.ObjectId;
      });
    } finally {
      await mongoSession.endSession();
    }

    if (!createdOrderId) {
      throw new AppError('Unable to create order', 500);
    }

    return this.loadOrderResponse(String(createdOrderId), true);
  }

  /**
   * Get orders with filters based on user role (with pagination)
   */
  async getOrders(
    userId: string,
    role: string,
    filters?: OrderFilters,
    paginationParams?: PaginationParams
  ): Promise<PaginationResult<IOrder>> {
    const query: Record<string, unknown> = {};

    // Non-admin users can only see their own orders
    if (role !== 'admin') {
      query.userId = new mongoose.Types.ObjectId(userId);
    } else if (filters?.userId) {
      query.userId = new mongoose.Types.ObjectId(filters.userId);
    }

    // Apply filters
    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.storeId) {
      query.storeId = new mongoose.Types.ObjectId(filters.storeId);
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {} as Record<string, Date>;
      if (filters.startDate) {
        (query.createdAt as Record<string, Date>).$gte = filters.startDate;
      }
      if (filters.endDate) {
        (query.createdAt as Record<string, Date>).$lte = filters.endDate;
      }
    }

    // Parse pagination parameters
    const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(
      paginationParams || {}
    );

    // Build sort object
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    // Execute query with pagination and projection
    const [orders, total] = await Promise.all([
      Order.find(query)
        .select('-internalNotes') // Exclude internal notes for non-admin users
        .populate('userId', 'fullName email phoneNumber profileImage role')
        .populate('storeId', 'name address city')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return buildPaginationResult(
      orders.map((order) => this.shapeOrderResponse(order)) as unknown as IOrder[],
      total,
      page,
      limit
    );
  }

  /**
   * Get order by ID with ownership validation
   */
  async getOrderById(
    orderId: string,
    userId: string,
    role: string
  ): Promise<IOrder> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError('Invalid order ID', 400);
    }

    const order = await Order.findById(orderId)
      .populate('userId', 'fullName email phoneNumber profileImage role')
      .populate('storeId', 'name address city phone')
      .lean();

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Validate ownership for non-admin users
    if (role !== 'admin' && this.extractUserId(order.userId) !== userId) {
      throw new AppError('You do not have permission to view this order', 403);
    }

    // Get order items
    const items = await OrderItem.find({ orderId: order._id }).lean();

    return this.shapeOrderResponse(order, { items }) as unknown as IOrder;
  }

  /**
   * Get order tracking information
   */
  async getOrderTracking(
    orderId: string,
    userId: string
  ): Promise<OrderTracking> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError('Invalid order ID', 400);
    }

    const order = await Order.findById(orderId).lean();

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Validate ownership
    if (order.userId.toString() !== userId) {
      throw new AppError('You do not have permission to view this order', 403);
    }

    // Get status history
    const statusHistory = await OrderStatusHistory.find({ orderId: order._id })
      .sort({ createdAt: 1 })
      .lean();

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      statusHistory: statusHistory.map((h) => ({
        status: h.status,
        timestamp: h.createdAt,
        ...(h.notes && { notes: h.notes }),
      })),
      estimatedReadyTime: order.estimatedReadyTime,
      actualReadyTime: order.actualReadyTime,
      pickedUpAt: order.pickedUpAt,
    };
  }

  /**
   * Generate PDF invoice for an order
   */
  async generateInvoice(
    orderId: string,
    userId: string,
    role: string
  ): Promise<Buffer> {
    const order = await this.getOrderById(orderId, userId, role);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text('INVOICE', { align: 'center' }).moveDown();

        // Order details
        doc
          .fontSize(12)
          .text(`Order Number: ${order.orderNumber}`)
          .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
          .text(`Status: ${order.status}`)
          .moveDown();

        // Store information
        if (order.storeId && typeof order.storeId === 'object') {
          const store = order.storeId as unknown as {
            name: string;
            address: string;
            city: string;
          };
          doc
            .fontSize(14)
            .text('Store Information', { underline: true })
            .fontSize(10)
            .text(store.name)
            .text(`${store.address}, ${store.city}`)
            .moveDown();
        }

        // Delivery address
        if (order.deliveryAddress) {
          doc
            .fontSize(14)
            .text('Delivery Address', { underline: true })
            .fontSize(10)
            .text(order.deliveryAddress)
            .moveDown();
        }

        // Items table
        doc.fontSize(14).text('Order Items', { underline: true }).moveDown(0.5);

        const items = (order as unknown as { items: unknown[] }).items || [];
        items.forEach((item: unknown) => {
          const orderItem = item as {
            productName: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
          };
          doc
            .fontSize(10)
            .text(`${orderItem.productName} x ${orderItem.quantity}`, {
              continued: true,
            })
            .text(`$${orderItem.totalPrice.toFixed(2)}`, { align: 'right' });
        });

        doc.moveDown();

        // Totals
        doc
          .fontSize(10)
          .text(`Subtotal:`, { continued: true })
          .text(`$${order.subtotal.toFixed(2)}`, { align: 'right' });

        if (order.discount > 0) {
          doc
            .text(`Discount:`, { continued: true })
            .text(`-$${order.discount.toFixed(2)}`, { align: 'right' });
        }

        doc
          .text(`Tax:`, { continued: true })
          .text(`$${order.tax.toFixed(2)}`, { align: 'right' });

        if (order.deliveryFee > 0) {
          doc
            .text(`Delivery Fee:`, { continued: true })
            .text(`$${order.deliveryFee.toFixed(2)}`, { align: 'right' });
        }

        doc
          .fontSize(12)
          .text(`Total:`, { continued: true, underline: true })
          .text(`$${order.total.toFixed(2)}`, {
            align: 'right',
            underline: true,
          });

        doc.moveDown();

        // Payment information
        doc
          .fontSize(10)
          .text(`Payment Method: ${order.paymentMethod}`)
          .text(`Payment Status: ${order.paymentStatus}`);

        // Footer
        doc
          .moveDown(2)
          .fontSize(8)
          .text('Thank you for your order!', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Cancel an order within 5 minutes of placement
   */
  async cancelOrder(
    orderId: string,
    userId: string,
    reason: string
  ): Promise<IOrder> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError('Invalid order ID', 400);
    }

    const mongoSession = await mongoose.startSession();
    let cancelledOrderId: string | null = null;

    try {
      await mongoSession.withTransaction(async () => {
        const order = await Order.findById(orderId).session(mongoSession);

        if (!order) {
          throw new AppError('Order not found', 404);
        }

        // Validate ownership
        if (order.userId.toString() !== userId) {
          throw new AppError(
            'You do not have permission to cancel this order',
            403
          );
        }

        // Check if order is already cancelled or completed
        if (order.status === 'cancelled') {
          throw new AppError('Order is already cancelled', 400);
        }

        if (order.status === 'completed') {
          throw new AppError('Cannot cancel a completed order', 400);
        }

        // Check 5-minute time limit
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (order.createdAt < fiveMinutesAgo) {
          throw new AppError(
            'Order can only be cancelled within 5 minutes of placement',
            400
          );
        }

        // Update order status
        order.status = 'cancelled';
        order.cancellationReason = reason;
        order.cancelledBy = 'customer';
        order.cancelledAt = new Date();

        // If payment was completed, initiate refund
        if (order.paymentStatus === 'completed') {
          order.refundAmount = order.total;
          order.refundStatus = 'pending';
        }

        await order.save({ session: mongoSession });

        // Record status change
        await OrderStatusHistory.create(
          [
            {
              orderId: order._id,
              status: 'cancelled',
              notes: `Cancelled by customer: ${reason}`,
              changedBy: 'customer',
            },
          ],
          { session: mongoSession }
        );

        cancelledOrderId = String(order._id);
      });
    } finally {
      await mongoSession.endSession();
    }

    if (!cancelledOrderId) {
      throw new AppError('Unable to cancel order', 500);
    }

    return this.loadOrderResponse(cancelledOrderId);
  }

  /**
   * Rate an order after delivery
   */
  async rateOrder(
    orderId: string,
    userId: string,
    rating: number,
    review?: string
  ): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError('Invalid order ID', 400);
    }

    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Validate ownership
    if (order.userId.toString() !== userId) {
      throw new AppError('You do not have permission to rate this order', 403);
    }

    // Check if order is completed
    if (order.status !== 'completed') {
      throw new AppError('Only completed orders can be rated', 400);
    }

    // Store rating and review (in a real app, this would be in a separate Rating model)
    // For now, we'll add it to the order notes
    const ratingNote = `Rating: ${rating}/5${review ? ` - Review: ${review}` : ''}`;
    order.notes = order.notes ? `${order.notes}\n${ratingNote}` : ratingNote;

    await order.save();
  }

  /**
   * Reorder - add all items from a previous order to cart
   */
  async reorder(orderId: string, userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError('Invalid order ID', 400);
    }

    const mongoSession = await mongoose.startSession();

    try {
      await mongoSession.withTransaction(async () => {
        const order = await Order.findById(orderId).session(mongoSession);

        if (!order) {
          throw new AppError('Order not found', 404);
        }

        // Validate ownership
        if (order.userId.toString() !== userId) {
          throw new AppError(
            'You do not have permission to reorder this order',
            403
          );
        }

        // Get order items
        const orderItems = await OrderItem.find({ orderId: order._id }).session(
          mongoSession
        );

        if (orderItems.length === 0) {
          throw new AppError('No items found in this order', 400);
        }

        // Find or create active cart
        let cart = await Cart.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          status: 'active',
        }).session(mongoSession);

        // If cart exists and is for a different store, clear it
        if (cart && cart.storeId.toString() !== order.storeId.toString()) {
          await CartItem.deleteMany({ cartId: cart._id }).session(mongoSession);
          cart.storeId = order.storeId;
          cart.subtotal = 0;
          cart.total = 0;
        }

        // Create new cart if doesn't exist
        if (!cart) {
          const createdCarts = await Cart.create(
            [
              {
                userId: new mongoose.Types.ObjectId(userId),
                storeId: order.storeId,
                status: 'active',
              },
            ],
            { session: mongoSession }
          );
          cart = createdCarts[0]!;
        }

        // Add items to cart
        for (const orderItem of orderItems) {
          // Verify product still exists and is available
          const product = await Product.findById(orderItem.productId).session(
            mongoSession
          );

          if (!product || !product.isAvailable) {
            continue; // Skip unavailable products
          }

          // Get current price
          const currentPrice = product.basePrice;

          // Calculate add-ons price
          let addOnsPrice = 0;
          const addOnIds: mongoose.Types.ObjectId[] = [];

          if (orderItem.addOns && orderItem.addOns.length > 0) {
            const addOnIdsFromSnapshot = orderItem.addOns
              .map((a) =>
                mongoose.Types.ObjectId.isValid(a.id)
                  ? new mongoose.Types.ObjectId(a.id)
                  : null
              )
              .filter((id): id is mongoose.Types.ObjectId => id !== null);

            const addOns = await AddOn.find({
              _id: { $in: addOnIdsFromSnapshot },
            }).session(mongoSession);
            addOnsPrice = addOns.reduce((sum, addOn) => sum + addOn.price, 0);
            addOnIds.push(
              ...addOns.map((a) => a._id as mongoose.Types.ObjectId)
            );
          }

          const unitPrice = currentPrice + addOnsPrice;
          const totalPrice = unitPrice * orderItem.quantity;

          // Create cart item
          await CartItem.create(
            [
              {
                cartId: cart._id,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                customization: orderItem.customization,
                addOns: addOnIds,
                notes: orderItem.notes,
                unitPrice,
                totalPrice,
              },
            ],
            { session: mongoSession }
          );
        }

        // Recalculate cart totals
        const cartItems = await CartItem.find({ cartId: cart._id }).session(
          mongoSession
        );
        cart.subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
        cart.tax = cart.subtotal * 0.1; // 10% tax
        cart.total = cart.subtotal + cart.tax + cart.deliveryFee - cart.discount;

        await cart.save({ session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }
  }

  /**
   * Generate PDF receipt for an order (Admin only)
   */
  async generateReceipt(orderId: string): Promise<Buffer> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError('Invalid order ID', 400);
    }

    const order = await Order.findById(orderId)
      .populate('storeId', 'name address city phone')
      .lean();

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Get order items
    const items = await OrderItem.find({ orderId: order._id }).lean();

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text('RECEIPT', { align: 'center' }).moveDown();

        // Order details
        doc
          .fontSize(12)
          .text(`Order Number: ${order.orderNumber}`)
          .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
          .text(`Status: ${order.status}`)
          .text(`Payment Status: ${order.paymentStatus}`)
          .moveDown();

        // Store information
        if (order.storeId && typeof order.storeId === 'object') {
          const store = order.storeId as unknown as {
            name: string;
            address: string;
            city: string;
            phone: string;
          };
          doc
            .fontSize(14)
            .text('Store Information', { underline: true })
            .fontSize(10)
            .text(store.name)
            .text(`${store.address}, ${store.city}`)
            .text(`Phone: ${store.phone}`)
            .moveDown();
        }

        // Customer information
        doc
          .fontSize(14)
          .text('Customer Information', { underline: true })
          .fontSize(10)
          .text(`Customer ID: ${order.userId}`)
          .moveDown();

        // Delivery address
        if (order.deliveryAddress) {
          doc
            .fontSize(14)
            .text('Delivery Address', { underline: true })
            .fontSize(10)
            .text(order.deliveryAddress)
            .moveDown();
        }

        // Items table
        doc.fontSize(14).text('Order Items', { underline: true }).moveDown(0.5);

        items.forEach((item) => {
          doc
            .fontSize(10)
            .text(`${item.productName} x ${item.quantity}`, {
              continued: true,
            })
            .text(`${item.totalPrice.toFixed(2)}`, { align: 'right' });

          // Show customizations if any
          if (
            item.customization &&
            Object.keys(item.customization).length > 0
          ) {
            doc
              .fontSize(8)
              .fillColor('gray')
              .text(`  Customization: ${JSON.stringify(item.customization)}`)
              .fillColor('black');
          }

          // Show add-ons if any
          if (item.addOns && item.addOns.length > 0) {
            const addOnNames = item.addOns.map((a) => a.name).join(', ');
            doc
              .fontSize(8)
              .fillColor('gray')
              .text(`  Add-ons: ${addOnNames}`)
              .fillColor('black');
          }
        });

        doc.moveDown();

        // Totals
        doc
          .fontSize(10)
          .text(`Subtotal:`, { continued: true })
          .text(`${order.subtotal.toFixed(2)}`, { align: 'right' });

        if (order.discount > 0) {
          doc
            .text(`Discount:`, { continued: true })
            .text(`-${order.discount.toFixed(2)}`, { align: 'right' });
        }

        doc
          .text(`Tax:`, { continued: true })
          .text(`${order.tax.toFixed(2)}`, { align: 'right' });

        if (order.deliveryFee > 0) {
          doc
            .text(`Delivery Fee:`, { continued: true })
            .text(`${order.deliveryFee.toFixed(2)}`, { align: 'right' });
        }

        doc
          .fontSize(12)
          .text(`Total:`, { continued: true, underline: true })
          .text(`${order.total.toFixed(2)}`, {
            align: 'right',
            underline: true,
          });

        doc.moveDown();

        // Payment information
        doc
          .fontSize(10)
          .text(`Payment Method: ${order.paymentMethod}`)
          .text(`Payment Status: ${order.paymentStatus}`);

        if (order.paymentProviderTransactionId) {
          doc.text(`Transaction ID: ${order.paymentProviderTransactionId}`);
        }

        // Internal notes if any
        if (order.internalNotes) {
          doc
            .moveDown()
            .fontSize(10)
            .fillColor('red')
            .text('Internal Notes (Admin Only):', { underline: true })
            .fillColor('black')
            .text(order.internalNotes);
        }

        // Footer
        doc
          .moveDown(2)
          .fontSize(8)
          .text('This is an official receipt', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add internal notes to an order (Admin only)
   */
  async addInternalNotes(orderId: string, notes: string): Promise<IOrder> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError('Invalid order ID', 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Append to existing internal notes
    order.internalNotes = order.internalNotes
      ? `${order.internalNotes}\n[${new Date().toISOString()}] ${notes}`
      : `[${new Date().toISOString()}] ${notes}`;

    await order.save();

    return this.loadOrderResponse(orderId);
  }

  /**
   * Update order status (Admin only)
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
  ): Promise<IOrder> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError('Invalid order ID', 400);
    }

    const mongoSession = await mongoose.startSession();
    let updatedOrderId: string | null = null;

    try {
      await mongoSession.withTransaction(async () => {
        const order = await Order.findById(orderId).session(mongoSession);

        if (!order) {
          throw new AppError('Order not found', 404);
        }

        // Validate status transition
        if (!this.isValidStatusTransition(order.status, newStatus)) {
          throw new AppError(
            `Invalid status transition from ${order.status} to ${newStatus}`,
            400
          );
        }

        const oldStatus = order.status;
        order.status = newStatus;

        // Update timestamps based on status
        if (newStatus === 'ready') {
          order.actualReadyTime = new Date();
        } else if (newStatus === 'picked_up') {
          order.pickedUpAt = new Date();
        } else if (newStatus === 'completed') {
          order.completedAt = new Date();
        } else if (newStatus === 'cancelled') {
          order.cancelledAt = new Date();
          order.cancelledBy = 'admin';
        }

        await order.save({ session: mongoSession });

        // Record status change in history
        await OrderStatusHistory.create(
          [
            {
              orderId: order._id,
              status: newStatus,
              notes: `Status changed from ${oldStatus} to ${newStatus} by admin`,
              changedBy: 'admin',
            },
          ],
          { session: mongoSession }
        );

        updatedOrderId = String(order._id);
      });
    } finally {
      await mongoSession.endSession();
    }

    if (!updatedOrderId) {
      throw new AppError('Unable to update order status', 500);
    }

    // TODO: Send notification to user about status change
    // This would be implemented when notification service is ready
    return this.loadOrderResponse(updatedOrderId);
  }

  /**
   * Assign order to a driver (Admin only)
   */
  async assignDriver(orderId: string, driverId: string): Promise<IOrder> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError('Invalid order ID', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      throw new AppError('Invalid driver ID', 400);
    }

    const mongoSession = await mongoose.startSession();
    let updatedOrderId: string | null = null;

    try {
      await mongoSession.withTransaction(async () => {
        const order = await Order.findById(orderId).session(mongoSession);

        if (!order) {
          throw new AppError('Order not found', 404);
        }

        // Validate order status - can only assign driver to confirmed or preparing orders
        if (!['confirmed', 'preparing', 'ready'].includes(order.status)) {
          throw new AppError(
            `Cannot assign driver to order with status ${order.status}`,
            400
          );
        }

        order.assignedDriverId = new mongoose.Types.ObjectId(driverId);
        await order.save({ session: mongoSession });

        // Record in status history
        await OrderStatusHistory.create(
          [
            {
              orderId: order._id,
              status: order.status,
              notes: `Driver ${driverId} assigned to order`,
              changedBy: 'admin',
            },
          ],
          { session: mongoSession }
        );

        updatedOrderId = String(order._id);
      });
    } finally {
      await mongoSession.endSession();
    }

    if (!updatedOrderId) {
      throw new AppError('Unable to assign driver', 500);
    }

    // TODO: Send notification to driver about assignment
    // This would be implemented when notification service is ready
    return this.loadOrderResponse(updatedOrderId);
  }

  /**
   * Validate order status transition
   */
  private isValidStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      received: ['confirmed', 'cancelled'],
      pending_payment: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'ready', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['picked_up', 'cancelled'],
      picked_up: ['completed'],
      completed: [],
      cancelled: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
