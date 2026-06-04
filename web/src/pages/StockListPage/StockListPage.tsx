import { useEffect, useMemo, useState } from "react"
import {
    ArrowDownUp,
    Bell,
    Download,
    RefreshCw,
    Star,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getStockList, type StockItem, type StockListMeta, type StockListQuery } from "@/services/stock.service"
import {
    SearchInput,
    StatusBadge,
    DataTablePagination,
    TableLoading,
    TableError,
    TableEmpty,
    TableNoMatch,
    placeholder,
    formatNumber,
    formatCompact,
    formatPercent,
} from "@/shared/components"
import "@/shared/components/shared-stock.css"
import "./StockListPage.css"

type SortKey = "symbol" | "companyName" | "latestClosePrice" | "changePercent" | "volume" | "marketCap"
type SortDirection = "asc" | "desc"

type LoadState = {
    items: StockItem[]
    meta: StockListMeta
    isLoading: boolean
    error: string | null
}

const DEFAULT_QUERY: StockListQuery = {
    page: 1,
    limit: 400,
    market: "HOSE",
}

const LOCAL_PAGE_SIZE_OPTIONS = [20, 25, 50]

function downloadCsv(rows: StockItem[]) {
    const header = [
        "Symbol",
        "Company Name",
        "Market",
        "Industry/Sector",
        "Status",
        "Latest Close Price",
        "Change",
        "Change %",
        "Volume",
        "Market Cap",
        "Last Updated",
    ]
    const csvRows = rows.map((item) => [
        item.symbol,
        item.companyName ?? "",
        item.market ?? "",
        item.industry ?? item.sector ?? "",
        item.status ?? "",
        item.latestClosePrice ?? "",
        item.change ?? "",
        item.changePercent ?? "",
        item.volume ?? "",
        item.marketCap ?? "",
        item.lastUpdated ?? "",
    ])
    const csv = [header, ...csvRows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "stock-list.csv"
    link.click()
    URL.revokeObjectURL(url)
}

export default function StockListPage() {
    const navigate = useNavigate()
    const [query, setQuery] = useState<StockListQuery>(DEFAULT_QUERY)
    const [state, setState] = useState<LoadState>({
        items: [],
        meta: {},
        isLoading: true,
        error: null,
    })
    const [searchText, setSearchText] = useState("")
    const [sectorFilter, setSectorFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortKey, setSortKey] = useState<SortKey>("symbol")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [tablePage, setTablePage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [actionMessage, setActionMessage] = useState<string | null>(null)

    useEffect(() => {
        if (!actionMessage) return undefined
        const timeout = window.setTimeout(() => setActionMessage(null), 2400)
        return () => window.clearTimeout(timeout)
    }, [actionMessage])

    useEffect(() => {
        let isMounted = true

        async function load() {
            setState((current) => ({ ...current, isLoading: true, error: null }))
            try {
                const result = await getStockList(query)
                if (!isMounted) return
                setState({
                    items: result.items,
                    meta: result.meta,
                    isLoading: false,
                    error: null,
                })
            } catch (error) {
                if (!isMounted) return
                setState((current) => ({
                    ...current,
                    isLoading: false,
                    error: error instanceof Error ? error.message : "Unable to load stock list",
                }))
            }
        }

        void load()

        return () => {
            isMounted = false
        }
    }, [query])

    const endpoint = `/api/stocks?page=${query.page}&limit=${query.limit}&market=${query.market}`

    const sectors = useMemo(() => {
        const values = new Set<string>()
        state.items.forEach((item) => {
            const label = item.industry || item.sector
            if (label) values.add(label)
        })
        return Array.from(values).sort((a, b) => a.localeCompare(b))
    }, [state.items])

    const statuses = useMemo(() => {
        const values = new Set<string>()
        state.items.forEach((item) => {
            if (item.status) values.add(item.status)
        })
        return Array.from(values).sort((a, b) => a.localeCompare(b))
    }, [state.items])

    const filteredItems = useMemo(() => {
        const search = searchText.trim().toLowerCase()
        return state.items.filter((item) => {
            const matchesSearch = !search
                || item.symbol.toLowerCase().includes(search)
                || item.companyName?.toLowerCase().includes(search)
            const itemSector = item.industry || item.sector
            const matchesSector = sectorFilter === "all" || itemSector === sectorFilter
            const matchesStatus = statusFilter === "all" || item.status === statusFilter
            return matchesSearch && matchesSector && matchesStatus
        })
    }, [searchText, sectorFilter, state.items, statusFilter])

    const sortedItems = useMemo(() => {
        const direction = sortDirection === "asc" ? 1 : -1
        return [...filteredItems].sort((left, right) => {
            const getValue = (item: StockItem) => {
                switch (sortKey) {
                    case "symbol":
                        return item.symbol
                    case "companyName":
                        return item.companyName ?? ""
                    case "latestClosePrice":
                        return item.latestClosePrice ?? Number.NEGATIVE_INFINITY
                    case "changePercent":
                        return item.changePercent ?? Number.NEGATIVE_INFINITY
                    case "volume":
                        return item.volume ?? Number.NEGATIVE_INFINITY
                    case "marketCap":
                        return item.marketCap ?? Number.NEGATIVE_INFINITY
                }
            }

            const leftValue = getValue(left)
            const rightValue = getValue(right)

            if (typeof leftValue === "string" && typeof rightValue === "string") {
                return leftValue.localeCompare(rightValue) * direction
            }

            return ((leftValue as number) - (rightValue as number)) * direction
        })
    }, [filteredItems, sortDirection, sortKey])

    const totalPages = Math.max(1, Math.ceil(sortedItems.length / rowsPerPage))

    useEffect(() => {
        setTablePage(1)
    }, [searchText, sectorFilter, sortDirection, sortKey, statusFilter, rowsPerPage])

    useEffect(() => {
        if (tablePage > totalPages) setTablePage(totalPages)
    }, [tablePage, totalPages])

    const paginatedItems = useMemo(() => {
        const start = (tablePage - 1) * rowsPerPage
        return sortedItems.slice(start, start + rowsPerPage)
    }, [rowsPerPage, sortedItems, tablePage])

    const qualitySummary = useMemo(() => {
        const validSymbols = state.items.filter((item) => item.symbol.trim()).length
        const missingCompanyNames = state.items.filter((item) => !item.companyName).length
        const missingPriceData = state.items.filter((item) => item.latestClosePrice === undefined).length
        return {
            totalFetched: state.items.length,
            validSymbols,
            missingCompanyNames,
            missingPriceData,
            lastFetchTime: new Date().toLocaleString(),
        }
    }, [state.items])

    const handleSort = (nextKey: SortKey) => {
        if (nextKey === sortKey) {
            setSortDirection((current) => current === "asc" ? "desc" : "asc")
            return
        }

        setSortKey(nextKey)
        setSortDirection("asc")
    }

    const clearFilters = () => {
        setSearchText("")
        setSectorFilter("all")
        setStatusFilter("all")
    }

    return (
        <div className="stock-list">
            <div className="stock-list__breadcrumb">Home / Stock List</div>

            <section className="stock-list__header">
                <div>
                    <h1>Stock List</h1>
                    <p>Browse HOSE-listed stocks and monitor market data quality</p>
                </div>
                <div className="stock-list__header-status">
                    <span><strong>Market</strong>{query.market}</span>
                    <span><strong>Total stocks</strong>{state.meta.total ?? state.items.length ?? "--"}</span>
                    <span><strong>Last updated</strong>{placeholder(state.meta.lastUpdated)}</span>
                    <span><strong>Source</strong>{placeholder(state.meta.source)}</span>
                </div>
            </section>

            <section className="stock-list__controls">
                <SearchInput value={searchText} onChange={setSearchText} />

                <select
                    value={query.market}
                    className="stock-list__select"
                    onChange={(event) => setQuery((current) => ({ ...current, market: event.target.value, page: 1 }))}
                >
                    {["HOSE", "HNX", "UPCOM"].map((market) => (
                        <option key={market} value={market}>{market}</option>
                    ))}
                </select>

                <select
                    value={sectorFilter}
                    className="stock-list__select"
                    onChange={(event) => setSectorFilter(event.target.value)}
                >
                    <option value="all">All sectors</option>
                    {sectors.map((sector) => (
                        <option key={sector} value={sector}>{sector}</option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    className="stock-list__select"
                    onChange={(event) => setStatusFilter(event.target.value)}
                >
                    <option value="all">All statuses</option>
                    {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>

                <div className="stock-list__actions">
                    <Button type="button" variant="outline" size="sm" onClick={() => setQuery((current) => ({ ...current }))}>
                        <RefreshCw className="size-3.5" /> Refresh
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => downloadCsv(sortedItems)} disabled={!sortedItems.length}>
                        <Download className="size-3.5" /> Export
                    </Button>
                </div>
            </section>

            {actionMessage ? <div className="stock-list__notice">{actionMessage}</div> : null}

            <section className="stock-list__summary-grid">
                {[
                    ["Total fetched records", qualitySummary.totalFetched || "--"],
                    ["Valid symbols", qualitySummary.validSymbols || "--"],
                    ["Missing company names", qualitySummary.missingCompanyNames],
                    ["Missing price data", qualitySummary.missingPriceData],
                    ["Market scope", query.market],
                    ["Last fetch time", qualitySummary.lastFetchTime],
                ].map(([label, value]) => (
                    <div key={label} className="stock-list__summary-card">
                        <span>{label}</span>
                        <strong>{value}</strong>
                    </div>
                ))}
            </section>

            <section className="stock-list__table-card">
                <div className="stock-list__table-header">
                    <div>
                        <h2>HOSE Stock Universe</h2>
                        <p>{sortedItems.length} filtered rows from {state.items.length} fetched records</p>
                    </div>
                    <div className="stock-list__pagination">
                        <select
                            value={rowsPerPage}
                            className="stock-list__select stock-list__select--compact"
                            onChange={(event) => setRowsPerPage(Number(event.target.value))}
                        >
                            {LOCAL_PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>{size} / page</option>
                            ))}
                        </select>
                    </div>
                </div>

                {state.isLoading ? (
                    <TableLoading />
                ) : state.error ? (
                    <TableError message={state.error} endpoint={endpoint} onRetry={() => setQuery((current) => ({ ...current }))} />
                ) : !state.items.length ? (
                    <TableEmpty message="No stocks are available for the selected market." />
                ) : !sortedItems.length ? (
                    <TableNoMatch onClear={clearFilters} />
                ) : (
                    <>
                        <div className="stock-list__table-wrap">
                            <table className="stock-list__table">
                                <thead>
                                    <tr>
                                        {[
                                            ["Symbol", "symbol"],
                                            ["Company Name", "companyName"],
                                            ["Market", null],
                                            ["Industry/Sector", null],
                                            ["Status", null],
                                            ["Latest Close", "latestClosePrice"],
                                            ["Change", null],
                                            ["Change %", "changePercent"],
                                            ["Volume", "volume"],
                                            ["Market Cap", "marketCap"],
                                            ["Last Updated", null],
                                            ["Actions", null],
                                        ].map(([label, key]) => (
                                            <th key={label}>
                                                {key ? (
                                                    <button
                                                        type="button"
                                                        className="stock-list__sort-button"
                                                        onClick={() => handleSort(key as SortKey)}
                                                    >
                                                        {label}
                                                        <ArrowDownUp className="size-3" />
                                                    </button>
                                                ) : label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedItems.map((item) => {
                                        const industryLabel = item.industry || item.sector
                                        return (
                                            <tr key={item.symbol}>
                                                <td className="stock-list__symbol-cell">{item.symbol}</td>
                                                <td>{placeholder(item.companyName)}</td>
                                                <td><Badge variant="outline">{placeholder(item.market)}</Badge></td>
                                                <td>{placeholder(industryLabel)}</td>
                                                <td>
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td>{formatNumber(item.latestClosePrice)}</td>
                                                <td className={item.change === undefined ? "shared-neutral" : item.change > 0 ? "shared-positive" : item.change < 0 ? "shared-negative" : "shared-neutral"}>
                                                    {item.change === undefined ? "--" : formatNumber(item.change)}
                                                </td>
                                                <td className={item.changePercent === undefined ? "shared-neutral" : item.changePercent > 0 ? "shared-positive" : item.changePercent < 0 ? "shared-negative" : "shared-neutral"}>
                                                    {formatPercent(item.changePercent)}
                                                </td>
                                                <td>{formatCompact(item.volume)}</td>
                                                <td>{formatCompact(item.marketCap)}</td>
                                                <td>{placeholder(item.lastUpdated)}</td>
                                                <td>
                                                    <div className="stock-list__row-actions">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="xs"
                                                            onClick={() => navigate(`/stocks/${encodeURIComponent(item.symbol)}`)}
                                                        >
                                                            View Detail
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon-xs"
                                                            aria-label={`Add ${item.symbol} to watchlist`}
                                                            onClick={() => setActionMessage(`Watchlist integration is not connected yet for ${item.symbol}.`)}
                                                        >
                                                            <Star className="size-3" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon-xs"
                                                            aria-label={`Configure alert for ${item.symbol}`}
                                                            disabled
                                                        >
                                                            <Bell className="size-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <DataTablePagination
                            page={tablePage}
                            totalPages={totalPages}
                            from={(tablePage - 1) * rowsPerPage + 1}
                            to={Math.min(tablePage * rowsPerPage, sortedItems.length)}
                            total={sortedItems.length}
                            onPageChange={setTablePage}
                        />
                    </>
                )}
            </section>
        </div>
    )
}
