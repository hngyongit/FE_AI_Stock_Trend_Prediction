import { authenticatedRequest } from "@/services/auth.service"

export type WatchlistTrend = {
    gainers: number
    losers: number
    flat: number
}

export type WatchlistItem = {
    watchlist_id: string
    stock: {
        id: string
        symbol: string
        company_name: string
        market_code: string
        status: string
    }
    latest_price: {
        close_price: number
        price_change: number
        price_change_percent: number
        volume: number
        time_id: number
    } | null
    created_at: string
}

export type MarketLeaderItem = {
    symbol: string
    company_name: string
    close_price: number
    price_change: number
    price_change_percent: number
    volume: number
}

export type IndexChartCandle = {
    date: string
    close: number
    open: number
    high: number
    low: number
    volume: number
}

export type MarketOverviewIndex = {
    symbol: string
    display_symbol: string
    market: string
    close_index: number
    open_index: number
    high_index: number
    low_index: number
    change_value: number
    change_percent: number
    total_volume: number
    trading_date: string
    chart: IndexChartCandle[]
}

export type UserDashboardData = {
    watchlist: {
        total_stocks: number
        items: WatchlistItem[]
        trends: WatchlistTrend
    }
    market_leaders: {
        latest_trading_date: number
        gainers: MarketLeaderItem[]
        losers: MarketLeaderItem[]
    }
    market_overview: MarketOverviewIndex[]
}

export type StaffDashboardData = {
    jobs: {
        total: number
        active: number
        inactive: number
    }
    logs: {
        total_runs: number
        success_rate_percent: number
        records_fetched: number
        records_inserted: number
        records_updated: number
        records_failed: number
    }
    catalog: {
        total_stocks: number
        total_markets: number
        total_data_sources: number
    }
    recent_activities: Array<{
        log_id: string
        job_name: string
        data_type: string
        started_at: string
        ended_at: string | null
        status: string
        records_processed: number
        error_message: string | null
    }>
}

export type AdminDashboardData = {
    users: {
        total: number
        active: number
        locked: number
        new_registrations_last_7_days: number
        by_role: Record<string, number>
    }
    watchlists: {
        total_entries: number
        active_users_count: number
        average_per_user: number
    }
    catalog: {
        total_stocks: number
        total_markets: number
    }
    system_health: {
        crawl_success_rate_percent: number
        total_crawl_runs: number
    }
}

export async function getUserDashboard(): Promise<UserDashboardData> {
    const response = await authenticatedRequest<any>({
        url: "/api/dashboard/user",
        method: "GET",
    })
    if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to fetch user dashboard")
    }
    return response.data.data as UserDashboardData
}

export async function getStaffDashboard(): Promise<StaffDashboardData> {
    const response = await authenticatedRequest<any>({
        url: "/api/dashboard/staff",
        method: "GET",
    })
    if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to fetch staff dashboard")
    }
    return response.data.data as StaffDashboardData
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await authenticatedRequest<any>({
        url: "/api/dashboard/admin",
        method: "GET",
    })
    if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to fetch admin dashboard")
    }
    return response.data.data as AdminDashboardData
}
