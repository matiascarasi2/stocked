import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { BackButton } from "@/components/molecules/BackButton";
import { colors, sizes, spacing } from "@/constants/theme";
import {
  formatPriceChange,
  formatUsd,
  type PriceSummary,
} from "@/lib/stocks/formatPrice";

type StockDetailHeaderProps = {
  symbol: string;
  name?: string;
  priceSummary: PriceSummary | null;
  onBack: () => void;
};

export function StockDetailHeader({
  symbol,
  name,
  priceSummary,
  onBack,
}: StockDetailHeaderProps) {
  const isPositive =
    priceSummary?.change != null ? priceSummary.change >= 0 : true;
  const changeColor = isPositive ? colors.positive : colors.negative;
  const trendIcon = isPositive ? "trending-up" : "trending-down";

  return (
    <View style={styles.container}>
      <BackButton onPress={onBack} />
      <View style={styles.infoRow}>
        <View style={styles.leftColumn}>
          <View style={styles.symbolRow}>
            <AppText variant="stockDetailPrice">{symbol}</AppText>
            {priceSummary?.change != null ? (
              <Ionicons
                name={trendIcon}
                size={sizes.trendIcon}
                color={changeColor}
              />
            ) : null}
          </View>
          {name ? (
            <AppText variant="body" color={colors.textMuted}>
              {name}
            </AppText>
          ) : null}
        </View>
        <View style={styles.rightColumn}>
          <AppText variant="stockDetailPrice" style={styles.priceText}>
            {priceSummary ? formatUsd(priceSummary.price) : "—"}
          </AppText>
          {priceSummary?.change != null &&
          priceSummary.changePercent != null ? (
            <AppText variant="footer" color={changeColor} style={styles.changeText}>
              {formatPriceChange(
                priceSummary.change,
                priceSummary.changePercent,
              )}
            </AppText>
          ) : null}
        </View>
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.screen,
    gap: spacing.fieldGap,
  },
  leftColumn: {
    flex: 1,
    gap: 4,
  },
  symbolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rightColumn: {
    alignItems: "flex-end",
    gap: 4,
  },
  priceText: {
    textAlign: "right",
  },
  changeText: {
    textAlign: "right",
  },
});
