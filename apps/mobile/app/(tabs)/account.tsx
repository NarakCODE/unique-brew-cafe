import { useRouter } from "expo-router";
import { ChevronRight, CircleHelp, Headphones, Heart, History, Megaphone, MessageSquareText, Store, UserRound } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { getInitials } from "@/components/account/my-account-helpers";
import { ScreenLayout } from "@/components/layout/screen-layout";
import { ScreenTopBar } from "@/components/layout/screen-topbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/providers/auth-provider";

type AccountItem = {
  label: string;
  description: string;
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
  meta: string;
  items: AccountItem[];
};

const ACCOUNT_SECTIONS: AccountSection[] = [
  {
    title: "Your Account",
    meta: "3 options",
    items: [
      {
        label: "My Account",
        description: "Profile, preferences, and personal details",
        icon: UserRound,
        href: "/account/my-account",
      },
      {
        label: "Order History",
        description: "Review your recent and past orders",
        icon: History,
        href: "/account/order-history",
      },
      {
        label: "Favorites",
        description: "Saved drinks and menu items",
        icon: Heart,
        href: "/account/favorites",
      },
    ],
  },
  {
    title: "Browse",
    meta: "2 options",
    items: [
      {
        label: "Stores",
        description: "Find nearby stores and opening hours",
        icon: Store,
        href: "/account/stores",
      },
      {
        label: "Announcements",
        description: "Latest updates and promotions",
        icon: Megaphone,
        href: "/account/announcements",
      },
    ],
  },
  {
    title: "Support",
    meta: "3 options",
    items: [
      {
        label: "Customer Service",
        description: "Get help with orders and account issues",
        icon: Headphones,
        href: "/account/customer-service",
      },
      {
        label: "Feedback",
        description: "Share suggestions about the app and service",
        icon: MessageSquareText,
        href: "/account/feedback",
      },
      {
        label: "FAQs",
        description: "Answers to common questions",
        icon: CircleHelp,
        href: "/account/faqs",
      },
    ],
  },
];

export default function AccountScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const avatarFallback = getInitials(user?.fullName);
  const profileImage = user?.profileImage?.trim();

  return (
    <ScreenLayout
      contentClassName="gap-6 px-4 pt-2"
      bottomInsetOffset={160}
    >
      <ScreenTopBar title="Account" />

      <View className="gap-3">
        <Text className="px-1 text-base font-semibold text-foreground">
          Profile
        </Text>

        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-4 rounded-[20px] border border-border bg-card px-4 py-4 active:opacity-90"
          onPress={() => {
            router.navigate("/account/my-account");
          }}
        >
          <Avatar className="size-[64px] bg-muted" alt="Profile picture">
            {profileImage ? <AvatarImage source={{ uri: profileImage }} /> : null}
            <AvatarFallback className="bg-muted">
              <Text className="text-lg font-semibold text-foreground">
                {avatarFallback}
              </Text>
            </AvatarFallback>
          </Avatar>

          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-foreground">
              {user?.fullName ?? "Guest User"}
            </Text>
            <Text
              className="text-sm leading-5 text-muted-foreground"
              numberOfLines={1}
            >
              {user?.email ?? "guest@example.com"}
            </Text>
          </View>

          <ChevronRight size={18} color="#8A7F78" strokeWidth={2.2} />
        </Pressable>
      </View>

      {ACCOUNT_SECTIONS.map((section) => (
        <View key={section.title} className="gap-3">
          <View className="flex-row items-center justify-between px-1">
            <Text className="text-base font-semibold text-foreground">
              {section.title}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {section.meta}
            </Text>
          </View>

          <View className="overflow-hidden rounded-[20px] border border-border bg-card">
            {section.items.map((item, index) => (
              <AccountMenuRow
                key={item.label}
                item={item}
                isLast={index === section.items.length - 1}
                onPress={() => {
                  router.navigate(item.href);
                }}
              />
            ))}
          </View>
        </View>
      ))}

      <Button
        variant="outline"
        className="h-11 rounded-[16px] border-destructive/20 bg-destructive/5"
        onPress={() => {
          void signOut();
        }}
      >
        <Text className="font-semibold text-destructive">Sign Out</Text>
      </Button>
    </ScreenLayout>
  );
}

function AccountMenuRow({
  item,
  isLast,
  onPress,
}: {
  item: AccountItem;
  isLast: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`flex-row items-center gap-3 px-4 py-4 active:opacity-90 ${
        isLast ? "" : "border-b border-border"
      }`}
      onPress={onPress}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-muted/50">
        <Icon
          as={item.icon}
          size={18}
          strokeWidth={2}
          className="text-muted-foreground"
        />
      </View>

      <View className="flex-1 gap-1">
        <Text className="text-sm font-semibold text-foreground">
          {item.label}
        </Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          {item.description}
        </Text>
      </View>

      <ChevronRight size={18} color="#8A7F78" strokeWidth={2.2} />
    </Pressable>
  );
}
