import express from 'express';
import {
  getPublicConfig,
  getDeliveryZones,
  getHealth,
  updateAppConfig,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
} from '../controllers/configController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// Public routes
router.get('/app', getPublicConfig);
router.get('/delivery-zones', getDeliveryZones);
router.get('/health', getHealth);

// Admin routes
router.use(authenticate);
router.use(authorize({ roles: ['admin'] }));

router.patch('/app', updateAppConfig);
router.post('/delivery-zones', createDeliveryZone);
router
  .route('/delivery-zones/:id')
  .patch(updateDeliveryZone)
  .delete(deleteDeliveryZone);

export default router;
