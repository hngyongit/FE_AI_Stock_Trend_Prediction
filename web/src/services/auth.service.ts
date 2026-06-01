const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? ""

const AUTH_STORAGE_KEY = "auth"

export type AuthUser = {
    id: string
    full_name: string
    email: string
    role: string
    status: string
    [key: string]: unknown
}

export type LoginResponse = {
    success: boolean
    message: string
    data: {
        access_token: string
        refresh_token: string
        user: AuthUser
    }
}

type LoginCredentials = {
    email: string
    password: string
}

type StoredAuthSession = {
    accessToken: string
    refreshToken: string
    user: AuthUser
}

type RefreshTokenResponse = {
    success?: boolean
    message?: string
    data?: {
        access_token?: string
    }
}

let refreshInFlight: Promise<string> | null = null

function getAuthStorage(rememberMe: boolean) {
    return rememberMe ? localStorage : sessionStorage
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    })

    const payload = (await response.json().catch(() => null)) as LoginResponse | null

    if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || "Login failed")
    }

    if (!payload?.data) {
        throw new Error("Login failed")
    }

    return payload
}

export async function logout(accessToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    const payload = (await response.json().catch(() => null)) as { success?: boolean; message?: string } | null

    if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || "Logout failed")
    }
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
    })

    const payload = (await response.json().catch(() => null)) as RefreshTokenResponse | null

    const nextAccessToken = payload?.data?.access_token
    if (!response.ok || payload?.success === false || !nextAccessToken) {
        throw new Error(payload?.message || "Unable to refresh access token")
    }

    return nextAccessToken
}

export function saveAuthSession(authData: StoredAuthSession, rememberMe: boolean) {
    const storage = getAuthStorage(rememberMe)

    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData))
    storage.setItem("access_token", authData.accessToken)
    storage.setItem("refresh_token", authData.refreshToken)
    storage.setItem("user", JSON.stringify(authData.user))

    const alternateStorage = rememberMe ? sessionStorage : localStorage
    alternateStorage.removeItem(AUTH_STORAGE_KEY)
    alternateStorage.removeItem("access_token")
    alternateStorage.removeItem("refresh_token")
    alternateStorage.removeItem("user")
}

export function readAuthSession(): StoredAuthSession | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as StoredAuthSession
    } catch {
        return null
    }
}

export function clearAuthSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem("access_token")
    sessionStorage.removeItem("refresh_token")
    sessionStorage.removeItem("user")
    localStorage.removeItem("rememberMe")
}

function isRememberMeEnabled() {
    return localStorage.getItem("rememberMe") === "true"
}

function saveUpdatedAccessToken(accessToken: string) {
    const session = readAuthSession()
    if (!session) return

    saveAuthSession(
        {
            ...session,
            accessToken,
        },
        isRememberMeEnabled()
    )
}

async function refreshWithLock(refreshToken: string) {
    if (!refreshInFlight) {
        refreshInFlight = refreshAccessToken(refreshToken).finally(() => {
            refreshInFlight = null
        })
    }
    return refreshInFlight
}

export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const session = readAuthSession()
    const firstHeaders = new Headers(init?.headers ?? {})

    if (session?.accessToken) {
        firstHeaders.set("Authorization", `Bearer ${session.accessToken}`)
    }

    const firstResponse = await fetch(input, { ...init, headers: firstHeaders })
    if (firstResponse.status !== 401) return firstResponse

    if (!session?.refreshToken) return firstResponse

    try {
        const nextAccessToken = await refreshWithLock(session.refreshToken)
        saveUpdatedAccessToken(nextAccessToken)

        const retryHeaders = new Headers(init?.headers ?? {})
        retryHeaders.set("Authorization", `Bearer ${nextAccessToken}`)
        return await fetch(input, { ...init, headers: retryHeaders })
    } catch {
        clearAuthSession()
        return firstResponse
    }
}
