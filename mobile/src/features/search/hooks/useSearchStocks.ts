import { useEffect, useMemo, useRef, useState } from 'react';

import { fetchStocks } from '@/features/stocks/services/stocks.service';
import type { StockListItem } from '@/features/stocks/types';

type SearchMarketFilter = 'all' | 'HOSE' | 'HNX';

type UseSearchStocksResult = {
  debouncedQuery: string;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  items: StockListItem[];
  marketFilter: SearchMarketFilter;
  query: string;
  setMarketFilter: (value: SearchMarketFilter) => void;
  setQuery: (value: string) => void;
  loadStocks: (options?: { refresh?: boolean }) => Promise<void>;
};

export function useSearchStocks(): UseSearchStocksResult {
  const [query, setQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState<SearchMarketFilter>('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState<StockListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  async function loadStocks(options?: { refresh?: boolean }) {
    const isRefresh = options?.refresh === true;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response = await fetchStocks({
        keyword: debouncedQuery || undefined,
        limit: debouncedQuery ? 20 : 60,
        market: marketFilter === 'all' ? undefined : marketFilter,
        page: 1,
      });

      if (requestIdRef.current !== requestId) {
        return;
      }

      setItems(response.data);
    } catch (err) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setError(err instanceof Error ? err.message : 'Could not load stocks');
    } finally {
      if (requestIdRef.current !== requestId) {
        return;
      }

      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadStocks();
  }, [debouncedQuery, marketFilter]);

  return {
    debouncedQuery,
    error,
    isLoading,
    isRefreshing,
    items,
    loadStocks,
    marketFilter,
    query,
    setMarketFilter,
    setQuery,
  };
}
