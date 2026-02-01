"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCategory } from "@/hooks/use-category";
import { useStore } from "@/hooks/use-store";
import { format } from "date-fns";
import { Loader2, Store as StoreIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/badge-styles";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface CategoryDetailsDialogProps {
  categoryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryDetailsDialog({
  categoryId,
  open,
  onOpenChange,
}: CategoryDetailsDialogProps) {
  const t = useTranslations("Categories.details");
  const tCommon = useTranslations("Categories");
  const { data: category, isLoading: isLoadingCategory } = useCategory(
    categoryId || "",
    open,
  );

  // Use category?.storeId directly for the store query
  // We don't wait for category to be loaded in the hook definition,
  // but the hook handles undefined/null IDs gracefully by being disabled
  const { store, isLoading: isLoadingStore } = useStore(
    category?.storeId || "",
  );

  const isLoading = isLoadingCategory;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : category ? (
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-3xl">
                {category.icon}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-xl">{category.name}</h3>
                <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {category.slug}
                </code>
              </div>
              <div className="ml-auto">
                <Badge
                  variant="secondary"
                  className={cn(
                    "capitalize",
                    getStatusColor(category.isActive ? "active" : "inactive"),
                  )}
                >
                  {category.isActive ? tCommon("active") : tCommon("inactive")}
                </Badge>
              </div>
            </div>

            <div className="grid gap-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                {tCommon("descriptionLabel")}
              </h4>
              <p className="text-sm">{category.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <h4 className="font-medium text-sm text-muted-foreground">
                  {t("displayOrder")}
                </h4>
                <p className="text-sm">{category.displayOrder}</p>
              </div>
              <div className="grid gap-1">
                <h4 className="font-medium text-sm text-muted-foreground">
                  {tCommon("created")}
                </h4>
                <p className="text-sm">
                  {format(new Date(category.createdAt), "PPP")}
                </p>
              </div>
            </div>

            {category.updatedAt && (
              <div className="grid gap-1">
                <h4 className="font-medium text-sm text-muted-foreground">
                  {t("lastUpdated")}
                </h4>
                <p className="text-sm">
                  {format(new Date(category.updatedAt), "PPP")}
                </p>
              </div>
            )}

            {/* Store Information Section */}
            <div className="border-t pt-4 mt-2">
              <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <StoreIcon className="h-4 w-4" />
                {t("storeInformation")}
              </h4>

              {isLoadingStore ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : store ? (
                <div className="grid gap-2 text-sm">
                  {store.imageUrl ? (
                    <div className="mb-4">
                      <div className="relative h-40 w-full overflow-hidden rounded-md border">
                        {/* Using standard img tag for external URLs without specific domain config in next.config */}
                        <Image
                          src={store.imageUrl}
                          alt={store.name}
                          width={300}
                          height={300}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">
                      {t("storeName")}:
                    </span>
                    <span className="col-span-2 font-medium">{store.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">
                      {t("storeCity")}:
                    </span>
                    <span className="col-span-2">{store.city}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">
                      {t("storePhone")}:
                    </span>
                    <span className="col-span-2">{store.phone}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {t("storeNotAvailable")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            {t("categoryNotFound")}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
