export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";
export type TicketCategory =
  | "general"
  | "order"
  | "payment"
  | "account"
  | "technical"
  | "other";

export interface Ticket {
  _id: string;
  ticketNumber: string;
  userId: string | { _id: string; fullName: string; email: string }; // Depending on population
  subject: string;
  category: TicketCategory;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  _id: string;
  ticketId: string;
  senderId: string | { _id: string; fullName: string; role: string };
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  page?: number;
  limit?: number;
}

export interface FAQFilters {
  category?: string;
}
