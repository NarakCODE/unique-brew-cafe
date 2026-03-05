import { apiClient } from "@/lib/api-client";
import {
  Ticket,
  TicketFilters,
  TicketStatus,
  FAQ,
  FAQFilters,
  SupportMessage,
} from "@/types/support";
import { ApiResponse } from "@/types/api";
import { buildQueryString, withQuery } from "@/lib/search-params";

type TicketListResponse = ApiResponse<{
  tickets: Ticket[];
  total: number;
  page: number;
  totalPages: number;
}>;

type FAQListResponse = ApiResponse<FAQ[]>;

export const getTickets = async (
  filters?: TicketFilters,
): Promise<TicketListResponse> => {
  const query = buildQueryString({
    status: filters?.status,
    category: filters?.category,
    page: filters?.page,
    limit: filters?.limit,
  });

  return apiClient.get(withQuery("/support/tickets", query));
};

export const getTicket = async (id: string): Promise<ApiResponse<Ticket>> => {
  return apiClient.get(`/support/tickets/${id}`);
};

export const updateTicketStatus = async (
  id: string,
  status: TicketStatus,
): Promise<ApiResponse<Ticket>> => {
  return apiClient.patch(`/support/tickets/${id}/status`, { status });
};

export const getMessages = async (
  ticketId: string,
): Promise<ApiResponse<SupportMessage[]>> => {
  return apiClient.get(`/support/tickets/${ticketId}/messages`);
};

export const addMessage = async (
  ticketId: string,
  message: string,
  attachments?: string[],
): Promise<ApiResponse<SupportMessage>> => {
  return apiClient.post(`/support/tickets/${ticketId}/messages`, {
    message,
    attachments,
  });
};

export const getFAQs = async (
  filters?: FAQFilters,
): Promise<FAQListResponse> => {
  const query = buildQueryString({
    category: filters?.category,
  });

  return apiClient.get(withQuery("/support/faq", query));
};

export const createFAQ = async (data: {
  question: string;
  answer: string;
  category: string;
  displayOrder?: number;
}): Promise<ApiResponse<FAQ>> => {
  return apiClient.post("/support/faq", data);
};

export const updateFAQ = async (
  id: string,
  data: Partial<{
    question: string;
    answer: string;
    category: string;
    displayOrder: number;
    isActive: boolean;
  }>,
): Promise<ApiResponse<FAQ>> => {
  return apiClient.patch(`/support/faq/${id}`, data);
};

export const deleteFAQ = async (id: string): Promise<ApiResponse<null>> => {
  return apiClient.delete(`/support/faq/${id}`);
};
