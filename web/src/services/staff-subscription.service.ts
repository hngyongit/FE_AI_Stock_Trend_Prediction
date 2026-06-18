import { authenticatedRequest } from "@/services/auth.service"
import type {
    ApiResponse,
    SubscriptionListData,
    GetSubscriptionsParams,
    SubscriptionDetailData,
} from "@/types/subscription"

export async function getStaffSubscriptions(params?: GetSubscriptionsParams): Promise<SubscriptionListData> {
    const cleanParams: Record<string, string | number | undefined> = {
        page: params?.page ?? 1,
        limit: params?.limit ?? 25,
    }

    if (params?.keyword && params.keyword.trim() !== "") {
        cleanParams.keyword = params.keyword.trim()
    }
    if (params?.plan) cleanParams.plan = params.plan
    if (params?.status) cleanParams.status = params.status
    if (params?.sort_by) cleanParams.sort_by = params.sort_by
    if (params?.sort_order) cleanParams.sort_order = params.sort_order

    const response = await authenticatedRequest<ApiResponse<SubscriptionListData>>({
        url: "/api/staff/subscriptions",
        method: "GET",
        params: cleanParams,
    })

    const payload = response.data
    if (response.status < 200 || response.status >= 300 || payload?.success === false || !payload?.data) {
        throw new Error(payload?.message || "Unable to load subscriptions")
    }

    return payload.data
}

export async function getStaffSubscriptionDetail(userId: string): Promise<SubscriptionDetailData> {
    const response = await authenticatedRequest<ApiResponse<SubscriptionDetailData>>({
        url: `/api/staff/subscriptions/${encodeURIComponent(userId)}`,
        method: "GET",
    })

    const payload = response.data
    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        throw new Error(payload?.message || "Unable to load subscription detail")
    }

    return payload?.data as SubscriptionDetailData
}