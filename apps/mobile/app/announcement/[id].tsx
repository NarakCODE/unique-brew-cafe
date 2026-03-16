import { useHeaderHeight } from "@react-navigation/elements";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import {
  formatAnnouncementDate,
  resolveAnnouncementImageUrl,
} from "@/components/announcement/announcement-utils";
import { ScreenLayout } from "@/components/layout/screen-layout";
import { StableBackButton } from "@/components/navigation/stable-back-button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { useAnnouncement } from "@/hooks/use-announcement";

export default function AnnouncementDetailScreen() {
  const headerHeight = useHeaderHeight();
  const params = useLocalSearchParams<{ id?: string }>();
  const announcementId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading, isError, error } = useAnnouncement(announcementId);

  const header = (
    <Stack.Screen
      options={{
        title: "Announcement",
        headerBackVisible: false,
        gestureEnabled: true,
        headerLeft: ({ tintColor }) => (
          <StableBackButton tintColor={tintColor} />
        ),
      }}
    />
  );

  if (isLoading) {
    return (
      <>
        {header}
        <ScreenLayout
          contentClassName="px-4"
          topInsetOffset={headerHeight + 12}
        >
          <Card className="rounded-3xl border border-border bg-card py-0">
            <CardContent className="gap-4 px-5 py-5">
              <View className="h-64 rounded-2xl bg-muted" />
              <View className="h-6 w-3/4 rounded-full bg-muted" />
              <View className="h-4 w-full rounded-full bg-muted" />
              <View className="h-4 w-5/6 rounded-full bg-muted" />
            </CardContent>
          </Card>
        </ScreenLayout>
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        {header}
        <ScreenLayout className="px-4">
          <EmptyState
            title="Unable to load announcement"
            description={
              error?.message ?? "The requested announcement was not found."
            }
            variant="error"
          />
        </ScreenLayout>
      </>
    );
  }

  const imageUri = resolveAnnouncementImageUrl(data.imageUrl);
  const publishedDate = formatAnnouncementDate(data.startDate);
  const endDate = formatAnnouncementDate(data.endDate);

  return (
    <>
      {header}
      <ScreenLayout contentClassName="px-4">
        <Card className="overflow-hidden pt-0 border-0">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              contentFit="cover"
              style={styles.image}
            />
          ) : null}

          <CardContent>
            <View className="gap-2">
              <Text className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Announcement
              </Text>
              <Text className="text-2xl font-semibold text-foreground">
                {data.title}
              </Text>
            </View>

            <Text className="text-base leading-7 text-muted-foreground">
              {data.description}
            </Text>

            <View className="gap-3 mt-6">
              {publishedDate ? (
                <DetailRow label="Published" value={publishedDate} />
              ) : null}
              {endDate ? (
                <DetailRow label="Valid until" value={endDate} />
              ) : null}
              <DetailRow label="Views" value={String(data.viewCount)} />
              <DetailRow label="Clicks" value={String(data.clickCount)} />
            </View>
          </CardContent>
        </Card>
      </ScreenLayout>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Text className="text-sm font-medium text-muted-foreground">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 288,
  },
});
