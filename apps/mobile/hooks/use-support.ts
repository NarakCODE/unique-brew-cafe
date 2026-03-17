import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supportService, type CreateTicketDTO, type AddMessageDTO } from '@/services/support.service';

export function useFAQs(category?: string) {
  return useQuery({
    queryKey: ['faqs', category],
    queryFn: () => supportService.getFAQs(category),
  });
}

export function useTickets(params?: { status?: string; category?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => supportService.getTickets(params),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => supportService.getTicket(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTicketDTO) => supportService.createTicket(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useTicketMessages(ticketId: string) {
  return useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: () => supportService.getMessages(ticketId),
    enabled: !!ticketId,
  });
}

export function useAddTicketMessage(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddMessageDTO) => supportService.addMessage(ticketId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] });
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
