import { useRouter } from "expo-router";
import { Headphones, Heart, History } from "lucide-react-native";
import { View } from "react-native";

import { AccountDetailScreen } from "@/components/account/account-detail-screen";
import { MyAccountHero } from "@/components/account/my-account-hero";
import { MyAccountLoadingState } from "@/components/account/my-account-loading-state";
import {
  ActionButton,
  SectionCard,
} from "@/components/account/my-account-primitives";
import { MyAccountTabs } from "@/components/account/my-account-tabs";
import {
  DEFAULT_EMPTY_ILLUSTRATION,
  EmptyState,
} from "@/components/ui/empty-state";
import { useProfile } from "@/hooks/use-profile";

export default function MyAccountScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isFetching } = useProfile();

  if (isLoading) {
    return <MyAccountLoadingState />;
  }

  if (isError) {
    return (
      <AccountDetailScreen>
        <View className="gap-5">
          <EmptyState
            title="Unable to load your account"
            description={
              error?.message ?? "We couldn't retrieve your profile details."
            }
            illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
            variant="error"
            centered
            actionLabel={isFetching ? "Refreshing..." : "Try again"}
            onAction={() => {
              void refetch();
            }}
          />
        </View>
      </AccountDetailScreen>
    );
  }

  if (!data) {
    return (
      <AccountDetailScreen>
        <View className="gap-5">
          <EmptyState
            title="No profile details yet"
            description="Your account information will appear here once the server returns your profile."
            illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
            centered
            actionLabel="Refresh"
            onAction={() => {
              void refetch();
            }}
          />
        </View>
      </AccountDetailScreen>
    );
  }

  return (
    <AccountDetailScreen>
      <View className="gap-5">
        <MyAccountHero profile={data} />
        <MyAccountTabs profile={data} />

        <SectionCard title="Quick Actions">
          <View className="gap-3">
            <ActionButton
              icon={History}
              label="Order History"
              onPress={() => {
                router.navigate("/account/order-history");
              }}
            />
            <ActionButton
              icon={Heart}
              label="Favorites"
              onPress={() => {
                router.navigate("/account/favorites");
              }}
            />
            <ActionButton
              icon={Headphones}
              label="Customer Service"
              onPress={() => {
                router.navigate("/account/customer-service");
              }}
            />
          </View>
        </SectionCard>
      </View>
    </AccountDetailScreen>
  );
}
