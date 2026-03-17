import type { TicketStatus, TicketPriority } from '@/services/support.service';

export const getStatusColor = (status: TicketStatus) => {
  switch (status) {
    case 'open':
      return 'text-blue-500 bg-blue-50 border-blue-100';
    case 'in_progress':
      return 'text-amber-500 bg-amber-50 border-amber-100';
    case 'resolved':
      return 'text-green-500 bg-green-50 border-green-100';
    case 'closed':
      return 'text-gray-500 bg-gray-50 border-gray-100';
    default:
      return 'text-gray-500 bg-gray-50 border-gray-100';
  }
};

export const getStatusLabel = (status: TicketStatus) => {
  switch (status) {
    case 'open':
      return 'Open';
    case 'in_progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
};

export const getPriorityColor = (priority: TicketPriority) => {
  switch (priority) {
    case 'low':
      return 'text-gray-500';
    case 'medium':
      return 'text-blue-500';
    case 'high':
      return 'text-amber-500';
    case 'urgent':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};
