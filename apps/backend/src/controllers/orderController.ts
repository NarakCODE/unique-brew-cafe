import type { Request, Response } from 'express';
import { OrderService } from '../services/orderService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { ApiResponse } from '../types/index.js';
import type { IOrder, OrderStatus } from '../models/Order.js';

const orderService = new OrderService();

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

    const response: ApiResponse = {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Orders retrieved successfully',
    };

    res.status(200).json(response);
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

    const response: ApiResponse<IOrder> = {
      success: true,
      data: order,
      message: 'Order retrieved successfully',
    };

    res.status(200).json(response);
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

    const response: ApiResponse = {
      success: true,
      data: tracking,
      message: 'Order tracking retrieved successfully',
    };

    res.status(200).json(response);
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
      res.status(400).json({
        success: false,
        error: 'Cancellation reason is required',
      });
      return;
    }

    const order = await orderService.cancelOrder(orderId, userId, reason);

    const response: ApiResponse<IOrder> = {
      success: true,
      data: order,
      message: 'Order cancelled successfully',
    };

    res.status(200).json(response);
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
      res.status(400).json({
        success: false,
        error: 'Rating is required and must be a number',
      });
      return;
    }

    await orderService.rateOrder(orderId, userId, rating, review);

    const response: ApiResponse = {
      success: true,
      message: 'Order rated successfully',
    };

    res.status(200).json(response);
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

    const response: ApiResponse = {
      success: true,
      message: 'Items added to cart successfully',
    };

    res.status(200).json(response);
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
      res.status(400).json({
        success: false,
        error: 'Notes are required',
      });
      return;
    }

    const order = await orderService.addInternalNotes(orderId, notes);

    const response: ApiResponse<IOrder> = {
      success: true,
      data: order,
      message: 'Internal notes added successfully',
    };

    res.status(200).json(response);
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
      res.status(400).json({
        success: false,
        error: 'Status is required',
      });
      return;
    }

    const order = await orderService.updateOrderStatus(
      orderId,
      status as OrderStatus
    );

    const response: ApiResponse<IOrder> = {
      success: true,
      data: order,
      message: 'Order status updated successfully',
    };

    res.status(200).json(response);
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
      res.status(400).json({
        success: false,
        error: 'Driver ID is required',
      });
      return;
    }

    const order = await orderService.assignDriver(orderId, driverId);

    const response: ApiResponse<IOrder> = {
      success: true,
      data: order,
      message: 'Driver assigned successfully',
    };

    res.status(200).json(response);
  }
);
