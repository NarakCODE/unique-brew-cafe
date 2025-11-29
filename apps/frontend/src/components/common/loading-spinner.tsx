import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface LoadingSpinnerProps extends React.ComponentProps<"div"> {
    size?: "sm" | "default" | "lg" | "xl";
    fullScreen?: boolean;
    text?: string;
}

export function LoadingSpinner({
    className,
    size = "default",
    fullScreen = false,
    text,
    ...props
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "size-4",
        default: "size-8",
        lg: "size-12",
        xl: "size-16",
    };

    const containerClasses = cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className
    );

    return (
        <div className={containerClasses} {...props}>
            <Spinner className={sizeClasses[size]} />
            {text && (
                <p className="text-sm text-muted-foreground font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
}
