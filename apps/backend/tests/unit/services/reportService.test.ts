import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reportService } from '../../../src/services/reportService.js';
import { Order } from '../../../src/models/Order.js';
import { User } from '../../../src/models/User.js';

// Mock dependencies
vi.mock('../../../src/models/Order.js');
vi.mock('../../../src/models/User.js');

describe('ReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats with default filters', async () => {
      vi.mocked(Order.aggregate).mockResolvedValueOnce([{ total: 5000 }]); // revenue
      vi.mocked(Order.countDocuments).mockResolvedValue(50);
      vi.mocked(User.countDocuments).mockResolvedValue(100);
      vi.mocked(Order.aggregate).mockResolvedValueOnce([
        { _id: 'prod1', name: 'Latte', totalSold: 100, revenue: 450 },
        { _id: 'prod2', name: 'Cappuccino', totalSold: 80, revenue: 400 },
      ]);

      const result = await reportService.getDashboardStats();

      expect(result.totalRevenue).toBe(5000);
      expect(result.totalOrders).toBe(50);
      expect(result.activeUsers).toBe(100);
      // topProducts is the total revenue from top 5 products (450 + 400 = 850)
      expect(result.topProducts).toBe(850);
    });

    it('should return zero revenue when no orders exist', async () => {
      vi.mocked(Order.aggregate).mockResolvedValueOnce([]); // empty revenue
      vi.mocked(Order.countDocuments).mockResolvedValue(0);
      vi.mocked(User.countDocuments).mockResolvedValue(10);
      vi.mocked(Order.aggregate).mockResolvedValueOnce([]); // no top products

      const result = await reportService.getDashboardStats();

      expect(result.totalRevenue).toBe(0);
      expect(result.totalOrders).toBe(0);
      // topProducts is 0 when there are no products
      expect(result.topProducts).toBe(0);
    });

    it('should filter by date range when provided', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      vi.mocked(Order.aggregate).mockResolvedValue([{ total: 1000 }]);
      vi.mocked(Order.countDocuments).mockResolvedValue(10);
      vi.mocked(User.countDocuments).mockResolvedValue(50);

      await reportService.getDashboardStats({ startDate, endDate });

      expect(Order.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              createdAt: { $gte: startDate, $lte: endDate },
            }),
          }),
        ])
      );
    });

    it('should filter by startDate only', async () => {
      const startDate = new Date('2025-01-01');

      vi.mocked(Order.aggregate).mockResolvedValue([]);
      vi.mocked(Order.countDocuments).mockResolvedValue(0);
      vi.mocked(User.countDocuments).mockResolvedValue(0);

      await reportService.getDashboardStats({ startDate });

      expect(Order.aggregate).toHaveBeenCalled();
    });

    it('should filter by endDate only', async () => {
      const endDate = new Date('2025-01-31');

      vi.mocked(Order.aggregate).mockResolvedValue([]);
      vi.mocked(Order.countDocuments).mockResolvedValue(0);
      vi.mocked(User.countDocuments).mockResolvedValue(0);

      await reportService.getDashboardStats({ endDate });

      expect(Order.aggregate).toHaveBeenCalled();
    });
  });

  describe('getSalesReport', () => {
    it('should return sales grouped by day', async () => {
      const mockSales = [
        { _id: '2025-01-01', revenue: 500, orders: 10 },
        { _id: '2025-01-02', revenue: 750, orders: 15 },
      ];

      vi.mocked(Order.aggregate).mockResolvedValue(mockSales);

      const result = await reportService.getSalesReport({}, 'day');

      expect(result).toEqual(mockSales);
      expect(Order.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $group: expect.objectContaining({
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
            }),
          }),
        ])
      );
    });

    it('should return sales grouped by month', async () => {
      const mockSales = [
        { _id: '2025-01', revenue: 5000, orders: 100 },
        { _id: '2025-02', revenue: 6000, orders: 120 },
      ];

      vi.mocked(Order.aggregate).mockResolvedValue(mockSales);

      const result = await reportService.getSalesReport({}, 'month');

      expect(result).toEqual(mockSales);
      expect(Order.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $group: expect.objectContaining({
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            }),
          }),
        ])
      );
    });

    it('should filter sales by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      vi.mocked(Order.aggregate).mockResolvedValue([]);

      await reportService.getSalesReport({ startDate, endDate });

      expect(Order.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              createdAt: { $gte: startDate, $lte: endDate },
            }),
          }),
        ])
      );
    });

    it('should return empty array when no sales', async () => {
      vi.mocked(Order.aggregate).mockResolvedValue([]);

      const result = await reportService.getSalesReport();

      expect(result).toEqual([]);
    });
  });

  describe('getOrdersReport', () => {
    it('should return order status distribution', async () => {
      const mockDistribution = [
        { _id: 'completed', count: 50 },
        { _id: 'pending', count: 10 },
        { _id: 'cancelled', count: 5 },
      ];

      vi.mocked(Order.aggregate).mockResolvedValue(mockDistribution);

      const result = await reportService.getOrdersReport();

      expect(result).toEqual(mockDistribution);
      expect(Order.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $group: { _id: '$status', count: { $sum: 1 } },
          }),
        ])
      );
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      vi.mocked(Order.aggregate).mockResolvedValue([]);

      await reportService.getOrdersReport({ startDate, endDate });

      expect(Order.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              createdAt: { $gte: startDate, $lte: endDate },
            }),
          }),
        ])
      );
    });

    it('should return empty array when no orders', async () => {
      vi.mocked(Order.aggregate).mockResolvedValue([]);

      const result = await reportService.getOrdersReport();

      expect(result).toEqual([]);
    });
  });

  describe('getProductPerformance', () => {
    it('should return product performance data', async () => {
      const mockProducts = [
        { _id: 'prod1', name: 'Latte', quantitySold: 100, revenue: 450 },
        { _id: 'prod2', name: 'Cappuccino', quantitySold: 80, revenue: 400 },
        { _id: 'prod3', name: 'Espresso', quantitySold: 60, revenue: 180 },
      ];

      vi.mocked(Order.aggregate).mockResolvedValue(mockProducts);

      const result = await reportService.getProductPerformance();

      expect(result).toEqual(mockProducts);
      expect(result[0].revenue).toBeGreaterThan(result[1].revenue);
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      vi.mocked(Order.aggregate).mockResolvedValue([]);

      await reportService.getProductPerformance({ startDate, endDate });

      expect(Order.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              createdAt: { $gte: startDate, $lte: endDate },
            }),
          }),
        ])
      );
    });

    it('should return empty array when no products sold', async () => {
      vi.mocked(Order.aggregate).mockResolvedValue([]);

      const result = await reportService.getProductPerformance();

      expect(result).toEqual([]);
    });

    it('should only include completed/delivered orders', async () => {
      vi.mocked(Order.aggregate).mockResolvedValue([]);

      await reportService.getProductPerformance();

      expect(Order.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              status: { $in: ['completed', 'delivered'] },
            }),
          }),
        ])
      );
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should return revenue by store', async () => {
      const mockRevenue = [
        { _id: 'store1', revenue: 5000, orders: 100 },
        { _id: 'store2', revenue: 3000, orders: 60 },
      ];

      vi.mocked(Order.aggregate).mockResolvedValue(mockRevenue);

      const result = await reportService.getRevenueAnalytics();

      expect(result).toEqual(mockRevenue);
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      vi.mocked(Order.aggregate).mockResolvedValue([]);

      await reportService.getRevenueAnalytics({ startDate, endDate });

      expect(Order.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              createdAt: { $gte: startDate, $lte: endDate },
            }),
          }),
        ])
      );
    });

    it('should return empty array when no revenue data', async () => {
      vi.mocked(Order.aggregate).mockResolvedValue([]);

      const result = await reportService.getRevenueAnalytics();

      expect(result).toEqual([]);
    });

    it('should only include completed/delivered orders', async () => {
      vi.mocked(Order.aggregate).mockResolvedValue([]);

      await reportService.getRevenueAnalytics();

      expect(Order.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              status: { $in: ['completed', 'delivered'] },
            }),
          }),
        ])
      );
    });
  });

  describe('exportReport', () => {
    it('should export sales report as CSV', async () => {
      const mockSales = [
        { _id: '2025-01-01', revenue: 500, orders: 10 },
        { _id: '2025-01-02', revenue: 750, orders: 15 },
      ];

      vi.mocked(Order.aggregate).mockResolvedValue(mockSales);

      const result = await reportService.exportReport('sales');

      expect(result).toContain('Date,Revenue,Orders');
      expect(result).toContain('2025-01-01,500,10');
      expect(result).toContain('2025-01-02,750,15');
    });

    it('should export products report as CSV', async () => {
      const mockProducts = [
        { _id: 'prod1', name: 'Latte', quantitySold: 100, revenue: 450 },
        { _id: 'prod2', name: 'Cappuccino', quantitySold: 80, revenue: 400 },
      ];

      vi.mocked(Order.aggregate).mockResolvedValue(mockProducts);

      const result = await reportService.exportReport('products');

      expect(result).toContain('Product Name,Quantity Sold,Revenue');
      expect(result).toContain('Latte,100,450');
      expect(result).toContain('Cappuccino,80,400');
    });

    it('should throw error for invalid report type', async () => {
      await expect(reportService.exportReport('invalid')).rejects.toThrow(
        'Invalid report type'
      );
    });

    it('should filter export by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      vi.mocked(Order.aggregate).mockResolvedValue([]);

      await reportService.exportReport('sales', { startDate, endDate });

      expect(Order.aggregate).toHaveBeenCalled();
    });

    it('should return CSV with only headers when no data', async () => {
      vi.mocked(Order.aggregate).mockResolvedValue([]);

      const result = await reportService.exportReport('sales');

      expect(result).toBe('Date,Revenue,Orders');
    });
  });
});
