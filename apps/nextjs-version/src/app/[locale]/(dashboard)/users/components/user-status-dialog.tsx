"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types/profile";
import { useUpdateUserStatus } from "@/hooks/use-users";

const statusSchema = z.object({
  reason: z.string().optional(),
});

type StatusFormValues = z.infer<typeof statusSchema>;

interface UserStatusDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserStatusDialog({
  user,
  open,
  onOpenChange,
}: UserStatusDialogProps) {
  const { mutateAsync: updateStatus, isPending } = useUpdateUserStatus();
  const isSuspended = user.status === "suspended";
  const newStatus = isSuspended ? "active" : "suspended";

  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      reason: "",
    },
  });

  async function onSubmit(data: StatusFormValues) {
    try {
      await updateStatus({
        userId: user._id,
        data: {
          status: newStatus,
          reason: data.reason,
        },
      });
      toast.success(
        `User ${newStatus === "active" ? "activated" : "suspended"} successfully`
      );
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to update user status");
      console.error(error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isSuspended ? "Activate User" : "Suspend User"}
          </DialogTitle>
          <DialogDescription>
            {isSuspended
              ? "Are you sure you want to activate this user? They will regain access to the platform."
              : "Are you sure you want to suspend this user? They will lose access to the platform."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isSuspended && (
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Violation of terms of service..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={isSuspended ? "default" : "destructive"}
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSuspended ? "Activate" : "Suspend"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
