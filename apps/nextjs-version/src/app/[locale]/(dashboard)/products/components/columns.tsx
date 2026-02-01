/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Product } from "@/types/product";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableRowActions } from "./data-table-row-actions";
/** Extract a usable first image URL from API shapes:
 * - ["https://..."]
 * - ["[\"https://...\"]"]  (your case)
 * - ["\"https://...\""]
 * - "https://..."
 * - []
 */
function getFirstImageUrl(images: unknown): string {
  if (!images) return "";

  // If backend ever returns a string directly
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return String(parsed[0] ?? "");
      return String(parsed ?? "");
    } catch {
      return images;
    }
  }

  // Normal case: string[]
  if (Array.isArray(images)) {
    const first = images[0];
    if (!first) return "";

    if (typeof first === "string") {
      const trimmed = first.trim();

      // Might be a JSON string: ["url"] or "url"
      if (trimmed.startsWith("[") || trimmed.startsWith('"')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return String(parsed[0] ?? "");
          return String(parsed ?? "");
        } catch {
          return first;
        }
      }

      return first;
    }

    // If array contains non-string (rare)
    return String(first);
  }

  return "";
}

const ProductImage = ({ row }: { row: any }) => {
  const name = (row.getValue("name") as string) || "PR";
  const imageUrl = getFirstImageUrl(row.getValue("images"));

  return (
    <Avatar className="h-10 w-10 rounded-md border">
      <AvatarImage src={imageUrl} alt={name} className="object-cover" />
      <AvatarFallback className="rounded-md">
        {name.substring(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

export const columns: ColumnDef<Product>[] = [
  // SELECT
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // IMAGE
  {
    accessorKey: "images",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => <ProductImage row={row} />,
    enableSorting: false,
  },

  // NAME + CATEGORY
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => {
      const category = row.original.category ?? row.original.categoryId;

      return (
        <div className="flex flex-col gap-0.5 min-w-[220px]">
          <span
            className="font-medium truncate max-w-[260px]"
            title={row.getValue("name")}
          >
            {row.getValue("name")}
          </span>

          <div className="flex items-center gap-2">
            {category?.name && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {category?.icon ? <span>{category.icon}</span> : null}
                <span className="truncate max-w-[200px]">{category.name}</span>
              </span>
            )}

            {row.original.slug && (
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                /{row.original.slug}
              </span>
            )}
          </div>
        </div>
      );
    },
  },

  // PRICE
  {
    accessorKey: "basePrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const raw = row.getValue("basePrice");
      const price = typeof raw === "number" ? raw : Number(raw ?? 0);

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.original.currency || "USD",
      }).format(Number.isFinite(price) ? price : 0);

      return <div className="font-medium whitespace-nowrap">{formatted}</div>;
    },
  },

  // STATUS
  {
    accessorKey: "isAvailable",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isAvailable = row.getValue("isAvailable") as boolean;
      return (
        <Badge variant={isAvailable ? "default" : "destructive"}>
          {isAvailable ? "Available" : "Unavailable"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) ? "available" : "unavailable";
      return value.includes(rowValue);
    },
  },

  // FLAGS (Featured / Best-selling)
  {
    id: "flags",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Flags" />
    ),
    cell: ({ row }) => {
      const featured = Boolean(row.original.isFeatured);
      const best = Boolean(row.original.isBestSelling);

      if (!featured && !best)
        return <span className="text-muted-foreground">-</span>;

      return (
        <div className="flex flex-wrap gap-1">
          {featured ? <Badge variant="secondary">Featured</Badge> : null}
          {best ? <Badge variant="outline">Best Selling</Badge> : null}
        </div>
      );
    },
    enableSorting: false,
    filterFn: (row, id, value) => {
      const isFeatured = row.original.isFeatured;
      const isBestSelling = row.original.isBestSelling;

      if (value.includes("featured") && isFeatured) return true;
      if (value.includes("best-selling") && isBestSelling) return true;
      return false;
    },
  },

  // RATING
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number | undefined;
      const reviews = row.original.totalReviews ?? 0;

      if (rating === undefined || rating === null) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span>⭐</span>
          <span>{Number(rating).toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>
      );
    },
  },

  // PREP TIME
  {
    accessorKey: "preparationTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prep" />
    ),
    cell: ({ row }) => {
      const t = row.getValue("preparationTime") as number | undefined;
      if (t === undefined || t === null)
        return <span className="text-muted-foreground">-</span>;
      return <span className="whitespace-nowrap">{t} min</span>;
    },
  },

  // CALORIES (optional)
  {
    accessorKey: "calories",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Calories" />
    ),
    cell: ({ row }) => {
      const c = row.getValue("calories") as number | undefined;
      if (c === undefined || c === null)
        return <span className="text-muted-foreground">-</span>;
      return <span className="whitespace-nowrap">{c} kcal</span>;
    },
  },

  // TAGS (compact)
  {
    accessorKey: "tags",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    cell: ({ row }) => {
      const tags = (row.getValue("tags") as string[] | undefined) ?? [];
      if (!tags.length) return <span className="text-muted-foreground">-</span>;

      const shown = tags.slice(0, 2);
      const remaining = tags.length - shown.length;

      return (
        <div className="flex flex-wrap gap-1">
          {shown.map((t) => (
            <Badge key={t} variant="outline" className="font-normal">
              {t}
            </Badge>
          ))}
          {remaining > 0 ? (
            <span className="text-xs text-muted-foreground">+{remaining}</span>
          ) : null}
        </div>
      );
    },
    enableSorting: false,
  },

  // DISPLAY ORDER
  {
    accessorKey: "displayOrder",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order" />
    ),
    cell: ({ row }) => {
      const v = row.getValue("displayOrder") as number | undefined;
      return <span className="text-muted-foreground">{v ?? "-"}</span>;
    },
  },

  // CREATED
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}
      </span>
    ),
  },

  // UPDATED (nice for admin tables)
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {format(new Date(row.getValue("updatedAt")), "MMM d, yyyy")}
      </span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
