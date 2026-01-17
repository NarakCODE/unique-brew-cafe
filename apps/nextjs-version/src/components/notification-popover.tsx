import { useState } from "react";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const { notifications, isLoading: isLoadingNotifications } =
    useNotifications();
  const { count: unreadCount, isLoading: isLoadingCount } =
    useUnreadNotificationCount();

  const hasUnread = unreadCount > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold leading-none">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-75">
          {isLoadingNotifications ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="grid place-items-center p-8 text-center text-muted-foreground">
              <Bell className="mb-2 h-10 w-10 opacity-20" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="grid">
              {notifications.map((notification) => (
                <div
                  key={notification.id || notification._id}
                  className="flex flex-col gap-1 border-b p-4 last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground pt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
