"use client";

import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DashboardBreadcrumb() {
  const pathname = usePathname();

  // 1. Split path into segments (e.g., "dashboard", "stores", "123")
  const segments = pathname.split("/").filter((item) => item !== "");

  // 2. Helper to format segment text (e.g., "create-store" -> "Create Store")
  const formatSegment = (segment: string) => {
    // Check if it looks like an ID (24 chars alphanumeric usually for MongoDB)
    // You can adjust this regex based on your ID format
    const isId = /^[a-f\d]{24}$/i.test(segment);

    if (isId) return "Details"; // Fallback for IDs

    return segment
      .replace(/-/g, " ") // Replace dashes with spaces
      .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter
  };

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          if (segment === "dashboard") return null;

          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const formattedSegment = formatSegment(segment);

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{formattedSegment}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>
                    {formattedSegment}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
