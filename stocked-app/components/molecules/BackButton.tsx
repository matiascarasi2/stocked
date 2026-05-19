import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { colors, sizes, spacing } from "@/constants/theme";

type BackButtonProps = {
  onPress: () => void;
};

export function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Back"
    >
      <Ionicons
        name="chevron-back"
        size={sizes.backIcon}
        color={colors.primary}
      />
      <AppText variant="body" color={colors.primary}>
        Back
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.screen,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
