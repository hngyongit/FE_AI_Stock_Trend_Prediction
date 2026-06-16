import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import ReactECharts from "echarts-for-react"
import type { EChartsOption } from "echarts"
import {
    Activity,
    ArrowUpRight,
    Lock,
    RefreshCw,
    Settings,
    ShieldCheck,
    Star,
    UserCheck,
    Users,
    Users2,
    Radar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAdminDashboard, type AdminDashboardData } from "@/services/dashboard.service"
import { toast } from "sonner"

function formatNumber(value?: number, digits = 0) {
    if (value === undefined || !Number.isFinite(value)) return "--"
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(value)
}

function formatPercent(value?: number, digits = 1) {
    if (value === undefined || !Number.isFinite(value)) return "--"
    return `${formatNumber(value, digits)}%`
}

export default function AdminDashboard() {
    const [data, setData] = useState<AdminDashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDashboard = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await getAdminDashboard()
            setData(result)
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unable to load admin dashboard data"
            setError(msg)
            toast.error("Dashboard Load Failed", { description: msg })
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchDashboard()
    }, [fetchDashboard])

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between animate-pulse">
                    <div>
                        <div className="mb-2 h-8 w-48 rounded bg-slate-800" />
                        <div className="h-4 w-64 rounded bg-slate-800" />
                    </div>
                    <div className="h-10 w-24 rounded bg-slate-800" />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 rounded-lg bg-slate-800 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-80 rounded-lg bg-slate-800 animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
                <p className="mb-4 font-medium text-rose-500">{error || "No admin dashboard data available"}</p>
                <Button onClick={() => void fetchDashboard()}>
                    <RefreshCw className="mr-2 size-4" /> Retry Loading
                </Button>
            </div>
        )
    }

    const { users, watchlists, catalog, system_health } = data
    const roleDistributionData = [
        { value: users.by_role.USER || 0, name: "Users", itemStyle: { color: "#22c55e" } },
        { value: users.by_role.STAFF || 0, name: "Staff", itemStyle: { color: "#f59e0b" } },
        { value: users.by_role.ADMIN || 0, name: "Admins", itemStyle: { color: "#3b82f6" } },
    ].filter((item) => item.value > 0)

    if (roleDistributionData.length === 0) {
        roleDistributionData.push({ value: 0, name: "No Data", itemStyle: { color: "#475569" } })
    }

    const activeUserRate = users.total > 0 ? (users.active / users.total) * 100 : 0
    const lockedUserRate = users.total > 0 ? (users.locked / users.total) * 100 : 0
    const watchlistPenetration = users.total > 0 ? (watchlists.active_users_count / users.total) * 100 : 0
    const healthRate = system_health.crawl_success_rate_percent
    const progressColor = healthRate >= 90 ? "bg-emerald-500" : healthRate >= 70 ? "bg-amber-500" : "bg-rose-500"

    const pieOption: EChartsOption = {
        backgroundColor: "transparent",
        animationDuration: 400,
        tooltip: {
            trigger: "item",
            formatter: "{b}: <strong>{c}</strong> ({d}%)",
            backgroundColor: "#1e293b",
            borderColor: "#334155",
            borderWidth: 1,
            textStyle: { color: "#e2e8f0", fontSize: 12 },
        },
        legend: {
            orient: "horizontal",
            bottom: "0",
            textStyle: { color: "#94a3b8", fontSize: 11 },
            icon: "circle",
        },
        series: [
            {
                name: "User Roles",
                type: "pie",
                radius: ["48%", "70%"],
                center: ["50%", "42%"],
                itemStyle: {
                    borderRadius: 6,
                    borderColor: "#0f172a",
                    borderWidth: 2,
                },
                label: { show: false },
                emphasis: {
                    scale: false,
                    label: { show: false },
                },
                labelLine: {
                    show: false,
                    length: 10,
                    length2: 8,
                    lineStyle: {
                        color: "#64748b",
                    },
                },
                avoidLabelOverlap: true,
                data: roleDistributionData,
            },
        ],
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6">
            <div className="rounded-[28px] border border-slate-800/80 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.88))] p-6 shadow-2xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                        <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-200">
                            Executive Overview
                        </Badge>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-50">System Admin Dashboard</h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-300">
                                Monitor user growth, access control, watchlist adoption, and platform reliability from the admin control surface.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/40 px-4 py-3 text-xs text-slate-300">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Radar className="size-3.5" />
                                Crawl reliability
                            </div>
                            <div className="mt-1 font-semibold text-slate-100">{formatPercent(healthRate)}</div>
                        </div>

                        <Button size="sm" variant="outline" onClick={() => void fetchDashboard()}>
                            <RefreshCw className="mr-2 size-3.5" /> Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Total Accounts</p>
                            <p className="mt-2 text-3xl font-black text-slate-50">{formatNumber(users.total)}</p>
                        </div>
                        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3">
                            <Users className="size-5 text-violet-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-violet-300">+{formatNumber(users.new_registrations_last_7_days)} in 7 days</span>
                        <span className="text-slate-500">{formatPercent(activeUserRate, 0)} active</span>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Active Users</p>
                            <p className="mt-2 text-3xl font-black text-slate-50">{formatNumber(users.active)}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                            <ShieldCheck className="size-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${activeUserRate}%` }} />
                    </div>
                    <p className="mt-3 text-[11px] text-slate-500">Share of enabled accounts currently available for normal access.</p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Locked Accounts</p>
                            <p className={`mt-2 text-3xl font-black ${users.locked > 0 ? "text-rose-400" : "text-slate-50"}`}>
                                {formatNumber(users.locked)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3">
                            <Lock className="size-5 text-rose-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Account restriction ratio</span>
                        <span className={users.locked > 0 ? "text-rose-300" : "text-slate-500"}>{formatPercent(lockedUserRate, 1)}</span>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Watchlist Entries</p>
                            <p className="mt-2 text-3xl font-black text-slate-50">{formatNumber(watchlists.total_entries)}</p>
                        </div>
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
                            <Star className="size-5 fill-amber-500/20 text-amber-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-amber-300">{formatNumber(watchlists.active_users_count)} users tracking</span>
                        <span className="text-slate-500">{formatNumber(watchlists.average_per_user, 2)} avg/user</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_1fr_1fr]">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
                    <div>
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                            <UserCheck className="size-4 text-indigo-400" /> User Role Distribution
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">Breakdown of accounts by primary platform role.</p>
                    </div>
                    <div className="mt-4 h-[260px]">
                        <ReactECharts option={pieOption} style={{ height: "100%", width: "100%" }} notMerge lazyUpdate />
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                        <Users2 className="size-4 text-amber-400" /> Adoption Snapshot
                    </h2>
                    <div className="mt-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800/60 py-2">
                            <span className="text-xs text-slate-400">Tracked users</span>
                            <strong className="text-sm font-bold text-slate-100">{formatNumber(watchlists.active_users_count)}</strong>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-800/60 py-2">
                            <span className="text-xs text-slate-400">Watchlist penetration</span>
                            <strong className="text-sm font-bold text-slate-100">{formatPercent(watchlistPenetration, 1)}</strong>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-800/60 py-2">
                            <span className="text-xs text-slate-400">Average per user</span>
                            <strong className="text-sm font-bold text-slate-100">{formatNumber(watchlists.average_per_user, 2)}</strong>
                        </div>
                        <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4 text-[11px] leading-5 text-slate-400">
                            Watchlist activity is a lightweight signal for user engagement and repeated analysis behavior.
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                        <Activity className="size-4 text-emerald-400" /> System Health
                    </h2>
                    <div className="mt-5 space-y-4">
                        <div>
                            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                                <span>Crawl success rate</span>
                                <span className="font-semibold text-slate-100">{formatPercent(healthRate, 2)}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${Math.min(healthRate, 100)}%` }} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-800/60 py-2">
                            <span className="text-xs text-slate-400">Total crawl runs</span>
                            <strong className="text-sm font-bold text-slate-100">{formatNumber(system_health.total_crawl_runs)}</strong>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-800/60 py-2">
                            <span className="text-xs text-slate-400">Catalog stocks</span>
                            <strong className="text-sm font-bold text-slate-100">{formatNumber(catalog.total_stocks)}</strong>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-800/60 py-2">
                            <span className="text-xs text-slate-400">Markets covered</span>
                            <strong className="text-sm font-bold text-slate-100">{formatNumber(catalog.total_markets)}</strong>
                        </div>
                        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4 text-[11px] leading-5 text-slate-400">
                            Health metrics are taken directly from `/api/dashboard/admin` without client-side fabrication.
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-200">
                    <Settings className="size-4 text-slate-400" /> Administrative Operations Control Panel
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Link to="/admin/users" className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-800/30 p-4 transition hover:border-slate-700 hover:bg-slate-800/70">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-200">User Management</span>
                            <span className="mt-1 text-[10px] text-slate-500">Review accounts, roles, and access states</span>
                        </div>
                        <ArrowUpRight className="size-4 text-slate-500 transition group-hover:text-slate-200" />
                    </Link>

                    <Link to="/admin/stocks" className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-800/30 p-4 transition hover:border-slate-700 hover:bg-slate-800/70">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-200">Stock Management</span>
                            <span className="mt-1 text-[10px] text-slate-500">Control tracked symbols and market coverage</span>
                        </div>
                        <ArrowUpRight className="size-4 text-slate-500 transition group-hover:text-slate-200" />
                    </Link>

                    <Link to="/staff/dashboard" className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-800/30 p-4 transition hover:border-slate-700 hover:bg-slate-800/70">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-200">Pipeline Operations</span>
                            <span className="mt-1 text-[10px] text-slate-500">Jump to crawl jobs, logs, and ETL monitoring</span>
                        </div>
                        <ArrowUpRight className="size-4 text-slate-500 transition group-hover:text-slate-200" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
