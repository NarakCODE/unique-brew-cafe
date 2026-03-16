import { useHeaderHeight } from "@react-navigation/elements";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react-native";
import type { ReactNode } from "react";
import { Alert, Linking, StyleSheet, View } from "react-native";

import {
  getStoreGalleryUris,
  getStoreImageUri,
  normalizeStoreText,
} from "@/components/store/store-utils";
import { ScreenLayout } from "@/components/layout/screen-layout";
import { StableBackButton } from "@/components/navigation/stable-back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { useStore } from "@/hooks/use-store";

const DAY_LABELS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
] as const;

export default function StoreDetailScreen() {
  const headerHeight = useHeaderHeight();
  const params = useLocalSearchParams<{ id?: string }>();
  const storeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading, isError, error } = useStore(storeId);

  const header = (
    <Stack.Screen
      options={{
        title: "Store",
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
          <Card className="rounded border border-border bg-card py-0">
            <CardContent className="gap-4 px-5 py-5">
              <View className="h-72 rounded-2xl bg-muted" />
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
            title="Unable to load store"
            description={error?.message ?? "The requested store was not found."}
            variant="error"
          />
        </ScreenLayout>
      </>
    );
  }

  const imageUri = getStoreImageUri(data);
  const galleryImages = getStoreGalleryUris(data);
  const description = normalizeStoreText(data.description);
  const featureChips = buildFeatureChips(data.features);
  const summaryBadges = buildSummaryBadges(data);

  return (
    <>
      {header}
      <ScreenLayout contentClassName="px-4">
        <Card className="overflow-hidden rounded-[28px] border-0 py-0">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              contentFit="cover"
              transition={200}
              style={styles.image}
            />
          ) : (
            <View className="h-72 bg-muted" />
          )}

          {galleryImages.length ? (
            <View style={styles.galleryGrid}>
              {galleryImages.map((uri) => (
                <Image
                  key={uri}
                  source={{ uri }}
                  contentFit="cover"
                  transition={150}
                  style={styles.galleryImage}
                />
              ))}
            </View>
          ) : null}

          <CardContent className="gap-5 px-5 py-5">
            <View className="gap-3">
              <View className="gap-2">
                <Text className="text-2xl font-semibold text-foreground">
                  {data.name}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {data.city}, {data.state}
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {summaryBadges.map((badge) => (
                  <Badge
                    key={badge.label}
                    variant={badge.variant}
                    className="rounded-full px-3 py-1.5"
                  >
                    <Text>{badge.label}</Text>
                  </Badge>
                ))}
              </View>

              {description ? (
                <Text className="text-base leading-7 text-muted-foreground">
                  {description}
                </Text>
              ) : null}
            </View>

            <DetailSection title="Location">
              <DetailRow
                icon={<MapPin size={16} color="#6F756C" strokeWidth={2} />}
                label="Address"
                value={formatFullAddress(data)}
              />
              <DetailRow
                icon={<Phone size={16} color="#6F756C" strokeWidth={2} />}
                label="Phone"
                value={data.phone}
              />
              <ContactActions phone={data.phone} />
              {data.email ? (
                <DetailRow
                  icon={<Mail size={16} color="#6F756C" strokeWidth={2} />}
                  label="Email"
                  value={data.email}
                />
              ) : null}
            </DetailSection>

            <DetailSection title="Opening Hours">
              {DAY_LABELS.map(({ key, label }) => (
                <HoursRow
                  key={key}
                  label={label}
                  value={formatHoursRange(data.openingHours[key])}
                />
              ))}
            </DetailSection>

            {featureChips.length ? (
              <DetailSection title="Features">
                <View className="flex-row flex-wrap gap-2">
                  {featureChips.map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="rounded-full px-3 py-1.5"
                    >
                      <Text>{feature}</Text>
                    </Badge>
                  ))}
                </View>
              </DetailSection>
            ) : null}
          </CardContent>
        </Card>
      </ScreenLayout>
    </>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3">
      <Text className="text-lg font-semibold text-foreground">{title}</Text>
      <View className="gap-3">{children}</View>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="pt-1">{icon}</View>
      <View className="flex-1">
        <Badge
          variant="outline"
          className="self-start rounded-full px-2.5 py-1"
        >
          <Text>{label}</Text>
        </Badge>
        <Text className="mt-1 text-sm leading-6 text-foreground">{value}</Text>
      </View>
    </View>
  );
}

