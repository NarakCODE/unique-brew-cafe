export interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    category: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "open" | "in_progress" | "resolved" | "closed";
    message: string;
    createdAt: string;
    updatedAt: string;
    messages?: TicketMessage[];
}

export interface TicketMessage {
    id: string;
    ticketId: string;
    senderId: string;
    senderType: "user" | "admin" | "support";
    message: string;
    createdAt: string;
}
