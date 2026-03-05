"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type ErrorAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: React.ComponentProps<typeof Button>["variant"];
};

type ErrorEmptyStateProps = {
  code: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  actions?: ErrorAction[];
};

export function ErrorEmptyState({
  code,
  title,
  description,
  imageSrc,
  imageAlt,
  actions = [],
}: ErrorEmptyStateProps) {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl items-center justify-center p-6 md:p-10">
      <Empty className="w-full border border-dashed">
        <EmptyHeader className="max-w-2xl">
          <EmptyMedia className="w-full">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={960}
              height={540}
              className="aspect-video w-full rounded-xl object-contain opacity-20"
              priority
            />
          </EmptyMedia>
          <EmptyTitle>{code}</EmptyTitle>
          <EmptyTitle className="text-2xl">{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {actions.length > 0 && (
          <EmptyContent className="flex-row flex-wrap justify-center">
            {actions.map((action) => {
              const href = action.href;
              const handleClick =
                action.onClick || (href ? () => router.push(href) : undefined);

              return (
                <Button
                  key={`${action.label}-${action.href ?? "click"}`}
                  variant={action.variant ?? "default"}
                  className="cursor-pointer"
                  onClick={handleClick}
                >
                  {action.label}
                </Button>
              );
            })}
          </EmptyContent>
        )}
      </Empty>
    </div>
  );
}
