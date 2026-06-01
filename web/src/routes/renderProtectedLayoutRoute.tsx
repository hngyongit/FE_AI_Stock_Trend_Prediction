import { Route } from "react-router-dom"

import StaffLayout from "@/layouts/StaffLayout.tsx"
import UserLayout from "@/layouts/UserLayout"

import RequireAuth from "./RequireAuth"
import type { LayoutRoute } from "./layoutRoutes"

type RenderProtectedLayoutRouteOptions = {
    requiredRole?: string
    basePath: string
    layoutVariant?: "user" | "staff"
}

export function renderProtectedLayoutRoute(
    route: LayoutRoute,
    { requiredRole, basePath, layoutVariant = "user" }: RenderProtectedLayoutRouteOptions
) {
    const isStaffLayout = layoutVariant === "staff"
    return (
        <Route
            key={route.path}
            path={route.path}
            element={
                <RequireAuth requiredRole={requiredRole}>
                    {isStaffLayout ? (
                        <StaffLayout>{route.element}</StaffLayout>
                    ) : (
                        <UserLayout basePath={basePath}>{route.element}</UserLayout>
                    )}
                </RequireAuth>
            }
        />
    )
}
