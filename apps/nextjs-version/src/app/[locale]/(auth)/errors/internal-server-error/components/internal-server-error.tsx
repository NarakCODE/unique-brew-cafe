"use client";

import { ErrorEmptyState } from "@/components/error-empty-state";

export function InternalServerError() {
  return (
    <ErrorEmptyState
      code="500+"
      title="Internal Server Error"
      description="Something went wrong on our end. We're working to fix the issue. Please try again later."
      imageSrc="/errors/500-error.svg"
      imageAlt="Internal server error illustration"
      actions={[
        { label: "Go Back Home", href: "/dashboard" },
        { label: "Contact Us", href: "/support/tickets", variant: "outline" },
      ]}
    />
  );
}
