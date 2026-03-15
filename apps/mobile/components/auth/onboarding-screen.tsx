import { ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/nativewindui/Button";
import { Text } from "@/components/nativewindui/Text";
import { Logo } from "@/components/ui/logo";

const BACKGROUND_IMAGE = require("@/assets/images/login-bg.png");

const styles = StyleSheet.create({
  logoShadow: {
    shadowColor: "#6B3C21",
    shadowOpacity: 0.12,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
  },
  welcomeText: {
    color: "#18120E",
    fontSize: 54,
    lineHeight: 62,
    fontStyle: "italic",
    textAlign: "center",
    fontFamily: Platform.select({
      ios: "Times New Roman",
      android: "serif",
      default: "serif",
    }),
  },
});

export function OnboardingScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      imageStyle={{ opacity: 0.85 }}
    >
      <View className="flex-1 bg-white/30">
        <SafeAreaView edges={["top", "bottom"]} className="flex-1">
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="min-h-full flex-grow px-5 pb-6 pt-2"
          >
            <View className="flex-1 justify-between">
              <View className="items-center px-2 pt-6">
                <View className="w-full max-w-[340px] items-center">
                  <View style={styles.logoShadow}>
                    <Logo size={262} />
                  </View>
                </View>
              </View>

              <View className="items-center px-4 pt-8">
                <Text style={styles.welcomeText}>Welcome</Text>
              </View>

              <View className="gap-5 px-1 pt-10">
                <Button
                  onPress={() => router.push("/login")}
                  size="lg"
                  className="h-14 rounded-[18px] bg-[#D38E43] shadow-sm"
                >
                  <Text className="text-[20px] font-semibold uppercase tracking-[0.8px] text-white">
                    Login
                  </Text>
                </Button>

                <View className="items-center pb-1">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[17px] text-[#6B625C]">
                      Don&apos;t have an account?
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Sign up"
                      onPress={() => router.push("/signup")}
                    >
                      <Text className="text-[17px] font-semibold text-[#18120E]">
                        sign up
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
