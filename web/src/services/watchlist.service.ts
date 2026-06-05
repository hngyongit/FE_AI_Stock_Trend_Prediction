import { authenticatedRequest } from "@/services/auth.service"
import type { StockItem } from "@/services/stock.service"

export type AddToWatchlistResult = {
    watchlist_id: string
    symbol: string
    created_at: string
}

function mapWatchlistItem(raw: any): StockItem | null {
    if (!raw || typeof raw !== "object") return null

    const stock = raw.stock ?? {}
    const latestPrice = raw.latest_price ?? {}
    const symbol = stock.symbol?.trim()

    if (!symbol) return null

    return {
        symbol,
        companyName: stock.company_name ?? undefined,
        market: stock.market_code ?? undefined,
        latestClosePrice: latestPrice.close_price ?? undefined,
        change: latestPrice.price_change ?? undefined,
        changePercent: latestPrice.price_change_percent ?? undefined,
        volume: latestPrice.volume ?? undefined,
    }
}

export async function getWatchlist(): Promise<StockItem[]> {
    const response = await authenticatedRequest({
        url: "/api/watchlists",
        method: "GET",
    })

    const payload = response.data as any
    const rawList: any[] = payload?.data || []
    return rawList.map(mapWatchlistItem).filter((item): item is StockItem => item !== null)
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