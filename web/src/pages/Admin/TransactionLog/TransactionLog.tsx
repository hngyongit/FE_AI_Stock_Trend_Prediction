import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DataTablePagination,
    TableLoading,
    TableError,
    TableEmpty,
    TableNoMatch,
    placeholder,
} from "@/shared/components"
import {
    getTransactions,
} from "@/services/admin-subscription.service"
import type {
    SubscriptionTransaction,
    GetTransactionsParams,
    TransactionType,
    TransactionStatus,
} from "@/types/subscription"

import "./TransactionLog.css"

const TX_TYPE_OPTIONS: TransactionType[] = [
    "PAYOS_PAYMENT", "ADMIN_GRANT", "ADMIN_RENEW", "ADMIN_CANCEL", "ADMIN_MODIFY",
]
const TX_STATUS_OPTIONS: TransactionStatus[] = ["PAID", "CANCELLED", "REFUNDED", "GRANTED", "EXPIRED"]

function formatDate(dateStr: string): string {
    return new Date(dateStr).toISOString().slice(0, 19).replace("T", " ")
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
}

function TxTypeBadge({ type }: { type: TransactionType }) {
    const colorMap: Record<string, { bg: string; color: string }> = {
        PAYOS_PAYMENT: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
        ADMIN_GRANT: { bg: "rgba(34,197,94,0.12)", color: "#4ade80" },
        ADMIN_RENEW: { bg: "rgba(250,204,21,0.12)", color: "#facc15" },
        ADMIN_CANCEL: { bg: "rgba(239,68,68,0.12)", color: "#f87171" },
        ADMIN_MODIFY: { bg: "rgba(168,85,247,0.12)", color: "#c084fc" },
    }
    const labelMap: Record<string, string> = {
        PAYOS_PAYMENT: "Payment",
        ADMIN_GRANT: "Grant",
        ADMIN_RENEW: "Renew",
        ADMIN_CANCEL: "Cancel",
        ADMIN_MODIFY: "Modify",
    }
    const style = colorMap[type] ?? { bg: "rgba(148,163,184,0.1)", color: "#94a3b8" }
    return <span className="atl__tx-type" style={{ background: style.bg, color: style.color }}>{labelMap[type] ?? type}</span>
}

function TxStatusBadge({ status }: { status: TransactionStatus }) {
    const colorMap: Record<string, { bg: string; color: string }> = {
        PAID: { bg: "rgba(34,197,94,0.12)", color: "#4ade80" },
        CANCELLED: { bg: "rgba(239,68,68,0.12)", color: "#f87171" },
        REFUNDED: { bg: "rgba(168,85,247,0.12)", color: "#c084fc" },
        GRANTED: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
        EXPIRED: { bg: "rgba(148,163,184,0.1)", color: "#94a3b8" },
    }
    const style = colorMap[status] ?? { bg: "rgba(148,163,184,0.1)", color: "#94a3b8" }
    return <span className="atl__tx-status" style={{ background: style.bg, color: style.color }}>{status}</span>
}

