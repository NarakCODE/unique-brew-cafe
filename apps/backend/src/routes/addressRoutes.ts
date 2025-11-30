import express from 'express';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createAddressSchema,
  updateAddressSchema,
  addressParamSchema,
} from '../schemas/index.js';

const router = express.Router();

/**
 * AUTHENTICATED: Get all addresses for user
 * Requirements: 20.1
 * GET /api/users/me/addresses
 */
router.get('/', authenticate, getAddresses);

/**
 * AUTHENTICATED: Add a new address
 * Requirements: 20.2, 20.6
 * POST /api/users/me/addresses
 */
router.post('/', authenticate, validate(createAddressSchema), addAddress);

/**
 * AUTHENTICATED: Update an existing address
 * Requirements: 20.3, 20.6
 * PATCH /api/users/me/addresses/:addressId
 */
router.patch(
  '/:addressId',
  authenticate,
  validate(updateAddressSchema),
  updateAddress
);

/**
 * AUTHENTICATED: Delete an address
 * Requirements: 20.4
 * DELETE /api/users/me/addresses/:addressId
 */
router.delete(
  '/:addressId',
  authenticate,
  validate(addressParamSchema),
  deleteAddress
);

/**
 * AUTHENTICATED: Set an address as default
 * Requirements: 20.5
 * PATCH /api/users/me/addresses/:addressId/default
 */
router.patch(
  '/:addressId/default',
  authenticate,
  validate(addressParamSchema),
  setDefaultAddress
);

export default router;
