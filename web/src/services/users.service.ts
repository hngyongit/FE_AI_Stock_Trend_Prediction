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
