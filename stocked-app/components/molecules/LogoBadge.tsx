import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { colors, sizes } from "@/constants/theme";

export function LogoBadge() {
  return (
    <View style={styles.container}>
      <Ionicons name="trending-up" size={sizes.icon} color={colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: sizes.logo,
    height: sizes.logo,
    borderRadius: sizes.logo / 2,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
