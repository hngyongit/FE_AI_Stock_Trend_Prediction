import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';
import type { StockChartPoint } from '@/features/stocks/types';
import { formatMoney } from '@/features/stocks/utils/stockDetailCalculations';

type CandlestickChartProps = {
  data: StockChartPoint[];
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
};

const CHART_HEIGHT = 210;
const VOLUME_HEIGHT = 54;
const CANDLE_WIDTH = 9;
const GAP = 7;
const PADDING = 12;

export function CandlestickChart({
  data,
  error,
  isLoading,
  onRetry,
}: CandlestickChartProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const chart = useMemo(() => buildChart(data, containerWidth), [data, containerWidth]);

  return (
    <View
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Price Chart</Text>
        <Text style={styles.caption}>OHLCV</Text>
      </View>

      {isLoading ? (
        <ChartState title="Loading price history">
          <ActivityIndicator color={palette.primary} size="small" />
        </ChartState>
      ) : error ? (
        <ChartState body={error} title="Chart unavailable">
          <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </ChartState>
      ) : data.length === 0 ? (
        <ChartState title="No chart data" body="No price history was returned for this range." />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Svg height={CHART_HEIGHT + VOLUME_HEIGHT} width={chart.width}>
            {chart.gridLines.map((y) => (
              <Line
                key={y}
                stroke={palette.border}
                strokeOpacity={0.35}
                strokeWidth={1}
                x1={0}
                x2={chart.width}
                y1={y}
                y2={y}
              />
            ))}
            {chart.candles.map((candle) => {
              const color = candle.isUp ? palette.positive : palette.negative;

              return (
                <Svg key={candle.key}>
                  <Line
                    stroke={color}
                    strokeWidth={2}
                    x1={candle.centerX}
                    x2={candle.centerX}
                    y1={candle.highY}
                    y2={candle.lowY}
                  />
                  <Rect
                    fill={color}
                    height={candle.bodyHeight}
                    rx={2}
                    width={CANDLE_WIDTH}
                    x={candle.x}
                    y={candle.bodyY}
                  />
                  <Rect
                    fill={color}
                    height={candle.volumeHeight}
                    opacity={0.45}
                    rx={2}
                    width={CANDLE_WIDTH}
                    x={candle.x}
                    y={CHART_HEIGHT + VOLUME_HEIGHT - candle.volumeHeight}
                  />
                </Svg>
              );
            })}
          </Svg>
        </ScrollView>
      )}

      {!isLoading && !error && data.length > 0 ? (
        <View style={styles.axisRow}>
          <Text style={styles.axisText}>{formatMoney(chart.minPrice)}</Text>
          <Text style={styles.axisText}>{formatMoney(chart.maxPrice)}</Text>
        </View>
      ) : null}
    </View>
  );
}

type ChartStateProps = {
  body?: string;
  children?: ReactNode;
  title: string;
};

function ChartState({ body, children, title }: ChartStateProps) {
  return (
    <View style={styles.stateShell}>
      {children}
      <Text style={styles.stateTitle}>{title}</Text>
      {body ? <Text style={styles.stateBody}>{body}</Text> : null}
    </View>
  );
}

function buildChart(data: StockChartPoint[], containerWidth: number) {
  const contentWidth = data.length * (CANDLE_WIDTH + GAP) + PADDING * 2;
  const width = Math.max(containerWidth, contentWidth);
  const lows = data.map((point) => point.low);
  const highs = data.map((point) => point.high);
  const volumes = data.map((point) => point.volume);
  const minPrice = lows.length > 0 ? Math.min(...lows) : 0;
  const maxPrice = highs.length > 0 ? Math.max(...highs) : 0;
  const maxVolume = volumes.length > 0 ? Math.max(...volumes) : 0;
  const priceRange = Math.max(maxPrice - minPrice, 1);
  const yForPrice = (price: number) =>
    PADDING + ((maxPrice - price) / priceRange) * (CHART_HEIGHT - PADDING * 2);

  return {
    candles: data.map((point, index) => {
      const x = PADDING + index * (CANDLE_WIDTH + GAP);
      const openY = yForPrice(point.open);
      const closeY = yForPrice(point.close);

      return {
        bodyHeight: Math.max(Math.abs(closeY - openY), 3),
        bodyY: Math.min(openY, closeY),
        centerX: x + CANDLE_WIDTH / 2,
        highY: yForPrice(point.high),
        isUp: point.close >= point.open,
        key: `${point.time}-${index}`,
        lowY: yForPrice(point.low),
        volumeHeight: maxVolume > 0 ? (point.volume / maxVolume) * (VOLUME_HEIGHT - 8) : 0,
        x,
      };
    }),
    gridLines: [42, 84, 126, 168],
    maxPrice,
    minPrice,
    width,
  };
}

const styles = StyleSheet.create({
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  axisText: {
    color: palette.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
  caption: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: radius.control,
    height: 36,
    justifyContent: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  retryText: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  stateBody: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  stateShell: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: CHART_HEIGHT,
  },
  stateTitle: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
});
