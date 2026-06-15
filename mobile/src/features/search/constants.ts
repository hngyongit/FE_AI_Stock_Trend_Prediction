import type { StockListItem } from '@/features/stocks/types';

export const DEFAULT_RECENT_SEARCHES = ['VCB', 'FPT', 'Hoa Phat'] as const;

export const QUICK_ACCESS_SYMBOLS = ['VIC', 'VHM', 'VNM', 'TCB', 'MBB', 'VPB'] as const;

export const PREFERRED_TRENDING_SYMBOLS = ['SSI', 'VND', 'STB', 'NVL', 'MWG'] as const;

export const QUICK_ACCESS_FALLBACKS: Record<
  string,
  Pick<StockListItem, 'symbol' | 'changePercent' | 'latestClosePrice'>
> = {
  VIC: { symbol: 'VIC', changePercent: 1.2, latestClosePrice: null },
  VHM: { symbol: 'VHM', changePercent: -0.4, latestClosePrice: null },
  VNM: { symbol: 'VNM', changePercent: 0, latestClosePrice: null },
  TCB: { symbol: 'TCB', changePercent: 2.1, latestClosePrice: null },
  MBB: { symbol: 'MBB', changePercent: 1.5, latestClosePrice: null },
  VPB: { symbol: 'VPB', changePercent: -1.1, latestClosePrice: null },
};
