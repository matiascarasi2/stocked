import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { colors, spacing } from "@/constants/theme";

type ScreenHeadingProps = {
  title: string;
  subtitle: string;
};

export function ScreenHeading({ title, subtitle }: ScreenHeadingProps) {
  return (
    <View style={styles.container}>
      <AppText variant="title" center>
        {title}
      </AppText>
      <AppText variant="body" color={colors.textMuted} center>
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.labelGap,
    alignItems: "center",
  },
});
