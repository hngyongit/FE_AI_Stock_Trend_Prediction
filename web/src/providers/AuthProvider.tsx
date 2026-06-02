import type React from "react"

import { useAuthStore } from "@/stores/auth.store"

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>

export function useAuth() {
    return useAuthStore()
}

export default AuthProvider
