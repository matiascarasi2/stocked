import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/atoms/Button";
import { AppText } from "@/components/atoms/AppText";
import { LogoBadge } from "@/components/molecules/LogoBadge";
import { colors, spacing } from "@/constants/theme";

export function WelcomeContent() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={[colors.welcomeGradientStart, colors.white]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <LogoBadge />
            <AppText variant="display" center>
              Stocked!
            </AppText>
            <AppText variant="body" color={colors.textMuted} center>
              Track stocks and set price alerts
            </AppText>
          </View>

          <View style={styles.actions}>
            <Button
              label="Sign Up"
              onPress={() => router.push("/sign-up")}
            />
            <Button
              label="Log In"
              variant="outline"
              onPress={() => router.push("/login")}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: spacing.screen,
    gap: spacing.sectionGap,
  },
  header: {
    alignItems: "center",
    gap: spacing.fieldGap,
  },
  actions: {
    gap: spacing.buttonGap,
  },
});
