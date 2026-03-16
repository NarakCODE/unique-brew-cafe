import type { User } from "../../../../packages/api/src";
import { View } from "react-native";

import {
  formatStatus,
  formatTier,
  getInitials,
} from "@/components/account/my-account-helpers";
import { StatusBadge } from "@/components/account/my-account-primitives";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

export function MyAccountHero({ profile }: { profile: User }) {
  const avatarFallback = getInitials(profile.fullName);
  const profileImage = profile.profileImage?.trim();

  return (
    <Card className="overflow-hidden rounded-[30px] border-0 py-0">
      <View className="bg-[#F6EBDD] px-5 pb-5 pt-6 dark:bg-[#2E251F]">
        <View className="flex-row items-center gap-4">
          <Avatar className="size-[92px] border-4 border-white/80 bg-muted">
            {profileImage ? <AvatarImage source={{ uri: profileImage }} /> : null}
            <AvatarFallback className="bg-[#D7DDD3]">
              <Text className="text-[26px] font-semibold text-[#374034]">
                {avatarFallback}
              </Text>
            </AvatarFallback>
          </Avatar>

          <View className="flex-1 gap-1">
            <Text
              variant="title2"
              className="text-[24px] font-extrabold tracking-[-0.6px]"
            >
              {profile.fullName}
            </Text>
            <Text color="tertiary" className="text-[15px] leading-6">
              {profile.email}
            </Text>
            <Text color="tertiary" className="text-[15px] leading-6">
              {profile.phoneNumber || "No phone number"}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-2">
          <StatusBadge
            label={profile.emailVerified ? "Email verified" : "Email pending"}
            active={profile.emailVerified}
          />
          <StatusBadge
            label={profile.phoneVerified ? "Phone verified" : "Phone pending"}
            active={profile.phoneVerified}
          />
          <Badge variant="outline" className="rounded-full px-3 py-1.5">
            <Text>{formatStatus(profile.status)}</Text>
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1.5">
            <Text>{formatTier(profile.loyaltyTier)}</Text>
          </Badge>
        </View>
      </View>
    </Card>
  );
}
