import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/shared/components/AppScreen';
import { MetricCard } from '@/shared/components/MetricCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { useMarketStore } from '@/stores/market.store';

function formatPrice(value: number) {
  return `${value.toLocaleString('vi-VN')} VND`;
}

export function DashboardScreen() {
  const { activeSymbol, lastUpdated, marketStatus, tickers } = useMarketStore();
  const activeTicker = tickers.find((ticker) => ticker.symbol === activeSymbol) ?? tickers[0];
  const bullishCount = tickers.filter((ticker) => ticker.trend === 'up').length;

  return (
    <AppScreen
      footer={
        <Text style={styles.statusText}>
          Source: HOSE/VN30 simulated feed - Last update: {lastUpdated}
        </Text>
      }>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>AI Stock Trend Prediction</Text>
          <Text style={styles.title}>Market Command Center</Text>
          <Text style={styles.subtitle}>Compact signal monitoring for HOSE and VN30 equities.</Text>
        </View>
        <StatusBadge label={marketStatus === 'OPEN' ? 'Market Open' : 'Market Closed'} tone={marketStatus === 'OPEN' ? 'up' : 'warning'} />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.cardTopline}>
          <View>
            <Text style={styles.symbol}>{activeTicker.symbol}</Text>
            <Text style={styles.company}>{activeTicker.name}</Text>
          </View>
          <StatusBadge label={activeTicker.signal} tone={activeTicker.signal === 'BUY' ? 'up' : activeTicker.signal === 'SELL' ? 'down' : 'primary'} />
        </View>

        <Text style={styles.price}>{formatPrice(activeTicker.price)}</Text>
        <Text style={[styles.change, { color: activeTicker.changePercent >= 0 ? palette.up : palette.down }]}>
          {activeTicker.changePercent >= 0 ? '+' : ''}
          {activeTicker.changePercent.toFixed(2)}% predicted intraday movement
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard label="Confidence" value={`${activeTicker.confidence}%`} detail="Model consensus" tone="up" />
        <MetricCard label="Bullish" value={`${bullishCount}/${tickers.length}`} detail="Watchlist breadth" tone="up" />
        <MetricCard label="Universe" value="VN30" detail="HOSE primary" tone="neutral" />
        <MetricCard label="Latency" value="< 2s" detail="Pipeline healthy" tone="warning" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  heroCard: {
    gap: spacing.sm,
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    backgroundColor: palette.surfaceLow,
    padding: spacing.md,
  },
  cardTopline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  symbol: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
  },
  company: {
    color: palette.textMuted,
    fontSize: 12,
  },
  price: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statusText: {
    color: palette.textMuted,
    fontSize: 12,
  },
});
