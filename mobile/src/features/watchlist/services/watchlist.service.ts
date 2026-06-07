import { createApiClient } from '@/shared/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import type { WatchlistResponse } from '../types';

export async function fetchWatchlists(): Promise<WatchlistResponse> {
    const token = useAuthStore.getState().session?.accessToken;
    const apiClient = createApiClient();

    const response = await apiClient.get('/api/watchlists', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    return response.data as WatchlistResponse;
}

export async function removeFromWatchlist(symbol: string): Promise<void> {
    const token = useAuthStore.getState().session?.accessToken;
    const apiClient = createApiClient();

    const response = await apiClient.delete(`/api/watchlists/${symbol}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const body = response.data as { success?: boolean; message?: string };
    if (body.success === false) {
        throw new Error(body.message ?? 'Failed to remove stock from watchlist');
    }
}
