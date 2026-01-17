import express, { Router } from 'express';
import {
  createTicket,
  getTickets,
  getTicket,
  updateTicketStatus,
  addMessage,
  getMessages,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from '../controllers/supportController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router: Router = express.Router();

// Public routes
router.get('/faq', getFAQs);

// Protected routes
router.use(authenticate);

// Ticket routes
router.post('/tickets', createTicket);
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicket);
router.post('/tickets/:id/messages', addMessage);
router.get('/tickets/:id/messages', getMessages);

// Admin only routes
router.patch(
  '/tickets/:id/status',
  authorize({ roles: ['admin'] }),
  updateTicketStatus
);
router.post('/faq', authorize({ roles: ['admin'] }), createFAQ);
router.patch('/faq/:id', authorize({ roles: ['admin'] }), updateFAQ);
router.delete('/faq/:id', authorize({ roles: ['admin'] }), deleteFAQ);

export default router;
