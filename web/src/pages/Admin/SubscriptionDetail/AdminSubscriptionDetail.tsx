import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Clock, Crown, UserX, Zap, RefreshCw } from "lucide-react"

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
    TableLoading,
    TableError,
    placeholder,
} from "@/shared/components"
import {
    getSubscriptionDetail,
    renewSubscription,
    grantProAccess,
    cancelSubscription,
    modifySubscriptionExpiry,
} from "@/services/admin-subscription.service"
import type {
    SubscriptionDetailData,
    TransactionType,
} from "@/types/subscription"

import "./AdminSubscriptionDetail.css"

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—"
    return new Date(dateStr).toISOString().slice(0, 19).replace("T", " ")
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
}

function TxTypeBadge({ type }: { type: TransactionType }) {
    const classNameMap: Record<string, string> = {
        PAYOS_PAYMENT: "tx-type--payment",
        ADMIN_GRANT: "tx-type--grant",
        ADMIN_RENEW: "tx-type--renew",
        ADMIN_CANCEL: "tx-type--cancel",
        ADMIN_MODIFY: "tx-type--modify",
    }
    const labelMap: Record<string, string> = {
        PAYOS_PAYMENT: "Payment",
        ADMIN_GRANT: "Grant",
        ADMIN_RENEW: "Renew",
        ADMIN_CANCEL: "Cancel",
        ADMIN_MODIFY: "Modify",
    }
    return <span className={`tx-type ${classNameMap[type] ?? ""}`}>{labelMap[type] ?? type}</span>
}

