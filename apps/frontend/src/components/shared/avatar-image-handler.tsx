import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ReusableAvatarProps {
    src?: string | null;
    alt?: string;
    fallback?: React.ReactNode;
    className?: string;
}

export function AvatarImageHandler({
    src,
    alt = "Avatar",
    fallback = "No Item",
    className,
}: ReusableAvatarProps) {
    return (
        <Avatar className={cn("h-10 w-10", className)}>
            <AvatarImage
                src={src || undefined}
                alt={alt}
                className="object-cover"
            />
            <AvatarFallback className="bg-muted text-xs text-muted-foreground flex items-center justify-center">
                {fallback}
            </AvatarFallback>
        </Avatar>
    );
}
