import { Pressable, StyleSheet, View } from 'react-native';

import type { StockListItem } from '@/features/stocks/types';
import {
  QUICK_ACCESS_FALLBACKS,
  QUICK_ACCESS_SYMBOLS,
} from '@/features/search/constants';
import { TrendingArrowIcon } from '@/features/search/components/SearchIcons';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { formatPercent, formatPrice } from '@/shared/utils/format';
import { Text } from '@/shared/ui';

type SearchDiscoverySectionsProps = {
  onOpenSymbol: (symbol: string) => void;
  onViewAll: () => void;
  quickAccessActionLabel: string;
  recentSearches: readonly string[];
  trendingItems: StockListItem[];
  quickAccessItems: StockListItem[];
};

function changeTone(value: number | null | undefined) {
  if (value == null || value === 0) {
    return palette.textSecondary;
  }

  return value > 0 ? palette.positive : palette.negative;
}

export function SearchDiscoverySections({
  onOpenSymbol,
  onViewAll,
  quickAccessActionLabel,
  recentSearches,
  trendingItems,
  quickAccessItems,
}: SearchDiscoverySectionsProps) {
  const quickAccessMap = new Map(quickAccessItems.map((item) => [item.symbol, item]));

  return (
    <View style={styles.shell}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Searches</Text>
        <View style={styles.chipWrap}>
          {recentSearches.map((entry) => (
            <Pressable
              key={entry}
              accessibilityRole="button"
              onPress={() => onOpenSymbol(entry)}
              style={({ pressed }) => [styles.recentChip, pressed && styles.pressed]}>
              <Text style={styles.recentChipText}>{entry}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.trendingCard}>
        <View style={styles.trendingHeader}>
          <TrendingArrowIcon color={palette.positive} size={18} />
          <Text style={styles.trendingTitle}>Trending Stocks</Text>
        </View>
        <View style={styles.trendingList}>
          {trendingItems.length === 0 ? (
            <Text style={styles.emptyTrendingText}>No momentum data available right now.</Text>
          ) : null}
          {trendingItems.map((item, index) => {
            const tone = changeTone(item.changePercent);

            return (
              <Pressable
                key={item.symbol}
                accessibilityRole="button"
                onPress={() => onOpenSymbol(item.symbol)}
                style={({ pressed }) => [styles.trendingRow, pressed && styles.pressed]}>
                <Text style={styles.rankLabel}>#{index + 1}</Text>
                <View style={styles.trendingInfo}>
                  <Text style={styles.symbolText}>{item.symbol}</Text>
                  <Text numberOfLines={1} style={styles.companyText}>
                    {item.companyName ?? 'Vietnam stock'}
                  </Text>
                </View>
                <View style={styles.trendingMeta}>
                  <Text style={styles.priceText}>{formatPrice(item.latestClosePrice)}</Text>
                  <Text style={[styles.changeText, { color: tone }]}>
                    {formatPercent(item.changePercent)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.quickHeader}>
          <Text style={styles.sectionTitle}>VN30 Quick Access</Text>
          <Pressable accessibilityRole="button" onPress={onViewAll}>
            <Text style={styles.viewAllText}>{quickAccessActionLabel}</Text>
          </Pressable>
        </View>
        <View style={styles.quickGrid}>
          {QUICK_ACCESS_SYMBOLS.map((symbol) => {
            const item = quickAccessMap.get(symbol) ?? QUICK_ACCESS_FALLBACKS[symbol];
            const tone = changeTone(item?.changePercent);

            return (
              <Pressable
                key={symbol}
                accessibilityRole="button"
                onPress={() => onOpenSymbol(symbol)}
                style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}>
                <Text style={styles.quickSymbol}>{symbol}</Text>
                <Text style={[styles.quickChange, { color: tone }]}>
                  {formatPercent(item?.changePercent)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  recentChip: {
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderRadius: radius.control,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm - 1,
  },
  recentChipText: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  trendingCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  trendingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  trendingTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  trendingList: {
    gap: spacing.sm + 2,
  },
  trendingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rankLabel: {
    color: palette.primarySoft,
    fontSize: 13,
    fontWeight: '700',
    width: 26,
  },
  trendingInfo: {
    flex: 1,
    minWidth: 0,
  },
  symbolText: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  companyText: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  trendingMeta: {
    alignItems: 'flex-end',
    minWidth: 76,
  },
  priceText: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  emptyTrendingText: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  quickHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewAllText: {
    color: palette.primarySoft,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickCard: {
    alignItems: 'center',
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderRadius: radius.control,
    borderWidth: 1,
    minHeight: 52,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.sm,
    width: '30.5%',
  },
  quickSymbol: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  quickChange: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.82,
  },
});
