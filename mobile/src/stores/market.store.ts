import { create } from 'zustand';

export type Trend = 'up' | 'down' | 'flat';

export type MarketTicker = {
  symbol: string;
  name: string;
  market: string;
  price: number;
  changePercent: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  trend: Trend;
};

type MarketState = {
  activeSymbol: string;
  marketStatus: 'OPEN' | 'CLOSED';
  lastUpdated: string;
  tickers: MarketTicker[];
  setActiveSymbol: (symbol: string) => void;
  toggleMarketStatus: () => void;
};

const tickers: MarketTicker[] = [
  {
    symbol: 'FPT',
    name: 'FPT Corporation',
    market: 'HOSE',
    price: 118400,
    changePercent: 2.18,
    signal: 'BUY',
    confidence: 86,
    trend: 'up',
  },
  {
    symbol: 'VCB',
    name: 'Vietcombank',
    market: 'HOSE',
    price: 91200,
    changePercent: -0.64,
    signal: 'HOLD',
    confidence: 71,
    trend: 'down',
  },
  {
    symbol: 'HPG',
    name: 'Hoa Phat Group',
    market: 'HOSE',
    price: 28650,
    changePercent: 1.04,
    signal: 'BUY',
    confidence: 78,
    trend: 'up',
  },
  {
    symbol: 'VNM',
    name: 'Vinamilk',
    market: 'HOSE',
    price: 64200,
    changePercent: 0.12,
    signal: 'HOLD',
    confidence: 63,
    trend: 'flat',
  },
];

export const useMarketStore = create<MarketState>((set) => ({
  activeSymbol: 'FPT',
  marketStatus: 'OPEN',
  lastUpdated: '14:45 ICT',
  tickers,
  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
  toggleMarketStatus: () =>
    set((state) => ({
      marketStatus: state.marketStatus === 'OPEN' ? 'CLOSED' : 'OPEN',
    })),
}));
