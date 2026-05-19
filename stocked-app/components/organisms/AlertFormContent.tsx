import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Button } from "@/components/atoms/Button";
import { AlertFormField } from "@/components/molecules/AlertFormField";
import { AlertSymbolDisplay } from "@/components/molecules/AlertSymbolDisplay";
import { BackButton } from "@/components/molecules/BackButton";
import { StockSymbolSearchField } from "@/components/molecules/StockSymbolSearchField";
import { colors, spacing } from "@/constants/theme";
import { useCreateAlert } from "@/hooks/useCreateAlert";
import { useUpdateAlert } from "@/hooks/useUpdateAlert";
import { formatAlertPrice } from "@/lib/alerts/format";
import {
  AlertValidationError,
  parseAlertPrices,
  parseStockSymbol,
} from "@/lib/alerts/validation";
import type { Alert } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

type AlertFormContentProps =
  | {
      mode: "create";
      initialSymbol?: string;
    }
  | {
      mode: "edit";
      alert: Alert;
    };

const OPTIONAL_PLACEHOLDER = "Optional";

export function AlertFormNotFound() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <BackButton onPress={() => router.back()} />
        <View style={styles.notFound}>
          <AppText variant="body" color={colors.textMuted} center>
            Alert not found.
          </AppText>
        </View>
      </SafeAreaView>
    </View>
  );
}

export function AlertFormContent(props: AlertFormContentProps) {
  const router = useRouter();
  const createAlert = useCreateAlert();
  const updateAlert = useUpdateAlert();

  const isCreate = props.mode === "create";
  const title = isCreate ? "New Price Alert" : "Edit Alert";
  const submitLabel = isCreate ? "Create Alert" : "Update Alert";
  const symbolLocked = isCreate && Boolean(props.initialSymbol);

  const [stockSymbol, setStockSymbol] = useState(
    isCreate ? (props.initialSymbol ?? "") : props.alert.stockSymbol,
  );
  const [minPrice, setMinPrice] = useState(
    isCreate ? "" : formatAlertPrice(props.alert.minPrice),
  );
  const [maxPrice, setMaxPrice] = useState(
    isCreate ? "" : formatAlertPrice(props.alert.maxPrice),
  );
  const [formError, setFormError] = useState<string | null>(null);

  const isPending = createAlert.isPending || updateAlert.isPending;

  const handleSubmit = () => {
    setFormError(null);

    try {
      const symbol = parseStockSymbol(stockSymbol);
      const { minPrice: parsedMin, maxPrice: parsedMax } = parseAlertPrices(
        minPrice,
        maxPrice,
      );

      if (isCreate) {
        createAlert.mutate(
          {
            stockSymbol: symbol,
            minPrice: parsedMin,
            maxPrice: parsedMax,
          },
          {
            onSuccess: () => router.back(),
            onError: (error) => {
              setFormError(resolveErrorMessage(error));
            },
          },
        );
        return;
      }

      const body: {
        minPrice?: number | null;
        maxPrice?: number | null;
      } = {};

      if (parsedMin !== props.alert.minPrice) {
        body.minPrice = parsedMin;
      }
      if (parsedMax !== props.alert.maxPrice) {
        body.maxPrice = parsedMax;
      }

      if (body.minPrice === undefined && body.maxPrice === undefined) {
        router.back();
        return;
      }

      updateAlert.mutate(
        { id: props.alert.id, body },
        {
          onSuccess: () => router.back(),
          onError: (error) => {
            setFormError(resolveErrorMessage(error));
          },
        },
      );
    } catch (error) {
      setFormError(resolveErrorMessage(error));
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <AppText variant="screenTitle" style={styles.title}>
            {title}
          </AppText>
        </View>

        <View style={styles.form}>
          {isCreate && !symbolLocked ? (
            <StockSymbolSearchField
              label="Stock Symbol"
              value={stockSymbol}
              onChange={setStockSymbol}
            />
          ) : (
            <AlertSymbolDisplay
              symbol={stockSymbol}
              helperText={
                symbolLocked
                  ? "Symbol is set from the stock you selected"
                  : "Symbol cannot be changed"
              }
            />
          )}
          <AlertFormField
            label="Minimum Price ($)"
            value={minPrice}
            onChangeText={setMinPrice}
            placeholder={OPTIONAL_PLACEHOLDER}
            editable
            keyboardType="decimal-pad"
            helperText="Alert when price falls below this value"
            accessibilityLabel="Minimum price"
          />
          <AlertFormField
            label="Maximum Price ($)"
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder={OPTIONAL_PLACEHOLDER}
            editable
            keyboardType="decimal-pad"
            helperText="Alert when price rises above this value"
            accessibilityLabel="Maximum price"
          />
          {formError ? (
            <AppText variant="body" color={colors.negative}>
              {formError}
            </AppText>
          ) : null}
          <Button
            label={submitLabel}
            onPress={handleSubmit}
            disabled={isPending}
            accessibilityLabel={submitLabel}
            accessibilityState={{ disabled: isPending }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof AlertValidationError) {
    return error.message;
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: spacing.fieldGap,
  },
  title: {
    paddingHorizontal: spacing.screen,
  },
  form: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.screen,
    gap: spacing.screen,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.screen,
  },
});
