import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/hooks/use-users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Mail, Phone, Calendar, CreditCard, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getRoleColor, getStatusColor } from "@/lib/badge-styles";
import { cn } from "@/lib/utils";

interface UserDetailsDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({
  userId,
  open,
  onOpenChange,
}: UserDetailsDialogProps) {
  const { user, isLoading } = useUser(userId);

  if (!userId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : user ? (
          <div className="grid gap-6">
            {/* Header Profile Section */}
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="h-20 w-20 border">
                <AvatarImage src={user.profileImage} alt={user.fullName} />
                <AvatarFallback className="text-xl">
                  {user.fullName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold">{user.fullName}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className={cn("capitalize", getRoleColor(user.role))}
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize", getStatusColor(user.status))}
                  >
                    {user.status}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Contact Information
                </h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                    {user.emailVerified && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phoneNumber || "N/A"}</span>
                    {user.phoneVerified && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Loyalty & Stats
                </h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="capitalize">{user.loyaltyTier} Tier</span>
                    <span className="ml-auto font-mono font-medium">
                      {user.loyaltyPoints} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Total Spent</span>
                    <span className="ml-auto font-mono font-medium">
                      ${user.totalSpent?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Account Activity
                </h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined</span>
                    <span className="ml-auto text-muted-foreground">
                      {format(new Date(user.createdAt), "PPP")}
                    </span>
                  </div>
                  {user.lastLoginAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Last Login</span>
                      <span className="ml-auto text-muted-foreground">
                        {format(new Date(user.lastLoginAt), "PPP")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Preferences
                </h4>
                <div className="grid gap-1 text-sm">
                  <div className="flex justify-between">
                    <span>Language</span>
                    <span className="font-medium uppercase">
                      {user.preferences.language}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currency</span>
                    <span className="font-medium uppercase">
                      {user.preferences.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
            <p>User details not found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
