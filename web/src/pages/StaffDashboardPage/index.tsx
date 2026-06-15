import { useEffect, useState, useCallback } from "react"
import {
    Activity,
    CheckCircle,
    AlertCircle,
    Database,
    Calendar,
    RefreshCw,
    FileText,
    TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getStaffDashboard, type StaffDashboardData } from "@/services/dashboard.service"
import { toast } from "sonner"

function formatNumber(value?: number) {
    if (value === undefined || !Number.isFinite(value)) return "--"
    return new Intl.NumberFormat("en-US").format(value)
}

function formatDate(dateStr: string) {
    if (!dateStr) return "--"
    try {
        const d = new Date(dateStr)
        return d.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        })
    } catch {
        return dateStr
    }
}

export default function StaffDashboardPage() {
    const [data, setData] = useState<StaffDashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDashboard = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await getStaffDashboard()
            setData(result)
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unable to load staff operations statistics"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-slate-800 rounded-lg animate-pulse" />
                    ))}
                </div>
                <div className="h-80 bg-slate-800 rounded-lg animate-pulse" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <p className="text-rose-500 font-medium mb-4">{error || "No staff dashboard data available"}</p>
                <Button onClick={() => void fetchDashboard()}>
                    <RefreshCw className="mr-2 size-4" /> Retry Loading
                </Button>
            </div>
        )
    }

    const { jobs, logs, catalog, recent_activities } = data

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                        Data Operations Dashboard
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Monitor pipeline scheduling, crawl execution success rates, and active database counts.
                    </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => void fetchDashboard()}>
                    <RefreshCw className="size-3.5 mr-2" /> Refresh
                </Button>
            </div>

            {/* Top Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Crawl Job Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Crawl Schedules</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-black text-slate-50">{jobs.total}</span>
                            <span className="text-xs text-slate-500">jobs configured</span>
                        </div>
                        <div className="flex gap-3 mt-2 text-xs">
                            <span className="text-emerald-500 font-medium">{jobs.active} active</span>
                            <span className="text-slate-500">{jobs.inactive} inactive</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <Calendar className="size-5 text-amber-500" />
                    </div>
                </div>

                {/* Pipeline Success Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Execution Quality</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-black text-slate-50">{logs.success_rate_percent}%</span>
                            <span className="text-xs text-slate-500">success rate</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Across {logs.total_runs} historical runs</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <CheckCircle className="size-5 text-emerald-500" />
                    </div>
                </div>

                {/* Database Catalog Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalog Statistics</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-black text-slate-50">{formatNumber(catalog.total_stocks)}</span>
                            <span className="text-xs text-slate-500">active stocks</span>
                        </div>
                        <div className="flex gap-3 mt-2 text-xs text-slate-500">
                            <span>{catalog.total_markets} markets</span>
                            <span>{catalog.total_data_sources} data sources</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <Database className="size-5 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Middle Grid: Record Totals & Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pipeline Metrics Details */}
                <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <Activity className="size-4 text-orange-500" /> Pipeline Aggregates
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                                <span className="text-xs text-slate-400">Total Records Fetched</span>
                                <strong className="text-slate-100 font-bold">{formatNumber(logs.records_fetched)}</strong>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                                <span className="text-xs text-slate-400">Records Inserted</span>
                                <strong className="text-slate-100 font-bold">{formatNumber(logs.records_inserted)}</strong>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                                <span className="text-xs text-slate-400">Records Updated</span>
                                <strong className="text-slate-100 font-bold">{formatNumber(logs.records_updated)}</strong>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                                <span className="text-xs text-slate-400">Records Failed</span>
                                <strong className={`font-bold ${logs.records_failed > 0 ? "text-rose-500" : "text-slate-100"}`}>
                                    {formatNumber(logs.records_failed)}
                                </strong>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center gap-3">
                        <TrendingUp className="size-5 text-emerald-500 flex-shrink-0" />
                        <p className="text-[10px] text-slate-500 leading-normal">
                            All records are directly mapped to standard Dim/Fact collections, ready for technical analysis.
                        </p>
                    </div>
                </div>

                {/* Recent Logs Table */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                            <FileText className="size-4 text-amber-500" /> Recent Activities
                        </h2>
                    </div>

                    {recent_activities.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                                        <th className="py-2.5">Job Name</th>
                                        <th className="py-2.5">Data Type</th>
                                        <th className="py-2.5">Started At</th>
                                        <th className="py-2.5 text-center">Status</th>
                                        <th className="py-2.5 text-right">Records</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {recent_activities.map((log) => {
                                        const isSuccess = log.status === "SUCCESS"
                                        const isPartial = log.status === "PARTIAL_SUCCESS"
                                        const isFailed = log.status === "FAILED"

                                        return (
                                            <tr key={log.log_id} className="hover:bg-slate-800/20 transition-colors">
                                                <td className="py-3 font-semibold text-slate-200">{log.job_name}</td>
                                                <td className="py-3 text-slate-400">{log.data_type}</td>
                                                <td className="py-3 text-slate-400">{formatDate(log.started_at)}</td>
                                                <td className="py-3 text-center">
                                                    <Badge
                                                        variant={isSuccess ? "default" : isPartial ? "secondary" : isFailed ? "destructive" : "outline"}
                                                        className="text-[10px] py-0.5 px-2 font-medium"
                                                    >
                                                        {log.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-right font-medium text-slate-200">
                                                    {formatNumber(log.records_processed)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-800 rounded-xl">
                            <AlertCircle className="size-8 text-slate-500 mb-2" />
                            <p className="text-slate-500 text-xs">No crawl runs recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
