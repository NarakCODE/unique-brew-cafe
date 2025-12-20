"use client";

import { useState } from "react";
import {
    MoreHorizontal,
    Copy,
    Edit,
    Trash,
    Power,
    CopyPlus,
} from "lucide-react";
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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

import { Product } from "@/types";
import {
    useDeleteProduct,
    useUpdateProductStatus,
    useDuplicateProduct,
} from "@/hooks/use-products";

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const product = row.original as Product;
    const router = useRouter();
    const deleteMutation = useDeleteProduct();
    const updateStatusMutation = useUpdateProductStatus();
    const duplicateMutation = useDuplicateProduct();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleCopyId = () => {
        navigator.clipboard.writeText(product.id);
        toast.success("Product ID copied to clipboard");
    };

    const handleDelete = () => {
        deleteMutation.mutate(product.id, {
            onSuccess: () => setShowDeleteDialog(false),
        });
    };

    const handleToggleStatus = () => {
        updateStatusMutation.mutate({
            id: product.id,
            isAvailable: !product.isAvailable,
        });
    };

    const handleDuplicate = () => {
        duplicateMutation.mutate(product.id);
    };

    return (
        <>
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the product <strong>{product.name}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending
                                ? "Deleting..."
                                : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={handleCopyId}>
                        <Copy className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => router.push(`/products/${product.id}`)}
                    >
                        <Edit className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate}>
                        <CopyPlus className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleStatus}>
                        <Power className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        {product.isAvailable
                            ? "Set Unavailable"
                            : "Set Available"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
