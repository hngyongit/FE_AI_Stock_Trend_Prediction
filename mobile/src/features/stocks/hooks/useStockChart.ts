import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchStockChart } from '@/features/stocks/services/stocks.service';
import type {
  StockChartPoint,
  StockTimeframe,
} from '@/features/stocks/types';
import {
  calculatePriceStats,
  calculateTechnicalStats,
  rangeByTimeframe,
} from '@/features/stocks/utils/stockDetailCalculations';

export function useStockChart(symbol: string) {
  const [timeframe, setTimeframe] = useState<StockTimeframe>('1M');
  const [data, setData] = useState<StockChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const loadChart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchStockChart(symbol, rangeByTimeframe[timeframe]);
      setData(response.data);
      setFetchedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load chart data');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    void loadChart();
  }, [loadChart]);

  const priceStats = useMemo(() => calculatePriceStats(data), [data]);
  const technicalStats = useMemo(() => calculateTechnicalStats(data), [data]);

  return {
    data,
    error,
    fetchedAt,
    isLoading,
    priceStats,
    refresh: loadChart,
    setTimeframe,
    technicalStats,
    timeframe,
  };
}
