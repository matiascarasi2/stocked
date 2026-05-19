import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { StockListRow } from "@/components/molecules/StockListRow";
import { StocksHeader } from "@/components/molecules/StocksHeader";
import { StocksSearchBar } from "@/components/molecules/StocksSearchBar";
import { colors, spacing } from "@/constants/theme";
import { useSession } from "@/contexts/SessionContext";
import { usePopularStocks } from "@/hooks/usePopularStocks";
import { useStockSearch } from "@/hooks/useStockSearch";
import { useWatchedStocks } from "@/hooks/useWatchedStocks";
import { ApiError } from "@/lib/api/types";
import type { StockQuote } from "@/lib/api/types";

type HomeSection = {
  title: string;
  data: StockQuote[];
};

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function StocksHomeContent() {
  const router = useRouter();
  const { signOut } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  const watched = useWatchedStocks();
  const popular = usePopularStocks();
  const search = useStockSearch(searchQuery);

  const isSearching = search.isSearching;

  const sections = useMemo((): HomeSection[] => {
    const result: HomeSection[] = [];

    const watchedStocks = watched.data ?? [];
    if (watchedStocks.length > 0) {
      result.push({ title: "Your stocks", data: watchedStocks });
    }

    const popularStocks = popular.data ?? [];
    if (popularStocks.length > 0) {
      result.push({ title: "Popular", data: popularStocks });
    }

    return result;
  }, [watched.data, popular.data]);

  const isLoading = isSearching
    ? search.isLoading
    : watched.isLoading || popular.isLoading;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  const emptyMessage = (() => {
    if (isSearching) {
      if (search.error) {
        return getErrorMessage(search.error);
      }

      if (search.isLoading) {
        return null;
      }

      if ((search.data?.length ?? 0) === 0) {
        return "No stocks match your search.";
      }

      return null;
    }

    if (!isLoading && sections.length === 0) {
      const error = watched.error ?? popular.error;
      if (error) {
        return getErrorMessage(error);
      }

      return "No stocks available right now. Pull to refresh or try again later.";
    }

    return null;
  })();

  const searchResults = search.data ?? [];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StocksHeader
          onNotificationsPress={() => router.push("/alerts")}
          onLogoutPress={() => void handleSignOut()}
          isLoggingOut={isSigningOut}
        />
        <StocksSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {isSearching ? (
          <SectionList
            sections={[{ title: "", data: searchResults }]}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <StockListRow
                stock={item}
                onPress={() => router.push(`/stock/${item.symbol}`)}
              />
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            renderSectionHeader={() => null}
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.empty}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : emptyMessage ? (
                <View style={styles.empty}>
                  <AppText variant="body" color={colors.textMuted} center>
                    {emptyMessage}
                  </AppText>
                </View>
              ) : null
            }
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <StockListRow
                stock={item}
                onPress={() => router.push(`/stock/${item.symbol}`)}
              />
            )}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <AppText variant="label" color={colors.textMuted}>
                  {section.title}
                </AppText>
              </View>
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            stickySectionHeadersEnabled={false}
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.empty}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : emptyMessage ? (
                <View style={styles.empty}>
                  <AppText variant="body" color={colors.textMuted} center>
                    {emptyMessage}
                  </AppText>
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  safeArea: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  sectionHeader: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.fieldGap,
    paddingBottom: spacing.labelGap,
    backgroundColor: colors.surface,
  },
  empty: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sectionGap,
  },
});
