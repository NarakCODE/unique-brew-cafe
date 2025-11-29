import type { Request, Response } from 'express';
import { reportService } from '../services/reportService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';

interface ReportDateFilters {
  startDate?: Date;
  endDate?: Date;
}

const parseDateFilters = (
  startDate?: string,
  endDate?: string
): ReportDateFilters => {
  const filters: ReportDateFilters = {};
  if (startDate) filters.startDate = new Date(startDate);
  if (endDate) filters.endDate = new Date(endDate);
  return filters;
};

/**
 * Get dashboard stats
 * GET /reports/dashboard
 */
export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const filters = parseDateFilters(
      startDate as string | undefined,
      endDate as string | undefined
    );

    const stats = await reportService.getDashboardStats(filters);

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);

/**
 * Get sales report
 * GET /reports/sales
 */
export const getSalesReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate, groupBy } = req.query;
    const filters = parseDateFilters(
      startDate as string | undefined,
      endDate as string | undefined
    );

    const report = await reportService.getSalesReport(
      filters,
      (groupBy as 'day' | 'month') || 'day'
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  }
);

/**
 * Get orders report
 * GET /reports/orders
 */
export const getOrdersReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const filters = parseDateFilters(
      startDate as string | undefined,
      endDate as string | undefined
    );

    const report = await reportService.getOrdersReport(filters);

    res.status(200).json({
      success: true,
      data: report,
    });
  }
);

/**
 * Get product performance report
 * GET /reports/products
 */
export const getProductPerformance = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const filters = parseDateFilters(
      startDate as string | undefined,
      endDate as string | undefined
    );

    const report = await reportService.getProductPerformance(filters);

    res.status(200).json({
      success: true,
      data: report,
    });
  }
);

/**
 * Get revenue analytics
 * GET /reports/revenue
 */
export const getRevenueAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const filters = parseDateFilters(
      startDate as string | undefined,
      endDate as string | undefined
    );

    const report = await reportService.getRevenueAnalytics(filters);

    res.status(200).json({
      success: true,
      data: report,
    });
  }
);

/**
 * Export report
 * GET /reports/export
 */
export const exportReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, startDate, endDate, format } = req.query;

    if (!type) {
      throw new BadRequestError('Report type is required');
    }

    if (format && format !== 'csv') {
      throw new BadRequestError('Only CSV format is currently supported');
    }

    const filters = parseDateFilters(
      startDate as string | undefined,
      endDate as string | undefined
    );

    const csvData = await reportService.exportReport(type as string, filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=report-${type}-${new Date().toISOString()}.csv`
    );
    res.status(200).send(csvData);
  }
);
