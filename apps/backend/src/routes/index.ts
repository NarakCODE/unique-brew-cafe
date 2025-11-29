import { Router } from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import storeRoutes from './storeRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import searchRoutes from './searchRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import cartRoutes from './cartRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import orderRoutes from './orderRoutes.js';
import addressRoutes from './addressRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import announcementRoutes from './announcementRoutes.js';
import reportRoutes from './reportRoutes.js';
import supportRoutes from './supportRoutes.js';
import configRoutes from './configRoutes.js';

import addonRoutes from './addonRoutes.js';

const router = Router();

// Authentication routes
router.use('/auth', authRoutes);

// User management routes
// Note: Address routes must be mounted before user routes to avoid path conflicts
router.use('/users/me/addresses', addressRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);

// Store and product routes
router.use('/stores', storeRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/addons', addonRoutes);

// Search and favorites
router.use('/search', searchRoutes);
router.use('/favorites', favoriteRoutes);

// Shopping and checkout
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/payments', paymentRoutes);
router.use('/orders', orderRoutes);

// Notifications and announcements
router.use('/notifications', notificationRoutes);
router.use('/announcements', announcementRoutes);

// Admin features
router.use('/reports', reportRoutes);
router.use('/support', supportRoutes);
router.use('/config', configRoutes);

export default router;
