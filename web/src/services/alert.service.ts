import { authenticatedRequest } from "@/services/auth.service"

export type AlertType = "PRICE_ABOVE" | "PRICE_BELOW" | "VOLUME_ABOVE"
export type AlertStatus = "ACTIVE" | "DISABLED" | "TRIGGERED"

export type AlertItem = {
    id: string
    symbol: string
    company_name: string
    alert_type: AlertType
    threshold: number
    status: AlertStatus
    triggered_at: string | null
    triggered_value: number | null
    latest_price: {
        close_price: number
        volume: number
    }
}

export type CreateAlertPayload = {
    symbol: string
    alert_type: AlertType
    threshold: number
}

export type UpdateAlertPayload = {
    threshold?: number
    status?: AlertStatus
}

// 1. Lấy danh sách
export async function getAlerts(): Promise<AlertItem[]> {
    const response = await authenticatedRequest<{ success: boolean; data: AlertItem[] }>({
        url: "/api/alerts",
        method: "GET",
    })
    return response.data.data || []
}

// 2. Tạo mới
export async function createAlert(payload: CreateAlertPayload): Promise<AlertItem> {
    const response = await authenticatedRequest<{ success: boolean; data: AlertItem }>({
        url: "/api/alerts",
        method: "POST",
        data: payload,
    })
    return response.data.data
}

// 3. Lấy chi tiết (API thứ 3 bị thiếu)
export async function getAlertById(id: string): Promise<AlertItem> {
    const response = await authenticatedRequest<{ success: boolean; data: AlertItem }>({
        url: `/api/alerts/${id}`,
        method: "GET",
    })
    return response.data.data
}

// 4. Cập nhật (Sửa lại đường dẫn chuẩn và thêm Payload)
export async function updateAlert(id: string, payload: UpdateAlertPayload): Promise<AlertItem> {
    const response = await authenticatedRequest<{ success: boolean; data: AlertItem }>({
        url: `/api/alerts/${id}`,
        method: "PUT",
        data: payload,
    })
    return response.data.data
}

// 5. Xóa
export async function deleteAlert(id: string): Promise<void> {
    await authenticatedRequest({
        url: `/api/alerts/${id}`,
        method: "DELETE",
    })
}