"use client";

import { useState } from "react";
import { Trash2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useDeleteProduct, useUpdateProductStatus } from "@/hooks/use-products";
import { toast } from "sonner";

interface BulkActionsProps {
    selectedIds: string[];
    selectedProducts: Array<{ id: string; name: string; isAvailable: boolean }>;
    onClearSelection: () => void;
}

export function BulkActions({
    selectedIds,
    selectedProducts,
    onClearSelection,
}: BulkActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [bulkAction, setBulkAction] = useState<
        "delete" | "activate" | "deactivate" | null
    >(null);
    const deleteProduct = useDeleteProduct();
    const updateStatus = useUpdateProductStatus();

    if (selectedIds.length === 0) return null;

    console.log(bulkAction);

    const handleBulkDelete = async () => {
        try {
            for (const id of selectedIds) {
                await deleteProduct.mutateAsync(id);
            }
            toast.success(`Deleted ${selectedIds.length} product(s)`);
            onClearSelection();
            setShowDeleteDialog(false);
        } catch (error) {
            toast.error(`Failed to delete some products ${error}`);
        }
    };

    const handleBulkStatusChange = async (isAvailable: boolean) => {
        try {
            for (const id of selectedIds) {
                await updateStatus.mutateAsync({ id, isAvailable });
            }
            toast.success(
                `${isAvailable ? "Activated" : "Deactivated"} ${selectedIds.length} product(s)`
            );
            onClearSelection();
        } catch (error) {
            toast.error("Failed to update some products");
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                <span className="text-sm font-medium">
                    {selectedIds.length} selected
                </span>
                <div className="ml-auto flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkStatusChange(true)}
                        disabled={
                            deleteProduct.isPending || updateStatus.isPending
                        }
                    >
                        <Power className="mr-2 h-3.5 w-3.5" />
                        Activate
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkStatusChange(false)}
                        disabled={
                            deleteProduct.isPending || updateStatus.isPending
                        }
                    >
                        <PowerOff className="mr-2 h-3.5 w-3.5" />
                        Deactivate
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                            setBulkAction("delete");
                            setShowDeleteDialog(true);
                        }}
                        disabled={
                            deleteProduct.isPending || updateStatus.isPending
                        }
                    >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                    </Button>
                </div>
            </div>

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
                            delete <strong>{selectedIds.length}</strong>{" "}
                            product(s):
                            <ul className="mt-2 list-disc list-inside space-y-1">
                                {selectedProducts.slice(0, 5).map((product) => (
                                    <li key={product.id} className="text-sm">
                                        {product.name}
                                    </li>
                                ))}
                                {selectedProducts.length > 5 && (
                                    <li className="text-sm italic">
                                        and {selectedProducts.length - 5}{" "}
                                        more...
                                    </li>
                                )}
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleBulkDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteProduct.isPending}
                        >
                            {deleteProduct.isPending
                                ? "Deleting..."
                                : "Delete All"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
