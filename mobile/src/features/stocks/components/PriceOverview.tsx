import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, spacing } from '@/shared/design/tokens';
import type { PriceStats } from '@/features/stocks/types';
import {
  formatMoney,
  formatPercent,
} from '@/features/stocks/utils/stockDetailCalculations';

type PriceOverviewProps = {
  stats: PriceStats;
};

export function PriceOverview({ stats }: PriceOverviewProps) {
  const directionColor =
    (stats.priceChange ?? 0) >= 0 ? palette.positive : palette.negative;

  return (
    <View style={styles.shell}>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatMoney(stats.latestPrice)}</Text>
        <Text style={styles.currency}>VND</Text>
      </View>
      <Text style={[styles.change, { color: directionColor }]}>
        {stats.priceChange != null && stats.priceChange > 0 ? '+' : ''}
        {formatMoney(stats.priceChange)} ({formatPercent(stats.priceChangePercent)})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  change: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  currency: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: 5,
  },
  price: {
    color: palette.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  priceRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shell: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
});
