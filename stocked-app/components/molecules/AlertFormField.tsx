import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import type { TextInputProps } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { TextField } from "@/components/atoms/TextField";
import { colors, sizes, spacing } from "@/constants/theme";

type AlertFormFieldProps = TextInputProps & {
  label: string;
  helperText?: string;
  showSearchIcon?: boolean;
};

export function AlertFormField({
  label,
  helperText,
  showSearchIcon = false,
  style,
  ...inputProps
}: AlertFormFieldProps) {
  return (
    <View style={styles.container}>
      <AppText variant="label">{label}</AppText>
      <View style={styles.inputWrapper}>
        {showSearchIcon ? (
          <Ionicons
            name="search-outline"
            size={sizes.headerIcon}
            color={colors.placeholder}
            style={styles.searchIcon}
          />
        ) : null}
        <TextField
          style={[showSearchIcon && styles.inputWithIcon, style]}
          {...inputProps}
        />
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
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 40,
  },
});
