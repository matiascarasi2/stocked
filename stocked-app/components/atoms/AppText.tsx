import { Text, type TextProps, type TextStyle } from "react-native";

import { colors, typography } from "@/constants/theme";

type TextVariant = keyof typeof typography;

type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
  center?: boolean;
};

export function AppText({
  variant = "body",
  color = colors.text,
  center = false,
  style,
  ...props
}: AppTextProps) {
  const variantStyle = typography[variant] as TextStyle;

  return (
    <Text
      style={[
        variantStyle,
        { color },
        center && { textAlign: "center" },
        style,
      ]}
      {...props}
    />
  );
}
