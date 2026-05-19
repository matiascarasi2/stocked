import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { TextField } from "@/components/atoms/TextField";
import { colors, sizes, spacing } from "@/constants/theme";

type StocksSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  compact?: boolean;
  accessibilityLabel?: string;
};

export function StocksSearchBar({
  value,
  onChangeText,
  placeholder = "Search stocks...",
  compact = false,
  accessibilityLabel = "Search stocks",
}: StocksSearchBarProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="search-outline"
          size={sizes.headerIcon}
          color={colors.placeholder}
          style={styles.icon}
        />
        <TextField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          autoCapitalize="characters"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel={accessibilityLabel}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screen,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  containerCompact: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  icon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  input: {
    paddingLeft: 40,
    paddingRight: 16,
  },
});
