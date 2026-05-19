import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import {
  AlertFormContent,
  AlertFormNotFound,
} from "@/components/organisms/AlertFormContent";
import { colors } from "@/constants/theme";
import { useAlert } from "@/hooks/useAlert";

export default function EditAlertScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resolvedId = typeof id === "string" ? id : "";
  const alert = useAlert(resolvedId);

  if (alert.isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (alert.isError || !alert.data) {
    return <AlertFormNotFound />;
  }

  return <AlertFormContent mode="edit" alert={alert.data} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
});
