import { useEffect, useState } from "react"
import { DollarSign, Crown, Users, TrendingUp, AlertTriangle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableLoading, TableError, formatNumber, formatPercent } from "@/shared/components"
import { getSubscriptionStats } from "@/services/admin-subscription.service"
import type { SubscriptionStats as SubscriptionStatsType } from "@/types/subscription"

import "./SubscriptionStats.css"

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
}

function formatCompactCurrency(amount: number): string {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`
    return formatNumber(amount)
}

export default function SubscriptionStats() {
    const [data, setData] = useState<SubscriptionStatsType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await getSubscriptionStats()
            setData(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    if (isLoading) return <div className="ass"><TableLoading /></div>
    if (error) return <div className="ass"><TableError message={error} onRetry={fetchStats} /></div>
    if (!data) return <div className="ass"><TableError message="No stats data available" onRetry={fetchStats} /></div>

    const { overview, expiring_soon, revenue, recent_transactions } = data

    return (
        <div className="ass">
            <div className="ass__breadcrumb">Admin / Subscription Statistics</div>

            {/* Overview cards */}
            <div className="ass__stats-grid">
                <div className="ass__stat-card ass__featured-card">
                    <div className="ass__stat-header">
                        <span className="ass__stat-label">Total Users</span>
                        <div className="ass__stat-icon" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(96,165,250,0.25)" }}>
                            <Users className="size-4 text-blue-400" />
                        </div>
                    </div>
                    <span className="ass__stat-value">{formatNumber(overview.total_users)}</span>
                    <div className="ass__conversion-bar">
                        <div className="ass__conversion-fill" style={{ width: `${overview.pro_percentage}%` }} />
                    </div>
                    <span className="ass__stat-sub">{formatPercent(overview.pro_percentage)} PRO conversion</span>
                </div>

                <div className="ass__stat-card">
                    <div className="ass__stat-header">
                        <span className="ass__stat-label">Active PRO</span>
                        <div className="ass__stat-icon" style={{ background: "rgba(250,204,21,0.12)", border: "1px solid rgba(250,204,21,0.25)" }}>
                            <Crown className="size-4 text-yellow-400" />
                        </div>
                    </div>
                    <span className="ass__stat-value">{formatNumber(overview.active_pro)}</span>
                    <span className="ass__stat-sub">{formatNumber(overview.expired_pro)} expired · {formatNumber(overview.cancelled_pro)} cancelled</span>
                </div>

                <div className="ass__stat-card">
                    <div className="ass__stat-header">
                        <span className="ass__stat-label">Free Users</span>
                        <div className="ass__stat-icon" style={{ background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.2)" }}>
                            <Users className="size-4 text-slate-400" />
                        </div>
                    </div>
                    <span className="ass__stat-value">{formatNumber(overview.free_users)}</span>
                    <span className="ass__stat-sub">{formatNumber(overview.total_users - overview.free_users)} ever converted</span>
                </div>

                <div className="ass__stat-card">
                    <div className="ass__stat-header">
                        <span className="ass__stat-label">Total Revenue</span>
                        <div className="ass__stat-icon" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
                            <DollarSign className="size-4 text-emerald-400" />
                        </div>
                    </div>
                    <span className="ass__stat-value">{formatCompactCurrency(revenue.total_all_time)}</span>
                    <span className="ass__stat-sub">{formatCurrency(revenue.total_all_time)} all time</span>
                </div>
            </div>

            {/* Expiring soon + Revenue details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ border: "1px solid var(--border)", borderRadius: 10, background: "#111827", padding: 16 }}>
                    <h2 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                        <AlertTriangle className="size-4 text-amber-400" /> Expiring Soon
                    </h2>
                    <div className="ass__expiring-grid">
                        <div className="ass__expiring-card" style={{ borderLeft: "3px solid #facc15" }}>
                            <Calendar className="size-6 text-amber-400 opacity-60" />
                            <div>
                                <div className="ass__expiring-number" style={{ color: "#facc15" }}>{formatNumber(expiring_soon.within_7_days)}</div>
                                <div className="ass__expiring-label">Within 7 days</div>
                            </div>
                        </div>
                        <div className="ass__expiring-card" style={{ borderLeft: "3px solid #fb923c" }}>
                            <Calendar className="size-6 text-orange-400 opacity-60" />
                            <div>
                                <div className="ass__expiring-number" style={{ color: "#fb923c" }}>{formatNumber(expiring_soon.within_30_days)}</div>
                                <div className="ass__expiring-label">Within 30 days</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ border: "1px solid var(--border)", borderRadius: 10, background: "#111827", padding: 16 }}>
                    <h2 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                        <TrendingUp className="size-4 text-emerald-400" /> Revenue Overview
                    </h2>
                    <div className="ass__revenue-grid">
                        <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10, background: "#1e293b" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.03em" }}>This Month</span>
                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f8fafc", marginTop: 4 }}>{formatCompactCurrency(revenue.current_month)}</div>
                        </div>
                        <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10, background: "#1e293b" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Last Month</span>
                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f8fafc", marginTop: 4 }}>{formatCompactCurrency(revenue.last_month)}</div>
                        </div>
                        <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10, background: "#1e293b" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.03em" }}>MoM Growth</span>
                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: revenue.last_month > 0 ? (revenue.current_month >= revenue.last_month ? "#4ade80" : "#f87171") : "#f8fafc", marginTop: 4 }}>
                                {revenue.last_month > 0
                                    ? `${((revenue.current_month - revenue.last_month) / revenue.last_month * 100).toFixed(1)}%`
                                    : "—"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent transactions */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, background: "#111827", padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>Recent Transactions</h2>
                    <Button type="button" variant="outline" size="xs" onClick={fetchStats} disabled={isLoading}>
                        <TrendingUp className="size-3.5" /> Refresh
                    </Button>
                </div>
                {recent_transactions.length === 0 ? (
                    <div style={{ padding: "24px 0", textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
                        No recent transactions.
                    </div>
                ) : (
                    <table className="ass__tx-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent_transactions.slice(0, 10).map((tx) => (
                                <tr key={tx.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{tx.user?.full_name ?? "—"}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{tx.user?.email ?? "—"}</div>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 600,
                                            ...(tx.type === "PAYOS_PAYMENT" ? { background: "rgba(59,130,246,0.12)", color: "#60a5fa" } : {}),
                                            ...(tx.type === "ADMIN_GRANT" ? { background: "rgba(34,197,94,0.12)", color: "#4ade80" } : {}),
                                            ...(tx.type === "ADMIN_RENEW" ? { background: "rgba(250,204,21,0.12)", color: "#facc15" } : {}),
                                            ...(tx.type === "ADMIN_CANCEL" ? { background: "rgba(239,68,68,0.12)", color: "#f87171" } : {}),
                                            ...(tx.type === "ADMIN_MODIFY" ? { background: "rgba(168,85,247,0.12)", color: "#c084fc" } : {}),
                                        }}>
                                            {(tx.type ?? "").replace("ADMIN_", "").replace("PAYOS_", "")}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{tx.amount > 0 ? formatCurrency(tx.amount) : "—"}</td>
                                    <td>{tx.status}</td>
                                    <td style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                                        {new Date(tx.created_at).toISOString().slice(0, 19).replace("T", " ")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
