import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { IconButton } from "@/components/atoms/IconButton";
import { BackButton } from "@/components/molecules/BackButton";
import { colors, radii, spacing } from "@/constants/theme";

type AlertsListHeaderProps = {
  onBack: () => void;
  onAdd: () => void;
};

export function AlertsListHeader({ onBack, onAdd }: AlertsListHeaderProps) {
  return (
    <View style={styles.container}>
      <BackButton onPress={onBack} />
      <View style={styles.titleRow}>
        <AppText variant="screenTitle">Price Alerts</AppText>
        <IconButton
          name="add"
          color={colors.white}
          onPress={onAdd}
          accessibilityLabel="Add price alert"
          style={styles.addButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: spacing.fieldGap,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.button,
  },
});