export default function AdminSubscriptionDetail() {
    const { userId } = useParams<{ userId: string }>()
    const navigate = useNavigate()
    const [data, setData] = useState<SubscriptionDetailData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Renew / Grant
    const [showRenewDialog, setShowRenewDialog] = useState(false)
    const [renewDays, setRenewDays] = useState(30)
    const [renewNotes, setRenewNotes] = useState("")
    const [renewSubmitting, setRenewSubmitting] = useState(false)

    // Cancel
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [cancelNotes, setCancelNotes] = useState("")
    const [cancelSubmitting, setCancelSubmitting] = useState(false)

    // Modify expiry
    const [showModifyDialog, setShowModifyDialog] = useState(false)
    const [modifyExpiresAt, setModifyExpiresAt] = useState("")
    const [modifyNotes, setModifyNotes] = useState("")
    const [modifySubmitting, setModifySubmitting] = useState(false)

    const loadDetail = async () => {
        if (!userId) return
        setIsLoading(true)
        setError(null)
        try {
            const result = await getSubscriptionDetail(userId)
            setData(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadDetail()
    }, [userId])

    // Show dialogs with pre-filled data
    const openRenew = () => {
        setRenewDays(30)
        setRenewNotes("")
        setShowRenewDialog(true)
    }

    const openCancel = () => {
        setCancelNotes("")
        setShowCancelDialog(true)
    }

    const openModify = () => {
        if (data?.subscription.expires_at) {
            setModifyExpiresAt(data.subscription.expires_at.slice(0, 16))
        } else {
            const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            setModifyExpiresAt(future.toISOString().slice(0, 16))
        }
        setModifyNotes("")
        setShowModifyDialog(true)
    }

    const handleRenew = async () => {
        if (!userId) return
        const isGrant = data?.subscription.plan === "FREE" || data?.subscription.status === "NONE" || data?.subscription.status === "EXPIRED"
        setRenewSubmitting(true)
        try {
            if (isGrant) {
                await grantProAccess(userId, { duration_days: renewDays, notes: renewNotes || undefined })
            } else {
                await renewSubscription(userId, { duration_days: renewDays, notes: renewNotes || undefined })
            }
            setShowRenewDialog(false)
            await loadDetail()
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setRenewSubmitting(false)
        }
    }

    const handleCancel = async () => {
        if (!userId) return
        setCancelSubmitting(true)
        try {
            await cancelSubscription(userId, { notes: cancelNotes || undefined })
            setShowCancelDialog(false)
            await loadDetail()
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setCancelSubmitting(false)
        }
    }

    const handleModifyExpiry = async () => {
        if (!userId) return
        setModifySubmitting(true)
        try {
            await modifySubscriptionExpiry(userId, {
                expires_at: new Date(modifyExpiresAt).toISOString(),
                notes: modifyNotes || undefined,
            })
            setShowModifyDialog(false)
            await loadDetail()
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setModifySubmitting(false)
        }
    }

    if (isLoading) return <div className="asd"><TableLoading /></div>
    if (error) return <div className="asd"><TableError message={error} onRetry={loadDetail} /></div>
    if (!data) return <div className="asd"><TableError message="No subscription data found." onRetry={loadDetail} /></div>

    const { user, subscription, transactions } = data
    const isPro = subscription.plan === "PRO"
    const isActive = subscription.status === "ACTIVE"

    return (
        <div className="asd">
            <div className="asd__breadcrumb">
                <Link to="/admin/subscriptions">Admin / Subscription Management</Link> / {placeholder(user.full_name)}
            </div>

            {/* User info */}
            <div className="asd__card">
                <div className="asd__card-header">
                    <h2>User Information</h2>
                    <Button type="button" variant="outline" size="xs" onClick={() => navigate("/admin/subscriptions")}>
                        <ArrowLeft className="size-3.5" /> Back
                    </Button>
                </div>
                <div className="asd__info-grid">
                    <div className="asd__info-item">
                        <span className="asd__info-label">Full Name</span>
                        <span className="asd__info-value">{placeholder(user.full_name)}</span>
                    </div>
                    <div className="asd__info-item">
                        <span className="asd__info-label">Email</span>
                        <span className="asd__info-value">{placeholder(user.email)}</span>
                    </div>
                    <div className="asd__info-item">
                        <span className="asd__info-label">Role</span>
                        <span className="asd__info-value">{user.role}</span>
                    </div>
                </div>
            </div>

            {/* Subscription info */}
            <div className="asd__card">
                <div className="asd__card-header">
                    <h2>Subscription Details</h2>
                    <div className="asd__actions">
                        {isActive && isPro && (
                            <>
                                <Button type="button" variant="outline" size="xs" onClick={openRenew}>
                                    <Clock className="size-3.5" /> Renew
                                </Button>
                                <Button type="button" variant="outline" size="xs" onClick={openModify}>
                                    <RefreshCw className="size-3.5" /> Modify Expiry
                                </Button>
                                <Button type="button" variant="outline" size="xs" onClick={openCancel}>
                                    <UserX className="size-3.5" /> Cancel
                                </Button>
                            </>
                        )}
                        {!isPro && (
                            <Button type="button" variant="outline" size="xs" onClick={openRenew}>
                                <Zap className="size-3.5" /> Grant PRO
                            </Button>
                        )}
                    </div>
                </div>
                <div className="asd__sub-grid">
                    <div className="asd__sub-item">
                        <span className="asd__sub-label">Plan</span>
                        <span className="asd__sub-value">
                            {isPro ? <><Crown className="size-3.5 inline mr-1 text-yellow-400" />PRO</> : "FREE"}
                        </span>
                    </div>
                    <div className="asd__sub-item">
                        <span className="asd__sub-label">Status</span>
                        <span className="asd__sub-value">{subscription.status}</span>
                    </div>
                    <div className="asd__sub-item">
                        <span className="asd__sub-label">Expires At</span>
                        <span className="asd__sub-value">{formatDate(subscription.expires_at)}</span>
                    </div>
                    <div className="asd__sub-item">
                        <span className="asd__sub-label">Order Code</span>
                        <span className="asd__sub-value">{subscription.payos_order_code ?? "—"}</span>
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div className="asd__card">
                <div className="asd__card-header">
                    <h2>Transaction History ({transactions.length})</h2>
                </div>
                {transactions.length === 0 ? (
                    <div style={{ padding: "24px 0", textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
                        No transactions recorded for this user.
                    </div>
                ) : (
                    <table className="asd__transaction-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Plan Change</th>
                                <th>Notes</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td><TxTypeBadge type={tx.transaction_type} /></td>
                                    <td>{tx.amount > 0 ? formatCurrency(tx.amount) : "—"}</td>
                                    <td>{tx.status}</td>
                                    <td style={{ fontSize: "0.8rem" }}>
                                        {tx.previous_plan} → {tx.new_plan}
                                    </td>
                                    <td style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {tx.notes || "—"}
                                    </td>
                                    <td style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>{formatDate(tx.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Renew Dialog */}
            <Dialog open={showRenewDialog} onOpenChange={(o) => !o && setShowRenewDialog(false)}>
                <DialogContent className="ams-modal">
                    <DialogHeader>
                        <DialogTitle>{!isPro ? "Grant PRO Access" : "Renew Subscription"}</DialogTitle>
                        <DialogDescription>
                            {!isPro
                                ? `Grant PRO plan to ${user.full_name}.`
                                : `Extend PRO subscription for ${user.full_name}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="sub-modal__body">
                        <div className="sub-modal__field">
                            <label className="sub-modal__label">Duration (days)</label>
                            <input type="number" className="sub-modal__input" value={renewDays} min={1} max={365}
                                onChange={(e) => setRenewDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))} />
                        </div>
                        <div className="sub-modal__field">
                            <label className="sub-modal__label">Notes (optional)</label>
                            <textarea className="sub-modal__textarea" value={renewNotes} onChange={(e) => setRenewNotes(e.target.value)}
                                placeholder="Reason for this action..." maxLength={500} />
                        </div>
                    </div>
                    <DialogFooter className="sub-modal__actions">
                        <Button variant="outline" onClick={() => setShowRenewDialog(false)} disabled={renewSubmitting}>Cancel</Button>
                        <Button onClick={handleRenew} disabled={renewSubmitting}>
                            {renewSubmitting ? "Processing..." : !isPro ? "Grant PRO" : "Renew"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={(o) => !o && setShowCancelDialog(false)}>
                <DialogContent className="ams-modal">
                    <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>Downgrade {user.full_name} from PRO to FREE immediately.</DialogDescription>
                    </DialogHeader>
                    <div className="sub-modal__body">
                        <div className="sub-modal__field">
                            <label className="sub-modal__label">Notes (optional)</label>
                            <textarea className="sub-modal__textarea" value={cancelNotes} onChange={(e) => setCancelNotes(e.target.value)}
                                placeholder="Reason for cancellation..." maxLength={500} />
                        </div>
                    </div>
                    <DialogFooter className="sub-modal__actions">
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={cancelSubmitting}>Keep Active</Button>
                        <Button variant="destructive" onClick={handleCancel} disabled={cancelSubmitting}>
                            {cancelSubmitting ? "Processing..." : "Cancel PRO"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modify Expiry Dialog */}
            <Dialog open={showModifyDialog} onOpenChange={(o) => !o && setShowModifyDialog(false)}>
                <DialogContent className="ams-modal">
                    <DialogHeader>
                        <DialogTitle>Modify Expiry Date</DialogTitle>
                        <DialogDescription>Manually adjust the PRO expiration date for {user.full_name}.</DialogDescription>
                    </DialogHeader>
                    <div className="sub-modal__body">
                        <div className="sub-modal__field">
                            <label className="sub-modal__label">New Expiry Date</label>
                            <input type="datetime-local" className="sub-modal__input" value={modifyExpiresAt}
                                onChange={(e) => setModifyExpiresAt(e.target.value)} />
                        </div>
                        <div className="sub-modal__field">
                            <label className="sub-modal__label">Notes (optional)</label>
                            <textarea className="sub-modal__textarea" value={modifyNotes} onChange={(e) => setModifyNotes(e.target.value)}
                                placeholder="Reason for modification..." maxLength={500} />
                        </div>
                    </div>
                    <DialogFooter className="sub-modal__actions">
                        <Button variant="outline" onClick={() => setShowModifyDialog(false)} disabled={modifySubmitting}>Cancel</Button>
                        <Button onClick={handleModifyExpiry} disabled={modifySubmitting}>
                            {modifySubmitting ? "Processing..." : "Update Expiry"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
