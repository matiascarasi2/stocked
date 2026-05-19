import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { colors } from "@/constants/theme";
import type { ChartXAxisTick } from "@/lib/stocks/chartData";

type ChartXAxisProps = {
  ticks: ChartXAxisTick[];
  pointCount: number;
  plotWidth: number;
};

export function ChartXAxis({ ticks, pointCount, plotWidth }: ChartXAxisProps) {
  if (ticks.length === 0 || plotWidth <= 0) {
    return null;
  }

  const lastIndex = Math.max(pointCount - 1, 0);

  return (
    <View style={[styles.container, { width: plotWidth }]}>
      {ticks.map(({ index, label }) => {
        const isFirst = index === 0;
        const isLast = index === lastIndex;
        const position =
          lastIndex === 0 ? 0 : (index / lastIndex) * plotWidth;

        return (
          <AppText
            key={`${index}-${label}`}
            variant="chartAxis"
            color={colors.chartAxis}
            numberOfLines={1}
            style={[
              styles.label,
              isFirst && styles.labelFirst,
              isLast && !isFirst && styles.labelLast,
              !isFirst && !isLast && { left: position },
            ]}
          >
            {label}
          </AppText>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 22,
    position: "relative",
  },
  label: {
    position: "absolute",
    bottom: 0,
    maxWidth: 72,
    transform: [{ translateX: "-50%" }],
  },
  labelFirst: {
    left: 0,
    transform: undefined,
    textAlign: "left",
  },
  labelLast: {
    right: 0,
    left: undefined,
    transform: undefined,
    textAlign: "right",
  },
});
