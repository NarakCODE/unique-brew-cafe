"use client";

import { ErrorEmptyState } from "@/components/error-empty-state";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorEmptyState
      code="500+"
      title="Something Went Wrong"
      description={
        error.message ||
        "An unexpected error occurred. Please try again or return home."
      }
      imageSrc="/errors/500-error.svg"
      imageAlt="Server error illustration"
      actions={[
        { label: "Try Again", onClick: reset },
        { label: "Go Back Home", href: "/dashboard", variant: "outline" },
      ]}
    />
  );
}
