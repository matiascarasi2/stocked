import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { TextField } from "@/components/atoms/TextField";
import { spacing } from "@/constants/theme";
import type { TextInputProps } from "react-native";

type FormFieldProps = TextInputProps & {
  label: string;
};

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <AppText variant="label">{label}</AppText>
      <TextField {...inputProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.labelGap,
  },
});
