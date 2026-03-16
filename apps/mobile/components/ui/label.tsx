import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Platform } from "react-native";

type LabelProps = React.ComponentProps<typeof Text> & {
  htmlFor?: string;
  disabled?: boolean;
};

function Label({
  className,
  disabled,
  htmlFor: _htmlFor,
  ...props
}: LabelProps) {
  return (
    <Text
      className={cn(
        "text-foreground text-sm font-medium",
        Platform.select({
          web: "leading-none select-none",
        }),
        disabled && "opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };
