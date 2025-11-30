import express, { Router } from 'express';
import * as addonController from '../controllers/addonController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../schemas/index.js';

const router: Router = express.Router();
/**
 * Add-on Routes
 * Base path: /api/addons
 */

// Get all add-ons
router.get('/', addonController.getAllAddOns);

// Create a new add-on (Admin only)
router.post(
  '/',
  authenticate,
  authorize({ roles: ['admin'] }),
  addonController.createAddOn
);

// Update an add-on (Admin only)
router.put(
  '/:id',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(idParamSchema),
  addonController.updateAddOn
);

// Delete an add-on (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize({ roles: ['admin'] }),
  validate(idParamSchema),
  addonController.deleteAddOn
);

export default router;
