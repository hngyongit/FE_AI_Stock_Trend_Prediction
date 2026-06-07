export type WatchlistStock = {
    symbol: string;
    company_name: string;
    exchange_code: string;
};

export type WatchlistLatestPrice = {
    close_price: number;
    price_change_percent: number;
    price_change: number;
    volume: number;
};

export type WatchlistItem = {
    watchlist_id: string;
    stock: WatchlistStock;
    latest_price: WatchlistLatestPrice | null;
    created_at: string;
};

export type WatchlistResponse = {
    success?: boolean;
    message?: string;
    data: WatchlistItem[];
};
