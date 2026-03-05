import { ErrorEmptyState } from "@/components/error-empty-state";

export default function RootNotFound() {
  return (
    <ErrorEmptyState
      code="404"
      title="Page Not Found"
      description="The page you are looking for doesn't exist or has been moved to another location."
      imageSrc="/errors/404-error.svg"
      imageAlt="Not found error illustration"
      actions={[
        { label: "Go Back Home", href: "/dashboard" },
        { label: "Contact Us", href: "/support/tickets", variant: "outline" },
      ]}
    />
  );
}
