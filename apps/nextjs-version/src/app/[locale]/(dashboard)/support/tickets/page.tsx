"use client";

import { Ticket as TicketIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useTickets } from "@/hooks/use-support";

import { DataTable } from "../components/data-table";
import { ticketColumns } from "../components/ticket-columns";

export default function SupportTicketsPage() {
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets();
  const tickets = ticketsData?.data?.tickets || [];

  return (
    <div className="flex h-full flex-1 flex-col space-y-4 md:flex">
      <PageHeader
        title="Support Tickets"
        description="Manage and respond to customer support tickets."
      />

      <div className="rounded-md border bg-card p-4">
        {ticketsLoading ? (
          <TableSkeleton rows={8} columns={5} />
        ) : tickets.length > 0 ? (
          <DataTable columns={ticketColumns} data={tickets} />
        ) : (
          <Empty className="min-h-[40vh]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TicketIcon className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No tickets found</EmptyTitle>
              <EmptyDescription>
                There are no support tickets at the moment.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}
