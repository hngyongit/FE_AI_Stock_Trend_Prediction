import { authenticatedRequest } from "@/services/auth.service"
import type { StockItem } from "@/services/stock.service"

export type AddToWatchlistResult = {
    watchlist_id: string
    symbol: string
    created_at: string
}

export type WatchlistRawItem = {
    stock_id?: string
    stock_code?: string
    stock_name?: string
    stock?: {
        stock_id?: string
        symbol?: string
        company_name?: string
        market_code?: string
    }
    latest_price?: {
        close_price?: number
        price_change?: number
        price_change_percent?: number
        volume?: number
    }
}

export type WatchlistData = {
    items: StockItem[]
    overLimit: boolean
    limit: number
    rawItems: WatchlistRawItem[]
}

export type TrimWatchlistResult = {
    deleted?: number
}

function mapWatchlistItem(raw: any): StockItem | null {
    if (!raw || typeof raw !== "object") return null

    /**
     * Case 1:
     * Normal response:
     * {
     *   stock: { symbol, company_name, market_code },
     *   latest_price: {...}
     * }
     */
    const stock = raw.stock ?? {}
    const latestPrice = raw.latest_price ?? {}

    /**
     * Case 2:
     * Over limit response:
     * {
     *   stock_id,
     *   stock_code,
     *   stock_name
     * }
     */
    const symbol = stock.symbol?.trim() || raw.stock_code?.trim()

    if (!symbol) return null

    return {
        symbol,
        companyName: stock.company_name ?? raw.stock_name ?? undefined,
        market: stock.market_code ?? undefined,
        latestClosePrice: latestPrice.close_price ?? undefined,
        change: latestPrice.price_change ?? undefined,
        changePercent: latestPrice.price_change_percent ?? undefined,
        volume: latestPrice.volume ?? undefined,
    }
}

function getRawListFromPayload(payload: any): WatchlistRawItem[] {
    const data = payload?.data

    if (Array.isArray(data)) {
        return data
    }

    if (Array.isArray(data?.items)) {
        return data.items
    }

    if (Array.isArray(data?.watchlist)) {
        return data.watchlist
    }

    return []
}

export async function getWatchlistData(): Promise<WatchlistData> {
    const response = await authenticatedRequest({
        url: "/api/watchlists",
        method: "GET",
    })

    const payload = response.data as any
    const rawList = getRawListFromPayload(payload)

    const overLimit = Boolean(payload?.data?.overLimit ?? payload?.overLimit ?? false)
    const limit = Number(payload?.data?.limit ?? payload?.limit ?? 5)

    return {
        items: rawList.map(mapWatchlistItem).filter((item): item is StockItem => item !== null),
        overLimit,
        limit,
        rawItems: rawList,
    }
}

export async function getWatchlist(): Promise<StockItem[]> {
    const data = await getWatchlistData()
    return data.items
}

export async function addToWatchlist(symbol: string): Promise<AddToWatchlistResult> {
    const response = await authenticatedRequest({
        url: "/api/watchlists",
        method: "POST",
        data: { symbol },
    })

    const payload = response.data as any

    if (response.status === 400) {
        throw new Error(payload?.message || "Watchlist limit exceeded or stock already exists")
    }

    if (response.status === 404) {
        throw new Error(payload?.message || "Stock symbol not found")
    }

    if (!payload?.success) {
        throw new Error(payload?.message || "Failed to add stock to watchlist")
    }

    return payload.data as AddToWatchlistResult
}

export async function removeFromWatchlist(symbol: string): Promise<void> {
    await authenticatedRequest({
        url: `/api/watchlists/${symbol}`,
        method: "DELETE",
    })
}

export async function trimWatchlist(keepStockIds: string[]): Promise<TrimWatchlistResult> {
    const response = await authenticatedRequest({
        url: "/api/watchlists/trim",
        method: "POST",
        data: {
            keepStockIds,
        },
    })

    const payload = response.data as any

    if (!payload?.success) {
        throw new Error(payload?.message || "Failed to trim watchlist")
    }

    return payload.data as TrimWatchlistResult
}