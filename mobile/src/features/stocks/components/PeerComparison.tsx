import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/ui';
import { palette, spacing } from '@/shared/design/tokens';
import {
  formatMoney,
  formatPercent,
} from '@/features/stocks/utils/stockDetailCalculations';

const peers = [
  { symbol: 'MWG', price: 64100, change: 1.24 },
  { symbol: 'MSN', price: 82600, change: -0.58 },
  { symbol: 'VNM', price: 71100, change: 0.36 },
];

export function PeerComparison() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Peer Comparison</Text>
        <Text style={styles.viewAll}>View all</Text>
      </View>
      <View style={styles.row}>
        {peers.map((peer) => {
          const color = peer.change >= 0 ? palette.positive : palette.negative;

          return (
            <View key={peer.symbol} style={styles.card}>
              <Text style={styles.symbol}>{peer.symbol}</Text>
              <Text numberOfLines={1} style={styles.price}>
                {formatMoney(peer.price)}
              </Text>
              <Text style={[styles.change, { color }]}>{formatPercent(peer.change)}</Text>
            </View>
          );
        })}
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
    padding: spacing.sm,
  },
  change: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
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
  symbol: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  viewAll: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
});
