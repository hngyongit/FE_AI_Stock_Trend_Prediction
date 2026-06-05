import { useEffect, useMemo, useState } from "react"
import { Trash2, RefreshCw, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { StockItem } from "@/services/stock.service"
import { getWatchlist, removeFromWatchlist } from "@/services/watchlist.service"
import AddStockModal from "@/shared/components/AddStockModal"
import {
    TableLoading,
    TableError,
    TableEmpty,
    Breadcrumb,
    placeholder,
    formatNumber,
    formatPercent,
} from "@/shared/components"
import "@/shared/components/shared-stock.css"
import "./WatchlistPage.css"

export default function WatchlistPage() {
    const navigate = useNavigate()
    const [watchlist, setWatchlist] = useState<StockItem[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    // Derived set of currently watched symbols
    const watchedSymbols = useMemo(() => new Set(watchlist.map((s) => s.symbol)), [watchlist])

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

    return (
        <div className="watchlist">
            <Breadcrumb items={["Home", "Watchlist"]} />

            <section className="watchlist__header">
                <div>
                    <h1>My Watchlist</h1>
                    <p>Monitor your selected stocks in real-time</p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="default" size="sm" onClick={() => setIsOpen(true)}>
                        <Plus className="mr-1.5 size-3.5" />
                        Add Stock
                    </Button>

                    <AddStockModal
                        open={isOpen}
                        onOpenChange={setIsOpen}
                        watchedSymbols={watchedSymbols}
                        onWatchlistChange={loadWatchlist}
                    />

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
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="xs"
                                                        onClick={() => navigate(`/stocks/${encodeURIComponent(stock.symbol)}`)}
                                                    >
                                                        View Detail
                                                    </Button>
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
                                                </div>
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