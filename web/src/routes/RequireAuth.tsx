import type * as React from "react"
import { Navigate, useLocation } from "react-router-dom"

import { useAuth } from "@/providers/AuthProvider"

type RequireAuthProps = {
    children: React.ReactElement
    requiredRole?: string
}

export default function RequireAuth({ children, requiredRole }: RequireAuthProps) {
    const auth = useAuth()
    const loc = useLocation()

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" state={{ from: loc }} replace />
    }

    if (requiredRole && String(auth.user?.role || "").toUpperCase() !== requiredRole.toUpperCase()) {
        return <Navigate to="/nothing-here" replace />
    }

    return children
}