function ContactActions({ phone }: { phone: string }) {
  const handleCallPress = () => {
    void openCallUrl(phone);
  };

  const handleSmsPress = () => {
    void openSmsUrl(phone);
  };

  return (
    <View className="flex-row gap-3">
      <Button
        variant="outline"
        className="h-12 flex-1 rounded-2xl"
        onPress={handleCallPress}
      >
        <Phone size={16} color="#5A3421" strokeWidth={2} />
        <Text>Call Us</Text>
      </Button>
      <Button
        variant="secondary"
        className="h-12 flex-1 rounded-2xl"
        onPress={handleSmsPress}
      >
        <MessageCircle size={16} color="#5A3421" strokeWidth={2} />
        <Text>Send SMS</Text>
      </Button>
    </View>
  );
}

function HoursRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Badge variant="outline" className="rounded-full px-2.5 py-1">
        <Text>{label}</Text>
      </Badge>
      <Badge
        variant={value === "Closed" ? "outline" : "secondary"}
        className="rounded-full px-2.5 py-1"
      >
        <Text>{value}</Text>
      </Badge>
    </View>
  );
}

async function openCallUrl(phone: string) {
  const normalizedPhone = normalizePhoneForAction(phone);
  const url = `tel:${normalizedPhone}`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "Unable to place call",
      `This device could not open the phone dialer for ${phone}.`,
    );
  }
}

async function openSmsUrl(phone: string) {
  const normalizedPhone = normalizePhoneForAction(phone);
  const url = `sms:${normalizedPhone}`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "Unable to send SMS",
      `This device could not open the messaging app for ${phone}.`,
    );
  }
}

function formatHoursRange(value?: { open: string; close: string }) {
  if (!value?.open || !value?.close) {
    return "Closed";
  }

  return `${value.open} - ${value.close}`;
}

function normalizePhoneForAction(phone: string) {
  const trimmed = phone.trim();
  const sanitized = trimmed.replace(/[^\d+]/g, "");

  return sanitized || trimmed;
}

function formatFullAddress(store: {
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}) {
  return [
    store.address,
    store.city,
    store.state,
    store.postalCode,
    store.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function buildFeatureChips(features: {
  parking: boolean;
  wifi: boolean;
  outdoorSeating: boolean;
  driveThrough: boolean;
}) {
  const chips: string[] = [];

  if (features.parking) {
    chips.push("Parking");
  }
  if (features.wifi) {
    chips.push("Wi-Fi");
  }
  if (features.outdoorSeating) {
    chips.push("Outdoor Seating");
  }
  if (features.driveThrough) {
    chips.push("Drive Through");
  }

  return chips;
}

function buildSummaryBadges(store: {
  isOpenNow: boolean;
  city: string;
  state: string;
  rating?: number;
  totalReviews: number;
  averagePrepTime: number;
  specialHours: {
    date: string;
    open: string;
    close: string;
    reason?: string;
  }[];
}) {
  const badges: {
    label: string;
    variant: "default" | "secondary" | "outline";
  }[] = [
    {
      label: store.isOpenNow ? "Open now" : "Closed",
      variant: store.isOpenNow ? "secondary" : "outline",
    },
    {
      label: `${store.city}, ${store.state}`,
      variant: "outline",
    },
    {
      label: `${store.averagePrepTime} min prep`,
      variant: "outline",
    },
  ];

  if (typeof store.rating === "number") {
    badges.push({
      label: `${store.rating.toFixed(1)} stars`,
      variant: "secondary",
    });
    badges.push({
      label: `${store.totalReviews} reviews`,
      variant: "outline",
    });
  }

  if (store.specialHours.length > 0) {
    badges.push({
      label: "Special hours",
      variant: "outline",
    });
  }

  return badges;
}

const styles = StyleSheet.create({
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  galleryImage: {
    width: "48.5%",
    aspectRatio: 1,
    borderRadius: 14,
  },
  image: {
    width: "100%",
    height: 288,
  },
});
