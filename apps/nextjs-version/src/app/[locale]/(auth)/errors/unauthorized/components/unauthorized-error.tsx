"use client";

import { ErrorEmptyState } from "@/components/error-empty-state";

export function UnauthorizedError() {
  return (
    <ErrorEmptyState
      code="401"
      title="Unauthorized"
      description="You don't have permission to access this resource. Please sign in or contact your administrator."
      imageSrc="/errors/401-error.svg"
      imageAlt="Unauthorized error illustration"
      actions={[
        { label: "Go Back Home", href: "/dashboard" },
        { label: "Contact Us", href: "/support/tickets", variant: "outline" },
      ]}
    />
  );
}
