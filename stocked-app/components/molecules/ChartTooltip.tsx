import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { colors, radii } from "@/constants/theme";
import { formatAxisDate } from "@/lib/stocks/chartData";

type ChartTooltipProps = {
  date?: string;
  price?: number;
};

export function ChartTooltip({ date, price }: ChartTooltipProps) {
  if (!date || typeof price !== "number" || !Number.isFinite(price)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppText variant="footer" color={colors.text}>
        {formatAxisDate(date)}
      </AppText>
      <AppText variant="footer" color={colors.primary}>
        {`price : ${price.toFixed(2)}`}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radii.input,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
