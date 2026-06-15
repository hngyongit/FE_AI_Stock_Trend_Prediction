import { StyleSheet, View } from 'react-native';

import { SearchDiscoverySections } from '@/features/search/components/SearchDiscoverySections';
import { SearchGlassIcon } from '@/features/search/components/SearchIcons';
import type { StockListItem } from '@/features/stocks/types';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { Input, Text } from '@/shared/ui';

type SearchHeaderPanelProps = {
  isDirectoryVisible: boolean;
  onChangeQuery: (value: string) => void;
  onOpenSymbol: (symbol: string) => void;
  onViewAll: () => void;
  quickAccessActionLabel: string;
  query: string;
  quickAccessItems: StockListItem[];
  recentSearches: readonly string[];
  resultLabel: string;
  trendingItems: StockListItem[];
};

export function SearchHeaderPanel({
  isDirectoryVisible,
  onChangeQuery,
  onOpenSymbol,
  onViewAll,
  quickAccessActionLabel,
  query,
  quickAccessItems,
  recentSearches,
  resultLabel,
  trendingItems,
}: SearchHeaderPanelProps) {
  return (
    <View style={styles.headerShell}>
      <Text style={styles.screenTitle}>Search</Text>
      <View style={styles.discoveryShell}>
        <Input
          autoCapitalize="characters"
          leftIcon={<SearchGlassIcon color={palette.primarySoft} />}
          onChangeText={onChangeQuery}
          placeholder="Search tickers, companies..."
          style={styles.inputWrapper}
          value={query}
        />
        <SearchDiscoverySections
          onOpenSymbol={onOpenSymbol}
          onViewAll={onViewAll}
          quickAccessActionLabel={quickAccessActionLabel}
          quickAccessItems={quickAccessItems}
          recentSearches={recentSearches}
          trendingItems={trendingItems}
        />
        {isDirectoryVisible ? (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Search Results</Text>
            <Text style={styles.resultLabel}>{resultLabel}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerShell: {
    paddingBottom: spacing.md,
  },
  screenTitle: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: spacing.md,
  },
  discoveryShell: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
  },
  inputWrapper: {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: radius.control,
    marginBottom: spacing.lg,
  },
  resultsHeader: {
    borderTopColor: palette.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  resultsTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  resultLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
