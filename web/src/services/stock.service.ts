import { authenticatedRequest } from "@/services/auth.service"

export type StockChartRange = "7d" | "1m" | "3m" | "1y" | "all"

export type StockCandle = {
    time: string
    open: number
    high: number
    low: number
    close: number
    volume: number
    sma?: number
    ema?: number
    rsi?: number
    macd?: number
    bollingerUpper?: number
    bollingerLower?: number
}

export type StockChartMeta = {
    symbol?: string
    companyName?: string
    exchange?: string
    sector?: string
    source?: string
    verified?: boolean
    completeness?: number | string
    lastCrawl?: string
    apiStatus?: string
    marketStatus?: string
}

export type StockChartResult = {
    candles: StockCandle[]
    meta: StockChartMeta
}

export type StockListQuery = {
    page: number
    limit: number
    market: string
}

export type StockItem = {
    symbol: string
    companyName?: string
    market?: string
    industry?: string
    sector?: string
    status?: string
    latestClosePrice?: number
    change?: number
    changePercent?: number
    volume?: number
    marketCap?: number
    lastUpdated?: string
    source?: string
    dataStatus?: string
}

export type StockListMeta = {
    total?: number
    lastUpdated?: string
    source?: string
}

export type StockListResult = {
    items: StockItem[]
    meta: StockListMeta
}

type StockChartResponse = {
    success?: boolean
    message?: string
    data?: unknown
    chart?: unknown
    meta?: StockChartMeta
    stock?: StockChartMeta
    summary?: StockChartMeta
}

type StockListResponse = {
    success?: boolean
    message?: string
    data?: unknown
    items?: unknown
    stocks?: unknown
    total?: number
    pagination?: {
        total?: number
    }
    meta?: {
        total?: number
        lastUpdated?: string
        source?: string
    }
    source?: string
    lastUpdated?: string
}

const DATE_KEYS = ["time", "date", "datetime", "timestamp", "tradingDate", "trading_date"]

function firstValue(record: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
        const value = record[key]
        if (value !== undefined && value !== null && value !== "") return value
    }
    return undefined
}

function toNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) return value
    if (typeof value === "string") {
        const normalized = Number(value.replace(/,/g, ""))
        if (Number.isFinite(normalized)) return normalized
    }
    return undefined
}

function toDateLabel(value: unknown): string | undefined {
    if (typeof value === "number") {
        const date = new Date(value > 10_000_000_000 ? value : value * 1000)
        return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10)
    }

    if (typeof value === "string" && value.trim()) {
        const raw = value.trim()
        const date = new Date(raw)
        return Number.isNaN(date.getTime()) ? raw : date.toISOString().slice(0, 10)
    }

    return undefined
}

function toText(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim()) return value.trim()
    if (typeof value === "number" && Number.isFinite(value)) return String(value)
    return undefined
}

function arrayFromPayload(payload: StockChartResponse | unknown): unknown[] {
    if (Array.isArray(payload)) return payload
    if (!payload || typeof payload !== "object") return []

    const response = payload as StockChartResponse
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.chart)) return response.chart

    if (response.data && typeof response.data === "object") {
        const data = response.data as StockChartResponse
        if (Array.isArray(data.data)) return data.data
        if (Array.isArray(data.chart)) return data.chart
    }

    return []
}

function stockListArrayFromPayload(payload: StockListResponse | unknown): unknown[] {
    if (Array.isArray(payload)) return payload
    if (!payload || typeof payload !== "object") return []

    const response = payload as StockListResponse
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.items)) return response.items
    if (Array.isArray(response.stocks)) return response.stocks

    if (response.data && typeof response.data === "object") {
        const data = response.data as StockListResponse
        if (Array.isArray(data.data)) return data.data
        if (Array.isArray(data.items)) return data.items
        if (Array.isArray(data.stocks)) return data.stocks
    }

    return []
}

function metaFromPayload(payload: StockChartResponse | unknown): StockChartMeta {
    if (!payload || typeof payload !== "object") return {}

    const response = payload as StockChartResponse
    const data = response.data && typeof response.data === "object" && !Array.isArray(response.data)
        ? (response.data as StockChartResponse)
        : {}

    return {
        ...response.meta,
        ...response.stock,
        ...response.summary,
        ...data.meta,
        ...data.stock,
        ...data.summary,
    }
}

function stockListMetaFromPayload(payload: StockListResponse | unknown): StockListMeta {
    if (!payload || typeof payload !== "object") return {}

    const response = payload as StockListResponse
    const data = response.data && typeof response.data === "object" && !Array.isArray(response.data)
        ? (response.data as StockListResponse)
        : {}

    return {
        total: response.meta?.total ?? response.total ?? response.pagination?.total ?? data.meta?.total ?? data.total ?? data.pagination?.total,
        lastUpdated: response.meta?.lastUpdated ?? response.lastUpdated ?? data.meta?.lastUpdated ?? data.lastUpdated,
        source: response.meta?.source ?? response.source ?? data.meta?.source ?? data.source,
    }
}

