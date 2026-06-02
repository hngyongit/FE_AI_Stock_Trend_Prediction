import { create } from "zustand"

import {
    AUTH_SESSION_CLEARED_EVENT,
    clearAuthSession,
    logout,
    readAuthSession,
    saveAuthSession,
    type AuthUser,
} from "@/services/auth.service"

export type AuthState = {
    accessToken: string | null
    refreshToken: string | null
    user: AuthUser | null
}

type AuthStore = AuthState & {
    isAuthenticated: boolean
    setSession: (session: AuthState, rememberMe?: boolean) => void
    clearSession: () => void
    signOut: () => Promise<void>
}

const emptyAuthState: AuthState = {
    accessToken: null,
    refreshToken: null,
    user: null,
}

function getInitialAuthState(): AuthState {
    const session = readAuthSession()

    if (!session) return emptyAuthState

    return {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
    }
}

function toStoreState(state: AuthState) {
    return {
        ...state,
        isAuthenticated: Boolean(state.accessToken && state.user),
    }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    ...toStoreState(getInitialAuthState()),

    setSession: (session, rememberMe) => {
        if (rememberMe !== undefined) {
            if (rememberMe) {
                localStorage.setItem("rememberMe", "true")
            } else {
                localStorage.removeItem("rememberMe")
            }

            if (session.accessToken && session.refreshToken && session.user) {
                saveAuthSession(
                    {
                        accessToken: session.accessToken,
                        refreshToken: session.refreshToken,
                        user: session.user,
                    },
                    rememberMe
                )
            }
        }

        set(toStoreState(session))
    },

    clearSession: () => {
        clearAuthSession()
        set(toStoreState(emptyAuthState))
    },

    signOut: async () => {
        const accessToken = get().accessToken

        try {
            if (accessToken) {
                await logout(accessToken)
            }
        } catch (error) {
            console.warn("Logout request failed", error)
        } finally {
            clearAuthSession()
            set(toStoreState(emptyAuthState))
        }
    },
}))

window.addEventListener(AUTH_SESSION_CLEARED_EVENT, () => {
    useAuthStore.setState(toStoreState(emptyAuthState))
})
