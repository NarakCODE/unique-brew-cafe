import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export const reportService = {
  /**
   * Get dashboard key metrics
   */
  async getDashboardStats(filters: DateRangeFilter = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      status: { $in: ['completed', 'delivered'] }, // Only count completed sales
    };

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    // Total Revenue
    const revenueResult = await Order.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Total Orders
    const totalOrders = await Order.countDocuments(query);

    // Active Users
    const activeUsers = await User.countDocuments({ status: 'active' });

    // Top Selling Products (Limit 5) - Get total revenue from top 5 products
    const topProductsData = await Order.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'orderitems',
          localField: '_id',
          foreignField: 'orderId',
          as: 'items',
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.productName' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalPrice' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    const topProductsAmount = topProductsData.reduce(
      (sum, product) => sum + product.revenue,
      0
    );

    return {
      totalRevenue,
      totalOrders,
      activeUsers,
      topProducts: topProductsAmount,
    };
  },

  /**
   * Get sales report (revenue over time)
   */
  async getSalesReport(
    filters: DateRangeFilter = {},
    groupBy: 'day' | 'month' = 'day'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      status: { $in: ['completed', 'delivered'] },
    };

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const dateFormat = groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m';

    const sales = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sales;
  },

  /**
   * Get orders report (status distribution)
   */
  async getOrdersReport(filters: DateRangeFilter = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const statusDistribution = await Order.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return statusDistribution;
  },

  /**
   * Get product performance report
   */
  async getProductPerformance(filters: DateRangeFilter = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      status: { $in: ['completed', 'delivered'] },
    };

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const products = await Order.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'orderitems',
          localField: '_id',
          foreignField: 'orderId',
          as: 'items',
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.productName' },
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalPrice' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    return products;
  },

  /**
   * Get revenue analytics (by store)
   */
  async getRevenueAnalytics(filters: DateRangeFilter = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      status: { $in: ['completed', 'delivered'] },
    };

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const revenueByStore = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$storeId',
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      // Lookup store details if needed, for now returning ID
    ]);

    return revenueByStore;
  },

  /**
   * Export report to CSV
   */
  async exportReport(
    type: string,
    filters: DateRangeFilter = {}
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any[] = [];
    let headers: string[] = [];

    switch (type) {
      case 'sales':
        data = await this.getSalesReport(filters, 'day');
        headers = ['Date', 'Revenue', 'Orders'];
        data = data.map((row) => [row._id, row.revenue, row.orders]);
        break;
      case 'products':
        data = await this.getProductPerformance(filters);
        headers = ['Product Name', 'Quantity Sold', 'Revenue'];
        data = data.map((row) => [row.name, row.quantitySold, row.revenue]);
        break;
      case 'orders':
        data = await this.getOrdersReport(filters);
        headers = ['Status', 'Count'];
        data = data.map((row) => [row._id, row.count]);
        break;
      default:
        throw new Error('Invalid report type');
    }

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...data.map((row) => row.join(',')),
    ].join('\n');

    return csvContent;
  },
};
