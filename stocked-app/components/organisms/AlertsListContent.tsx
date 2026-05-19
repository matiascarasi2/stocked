import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert as RNAlert,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { AlertListRow } from "@/components/molecules/AlertListRow";
import { AlertsListHeader } from "@/components/molecules/AlertsListHeader";
import { colors, spacing } from "@/constants/theme";
import { useAlerts } from "@/hooks/useAlerts";
import { useDeleteAlert } from "@/hooks/useDeleteAlert";
import { ApiError } from "@/lib/api/types";

export function AlertsListContent() {
  const router = useRouter();
  const alerts = useAlerts();
  const deleteAlert = useDeleteAlert();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    RNAlert.alert(
      "Delete alert",
      "Are you sure you want to delete this price alert?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDeletingId(id);
            deleteAlert.mutate(id, {
              onSettled: () => setDeletingId(null),
            });
          },
        },
      ],
    );
  };

  const errorMessage = (() => {
    if (alerts.error instanceof ApiError) {
      return alerts.error.message;
    }
    if (alerts.error) {
      return "Something went wrong. Please try again.";
    }
    return null;
  })();

  const emptyMessage =
    !alerts.isLoading && !errorMessage && (alerts.data?.length ?? 0) === 0
      ? "No price alerts yet."
      : null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <AlertsListHeader
          onBack={() => router.back()}
          onAdd={() => router.push("/alerts/new")}
        />
        {alerts.isLoading ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : errorMessage ? (
          <View style={styles.state}>
            <AppText variant="body" color={colors.textMuted} center>
              {errorMessage}
            </AppText>
          </View>
        ) : emptyMessage ? (
          <View style={styles.state}>
            <AppText variant="body" color={colors.textMuted} center>
              {emptyMessage}
            </AppText>
          </View>
        ) : (
          <FlatList
            data={alerts.data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AlertListRow
                alert={item}
                onEdit={(id) => router.push(`/alerts/${id}/edit`)}
                onDelete={handleDelete}
                isDeleting={deletingId === item.id}
              />
            )}
            style={styles.list}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.screen,
  },
});
