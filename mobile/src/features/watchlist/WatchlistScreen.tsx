import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/shared/components/AppScreen';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { MarketTicker, useMarketStore } from '@/stores/market.store';

function signalTone(signal: MarketTicker['signal']) {
  if (signal === 'BUY') return 'up';
  if (signal === 'SELL') return 'down';
  return 'primary';
}

export function WatchlistScreen() {
  const { activeSymbol, setActiveSymbol, tickers } = useMarketStore();

  return (
    <AppScreen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Watchlist</Text>
        <Text style={styles.title}>Tracked Signals</Text>
        <Text style={styles.subtitle}>Tap a ticker to promote it to the dashboard focus.</Text>
      </View>

      <View style={styles.table}>
        {tickers.map((ticker) => {
          const isActive = ticker.symbol === activeSymbol;

          return (
            <Pressable
              key={ticker.symbol}
              onPress={() => setActiveSymbol(ticker.symbol)}
              style={({ pressed }) => [
                styles.row,
                isActive && styles.activeRow,
                pressed && styles.pressedRow,
              ]}>
              <View style={styles.identity}>
                <Text style={styles.symbol}>{ticker.symbol}</Text>
                <Text style={styles.name}>{ticker.name}</Text>
              </View>
              <View style={styles.metrics}>
                <Text style={styles.price}>{ticker.price.toLocaleString('vi-VN')}</Text>
                <Text style={[styles.change, { color: ticker.changePercent >= 0 ? palette.up : palette.down }]}>
                  {ticker.changePercent >= 0 ? '+' : ''}
                  {ticker.changePercent.toFixed(2)}%
                </Text>
              </View>
              <StatusBadge label={`${ticker.signal} ${ticker.confidence}%`} tone={signalTone(ticker.signal)} />
            </Pressable>
          );
        })}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
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
  table: {
    overflow: 'hidden',
    borderColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    backgroundColor: palette.surface,
  },
  row: {
    gap: spacing.sm,
    borderBottomColor: palette.borderMuted,
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  activeRow: {
    backgroundColor: palette.surfaceHigh,
  },
  pressedRow: {
    opacity: 0.78,
  },
  identity: {
    gap: 2,
  },
  symbol: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  name: {
    color: palette.textMuted,
    fontSize: 12,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  price: {
    color: palette.text,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  change: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
});
