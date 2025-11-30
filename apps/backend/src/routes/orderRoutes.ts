import express, { Router } from 'express';
import {
  getOrders,
  getOrderById,
  getOrderTracking,
  getOrderInvoice,
  cancelOrder,
  rateOrder,
  reorder,
  getOrderReceipt,
  addInternalNotes,
  updateOrderStatus,
  assignDriver,
} from '../controllers/orderController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  getOrdersQuerySchema,
  orderParamSchema,
  cancelOrderSchema,
  rateOrderSchema,
  addOrderNotesSchema,
  updateOrderStatusSchema,
  assignDriverSchema,
} from '../schemas/index.js';

const router: Router = express.Router();

// All order routes require authentication
router.use(authenticate);

// User order routes
router.get('/', validate(getOrdersQuerySchema), getOrders);
router.get('/:orderId', validate(orderParamSchema), getOrderById);
router.get('/:orderId/tracking', validate(orderParamSchema), getOrderTracking);
router.get('/:orderId/invoice', validate(orderParamSchema), getOrderInvoice);
router.post('/:orderId/cancel', validate(cancelOrderSchema), cancelOrder);
router.post('/:orderId/rate', validate(rateOrderSchema), rateOrder);
router.post('/:orderId/reorder', validate(orderParamSchema), reorder);

// Admin-only order routes
router.get(
  '/:orderId/receipt',
  authorize({ roles: ['admin'] }),
  validate(orderParamSchema),
  getOrderReceipt
);
router.post(
  '/:orderId/notes',
  authorize({ roles: ['admin'] }),
  validate(addOrderNotesSchema),
  addInternalNotes
);
router.patch(
  '/:orderId/status',
  authorize({ roles: ['admin'] }),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);
router.patch(
  '/:orderId/assign',
  authorize({ roles: ['admin'] }),
  validate(assignDriverSchema),
  assignDriver
);

export default router;
