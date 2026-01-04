"use client";

import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

interface EmptyStateProps {
    title: string;
    description?: string;
    /**
     * The Lucide Icon component class (e.g. FolderOpen)
     */
    icon?: LucideIcon;
    /**
     * The action button/element to display below the description.
     * Can be a Button, IconButton, or Link.
     */
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon: Icon,
    action,
    className,
}: EmptyStateProps) {
    return (
        <Empty className={cn("py-12", className)}>
            <EmptyHeader>
                {Icon && (
                    <EmptyMedia>
                        <Icon className="text-muted-foreground mb-2 size-16" />
                    </EmptyMedia>
                )}
                <EmptyTitle>{title}</EmptyTitle>
                {description && (
                    <EmptyDescription className="mx-auto mb-6 max-w-sm">
                        {description}
                    </EmptyDescription>
                )}
                {action && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                        {action}
                    </div>
                )}
            </EmptyHeader>
        </Empty>
    );
}
