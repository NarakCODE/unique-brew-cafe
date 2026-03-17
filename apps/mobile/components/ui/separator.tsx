import { cn } from "@/lib/utils";
import { View, type ViewProps } from "react-native";

type SeparatorProps = ViewProps & {
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
};

function Separator({
  className,
  orientation = "horizontal",
  decorative: _decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <View
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
