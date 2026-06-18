import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type SubscriptionStatus = {
    plan?: string;
    status?: string;
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

const getAccessToken = () => {
    return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token")
    );
};

const getAuthHeaders = () => {
    const token = getAccessToken();

    return {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
    };
};

const subscriptionService = {
    async getSubscriptionStatus(): Promise<ApiResponse<SubscriptionStatus>> {
        const response = await axios.get<ApiResponse<SubscriptionStatus>>(
            `${API_BASE_URL}/api/subscriptions/status`,
            {
                headers: getAuthHeaders(),
            }
        );

        return response.data;
    },

    async createPayment(): Promise<ApiResponse<CreatePaymentResponse>> {
        const response = await axios.post<ApiResponse<CreatePaymentResponse>>(
            `${API_BASE_URL}/api/subscriptions/create-payment`,
            {},
            {
                headers: getAuthHeaders(),
            }
        );

        return response.data;
    },
};

export default subscriptionService;