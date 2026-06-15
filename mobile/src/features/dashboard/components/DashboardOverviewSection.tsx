import { StyleSheet, View } from 'react-native';

import { MiniIndexChart } from '@/features/dashboard/components/MiniIndexChart';
import { DashboardSection } from '@/features/dashboard/components/DashboardSection';
import type { DashboardMarketOverviewIndex } from '@/features/dashboard/types';
import { StatusBadge, Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { formatPercent, formatPrice, formatVolume } from '@/shared/utils/format';

type DashboardOverviewSectionProps = {
  items: DashboardMarketOverviewIndex[];
  latestTradingDateLabel: string;
};

export function DashboardOverviewSection({
  items,
  latestTradingDateLabel,
}: DashboardOverviewSectionProps) {
  return (
    <DashboardSection
      subtitle={`Latest session ${latestTradingDateLabel}`}
      title="Market overview">
      {items.map((item) => (
        <View
          key={item.symbol}
          style={styles.indexCard}>
          <View style={styles.indexCardTop}>
            <View>
              <Text style={styles.indexSymbol}>{item.display_symbol}</Text>
              <Text style={styles.indexMarket}>{item.market}</Text>
            </View>
            <StatusBadge
              label={item.change_percent >= 0 ? 'Up session' : 'Down session'}
              tone={item.change_percent >= 0 ? 'up' : 'down'}
            />
          </View>
          <Text style={styles.indexValue}>{formatPrice(item.close_index)}</Text>
          <Text
            style={[
              styles.indexChange,
              item.change_percent >= 0 ? styles.positiveText : styles.negativeText,
            ]}>
            {formatPercent(item.change_percent)}
          </Text>
          <MiniIndexChart
            data={item.chart}
            isNegative={item.change_percent < 0}
          />
          <View style={styles.indexFooter}>
            <Text style={styles.indexVolume}>Vol: {formatVolume(item.total_volume)}</Text>
            <Text style={styles.indexDate}>Date: {item.trading_date}</Text>
          </View>
        </View>
      ))}
    </DashboardSection>
  );
}

const styles = StyleSheet.create({
  indexCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  indexCardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indexSymbol: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  indexMarket: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: spacing.xs,
  },
  indexValue: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  indexChange: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  indexVolume: {
    color: palette.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
  indexFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indexDate: {
    color: palette.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
  positiveText: {
    color: palette.positive,
  },
  negativeText: {
    color: palette.negative,
  },
});
