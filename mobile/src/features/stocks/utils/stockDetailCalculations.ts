import type {
  PriceStats,
  StockChartPoint,
  StockChartRange,
  StockTimeframe,
  TechnicalStats,
} from '@/features/stocks/types';

export const timeframeOptions: StockTimeframe[] = ['1D', '1W', '1M', '3M', '1Y'];

export const rangeByTimeframe: Record<StockTimeframe, StockChartRange> = {
  '1D': '7d',
  '1W': '7d',
  '1M': '1m',
  '3M': '3m',
  '1Y': '1y',
};

export function calculatePriceStats(data: StockChartPoint[]): PriceStats {
  const latest = data.at(-1);
  const previous = data.at(-2);
  const avgVolume =
    data.length > 0
      ? data.reduce((sum, point) => sum + point.volume, 0) / data.length
      : null;
  const priceChange = latest && previous ? latest.close - previous.close : null;
  const priceChangePercent =
    priceChange != null && previous?.close
      ? (priceChange / previous.close) * 100
      : null;

  return {
    latestPrice: latest?.close ?? null,
    previousPrice: previous?.close ?? null,
    priceChange,
    priceChangePercent,
    open: latest?.open ?? null,
    high: latest?.high ?? null,
    low: latest?.low ?? null,
    close: latest?.close ?? null,
    volume: latest?.volume ?? null,
    avgVolume,
    lastUpdated: latest?.time ?? null,
  };
}

export function calculateTechnicalStats(data: StockChartPoint[]): TechnicalStats {
  const closes = data.map((point) => point.close);

  return {
    sma20: calculateSma(closes, 20),
    rsi14: calculateRsi(closes, 14),
    volatility30d: calculateVolatility(closes, 30),
  };
}

function calculateSma(values: number[], period: number) {
  if (values.length < period) {
    return null;
  }

  const slice = values.slice(-period);
  return slice.reduce((sum, value) => sum + value, 0) / period;
}

function calculateRsi(values: number[], period: number) {
  if (values.length <= period) {
    return null;
  }

  const changes = values
    .slice(-(period + 1))
    .map((value, index, slice) => (index === 0 ? 0 : value - slice[index - 1]))
    .slice(1);
  const gains = changes.filter((change) => change > 0);
  const losses = changes.filter((change) => change < 0).map(Math.abs);
  const avgGain = gains.reduce((sum, value) => sum + value, 0) / period;
  const avgLoss = losses.reduce((sum, value) => sum + value, 0) / period;

  if (avgLoss === 0) {
    return 100;
  }

  return 100 - 100 / (1 + avgGain / avgLoss);
}

function calculateVolatility(values: number[], period: number) {
  if (values.length <= period) {
    return null;
  }

  const returns = values
    .slice(-(period + 1))
    .map((value, index, slice) =>
      index === 0 ? 0 : (value - slice[index - 1]) / slice[index - 1],
    )
    .slice(1);
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    returns.length;

  return Math.sqrt(variance) * Math.sqrt(period) * 100;
}

export function formatMoney(value: number | null | undefined) {
  return value == null ? '--' : value.toLocaleString('en-US');
}

export function formatCompactVolume(value: number | null | undefined) {
  if (value == null) {
    return '--';
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toLocaleString('en-US');
}

export function formatPercent(value: number | null | undefined) {
  if (value == null) {
    return '--';
  }

  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}
