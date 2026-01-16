"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateProductForm } from "./create-product-form";
import { useProduct } from "@/hooks/use-products";
import { Loader2 } from "lucide-react";

interface EditProductDialogProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({
  productId,
  open,
  onOpenChange,
}: EditProductDialogProps) {
  const { product, isLoading } = useProduct(open ? productId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Make changes to your product details.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <CreateProductForm
            onSuccess={() => onOpenChange(false)}
            initialData={product}
            productId={productId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
