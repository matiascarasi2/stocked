import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { LineChart, yAxisSides } from "react-native-gifted-charts";

import { ChartTooltip } from "@/components/molecules/ChartTooltip";
import { ChartXAxis } from "@/components/molecules/ChartXAxis";
import { colors, typography } from "@/constants/theme";
import type { StockChartPoint } from "@/lib/api/types";
import {
  getChartPlotWidth,
  toGiftedChartData,
  type StockChartDataItem,
} from "@/lib/stocks/chartData";
import { formatChartYAxis } from "@/lib/stocks/formatPrice";

const CHART_HEIGHT = 500;
const Y_AXIS_LABEL_WIDTH = 44;

type StockLineChartProps = {
  points: StockChartPoint[];
  width: number;
};

export function StockLineChart({ points, width }: StockLineChartProps) {
  const { data, xAxisTicks } = useMemo(
    () => toGiftedChartData(points),
    [points],
  );
  const plotWidth = getChartPlotWidth(width, Y_AXIS_LABEL_WIDTH);

  const pointerConfig = useMemo(
    () => ({
      activatePointersInstantlyOnTouch: true,
      persistPointer: true,
      resetPointerIndexOnRelease: false,
      pointerStripUptoDataPoint: true,
      pointerStripColor: colors.chartCursor,
      pointerStripWidth: 1,
      pointerColor: colors.primary,
      radius: 4,
      autoAdjustPointerLabelPosition: true,
      pointerLabelWidth: 120,
      pointerLabelHeight: 56,
      pointerLabelComponent: (items: StockChartDataItem[]) => {
        const item = items[0];
        const price = item?.value;
        if (!item?.date || typeof price !== "number" || !Number.isFinite(price)) {
          return null;
        }

        return <ChartTooltip date={item.date} price={price} />;
      },
    }),
    [],
  );

  if (points.length === 0 || width <= 0) {
    return <View style={styles.placeholder} />;
  }

  return (
    <View style={styles.container}>
      <LineChart
        data={data}
        width={width}
        height={CHART_HEIGHT}
        adjustToWidth
        initialSpacing={0}
        endSpacing={0}
        areaChart
        curved={false}
        color={colors.primary}
        thickness={2}
        startFillColor={colors.primary}
        endFillColor={colors.white}
        startOpacity={0.22}
        endOpacity={0}
        hideDataPoints
        formatYLabel={formatChartYAxis}
        yAxisSide={yAxisSides.RIGHT}
        yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
        yAxisTextStyle={styles.yAxisLabel}
        yAxisColor="transparent"
        yAxisThickness={0}
        rulesType="dashed"
        rulesColor={colors.chartGrid}
        dashWidth={4}
        dashGap={4}
        noOfSections={4}
        xAxisColor={colors.chartGrid}
        xAxisThickness={1}
        xAxisLabelsHeight={0}
        pointerConfig={pointerConfig}
      />
      <ChartXAxis
        ticks={xAxisTicks}
        pointCount={points.length}
        plotWidth={plotWidth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  placeholder: {
    height: CHART_HEIGHT,
  },
  yAxisLabel: {
    color: colors.chartAxis,
    fontSize: typography.chartAxis.fontSize,
    fontFamily: typography.chartAxis.fontFamily,
  },
});
