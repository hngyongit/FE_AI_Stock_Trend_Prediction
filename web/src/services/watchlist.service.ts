import { authenticatedRequest } from "@/services/auth.service"
import type { StockItem } from "@/services/stock.service" //

export async function getWatchlist(): Promise<StockItem[]> {
    const response = await authenticatedRequest({
        url: "/api/watchlists",
        method: "GET",
    })
    
    const payload = response.data as any
    return payload?.data || []
}

export async function addToWatchlist(symbol: string): Promise<void> {
    await authenticatedRequest({
        url: "/api/watchlists",
        method: "POST",
        data: { symbol },
    })
}

export async function removeFromWatchlist(symbol: string): Promise<void> {
    await authenticatedRequest({
        url: `/api/watchlists/${symbol}`,
        method: "DELETE",
    })
}