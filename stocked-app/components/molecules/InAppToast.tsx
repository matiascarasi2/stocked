import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { colors, radii, spacing } from "@/constants/theme";
import type { ToastPayload } from "@/lib/toast";

const TOAST_DURATION_MS = 4500;

type InAppToastProps = {
  toast: ToastPayload;
  onDismiss: () => void;
};

export function InAppToast({ toast, onDismiss }: InAppToastProps) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -12,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onDismiss();
      }
    });
  }, [onDismiss, opacity, translateY]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    dismissTimer.current = setTimeout(dismiss, TOAST_DURATION_MS);

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, [dismiss, opacity, translateY]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.host,
        {
          top: insets.top + spacing.labelGap,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        onPress={dismiss}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        accessibilityRole="alert"
        accessibilityLabel={`${toast.title}. ${toast.body}`}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="notifications" size={20} color={colors.primary} />
        </View>
        <View style={styles.copy}>
          <AppText variant="label" numberOfLines={1}>
            {toast.title}
          </AppText>
          <AppText variant="footer" color={colors.textMuted} numberOfLines={2}>
            {toast.body}
          </AppText>
        </View>
        <Ionicons name="close" size={18} color={colors.chartAxis} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: spacing.screen,
    right: spacing.screen,
    zIndex: 1000,
    elevation: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.labelGap,
    paddingHorizontal: spacing.labelGap,
    paddingVertical: 12,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.white,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.welcomeGradientStart,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
