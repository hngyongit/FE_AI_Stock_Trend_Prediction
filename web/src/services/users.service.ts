const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? ""
import { authenticatedFetch } from "@/services/auth.service"

export type UserProfile = {
    id?: string
    full_name?: string
    email?: string
    role?: string
    status?: string
    created_at?: string
}

type MeResponse = {
    success?: boolean
    message?: string
    data?: UserProfile
}

export async function getMyProfile(): Promise<UserProfile> {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
    })

    const payload = (await response.json().catch(() => null)) as MeResponse | null

    if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || "Unable to load profile")
    }

    return payload?.data ?? {}
}
