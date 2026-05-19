import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { colors, radii, sizes } from "@/constants/theme";

type ButtonVariant = "primary" | "outline";

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = "primary",
  style,
  disabled,
  ...props
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      <AppText
        variant="body"
        color={isPrimary ? colors.white : colors.primary}
        center
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.buttonHeight,
    borderRadius: radii.button,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1.39,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
