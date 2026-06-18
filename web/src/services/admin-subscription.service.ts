import { authenticatedRequest } from "@/services/auth.service"
import type {
    ApiResponse,
    SubscriptionListData,
    GetSubscriptionsParams,
    SubscriptionDetailData,
    SubscriptionStats,
    TransactionListData,
    GetTransactionsParams,
    RenewGrantRequest,
    CancelRequest,
    ModifyExpiryRequest,
    RenewGrantResponse,
    CancelResponse,
} from "@/types/subscription"

export async function getSubscriptions(params?: GetSubscriptionsParams): Promise<SubscriptionListData> {
    const cleanParams: Record<string, string | number | undefined> = {
        page: params?.page ?? 1,
        limit: params?.limit ?? 25,
    }

    if (params?.keyword && params.keyword.trim() !== "") {
        cleanParams.keyword = params.keyword.trim()
    }
    if (params?.plan) cleanParams.plan = params.plan
    if (params?.status) cleanParams.status = params.status
    if (params?.role) cleanParams.role = params.role
    if (params?.sort_by) cleanParams.sort_by = params.sort_by
    if (params?.sort_order) cleanParams.sort_order = params.sort_order

    const response = await authenticatedRequest<ApiResponse<SubscriptionListData>>({
        url: "/api/admin/subscriptions",
        method: "GET",
        params: cleanParams,
    })

    const payload = response.data
    if (response.status < 200 || response.status >= 300 || payload?.success === false || !payload?.data) {
        throw new Error(payload?.message || "Unable to load subscriptions")
    }

    return payload.data
}

export async function getSubscriptionDetail(userId: string): Promise<SubscriptionDetailData> {
    const response = await authenticatedRequest<ApiResponse<SubscriptionDetailData>>({
        url: `/api/admin/subscriptions/${encodeURIComponent(userId)}`,
        method: "GET",
    })

    const payload = response.data
    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        throw new Error(payload?.message || "Unable to load subscription detail")
    }

    return payload?.data as SubscriptionDetailData
}

export async function renewSubscription(
    userId: string,
    data: RenewGrantRequest
): Promise<RenewGrantResponse> {
    const response = await authenticatedRequest<ApiResponse<RenewGrantResponse>>({
        url: `/api/admin/subscriptions/${encodeURIComponent(userId)}/renew`,
        method: "POST",
        data,
    })

    const payload = response.data
    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        throw new Error(payload?.message || "Unable to renew subscription")
    }

    return payload?.data as RenewGrantResponse
}

export async function grantProAccess(
    userId: string,
    data: RenewGrantRequest
): Promise<RenewGrantResponse> {
    const response = await authenticatedRequest<ApiResponse<RenewGrantResponse>>({
        url: `/api/admin/subscriptions/${encodeURIComponent(userId)}/grant`,
        method: "POST",
        data,
    })

    const payload = response.data
    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        throw new Error(payload?.message || "Unable to grant PRO access")
    }

    return payload?.data as RenewGrantResponse
}

export async function cancelSubscription(
    userId: string,
    data?: CancelRequest
): Promise<CancelResponse> {
    const response = await authenticatedRequest<ApiResponse<CancelResponse>>({
        url: `/api/admin/subscriptions/${encodeURIComponent(userId)}/cancel`,
        method: "POST",
        data: data ?? {},
    })

    const payload = response.data
    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        throw new Error(payload?.message || "Unable to cancel subscription")
    }

    return payload?.data as CancelResponse
}

export async function modifySubscriptionExpiry(
    userId: string,
    data: ModifyExpiryRequest
): Promise<RenewGrantResponse> {
    const response = await authenticatedRequest<ApiResponse<RenewGrantResponse>>({
        url: `/api/admin/subscriptions/${encodeURIComponent(userId)}/expiry`,
        method: "PATCH",
        data,
    })

    const payload = response.data
    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        throw new Error(payload?.message || "Unable to modify subscription expiry")
    }

    return payload?.data as RenewGrantResponse
}

export async function getSubscriptionStats(): Promise<SubscriptionStats> {
    const response = await authenticatedRequest<ApiResponse<SubscriptionStats>>({
        url: "/api/admin/subscriptions/stats",
        method: "GET",
    })

    const payload = response.data
    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        throw new Error(payload?.message || "Unable to load subscription stats")
    }

    return payload?.data as SubscriptionStats
}

export async function getTransactions(params?: GetTransactionsParams): Promise<TransactionListData> {
    const cleanParams: Record<string, string | number | undefined> = {
        page: params?.page ?? 1,
        limit: params?.limit ?? 25,
    }

    if (params?.user_id) cleanParams.user_id = params.user_id
    if (params?.type) cleanParams.type = params.type
    if (params?.status) cleanParams.status = params.status
    if (params?.from) cleanParams.from = params.from
    if (params?.to) cleanParams.to = params.to

    const response = await authenticatedRequest<ApiResponse<TransactionListData>>({
        url: "/api/admin/subscriptions/transactions",
        method: "GET",
        params: cleanParams,
    })

    const payload = response.data
    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        throw new Error(payload?.message || "Unable to load transactions")
    }

    return payload?.data as TransactionListData
}