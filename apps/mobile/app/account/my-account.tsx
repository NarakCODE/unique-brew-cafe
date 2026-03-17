import { useRouter } from "expo-router";
import { Headphones, Heart, History } from "lucide-react-native";
import { useCallback } from "react";
import { RefreshControl, ScrollView, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AccountActionHeader } from "@/components/account/account-action-header";
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
  const { data, isLoading, isError, error, isFetching, refetch } = useProfile();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <View className="gap-4 px-4 pt-2">
        <AccountActionHeader title="My Account" />
        {/* Render your skeleton loading state here without the header prop */}
        <MyAccountLoadingState />
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: 8,
        paddingBottom: insets.bottom + 28,
        paddingHorizontal: 16,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !isLoading}
          onRefresh={handleRefresh}
          tintColor={colorScheme === "dark" ? "#F5F5F5" : "#5A3421"}
        />
      }
    >
      <View className="mb-4 pt-2">
        <AccountActionHeader title="My Account" />
      </View>

      {isError || !data ? (
        <MyAccountState isError={isError} errorMessage={error?.message} />
      ) : (
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
      )}
    </ScrollView>
  );
}

function MyAccountState({
  isError,
  errorMessage,
}: {
  isError: boolean;
  errorMessage?: string;
}) {
  if (isError) {
    return (
      <EmptyState
        title="Unable to load your account"
        description={
          errorMessage ?? "We couldn't retrieve your profile details."
        }
        illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
        variant="error"
        centered
      />
    );
  }

  return (
    <EmptyState
      title="No profile details yet"
      description="Your account information will appear here once the server returns your profile."
      illustrationSource={DEFAULT_EMPTY_ILLUSTRATION}
      centered
    />
  );
}
