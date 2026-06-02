import { authenticatedRequest } from "@/services/auth.service"

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
    const response = await authenticatedRequest<MeResponse>({
        url: "/api/auth/me",
        method: "GET",
    })

    const payload = response.data

    if (response.status < 200 || response.status >= 300 || payload?.success === false) {
        throw new Error(payload?.message || "Unable to load profile")
    }

    return payload?.data ?? {}
}
