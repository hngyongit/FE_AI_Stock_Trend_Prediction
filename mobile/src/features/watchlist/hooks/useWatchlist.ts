import { useCallback, useEffect, useState } from 'react';

import type { WatchlistItem } from '../types';
import { fetchWatchlists, removeFromWatchlist } from '../services/watchlist.service';

export function useWatchlist() {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetchWatchlists();
            if (response.success === false) {
                throw new Error(response.message ?? 'Failed to load watchlist');
            }
            setItems(response.data ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeItem = useCallback(async (symbol: string) => {
        // Optimistically remove from local state
        setItems((prev) => prev.filter((item) => item.stock.symbol !== symbol));
        try {
            await removeFromWatchlist(symbol);
        } catch (err) {
            // Revert on failure by reloading
            setError(err instanceof Error ? err.message : 'Failed to remove');
            void load();
        }
    }, [load]);

    useEffect(() => {
        void load();
    }, [load]);

    return { items, isLoading, error, refresh: load, removeItem };
}
