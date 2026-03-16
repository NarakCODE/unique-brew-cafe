import { useCallback } from "react";
import type { Announcement } from "../../../../packages/api/src";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnnouncementItem } from "@/components/announcement/announcement-item";
import { Card, CardContent } from "@/components/ui/card";
import {
  DEFAULT_EMPTY_ILLUSTRATION,
  EmptyState,
} from "@/components/ui/empty-state";
import { useAnnouncements } from "@/hooks/use-announcements";

type AnnouncementListProps = {
  limit?: number;
};

export function AnnouncementList({ limit }: AnnouncementListProps) {
  const { data, isLoading, isError, error, isRefetching, refetch } =
    useAnnouncements(limit);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isPreview = typeof limit === "number";

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const renderAnnouncementItem = useCallback(
    ({ item }: { item: Announcement }) => <AnnouncementItem announcement={item} />,
    [],
  );

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  if (isLoading) {
    return (
      <View className="gap-4">
        {Array.from({ length: Math.min(limit ?? 2, 2) }).map((_, index) => (
          <Card
            key={`announcement-loading-${index}`}
            className="rounded-3xl border border-border bg-card py-0"
          >
            <CardContent className="gap-3 px-5 py-5">
              <View className="h-5 w-2/3 rounded-full bg-muted" />
              <View className="h-4 w-full rounded-full bg-muted" />
              <View className="h-4 w-5/6 rounded-full bg-muted" />
            </CardContent>
          </Card>
        ))}
      </View>
    );
  }

  if (isPreview && isError) {
    return (
      <EmptyState
        title="Unable to load announcements"
        description={error.message}
        variant="error"
      />
    );
  }

  if (isPreview && !data?.items.length) {
    return (
      <EmptyState
        title="No announcements yet"
        description="New updates will appear here when they are published."
        illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
        centered
      />
    );
  }

  if (isPreview) {
    return (
      <View className="gap-5">
        {data?.items.map((announcement) => (
          <AnnouncementItem key={announcement.id} announcement={announcement} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={data?.items ?? []}
      renderItem={renderAnnouncementItem}
      keyExtractor={keyExtractor}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: 8,
        paddingBottom: insets.bottom + 28,
        paddingHorizontal: 16,
      }}
      ItemSeparatorComponent={AnnouncementSeparator}
      ListEmptyComponent={
        <AnnouncementListState
          isError={isError}
          errorMessage={error?.message}
        />
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

function AnnouncementListState({
  isError,
  errorMessage,
}: {
  isError: boolean;
  errorMessage?: string;
}) {
  if (isError) {
    return (
      <EmptyState
        title="Unable to load announcements"
        description={errorMessage}
        variant="error"
      />
    );
  }

  return (
    <EmptyState
      title="No announcements yet"
      description="New updates will appear here when they are published."
      illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
      centered
    />
  );
}

function AnnouncementSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  separator: {
    height: 20,
  },
});
