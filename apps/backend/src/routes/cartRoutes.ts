import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as cartController from '../controllers/cartController.js';
import {
  addCartItemSchema,
  updateCartItemSchema,
  removeCartItemSchema,
  setDeliveryAddressSchema,
  setCartNotesSchema,
} from '../schemas/index.js';

const router: Router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Get cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/items', validate(addCartItemSchema), cartController.addItem);

// Update cart item quantity
router.patch(
  '/items/:itemId',
  validate(updateCartItemSchema),
  cartController.updateItemQuantity
);

// Remove item from cart
router.delete(
  '/items/:itemId',
  validate(removeCartItemSchema),
  cartController.removeItem
);

// Clear cart
router.delete('/', cartController.clearCart);

// Validate cart
router.post('/validate', cartController.validateCart);

// Set delivery address
router.patch(
  '/address',
  validate(setDeliveryAddressSchema),
  cartController.setDeliveryAddress
);

// Set cart notes
router.patch('/notes', validate(setCartNotesSchema), cartController.setNotes);

// Get cart summary
router.get('/summary', cartController.getCartSummary);

export default router;
