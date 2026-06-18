export type SubscriptionPlan = "FREE" | "PRO"
export type SubscriptionStatus = "NONE" | "ACTIVE" | "EXPIRED" | "CANCELLED"
export type TransactionType = "PAYOS_PAYMENT" | "ADMIN_GRANT" | "ADMIN_RENEW" | "ADMIN_CANCEL" | "ADMIN_MODIFY"
export type TransactionStatus = "PAID" | "CANCELLED" | "REFUNDED" | "GRANTED" | "EXPIRED"

export interface Pagination {
    page?: number
    limit?: number
    total_items?: number
    total_pages?: number
}

export interface ApiResponse<T = unknown> {
    success?: boolean
    message?: string
    data?: T
}

export interface SubscriptionSummary {
    total_users: number
    active_pro: number
    expired_pro: number
    free_users: number
}

export interface AdminSubscriptionItem {
    id: string
    full_name: string
    email: string
    role: "ADMIN" | "STAFF" | "USER"
    status: string
    plan: SubscriptionPlan
    subscription_status: SubscriptionStatus
    subscription_expires_at: string | null
    created_at: string
}

export interface SubscriptionListData {
    items: AdminSubscriptionItem[]
    pagination?: Pagination
    summary?: SubscriptionSummary
}

export interface GetSubscriptionsParams {
    page?: number
    limit?: number
    keyword?: string
    plan?: SubscriptionPlan | ""
    status?: SubscriptionStatus | ""
    role?: "ADMIN" | "STAFF" | "USER" | ""
    sort_by?: string
    sort_order?: "asc" | "desc"
}

export interface SubscriptionTransaction {
    id: string
    user_id?: string
    user?: {
        id: string
        full_name: string
        email: string
    }
    transaction_type: TransactionType
    payos_order_code: number | null
    amount: number
    status: TransactionStatus
    previous_plan: SubscriptionPlan
    new_plan: SubscriptionPlan
    previous_expires_at: string | null
    new_expires_at: string | null
    performed_by?: {
        id: string
        full_name: string
    } | null
    notes: string
    created_at: string
}

export interface SubscriptionDetailData {
    user: {
        id: string
        full_name: string
        email: string
        role: string
        status: string
    }
    subscription: {
        plan: SubscriptionPlan
        status: SubscriptionStatus
        expires_at: string | null
        payos_order_code: number | null
        payos_payment_link_id: string | null
    }
    transactions: SubscriptionTransaction[]
}

export interface SubscriptionStats {
    overview: {
        total_users: number
        active_pro: number
        expired_pro: number
        cancelled_pro: number
        free_users: number
        pro_percentage: number
    }
    expiring_soon: {
        within_7_days: number
        within_30_days: number
    }
    revenue: {
        current_month: number
        last_month: number
        total_all_time: number
        currency: string
    }
    recent_transactions: Array<{
        id: string
        user: { id: string; full_name: string; email: string }
        amount: number
        type: TransactionType
        status: TransactionStatus
        created_at: string
    }>
}

export interface GetTransactionsParams {
    page?: number
    limit?: number
    user_id?: string
    type?: TransactionType | ""
    status?: TransactionStatus | ""
    from?: string
    to?: string
}

export interface TransactionListData {
    items: SubscriptionTransaction[]
    pagination?: Pagination
}

export interface RenewGrantRequest {
    duration_days: number
    notes?: string
}

export interface CancelRequest {
    notes?: string
}

export interface ModifyExpiryRequest {
    expires_at: string
    notes?: string
}

export interface RenewGrantResponse {
    user_id: string
    plan: SubscriptionPlan
    subscription_status: SubscriptionStatus
    subscription_expires_at: string
    duration_days: number
}

export interface CancelResponse {
    user_id: string
    plan: SubscriptionPlan
    subscription_status: SubscriptionStatus
    subscription_expires_at: null
}