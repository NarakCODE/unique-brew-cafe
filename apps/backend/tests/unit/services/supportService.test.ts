import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supportService } from '../../../src/services/supportService.js';
import { SupportTicket } from '../../../src/models/SupportTicket.js';
import { SupportMessage } from '../../../src/models/SupportMessage.js';
import { FAQ } from '../../../src/models/FAQ.js';
import mongoose from 'mongoose';

// Mock dependencies
vi.mock('../../../src/models/SupportTicket.js');
vi.mock('../../../src/models/SupportMessage.js');
vi.mock('../../../src/models/FAQ.js');

const createObjectId = () => new mongoose.Types.ObjectId().toString();

describe('SupportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create a new support ticket with initial message', async () => {
      const userId = createObjectId();
      const ticketData = {
        subject: 'Order Issue',
        category: 'orders',
        message: 'My order was not delivered',
        priority: 'high',
      };

      const mockTicket = {
        _id: createObjectId(),
        ticketNumber: 'TKT-12345678',
        userId,
        subject: ticketData.subject,
        category: ticketData.category,
        priority: ticketData.priority,
        status: 'open',
      };

      vi.mocked(SupportTicket.create).mockResolvedValue(mockTicket as any);
      vi.mocked(SupportMessage.create).mockResolvedValue({} as any);

      const result = await supportService.createTicket(userId, ticketData);

      expect(SupportTicket.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          subject: ticketData.subject,
          category: ticketData.category,
          priority: ticketData.priority,
          status: 'open',
        })
      );
      expect(SupportMessage.create).toHaveBeenCalledWith({
        ticketId: mockTicket._id,
        senderId: userId,
        message: ticketData.message,
      });
      expect(result).toEqual(mockTicket);
    });

    it('should use default priority if not provided', async () => {
      const userId = createObjectId();
      const ticketData = {
        subject: 'General Question',
        category: 'general',
        message: 'How do I reset my password?',
      };

      vi.mocked(SupportTicket.create).mockResolvedValue({
        _id: createObjectId(),
        priority: 'medium',
      } as any);
      vi.mocked(SupportMessage.create).mockResolvedValue({} as any);

      await supportService.createTicket(userId, ticketData);

      expect(SupportTicket.create).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'medium',
        })
      );
    });
  });

  describe('getTickets', () => {
    it('should return paginated tickets for user', async () => {
      const userId = createObjectId();
      const mockTickets = [
        { _id: createObjectId(), subject: 'Ticket 1', userId },
        { _id: createObjectId(), subject: 'Ticket 2', userId },
      ];

      vi.mocked(SupportTicket.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue(mockTickets),
      } as any);

      vi.mocked(SupportTicket.countDocuments).mockResolvedValue(2);

      const result = await supportService.getTickets(userId, 'user', {});

      expect(SupportTicket.find).toHaveBeenCalledWith({ userId });
      expect(result.tickets).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should return all tickets for admin', async () => {
      const adminId = createObjectId();
      const mockTickets = [
        { _id: createObjectId(), subject: 'Ticket 1' },
        { _id: createObjectId(), subject: 'Ticket 2' },
      ];

      vi.mocked(SupportTicket.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue(mockTickets),
      } as any);

      vi.mocked(SupportTicket.countDocuments).mockResolvedValue(2);

      const result = await supportService.getTickets(adminId, 'admin', {});

      expect(SupportTicket.find).toHaveBeenCalledWith({});
      expect(result.tickets).toHaveLength(2);
    });

    it('should filter tickets by status', async () => {
      const userId = createObjectId();

      vi.mocked(SupportTicket.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(SupportTicket.countDocuments).mockResolvedValue(0);

      await supportService.getTickets(userId, 'user', { status: 'open' });

      expect(SupportTicket.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'open' })
      );
    });

    it('should filter tickets by category', async () => {
      const userId = createObjectId();

      vi.mocked(SupportTicket.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(SupportTicket.countDocuments).mockResolvedValue(0);

      await supportService.getTickets(userId, 'user', { category: 'orders' });

      expect(SupportTicket.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'orders' })
      );
    });

    it('should apply pagination correctly', async () => {
      const userId = createObjectId();

      vi.mocked(SupportTicket.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(SupportTicket.countDocuments).mockResolvedValue(50);

      const result = await supportService.getTickets(userId, 'user', {
        page: 2,
        limit: 10,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.pages).toBe(5);
    });
  });

  describe('getTicketById', () => {
    it('should return ticket for owner', async () => {
      const userId = createObjectId();
      const ticketId = createObjectId();
      const mockTicket = {
        _id: ticketId,
        userId: { _id: userId },
        subject: 'Test Ticket',
      };

      vi.mocked(SupportTicket.findById).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockTicket),
      } as any);

      const result = await supportService.getTicketById(
        ticketId,
        userId,
        'user'
      );

      expect(result).toEqual(mockTicket);
    });

    it('should return ticket for admin regardless of ownership', async () => {
      const userId = createObjectId();
      const adminId = createObjectId();
      const ticketId = createObjectId();
      const mockTicket = {
        _id: ticketId,
        userId: { _id: userId },
        subject: 'Test Ticket',
      };

      vi.mocked(SupportTicket.findById).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockTicket),
      } as any);

      const result = await supportService.getTicketById(
        ticketId,
        adminId,
        'admin'
      );

      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundError if ticket not found', async () => {
      vi.mocked(SupportTicket.findById).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(
        supportService.getTicketById(createObjectId(), createObjectId(), 'user')
      ).rejects.toThrow('Ticket not found');
    });

    it('should throw ForbiddenError if user does not own ticket', async () => {
      const userId = createObjectId();
      const otherUserId = createObjectId();
      const ticketId = createObjectId();
      const mockTicket = {
        _id: ticketId,
        userId: { _id: otherUserId },
        subject: 'Test Ticket',
      };

      vi.mocked(SupportTicket.findById).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockTicket),
      } as any);

      await expect(
        supportService.getTicketById(ticketId, userId, 'user')
      ).rejects.toThrow('Access denied');
    });
  });

  describe('updateTicketStatus', () => {
    it('should update ticket status', async () => {
      const ticketId = createObjectId();
      const adminId = createObjectId();
      const mockTicket = {
        _id: ticketId,
        status: 'resolved',
      };

      vi.mocked(SupportTicket.findByIdAndUpdate).mockResolvedValue(
        mockTicket as any
      );

      const result = await supportService.updateTicketStatus(
        ticketId,
        'resolved',
        adminId
      );

      expect(SupportTicket.findByIdAndUpdate).toHaveBeenCalledWith(
        ticketId,
        { status: 'resolved' },
        { new: true }
      );
      expect(result.status).toBe('resolved');
    });

    it('should throw NotFoundError if ticket not found', async () => {
      vi.mocked(SupportTicket.findByIdAndUpdate).mockResolvedValue(null);

      await expect(
        supportService.updateTicketStatus(
          createObjectId(),
          'closed',
          createObjectId()
        )
      ).rejects.toThrow('Ticket not found');
    });
  });

  describe('addMessage', () => {
    it('should add message to ticket for owner', async () => {
      const userId = createObjectId();
      const ticketId = createObjectId();
      const mockTicket = {
        _id: ticketId,
        userId: userId,
        status: 'open',
        updatedAt: new Date(),
        save: vi.fn().mockResolvedValue(true),
      };

      const mockMessage = {
        _id: createObjectId(),
        ticketId,
        senderId: userId,
        message: 'Follow up message',
      };

      vi.mocked(SupportTicket.findById).mockResolvedValue(mockTicket as any);
      vi.mocked(SupportMessage.create).mockResolvedValue(mockMessage as any);

      const result = await supportService.addMessage(
        ticketId,
        userId,
        'user',
        'Follow up message'
      );

      expect(SupportMessage.create).toHaveBeenCalledWith({
        ticketId,
        senderId: userId,
        message: 'Follow up message',
        attachments: [],
      });
      expect(mockTicket.save).toHaveBeenCalled();
      expect(result).toEqual(mockMessage);
    });

    it('should add message with attachments', async () => {
      const userId = createObjectId();
      const ticketId = createObjectId();
      const attachments = ['file1.jpg', 'file2.pdf'];
      const mockTicket = {
        _id: ticketId,
        userId: userId,
        status: 'open',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(SupportTicket.findById).mockResolvedValue(mockTicket as any);
      vi.mocked(SupportMessage.create).mockResolvedValue({} as any);

      await supportService.addMessage(
        ticketId,
        userId,
        'user',
        'Message with files',
        attachments
      );

      expect(SupportMessage.create).toHaveBeenCalledWith({
        ticketId,
        senderId: userId,
        message: 'Message with files',
        attachments,
      });
    });

    it('should reopen ticket if user replies to resolved ticket', async () => {
      const userId = createObjectId();
      const ticketId = createObjectId();
      const mockTicket = {
        _id: ticketId,
        userId: userId,
        status: 'resolved',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(SupportTicket.findById).mockResolvedValue(mockTicket as any);
      vi.mocked(SupportMessage.create).mockResolvedValue({} as any);

      await supportService.addMessage(
        ticketId,
        userId,
        'user',
        'Still having issues'
      );

      expect(mockTicket.status).toBe('open');
      expect(mockTicket.save).toHaveBeenCalled();
    });

    it('should not reopen ticket if admin replies', async () => {
      const adminId = createObjectId();
      const userId = createObjectId();
      const ticketId = createObjectId();
      const mockTicket = {
        _id: ticketId,
        userId: userId,
        status: 'resolved',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(SupportTicket.findById).mockResolvedValue(mockTicket as any);
      vi.mocked(SupportMessage.create).mockResolvedValue({} as any);

      await supportService.addMessage(
        ticketId,
        adminId,
        'admin',
        'Admin response'
      );

      expect(mockTicket.status).toBe('resolved');
    });

    it('should throw NotFoundError if ticket not found', async () => {
      vi.mocked(SupportTicket.findById).mockResolvedValue(null);

      await expect(
        supportService.addMessage(
          createObjectId(),
          createObjectId(),
          'user',
          'Message'
        )
      ).rejects.toThrow('Ticket not found');
    });

    it('should throw ForbiddenError if user does not own ticket', async () => {
      const userId = createObjectId();
      const otherUserId = createObjectId();
      const ticketId = createObjectId();
      const mockTicket = {
        _id: ticketId,
        userId: otherUserId,
        status: 'open',
      };

      vi.mocked(SupportTicket.findById).mockResolvedValue(mockTicket as any);

      await expect(
        supportService.addMessage(ticketId, userId, 'user', 'Message')
      ).rejects.toThrow('Access denied');
    });
  });

  describe('getMessages', () => {
    it('should return messages for ticket owner', async () => {
      const userId = createObjectId();
      const ticketId = createObjectId();
      const mockTicket = {
        _id: ticketId,
        userId: userId,
      };

      const mockMessages = [
        { _id: createObjectId(), message: 'First message' },
        { _id: createObjectId(), message: 'Second message' },
      ];

      vi.mocked(SupportTicket.findById).mockResolvedValue(mockTicket as any);
      vi.mocked(SupportMessage.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue(mockMessages),
      } as any);

      const result = await supportService.getMessages(ticketId, userId, 'user');

      expect(SupportMessage.find).toHaveBeenCalledWith({ ticketId });
      expect(result).toHaveLength(2);
    });

    it('should return messages for admin', async () => {
      const adminId = createObjectId();
      const userId = createObjectId();
      const ticketId = createObjectId();
      const mockTicket = {
        _id: ticketId,
        userId: userId,
      };

      const mockMessages = [{ _id: createObjectId(), message: 'Message' }];

      vi.mocked(SupportTicket.findById).mockResolvedValue(mockTicket as any);
      vi.mocked(SupportMessage.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue(mockMessages),
      } as any);

      const result = await supportService.getMessages(
        ticketId,
        adminId,
        'admin'
      );

      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundError if ticket not found', async () => {
      vi.mocked(SupportTicket.findById).mockResolvedValue(null);

      await expect(
        supportService.getMessages(createObjectId(), createObjectId(), 'user')
      ).rejects.toThrow('Ticket not found');
    });

    it('should throw ForbiddenError if user does not own ticket', async () => {
      const userId = createObjectId();
      const otherUserId = createObjectId();
      const ticketId = createObjectId();
      const mockTicket = {
        _id: ticketId,
        userId: otherUserId,
      };

      vi.mocked(SupportTicket.findById).mockResolvedValue(mockTicket as any);

      await expect(
        supportService.getMessages(ticketId, userId, 'user')
      ).rejects.toThrow('Access denied');
    });
  });

  describe('getFAQs', () => {
    it('should return all active FAQs', async () => {
      const mockFAQs = [
        { _id: createObjectId(), question: 'FAQ 1', isActive: true },
        { _id: createObjectId(), question: 'FAQ 2', isActive: true },
      ];

      vi.mocked(FAQ.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockFAQs),
      } as any);

      const result = await supportService.getFAQs();

      expect(FAQ.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toHaveLength(2);
    });

    it('should filter FAQs by category', async () => {
      vi.mocked(FAQ.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      } as any);

      await supportService.getFAQs('orders');

      expect(FAQ.find).toHaveBeenCalledWith({
        isActive: true,
        category: 'orders',
      });
    });

    it('should return empty array when no FAQs found', async () => {
      vi.mocked(FAQ.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await supportService.getFAQs();

      expect(result).toEqual([]);
    });
  });

  describe('createFAQ', () => {
    it('should create a new FAQ', async () => {
      const faqData = {
        question: 'How do I track my order?',
        answer: 'You can track your order in the Orders section.',
        category: 'orders',
        displayOrder: 1,
        isActive: true,
      };

      const mockFAQ = {
        _id: createObjectId(),
        ...faqData,
      };

      vi.mocked(FAQ.create).mockResolvedValue(mockFAQ as any);

      const result = await supportService.createFAQ(faqData);

      expect(FAQ.create).toHaveBeenCalledWith(faqData);
      expect(result.question).toBe(faqData.question);
    });
  });
});
