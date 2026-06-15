import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import ReactECharts from "echarts-for-react"
import type { EChartsOption } from "echarts"
import {
    Users,
    ShieldCheck,
    Lock,
    Star,
    RefreshCw,
    Activity,
    Database,
    UserCheck,
    Settings,
    ArrowUpRight,
    Users2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAdminDashboard, type AdminDashboardData } from "@/services/dashboard.service"
import { toast } from "sonner"

function formatNumber(value?: number) {
    if (value === undefined || !Number.isFinite(value)) return "--"
    return new Intl.NumberFormat("en-US").format(value)
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
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center animate-pulse">
                    <div>
                        <div className="h-8 w-48 bg-slate-800 rounded mb-2" />
                        <div className="h-4 w-64 bg-slate-800 rounded" />
                    </div>
                    <div className="h-10 w-24 bg-slate-800 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-slate-800 rounded-lg animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-slate-800 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <p className="text-rose-500 font-medium mb-4">{error || "No admin dashboard data available"}</p>
                <Button onClick={() => void fetchDashboard()}>
                    <RefreshCw className="mr-2 size-4" /> Retry Loading
                </Button>
            </div>
        )
    }

    const { users, watchlists, catalog, system_health } = data

    // Mapping roles data for pie chart
    const roleDistributionData = [
        { value: users.by_role.USER || 0, name: "Standard Users", itemStyle: { color: "#10b981" } },
        { value: users.by_role.STAFF || 0, name: "Staff Operators", itemStyle: { color: "#f59e0b" } },
        { value: users.by_role.ADMIN || 0, name: "Administrators", itemStyle: { color: "#3b82f6" } }
    ].filter(item => item.value > 0);

    // If roles is empty, add a default fallback for rendering
    if (roleDistributionData.length === 0) {
        roleDistributionData.push({ value: 0, name: "No Data", itemStyle: { color: "#475569" } });
    }

    const pieOption: EChartsOption = {
        backgroundColor: "transparent",
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
                radius: ["50%", "75%"],
                center: ["50%", "45%"],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: "#0f172a",
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: "center"
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#f8fafc",
                        formatter: "{b}\n{c}"
                    }
                },
                labelLine: {
                    show: false
                },
                data: roleDistributionData
            }
        ]
    };

    // Calculate quality progress bar color
    const rate = system_health.crawl_success_rate_percent;
    const progressColor = rate >= 90 ? "bg-emerald-500" : rate >= 70 ? "bg-amber-500" : "bg-rose-500";

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
                        System Admin Dashboard
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Monitor platform health, user statistics, database metrics, and service allocations.
                    </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => void fetchDashboard()}>
                    <RefreshCw className="size-3.5 mr-2" /> Refresh
                </Button>
            </div>

            {/* Top Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total User Accounts</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-black text-slate-50">{formatNumber(users.total)}</span>
                        </div>
                        <div className="flex gap-2 mt-2 text-xs">
                            <span className="text-violet-400 font-medium">+{users.new_registrations_last_7_days} new</span>
                            <span className="text-slate-500">last 7 days</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <Users className="size-5 text-violet-500" />
                    </div>
                </div>

                {/* Active Users */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Users</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-black text-slate-50">{formatNumber(users.active)}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            {users.total > 0 ? ((users.active / users.total) * 100).toFixed(0) : 0}% of all accounts
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <ShieldCheck className="size-5 text-emerald-500" />
                    </div>
                </div>

                {/* Locked Users */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Locked Users</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className={`text-3xl font-black ${users.locked > 0 ? "text-rose-500" : "text-slate-50"}`}>
                                {formatNumber(users.locked)}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Accounts suspended/blocked</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <Lock className={`size-5 ${users.locked > 0 ? "text-rose-500 animate-pulse" : "text-slate-500"}`} />
                    </div>
                </div>

                {/* Watchlist Entries */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Watchlist Entries</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-black text-slate-50">{formatNumber(watchlists.total_entries)}</span>
                        </div>
                        <div className="flex gap-2 mt-2 text-xs text-slate-500">
                            <span>{watchlists.active_users_count} users tracking</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <Star className="size-5 text-amber-500 fill-amber-500/20" />
                    </div>
                </div>
            </div>

            {/* Middle Visual Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Role breakdown - Donut chart */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl flex flex-col justify-between h-[360px]">
                    <div>
                        <h2 className="text-base font-bold text-slate-200 mb-2 flex items-center gap-2">
                            <UserCheck className="size-4 text-violet-400" /> User Role Distribution
                        </h2>
                        <p className="text-xs text-slate-500">Visual mapping of administrative roles assigned.</p>
                    </div>
                    <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
                        <div className="w-full h-full">
                            <ReactECharts option={pieOption} style={{ height: "100%", width: "100%" }} notMerge lazyUpdate />
                        </div>
                    </div>
                </div>

                {/* Watchlists distribution stats */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl flex flex-col justify-between h-[360px]">
                    <div>
                        <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <Star className="size-4 text-amber-400" /> Watchlists Distribution
                        </h2>
                        <div className="space-y-4 mt-2">
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                <span className="text-xs text-slate-400">Total Entries Logged</span>
                                <strong className="text-slate-100 font-bold text-sm">{formatNumber(watchlists.total_entries)}</strong>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                <span className="text-xs text-slate-400">Unique Users Tracking</span>
                                <strong className="text-slate-100 font-bold text-sm">{formatNumber(watchlists.active_users_count)}</strong>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                <span className="text-xs text-slate-400">Avg. Stocks per User</span>
                                <strong className="text-slate-100 font-bold text-sm">{watchlists.average_per_user} stocks</strong>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                <span className="text-xs text-slate-400">Platform Penetration</span>
                                <strong className="text-slate-100 font-bold text-sm">
                                    {users.total > 0 ? ((watchlists.active_users_count / users.total) * 100).toFixed(1) : 0}%
                                </strong>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center gap-3">
                        <Users2 className="size-5 text-amber-500 flex-shrink-0" />
                        <p className="text-[10px] text-slate-500 leading-normal">
                            High watchlist penetration reflects users actively engaging with stock catalog analysis and notifications.
                        </p>
                    </div>
                </div>

                {/* Pipeline quality & Database Catalog coverage */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl flex flex-col justify-between h-[360px]">
                    <div>
                        <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <Activity className="size-4 text-emerald-400" /> Pipeline Health & Catalog
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center text-xs mb-1.5">
                                    <span className="text-slate-400">Crawler Run Success Rate</span>
                                    <strong className="text-slate-100 font-semibold">{rate}%</strong>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full ${progressColor} transition-all duration-500`} style={{ width: `${rate}%` }} />
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-800/50 mt-2">
                                <span className="text-xs text-slate-400">Total Crawl Pipeline Runs</span>
                                <strong className="text-slate-100 font-bold text-sm">{formatNumber(system_health.total_crawl_runs)} runs</strong>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                <span className="text-xs text-slate-400">Active Stock Symbols</span>
                                <strong className="text-slate-100 font-bold text-sm">{formatNumber(catalog.total_stocks)} ticker(s)</strong>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                <span className="text-xs text-slate-400">Active Market Indices</span>
                                <strong className="text-slate-100 font-bold text-sm">{formatNumber(catalog.total_markets)} market(s)</strong>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center gap-3">
                        <Database className="size-5 text-emerald-500 flex-shrink-0" />
                        <p className="text-[10px] text-slate-500 leading-normal">
                            Crawler schedules are managed via Cron tasks. Quality statistics represent both scheduled and manual runs.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Administrative Links */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
                <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <Settings className="size-4 text-slate-400" /> Administrative Operations Control Panel
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link to="/admin/users" className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-850 hover:bg-slate-800/80 hover:border-slate-700 transition duration-300 group">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-200">User Management</span>
                            <span className="text-[10px] text-slate-500 mt-1">Review accounts, roles, lock/unlock</span>
                        </div>
                        <ArrowUpRight className="size-4 text-slate-500 group-hover:text-slate-200 transition duration-300" />
                    </Link>

                    <Link to="/admin/stocks" className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-850 hover:bg-slate-800/80 hover:border-slate-700 transition duration-300 group">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-200">Stock Management</span>
                            <span className="text-[10px] text-slate-500 mt-1">Control tracked indices and active assets</span>
                        </div>
                        <ArrowUpRight className="size-4 text-slate-500 group-hover:text-slate-200 transition duration-300" />
                    </Link>

                    <Link to="/staff/dashboard" className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-850 hover:bg-slate-800/80 hover:border-slate-700 transition duration-300 group">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-200">Pipeline Operations</span>
                            <span className="text-[10px] text-slate-500 mt-1">Monitor crawl logs and ETL triggers</span>
                        </div>
                        <ArrowUpRight className="size-4 text-slate-500 group-hover:text-slate-200 transition duration-300" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
