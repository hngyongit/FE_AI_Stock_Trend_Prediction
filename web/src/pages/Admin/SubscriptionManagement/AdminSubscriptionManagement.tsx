import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    Clock,
    Crown,
    Eye,
    RefreshCw,
    UserX,
    Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DataTablePagination,
    SearchInput,
    TableLoading,
    TableError,
    TableEmpty,
    TableNoMatch,
    placeholder,
} from "@/shared/components"
import {
    getSubscriptions,
    renewSubscription,
    grantProAccess,
    cancelSubscription,
} from "@/services/admin-subscription.service"
import type {
    AdminSubscriptionItem,
    GetSubscriptionsParams,
    SubscriptionPlan,
    SubscriptionStatus,
    SubscriptionSummary,
} from "@/types/subscription"

import "./AdminSubscriptionManagement.css"

const PLAN_OPTIONS: SubscriptionPlan[] = ["FREE", "PRO"]
const STATUS_OPTIONS: SubscriptionStatus[] = ["NONE", "ACTIVE", "EXPIRED", "CANCELLED"]

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—"
    return new Date(dateStr).toISOString().slice(0, 19).replace("T", " ")
}

function daysUntil(dateStr: string | null): number | null {
    if (!dateStr) return null
    const diff = new Date(dateStr).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function ExpiryCell({ expiresAt }: { expiresAt: string | null }) {
    if (!expiresAt) return <span className="ams__expiry-cell">—</span>

    const days = daysUntil(expiresAt)
    const isOverdue = days !== null && days < 0
    const isSoon = days !== null && days >= 0 && days <= 14

    let className = "ams__expiry-cell"
    if (isOverdue) className += " ams__expiry-cell--overdue"
    else if (isSoon) className += " ams__expiry-cell--soon"

    return (
        <span className={className}>
            {formatDate(expiresAt)}
            {days !== null && (
                <span className="ams__expiry-sub"> ({days >= 0 ? `${days}d` : "overdue"})</span>
            )}
        </span>
    )
}

function PlanBadge({ plan }: { plan: SubscriptionPlan }) {
    return (
        <span className={`plan-badge plan-badge--${plan.toLowerCase()}`}>
            {plan === "PRO" && <Crown className="size-3" />}
            {plan}
        </span>
    )
}

function SubStatusBadge({ status }: { status: SubscriptionStatus }) {
    const display = status === "NONE" ? "FREE" : status
    return <span className={`sub-status sub-status--${status.toLowerCase()}`}>{display}</span>
}

export default function AdminSubscriptionManagement() {
    const navigate = useNavigate()
    const [params, setParams] = useState<GetSubscriptionsParams>({ page: 1, limit: 25 })
    const [items, setItems] = useState<AdminSubscriptionItem[]>([])
    const [pagination, setPagination] = useState<{
        page: number; limit: number; total_items: number; total_pages: number
    } | null>(null)
    const [summary, setSummary] = useState<SubscriptionSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchText, setSearchText] = useState("")
    const [planFilter, setPlanFilter] = useState<SubscriptionPlan | "">("")
    const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "">("")

    const [actionLoading, setActionLoading] = useState<string[]>([])

    // Renew / Grant dialog
    const [showRenewDialog, setShowRenewDialog] = useState(false)
    const [renewTarget, setRenewTarget] = useState<AdminSubscriptionItem | null>(null)
    const [renewDays, setRenewDays] = useState(30)
    const [renewNotes, setRenewNotes] = useState("")
    const [renewSubmitting, setRenewSubmitting] = useState(false)

    // Cancel dialog
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [cancelTarget, setCancelTarget] = useState<AdminSubscriptionItem | null>(null)
    const [cancelNotes, setCancelNotes] = useState("")
    const [cancelSubmitting, setCancelSubmitting] = useState(false)

    const loadData = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await getSubscriptions({
                page: params.page,
                limit: params.limit,
                keyword: params.keyword,
                plan: params.plan,
                status: params.status,
            })

            setItems(result.items || [])
            setSummary(result.summary ?? null)

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

    const handleSearch = (value: string) => {
        setSearchText(value)
        setParams((p) => ({ ...p, keyword: value, page: 1 }))
    }

    const handlePlanFilter = (value: SubscriptionPlan | "") => {
        setPlanFilter(value)
        setParams((p) => ({ ...p, plan: value, page: 1 }))
    }

    const handleStatusFilter = (value: SubscriptionStatus | "") => {
        setStatusFilter(value)
        setParams((p) => ({ ...p, status: value, page: 1 }))
    }

    const handlePageChange = (page: number) => {
        setParams((p) => ({ ...p, page }))
    }

    // ── Renew / Grant handlers ──
    const openRenewDialog = (user: AdminSubscriptionItem) => {
        setRenewTarget(user)
        setRenewDays(30)
        setRenewNotes("")
        setShowRenewDialog(true)
    }

    const handleRenew = async () => {
        if (!renewTarget) return
        const isGrant = renewTarget.plan === "FREE" || renewTarget.subscription_status === "NONE" || renewTarget.subscription_status === "EXPIRED"

        setRenewSubmitting(true)
        setActionLoading((prev) => [...prev, `renew-${renewTarget.id}`])
        try {
            if (isGrant) {
                await grantProAccess(renewTarget.id, { duration_days: renewDays, notes: renewNotes || undefined })
            } else {
                await renewSubscription(renewTarget.id, { duration_days: renewDays, notes: renewNotes || undefined })
            }
            setShowRenewDialog(false)
            await loadData()
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setRenewSubmitting(false)
            setActionLoading((prev) => prev.filter((x) => x !== `renew-${renewTarget.id}`))
        }
    }

    // ── Cancel handler ──
    const openCancelDialog = (user: AdminSubscriptionItem) => {
        setCancelTarget(user)
        setCancelNotes("")
        setShowCancelDialog(true)
    }

    const handleCancel = async () => {
        if (!cancelTarget) return
        setCancelSubmitting(true)
        setActionLoading((prev) => [...prev, `cancel-${cancelTarget.id}`])
        try {
            await cancelSubscription(cancelTarget.id, { notes: cancelNotes || undefined })
            setShowCancelDialog(false)
            await loadData()
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setCancelSubmitting(false)
            setActionLoading((prev) => prev.filter((x) => x !== `cancel-${cancelTarget.id}`))
        }
    }

    // ── Derived ──
    const total = pagination?.total_items ?? items.length
    const page = pagination?.page ?? params.page ?? 1
    const totalPages = Math.max(1, pagination?.total_pages ?? Math.ceil((total || 1) / (params.limit ?? 25)))
    const from = (page - 1) * (pagination?.limit ?? params.limit ?? 25) + 1
    const to = Math.min(page * (pagination?.limit ?? params.limit ?? 25), total)

    const activeProCount = useMemo(() => summary?.active_pro ?? items.filter((i) => i.subscription_status === "ACTIVE").length, [items, summary])
    const expiredCount = useMemo(() => summary?.expired_pro ?? items.filter((i) => i.subscription_status === "EXPIRED").length, [items, summary])

    const hasFilters = Boolean(searchText.trim() || planFilter || statusFilter)

    const isActionBusy = (id: string, action: string) => actionLoading.includes(`${action}-${id}`)

    return (
        <div className="ams">
            <div className="ams__breadcrumb">Admin / Subscription Management</div>

            <section className="ams__header">
                <div>
                    <h1>Subscription Management</h1>
                    <p>View, filter, and manage all user subscription plans and PRO access.</p>
                </div>
                <div className="ams__header-status">
                    <span>
                        <strong>Active PRO</strong>
                        {summary ? summary.active_pro : activeProCount}
                    </span>
                </div>
            </section>

            {/* Summary cards */}
            {summary && (
                <section className="ams__summary-grid">
                    <div className="ams__summary-card">
                        <span className="ams__summary-label">Total Users</span>
                        <span className="ams__summary-value">{summary.total_users}</span>
                        <span className="ams__summary-sub">{summary.free_users} free · {summary.active_pro} pro</span>
                    </div>
                    <div className="ams__summary-card">
                        <span className="ams__summary-label">Active PRO</span>
                        <span className="ams__summary-value">{summary.active_pro}</span>
                        <span className="ams__summary-sub">{summary.expired_pro} expired</span>
                    </div>
                    <div className="ams__summary-card">
                        <span className="ams__summary-label">Free Users</span>
                        <span className="ams__summary-value">{summary.free_users}</span>
                        <span className="ams__summary-sub">{Math.round((summary.active_pro / Math.max(summary.total_users, 1)) * 100)}% conversion</span>
                    </div>
                </section>
            )}

            {/* Controls */}
            <section className="ams__controls">
                <SearchInput value={searchText} onChange={handleSearch} placeholder="Search by name or email" />

                <select
                    value={planFilter}
                    className="ams__select"
                    onChange={(e) => handlePlanFilter(e.target.value as SubscriptionPlan | "")}
                >
                    <option value="">All plans</option>
                    {PLAN_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    className="ams__select"
                    onChange={(e) => handleStatusFilter(e.target.value as SubscriptionStatus | "")}
                >
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s === "NONE" ? "FREE" : s}</option>
                    ))}
                </select>

                <div className="ams__actions">
                    <Button type="button" variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
                        <RefreshCw className="size-3.5" /> Refresh
                    </Button>
                </div>
            </section>

            {/* Table */}
            <section className="ams__table-card">
                {isLoading ? (
                    <TableLoading />
                ) : error ? (
                    <TableError message={error} onRetry={loadData} />
                ) : !items.length ? (
                    hasFilters ? <TableNoMatch onClear={() => { setSearchText(""); setPlanFilter(""); setStatusFilter(""); setParams({ page: 1, limit: params.limit }) }} />
                        : <TableEmpty message="No subscriptions found." />
                ) : (
                    <>
                        <div className="ams__table-wrap">
                            <table className="ams__table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Plan</th>
                                        <th>Status</th>
                                        <th>Expires At</th>
                                        <th>Registered</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((user) => {
                                        const canRenew = user.subscription_status === "ACTIVE"
                                        const canGrant = user.plan === "FREE" || user.subscription_status === "NONE" || user.subscription_status === "EXPIRED"
                                        const canCancel = user.plan === "PRO" && user.subscription_status === "ACTIVE"

                                        return (
                                            <tr key={user.id}>
                                                <td>{placeholder(user.full_name)}</td>
                                                <td>{placeholder(user.email)}</td>
                                                <td><PlanBadge plan={user.plan} /></td>
                                                <td><SubStatusBadge status={user.subscription_status} /></td>
                                                <td><ExpiryCell expiresAt={user.subscription_expires_at} /></td>
                                                <td className="ams__expiry-cell">{user.created_at ? formatDate(user.created_at) : "—"}</td>
                                                <td>
                                                    <div className="ams__row-actions">
                                                        {(canRenew || canGrant) && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="xs"
                                                                onClick={() => openRenewDialog(user)}
                                                                disabled={isActionBusy(user.id, "renew")}
                                                                title={canGrant ? "Grant PRO access" : "Renew subscription"}
                                                            >
                                                                {canGrant ? <Zap className="size-3" /> : <Clock className="size-3" />}
                                                                {canGrant ? "Grant" : "Renew"}
                                                            </Button>
                                                        )}
                                                        {canCancel && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="xs"
                                                                onClick={() => openCancelDialog(user)}
                                                                disabled={isActionBusy(user.id, "cancel")}
                                                                title="Cancel subscription"
                                                            >
                                                                <UserX className="size-3" />
                                                                Cancel
                                                            </Button>
                                                        )}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="xs"
                                                            onClick={() => navigate(`/admin/subscriptions/${user.id}`)}
                                                            title="View detail"
                                                        >
                                                            <Eye className="size-3" />
                                                            View
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

            {/* ── Renew / Grant Dialog ── */}
            <Dialog open={showRenewDialog} onOpenChange={(open) => !open && setShowRenewDialog(false)}>
                <DialogContent className="ams-modal">
                    <DialogHeader>
                        <DialogTitle>
                            {renewTarget?.plan === "FREE" || renewTarget?.subscription_status === "NONE" || renewTarget?.subscription_status === "EXPIRED"
                                ? "Grant PRO Access"
                                : "Renew Subscription"}
                        </DialogTitle>
                        <DialogDescription>
                            {renewTarget?.plan === "FREE" || renewTarget?.subscription_status === "NONE" || renewTarget?.subscription_status === "EXPIRED"
                                ? `Grant a complimentary PRO plan to ${renewTarget?.full_name ?? "this user"}.`
                                : `Extend the PRO subscription for ${renewTarget?.full_name ?? "this user"}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="sub-modal__body">
                        <div className="sub-modal__row">
                            <div className="sub-modal__field">
                                <label className="sub-modal__label">User</label>
                                <div className="sub-modal__value">{renewTarget?.full_name ?? "—"}</div>
                            </div>
                            <div className="sub-modal__field">
                                <label className="sub-modal__label">Current Plan</label>
                                <div className="sub-modal__value">{renewTarget?.plan ?? "—"}</div>
                            </div>
                        </div>
                        <div className="sub-modal__field">
                            <label className="sub-modal__label">Duration (days)</label>
                            <input
                                type="number"
                                className="sub-modal__input"
                                value={renewDays}
                                min={1}
                                max={365}
                                onChange={(e) => setRenewDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
                            />
                        </div>
                        <div className="sub-modal__field">
                            <label className="sub-modal__label">Notes (optional)</label>
                            <textarea
                                className="sub-modal__textarea"
                                value={renewNotes}
                                onChange={(e) => setRenewNotes(e.target.value)}
                                placeholder="Reason for this action..."
                                maxLength={500}
                            />
                        </div>
                    </div>
                    <DialogFooter className="sub-modal__actions">
                        <Button type="button" variant="outline" onClick={() => setShowRenewDialog(false)} disabled={renewSubmitting}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleRenew} disabled={renewSubmitting}>
                            {renewSubmitting ? "Processing..." : renewTarget?.plan === "FREE" ? "Grant PRO" : "Renew"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Cancel Dialog ── */}
            <Dialog open={showCancelDialog} onOpenChange={(open) => !open && setShowCancelDialog(false)}>
                <DialogContent className="ams-modal">
                    <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                            Downgrade {cancelTarget?.full_name ?? "this user"} from PRO to FREE immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="sub-modal__body">
                        <div className="sub-modal__row">
                            <div className="sub-modal__field">
                                <label className="sub-modal__label">User</label>
                                <div className="sub-modal__value">{cancelTarget?.full_name ?? "—"}</div>
                            </div>
                            <div className="sub-modal__field">
                                <label className="sub-modal__label">Expires At</label>
                                <div className="sub-modal__value">
                                    {cancelTarget?.subscription_expires_at ? formatDate(cancelTarget.subscription_expires_at) : "—"}
                                </div>
                            </div>
                        </div>
                        <div className="sub-modal__field">
                            <label className="sub-modal__label">Notes (optional)</label>
                            <textarea
                                className="sub-modal__textarea"
                                value={cancelNotes}
                                onChange={(e) => setCancelNotes(e.target.value)}
                                placeholder="Reason for cancellation..."
                                maxLength={500}
                            />
                        </div>
                    </div>
                    <DialogFooter className="sub-modal__actions">
                        <Button type="button" variant="outline" onClick={() => setShowCancelDialog(false)} disabled={cancelSubmitting}>
                            Keep Active
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleCancel} disabled={cancelSubmitting}>
                            {cancelSubmitting ? "Processing..." : "Cancel PRO"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}