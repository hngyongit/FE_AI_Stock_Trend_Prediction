import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, spacing } from '@/shared/design/tokens';
import type { PriceStats } from '@/features/stocks/types';
import {
  formatCompactVolume,
  formatMoney,
} from '@/features/stocks/utils/stockDetailCalculations';

const rows = [
  ['Open', 'open'],
  ['High', 'high'],
  ['Low', 'low'],
  ['Close', 'close'],
  ['Volume', 'volume'],
  ['Avg Volume', 'avgVolume'],
] as const;

type OHLCVCardProps = {
  stats: PriceStats;
};

export function OHLCVCard({ stats }: OHLCVCardProps) {
  return (
    <View style={styles.card}>
      {rows.map(([label, key]) => {
        const isVolume = key === 'volume' || key === 'avgVolume';
        const value = isVolume
          ? formatCompactVolume(stats[key])
          : formatMoney(stats[key]);

        return (
          <View key={key} style={styles.metric}>
            <Text style={styles.label}>{label}</Text>
            <Text numberOfLines={1} style={styles.value}>
              {value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: spacing.md,
    padding: spacing.md,
    rowGap: spacing.md,
  },
  label: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  metric: {
    gap: spacing.xs,
    width: '33.333%',
  },
  value: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    paddingRight: spacing.sm,
  },
});
