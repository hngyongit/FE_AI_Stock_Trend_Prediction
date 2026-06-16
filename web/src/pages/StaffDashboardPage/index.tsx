import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
    Activity,
    AlertCircle,
    Database,
    Calendar,
    RefreshCw,
    FileText,
    TrendingUp,
    Clock3,
    ArrowUpRight,
    ServerCrash,
    ShieldAlert,
    CheckCircle2,
    Workflow
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getStaffDashboard, type StaffDashboardData } from "@/services/dashboard.service"
import { toast } from "sonner"

function formatNumber(value?: number) {
    if (value === undefined || !Number.isFinite(value)) return "--"
    return new Intl.NumberFormat("en-US").format(value)
}

function formatPercent(value?: number) {
    if (value === undefined || !Number.isFinite(value)) return "--"
    return `${value.toFixed(1)}%`
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

function getDurationLabel(startedAt: string, endedAt: string | null) {
    if (!startedAt || !endedAt) return "--"
    const start = new Date(startedAt).getTime()
    const end = new Date(endedAt).getTime()
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "--"

    const minutes = Math.round((end - start) / 60000)
    if (minutes < 1) return "<1 min"
    if (minutes < 60) return `${minutes} min`

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function getStatusBadge(status: string) {
    if (status === "SUCCESS") {
        return {
            variant: "default" as const,
            className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/15",
            label: "Healthy",
        }
    }

    if (status === "PARTIAL_SUCCESS") {
        return {
            variant: "secondary" as const,
            className: "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/15",
            label: "Partial",
        }
    }

    if (status === "FAILED") {
        return {
            variant: "destructive" as const,
            className: "bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/15",
            label: "Failed",
        }
    }

    return {
        variant: "outline" as const,
        className: "",
        label: status || "--",
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
    const latestActivity = recent_activities[0] ?? null
    const failureCount = recent_activities.filter((activity) => activity.status === "FAILED").length
    const partialCount = recent_activities.filter((activity) => activity.status === "PARTIAL_SUCCESS").length
    const processedTotal = recent_activities.reduce((total, activity) => total + (activity.records_processed || 0), 0)
    const activeJobRate = jobs.total > 0 ? (jobs.active / jobs.total) * 100 : 0
    const failureRate = logs.total_runs > 0 ? (logs.records_failed / Math.max(logs.records_fetched, 1)) * 100 : 0
    const latestError = recent_activities.find((activity) => activity.error_message?.trim())

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="rounded-[28px] border border-slate-800/80 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.88))] p-6 shadow-2xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-200">
                            Staff Operations
                        </Badge>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-50">
                                Data Operations Dashboard
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-300">
                                Track crawl schedules, ETL execution quality, and catalog readiness from one compact command center.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/40 px-4 py-3 text-xs text-slate-300">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Clock3 className="size-3.5" />
                                Latest activity
                            </div>
                            <div className="mt-1 font-semibold text-slate-100">
                                {latestActivity ? formatDate(latestActivity.started_at) : "--"}
                            </div>
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
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Crawl Jobs</p>
                            <p className="mt-2 text-3xl font-black text-slate-50">{formatNumber(jobs.total)}</p>
                        </div>
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
                            <Calendar className="size-5 text-amber-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-emerald-400">{formatNumber(jobs.active)} active</span>
                        <span className="text-slate-500">{formatNumber(jobs.inactive)} inactive</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${activeJobRate}%` }} />
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Success Rate</p>
                            <p className="mt-2 text-3xl font-black text-slate-50">{formatPercent(logs.success_rate_percent)}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                            <CheckCircle2 className="size-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                        <span>{formatNumber(logs.total_runs)} total runs</span>
                        <span>{formatPercent(failureRate)} failed records</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(logs.success_rate_percent, 100)}%` }} />
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Catalog Coverage</p>
                            <p className="mt-2 text-3xl font-black text-slate-50">{formatNumber(catalog.total_stocks)}</p>
                        </div>
                        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3">
                            <Database className="size-5 text-sky-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                        <span>{formatNumber(catalog.total_markets)} markets</span>
                        <span>{formatNumber(catalog.total_data_sources)} sources</span>
                    </div>
                    <p className="mt-3 text-[11px] text-slate-500">Stocks ready for downstream analytics and user-facing dashboards.</p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Records Processed</p>
                            <p className="mt-2 text-3xl font-black text-slate-50">{formatNumber(processedTotal)}</p>
                        </div>
                        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3">
                            <Workflow className="size-5 text-violet-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-amber-300">{formatNumber(partialCount)} partial</span>
                        <span className={failureCount > 0 ? "text-rose-400" : "text-slate-500"}>
                            {formatNumber(failureCount)} failed
                        </span>
                    </div>
                    <p className="mt-3 text-[11px] text-slate-500">Based on recent activities returned by `/api/dashboard/staff`.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                                <Activity className="size-4 text-amber-400" /> Pipeline Aggregates
                            </h2>
                            <p className="mt-1 text-xs text-slate-400">Core ingestion totals and update efficiency across historical runs.</p>
                        </div>
                        <Badge variant="outline" className="border-slate-700 text-slate-300">
                            Historical Metrics
                        </Badge>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
                            <p className="text-xs text-slate-400">Total Records Fetched</p>
                            <p className="mt-2 text-2xl font-bold text-slate-50">{formatNumber(logs.records_fetched)}</p>
                            <p className="mt-2 text-[11px] text-slate-500">Raw rows pulled from external providers before transform stage.</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
                            <p className="text-xs text-slate-400">Records Inserted</p>
                            <p className="mt-2 text-2xl font-bold text-emerald-400">{formatNumber(logs.records_inserted)}</p>
                            <p className="mt-2 text-[11px] text-slate-500">New rows successfully persisted into catalog and downstream stores.</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
                            <p className="text-xs text-slate-400">Records Updated</p>
                            <p className="mt-2 text-2xl font-bold text-sky-400">{formatNumber(logs.records_updated)}</p>
                            <p className="mt-2 text-[11px] text-slate-500">Existing entities refreshed by re-crawl and ETL correction flows.</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
                            <p className="text-xs text-slate-400">Records Failed</p>
                            <p className={`mt-2 text-2xl font-bold ${logs.records_failed > 0 ? "text-rose-400" : "text-slate-50"}`}>
                                {formatNumber(logs.records_failed)}
                            </p>
                            <p className="mt-2 text-[11px] text-slate-500">Count of items rejected by timeouts, validation, or persistence errors.</p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="mt-0.5 size-5 flex-shrink-0 text-emerald-400" />
                            <div>
                                <p className="text-sm font-semibold text-slate-100">Operations note</p>
                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    This dashboard reflects backend-provided metrics only, so empty or unavailable fields stay explicit instead of being inferred.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                            <ShieldAlert className="size-4 text-rose-400" /> Quality Snapshot
                        </h2>
                        <div className="mt-5 space-y-4">
                            <div>
                                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                                    <span>Active schedule coverage</span>
                                    <span className="font-semibold text-slate-200">{formatPercent(activeJobRate)}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${activeJobRate}%` }} />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                                    <span>Execution success rate</span>
                                    <span className="font-semibold text-slate-200">{formatPercent(logs.success_rate_percent)}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(logs.success_rate_percent, 100)}%` }} />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                                    <span>Failed-record ratio</span>
                                    <span className="font-semibold text-slate-200">{formatPercent(failureRate)}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                    <div className="h-full rounded-full bg-rose-400" style={{ width: `${Math.min(failureRate, 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                            <ServerCrash className="size-4 text-rose-400" /> Latest Exception
                        </h2>
                        {latestError ? (
                            <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/8 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-semibold text-slate-100">{latestError.job_name}</p>
                                    <Badge variant="outline" className="border-rose-500/30 text-rose-200">
                                        {latestError.status}
                                    </Badge>
                                </div>
                                <p className="mt-2 text-xs text-slate-400">{formatDate(latestError.started_at)}</p>
                                <p className="mt-3 text-sm leading-6 text-slate-200">{latestError.error_message || "--"}</p>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 p-4 text-sm text-slate-400">
                                No recent exception message returned by the API.
                            </div>
                        )}
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                            <ArrowUpRight className="size-4 text-sky-400" /> Quick Actions
                        </h2>
                        <div className="mt-4 grid gap-3">
                            <Link to="/staff/crawl-jobs" className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-800/40">
                                <span>Review crawl job schedules</span>
                                <ArrowUpRight className="size-4 text-slate-500" />
                            </Link>
                            <Link to="/staff/crawl-logs" className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-800/40">
                                <span>Inspect detailed crawl logs</span>
                                <ArrowUpRight className="size-4 text-slate-500" />
                            </Link>
                            <Link to="/staff/data-sources" className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-800/40">
                                <span>Manage source configuration</span>
                                <ArrowUpRight className="size-4 text-slate-500" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                            <FileText className="size-4 text-amber-400" /> Recent Activities
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">Latest execution logs returned by the staff dashboard API.</p>
                    </div>
                    <Badge variant="outline" className="border-slate-700 text-slate-300">
                        {formatNumber(recent_activities.length)} entries
                    </Badge>
                </div>

                {recent_activities.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    <th className="py-3">Job</th>
                                    <th className="py-3">Data Type</th>
                                    <th className="py-3">Started At</th>
                                    <th className="py-3">Duration</th>
                                    <th className="py-3 text-center">Status</th>
                                    <th className="py-3 text-right">Records</th>
                                    <th className="py-3">Error</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {recent_activities.map((log) => {
                                    const badge = getStatusBadge(log.status)

                                    return (
                                        <tr key={log.log_id} className="transition-colors hover:bg-slate-800/20">
                                            <td className="py-4">
                                                <div className="font-semibold text-slate-100">{log.job_name || "--"}</div>
                                            </td>
                                            <td className="py-4 text-slate-400">{log.data_type || "--"}</td>
                                            <td className="py-4 text-slate-400">{formatDate(log.started_at)}</td>
                                            <td className="py-4 text-slate-400">{getDurationLabel(log.started_at, log.ended_at)}</td>
                                            <td className="py-4 text-center">
                                                <Badge variant={badge.variant} className={badge.className}>
                                                    {badge.label}
                                                </Badge>
                                            </td>
                                            <td className="py-4 text-right font-semibold text-slate-200">
                                                {formatNumber(log.records_processed)}
                                            </td>
                                            <td className="py-4 text-slate-400">
                                                <span className="block max-w-[280px] truncate">
                                                    {log.error_message?.trim() || "--"}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-12">
                        <AlertCircle className="mb-2 size-8 text-slate-500" />
                        <p className="text-xs text-slate-500">No crawl runs recorded yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
