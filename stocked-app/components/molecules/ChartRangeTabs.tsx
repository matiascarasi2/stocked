import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { colors, radii } from "@/constants/theme";
import type { ChartRange } from "@/lib/api/types";

const RANGES: ChartRange[] = ["1M", "3M", "6M", "1Y"];

type ChartRangeTabsProps = {
  selected: ChartRange;
  onSelect: (range: ChartRange) => void;
};

export function ChartRangeTabs({ selected, onSelect }: ChartRangeTabsProps) {
  return (
    <View style={styles.row}>
      {RANGES.map((range) => {
        const isActive = range === selected;

        return (
          <Pressable
            key={range}
            onPress={() => onSelect(range)}
            style={({ pressed }) => [
              styles.tab,
              isActive ? styles.tabActive : styles.tabInactive,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${range} chart range`}
          >
            <AppText
              variant="body"
              color={isActive ? colors.white : colors.rangeInactiveText}
              style={styles.tabLabel}
            >
              {range}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    height: 40,
    minWidth: 50,
    paddingHorizontal: 16,
    borderRadius: radii.button,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabInactive: {
    backgroundColor: colors.rangeInactiveBg,
  },
  tabLabel: {
    fontFamily: "Inter_500Medium",
  },
  pressed: {
    opacity: 0.85,
  },
});
