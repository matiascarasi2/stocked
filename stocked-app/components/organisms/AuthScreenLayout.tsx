import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/molecules/BackButton";
import { colors, spacing } from "@/constants/theme";

type AuthScreenLayoutProps = {
  onBack: () => void;
  children: ReactNode;
};

export function AuthScreenLayout({ onBack, children }: AuthScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackButton onPress={onBack} />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.screen,
  },
});
