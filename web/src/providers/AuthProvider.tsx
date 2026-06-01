import React from "react"
import { clearAuthSession, logout, readAuthSession, type AuthUser } from "@/services/auth.service.ts"

type AuthState = {
    accessToken: string | null
    refreshToken: string | null
    user: AuthUser | null
}

type AuthContextValue = AuthState & {
    isAuthenticated: boolean
    signOut: () => Promise<void>
    setSession: (session: AuthState, remember?: boolean) => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [state, setState] = React.useState<AuthState>(() => {
        const session = readAuthSession()
        return session
            ? {
                accessToken: session.accessToken,
                refreshToken: session.refreshToken,
                user: session.user,
            }
            : {
                accessToken: null,
                refreshToken: null,
                user: null,
            }
    })

    const signOut = React.useCallback(async () => {
        const accessToken = state.accessToken

        try {
            if (accessToken) {
                await logout(accessToken)
            }
        } catch (error) {
            console.warn("Logout request failed", error)
        } finally {
            clearAuthSession()
            setState({ accessToken: null, refreshToken: null, user: null })
        }
    }, [state.accessToken])

    const setSession = React.useCallback((session: AuthState) => {
        setState(session)
    }, [])

    const value: AuthContextValue = {
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: Boolean(state.accessToken && state.user),
        signOut,
        setSession,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = React.useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}

export default AuthProvider
