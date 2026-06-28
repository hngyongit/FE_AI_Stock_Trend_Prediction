import { authenticatedRequest } from "@/services/auth.service"

export type CrawlLog = {
    id: string
    source: string
    status: string
    items_crawled: number
    error_count: number
    start_time: string
    end_time?: string
}

export type CrawlLogDetail = CrawlLog & {
    logs: string[]
}

export type FailedSymbol = {
    symbol: string
    reason: string
    failed_at: string
}

export type MissingDataRecord = {
    symbol: string
    missing_dates: string[]
    last_updated: string
}

export type PaginatedResponse<T> = {
    items: T[]
    pagination: {
        page: number
        limit: number
        total_items: number
        total_pages: number
    }
}

export async function getCrawlLogs(params?: {
    page?: number
    limit?: number
    status?: string
    date?: string
}): Promise<PaginatedResponse<CrawlLog>> {
    const response = await authenticatedRequest<{ success: boolean; data: PaginatedResponse<CrawlLog> }>({
        url: "/api/staff/crawl-logs",
        method: "GET",
        params,
    })
    return response.data.data
}

export async function getCrawlLogById(id: string): Promise<CrawlLogDetail> {
    const response = await authenticatedRequest<{ success: boolean; data: CrawlLogDetail }>({
        url: `/api/staff/crawl-logs/${id}`,
        method: "GET",
    })
    return response.data.data
}

export async function getFailedSymbolsByLogId(id: string): Promise<FailedSymbol[]> {
    const response = await authenticatedRequest<{ success: boolean; data: FailedSymbol[] }>({
        url: `/api/staff/crawl-logs/${id}/failed-symbols`,
        method: "GET",
    })
    return response.data.data || []
}

export async function getGlobalFailedSymbols(): Promise<FailedSymbol[]> {
    const response = await authenticatedRequest<{ success: boolean; data: FailedSymbol[] }>({
        url: "/api/staff/crawl-logs/failed-symbols",
        method: "GET",
    })
    return response.data.data || []
}

export async function getMissingData(): Promise<MissingDataRecord[]> {
    const response = await authenticatedRequest<{ success: boolean; data: MissingDataRecord[] }>({
        url: "/api/staff/data-quality/missing",
        method: "GET",
    })
    return response.data.data || []
}