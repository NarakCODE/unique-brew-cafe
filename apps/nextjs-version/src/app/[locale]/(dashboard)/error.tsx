"use client";

import { ErrorEmptyState } from "@/components/error-empty-state";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorEmptyState
      code="500"
      title="Dashboard Error"
      description={
        error.message ||
        "We couldn't load this dashboard view. Please try again."
      }
      imageSrc="/errors/500-error.svg"
      imageAlt="Dashboard error illustration"
      actions={[
        { label: "Try Again", onClick: reset },
        { label: "Go to Dashboard Home", href: "/dashboard", variant: "outline" },
      ]}
    />
  );
}
