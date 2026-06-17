import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WatchlistStore = {
    symbols: string[];
    version: number;
    setSymbols: (symbols: string[]) => void;
    addSymbol: (symbol: string) => void;
    removeSymbol: (symbol: string) => void;
};

export const useWatchlistStore = create<WatchlistStore>()(
    persist(
        (set) => ({
            symbols: [],
            version: 0,
            setSymbols: (symbols: string[]) =>
                set({ symbols: symbols.map((s) => s.toUpperCase()), version: Date.now() }),
            addSymbol: (symbol: string) =>
                set((state) => ({
                    symbols: [...new Set([...state.symbols, symbol.toUpperCase()])],
                    version: Date.now(),
                })),
            removeSymbol: (symbol: string) =>
                set((state) => ({
                    symbols: state.symbols.filter((s) => s !== symbol.toUpperCase()),
                    version: Date.now(),
                })),
        }),
        {
            name: 'watchlist-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);