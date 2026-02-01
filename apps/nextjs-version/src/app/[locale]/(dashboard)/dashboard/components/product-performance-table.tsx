"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ProductPerformanceItem } from "@/types/report";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations, useFormatter } from "next-intl";

interface ProductPerformanceTableProps {
  data?: ProductPerformanceItem[];
  isLoading?: boolean;
}

export function ProductPerformanceTable({
  data = [],
  isLoading,
}: ProductPerformanceTableProps) {
  const t = useTranslations("Dashboard.ProductTable");
  const format = useFormatter();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("productName")}</TableHead>
              <TableHead className="text-right">{t("quantitySold")}</TableHead>
              <TableHead className="text-right">{t("revenue")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">
                    {format.number(item.quantitySold)}
                  </TableCell>
                  <TableCell className="text-right">
                    {format.number(item.revenue, {
                      style: "currency",
                      currency: "USD",
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  {t("noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
