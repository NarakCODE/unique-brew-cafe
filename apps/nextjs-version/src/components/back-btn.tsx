"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BackBtnProps {
  label?: string;
  href?: string;
  className?: string;
}

export function BackBtn({ label = "Back", href, className }: BackBtnProps) {
  const router = useRouter();

  if (href) {
    return (
      <Button
        variant="ghost"
        // "asChild" allows the Button styles to wrap the Link component
        asChild
        className={cn(
          "w-fit pl-0 text-muted-foreground hover:text-primary hover:bg-transparent",
          className
        )}
      >
        <Link href={href}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {label}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className={cn(
        "w-fit pl-0 text-muted-foreground hover:text-primary hover:bg-transparent",
        className
      )}
    >
      <ChevronLeft className="mr-1 h-4 w-4" />
      {label}
    </Button>
  );
}
