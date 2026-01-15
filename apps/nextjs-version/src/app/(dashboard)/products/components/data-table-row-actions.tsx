"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "@/types/product";
import { ProductDetailsDialog } from "./product-details-dialog";

interface DataTableRowActionsProps {
  row: Row<Product>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const product = row.original;

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
            <Copy className="mr-2 h-4 w-4" />
            Copy product ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil className="mr-2 h-4 w-4" />
            Edit product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductDetailsDialog
        productId={product.id}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
    </>
  );
}
