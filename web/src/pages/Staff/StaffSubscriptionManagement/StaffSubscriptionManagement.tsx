import { useEffect, useState } from "react"
import { Crown, Eye, RefreshCw } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
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
    getStaffSubscriptions,
} from "@/services/staff-subscription.service"
import type {
    AdminSubscriptionItem,
    GetSubscriptionsParams,
    SubscriptionPlan,
    SubscriptionStatus,
} from "@/types/subscription"

import "../../Admin/SubscriptionManagement/AdminSubscriptionManagement.css"

const PLAN_OPTIONS: SubscriptionPlan[] = ["FREE", "PRO"]
const STATUS_OPTIONS: SubscriptionStatus[] = ["NONE", "ACTIVE", "EXPIRED", "CANCELLED"]

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—"
    return new Date(dateStr).toISOString().slice(0, 19).replace("T", " ")
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
    return <span className={`sub-status sub-status--${status.toLowerCase()}`}>
        {status === "NONE" ? "FREE" : status}
    </span>
}

export default function StaffSubscriptionManagement() {
    const navigate = useNavigate()
    const [params, setParams] = useState<GetSubscriptionsParams>({ page: 1, limit: 25 })
    const [items, setItems] = useState<AdminSubscriptionItem[]>([])
    const [pagination, setPagination] = useState<{
        page: number; limit: number; total_items: number; total_pages: number
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchText, setSearchText] = useState("")
    const [planFilter, setPlanFilter] = useState<SubscriptionPlan | "">("")
    const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "">("")

    const loadData = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await getStaffSubscriptions({
                page: params.page,
                limit: params.limit,
                keyword: params.keyword,
                plan: params.plan,
                status: params.status,
            })

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

    const total = pagination?.total_items ?? items.length
    const page = pagination?.page ?? params.page ?? 1
    const totalPages = Math.max(1, pagination?.total_pages ?? Math.ceil((total || 1) / (params.limit ?? 25)))
    const from = (page - 1) * (pagination?.limit ?? params.limit ?? 25) + 1
    const to = Math.min(page * (pagination?.limit ?? params.limit ?? 25), total)

    const hasFilters = Boolean(searchText.trim() || planFilter || statusFilter)

    return (
        <div className="ams">
            <div className="ams__breadcrumb">Staff / Subscription Management</div>

            <section className="ams__header">
                <div>
                    <h1>Subscription Management</h1>
                    <p>View user subscription plans and PRO access status. Read-only.</p>
                </div>
            </section>

            <section className="ams__controls">
                <SearchInput value={searchText} onChange={handleSearch} placeholder="Search by name or email" />

                <select className="ams__select" value={planFilter} onChange={(e) => handlePlanFilter(e.target.value as SubscriptionPlan | "")}>
                    <option value="">All plans</option>
                    {PLAN_OPTIONS.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>

                <select className="ams__select" value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value as SubscriptionStatus | "")}>
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s === "NONE" ? "FREE" : s}</option>))}
                </select>

                <div className="ams__actions">
                    <Button type="button" variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
                        <RefreshCw className="size-3.5" /> Refresh
                    </Button>
                </div>
            </section>

            <section className="ams__table-card">
                {isLoading ? (
                    <TableLoading />
                ) : error ? (
                    <TableError message={error} onRetry={loadData} />
                ) : !items.length ? (
                    hasFilters
                        ? <TableNoMatch onClear={() => { setSearchText(""); setPlanFilter(""); setStatusFilter(""); setParams({ page: 1, limit: params.limit }) }} />
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
                                    {items.map((user) => (
                                        <tr key={user.id}>
                                            <td>{placeholder(user.full_name)}</td>
                                            <td>{placeholder(user.email)}</td>
                                            <td><PlanBadge plan={user.plan} /></td>
                                            <td><SubStatusBadge status={user.subscription_status} /></td>
                                            <td className="ams__expiry-cell">{user.subscription_expires_at ? formatDate(user.subscription_expires_at) : "—"}</td>
                                            <td className="ams__expiry-cell">{user.created_at ? formatDate(user.created_at) : "—"}</td>
                                            <td>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="xs"
                                                    onClick={() => navigate(`/staff/subscriptions/${user.id}`)}
                                                >
                                                    <Eye className="size-3" /> View
                                                </Button>
                                            </td>
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