import type { Request, Response } from 'express';
import { supportService } from '../services/supportService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Create a new ticket
 * POST /tickets
 */
export const createTicket = asyncHandler(
  async (req: Request, res: Response) => {
    const { subject, category, message, priority } = req.body;

    if (!subject || !category || !message) {
      throw new BadRequestError('Subject, category, and message are required');
    }

    const ticket = await supportService.createTicket(req.userId!, {
      subject,
      category,
      message,
      priority,
    });

    res
      .status(201)
      .json(new ApiResponse(201, ticket, 'Ticket created successfully'));
  }
);

/**
 * Get tickets
 * GET /tickets
 */
export const getTickets = asyncHandler(async (req: Request, res: Response) => {
  const { status, category, page, limit } = req.query;

  const result = await supportService.getTickets(req.userId!, req.userRole!, {
    status: status as string,
    category: category as string,
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20,
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Tickets retrieved successfully'));
});

/**
 * Get ticket by ID
 * GET /tickets/:id
 */
export const getTicket = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Ticket ID is required');
  }

  const ticket = await supportService.getTicketById(
    id,
    req.userId!,
    req.userRole!
  );

  res
    .status(200)
    .json(new ApiResponse(200, ticket, 'Ticket retrieved successfully'));
});

/**
 * Update ticket status (Admin)
 * PATCH /tickets/:id/status
 */
export const updateTicketStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      throw new BadRequestError('Ticket ID is required');
    }

    if (!status) {
      throw new BadRequestError('Status is required');
    }

    const ticket = await supportService.updateTicketStatus(
      id,
      status,
      req.userId!
    );

    res
      .status(200)
      .json(new ApiResponse(200, ticket, 'Ticket status updated successfully'));
  }
);

/**
 * Add message to ticket
 * POST /tickets/:id/messages
 */
export const addMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message, attachments } = req.body;

  if (!id) {
    throw new BadRequestError('Ticket ID is required');
  }

  if (!message) {
    throw new BadRequestError('Message is required');
  }

  const newMessage = await supportService.addMessage(
    id,
    req.userId!,
    req.userRole!,
    message,
    attachments
  );

  res
    .status(201)
    .json(new ApiResponse(201, newMessage, 'Message added successfully'));
});

/**
 * Get ticket messages
 * GET /tickets/:id/messages
 */
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Ticket ID is required');
  }

  const messages = await supportService.getMessages(
    id,
    req.userId!,
    req.userRole!
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, messages, 'Ticket messages retrieved successfully')
    );
});

/**
 * Get FAQs
 * GET /faq
 */
export const getFAQs = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.query;

  const faqs = await supportService.getFAQs(category as string);

  res
    .status(200)
    .json(new ApiResponse(200, faqs, 'FAQs retrieved successfully'));
});

/**
 * Create FAQ (Admin)
 * POST /faq
 */
export const createFAQ = asyncHandler(async (req: Request, res: Response) => {
  const { question, answer, category, displayOrder } = req.body;

  if (!question || !answer) {
    throw new BadRequestError('Question and answer are required');
  }

  const faq = await supportService.createFAQ({
    question,
    answer,
    category,
    displayOrder,
  });

  res.status(201).json(new ApiResponse(201, faq, 'FAQ created successfully'));
});
