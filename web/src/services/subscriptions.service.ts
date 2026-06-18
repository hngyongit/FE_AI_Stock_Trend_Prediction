import { authenticatedRequest, getApiBaseUrl } from "@/services/auth.service";

const API_BASE_URL = getApiBaseUrl() || "http://localhost:8080";

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type SubscriptionStatus = {
    plan?: string;
    status?: string;
    subscriptionStatus?: string;
    subscriptionExpiresAt?: string | null;
    subscription?: {
        plan?: string;
        type?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        expiredAt?: string;
    };
    [key: string]: any;
};

export type CreatePaymentResponse = {
    checkoutUrl: string;
};

const subscriptionService = {
    async getSubscriptionStatus(): Promise<ApiResponse<SubscriptionStatus>> {
        const response = await authenticatedRequest<ApiResponse<SubscriptionStatus>>({
            url: `${API_BASE_URL}/api/subscriptions/status`,
            method: "GET",
        });

        if (response.status < 200 || response.status >= 300 || response.data?.success === false) {
            throw new Error(response.data?.message || "Cannot load subscription status.");
        }

        return response.data;
    },

    async createPayment(): Promise<ApiResponse<CreatePaymentResponse>> {
        const response = await authenticatedRequest<ApiResponse<CreatePaymentResponse>>({
            url: `${API_BASE_URL}/api/subscriptions/create-payment`,
            method: "POST",
            data: {},
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status < 200 || response.status >= 300 || response.data?.success === false) {
            throw new Error(response.data?.message || "Cannot create payment.");
        }

        return response.data;
    },
};

export default subscriptionService;
