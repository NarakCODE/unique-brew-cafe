import type { ApiResponse } from "../../../packages/api/src";
import { mobileApiClient } from "@/lib/mobile-api-client";

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: {
    id: string;
    fullName: string;
    role: string;
  } | string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
}

export interface CreateTicketDTO {
  subject: string;
  category: string;
  message: string;
  priority?: TicketPriority;
}

export interface AddMessageDTO {
  message: string;
  attachments?: string[];
}

export interface SupportTicketListResponse {
  tickets: SupportTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class SupportService {
  async getFAQs(category?: string) {
    const response = await mobileApiClient.get<ApiResponse<FAQ[]>>('/support/faq', {
      params: category ? { category } : undefined
    });
    return response.data.data;
  }

  async getTickets(params?: { status?: string; category?: string; page?: number; limit?: number }) {
    const response = await mobileApiClient.get<ApiResponse<SupportTicketListResponse>>('/support/tickets', { params });
    return response.data.data;
  }

  async getTicket(id: string) {
    const response = await mobileApiClient.get<ApiResponse<SupportTicket>>(`/support/tickets/${id}`);
    return response.data.data;
  }

  async createTicket(data: CreateTicketDTO) {
    const response = await mobileApiClient.post<ApiResponse<SupportTicket>>('/support/tickets', data);
    return response.data.data;
  }

  async getMessages(ticketId: string) {
    const response = await mobileApiClient.get<ApiResponse<TicketMessage[]>>(`/support/tickets/${ticketId}/messages`);
    return response.data.data;
  }

  async addMessage(ticketId: string, data: AddMessageDTO) {
    const response = await mobileApiClient.post<ApiResponse<TicketMessage>>(`/support/tickets/${ticketId}/messages`, data);
    return response.data.data;
  }
}

export const supportService = new SupportService();
