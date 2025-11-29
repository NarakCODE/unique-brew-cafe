import { SupportTicket } from '../models/SupportTicket.js';
import { SupportMessage } from '../models/SupportMessage.js';
import { FAQ, type IFAQ } from '../models/FAQ.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';
import crypto from 'crypto';

export const supportService = {
  /**
   * Create a new support ticket
   */
  async createTicket(
    userId: string,
    data: {
      subject: string;
      category: string;
      message: string;
      priority?: string;
    }
  ) {
    // Generate a unique ticket number
    const ticketNumber = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const ticket = await SupportTicket.create({
      ticketNumber,
      userId,
      subject: data.subject,
      category: data.category,
      priority: data.priority || 'medium',
      status: 'open',
    });

    // Create initial message
    await SupportMessage.create({
      ticketId: ticket._id,
      senderId: userId,
      message: data.message,
    });

    return ticket;
  },

  /**
   * Get tickets with filters
   */
  async getTickets(
    userId: string,
    role: string,
    filters: {
      status?: string;
      category?: string;
      page?: number;
      limit?: number;
    }
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    // If not admin, only show own tickets
    if (role !== 'admin') {
      query.userId = userId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const tickets = await SupportTicket.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email');

    const total = await SupportTicket.countDocuments(query);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId: string, userId: string, role: string) {
    const ticket = await SupportTicket.findById(ticketId).populate(
      'userId',
      'fullName email'
    );

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    // Check ownership
    if (role !== 'admin' && ticket.userId._id.toString() !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return ticket;
  },

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: string, _adminId: string) {
    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    );

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    // Optionally add a system message or notification here

    return ticket;
  },

  /**
   * Add a message to a ticket
   */
  async addMessage(
    ticketId: string,
    senderId: string,
    role: string,
    message: string,
    attachments: string[] = []
  ) {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    // Check ownership
    if (role !== 'admin' && ticket.userId.toString() !== senderId) {
      throw new ForbiddenError('Access denied');
    }

    const newMessage = await SupportMessage.create({
      ticketId,
      senderId,
      message,
      attachments,
    });

    // Update ticket updated time
    ticket.updatedAt = new Date();

    // If user replies, re-open ticket if closed/resolved?
    // For now, just update status if it was closed and user replies
    if (
      role !== 'admin' &&
      (ticket.status === 'resolved' || ticket.status === 'closed')
    ) {
      ticket.status = 'open';
    }

    await ticket.save();

    return newMessage;
  },

  /**
   * Get messages for a ticket
   */
  async getMessages(ticketId: string, userId: string, role: string) {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    // Check ownership
    if (role !== 'admin' && ticket.userId.toString() !== userId) {
      throw new ForbiddenError('Access denied');
    }

    const messages = await SupportMessage.find({ ticketId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'fullName role');

    return messages;
  },

  /**
   * Get FAQs
   */
  async getFAQs(category?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isActive: true };

    if (category) {
      query.category = category;
    }

    return await FAQ.find(query).sort({ displayOrder: 1 });
  },

  /**
   * Create FAQ (Admin)
   */
  async createFAQ(data: Partial<IFAQ>) {
    return await FAQ.create(data);
  },
};
