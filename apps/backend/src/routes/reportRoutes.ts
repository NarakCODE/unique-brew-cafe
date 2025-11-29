import { Router } from 'express';
import {
  getDashboardStats,
  getSalesReport,
  getOrdersReport,
  getProductPerformance,
  getRevenueAnalytics,
  exportReport,
} from '../controllers/reportController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

// All report routes require admin access
router.use(authenticate, authorize({ roles: ['admin'] }));

router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesReport);
router.get('/orders', getOrdersReport);
router.get('/products', getProductPerformance);
router.get('/revenue', getRevenueAnalytics);
router.get('/export', exportReport);

export default router;
