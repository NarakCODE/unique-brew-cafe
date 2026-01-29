"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTickets, useFAQs } from "@/hooks/use-support";
import { DataTable } from "./components/data-table";
import { ticketColumns } from "./components/ticket-columns";
import { faqColumns } from "./components/faq-columns";
import { Button } from "@/components/ui/button";
import { Plus, Ticket as TicketIcon, HelpCircle } from "lucide-react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { CreateFAQDialog } from "./components/create-faq-dialog";
import { PageHeader } from "@/components/page-header";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function SupportPage() {
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets();
  const { data: faqsData, isLoading: faqsLoading } = useFAQs();
  const [createFAQOpen, setCreateFAQOpen] = useState(false);

  const tickets = ticketsData?.data?.tickets || [];
  const faqs = faqsData?.data || [];

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 md:flex p-4">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Support"
          description="Manage support tickets and frequently asked questions."
        />

        <div className="flex justify-end">
          <Button onClick={() => setCreateFAQOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add FAQ
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <div className="rounded-md border bg-card p-4">
            {faqsLoading ? (
              <TableSkeleton rows={8} columns={4} />
            ) : faqs.length > 0 ? (
              <DataTable columns={faqColumns} data={faqs} />
            ) : (
              <Empty className="min-h-[40vh]">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HelpCircle className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No FAQs found</EmptyTitle>
                  <EmptyDescription>
                    Create your first FAQ to help users.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => setCreateFAQOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create FAQ
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CreateFAQDialog open={createFAQOpen} onOpenChange={setCreateFAQOpen} />
    </div>
  );
}
