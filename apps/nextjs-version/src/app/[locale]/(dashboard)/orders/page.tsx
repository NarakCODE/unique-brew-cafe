"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Eye,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  Store,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { apiClient } from "@/lib/api-client";
import { ApiErrorResponse, ApiResponse } from "@/types/api";
import { useTranslations } from "next-intl";

type OrderStatus =
  | "received"
  | "pending_payment"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "completed"
  | "cancelled";

type StatusFilter = "all" | OrderStatus;

interface OrderListItem {
  id?: string;
  _id?: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  estimatedReadyTime?: string;
  notes?: string;
  userId:
    | string
    | {
        _id?: string;
        id?: string;
        fullName?: string;
        email?: string;
        phoneNumber?: string;
      };
  storeId:
    | string
    | {
        _id?: string;
        id?: string;
        name?: string;
        city?: string;
        phone?: string;
      };
}

interface OrderItem {
  id?: string;
  _id?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  customization?: {
    size?: string;
    sugarLevel?: string;
    iceLevel?: string;
    coffeeLevel?: string;
  };
}

interface OrderDetail extends OrderListItem {
  items: OrderItem[];
}

interface OrderTracking {
  orderNumber: string;
  status: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    notes?: string;
  }>;
  estimatedReadyTime?: string;
  actualReadyTime?: string;
  pickedUpAt?: string;
}

