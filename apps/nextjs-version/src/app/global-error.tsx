"use client";

import { ErrorEmptyState } from "@/components/error-empty-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorEmptyState
          code="500+"
          title="Critical Error"
          description={
            error.message ||
            "A critical error occurred while loading this page."
          }
          imageSrc="/errors/500-error.svg"
          imageAlt="Global error illustration"
          actions={[
            { label: "Try Again", onClick: reset },
            { label: "Go Back Home", href: "/dashboard", variant: "outline" },
          ]}
        />
      </body>
    </html>
  );
}
