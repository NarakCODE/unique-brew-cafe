import * as React from "react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

export const APP_NAME = "Unique Brew Cafe";
export const APP_SHORT_NAME = "Unique Brew";

interface ApplicationLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  iconSize?: number;
  showText?: boolean;
  name?: string;
  subtitle?: string;
  iconClassName?: string;
  iconWrapperClassName?: string;
  nameClassName?: string;
  subtitleClassName?: string;
}

export function ApplicationLogo({
  className,
  iconSize = 24,
  showText = true,
  name = APP_NAME,
  subtitle,
  iconClassName,
  iconWrapperClassName,
  nameClassName,
  subtitleClassName,
  ...props
}: ApplicationLogoProps) {
  const icon = <Logo size={iconSize} className={cn("shrink-0", iconClassName)} />;

  return (
    <div className={cn("inline-flex items-center gap-2", className)} {...props}>
      {iconWrapperClassName ? (
        <div className={iconWrapperClassName}>{icon}</div>
      ) : (
        icon
      )}
      {showText ? (
        <div className="grid text-left leading-tight">
          <span className={cn("truncate font-semibold", nameClassName)}>{name}</span>
          {subtitle ? (
            <span className={cn("truncate text-xs text-muted-foreground", subtitleClassName)}>
              {subtitle}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
