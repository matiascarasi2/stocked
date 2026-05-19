import { useLocalSearchParams } from "expo-router";

import { StockDetailContent } from "@/components/organisms/StockDetailContent";

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const resolvedSymbol =
    typeof symbol === "string" ? symbol.trim().toUpperCase() : "";

  return <StockDetailContent symbol={resolvedSymbol} />;
}
