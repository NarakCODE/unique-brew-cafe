"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateProductForm } from "./create-product-form";

interface CreateProductDialogProps {
  children?: React.ReactNode;
}

export function CreateProductDialog({ children }: CreateProductDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus />
            Create Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your catalogue. Fill in all required fields.
          </DialogDescription>
        </DialogHeader>

        {/* Pass the close handler to the form */}
        <CreateProductForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
