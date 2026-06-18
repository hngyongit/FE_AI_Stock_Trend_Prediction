import { authenticatedRequest } from "@/services/auth.service"

export type UserProfile = {
    id?: string
    full_name?: string
    email?: string
    role?: string
    status?: string
    created_at?: string

    plan?: string
    subscription?: {
        plan?: string
        type?: string
        status?: string
        startDate?: string
        endDate?: string
        expiredAt?: string
    }
}

type MeResponse = {
    success?: boolean
    message?: string
    data?: UserProfile
}

type ApiResponse<T = unknown> = {
    success?: boolean
    message?: string
    data?: T
}

export async function getMyProfile(): Promise<UserProfile> {
    const response = await authenticatedRequest<MeResponse>({
        url: "/api/users/me",
        method: "GET",
    })

    const payload = response.data

    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        throw new Error(payload?.message || "Unable to load profile")
    }

    return payload?.data ?? {}
}

export async function updateMyProfile(data: { full_name: string }): Promise<UserProfile> {
    const response = await authenticatedRequest<ApiResponse<UserProfile>>({
        url: "/api/users/me",
        method: "PUT",
        data,
    })

    const payload = response.data

    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        const serverErrors = (payload as { errors?: Array<{ field: string; message: string }> })?.errors
        const detailMessage = serverErrors?.map((e) => e.message).join("; ")
        throw new Error(detailMessage || payload?.message || "Unable to update profile")
    }

    return payload?.data ?? {}
}

export async function changeMyPassword(data: {
    current_password: string
    new_password: string
}): Promise<void> {
    const response = await authenticatedRequest<ApiResponse>({
        url: "/api/users/me/password",
        method: "PUT",
        data,
    })

    const payload = response.data

    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        throw new Error(payload?.message || "Unable to change password")
    }
}

// ── My Transactions ───────────────────────────────────

export type MyTransaction = {
    id: string
    type: "PAYOS_PAYMENT" | "ADMIN_GRANT" | "ADMIN_RENEW" | "ADMIN_CANCEL" | "ADMIN_MODIFY"
    amount: number
    status: "PAID" | "CANCELLED" | "REFUNDED" | "GRANTED" | "EXPIRED"
    notes: string
    created_at: string
}

export type MyTransactionsResponse = {
    items: MyTransaction[]
    pagination: {
        page: number
        limit: number
        total_items: number
        total_pages: number
    }
}

export async function getMyTransactions(page?: number, limit?: number): Promise<MyTransactionsResponse> {
    const response = await authenticatedRequest<ApiResponse<MyTransactionsResponse>>({
        url: "/api/subscriptions/transactions",
        method: "GET",
        params: { page: page ?? 1, limit: limit ?? 20 },
    })

    const payload = response.data

    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        throw new Error(payload?.message || "Unable to load transactions")
    }

    return payload?.data ?? { items: [], pagination: { page: 1, limit: 20, total_items: 0, total_pages: 1 } }
}
