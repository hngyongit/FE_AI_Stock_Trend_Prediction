import { authenticatedRequest } from "@/services/auth.service"

export type AdminStockItem = {
    _id: string
    symbol: string
    company_name: string
    exchange_code: string
    status: string
    listed_date?: string
}

type AdminStockResponse = {
    success: boolean
    message: string
    data: AdminStockItem | AdminStockItem[]
}

export type CreateStockPayload = {
    symbol: string
    company_name: string
    exchange_code: string
    status: string
    listed_date: string
}

export type UpdateStockPayload = {
    company_name: string
    exchange_code: string
    status: string
}

export async function createStock(payload: CreateStockPayload): Promise<AdminStockItem> {
    const response = await authenticatedRequest<AdminStockResponse>({
        url: "/api/admin/stocks",
        method: "POST",
        data: payload,
    })

    const body = response.data

    if (!body.success || !body.data) {
        throw new Error(body.message || "Failed to create stock")
    }

    return body.data as AdminStockItem
}

export async function updateStock(id: string, payload: UpdateStockPayload): Promise<AdminStockItem> {
    const response = await authenticatedRequest<AdminStockResponse>({
        url: `/api/admin/stocks/${id}`,
        method: "PUT",
        data: payload,
    })

    const body = response.data

    if (!body.success || !body.data) {
        throw new Error(body.message || "Failed to update stock")
    }

    return body.data as AdminStockItem
}