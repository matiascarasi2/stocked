import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { colors, radii, sizes, spacing } from "@/constants/theme";

type AlertSymbolDisplayProps = {
  label?: string;
  symbol: string;
  helperText?: string;
};

export function AlertSymbolDisplay({
  label = "Stock Symbol",
  symbol,
  helperText = "Symbol cannot be changed",
}: AlertSymbolDisplayProps) {
  return (
    <View style={styles.container}>
      <AppText variant="label">{label}</AppText>
      <View style={styles.display} accessibilityRole="text">
        <Ionicons
          name="lock-closed-outline"
          size={sizes.headerIcon}
          color={colors.textMuted}
          style={styles.lockIcon}
        />
        <AppText variant="stockSymbol" style={styles.symbol}>
          {symbol}
        </AppText>
      </View>
      {helperText ? (
        <AppText variant="chartAxis" color={colors.chartAxis}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.labelGap,
  },
  display: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: sizes.inputHeight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.input,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  lockIcon: {
    marginRight: 10,
  },
  symbol: {
    flex: 1,
  },
});
