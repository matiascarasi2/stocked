import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Button } from "@/components/atoms/Button";
import { ChartRangeTabs } from "@/components/molecules/ChartRangeTabs";
import { StockDetailHeader } from "@/components/molecules/StockDetailHeader";
import { StockLineChart } from "@/components/molecules/StockLineChart";
import { colors, spacing } from "@/constants/theme";
import { useStock } from "@/hooks/useStock";
import { useStockChart } from "@/hooks/useStockChart";
import type { ChartRange } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { derivePriceSummary } from "@/lib/stocks/formatPrice";

type StockDetailContentProps = {
  symbol: string;
};

export function StockDetailContent({ symbol }: StockDetailContentProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [range, setRange] = useState<ChartRange>("1M");

  const stock = useStock(symbol);
  const chart = useStockChart(symbol, range);

  const chartWidth = width;
  const points = chart.data?.points ?? [];
  const priceSummary = derivePriceSummary(points);

  const displaySymbol = stock.data?.symbol ?? symbol;
  const displayName = stock.data?.name;

  const isLoading = stock.isLoading || chart.isLoading;
  const error = stock.error ?? chart.error;

  const errorMessage = (() => {
    if (!symbol) {
      return "Invalid stock symbol.";
    }
    if (error instanceof ApiError) {
      return error.message;
    }
    if (error) {
      return "Something went wrong. Please try again.";
    }
    return null;
  })();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <StockDetailHeader
          symbol={displaySymbol}
          name={displayName}
          priceSummary={priceSummary}
          onBack={() => router.back()}
        />

        <View style={styles.body}>
          <ChartRangeTabs selected={range} onSelect={setRange} />

          <View style={styles.chartAreaBleed}>
            {isLoading ? (
              <View style={styles.chartState}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : errorMessage ? (
              <View style={styles.chartState}>
                <AppText variant="body" color={colors.textMuted} center>
                  {errorMessage}
                </AppText>
              </View>
            ) : points.length === 0 ? (
              <View style={styles.chartState}>
                <AppText variant="body" color={colors.textMuted} center>
                  No chart data available.
                </AppText>
              </View>
            ) : (
              <StockLineChart
                key={range}
                points={points}
                width={chartWidth}
              />
            )}
          </View>

          <Button
            label="Set Price Alert"
            onPress={() =>
              router.push({
                pathname: "/alerts/new",
                params: { symbol: displaySymbol },
              })
            }
            accessibilityLabel="Set Price Alert"
            style={styles.cta}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.screen,
    gap: spacing.screen,
  },
  chartAreaBleed: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: -spacing.screen,
  },
  chartState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.screen,
  },
  cta: {
    marginBottom: spacing.fieldGap,
  },
});
