import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function PageHeader({
  title,
  description,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="text-sm md:text-base text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
