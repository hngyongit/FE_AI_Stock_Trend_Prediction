import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchUserDashboard } from '@/features/dashboard/services/dashboard.service';
import type {
  DashboardMarketLeaderItem,
  DashboardMarketOverviewIndex,
  DashboardWatchlistItem,
  UserDashboardData,
} from '@/features/dashboard/types';
import { useAppShellStore } from '@/stores/app-shell.store';

type DashboardSummary = {
  gainersCount: number;
  latestTradingDateLabel: string;
  leadersAsOfLabel: string;
  losersCount: number;
  topGainer: DashboardMarketLeaderItem | null;
  topLoser: DashboardMarketLeaderItem | null;
  totalIndices: number;
  trackedStocks: number;
  validatedWatchlistItems: number;
  watchlistCoveragePercent: number;
};

export function useDashboard() {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const setContentLoading = useAppShellStore((state) => state.setContentLoading);
  const setStale = useAppShellStore((state) => state.setStale);
  const setWarningMessage = useAppShellStore((state) => state.setWarningMessage);

  const loadDashboard = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') {
      setIsLoading(true);
      setContentLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const nextData = await fetchUserDashboard();
      setData(nextData);
      setError(null);
      setStale(false);
      setWarningMessage(null);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Unable to load dashboard data.';
      setError(message);
      setStale(true);
      setWarningMessage(message);
    } finally {
      if (mode === 'initial') {
        setIsLoading(false);
        setContentLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, [setContentLoading, setStale, setWarningMessage]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const summary = useMemo<DashboardSummary>(() => {
    const marketOverview = data?.market_overview ?? [];
    const watchlistItems = data?.watchlist.items ?? [];
    const validatedWatchlistItems = watchlistItems.filter((item) => item.latest_price).length;
    const watchlistTotal = data?.watchlist.total_stocks ?? 0;
    const primaryIndex = marketOverview[0] ?? null;
    const leadersDate = data?.market_leaders.latest_trading_date ?? null;

    return {
      gainersCount: data?.market_leaders.gainers.length ?? 0,
      latestTradingDateLabel: formatTradingDate(primaryIndex?.trading_date ?? null),
      leadersAsOfLabel: formatTradingDayId(leadersDate),
      losersCount: data?.market_leaders.losers.length ?? 0,
      topGainer: data?.market_leaders.gainers[0] ?? null,
      topLoser: data?.market_leaders.losers[0] ?? null,
      totalIndices: marketOverview.length,
      trackedStocks: watchlistTotal,
      validatedWatchlistItems,
      watchlistCoveragePercent:
        watchlistTotal > 0 ? Math.round((validatedWatchlistItems / watchlistTotal) * 100) : 0,
    };
  }, [data]);

  return {
    data,
    error,
    isLoading,
    isRefreshing,
    summary,
    marketLeaders: data?.market_leaders ?? null,
    marketOverview: data?.market_overview ?? [],
    refresh: () => loadDashboard('refresh'),
    watchlist: data?.watchlist ?? null,
  };
}

function formatTradingDate(value: string | null): string {
  if (!value) return 'No session date';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function formatTradingDayId(value: number | null): string {
  if (!value) return 'No leader snapshot';

  const normalized = String(value);
  if (normalized.length !== 8) return normalized;

  const year = normalized.slice(0, 4);
  const month = normalized.slice(4, 6);
  const day = normalized.slice(6, 8);

  return `${day}/${month}/${year}`;
}

export function getPrimaryIndex(
  marketOverview: DashboardMarketOverviewIndex[],
): DashboardMarketOverviewIndex | null {
  return marketOverview[0] ?? null;
}

export function getWatchlistPreview(items: DashboardWatchlistItem[]): DashboardWatchlistItem[] {
  return items.slice(0, 4);
}
