import { StyleSheet, View } from 'react-native';

import type { DashboardMarketOverviewIndex } from '@/features/dashboard/types';
import { Card, MetricCard, Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { formatPercent, formatPrice, formatVolume } from '@/shared/utils/format';

type DashboardHeroCardProps = {
  gainersCount: number;
  latestTradingDateLabel: string;
  leadersAsOfLabel: string;
  losersCount: number;
  primaryIndex: DashboardMarketOverviewIndex | null;
  totalIndices: number;
  trackedStocks: number;
  validatedWatchlistItems: number;
  watchlistCoveragePercent: number;
  hasError: boolean;
};

export function DashboardHeroCard({
  gainersCount,
  latestTradingDateLabel,
  leadersAsOfLabel,
  losersCount,
  primaryIndex,
  totalIndices,
  trackedStocks,
  validatedWatchlistItems,
  watchlistCoveragePercent,
  hasError,
}: DashboardHeroCardProps) {
  return (
    <>
      <Card style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Dashboard</Text>
            <Text style={styles.title}>Market overview</Text>
            <Text style={styles.body}>
              Mobile now surfaces the essentials: exchange pulse, data freshness, top movers,
              and your tracked symbols.
            </Text>
          </View>
        </View>

        <View style={styles.heroIndexRow}>
          <View style={styles.heroIndexCopy}>
            <Text style={styles.heroIndexLabel}>
              {primaryIndex?.display_symbol ?? 'Primary index'}
            </Text>
            <Text style={styles.heroIndexValue}>
              {primaryIndex ? formatPrice(primaryIndex.close_index) : '—'}
            </Text>
            <Text
              style={[
                styles.heroIndexDelta,
                primaryIndex?.change_percent != null && primaryIndex.change_percent < 0
                  ? styles.negativeText
                  : styles.positiveText,
              ]}>
              {primaryIndex ? formatPercent(primaryIndex.change_percent) : 'No market snapshot'}
            </Text>
          </View>

          <View style={styles.heroMeta}>
            <Text style={styles.heroMetaLabel}>Volume</Text>
            <Text style={styles.heroMetaValue}>
              {primaryIndex ? formatVolume(primaryIndex.total_volume) : '—'}
            </Text>
            <Text style={styles.heroMetaCaption}>Leaders as of {leadersAsOfLabel}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.metricGrid}>
        <MetricCard
          detail={`${totalIndices} tracked indices`}
          label="Market breadth"
          tone={gainersCount >= losersCount ? 'up' : 'down'}
          value={`${gainersCount}/${losersCount}`}
        />
        <MetricCard
          detail={`${validatedWatchlistItems}/${trackedStocks} validated symbols`}
          label="Data quality"
          tone={watchlistCoveragePercent >= 80 ? 'up' : 'warning'}
          value={`${watchlistCoveragePercent}%`}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.84,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  body: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  heroIndexRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroIndexCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  heroIndexLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  heroIndexValue: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  heroIndexDelta: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  heroMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  heroMetaLabel: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroMetaValue: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  heroMetaCaption: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  positiveText: {
    color: palette.positive,
  },
  negativeText: {
    color: palette.negative,
  },
});
