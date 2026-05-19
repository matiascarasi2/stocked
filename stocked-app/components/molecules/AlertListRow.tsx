import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { IconButton } from "@/components/atoms/IconButton";
import { colors, sizes, spacing } from "@/constants/theme";
import { formatAlertDate } from "@/lib/alerts/format";
import type { Alert } from "@/lib/api/types";

type AlertListRowProps = {
  alert: Alert;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
};

export function AlertListRow({
  alert,
  onEdit,
  onDelete,
  isDeleting = false,
}: AlertListRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <AppText variant="stockSymbol">{alert.stockSymbol}</AppText>
        <AppText variant="chartAxis" color={colors.chartAxis}>
          {formatAlertDate(alert.createdAt)}
        </AppText>
      </View>
      <View style={styles.actions}>
        <IconButton
          name="create-outline"
          color={colors.primary}
          onPress={() => onEdit(alert.id)}
          disabled={isDeleting}
          accessibilityLabel={`Edit alert for ${alert.stockSymbol}`}
        />
        <IconButton
          name="trash-outline"
          color={colors.negative}
          onPress={() => onDelete(alert.id)}
          disabled={isDeleting}
          accessibilityLabel={`Delete alert for ${alert.stockSymbol}`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: sizes.listRowMinHeight - 3,
    paddingHorizontal: spacing.screen,
    paddingTop: 16,
    paddingBottom: 16.7,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.white,
  },
  info: {
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
