import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Crown, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { StockItem } from "@/services/stock.service"
import {
    getWatchlistData,
    removeFromWatchlist,
    trimWatchlist,
    type WatchlistRawItem,
} from "@/services/watchlist.service"
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

function getStockId(raw: WatchlistRawItem): string {
    return String(raw.stock_id || raw.stock?.stock_id || raw.stock?.symbol || raw.stock_code || "")
}

function getStockSymbol(raw: WatchlistRawItem): string {
    return String(raw.stock_code || raw.stock?.symbol || "--")
}

function getStockName(raw: WatchlistRawItem): string {
    return String(raw.stock_name || raw.stock?.company_name || "--")
}

type WatchlistOverflowOverlayProps = {
    open: boolean
    stocks: WatchlistRawItem[]
    limit: number
    onTrimSuccess: () => void
}

function WatchlistOverflowOverlay({
    open,
    stocks,
    limit,
    onTrimSuccess,
}: WatchlistOverflowOverlayProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    if (!open) return null

    const toggleStock = (stockId: string) => {
        setErrorMessage(null)

        setSelectedIds((prev) => {
            if (prev.includes(stockId)) {
                return prev.filter((id) => id !== stockId)
            }

            if (prev.length >= limit) {
                setErrorMessage(`You can only keep ${limit} stocks.`)
                return prev
            }

            return [...prev, stockId]
        })
    }

    const handleConfirmTrim = async () => {
        if (selectedIds.length === 0) {
            setErrorMessage("Please select at least one stock to keep.")
            return
        }

        if (selectedIds.length > limit) {
            setErrorMessage(`You can only keep ${limit} stocks.`)
            return
        }

        try {
            setIsSubmitting(true)
            setErrorMessage(null)

            await trimWatchlist(selectedIds)
            await onTrimSuccess()
        } catch (err: any) {
            setErrorMessage(err.message || "Failed to trim watchlist.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="watchlist-overflow">
            <div className="watchlist-overflow__panel">
                <div className="watchlist-overflow__header">
                    <div>
                        <div className="watchlist-overflow__title">
                            <AlertTriangle className="size-5 text-yellow-300" />
                            <h2>Watchlist limit reached</h2>
                        </div>

                        <p>
                            Your current plan only allows you to keep up to{" "}
                            <strong>{limit}</strong> stocks. Select the stocks you want
                            to keep, or upgrade your plan to continue using a larger
                            watchlist.
                        </p>
                    </div>
                </div>

                <div className="watchlist-overflow__select-box">
                    <div className="watchlist-overflow__select-header">
                        <span>Select stocks to keep</span>
                        <span>
                            {selectedIds.length}/{limit} selected
                        </span>
                    </div>

                    <div className="watchlist-overflow__list">
                        {stocks.length === 0 ? (
                            <div className="watchlist-overflow__empty">
                                No watchlist items found.
                            </div>
                        ) : (
                            stocks.map((stock) => {
                                const stockId = getStockId(stock)
                                const selected = selectedIds.includes(stockId)

                                return (
                                    <button
                                        key={stockId}
                                        type="button"
                                        className={`watchlist-overflow__item ${selected ? "is-selected" : ""
                                            }`}
                                        onClick={() => toggleStock(stockId)}
                                    >
                                        <div>
                                            <div className="watchlist-overflow__symbol">
                                                {getStockSymbol(stock)}
                                            </div>
                                            <div className="watchlist-overflow__name">
                                                {getStockName(stock)}
                                            </div>
                                        </div>

                                        <div className="watchlist-overflow__check">
                                            {selected ? "✓" : ""}
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>

                {errorMessage && (
                    <div className="watchlist-overflow__error">
                        {errorMessage}
                    </div>
                )}

                <div className="watchlist-overflow__actions">
                    <Button asChild variant="outline">
                        <Link to="/upgrade">
                            <Crown className="mr-1.5 size-4" />
                            Upgrade Plan
                        </Link>
                    </Button>

                    <Button
                        type="button"
                        onClick={handleConfirmTrim}
                        disabled={isSubmitting || selectedIds.length === 0}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Keep Selected Stocks"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function WatchlistPage() {
    const navigate = useNavigate()
    const [watchlist, setWatchlist] = useState<StockItem[]>([])
    const [rawWatchlist, setRawWatchlist] = useState<WatchlistRawItem[]>([])
    const [isOverLimit, setIsOverLimit] = useState<boolean>(false)
    const [watchlistLimit, setWatchlistLimit] = useState<number>(5)

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const watchedSymbols = useMemo(
        () => new Set(watchlist.map((s) => s.symbol)),
        [watchlist]
    )

    const loadWatchlist = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await getWatchlistData()

            setWatchlist(data.items)
            setRawWatchlist(data.rawItems)
            setIsOverLimit(data.overLimit)
            setWatchlistLimit(data.limit)
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
            await loadWatchlist()
        } catch (err: any) {
            alert(err.message || `Failed to remove ${symbol}`)
        }
    }

    return (
        <>
            <div className="watchlist">
                <Breadcrumb items={["Home", "Watchlist"]} />

                <section className="watchlist__header">
                    <div>
                        <h1>My Watchlist</h1>
                        <p>Monitor your selected stocks in real-time</p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => setIsOpen(true)}
                        >
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
                                        const isPositive = (stock.changePercent ?? 0) >= 0
                                        const isNegative = (stock.changePercent ?? 0) < 0

                                        return (
                                            <tr key={stock.symbol}>
                                                <td className="watchlist__symbol-cell">
                                                    {stock.symbol}
                                                </td>

                                                <td>{placeholder(stock.companyName)}</td>
                                                <td>{placeholder(stock.market)}</td>
                                                <td>{formatNumber(stock.latestClosePrice)}</td>

                                                <td
                                                    className={
                                                        stock.changePercent === undefined
                                                            ? "shared-neutral"
                                                            : isPositive
                                                                ? "shared-positive"
                                                                : isNegative
                                                                    ? "shared-negative"
                                                                    : "shared-neutral"
                                                    }
                                                >
                                                    {formatPercent(stock.changePercent)}
                                                </td>

                                                <td className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="xs"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/stocks/${encodeURIComponent(
                                                                        stock.symbol
                                                                    )}`
                                                                )
                                                            }
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

            <WatchlistOverflowOverlay
                open={isOverLimit}
                stocks={rawWatchlist}
                limit={watchlistLimit}
                onTrimSuccess={loadWatchlist}
            />
        </>
    )
}