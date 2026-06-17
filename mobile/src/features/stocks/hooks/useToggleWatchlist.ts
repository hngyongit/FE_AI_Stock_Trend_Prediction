import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { addToWatchlist } from '@/features/watchlist/services/watchlist.service';
import { removeFromWatchlist } from '@/features/watchlist/services/watchlist.service';
import { useWatchlistStore } from '@/stores/watchlist-symbols.store';

export function useToggleWatchlist(symbol: string) {
    const queryClient = useQueryClient();
    const { symbols, addSymbol, removeSymbol } = useWatchlistStore();
    const isWatched = symbols.includes(symbol.toUpperCase());

    const toggle = useCallback(async () => {
        try {
            if (isWatched) {
                await removeFromWatchlist(symbol);
                removeSymbol(symbol);
            } else {
                await addToWatchlist(symbol);
                addSymbol(symbol);
            }
            // Invalidate the watchlist query to trigger a refetch with full data
            void queryClient.invalidateQueries({ queryKey: ['watchlist'] });
        } catch (error) {
            console.error('Failed to toggle watchlist:', error);
        }
    }, [symbol, isWatched, addSymbol, removeSymbol, queryClient]);

    return { isWatched, toggle };
}