"use client";

import { useSearchParams } from "next/navigation";
import { useUsers } from "@/hooks/use-users";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { Loader2, UsersIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

export default function UsersPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const role = searchParams.get("role") || undefined;

  const { users, isLoading } = useUsers({
    page,
    limit,
    search,
    status,
    role,
  });

  return (
    <div className="flex h-full flex-1 flex-col space-y-8  md:flex">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Users"
          description="Manage your users and view their details."
        />
      </div>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : users?.length === 0 ? (
        <Empty className="min-h-[50vh]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No users found</EmptyTitle>
            <EmptyDescription>
              There are no users registered in the system yet.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>Invite User</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <DataTable data={users} columns={columns} />
      )}
    </div>
  );
}
