import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { StockListRow } from "@/components/molecules/StockListRow";
import { StocksSearchBar } from "@/components/molecules/StocksSearchBar";
import { colors, spacing } from "@/constants/theme";
import { useStockSearch } from "@/hooks/useStockSearch";
import { ApiError } from "@/lib/api/types";

type StockSymbolSearchFieldProps = {
  label: string;
  value: string;
  onChange: (symbol: string) => void;
};

const SYMBOL_PLACEHOLDER = "Search stock symbol...";

export function StockSymbolSearchField({
  label,
  value,
  onChange,
}: StockSymbolSearchFieldProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const search = useStockSearch(searchQuery);

  const handleChangeText = (text: string) => {
    setSearchQuery(text);
    onChange(text);
    setIsDropdownOpen(true);
  };

  const handleSelect = (symbol: string) => {
    setSearchQuery(symbol);
    onChange(symbol);
    setIsDropdownOpen(false);
    Keyboard.dismiss();
  };

  const showResults = search.isSearching && isDropdownOpen;
  const results = search.data ?? [];

  const resultsMessage = (() => {
    if (search.error instanceof ApiError) {
      return search.error.message;
    }
    if (search.error) {
      return "Something went wrong. Please try again.";
    }
    if (search.isLoading) {
      return null;
    }
    if (results.length === 0) {
      return "No stocks match your search.";
    }
    return null;
  })();

  return (
    <View style={styles.container}>
      <AppText variant="label">{label}</AppText>
      <StocksSearchBar
        value={searchQuery}
        onChangeText={handleChangeText}
        placeholder={SYMBOL_PLACEHOLDER}
        compact
        accessibilityLabel="Search stock symbol"
      />
      {showResults ? (
        <View style={styles.results}>
          {search.isLoading ? (
            <View style={styles.resultsState}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : resultsMessage ? (
            <View style={styles.resultsState}>
              <AppText variant="body" color={colors.textMuted} center>
                {resultsMessage}
              </AppText>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.symbol}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={styles.resultsList}
              renderItem={({ item }) => (
                <StockListRow
                  stock={item}
                  onPress={() => handleSelect(item.symbol)}
                />
              )}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.labelGap,
  },
  results: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  resultsList: {
    flexGrow: 0,
  },
  resultsState: {
    paddingVertical: spacing.screen,
    paddingHorizontal: spacing.screen,
    alignItems: "center",
  },
});
