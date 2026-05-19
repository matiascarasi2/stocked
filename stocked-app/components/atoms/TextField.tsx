import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { colors, radii, sizes, typography } from "@/constants/theme";

type TextFieldProps = TextInputProps;

export function TextField({ style, placeholderTextColor, ...props }: TextFieldProps) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={placeholderTextColor ?? colors.placeholder}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: sizes.inputHeight,
    borderRadius: radii.input,
    borderWidth: 0.695,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: typography.body.fontSize,
    fontFamily: typography.body.fontFamily,
    color: colors.text,
  },
});
