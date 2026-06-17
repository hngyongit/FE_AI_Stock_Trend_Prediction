import { useCallback, useEffect, useRef } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import type { WatchlistItem, WatchlistOverlimitItem } from '../types';
import { addToWatchlist as addToWatchlistService, fetchWatchlists, removeFromWatchlist } from '../services/watchlist.service';
import { useWatchlistStore } from '@/stores/watchlist-symbols.store';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function useWatchlist() {
    const queryClient = useQueryClient();
    const deletingSymbolsRef = useRef(new Set<string>());
    const { symbols, setSymbols, addSymbol, removeSymbol } = useWatchlistStore();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['watchlist'],
        queryFn: async () => {
            const data = await fetchWatchlists();
            setSymbols(
                data.items.map((item: WatchlistItem | WatchlistOverlimitItem) =>
                    'stock' in item ? item.stock.symbol : item.stock_code
                )
            );
            return {
                items: data.items as WatchlistItem[],
                overLimit: data.overLimit,
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });

    // Re-fetch when symbols change (e.g., after adding/removing from another screen)
    useEffect(() => {
        void refetch();
    }, [symbols.length, refetch]);

    const removeItem = useCallback(async (symbol: string) => {
        if (deletingSymbolsRef.current.has(symbol)) {
            return;
        }

        deletingSymbolsRef.current.add(symbol);

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        removeSymbol(symbol);

        try {
            await removeFromWatchlist(symbol);
            void queryClient.invalidateQueries({ queryKey: ['watchlist'] });
        } catch (err) {
            console.error('Failed to remove:', err);
        } finally {
            deletingSymbolsRef.current.delete(symbol);
        }
    }, [queryClient, removeSymbol]);

    const { mutate: addItem, isPending: isAdding } = useMutation({
        mutationFn: addToWatchlistService,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['watchlist'] });
        },
    });

    const toggleItem = useCallback(
        (symbol: string, isWatched: boolean) => {
            if (isWatched) {
                removeItem(symbol);
            } else {
                addItem(symbol);
                addSymbol(symbol);
            }
        },
        [addItem, removeItem, addSymbol],
    );

    return {
        items: data?.items ?? [],
        isLoading,
        error: error?.message ?? null,
        overLimit: data?.overLimit ?? false,
        refresh: refetch,
        removeItem,
        addItem,
        isAdding,
        isWatched: (symbol: string) => symbols.includes(symbol.toUpperCase()),
        toggleItem,
    };
}
