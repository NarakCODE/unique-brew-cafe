/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTickets,
  getTicket,
  updateTicketStatus,
  getMessages,
  addMessage,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "@/api/support";
import { TicketFilters, TicketStatus, FAQFilters } from "@/types/support";
import { toast } from "sonner";

// Tickets Hooks

export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ["tickets", filters],
    queryFn: () => getTickets(filters),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicket(id),
    enabled: !!id,
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      updateTicketStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", variables.id] });
      toast.success("Ticket status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update ticket status");
    },
  });
}

// Messages Hooks

export function useTicketMessages(ticketId: string) {
  return useQuery({
    queryKey: ["ticket-messages", ticketId],
    queryFn: () => getMessages(ticketId),
    enabled: !!ticketId,
  });
}

export function useAddMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      message,
      attachments,
    }: {
      ticketId: string;
      message: string;
      attachments?: string[];
    }) => addMessage(ticketId, message, attachments),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket-messages", variables.ticketId],
      });
      toast.success("Message added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add message");
    },
  });
}

// FAQ Hooks

export function useFAQs(filters?: FAQFilters) {
  return useQuery({
    queryKey: ["faqs", filters],
    queryFn: () => getFAQs(filters),
  });
}

export function useCreateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create FAQ");
    },
  });
}

export function useUpdateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateFAQ>[1];
    }) => updateFAQ(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update FAQ");
    },
  });
}

export function useDeleteFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete FAQ");
    },
  });
}
