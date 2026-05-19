import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { IconButton } from "@/components/atoms/IconButton";
import { colors, spacing } from "@/constants/theme";

type StocksHeaderProps = {
  onNotificationsPress?: () => void;
  onLogoutPress?: () => void;
  isLoggingOut?: boolean;
};

export function StocksHeader({
  onNotificationsPress,
  onLogoutPress,
  isLoggingOut = false,
}: StocksHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText variant="screenTitle">Stocks</AppText>
      <View style={styles.actions}>
        <IconButton
          name="notifications-outline"
          accessibilityLabel="Price alerts"
          onPress={onNotificationsPress}
        />
        <IconButton
          name="log-out-outline"
          accessibilityLabel="Log out"
          onPress={onLogoutPress}
          disabled={isLoggingOut}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
