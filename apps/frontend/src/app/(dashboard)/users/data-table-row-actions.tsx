"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Ban, CheckCircle, Trash2 } from "lucide-react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUpdateUserStatus, useDeleteUser } from "@/hooks/use-users";
import { toast } from "sonner";

interface DataTableRowActionsProps {
    row: Row<User>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
    const router = useRouter();
    const user = row.original;
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);

    const updateStatus = useUpdateUserStatus();
    const deleteUser = useDeleteUser();

    const handleViewOrders = () => {
        router.push(`/orders?userId=${user._id}`);
    };

    const handleToggleStatus = async () => {
        const newStatus = user.status === "active" ? "suspended" : "active";

        try {
            await updateStatus.mutateAsync({
                id: user._id,
                status: newStatus,
            });
            toast.success(
                `User ${newStatus === "active" ? "activated" : "suspended"} successfully`
            );
            setShowStatusDialog(false);
        } catch {
            toast.error(
                `Failed to ${newStatus === "active" ? "activate" : "suspend"} user`
            );
        }
    };

    const handleDelete = async () => {
        try {
            await deleteUser.mutateAsync(user._id);
            toast.success("User deleted successfully");
            setShowDeleteDialog(false);
        } catch {
            toast.error("Failed to delete user");
        }
    };

    const isActive = user.status === "active";
    const canModify = user.status !== "deleted";

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleViewOrders}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Orders
                    </DropdownMenuItem>

                    {canModify && (
                        <>
                            <DropdownMenuItem
                                onClick={() => setShowStatusDialog(true)}
                            >
                                {isActive ? (
                                    <>
                                        <Ban className="mr-2 h-4 w-4" />
                                        Suspend User
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Activate User
                                    </>
                                )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Change Confirmation Dialog */}
            <AlertDialog
                open={showStatusDialog}
                onOpenChange={setShowStatusDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isActive ? "Suspend" : "Activate"} User
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to{" "}
                            {isActive ? "suspend" : "activate"}{" "}
                            <strong>{user.fullName}</strong>?
                            {isActive &&
                                " The user will not be able to access their account while suspended."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleToggleStatus}
                            disabled={updateStatus.isPending}
                        >
                            {updateStatus.isPending
                                ? "Processing..."
                                : isActive
                                  ? "Suspend"
                                  : "Activate"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{user.fullName}</strong>? This action cannot
                            be undone. All user data will be permanently
                            removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteUser.isPending}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {deleteUser.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
