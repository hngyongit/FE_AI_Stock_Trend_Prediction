import { authenticatedRequest } from "@/services/auth.service"

export type SubscriptionStatus = {
    plan?: string
    status?: string
    subscription?: {
        plan?: string
        type?: string
        status?: string
        startDate?: string
        endDate?: string
        expiredAt?: string
    }
}

export type CreatePaymentResponse = {
    checkoutUrl: string
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await authenticatedRequest<{ success: boolean; message: string; data: SubscriptionStatus }>({
        url: "/api/subscriptions/status",
        method: "GET",
    })
    
    if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to fetch subscription status")
    }
    return response.data.data
}

export async function createPayment(): Promise<CreatePaymentResponse> {
    const response = await authenticatedRequest<{ success: boolean; message: string; data: CreatePaymentResponse }>({
        url: "/api/subscriptions/create-payment",
        method: "POST",
        data: {}
    })
    
    if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || "Failed to create payment")
    }
    return response.data.data
}