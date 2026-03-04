"use client";

import { useState } from "react";
import { HelpCircle, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useFAQs } from "@/hooks/use-support";

import { DataTable } from "../components/data-table";
import { faqColumns } from "../components/faq-columns";
import { CreateFAQDialog } from "../components/create-faq-dialog";

export default function SupportFaqPage() {
  const { data: faqsData, isLoading: faqsLoading } = useFAQs();
  const [createFAQOpen, setCreateFAQOpen] = useState(false);
  const faqs = faqsData?.data || [];

  return (
    <div className="flex h-full flex-1 flex-col space-y-4 md:flex">
      <div className="flex items-end justify-between">
        <PageHeader
          title="Support FAQ"
          description="Manage frequently asked questions for your customers."
        />

        <div className="flex justify-end">
          <Button onClick={() => setCreateFAQOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add FAQ
          </Button>
        </div>
      </div>

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

      <CreateFAQDialog open={createFAQOpen} onOpenChange={setCreateFAQOpen} />
    </div>
  );
}
