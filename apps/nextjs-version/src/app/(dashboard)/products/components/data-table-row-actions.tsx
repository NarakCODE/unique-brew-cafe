"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Ban,
  CheckCircle,
} from "lucide-react";

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
import { Product } from "@/types/product";
import { ProductDetailsDialog } from "./product-details-dialog";
import { EditProductDialog } from "./edit-product-dialog";
import { useDeleteProduct, useUpdateProductStatus } from "@/hooks/use-products";

interface DataTableRowActionsProps {
  row: Row<Product>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const product = row.original;
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateProductStatus();

  const handleDelete = () => {
    deleteProduct(product.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  const handleToggleStatus = () => {
    updateStatus({ productId: product.id, isAvailable: !product.isAvailable });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(product.id)}
          >
            <Copy />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
            <Eye />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil />
            Edit product
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
          >
            {product.isAvailable ? (
              <>
                <Ban />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductDetailsDialog
        productId={product.id}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <EditProductDialog
        productId={product.id}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product "{product.name}" and remove its data from our servers.
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
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
