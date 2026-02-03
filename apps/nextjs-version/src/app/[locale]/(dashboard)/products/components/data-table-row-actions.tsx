"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
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
import { toast } from "sonner";

interface DataTableRowActionsProps {
  row: Row<Product>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const t = useTranslations("Products");
  const product = row.original;
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateProductStatus();

  const handleToggleStatus = () => {
    updateStatus({
      productId: product._id,
      isAvailable: !product.isAvailable,
    });
  };

  const handleDelete = () => {
    deleteProduct(product._id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(t("details.copySuccess"));
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
          <DropdownMenuLabel>{t("details.actions")}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleCopyId(product._id)}>
            <Copy />
            {t("details.copyId")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDetailsDialog(true)}
            disabled={!product.isAvailable}
          >
            <Eye />
            {t("details.viewDetails")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowEditDialog(true)}
            disabled={!product.isAvailable}
          >
            <Pencil />
            {t("details.editProduct")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
          >
            {product.isAvailable ? (
              <>
                <Ban />
                {t("details.deactivate")}
              </>
            ) : (
              <>
                <CheckCircle />
                {t("details.activate")}
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 />
            {t("details.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductDetailsDialog
        productId={product._id}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <EditProductDialog
        productId={product._id}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("details.deleteConfirmationTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("details.deleteConfirmationDescription", {
                name: product.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("details.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? t("details.deleting") : t("details.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
