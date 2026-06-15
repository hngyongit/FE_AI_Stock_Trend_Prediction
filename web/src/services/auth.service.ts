import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios"

function normalizeApiBaseUrl(value?: string) {
    const trimmed = value?.trim()
    if (!trimmed) return ""

    return trimmed.replace(/\/+$/, "").replace(/\/api$/, "")
}

export function getApiBaseUrl() {
    return normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)
}

export function getOAuthRedirectUri() {
    if (typeof window === "undefined") return ""

    return `${window.location.origin}/auth/callback`
}

const API_BASE_URL = getApiBaseUrl()
const apiClient = axios.create({
    baseURL: API_BASE_URL,
})

const AUTH_STORAGE_KEY = "auth"
export const AUTH_SESSION_CLEARED_EVENT = "auth-session-cleared"

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

type ApiErrorPayload = {
    message?: string
}

function getAxiosErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
        return error.response?.data?.message || fallback
    }
    return fallback
}

function withAuthHeader(config: AxiosRequestConfig, accessToken: string): AxiosRequestConfig {
    return {
        ...config,
        headers: {
            ...(config.headers ?? {}),
            Authorization: `Bearer ${accessToken}`,
        },
    }
}

function getAuthStorage(rememberMe: boolean) {
    return rememberMe ? localStorage : sessionStorage
}

export type RegisterResponse = {
    success: boolean
    message: string
    data: {
        user: AuthUser
    }
}

type RegisterCredentials = {
    full_name: string
    email: string
    password: string
}

export async function register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    let payload: RegisterResponse

    try {
        const response = await apiClient.post<RegisterResponse>("/api/auth/register", credentials)
        payload = response.data
    } catch (error) {
        throw new Error(getAxiosErrorMessage(error, "Registration failed"), { cause: error })
    }

    if (payload.success === false) {
        throw new Error(payload.message || "Registration failed")
    }

    if (!payload.data) {
        throw new Error("Registration failed")
    }

    return payload
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    let payload: LoginResponse

    try {
        const response = await apiClient.post<LoginResponse>("/api/auth/login", credentials)
        payload = response.data
    } catch (error) {
        throw new Error(getAxiosErrorMessage(error, "Login failed"), { cause: error })
    }

    if (payload.success === false) {
        throw new Error(payload.message || "Login failed")
    }

    if (!payload.data) {
        throw new Error("Login failed")
    }

    return payload
}

export async function exchangeOAuthCode(code: string, redirectUri?: string): Promise<LoginResponse> {
    let payload: LoginResponse

    try {
        const response = await apiClient.post<LoginResponse>("/api/auth/oauth/exchange", {
            code,
            ...(redirectUri ? { redirect_uri: redirectUri } : {}),
        })
        payload = response.data
    } catch (error) {
        throw new Error(getAxiosErrorMessage(error, "Google authentication failed"), { cause: error })
    }

    if (payload.success === false) {
        throw new Error(payload.message || "Google authentication failed")
    }

    if (!payload.data) {
        throw new Error("Google authentication failed")
    }

    return payload
}

export async function logout(accessToken: string): Promise<void> {
    let payload: { success?: boolean; message?: string }

    try {
        const response = await apiClient.post<{ success?: boolean; message?: string }>("/api/auth/logout", undefined, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
        payload = response.data
    } catch (error) {
        throw new Error(getAxiosErrorMessage(error, "Logout failed"), { cause: error })
    }

    if (payload?.success === false) {
        throw new Error(payload.message || "Logout failed")
    }
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
    let payload: RefreshTokenResponse

    try {
        const response = await apiClient.post<RefreshTokenResponse>("/api/auth/refresh-token", {
            refresh_token: refreshToken,
        })
        payload = response.data
    } catch (error) {
        throw new Error(getAxiosErrorMessage(error, "Unable to refresh access token"), { cause: error })
    }

    const nextAccessToken = payload.data?.access_token
    if (payload.success === false || !nextAccessToken) {
        throw new Error(payload.message || "Unable to refresh access token")
    }

    return nextAccessToken
}

export async function authenticatedRequest<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const session = readAuthSession()
    const requestConfig: AxiosRequestConfig = {
        ...config,
        validateStatus: () => true,
    }

    const firstConfig = session?.accessToken ? withAuthHeader(requestConfig, session.accessToken) : requestConfig
    const firstResponse = await apiClient.request<T>(firstConfig)
    if (firstResponse.status !== 401) return firstResponse

    if (!session?.refreshToken) return firstResponse

    try {
        const nextAccessToken = await refreshWithLock(session.refreshToken)
        saveUpdatedAccessToken(nextAccessToken)

        return await apiClient.request<T>(withAuthHeader(requestConfig, nextAccessToken))
    } catch {
        clearAuthSession({ notify: true })
        return firstResponse
    }
}

export const authApiClient = apiClient

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

export function clearAuthSession(options?: { notify?: boolean }) {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem("access_token")
    sessionStorage.removeItem("refresh_token")
    sessionStorage.removeItem("user")
    localStorage.removeItem("rememberMe")

    if (options?.notify) {
        window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT))
    }
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
