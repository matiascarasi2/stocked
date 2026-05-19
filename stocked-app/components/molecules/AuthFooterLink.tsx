import { Pressable, StyleSheet, Text } from "react-native";

import { colors, typography } from "@/constants/theme";

type AuthFooterLinkProps = {
  prefix: string;
  linkLabel: string;
  onPress: () => void;
};

export function AuthFooterLink({
  prefix,
  linkLabel,
  onPress,
}: AuthFooterLinkProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Text style={styles.text}>
        {prefix}{" "}
        <Text style={styles.link}>{linkLabel}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  text: {
    ...typography.footer,
    color: colors.textMuted,
    textAlign: "center",
  },
  link: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});
