import { createApiClient } from '@/shared/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import type {
    AddToWatchlistResult,
    TrimWatchlistResult,
    WatchlistData,
    WatchlistResponse,
} from '../types';

type WatchlistApiResponse = {
    success?: boolean;
    message?: string;
    data?: unknown;
    overLimit?: boolean;
    limit?: number;
};

function parseWatchlistResponse(payload: WatchlistResponse): WatchlistData {
    // Handle dual response shape:
    // - Normal: { success, data: { items, limit, currentCount, overLimit } }
    // - Over-limit: { success, data: { items: WatchlistOverlimitItem[], limit, currentCount, overLimit } }
    const data = payload.data;
    if (data && typeof data === 'object' && 'items' in data && 'overLimit' in data) {
        return data as WatchlistData;
    }

    throw new Error('Unexpected watchlist response format');
}

export async function fetchWatchlists(): Promise<WatchlistData> {
    const token = useAuthStore.getState().session?.accessToken;
    const apiClient = createApiClient();

    const response = await apiClient.get<WatchlistApiResponse>('/api/watchlists', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const body = response.data;
    if (body.success === false) {
        throw new Error(body.message ?? 'Failed to fetch watchlist');
    }

    // The data field may already be the WatchlistData shape
    const data = body.data;
    if (data && typeof data === 'object' && 'items' in data && 'overLimit' in data) {
        return data as WatchlistData;
    }

    throw new Error('Unexpected watchlist response format');
}

export async function addToWatchlist(symbol: string): Promise<AddToWatchlistResult> {
    const token = useAuthStore.getState().session?.accessToken;
    const apiClient = createApiClient();

    const response = await apiClient.post<{
        success?: boolean;
        message?: string;
        data?: AddToWatchlistResult;
    }>(
        '/api/watchlists',
        { symbol },
        {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
    );

    const payload = response.data;
    if (response.status === 400) {
        throw new Error(payload?.message || 'Watchlist limit exceeded or stock already exists');
    }
    if (response.status === 404) {
        throw new Error(payload?.message || 'Stock symbol not found');
    }
    if (!payload?.success || !payload.data) {
        throw new Error(payload?.message || 'Failed to add stock to watchlist');
    }

    return payload.data;
}

export async function removeFromWatchlist(symbol: string): Promise<void> {
    const token = useAuthStore.getState().session?.accessToken;
    const apiClient = createApiClient();

    const response = await apiClient.delete<{ success?: boolean; message?: string }>(
        `/api/watchlists/${symbol}`,
        {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
    );

    const body = response.data;
    if (body.success === false) {
        throw new Error(body.message ?? 'Failed to remove stock from watchlist');
    }
}

export async function trimWatchlist(keepStockIds: string[]): Promise<TrimWatchlistResult> {
    const token = useAuthStore.getState().session?.accessToken;
    const apiClient = createApiClient();

    const response = await apiClient.post<{
        success?: boolean;
        message?: string;
        data?: TrimWatchlistResult;
    }>(
        '/api/watchlists/trim',
        { keepStockIds },
        {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
    );

    const payload = response.data;
    if (!payload?.success) {
        throw new Error(payload?.message || 'Failed to trim watchlist');
    }

    return payload.data || {};
}
