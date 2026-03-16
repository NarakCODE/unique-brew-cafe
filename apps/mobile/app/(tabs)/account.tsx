import * as React from "react";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import {
  ChevronRight,
  Heart,
  Headphones,
  History,
  Megaphone,
  MessageSquareText,
  CircleHelp,
  Store,
  UserRound,
} from "lucide-react-native";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/color-scheme";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { ScreenLayout } from "@/components/layout/screen-layout";

type AccountItem = {
  label: string;
  icon: React.ComponentProps<typeof Icon>["as"];
  href:
    | "/account/my-account"
    | "/account/order-history"
    | "/account/favorites"
    | "/account/stores"
    | "/account/announcements"
    | "/account/customer-service"
    | "/account/feedback"
    | "/account/faqs";
};

type AccountSection = {
  title: string;
  items: AccountItem[];
};

export default function AccountScreen() {
  const router = useRouter();
  const { colors, colorScheme } = useColorScheme();
  const { user, signOut } = useAuth();

  const sections = React.useMemo<AccountSection[]>(
    () => [
      {
        title: "Personal",
        items: [
          { label: "My Account", icon: UserRound, href: "/account/my-account" },
          { label: "History", icon: History, href: "/account/order-history" },
          { label: "Favorites", icon: Heart, href: "/account/favorites" },
        ],
      },
      {
        title: "Shortcuts",
        items: [
          { label: "Stores", icon: Store, href: "/account/stores" },
          {
            label: "Announcements",
            icon: Megaphone,
            href: "/account/announcements",
          },
        ],
      },
      {
        title: "Contact",
        items: [
          {
            label: "Customer Service",
            icon: Headphones,
            href: "/account/customer-service",
          },
          {
            label: "Feedback",
            icon: MessageSquareText,
            href: "/account/feedback",
          },
          { label: "FAQs", icon: CircleHelp, href: "/account/faqs" },
        ],
      },
    ],
    [],
  );

  const avatarFallback = getInitials(user?.fullName);
  const profileImage = user?.profileImage?.trim();
  const rowBackground =
    colorScheme === "dark" ? colors.card : "rgb(248, 248, 246)";
  const iconColor =
    colorScheme === "dark" ? colors.mutedForeground : "rgb(107, 112, 103)";
  const chevronColor =
    colorScheme === "dark"
      ? "rgba(255,255,255,0.42)"
      : "rgba(107,112,103,0.52)";

  return (
    <ScreenLayout contentClassName="gap-9 px-5 pt-2">
      <View className="flex-row items-center gap-5">
        <Avatar className="size-[104px] bg-muted" alt="Profile Picture">
          {profileImage ? <AvatarImage source={{ uri: profileImage }} /> : null}
          <AvatarFallback className="bg-[#D7DDD3]">
            <Text className="text-[30px] font-semibold text-[#374034]">
              {avatarFallback}
            </Text>
          </AvatarFallback>
        </Avatar>

        <View className="flex-1 gap-1">
          <Text
            variant="largeTitle"
            className="text-[24px] font-extrabold tracking-[-0.7px]"
          >
            {user?.fullName ?? "Guest User"}
          </Text>
          <Text
            color="tertiary"
            className="text-[17px] leading-7"
            numberOfLines={1}
          >
            {user?.email ?? "guest@example.com"}
          </Text>
        </View>
      </View>

      {sections.map((section) => (
        <View key={section.title} className="gap-4">
          <Text
            color="tertiary"
            variant="title3"
            className="px-1 text-[19px] font-semibold"
          >
            {section.title}
          </Text>

          <View className="gap-4">
            {section.items.map((item) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                className={cn(
                  "flex-row items-center rounded-[22px] px-5 py-6 active:opacity-85",
                )}
                onPress={() => {
                  router.navigate(item.href);
                }}
                style={{ backgroundColor: rowBackground }}
              >
                <View className="w-12 items-start">
                  <Icon
                    as={item.icon}
                    size={29}
                    color={iconColor}
                    strokeWidth={1.9}
                  />
                </View>

                <Text className="flex-1 text-[19px] leading-7">
                  {item.label}
                </Text>

                <ChevronRight
                  size={30}
                  color={chevronColor}
                  strokeWidth={2.2}
                />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Button
        variant="destructive"
        size="lg"
        onPress={() => {
          void signOut();
        }}
      >
        <Text>Sign Out</Text>
      </Button>
    </ScreenLayout>
  );
}

function getInitials(fullName?: string) {
  if (!fullName) {
    return "GU";
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return "GU";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
