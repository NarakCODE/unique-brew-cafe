import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

// Mock the entire module with inline mock implementation
vi.mock('../../../src/services/orderService.js', () => {
  const mockService = {
    getOrders: vi.fn(),
    getOrderById: vi.fn(),
    getOrderTracking: vi.fn(),
    generateInvoice: vi.fn(),
    cancelOrder: vi.fn(),
    rateOrder: vi.fn(),
    reorder: vi.fn(),
    generateReceipt: vi.fn(),
    addInternalNotes: vi.fn(),
    updateOrderStatus: vi.fn(),
    assignDriver: vi.fn(),
  };
  return {
    OrderService: vi.fn().mockImplementation(() => mockService),
    __mockService: mockService,
  };
});

// Import after mocking
import * as orderController from '../../../src/controllers/orderController.js';
import { OrderService } from '../../../src/services/orderService.js';

describe('OrderController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: ReturnType<typeof vi.fn>;
  let status: ReturnType<typeof vi.fn>;
  let send: ReturnType<typeof vi.fn>;
  let setHeader: ReturnType<typeof vi.fn>;
  let next: ReturnType<typeof vi.fn>;
  let mockService: any;

  beforeEach(() => {
    json = vi.fn();
    send = vi.fn();
    setHeader = vi.fn();
    status = vi.fn().mockReturnValue({ json });
    req = {
      query: {},
      params: {},
      body: {},
      userId: 'user-123',
      userRole: 'user',
    };
    res = { status, json, send, setHeader };
    next = vi.fn();

    // Get the mock service instance
    mockService = new OrderService();
    vi.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should return orders with pagination', async () => {
      const mockResult = {
        data: [{ id: 'order-1', status: 'pending' }],
        pagination: { page: 1, limit: 10, total: 1 },
      };
      mockService.getOrders.mockResolvedValue(mockResult);

      await orderController.getOrders(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        pagination: mockResult.pagination,
        message: 'Orders retrieved successfully',
      });
    });

    it('should apply status filter', async () => {
      req.query = { status: 'completed' };
      mockService.getOrders.mockResolvedValue({ data: [], pagination: {} });

      await orderController.getOrders(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(200);
    });
  });

  describe('getOrderById', () => {
    it('should return order by ID', async () => {
      req.params = { orderId: 'order-123' };
      const mockOrder = { id: 'order-123', status: 'pending' };
      mockService.getOrderById.mockResolvedValue(mockOrder);

      await orderController.getOrderById(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(200);
    });
  });

  describe('getOrderTracking', () => {
    it('should return order tracking', async () => {
      req.params = { orderId: 'order-123' };
      const mockTracking = { status: 'preparing', estimatedTime: 15 };
      mockService.getOrderTracking.mockResolvedValue(mockTracking);

      await orderController.getOrderTracking(
        req as Request,
        res as Response,
        next
      );

      expect(status).toHaveBeenCalledWith(200);
    });
  });

  describe('getOrderInvoice', () => {
    it('should return PDF invoice', async () => {
      req.params = { orderId: 'order-123' };
      const mockPdfBuffer = Buffer.from('PDF content');
      mockService.generateInvoice.mockResolvedValue(mockPdfBuffer);

      await orderController.getOrderInvoice(
        req as Request,
        res as Response,
        next
      );

      expect(setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(send).toHaveBeenCalledWith(mockPdfBuffer);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order with reason', async () => {
      req.params = { orderId: 'order-123' };
      req.body = { reason: 'Changed my mind' };
      const mockOrder = { id: 'order-123', status: 'cancelled' };
      mockService.cancelOrder.mockResolvedValue(mockOrder);

      await orderController.cancelOrder(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when reason is missing', async () => {
      req.params = { orderId: 'order-123' };
      req.body = {};

      await orderController.cancelOrder(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        success: false,
        error: 'Cancellation reason is required',
      });
    });

    it('should return 400 when reason is empty string', async () => {
      req.params = { orderId: 'order-123' };
      req.body = { reason: '   ' };

      await orderController.cancelOrder(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(400);
    });
  });

  describe('rateOrder', () => {
    it('should rate order', async () => {
      req.params = { orderId: 'order-123' };
      req.body = { rating: 5, review: 'Great service!' };
      mockService.rateOrder.mockResolvedValue(undefined);

      await orderController.rateOrder(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when rating is missing', async () => {
      req.params = { orderId: 'order-123' };
      req.body = { review: 'Great!' };

      await orderController.rateOrder(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(400);
    });
  });

  describe('reorder', () => {
    it('should add order items to cart', async () => {
      req.params = { orderId: 'order-123' };
      mockService.reorder.mockResolvedValue(undefined);

      await orderController.reorder(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(200);
    });
  });

  describe('getOrderReceipt', () => {
    it('should return PDF receipt', async () => {
      req.params = { orderId: 'order-123' };
      const mockPdfBuffer = Buffer.from('Receipt PDF');
      mockService.generateReceipt.mockResolvedValue(mockPdfBuffer);

      await orderController.getOrderReceipt(
        req as Request,
        res as Response,
        next
      );

      expect(setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(send).toHaveBeenCalledWith(mockPdfBuffer);
    });
  });

  describe('addInternalNotes', () => {
    it('should add internal notes', async () => {
      req.params = { orderId: 'order-123' };
      req.body = { notes: 'Customer requested extra napkins' };
      const mockOrder = {
        id: 'order-123',
        internalNotes: 'Customer requested extra napkins',
      };
      mockService.addInternalNotes.mockResolvedValue(mockOrder);

      await orderController.addInternalNotes(
        req as Request,
        res as Response,
        next
      );

      expect(status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when notes are missing', async () => {
      req.params = { orderId: 'order-123' };
      req.body = {};

      await orderController.addInternalNotes(
        req as Request,
        res as Response,
        next
      );

      expect(status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      req.params = { orderId: 'order-123' };
      req.body = { status: 'preparing' };
      const mockOrder = { id: 'order-123', status: 'preparing' };
      mockService.updateOrderStatus.mockResolvedValue(mockOrder);

      await orderController.updateOrderStatus(
        req as Request,
        res as Response,
        next
      );

      expect(status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when status is missing', async () => {
      req.params = { orderId: 'order-123' };
      req.body = {};

      await orderController.updateOrderStatus(
        req as Request,
        res as Response,
        next
      );

      expect(status).toHaveBeenCalledWith(400);
    });
  });

  describe('assignDriver', () => {
    it('should assign driver to order', async () => {
      req.params = { orderId: 'order-123' };
      req.body = { driverId: 'driver-456' };
      const mockOrder = { id: 'order-123', driverId: 'driver-456' };
      mockService.assignDriver.mockResolvedValue(mockOrder);

      await orderController.assignDriver(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when driverId is missing', async () => {
      req.params = { orderId: 'order-123' };
      req.body = {};

      await orderController.assignDriver(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(400);
    });
  });
});
