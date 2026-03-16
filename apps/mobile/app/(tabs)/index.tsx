import { Image } from "expo-image";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { FadeInDown, FadeInUp } from "react-native-reanimated";

import { AnnouncementList } from "@/components/announcement/AnnouncementList";
import { ScreenLayout } from "@/components/layout/screen-layout";
import { GlobalSearchEntry } from "@/components/search/GlobalSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/providers/auth-provider";

type PromoCard = {
  id: string;
  title: string;
  cta: string;
  image: string;
  backgroundColor: string;
  accentColor: string;
};

const PROMO_CARDS: PromoCard[] = [
  {
    id: "iced-latte",
    title: "35% OFF\non Ice Latte",
    cta: "Buy now",
    image:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
    backgroundColor: "#F7E8C1",
    accentColor: "#EECF84",
  },
  {
    id: "cold-brew",
    title: "Fresh Brew\nfor Sunny Days",
    cta: "Try now",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    backgroundColor: "#E8E1D3",
    accentColor: "#DCC8A7",
  },
];

const HOME_STATS = [
  { label: "Pickup flow", value: "8 min" },
  { label: "Fresh promos", value: "2 live" },
  { label: "Cafe reward", value: "240 pts" },
] as const;

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const firstName = getFirstName(user?.fullName);
  const avatarFallback = getInitials(user?.fullName);
  const profileImage = user?.profileImage?.trim();
  const promoCardWidth = Math.min(width - 52, 540);

  return (
    <ScreenLayout>
      <View className="gap-6 px-4">
        <NativeOnlyAnimatedView entering={FadeInDown.duration(450)}>
          <View className="overflow-hidden rounded-[34px] bg-[#2F241E] px-5 py-5">
            <View className="absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#FFB37B]/25" />
            <View className="absolute right-8 top-24 h-16 w-16 rounded-full bg-white/10" />
            <View className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-[#FFE6BF]/20" />

            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-sm font-semibold uppercase tracking-[1.8px] text-[#F7C899]">
                  Unique Brew Cafe
                </Text>
                <Text className="mt-3 text-[30px] font-extrabold leading-9 text-white">
                  Hi {firstName}
                </Text>
                <Text className="mt-2 text-base leading-6 text-[#F3E5D8]">
                  Craving something smooth, warm, and ready before the rush?
                </Text>
              </View>

              <Avatar
                className="h-16 w-16 border border-white/15 bg-white/10"
                alt="Profile Image"
              >
                {profileImage ? (
                  <AvatarImage source={{ uri: profileImage }} />
                ) : null}
                <AvatarFallback className="bg-white/10">
                  <Text className="text-lg font-semibold text-white">
                    {avatarFallback}
                  </Text>
                </AvatarFallback>
              </Avatar>
            </View>

            <View className="mt-5 rounded-[26px] bg-white/10 px-4 py-4">
              <Text className="text-sm font-semibold uppercase tracking-[1.3px] text-[#F7C899]">
                Today at a glance
              </Text>
              <View className="mt-4 flex-row flex-wrap gap-3">
                {HOME_STATS.map((stat) => (
                  <View
                    key={stat.label}
                    className="min-w-[92px] flex-1 rounded-[20px] bg-white/10 px-3 py-3"
                  >
                    <Text className="text-lg font-bold text-white">
                      {stat.value}
                    </Text>
                    <Text className="mt-1 text-xs uppercase tracking-[1px] text-[#E9D7C6]">
                      {stat.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </NativeOnlyAnimatedView>

        <NativeOnlyAnimatedView
          entering={FadeInUp.delay(60).duration(420)}
        >
          <GlobalSearchEntry />
        </NativeOnlyAnimatedView>
      </View>

      <NativeOnlyAnimatedView entering={FadeInUp.delay(120).duration(420)}>
        <View className="gap-4">
          <View className="flex-row items-center justify-between px-4">
            <View>
              <Text className="text-2xl font-semibold text-foreground">
                Today&apos;s pours
              </Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                Fresh picks tailored for the day.
              </Text>
            </View>

            <View className="rounded-full bg-primary/10 px-3 py-1.5">
              <Text className="text-xs font-semibold uppercase tracking-[1.1px] text-primary">
                Limited
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToAlignment="start"
            snapToInterval={promoCardWidth + 16}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
          >
            {PROMO_CARDS.map((card) => (
              <PromoBannerCard
                key={card.id}
                card={card}
                width={promoCardWidth}
              />
            ))}
          </ScrollView>
        </View>
      </NativeOnlyAnimatedView>

      <NativeOnlyAnimatedView entering={FadeInUp.delay(180).duration(420)}>
        <View className="gap-5 px-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-semibold text-foreground">
                Latest updates
              </Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                Store news, releases, and community notes.
              </Text>
            </View>

            <View className="rounded-full bg-[#F4E6D8] px-3 py-1.5 dark:bg-primary/15">
              <Text className="text-xs font-semibold uppercase tracking-[1.1px] text-[#8B4C20] dark:text-primary">
                Live
              </Text>
            </View>
          </View>

          <AnnouncementList limit={5} />
        </View>
      </NativeOnlyAnimatedView>
    </ScreenLayout>
  );
}

function PromoBannerCard({ card, width }: { card: PromoCard; width: number }) {
  return (
    <Card
      className="mr-4 overflow-hidden rounded-[32px] border-0 py-0 shadow-sm shadow-black/10"
      style={{ width, backgroundColor: card.backgroundColor }}
    >
      <View
        className="absolute -right-8 -top-10 h-36 w-36 rounded-full opacity-70"
        style={{ backgroundColor: card.accentColor }}
      />
      <View className="absolute bottom-5 left-6 rounded-full bg-black/10 px-3 py-1.5">
        <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-[#5E4733]">
          House favorite
        </Text>
      </View>

      <View className="min-h-56 flex-row items-center px-7 py-7">
        <View className="z-10 max-w-1/2">
          <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-[#7A6149]">
            Seasonal offer
          </Text>

          <Text className="mt-3 text-3xl font-extrabold leading-9 text-foreground">
            {card.title}
          </Text>

          <View className="mt-7 self-start rounded-2xl bg-[#2F241E] px-5 py-3">
            <Text className="text-base font-semibold text-white">
              {card.cta}
            </Text>
          </View>
        </View>

        <View className="flex-1 items-end justify-center">
          <Image
            source={{ uri: card.image }}
            contentFit="contain"
            transition={150}
            className="h-48 w-40"
          />
        </View>
      </View>
    </Card>
  );
}

function getFirstName(fullName?: string) {
  if (!fullName) {
    return "Daniel";
  }

  return fullName.trim().split(/\s+/)[0] || "Daniel";
}

function getInitials(fullName?: string) {
  if (!fullName) {
    return "D";
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "D";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
