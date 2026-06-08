import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

import type { WatchlistItem } from '../types';
import { fetchWatchlists, removeFromWatchlist } from '../services/watchlist.service';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function useWatchlist() {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const deletingSymbolsRef = useRef(new Set<string>());

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
        if (deletingSymbolsRef.current.has(symbol)) {
            return;
        }

        deletingSymbolsRef.current.add(symbol);

        // Optimistically remove from local state
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setItems((prev) => prev.filter((item) => item.stock.symbol !== symbol));
        try {
            await removeFromWatchlist(symbol);
        } catch (err) {
            // Revert on failure by reloading
            setError(err instanceof Error ? err.message : 'Failed to remove');
            void load();
        } finally {
            deletingSymbolsRef.current.delete(symbol);
        }
    }, [load]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    return { items, isLoading, error, refresh: load, removeItem };
}
