"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import { useChangePassword, useDeleteAccount } from "@/hooks/use-profile";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "@/components/animate-ui/icons/trash-2";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";

// Schema for Change Password
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// Schema for Delete Account
const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete account"),
  reason: z.string().optional(),
  // Keep the schema as is, checking for "confirm"
  confirmation: z.string().refine((val) => val === "confirm", {
    message: "Please type 'confirm' to proceed",
  }),
});

type DeleteAccountFormValues = Omit<
  z.infer<typeof deleteAccountSchema>,
  "confirmation"
> & {
  confirmation: string;
};

export default function AccountSettings() {
  const { changePassword, isChanging } = useChangePassword();
  const { deleteAccount, isDeleting } = useDeleteAccount();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form for Change Password
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Form for Delete Account
  const deleteForm = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      reason: "",
      confirmation: "", // Now compatible with type string
    },
  });

  function onPasswordSubmit(data: ChangePasswordFormValues) {
    changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          passwordForm.reset();
        },
      }
    );
  }

  function onDeleteSubmit(data: DeleteAccountFormValues) {
    const { confirmation, ...payload } = data;
    deleteAccount(payload, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        deleteForm.reset();
      },
    });
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <PageHeader
        title="Account Settings"
        description="Manage your account security and danger zone."
      />

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter current password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end mt-4">
                <Button type="submit" disabled={isChanging}>
                  {isChanging && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Password
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Danger Zone Section */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h4 className="font-semibold">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>

            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={(open) => {
                if (!open) deleteForm.reset();
                setIsDeleteDialogOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>

                <Form {...deleteForm}>
                  <form
                    onSubmit={deleteForm.handleSubmit(onDeleteSubmit)}
                    className="space-y-4 py-4"
                  >
                    <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm mb-4">
                      Warning: This action is permanent. Please type{" "}
                      <span className="font-bold">confirm</span> to verify.
                    </div>
                    <FormField
                      control={deleteForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password to confirm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={deleteForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Why are you leaving?"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={deleteForm.control}
                      name="confirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmation</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Type "confirm" to proceed'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="destructive"
                        disabled={
                          isDeleting ||
                          deleteForm.watch("confirmation") !== "confirm" ||
                          !deleteForm.formState.isValid
                        }
                      >
                        {isDeleting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Confirm Deletion
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
