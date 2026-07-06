import { useEffect, useState } from "react"
import { Trash2, Plus, RefreshCw, BellRing, BellOff, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    TableLoading,
    TableError,
    TableEmpty,
    Breadcrumb,
    formatNumber,
} from "@/shared/components"
import { 
    getAlerts, 
    createAlert, 
    updateAlert, 
    deleteAlert, 
    type AlertItem, 
    type AlertType 
} from "@/services/alert.service"
import { getWatchlist } from "@/services/watchlist.service"
import type { StockItem } from "@/services/stock.service"
import "@/shared/components/shared-stock.css"

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<AlertItem[]>([])
    const [watchlist, setWatchlist] = useState<StockItem[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // Form states
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [symbol, setSymbol] = useState("")
    const [alertType, setAlertType] = useState<AlertType>("PRICE_ABOVE")
    const [threshold, setThreshold] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const loadData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const [alertsData, watchlistData] = await Promise.all([
                getAlerts(),
                getWatchlist()
            ])
            setAlerts(alertsData)
            setWatchlist(watchlistData)
        } catch (err: any) {
            setError(err.message || "Failed to load data")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleToggle = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE"
            const updatedAlert = await updateAlert(id, { status: newStatus })
            setAlerts((prev) => prev.map(a => a.id === id ? updatedAlert : a))
        } catch (err: any) {
            alert(err.message || "Failed to toggle alert")
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteAlert(id)
            setAlerts((prev) => prev.filter(a => a.id !== id))
        } catch (err: any) {
            alert(err.message || "Failed to delete alert")
        }
    }

    const handleCreateAlert = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!symbol || !threshold) return
        
        setIsSubmitting(true)
        try {
            await createAlert({
                symbol: symbol,
                alert_type: alertType,
                threshold: Number(threshold)
            })
            setIsCreateOpen(false)
            setSymbol("")
            setThreshold("")
            await loadData()
        } catch (err: any) {
            alert(err.message || "Failed to create alert")
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs font-medium">Active</span>
            case "TRIGGERED":
                return <span className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><AlertTriangle className="size-3"/> Triggered</span>
            case "DISABLED":
                return <span className="bg-slate-500/10 text-slate-400 px-2 py-1 rounded text-xs font-medium">Disabled</span>
            default:
                return null
        }
    }

    const getConditionText = (type: string, threshold: number) => {
        if (type === "PRICE_ABOVE") return `Price ≥ ${formatNumber(threshold)}`
        if (type === "PRICE_BELOW") return `Price ≤ ${formatNumber(threshold)}`
        if (type === "VOLUME_ABOVE") return `Volume ≥ ${formatNumber(threshold)}`
        return ""
    }

    return (
        <div className="p-6 text-[var(--foreground)] flex flex-col gap-4">
            <Breadcrumb items={["Home", "Price Alerts"]} />

            <div className="flex justify-between items-center bg-[#111827] p-5 rounded-lg border border-[var(--border)]">
                <div>
                    <h1 className="text-xl font-bold">My Alerts</h1>
                    <p className="text-sm text-[var(--muted-foreground)]">Get notified when stocks hit your target conditions.</p>
                </div>
                
                <div className="flex gap-2">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="default" size="sm">
                                <Plus className="mr-1.5 size-3.5" />
                                Create Alert
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-[#111827] text-white border-slate-700">
                            <DialogHeader>
                                <DialogTitle>Create New Alert</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateAlert} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium">Stock Symbol</label>
                                    <select 
                                        className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-md px-3 h-10 text-sm outline-none"
                                        value={symbol}
                                        onChange={(e) => setSymbol(e.target.value)}
                                        disabled={isSubmitting || watchlist.length === 0}
                                        required
                                    >
                                        <option value="" disabled>
                                            {watchlist.length === 0 ? "Your watchlist is empty" : "Select from Watchlist"}
                                        </option>
                                        {watchlist.map(stock => (
                                            <option key={stock.symbol} value={stock.symbol}>
                                                {stock.symbol} {stock.companyName ? `- ${stock.companyName}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium">Condition</label>
                                    <select 
                                        className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-md px-3 h-10 text-sm outline-none"
                                        value={alertType}
                                        onChange={(e) => setAlertType(e.target.value as AlertType)}
                                        disabled={isSubmitting}
                                    >
                                        <option value="PRICE_ABOVE">Price Rises Above (≥)</option>
                                        <option value="PRICE_BELOW">Price Drops Below (≤)</option>
                                        <option value="VOLUME_ABOVE">Volume Spikes Above (≥)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium">Target Value</label>
                                    <Input
                                        type="number"
                                        placeholder="E.g. 150000"
                                        value={threshold}
                                        onChange={(e) => setThreshold(e.target.value)}
                                        className="bg-[#0f172a] border-slate-700"
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting || watchlist.length === 0}>
                                        {isSubmitting ? "Creating..." : "Create"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Button type="button" variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
                        <RefreshCw className="mr-1.5 size-3.5" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="bg-[#111827] p-3 rounded-lg border border-[var(--border)] min-h-[400px]">
                {isLoading ? (
                    <TableLoading />
                ) : error ? (
                    <TableError message={error} onRetry={loadData} />
                ) : alerts.length === 0 ? (
                    <TableEmpty message="You don't have any active alerts." />
                ) : (
                    <div className="overflow-auto border border-[var(--border)]/50 rounded-md">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-[#0f172a] sticky top-0">
                                <tr>
                                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]/70">Symbol</th>
                                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]/70">Condition</th>
                                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]/70">Current Value</th>
                                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]/70">Status</th>
                                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]/70 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map((alert) => (
                                    <tr key={alert.id} className="hover:bg-slate-800/40 border-b border-[var(--border)]/50 last:border-0 text-sm">
                                        <td className="p-3">
                                            <div className="font-bold text-blue-300">{alert.symbol}</div>
                                            <div className="text-xs text-slate-500">{alert.company_name}</div>
                                        </td>
                                        <td className="p-3 font-medium text-slate-300">
                                            {getConditionText(alert.alert_type, alert.threshold)}
                                        </td>
                                        <td className="p-3 text-slate-400">
                                            {alert.alert_type === "VOLUME_ABOVE" 
                                                ? formatNumber(alert.latest_price?.volume)
                                                : formatNumber(alert.latest_price?.close_price)}
                                        </td>
                                        <td className="p-3">
                                            {getStatusBadge(alert.status)}
                                            {alert.status === "TRIGGERED" && alert.triggered_at && (
                                                <div className="text-[10px] text-slate-500 mt-1">
                                                    {new Date(alert.triggered_at).toLocaleString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => handleToggle(alert.id, alert.status)}
                                                    title={alert.status === "ACTIVE" ? "Disable Alert" : "Activate Alert"}
                                                >
                                                    {alert.status === "ACTIVE" ? <BellOff className="size-4 text-slate-400" /> : <BellRing className="size-4 text-blue-400" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(alert.id)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}