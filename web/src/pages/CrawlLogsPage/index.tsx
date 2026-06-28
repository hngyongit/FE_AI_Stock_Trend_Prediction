import { useEffect, useState } from "react"
import { Eye, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    TableLoading,
    TableError,
    TableEmpty,
    Breadcrumb,
    StatusBadge,
    placeholder,
    formatNumber,
} from "@/shared/components"
import { getCrawlLogs, getCrawlLogById, getFailedSymbolsByLogId, type CrawlLog, type CrawlLogDetail, type FailedSymbol } from "@/services/crawl.service"
import "@/shared/components/shared-stock.css"
import "./CrawlLogsPage.css"

export default function CrawlLogsPage() {
    const [logs, setLogs] = useState<CrawlLog[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const [statusFilter, setStatusFilter] = useState<string>("")
    const [dateFilter, setDateFilter] = useState<string>("")

    const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
    const [logDetail, setLogDetail] = useState<CrawlLogDetail | null>(null)
    const [failedSymbols, setFailedSymbols] = useState<FailedSymbol[]>([])
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false)

    const loadLogs = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await getCrawlLogs({
                status: statusFilter || undefined,
                date: dateFilter || undefined,
                page: 1,
                limit: 50,
            })
            setLogs(data.items || [])
        } catch (err: any) {
            setError(err.message || "Failed to load crawl logs")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadLogs()
    }, [statusFilter, dateFilter])

    const handleViewDetail = async (id: string) => {
        setSelectedLogId(id)
        setIsDetailLoading(true)
        try {
            const [detailData, symbolsData] = await Promise.all([
                getCrawlLogById(id),
                getFailedSymbolsByLogId(id)
            ])
            setLogDetail(detailData)
            setFailedSymbols(symbolsData)
        } catch (err: any) {
            alert(err.message || "Failed to load log details")
        } finally {
            setIsDetailLoading(false)
        }
    }

    return (
        <div className="p-6 text-[var(--foreground)] flex flex-col gap-4">
            <Breadcrumb items={["Staff", "Crawl Logs"]} />

            <div className="flex justify-between items-end bg-[#111827] p-4 rounded-lg border border-[var(--border)]">
                <div className="flex gap-4 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[var(--muted-foreground)]">Status</label>
                        <select 
                            className="bg-[#0f172a] border border-[var(--border)] rounded px-3 py-1.5 text-sm outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                            <option value="RUNNING">Running</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[var(--muted-foreground)]">Date</label>
                        <Input 
                            type="date" 
                            className="h-8 bg-[#0f172a] border-[var(--border)] text-sm"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={loadLogs} disabled={isLoading}>
                    <RefreshCw className="mr-1.5 size-3.5" />
                    Refresh
                </Button>
            </div>

            <div className="bg-[#111827] p-3 rounded-lg border border-[var(--border)] min-h-[400px]">
                {isLoading ? (
                    <TableLoading />
                ) : error ? (
                    <TableError message={error} onRetry={loadLogs} />
                ) : logs.length === 0 ? (
                    <TableEmpty message="No crawl logs found." />
                ) : (
                    <div className="overflow-auto border border-[var(--border)]/50 rounded-md">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-[#0f172a] sticky top-0">
                                <tr>
                                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]/70">ID</th>
                                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]/70">Source</th>
                                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]/70">Start Time</th>
                                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]/70">Items</th>
                                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]/70">Errors</th>
                                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]/70">Status</th>
                                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]/70 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-800/40 border-b border-[var(--border)]/50 last:border-0 text-sm">
                                        <td className="p-3 text-blue-100 font-mono text-xs">{log.id.slice(0,8)}</td>
                                        <td className="p-3">{placeholder(log.source)}</td>
                                        <td className="p-3">{new Date(log.start_time).toLocaleString()}</td>
                                        <td className="p-3">{formatNumber(log.items_crawled)}</td>
                                        <td className="p-3 text-red-400">{formatNumber(log.error_count)}</td>
                                        <td className="p-3"><StatusBadge status={log.status} /></td>
                                        <td className="p-3 text-right">
                                            <Button variant="ghost" size="icon-xs" onClick={() => handleViewDetail(log.id)}>
                                                <Eye className="size-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Dialog open={!!selectedLogId} onOpenChange={(open) => !open && setSelectedLogId(null)}>
                <DialogContent className="max-w-3xl bg-[#111827] text-white border-slate-700 max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Crawl Log Details</DialogTitle>
                    </DialogHeader>
                    {isDetailLoading ? (
                        <div className="py-10 text-center text-slate-400">Loading details...</div>
                    ) : logDetail ? (
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm bg-[#0f172a] p-4 rounded border border-slate-700">
                                <div><span className="text-slate-400">ID:</span> {logDetail.id}</div>
                                <div><span className="text-slate-400">Status:</span> <StatusBadge status={logDetail.status} /></div>
                                <div><span className="text-slate-400">Source:</span> {logDetail.source}</div>
                                <div><span className="text-slate-400">Duration:</span> {logDetail.start_time} - {logDetail.end_time || "Running"}</div>
                            </div>
                            
                            {failedSymbols.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-red-400 mb-2">Failed Symbols</h4>
                                    <div className="bg-[#0f172a] rounded border border-red-900/50 overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-red-950/20">
                                                <tr>
                                                    <th className="p-2 border-b border-red-900/30">Symbol</th>
                                                    <th className="p-2 border-b border-red-900/30">Reason</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {failedSymbols.map((fs, idx) => (
                                                    <tr key={idx} className="border-b border-red-900/20 last:border-0">
                                                        <td className="p-2 font-bold">{fs.symbol}</td>
                                                        <td className="p-2 text-slate-300">{fs.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-10 text-center text-red-400">Failed to load details.</div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}