export default function TransactionLog() {
    const [params, setParams] = useState<GetTransactionsParams>({ page: 1, limit: 25 })
    const [items, setItems] = useState<SubscriptionTransaction[]>([])
    const [pagination, setPagination] = useState<{
        page: number; limit: number; total_items: number; total_pages: number
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [userIdFilter, setUserIdFilter] = useState("")
    const [typeFilter, setTypeFilter] = useState<TransactionType | "">("")
    const [statusFilter, setStatusFilter] = useState<TransactionStatus | "">("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    const loadData = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const cleanParams: GetTransactionsParams = {
                page: params.page ?? 1,
                limit: params.limit ?? 25,
            }
            if (params.type) cleanParams.type = params.type
            if (params.status) cleanParams.status = params.status
            if (params.user_id) cleanParams.user_id = params.user_id
            if (params.from) cleanParams.from = params.from
            if (params.to) cleanParams.to = params.to

            const result = await getTransactions(cleanParams)
            setItems(result.items || [])

            if (result.pagination) {
                setPagination({
                    page: result.pagination.page ?? 1,
                    limit: result.pagination.limit ?? params.limit ?? 25,
                    total_items: result.pagination.total_items ?? 0,
                    total_pages: result.pagination.total_pages ?? 1,
                })
            } else {
                setPagination({
                    page: params.page ?? 1,
                    limit: params.limit ?? 25,
                    total_items: result.items?.length ?? 0,
                    total_pages: 1,
                })
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [params])

    const applyFilters = () => {
        setParams((p) => ({
            ...p,
            user_id: userIdFilter || undefined,
            type: typeFilter || undefined,
            status: statusFilter || undefined,
            from: fromDate || undefined,
            to: toDate || undefined,
            page: 1,
        }))
    }

    const clearFilters = () => {
        setUserIdFilter("")
        setTypeFilter("")
        setStatusFilter("")
        setFromDate("")
        setToDate("")
        setParams({ page: 1, limit: 25 })
    }

    const handlePageChange = (page: number) => {
        setParams((p) => ({ ...p, page }))
    }

    const total = pagination?.total_items ?? items.length
    const page = pagination?.page ?? params.page ?? 1
    const totalPages = Math.max(1, pagination?.total_pages ?? Math.ceil((total || 1) / (params.limit ?? 25)))
    const from = (page - 1) * (pagination?.limit ?? params.limit ?? 25) + 1
    const to = Math.min(page * (pagination?.limit ?? params.limit ?? 25), total)

    const hasFilters = Boolean(userIdFilter || typeFilter || statusFilter || fromDate || toDate)

    return (
        <div className="atl">
            <div className="atl__breadcrumb">Admin / Transaction Log</div>

            <section style={{ border: "1px solid var(--border)", borderRadius: 10, background: "#111827", padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Transaction Log</h1>
                        <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: "0.8rem" }}>
                            View all subscription payment and admin intervention transactions.
                        </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
                        <RefreshCw className="size-3.5" /> Refresh
                    </Button>
                </div>
                <div className="atl__filters">
                    <input
                        className="ams__select" style={{ minWidth: 180, padding: "6px 10px" }}
                        placeholder="Filter by user ID..."
                        value={userIdFilter}
                        onChange={(e) => setUserIdFilter(e.target.value)}
                    />
                    <select className="atl__select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TransactionType | "")}>
                        <option value="">All types</option>
                        {TX_TYPE_OPTIONS.map((t) => (
                            <option key={t} value={t}>{t.replace("_", " ")}</option>
                        ))}
                    </select>
                    <select className="atl__select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | "")}>
                        <option value="">All statuses</option>
                        {TX_STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <input type="date" className="atl__date-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} title="From date" />
                    <input type="date" className="atl__date-input" value={toDate} onChange={(e) => setToDate(e.target.value)} title="To date" />
                    <Button type="button" variant="default" size="sm" onClick={applyFilters}>Apply</Button>
                    {hasFilters && (
                        <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
                    )}
                </div>
            </section>

            <section style={{ border: "1px solid var(--border)", borderRadius: 10, background: "#111827" }}>
                {isLoading ? (
                    <TableLoading />
                ) : error ? (
                    <TableError message={error} onRetry={loadData} />
                ) : !items.length ? (
                    hasFilters ? <TableNoMatch onClear={clearFilters} /> : <TableEmpty message="No transactions found." />
                ) : (
                    <>
                        <div style={{ overflowX: "auto" }}>
                            <table className="atl__table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Plan Change</th>
                                        <th>Performed By</th>
                                        <th>Notes</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((tx) => (
                                        <tr key={tx.id}>
                                            <td>
                                                {tx.user
                                                    ? <><div style={{ fontWeight: 600 }}>{placeholder(tx.user.full_name)}</div><div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{tx.user.email}</div></>
                                                    : <span style={{ color: "var(--muted-foreground)" }}>—</span>
                                                }
                                            </td>
                                            <td><TxTypeBadge type={tx.transaction_type} /></td>
                                            <td style={{ fontWeight: 700 }}>{tx.amount > 0 ? formatCurrency(tx.amount) : "—"}</td>
                                            <td><TxStatusBadge status={tx.status} /></td>
                                            <td style={{ fontSize: "0.78rem" }}>{tx.previous_plan} → {tx.new_plan}</td>
                                            <td style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{tx.performed_by?.full_name ?? "—"}</td>
                                            <td style={{ fontSize: "0.76rem", color: "var(--muted-foreground)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {tx.notes || "—"}
                                            </td>
                                            <td style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>{formatDate(tx.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <DataTablePagination
                            page={page}
                            totalPages={totalPages}
                            from={from}
                            to={to}
                            total={total}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </section>
        </div>
    )
}