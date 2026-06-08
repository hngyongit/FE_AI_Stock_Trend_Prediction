export type StockChartRange = '7d' | '1m' | '3m' | '6m' | '1y' | 'all';

export type StockTimeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

export type StockChartPoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type StockChartResponse = {
  success: boolean;
  message?: string;
  data: StockChartPoint[];
};

export type PriceStats = {
  latestPrice: number | null;
  previousPrice: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  avgVolume: number | null;
  lastUpdated: string | null;
};

export type TechnicalStats = {
  sma20: number | null;
  rsi14: number | null;
  volatility30d: number | null;
};