interface OrdersQueryPayload {
  items: OrderListItem[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

const ORDER_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "received", label: "Received" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Order Received",
  pending_payment: "Pending Payment",
  confirmed: "Order Confirmed",
  preparing: "Preparing",
  ready: "Order Ready",
  picked_up: "Picked Up",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusVariant = (
  status: OrderStatus,
): "default" | "secondary" | "outline" | "destructive" => {
  if (status === "cancelled") return "destructive";
  if (status === "ready" || status === "completed") return "default";
  if (status === "received" || status === "pending_payment") return "secondary";
  return "outline";
};

const getOrderId = (order: { id?: string; _id?: string }) =>
  order.id || order._id || "";

const getOrderTransitions = (status: OrderStatus): OrderStatus[] => {
  switch (status) {
    case "received":
      return ["confirmed", "cancelled"];
    case "pending_payment":
      return ["confirmed", "cancelled"];
    case "confirmed":
      return ["preparing", "ready", "cancelled"];
    case "preparing":
      return ["ready", "cancelled"];
    case "ready":
      return ["picked_up", "completed"];
    case "picked_up":
      return ["completed"];
    default:
      return [];
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);

const formatDateTime = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString();
};

const formatCustomer = (user: OrderListItem["userId"]) => {
  if (typeof user === "string")
    return { name: "Unknown customer", email: user };
  return {
    name: user.fullName || "Unknown customer",
    email: user.email || "No email",
    phoneNumber: user.phoneNumber || "No phone",
  };
};

const formatStore = (store: OrderListItem["storeId"]) => {
  if (typeof store === "string") return { name: "Unknown store", city: store };
  return {
    name: store.name || "Unknown store",
    city: store.city || "No city",
    phone: store.phone || "No phone",
  };
};

async function getOrders({
  status,
  page,
}: {
  status: StatusFilter;
  page: number;
}): Promise<ApiResponse<OrdersQueryPayload>> {
  const query = new URLSearchParams({
    page: String(page),
    limit: "20",
  });

  if (status !== "all") {
    query.set("status", status);
  }

  return apiClient.get(`/orders?${query.toString()}`);
}

async function getOrderDetail(
  orderId: string,
): Promise<ApiResponse<OrderDetail>> {
  return apiClient.get(`/orders/${orderId}`);
}

async function getOrderTracking(
  orderId: string,
): Promise<ApiResponse<OrderTracking>> {
  return apiClient.get(`/orders/${orderId}/tracking`);
}

async function patchOrderStatus({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}): Promise<ApiResponse<OrderListItem>> {
  return apiClient.patch(`/orders/${orderId}/status`, { status });
}

function OrdersPage() {
  const tCommon = useTranslations("Common");
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [pendingStatuses, setPendingStatuses] = useState<
    Record<string, OrderStatus>
  >({});

  const ordersQuery = useQuery({
    queryKey: ["admin-orders", statusFilter, page],
    queryFn: () => getOrders({ status: statusFilter, page }),
    placeholderData: keepPreviousData,
  });

  const selectedOrderQuery = useQuery({
    queryKey: ["admin-order-detail", selectedOrderId],
    queryFn: () => getOrderDetail(selectedOrderId!),
    enabled: !!selectedOrderId,
  });

  const selectedTrackingQuery = useQuery({
    queryKey: ["admin-order-tracking", selectedOrderId],
    queryFn: () => getOrderTracking(selectedOrderId!),
    enabled: !!selectedOrderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: patchOrderStatus,
    onSuccess: (response, variables) => {
      const orderId = variables.orderId;
      const nextStatus = response.data.status;

      toast.success(`Order moved to ${STATUS_LABELS[nextStatus]}.`);
      setPendingStatuses((current) => {
        const updated = { ...current };
        delete updated[orderId];
        return updated;
      });

      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-order-detail", orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-order-tracking", orderId],
      });
    },
    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || "Failed to update order status.");
    },
  });

  const orders = useMemo(
    () => ordersQuery.data?.data.items ?? [],
    [ordersQuery.data?.data.items],
  );
  const pagination = ordersQuery.data?.data.pagination;

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) => {
      const customer = formatCustomer(order.userId);
      const store = formatStore(order.storeId);

      return [order.orderNumber, customer.name, customer.email, store.name]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [orders, search]);

  const stats = useMemo(() => {
    const received = orders.filter(
      (order) => order.status === "received",
    ).length;
    const inProgress = orders.filter((order) =>
      ["confirmed", "preparing"].includes(order.status),
    ).length;
    const ready = orders.filter((order) => order.status === "ready").length;
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);

    return [
      {
        title: "Visible Orders",
        value: String(pagination?.total ?? orders.length),
        description: "Orders in the current result set.",
        icon: ClipboardList,
      },
      {
        title: "Waiting Confirmation",
        value: String(received),
        description: "New orders still waiting on the store.",
        icon: CheckCircle2,
      },
      {
        title: "Being Prepared",
        value: String(inProgress),
        description: "Orders that staff are actively handling.",
        icon: ChefHat,
      },
      {
        title: "Ready for Pickup",
        value: String(ready),
        description: `${formatCurrency(revenue)} total visible revenue.`,
        icon: PackageCheck,
      },
    ];
  }, [orders, pagination?.total]);

  const selectedOrder = selectedOrderQuery.data?.data;
  const selectedTracking = selectedTrackingQuery.data?.data;

  const handleStatusFilterChange = (value: string) => {
    const nextValue = (value || "all") as StatusFilter;
    setStatusFilter(nextValue);
    setPage(1);
  };

  const handleStageStatus = (orderId: string, value: string) => {
    setPendingStatuses((current) => ({
      ...current,
      [orderId]: value as OrderStatus,
    }));
  };

  const handleApplyStatus = (order: OrderListItem) => {
    const orderId = getOrderId(order);
    const nextStatus = pendingStatuses[orderId];

    if (!orderId || !nextStatus || nextStatus === order.status) {
      return;
    }

    updateStatusMutation.mutate({
      orderId,
      status: nextStatus,
    });
  };

  const hasOrders = filteredOrders.length > 0;

  return (
    <>
      <div className="flex h-full flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <PageHeader
            title={tCommon("orders")}
            description="Monitor live orders, inspect customer details, and move each order through the admin status flow."
          />

          <Button
            variant="outline"
            onClick={() => ordersQuery.refetch()}
            disabled={ordersQuery.isFetching}
          >
            {ordersQuery.isFetching ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <RefreshCw data-icon="inline-start" />
            )}
            Refresh
          </Button>
        </div>

        {ordersQuery.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load orders</AlertTitle>
            <AlertDescription>
              {(ordersQuery.error as unknown as ApiErrorResponse)?.message ||
                "The dashboard could not reach the orders endpoint."}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <CardDescription>{stat.title}</CardDescription>
                  <CardTitle className="text-2xl">{stat.value}</CardTitle>
                </div>
                <stat.icon className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Order Queue</CardTitle>
              <CardDescription>
                Filter the admin queue by status and update each order from the
                same screen.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <ToggleGroup
                type="single"
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
                variant="outline"
                size="sm"
                className="w-full flex-wrap justify-start lg:w-auto"
              >
                {ORDER_FILTERS.map((filter) => (
                  <ToggleGroupItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <div className="relative w-full lg:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by order, customer, or store"
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {ordersQuery.isLoading ? (
              <TableSkeleton rows={8} columns={7} />
            ) : !hasOrders ? (
              <Empty className="min-h-[420px] border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ClipboardList />
                  </EmptyMedia>
                  <EmptyTitle>No orders found</EmptyTitle>
                  <EmptyDescription>
                    There are no orders matching the current status filter or
                    search query.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter("all");
                      setSearch("");
                    }}
                  >
                    Reset Filters
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Store</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const orderId = getOrderId(order);
                        const customer = formatCustomer(order.userId);
                        const store = formatStore(order.storeId);
                        const transitions = getOrderTransitions(order.status);
                        const stagedStatus =
                          pendingStatuses[orderId] ||
                          transitions[0] ||
                          order.status;

                        return (
                          <TableRow key={orderId}>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">
                                  {order.orderNumber}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {order.paymentMethod.toUpperCase()} /{" "}
                                  {order.paymentStatus}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span>{customer.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {customer.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span>{store.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {store.city}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusVariant(order.status)}>
                                {STATUS_LABELS[order.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(order.total)}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span>{formatDateTime(order.createdAt)}</span>
                                <span className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(
                                    new Date(order.createdAt),
                                    {
                                      addSuffix: true,
                                    },
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedOrderId(orderId)}
                                >
                                  <Eye data-icon="inline-start" />
                                  View
                                </Button>
                                {transitions.length > 0 ? (
                                  <>
                                    <Select
                                      value={stagedStatus}
                                      onValueChange={(value) =>
                                        handleStageStatus(orderId, value)
                                      }
                                    >
                                      <SelectTrigger
                                        size="sm"
                                        className="min-w-40"
                                      >
                                        <SelectValue placeholder="Next status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectGroup>
                                          {transitions.map((status) => (
                                            <SelectItem
                                              key={status}
                                              value={status}
                                            >
                                              {STATUS_LABELS[status]}
                                            </SelectItem>
                                          ))}
                                        </SelectGroup>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApplyStatus(order)}
                                      disabled={
                                        updateStatusMutation.isPending &&
                                        updateStatusMutation.variables
                                          ?.orderId === orderId
                                      }
                                    >
                                      {updateStatusMutation.isPending &&
                                      updateStatusMutation.variables
                                        ?.orderId === orderId ? (
                                        <Loader2
                                          data-icon="inline-start"
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <CheckCircle2 data-icon="inline-start" />
                                      )}
                                      Update
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    Final state
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination?.page ?? page} of {pagination?.pages ?? 1}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      disabled={
                        (pagination?.page ?? page) <= 1 ||
                        ordersQuery.isFetching
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((current) => current + 1)}
                      disabled={
                        !!pagination?.pages &&
                        (pagination.page ?? page) >= pagination.pages
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!selectedOrderId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrderId(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-[calc(100vw-1rem)] gap-4 p-4 sm:max-w-4xl sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder?.orderNumber || "Order details"}
            </DialogTitle>
            <DialogDescription>
              Review line items, customer information, and the order timeline
              before updating status.
            </DialogDescription>
          </DialogHeader>

          {selectedOrderId &&
          (selectedOrderQuery.isLoading || selectedTrackingQuery.isLoading) ? (
            <TableSkeleton rows={4} columns={4} />
          ) : selectedOrderQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load this order</AlertTitle>
              <AlertDescription>
                {(selectedOrderQuery.error as unknown as ApiErrorResponse)
                  ?.message || "The selected order could not be loaded."}
              </AlertDescription>
            </Alert>
          ) : selectedOrder ? (
            <ScrollArea className="max-h-[calc(90vh-7rem)] pr-2">
              <div className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="gap-2">
                      <CardDescription>Customer</CardDescription>
                      <CardTitle className="text-base">
                        {formatCustomer(selectedOrder.userId).name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <UserRound className="size-4" />
                        <span>
                          {formatCustomer(selectedOrder.userId).email}
                        </span>
                      </div>
                      <span>
                        {formatCustomer(selectedOrder.userId).phoneNumber}
                      </span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="gap-2">
                      <CardDescription>Store</CardDescription>
                      <CardTitle className="text-base">
                        {formatStore(selectedOrder.storeId).name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Store className="size-4" />
                        <span>{formatStore(selectedOrder.storeId).city}</span>
                      </div>
                      <span>{formatStore(selectedOrder.storeId).phone}</span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="gap-2">
                      <CardDescription>Fulfillment</CardDescription>
                      <CardTitle className="text-base">
                        <Badge variant={statusVariant(selectedOrder.status)}>
                          {STATUS_LABELS[selectedOrder.status]}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <span>
                        Created: {formatDateTime(selectedOrder.createdAt)}
                      </span>
                      <span>
                        ETA:{" "}
                        {formatDateTime(
                          selectedTracking?.estimatedReadyTime ||
                            selectedOrder.estimatedReadyTime,
                        )}
                      </span>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Items</h3>
                    <span className="text-sm text-muted-foreground">
                      {selectedOrder.items.length} line item(s)
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-lg border">
                    <Table className="min-w-[720px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Customization</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item) => {
                          const itemId =
                            item.id ||
                            item._id ||
                            `${item.productName}-${item.quantity}`;
                          const customization = Object.entries(
                            item.customization || {},
                          )
                            .filter(([, value]) => value)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(" • ");

                          return (
                            <TableRow key={itemId}>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <span>{item.productName}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {item.notes || "No item notes"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {customization || "Default preparation"}
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>
                                {formatCurrency(item.unitPrice)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(item.totalPrice)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Status timeline
                      </CardTitle>
                      <CardDescription>
                        Every admin status transition is recorded in the
                        tracking log.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      {selectedTracking?.statusHistory?.length ? (
                        selectedTracking.statusHistory.map((entry, index) => (
                          <div
                            key={`${entry.status}-${entry.timestamp}-${index}`}
                            className="flex gap-3"
                          >
                            <div className="mt-1 flex flex-col items-center">
                              <span className="size-2 rounded-full bg-primary" />
                              {index <
                              selectedTracking.statusHistory.length - 1 ? (
                                <span className="mt-2 h-full w-px bg-border" />
                              ) : null}
                            </div>
                            <div className="flex flex-1 flex-col gap-1 pb-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={statusVariant(entry.status)}>
                                  {STATUS_LABELS[entry.status]}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {formatDateTime(entry.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {entry.notes || "No notes on this transition."}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No tracking history available for this order yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Order summary</CardTitle>
                      <CardDescription>
                        Operational totals and special notes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatCurrency(selectedOrder.tax)}</span>
                      </div>
                      <div className="flex items-center justify-between font-medium">
                        <span>Total</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                      </div>
                      <Separator />
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">
                          Order notes
                        </span>
                        <p>
                          {selectedOrder.notes || "No order notes provided."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OrdersPage;
