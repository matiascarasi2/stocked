import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { colors, sizes, spacing } from "@/constants/theme";
import type { StockQuote } from "@/lib/api/types";
import { formatPriceChange, formatUsd } from "@/lib/stocks/formatPrice";

type StockListRowProps = {
  stock: StockQuote;
  onPress?: () => void;
};

export function StockListRow({ stock, onPress }: StockListRowProps) {
  const hasQuote =
    stock.price != null &&
    stock.change != null &&
    stock.changePercent != null;
  const isPositive = hasQuote ? stock.change! >= 0 : true;
  const changeColor = isPositive ? colors.positive : colors.negative;
  const trendIcon = isPositive ? "trending-up" : "trending-down";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${stock.symbol}, ${stock.name}`}
    >
      <View style={styles.content}>
        <View style={styles.leftColumn}>
          <View style={styles.symbolRow}>
            <AppText variant="stockSymbol">{stock.symbol}</AppText>
            {hasQuote ? (
              <Ionicons
                name={trendIcon}
                size={sizes.trendIcon}
                color={changeColor}
              />
            ) : null}
          </View>
          <AppText variant="footer" color={colors.textMuted}>
            {stock.name}
          </AppText>
        </View>
        {hasQuote ? (
          <View style={styles.rightColumn}>
            <AppText variant="stockSymbol" style={styles.priceText}>
              {formatUsd(stock.price!)}
            </AppText>
            <AppText variant="footer" color={changeColor} style={styles.changeText}>
              {formatPriceChange(stock.change!, stock.changePercent!)}
            </AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: sizes.listRowMinHeight,
    paddingHorizontal: spacing.screen,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
