import { Image } from "expo-image";
import { useRouter } from "expo-router";
import type { Announcement } from "../../../../packages/api/src";
import { Pressable, StyleSheet } from "react-native";

import {
  formatAnnouncementDate,
  resolveAnnouncementImageUrl,
} from "@/components/announcement/announcement-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type AnnouncementItemProps = {
  announcement: Announcement;
};

export function AnnouncementItem({ announcement }: AnnouncementItemProps) {
  const router = useRouter();
  const imageUri = resolveAnnouncementImageUrl(announcement.imageUrl);
  const formattedDate = formatAnnouncementDate(announcement.startDate);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.navigate({
          pathname: "/announcement/[id]",
          params: { id: announcement.id },
        })
      }
    >
      <Card className="overflow-hidden  pt-0">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            contentFit="cover"
            transition={200}
            style={styles.image}
          />
        ) : null}

        <CardContent className="gap-3">
          <Text className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Announcement
          </Text>

          <Text className="text-xl font-semibold text-foreground">
            {announcement.title}
          </Text>

          <Text className="text-base leading-6 text-muted-foreground">
            {announcement.description}
          </Text>

          {formattedDate ? (
            <Text className="text-sm text-muted-foreground">
              {formattedDate}
            </Text>
          ) : null}
        </CardContent>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 256,
  },
});
