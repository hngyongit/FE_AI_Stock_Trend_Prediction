import { createApiClient } from '@/shared/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import type { WatchlistData, WatchlistResponse } from '../types';

export async function fetchWatchlists(): Promise<WatchlistData> {
    const token = useAuthStore.getState().session?.accessToken;
    const apiClient = createApiClient();

    const response = await apiClient.get('/api/watchlists', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const body = response.data as WatchlistResponse;
    if (body.success === false) {
        throw new Error(body.message ?? 'Failed to fetch watchlist');
    }

    return body.data;
}

export async function addToWatchlist(symbol: string): Promise<void> {
    const token = useAuthStore.getState().session?.accessToken;
    const apiClient = createApiClient();

    const response = await apiClient.post(
        '/api/watchlists',
        { symbol },
        {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
    );

    const body = response.data as { success?: boolean; message?: string };
    if (body.success === false) {
        throw new Error(body.message ?? 'Failed to add stock to watchlist');
    }
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
