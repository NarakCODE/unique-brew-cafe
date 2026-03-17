export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  topProducts: {
    _id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }[];
  topProductsAmount: number;
}

export interface DashboardStatsResponse {
  statusCode: number;
  data: DashboardStats;
  message: string;
  success: boolean;
}

export interface SalesReportItem {
  _id: string;
  revenue: number;
  orders: number;
}

export interface SalesReportResponse {
  statusCode: number;
  data: SalesReportItem[];
  message: string;
  success: boolean;
}

export interface ProductPerformanceItem {
  _id: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface ProductPerformanceResponse {
  statusCode: number;
  data: ProductPerformanceItem[];
  message: string;
  success: boolean;
}

export interface OrdersReportItem {
  _id: string; // OrderStatus
  count: number;
}

export interface OrdersReportResponse {
  statusCode: number;
  data: OrdersReportItem[];
  message: string;
  success: boolean;
}
