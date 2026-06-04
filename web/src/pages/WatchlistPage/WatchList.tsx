import { useEffect, useState } from "react"
import { Trash2, RefreshCw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import type { StockItem } from "@/services/stock.service"
import { getWatchlist, removeFromWatchlist, addToWatchlist } from "@/services/watchlist.service"
import {
    TableLoading,
    TableError,
    TableEmpty,
    placeholder,
    formatNumber,
    formatPercent,
} from "@/shared/components"
import "@/shared/components/shared-stock.css"
import "./WatchlistPage.css"

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<StockItem[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [symbolInput, setSymbolInput] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const loadWatchlist = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await getWatchlist()
            setWatchlist(data)
        } catch (err: any) {
            setError(err.message || "Unable to load watchlist")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadWatchlist()
    }, [])

    const handleRemove = async (symbol: string) => {
        try {
            await removeFromWatchlist(symbol)
            setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol))
        } catch (err: any) {
            alert(err.message || `Failed to remove ${symbol}`)
        }
    }

    const handleAddStock = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!symbolInput.trim()) return
        
        setIsSubmitting(true)
        try {
            await addToWatchlist(symbolInput.trim().toUpperCase())
            setSymbolInput("")
            setIsOpen(false)
            await loadWatchlist()
        } catch (err: any) {
            alert(err.message || "Failed to add stock")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="watchlist">
            <div className="watchlist__breadcrumb">Home / Watchlist</div>
            
            <section className="watchlist__header">
                <div>
                    <h1>My Watchlist</h1>
                    <p>Monitor your selected stocks in real-time</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="default" size="sm">
                                <Plus className="mr-1.5 size-3.5" />
                                Add Stock
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-[#111827] text-white border-slate-700">
                            <DialogHeader>
                                <DialogTitle>Add Stock to Watchlist</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddStock} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium">Stock Symbol</label>
                                    <Input
                                        type="text"
                                        placeholder="EX: FPT, AAA, VNM"
                                        value={symbolInput}
                                        onChange={(e) => setSymbolInput(e.target.value)}
                                        className="bg-[#0f172a] border-slate-700 text-white placeholder-slate-500 uppercase"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Adding..." : "Add"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={loadWatchlist}
                        disabled={isLoading}
                    >
                        <RefreshCw className="mr-1.5 size-3.5" />
                        Refresh
                    </Button>
                </div>
            </section>

            <section className="watchlist__table-card">
                {isLoading ? (
                    <TableLoading />
                ) : error ? (
                    <TableError message={error} onRetry={loadWatchlist} />
                ) : watchlist.length === 0 ? (
                    <TableEmpty message="Your watchlist is empty. Add stocks from the Stock List page." />
                ) : (
                    <div className="watchlist__table-wrap">
                        <table className="watchlist__table">
                            <thead>
                                <tr>
                                    <th>Symbol</th>
                                    <th>Company Name</th>
                                    <th>Market</th>
                                    <th>Latest Close</th>
                                    <th>Change %</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {watchlist.map((stock) => {
                                    const isPositive = (stock.changePercent ?? 0) >= 0;
                                    const isNegative = (stock.changePercent ?? 0) < 0;
                                    
                                    return (
                                        <tr key={stock.symbol}>
                                            <td className="watchlist__symbol-cell">{stock.symbol}</td>
                                            <td>{placeholder(stock.companyName)}</td>
                                            <td>{placeholder(stock.market)}</td>
                                            <td>{formatNumber(stock.latestClosePrice)}</td>
                                            <td className={
                                                stock.changePercent === undefined 
                                                    ? "shared-neutral" 
                                                    : isPositive 
                                                        ? "shared-positive" 
                                                        : isNegative 
                                                            ? "shared-negative" 
                                                            : "shared-neutral"
                                            }>
                                                {formatPercent(stock.changePercent)}
                                            </td>
                                            <td className="text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    onClick={() => handleRemove(stock.symbol)}
                                                    aria-label={`Remove ${stock.symbol}`}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    )
}