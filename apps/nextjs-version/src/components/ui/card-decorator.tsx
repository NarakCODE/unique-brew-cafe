import * as React from "react";
import { cn } from "@/lib/utils";

export function CardDecorator({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
