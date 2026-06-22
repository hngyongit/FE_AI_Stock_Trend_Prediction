import { useCallback, useEffect, useRef } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import type { WatchlistItem, WatchlistOverlimitItem, WatchlistRawItem } from '../types';
import {
    addToWatchlist as addToWatchlistService,
    fetchWatchlists,
    removeFromWatchlist,
    trimWatchlist as trimWatchlistService,
} from '../services/watchlist.service';
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
            const result = await fetchWatchlists();
            setSymbols(
                result.items.map((item: WatchlistRawItem) =>
                    'stock' in item ? item.stock.symbol : item.stock_code
                )
            );

            // When overLimit=true, items are WatchlistOverlimitItem (no stock/latest_price).
            // Only return fully-formed WatchlistItem entries to avoid type confusion.
            const normalItems = result.overLimit
                ? []
                : result.items.filter(
                    (item): item is WatchlistItem => 'stock' in item
                );

            return {
                items: normalItems,
                rawItems: result.items as WatchlistRawItem[],
                overLimit: result.overLimit,
                limit: result.limit,
                currentCount: result.currentCount,
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
        onSuccess: (result) => {
            if (result?.symbol) {
                addSymbol(result.symbol);
            }
            void queryClient.invalidateQueries({ queryKey: ['watchlist'] });
        },
    });

    const { mutate: trimItems, isPending: isTrimming } = useMutation({
        mutationFn: (keepStockIds: string[]) => trimWatchlistService(keepStockIds),
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
            }
        },
        [addItem, removeItem],
    );

    return {
        items: data?.items ?? [],
        rawItems: data?.rawItems ?? [],
        isLoading,
        error: error?.message ?? null,
        overLimit: data?.overLimit ?? false,
        limit: data?.limit ?? 5,
        currentCount: data?.currentCount ?? 0,
        refresh: refetch,
        removeItem,
        addItem,
        isAdding,
        trimItems,
        isTrimming,
        isWatched: (symbol: string) => symbols.includes(symbol.toUpperCase()),
        toggleItem,
    };
}
