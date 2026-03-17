import { useCallback } from "react";
import type { Order } from "../../../../packages/api/src";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AccountActionHeader } from "@/components/account/account-action-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DEFAULT_EMPTY_ILLUSTRATION,
  EmptyState,
} from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { useOrders } from "@/hooks/use-orders";

export default function OrderHistoryScreen() {
  const { data, isLoading, isError, error, isRefetching, refetch } =
    useOrders();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => <OrderHistoryItem order={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Order) => item.id, []);

  if (isLoading) {
    return (
      <View className="gap-4 px-4 pt-2">
        <AccountActionHeader title="History" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={`order-history-loading-${index}`}
            className="rounded-3xl border border-border bg-card py-0"
          >
            <CardContent className="gap-4 px-5 py-5">
              <View className="h-5 w-1/2 rounded-full bg-muted" />
              <View className="h-4 w-2/3 rounded-full bg-muted" />
              <View className="h-4 w-full rounded-full bg-muted" />
              <View className="h-4 w-5/6 rounded-full bg-muted" />
            </CardContent>
          </Card>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={data?.items ?? []}
      renderItem={renderOrderItem}
      keyExtractor={keyExtractor}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: 8,
        paddingBottom: insets.bottom + 28,
        paddingHorizontal: 16,
      }}
      ItemSeparatorComponent={OrderHistorySeparator}
      ListHeaderComponent={
        <View className="mb-4 pt-2">
          <AccountActionHeader title="History" />
        </View>
      }
      ListEmptyComponent={
        <OrderHistoryState isError={isError} errorMessage={error?.message} />
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          tintColor={colorScheme === "dark" ? "#F5F5F5" : "#5A3421"}
        />
      }
    />
  );
}

function OrderHistoryItem({ order }: { order: Order }) {
  return (
    <Card className="rounded-3xl border border-border bg-card py-0">
      <CardContent className="gap-4 px-5 py-5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">
              {order.store.name}
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              {order.orderNumber}
            </Text>
          </View>

          <Badge
            variant={getStatusBadgeVariant(order.status)}
            className="rounded-full px-3 py-1"
          >
            <Text>{formatStatusLabel(order.status)}</Text>
          </Badge>
        </View>

        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-muted-foreground">Placed</Text>
            <Text className="mt-1 text-sm font-medium text-foreground">
              {formatDateTime(order.createdAt)}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-sm text-muted-foreground">Total</Text>
            <Text className="mt-1 text-lg font-semibold text-foreground">
              {formatCurrency(order.total, order.currency)}
            </Text>
          </View>
        </View>

        <View className="rounded-2xl bg-muted/50 px-4 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">Payment</Text>
            <Text className="text-sm font-medium text-foreground">
              {formatStatusLabel(order.paymentStatus)}
            </Text>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">Method</Text>
            <Text className="text-sm font-medium text-foreground">
              {formatStatusLabel(order.paymentMethod)}
            </Text>
          </View>

          {order.estimatedReadyTime ? (
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">
                Estimated ready
              </Text>
              <Text className="text-sm font-medium text-foreground">
                {formatDateTime(order.estimatedReadyTime)}
              </Text>
            </View>
          ) : null}
        </View>

        {order.notes ? (
          <View>
            <Text className="text-sm text-muted-foreground">Notes</Text>
            <Text className="mt-1 text-sm leading-6 text-foreground">
              {order.notes}
            </Text>
          </View>
        ) : null}
      </CardContent>
    </Card>
  );
}

function OrderHistoryState({
  isError,
  errorMessage,
}: {
  isError: boolean;
  errorMessage?: string;
}) {
  if (isError) {
    return (
      <EmptyState
        title="Unable to load orders"
        description={errorMessage}
        variant="error"
      />
    );
  }

  return (
    <EmptyState
      title="No orders yet"
      description="Your completed and active cafe orders will appear here."
      illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
      centered
    />
  );
}

function OrderHistorySeparator() {
  return <View style={styles.separator} />;
}

function formatStatusLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function getStatusBadgeVariant(
  status: string,
): "default" | "secondary" | "outline" {
  if (status === "picked_up" || status === "completed") {
    return "default";
  }

  if (status === "cancelled") {
    return "outline";
  }

  return "secondary";
}

const styles = StyleSheet.create({
  separator: {
    height: 16,
  },
});
