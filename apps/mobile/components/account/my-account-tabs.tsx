import type { User } from "../../../../packages/api/src";
import { Bell, Gift, Mail, Phone, UserRound } from "lucide-react-native";
import { View } from "react-native";

import {
  formatCurrency,
  formatCurrencyCode,
  formatDate,
  formatDateTime,
  formatMonthYear,
  formatNumber,
  formatPlainValue,
} from "@/components/account/my-account-helpers";
import {
  InfoRow,
  MetricCard,
  PreferenceRow,
  SectionCard,
  StatusBadge,
} from "@/components/account/my-account-primitives";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";

export function MyAccountTabs({ profile }: { profile: User }) {
  return (
    <Tabs defaultValue="snapshot" className="gap-4">
      <TabsList className="h-auto flex-row flex-wrap justify-start rounded-[24px] bg-transparent p-0">
        <TabTrigger value="snapshot" label="Snapshot" />
        <TabTrigger value="contact" label="Contact" />
        <TabTrigger value="personal" label="Personal" />
        <TabTrigger value="preferences" label="Preferences" />
        <TabTrigger value="alerts" label="Alerts" />
      </TabsList>

      <TabsContent value="snapshot">
        <SectionCard title="Member Snapshot">
          <View className="flex-row flex-wrap justify-between gap-3">
            <MetricCard
              label="Loyalty Points"
              value={formatNumber(profile.loyaltyPoints)}
            />
            <MetricCard label="Orders" value={formatNumber(profile.totalOrders)} />
            <MetricCard
              label="Total Spent"
              value={formatCurrency(
                profile.totalSpent,
                profile.preferences.currency,
              )}
            />
            <MetricCard
              label="Member Since"
              value={formatMonthYear(profile.createdAt)}
            />
          </View>
        </SectionCard>
      </TabsContent>

      <TabsContent value="contact">
        <SectionCard title="Contact">
          <InfoRow
            icon={<Icon as={Mail} size={18} className="text-muted-foreground" />}
            label="Email"
            value={profile.email}
            trailing={
              <StatusBadge
                label={profile.emailVerified ? "Verified" : "Pending"}
                active={profile.emailVerified}
              />
            }
          />
          <InfoRow
            icon={<Icon as={Phone} size={18} className="text-muted-foreground" />}
            label="Phone Number"
            value={profile.phoneNumber || "Not provided"}
            trailing={
              <StatusBadge
                label={profile.phoneVerified ? "Verified" : "Pending"}
                active={profile.phoneVerified}
              />
            }
          />
          <InfoRow
            icon={<Icon as={Gift} size={18} className="text-muted-foreground" />}
            label="Referral Code"
            value={profile.referralCode || "Not available"}
          />
        </SectionCard>
      </TabsContent>

      <TabsContent value="personal">
        <SectionCard title="Personal Information">
          <InfoRow
            icon={
              <Icon as={UserRound} size={18} className="text-muted-foreground" />
            }
            label="Gender"
            value={formatPlainValue(profile.gender)}
          />
          <InfoRow
            icon={
              <Icon as={UserRound} size={18} className="text-muted-foreground" />
            }
            label="Birthday"
            value={formatDate(profile.dateOfBirth)}
          />
          <InfoRow
            icon={<Icon as={Bell} size={18} className="text-muted-foreground" />}
            label="Last Login"
            value={formatDateTime(profile.lastLoginAt)}
          />
          <InfoRow
            icon={<Icon as={Bell} size={18} className="text-muted-foreground" />}
            label="Last Logout"
            value={formatDateTime(profile.lastLogoutAt)}
          />
        </SectionCard>
      </TabsContent>

      <TabsContent value="preferences">
        <SectionCard title="Preferences">
          <InfoRow
            label="Language"
            value={formatPlainValue(profile.preferences.language)}
          />
          <InfoRow
            label="Currency"
            value={formatCurrencyCode(profile.preferences.currency)}
          />
          <PreferenceRow
            label="Notifications"
            description="Master switch for account notifications"
            value={profile.preferences.notificationsEnabled}
          />
          <PreferenceRow
            label="Email Alerts"
            description="Receive updates by email"
            value={profile.preferences.emailNotifications}
          />
          <PreferenceRow
            label="SMS Alerts"
            description="Receive updates by text message"
            value={profile.preferences.smsNotifications}
          />
          <PreferenceRow
            label="Push Alerts"
            description="Receive updates on this device"
            value={profile.preferences.pushNotifications}
          />
        </SectionCard>
      </TabsContent>

      <TabsContent value="alerts">
        <SectionCard title="Notification Types">
          <PreferenceRow
            label="Order Updates"
            description="Status changes for current orders"
            value={profile.preferences.notifications.orderUpdates}
          />
          <PreferenceRow
            label="Promotions"
            description="Deals, campaigns, and reward offers"
            value={profile.preferences.notifications.promotions}
          />
          <PreferenceRow
            label="Announcements"
            description="Store news and important updates"
            value={profile.preferences.notifications.announcements}
          />
          <PreferenceRow
            label="System Notifications"
            description="Security and service messages"
            value={profile.preferences.notifications.systemNotifications}
          />
        </SectionCard>
      </TabsContent>
    </Tabs>
  );
}

function TabTrigger({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="mb-2 mr-2 h-11 rounded-full border border-border px-4"
    >
      <Text>{label}</Text>
    </TabsTrigger>
  );
}
