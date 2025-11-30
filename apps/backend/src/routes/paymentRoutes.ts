import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  mockPaymentComplete,
} from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  paymentOrderParamSchema,
  confirmPaymentSchema,
} from '../schemas/index.js';

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

// POST /payments/:orderId/intent - Create payment intent
router.post(
  '/:orderId/intent',
  validate(paymentOrderParamSchema),
  createPaymentIntent
);

// POST /payments/:orderId/confirm - Confirm payment
router.post(
  '/:orderId/confirm',
  validate(confirmPaymentSchema),
  confirmPayment
);

// POST /payments/mock/:orderId/complete - Mock payment completion (development only)
router.post(
  '/mock/:orderId/complete',
  validate(paymentOrderParamSchema),
  mockPaymentComplete
);

export default router;
