import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, spacing } from '@/shared/design/tokens';
import type { TechnicalStats } from '@/features/stocks/types';
import { formatMoney } from '@/features/stocks/utils/stockDetailCalculations';

type TechnicalSummaryProps = {
  stats: TechnicalStats;
};

export function TechnicalSummary({ stats }: TechnicalSummaryProps) {
  const metrics = [
    { label: 'SMA (20)', value: formatMoney(stats.sma20) },
    { label: 'RSI (14)', value: stats.rsi14 == null ? '--' : stats.rsi14.toFixed(1) },
    {
      label: 'Volatility (30D)',
      value: stats.volatility30d == null ? '--' : `${stats.volatility30d.toFixed(2)}%`,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Technical Summary</Text>
      <View style={styles.row}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.card}>
            <Text style={styles.label}>{metric.label}</Text>
            <Text numberOfLines={1} style={styles.value}>
              {metric.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 72,
    padding: spacing.sm,
  },
  label: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  value: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
});
