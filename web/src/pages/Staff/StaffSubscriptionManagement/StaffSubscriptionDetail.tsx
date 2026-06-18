import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableLoading, TableError, placeholder } from "@/shared/components"
import { getStaffSubscriptionDetail } from "@/services/staff-subscription.service"
import type { SubscriptionDetailData } from "@/types/subscription"

import "../../Admin/SubscriptionDetail/AdminSubscriptionDetail.css"

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—"
    return new Date(dateStr).toISOString().slice(0, 19).replace("T", " ")
}

export default function StaffSubscriptionDetail() {
    const { userId } = useParams<{ userId: string }>()
    const navigate = useNavigate()
    const [data, setData] = useState<SubscriptionDetailData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadDetail = async () => {
        if (!userId) return
        setIsLoading(true)
        setError(null)
        try {
            const result = await getStaffSubscriptionDetail(userId)
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

    if (isLoading) return <div className="asd"><TableLoading /></div>
    if (error) return <div className="asd"><TableError message={error} onRetry={loadDetail} /></div>
    if (!data) return <div className="asd"><TableError message="No subscription data found." onRetry={loadDetail} /></div>

    const { user, subscription } = data
    const isPro = subscription.plan === "PRO"

    return (
        <div className="asd">
            <div className="asd__breadcrumb">
                <Link to="/staff/subscriptions">Staff / Subscription Management</Link> / {placeholder(user.full_name)}
            </div>

            <div className="asd__card">
                <div className="asd__card-header">
                    <h2>User Information</h2>
                    <Button type="button" variant="outline" size="xs" onClick={() => navigate("/staff/subscriptions")}>
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

            <div className="asd__card">
                <div className="asd__card-header">
                    <h2>Subscription Details</h2>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Read-only view</div>
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
        </div>
    )
}