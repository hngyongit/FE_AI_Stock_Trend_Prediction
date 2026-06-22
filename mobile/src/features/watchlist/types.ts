export type WatchlistStock = {
    id?: string;
    symbol: string;
    company_name: string;
    market_id?: string;
    market_code: string;
};

export type WatchlistLatestPrice = {
    close_price: number;
    price_change_percent: number;
    price_change: number;
    volume: number;
};

export type WatchlistItem = {
    watchlist_id?: string;
    stock: WatchlistStock;
    latest_price: WatchlistLatestPrice | null;
    created_at?: string;
};

export type WatchlistOverlimitItem = {
    stock_id: string;
    stock_code: string;
    stock_name: string;
};

export type AddToWatchlistResult = {
    watchlist_id: string;
    symbol: string;
    created_at: string;
};

export type TrimWatchlistResult = {
    deleted?: number;
};

export type WatchlistData = {
    items: WatchlistItem[] | WatchlistOverlimitItem[];
    limit: number;
    currentCount: number;
    overLimit: boolean;
};

export type WatchlistResponse = {
    success?: boolean;
    message?: string;
    data: WatchlistData;
};

export type WatchlistRawItem = WatchlistItem | WatchlistOverlimitItem;
