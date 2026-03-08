import type { Request, Response } from 'express';
import { OrderService } from '../services/orderService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import type { OrderStatus } from '../models/Order.js';

const orderService = new OrderService();

/**
 * @route   POST /orders
 * @desc    Create an order directly from mobile checkout
 * @access  Private
 */
export const createOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const { storeId, items, pickupTime, notes, paymentMethod } = req.body;

    const order = await orderService.createOrder(userId, {
      storeId,
      items,
      pickupTime,
      notes,
      paymentMethod,
    });

    res
      .status(201)
      .json(new ApiResponse(201, order, 'Order created successfully'));
  }
);

/**
 * @route   GET /orders
 * @desc    Get user's orders (or all orders for admin) with pagination
 * @access  Private
 */
export const getOrders = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const role = req.userRole!;

    // Parse filters from query params
    const filters: {
      status?: OrderStatus;
      storeId?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (req.query.status) {
      filters.status = req.query.status as OrderStatus;
    }
    if (req.query.storeId) {
      filters.storeId = req.query.storeId as string;
    }
    if (req.query.userId) {
      filters.userId = req.query.userId as string;
    }
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }

    // Parse pagination params
    const paginationParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await orderService.getOrders(
      userId,
      role,
      filters,
      paginationParams
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { items: result.data, pagination: result.pagination },
          'Orders retrieved successfully'
        )
      );
  }
);

/**
 * @route   GET /orders/:orderId
 * @desc    Get order details by ID
 * @access  Private
 */
export const getOrderById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId!;
    const userId = req.userId!;
    const role = req.userRole!;

    const order = await orderService.getOrderById(orderId, userId, role);

    res
      .status(200)
      .json(new ApiResponse(200, order, 'Order retrieved successfully'));
  }
);

/**
 * @route   GET /orders/:orderId/tracking
 * @desc    Get order tracking information
 * @access  Private
 */
export const getOrderTracking = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId!;
    const userId = req.userId!;

    const tracking = await orderService.getOrderTracking(orderId, userId);

    res
      .status(200)
      .json(
        new ApiResponse(200, tracking, 'Order tracking retrieved successfully')
      );
  }
);

/**
 * @route   GET /orders/:orderId/invoice
 * @desc    Generate and download PDF invoice
 * @access  Private
 */
export const getOrderInvoice = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId!;
    const userId = req.userId!;
    const role = req.userRole!;

    const pdfBuffer = await orderService.generateInvoice(orderId, userId, role);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${orderId}.pdf`
    );
    res.send(pdfBuffer);
  }
);

/**
 * @route   POST /orders/:orderId/cancel
 * @desc    Cancel an order within 5 minutes
 * @access  Private
 */
export const cancelOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId!;
    const userId = req.userId!;
    const { reason } = req.body;

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      res
        .status(400)
        .json(new ApiResponse(400, null, 'Cancellation reason is required'));
      return;
    }

    const order = await orderService.cancelOrder(orderId, userId, reason);

    res
      .status(200)
      .json(new ApiResponse(200, order, 'Order cancelled successfully'));
  }
);

/**
 * @route   POST /orders/:orderId/rate
 * @desc    Rate an order after delivery
 * @access  Private
 */
export const rateOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId!;
    const userId = req.userId!;
    const { rating, review } = req.body;

    if (!rating || typeof rating !== 'number') {
      res
        .status(400)
        .json(
          new ApiResponse(400, null, 'Rating is required and must be a number')
        );
      return;
    }

    await orderService.rateOrder(orderId, userId, rating, review);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Order rated successfully'));
  }
);

/**
 * @route   POST /orders/:orderId/reorder
 * @desc    Add all items from an order to cart
 * @access  Private
 */
export const reorder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId!;
    const userId = req.userId!;

    await orderService.reorder(orderId, userId);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Items added to cart successfully'));
  }
);

/**
 * @route   GET /orders/:orderId/receipt
 * @desc    Generate and download PDF receipt (Admin only)
 * @access  Private (Admin)
 */
export const getOrderReceipt = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId!;

    const pdfBuffer = await orderService.generateReceipt(orderId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=receipt-${orderId}.pdf`
    );
    res.send(pdfBuffer);
  }
);

/**
 * @route   POST /orders/:orderId/notes
 * @desc    Add internal notes to an order (Admin only)
 * @access  Private (Admin)
 */
export const addInternalNotes = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId!;
    const { notes } = req.body;

    if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
      res.status(400).json(new ApiResponse(400, null, 'Notes are required'));
      return;
    }

    const order = await orderService.addInternalNotes(orderId, notes);

    res
      .status(200)
      .json(new ApiResponse(200, order, 'Internal notes added successfully'));
  }
);

/**
 * @route   PATCH /orders/:orderId/status
 * @desc    Update order status (Admin only)
 * @access  Private (Admin)
 */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId!;
    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      res.status(400).json(new ApiResponse(400, null, 'Status is required'));
      return;
    }

    const order = await orderService.updateOrderStatus(
      orderId,
      status as OrderStatus
    );

    res
      .status(200)
      .json(new ApiResponse(200, order, 'Order status updated successfully'));
  }
);

/**
 * @route   PATCH /orders/:orderId/assign
 * @desc    Assign order to a driver (Admin only)
 * @access  Private (Admin)
 */
export const assignDriver = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId!;
    const { driverId } = req.body;

    if (!driverId || typeof driverId !== 'string') {
      res.status(400).json(new ApiResponse(400, null, 'Driver ID is required'));
      return;
    }

    const order = await orderService.assignDriver(orderId, driverId);

    res
      .status(200)
      .json(new ApiResponse(200, order, 'Driver assigned successfully'));
  }
);
