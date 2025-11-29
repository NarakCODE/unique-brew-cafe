import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType =
    | "active"
    | "inactive"
    | "pending"
    | "completed"
    | "cancelled"
    | "processing"
    | "shipped"
    | "delivered"
    | "refunded"
    | "success"
    | "error"
    | "warning"
    | "info"
    | string;

interface StatusBadgeProps extends React.ComponentProps<typeof Badge> {
    status: StatusType;
    label?: string;
}

export function StatusBadge({
    status,
    label,
    className,
    ...props
}: StatusBadgeProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
            case "completed":
            case "success":
            case "delivered":
                return "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-400";

            case "inactive":
            case "cancelled":
            case "error":
            case "refunded":
                return "bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-400";

            case "pending":
            case "processing":
            case "warning":
                return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-400";

            case "shipped":
            case "info":
                return "bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400";

            default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                "capitalize font-medium border-0",
                getStatusColor(status),
                className
            )}
            {...props}
        >
            {label || status}
        </Badge>
    );
}
