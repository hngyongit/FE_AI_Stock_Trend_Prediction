import { Route } from "react-router-dom"

import AdminLayout from "@/layouts/AdminLayout"
import StaffLayout from "@/layouts/StaffLayout.tsx"
import UserLayout from "@/layouts/UserLayout"

import RequireAuth from "./RequireAuth"
import type { LayoutRoute } from "./layoutRoutes"

type RenderProtectedLayoutRouteOptions = {
    requiredRole?: string
    basePath?: string
    layoutVariant?: "user" | "staff" | "admin"
}

export function renderProtectedLayoutRoute(
    route: LayoutRoute,
    { requiredRole, basePath, layoutVariant = "user" }: RenderProtectedLayoutRouteOptions
) {
    const isStaffLayout = layoutVariant === "staff"
    const isAdminLayout = layoutVariant === "admin"
    return (
        <Route
            key={route.path}
            path={route.path}
            element={
                <RequireAuth requiredRole={requiredRole}>
                    {isAdminLayout ? (
                        <AdminLayout>{route.element}</AdminLayout>
                    ) : isStaffLayout ? (
                        <StaffLayout>{route.element}</StaffLayout>
                    ) : (
                        <UserLayout basePath={basePath ?? ""}>{route.element}</UserLayout>
                    )}
                </RequireAuth>
            }
        />
    )
}
