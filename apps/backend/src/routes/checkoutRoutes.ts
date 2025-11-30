import express from 'express';
import {
  validateCheckout,
  createCheckoutSession,
  getCheckoutSession,
  getPaymentMethods,
  applyCoupon,
  removeCoupon,
  getDeliveryCharges,
  confirmCheckout,
} from '../controllers/checkoutController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  applyCouponSchema,
  checkoutParamSchema,
  deliveryChargesSchema,
  confirmCheckoutSchema,
} from '../schemas/index.js';

const router = express.Router();

// All checkout routes require authentication
router.use(authenticate);

// POST /checkout/validate - Validate cart before checkout
router.post('/validate', validateCheckout);

// POST /checkout - Create checkout session
router.post('/', createCheckoutSession);

// GET /checkout/:checkoutId - Get checkout session details
router.get('/:checkoutId', validate(checkoutParamSchema), getCheckoutSession);

// GET /checkout/payment-methods - Get available payment methods
router.get('/payment-methods', getPaymentMethods);

// POST /checkout/:checkoutId/apply-coupon - Apply coupon to checkout
router.post(
  '/:checkoutId/apply-coupon',
  validate(applyCouponSchema),
  applyCoupon
);

// DELETE /checkout/:checkoutId/remove-coupon - Remove coupon from checkout
router.delete(
  '/:checkoutId/remove-coupon',
  validate(checkoutParamSchema),
  removeCoupon
);

// GET /checkout/delivery-charges - Calculate delivery charges
router.get(
  '/delivery-charges',
  validate(deliveryChargesSchema),
  getDeliveryCharges
);

// POST /checkout/:checkoutId/confirm - Confirm checkout and create order
router.post(
  '/:checkoutId/confirm',
  validate(confirmCheckoutSchema),
  confirmCheckout
);

export default router;
