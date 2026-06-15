export type DashboardWatchlistTrend = {
  gainers: number;
  losers: number;
  flat: number;
};

export type DashboardWatchlistItem = {
  watchlist_id: string;
  stock: {
    id: string;
    symbol: string;
    company_name: string;
    market_code: string;
    status: string;
  };
  latest_price: {
    close_price: number;
    price_change: number;
    price_change_percent: number;
    volume: number;
    time_id: number;
  } | null;
  created_at: string;
};

export type DashboardMarketLeaderItem = {
  symbol: string;
  company_name: string;
  close_price: number;
  price_change: number;
  price_change_percent: number;
  volume: number;
};

export type DashboardIndexChartCandle = {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
};

export type DashboardMarketOverviewIndex = {
  symbol: string;
  display_symbol: string;
  market: string;
  close_index: number;
  open_index: number;
  high_index: number;
  low_index: number;
  change_value: number;
  change_percent: number;
  total_volume: number;
  trading_date: string;
  chart: DashboardIndexChartCandle[];
};

export type UserDashboardData = {
  watchlist: {
    total_stocks: number;
    items: DashboardWatchlistItem[];
    trends: DashboardWatchlistTrend;
  };
  market_leaders: {
    latest_trading_date: number;
    gainers: DashboardMarketLeaderItem[];
    losers: DashboardMarketLeaderItem[];
  };
  market_overview: DashboardMarketOverviewIndex[];
};

export type UserDashboardResponse =
  | {
      success?: boolean;
      message?: string;
      data?: UserDashboardData;
    }
  | UserDashboardData;
