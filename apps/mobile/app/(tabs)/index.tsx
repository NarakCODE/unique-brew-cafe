import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useRouter } from 'expo-router'
import * as React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/nativewindui/Button'
import { Text } from '@/components/nativewindui/Text'
import { useColorScheme } from "@/lib/color-scheme";
import { useAuth } from '@/providers/auth-provider'

type QuickAction = {
  label: string
  detail: string
  icon: React.ComponentProps<typeof MaterialIcons>['name']
}

type Highlight = {
  label: string
  value: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Start an order',
    detail: 'Browse nearby brews and seasonal specials.',
    icon: 'local-cafe',
  },
  {
    label: 'Track pickup',
    detail: 'Follow preparation and pickup timing in one place.',
    icon: 'schedule',
  },
  {
    label: 'Saved favorites',
    detail: 'Jump back into your usual coffee run fast.',
    icon: 'favorite-outline',
  },
]

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { colors, colorScheme } = useColorScheme()
  const { session, signOut } = useAuth()

  const user = session?.user
  const firstName = getFirstName(user?.fullName)
  const greeting = getGreeting()
  const loyaltyPoints = user?.loyaltyPoints ?? 0
  const totalOrders = user?.totalOrders ?? 0
  const totalSpent = user?.totalSpent ?? 0
  const loyaltyTier = normalizeLabel(user?.loyaltyTier, 'Member')
  const accountStatus = normalizeLabel(user?.status, 'Active')

  const highlights: Highlight[] = [
    { label: 'Loyalty points', value: loyaltyPoints.toLocaleString() },
    { label: 'Orders placed', value: totalOrders.toString() },
    { label: 'Total spend', value: formatCurrency(totalSpent) },
  ]

  const heroBackground = colorScheme === 'dark' ? '#2B1D18' : '#4D2F28'
  const heroAccent = colorScheme === 'dark' ? '#C98F63' : '#F1C191'
  const heroSoft = colorScheme === 'dark' ? '#3A2924' : '#6A473B'

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 28,
      }}
      showsVerticalScrollIndicator={false}>
      <View className="gap-6 px-5">
        <View
          className="overflow-hidden rounded-[32px] px-5 pb-5 pt-6"
          style={{ backgroundColor: heroBackground }}>
          <View
            className="absolute -right-8 -top-6 h-28 w-28 rounded-full"
            style={{ backgroundColor: heroAccent, opacity: 0.22 }}
          />
          <View
            className="absolute right-12 top-20 h-20 w-20 rounded-full"
            style={{ backgroundColor: heroSoft, opacity: 0.35 }}
          />

          <View className="gap-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 gap-2">
                <Text className="text-sm font-medium uppercase tracking-[2px] text-white/65">
                  {greeting}
                </Text>
                <Text variant="largeTitle" className="text-white">
                  {firstName}, your next brew is one tap away.
                </Text>
                <Text color="secondary" className="max-w-[280px] text-white/78">
                  Keep the morning moving with fast pickup, rewards, and your
                  usual order ready to repeat.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2"
                onPress={signOut}>
                <Text variant="footnote" className="font-semibold text-white">
                  Log out
                </Text>
              </Pressable>
            </View>

            <View className="flex-row flex-wrap gap-3">
              <Badge
                icon="workspace-premium"
                label={`${loyaltyTier} tier`}
                textColor="#FFFFFF"
                backgroundColor="rgba(255,255,255,0.12)"
              />
              <Badge
                icon={user?.emailVerified ? 'verified' : 'mail-outline'}
                label={user?.emailVerified ? 'Email verified' : 'Verify email'}
                textColor="#FFFFFF"
                backgroundColor="rgba(255,255,255,0.12)"
              />
              <Badge
                icon="bolt"
                label={`${loyaltyPoints} pts available`}
                textColor="#FFFFFF"
                backgroundColor="rgba(255,255,255,0.12)"
              />
            </View>

            <View className="flex-row gap-3">
              {highlights.map((item) => (
                <View
                  key={item.label}
                  className="flex-1 rounded-[24px] px-4 py-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Text variant="caption1" className="uppercase tracking-[1.3px] text-white/60">
                    {item.label}
                  </Text>
                  <Text variant="title2" className="mt-2 text-white">
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="rounded-[28px] border border-border bg-card p-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text variant="title3" className="font-semibold">
                Account snapshot
              </Text>
              <Text color="tertiary" variant="subhead">
                Live details from your authenticated profile.
              </Text>
            </View>

            <View className="rounded-full bg-primary/10 px-3 py-1.5">
              <Text variant="footnote" className="font-semibold text-primary">
                {accountStatus}
              </Text>
            </View>
          </View>

          <View className="mt-5 gap-4">
            <InfoRow
              icon="mail-outline"
              label="Email"
              value={user?.email ?? 'No email available'}
              iconColor={colors.primary}
            />
            <InfoRow
              icon="person-outline"
              label="Role"
              value={normalizeLabel(user?.role, 'Customer')}
              iconColor={colors.secondary}
            />
            <InfoRow
              icon="confirmation-number"
              label="Referral code"
              value={user?.referralCode || 'Will unlock after your first completed order'}
              iconColor={colors.accent}
            />
          </View>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between px-1">
            <View>
              <Text variant="title3" className="font-semibold">
                Quick actions
              </Text>
              <Text color="tertiary" variant="subhead">
                Good defaults for the first signed-in session.
              </Text>
            </View>
          </View>

          {QUICK_ACTIONS.map((item) => (
            <View
              key={item.label}
              className="rounded-[26px] border border-border bg-card px-5 py-4">
              <View className="flex-row items-start gap-4">
                <View className="rounded-2xl bg-primary/10 p-3">
                  <MaterialIcons
                    name={item.icon}
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <View className="flex-1 gap-1">
                  <Text variant="heading">{item.label}</Text>
                  <Text color="tertiary" variant="subhead">
                    {item.detail}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="rounded-[28px] border border-border bg-card p-5">
          <Text variant="title3" className="font-semibold">
            Your momentum
          </Text>
          <Text color="tertiary" variant="subhead" className="mt-1">
            A simple pulse check for the account you just signed into.
          </Text>

          <View className="mt-5 flex-row gap-3">
            <MomentumCard
              icon="local-fire-department"
              title="Rewards"
              value={loyaltyPoints >= 100 ? 'Hot streak' : 'Building up'}
              description="Keep ordering to unlock stronger perks."
              color={colorScheme === 'dark' ? '#F59E0B' : '#B45309'}
            />
            <MomentumCard
              icon="shopping-bag"
              title="Ordering"
              value={totalOrders > 0 ? 'Active' : 'Ready'}
              description={
                totalOrders > 0
                  ? 'Your account already has order history.'
                  : 'Place your first order to start tracking favorites.'
              }
              color={colors.primary}
            />
          </View>

          <Button
            variant="tonal"
            size="lg"
            className="mt-5 rounded-2xl"
            onPress={() => router.push('/(tabs)/explore')}>
            <Text className="font-semibold">Continue exploring</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}

function Badge({
  icon,
  label,
  backgroundColor,
  textColor,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name']
  label: string
  backgroundColor: string
  textColor: string
}) {
  return (
    <View
      className="flex-row items-center gap-2 rounded-full px-3 py-2"
      style={{ backgroundColor }}>
      <MaterialIcons name={icon} size={16} color={textColor} />
      <Text variant="footnote" className="font-medium" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  )
}

function InfoRow({
  icon,
  label,
  value,
  iconColor,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name']
  label: string
  value: string
  iconColor: string
}) {
  return (
    <View className="flex-row items-start gap-4">
      <View className="rounded-2xl bg-muted/45 p-3">
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>

      <View className="flex-1">
        <Text variant="footnote" color="tertiary" className="uppercase tracking-[1.2px]">
          {label}
        </Text>
        <Text variant="subhead" className="mt-1">
          {value}
        </Text>
      </View>
    </View>
  )
}

function MomentumCard({
  icon,
  title,
  value,
  description,
  color,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name']
  title: string
  value: string
  description: string
  color: string
}) {
  return (
    <View className="flex-1 rounded-[24px] bg-muted/40 p-4">
      <View
        className="mb-4 h-11 w-11 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${color}20` }}>
        <MaterialIcons name={icon} size={20} color={color} />
      </View>
      <Text variant="footnote" color="tertiary" className="uppercase tracking-[1.2px]">
        {title}
      </Text>
      <Text variant="title3" className="mt-1 font-semibold">
        {value}
      </Text>
      <Text variant="footnote" color="tertiary" className="mt-2">
        {description}
      </Text>
    </View>
  )
}

function getFirstName(fullName?: string) {
  if (!fullName) {
    return 'Welcome'
  }

  return fullName.trim().split(/\s+/)[0] || 'Welcome'
}

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Good morning'
  }

  if (hour < 18) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

function normalizeLabel(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback
  }

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}
