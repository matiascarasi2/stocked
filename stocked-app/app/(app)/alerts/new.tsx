import { useLocalSearchParams } from "expo-router";

import { AlertFormContent } from "@/components/organisms/AlertFormContent";

export default function NewAlertScreen() {
  const { symbol } = useLocalSearchParams<{ symbol?: string }>();
  const initialSymbol = typeof symbol === "string" ? symbol : undefined;

  return <AlertFormContent mode="create" initialSymbol={initialSymbol} />;
}