function mapCandle(item: unknown): StockCandle | null {
    if (!item || typeof item !== "object") return null
    const record = item as Record<string, unknown>

    const open = toNumber(firstValue(record, ["open", "o"]))
    const high = toNumber(firstValue(record, ["high", "h"]))
    const low = toNumber(firstValue(record, ["low", "l"]))
    const close = toNumber(firstValue(record, ["close", "c", "price"]))
    const volume = toNumber(firstValue(record, ["volume", "v", "vol"])) ?? 0
    const time = toDateLabel(firstValue(record, DATE_KEYS))

    if (!time || open === undefined || high === undefined || low === undefined || close === undefined) {
        return null
    }

    return {
        time,
        open,
        high,
        low,
        close,
        volume,
        sma: toNumber(firstValue(record, ["sma", "SMA"])),
        ema: toNumber(firstValue(record, ["ema", "EMA"])),
        rsi: toNumber(firstValue(record, ["rsi", "RSI"])),
        macd: toNumber(firstValue(record, ["macd", "MACD"])),
        bollingerUpper: toNumber(firstValue(record, ["bollingerUpper", "bb_upper", "bbUpper"])),
        bollingerLower: toNumber(firstValue(record, ["bollingerLower", "bb_lower", "bbLower"])),
    }
}

function mapStockItem(item: unknown): StockItem | null {
    if (!item || typeof item !== "object") return null
    const record = item as Record<string, unknown>
    const symbol = toText(firstValue(record, ["symbol", "ticker", "code"]))

    if (!symbol) return null

    return {
        symbol,
        companyName: toText(firstValue(record, ["companyName", "company_name", "name", "fullName", "full_name"])),
        market: toText(firstValue(record, ["market", "exchange"])),
        industry: toText(firstValue(record, ["industry", "industryName", "industry_name"])),
        sector: toText(firstValue(record, ["sector", "sectorName", "sector_name"])),
        status: toText(firstValue(record, ["status", "stockStatus", "stock_status"])),
        latestClosePrice: toNumber(firstValue(record, ["latestClosePrice", "latest_close_price", "close", "price", "latestPrice"])),
        change: toNumber(firstValue(record, ["change", "delta", "priceChange"])),
        changePercent: toNumber(firstValue(record, ["changePercent", "change_percent", "pctChange", "percentChange"])),
        volume: toNumber(firstValue(record, ["volume", "latestVolume", "latest_volume"])),
        marketCap: toNumber(firstValue(record, ["marketCap", "market_cap", "capitalization"])),
        lastUpdated: toDateLabel(firstValue(record, ["lastUpdated", "last_updated", "updatedAt", "updated_at", ...DATE_KEYS])),
        source: toText(firstValue(record, ["source", "provider"])),
        dataStatus: toText(firstValue(record, ["dataStatus", "data_status", "qualityStatus", "quality_status"])),
    }
}

export async function getStockChart(symbol: string, range: StockChartRange): Promise<StockChartResult> {
    const normalizedSymbol = symbol.trim().toUpperCase() || "FPT"
    const response = await authenticatedRequest<StockChartResponse | unknown[]>({
        url: `/api/stocks/${encodeURIComponent(normalizedSymbol)}/chart`,
        method: "GET",
        params: { range },
    })

    const payload = response.data
    const message = !Array.isArray(payload) && payload && typeof payload === "object"
        ? (payload as StockChartResponse).message
        : undefined

    if (response.status < 200 || response.status >= 300) {
        throw new Error(message || "Unable to load stock chart")
    }

    if (!Array.isArray(payload) && payload && typeof payload === "object" && (payload as StockChartResponse).success === false) {
        throw new Error(message || "Unable to load stock chart")
    }

    return {
        candles: arrayFromPayload(payload).map(mapCandle).filter((candle): candle is StockCandle => Boolean(candle)),
        meta: metaFromPayload(payload),
    }
}

export async function getStockList(query: StockListQuery): Promise<StockListResult> {
    const response = await authenticatedRequest<StockListResponse | unknown[]>({
        url: "/api/stocks",
        method: "GET",
        params: query,
    })

    const payload = response.data
    const message = !Array.isArray(payload) && payload && typeof payload === "object"
        ? (payload as StockListResponse).message
        : undefined

    if (response.status < 200 || response.status >= 300) {
        throw new Error(message || "Unable to load stock list")
    }

    if (!Array.isArray(payload) && payload && typeof payload === "object" && (payload as StockListResponse).success === false) {
        throw new Error(message || "Unable to load stock list")
    }

    return {
        items: stockListArrayFromPayload(payload).map(mapStockItem).filter((item): item is StockItem => Boolean(item)),
        meta: stockListMetaFromPayload(payload),
    }
}
