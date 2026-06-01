import type * as React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "@/pages/LoginPage"
import Admin from "@/pages/Admin"
import UserProfilePage from "@/pages/UserProfilePage"
import AdminLayout from "@/layouts/AdminLayout"
import Register from "@/pages/Register"
import ForgotPassword from "@/pages/ForgotPassword"
import RequireAuth from "./RequireAuth"
import { STAFF_ROUTES, USER_ROUTES } from "./layoutRoutes"
import { renderProtectedLayoutRoute } from "./renderProtectedLayoutRoute"

const ADMIN_ROUTES = [
    "/admin/dashboard",
    "/admin/users",
    "/admin/staff",
    "/admin/stocks",
    "/admin/market-coverage",
    "/admin/alerts",
    "/admin/roles",
    "/admin/logs",
    "/admin/settings",
]

export default function AppRoutes(): React.ReactElement {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            {USER_ROUTES.map((route) => renderProtectedLayoutRoute(route, { basePath: "" }))}
            {STAFF_ROUTES.map((route) =>
                renderProtectedLayoutRoute(route, {
                    basePath: "/staff",
                    requiredRole: "STAFF",
                    layoutVariant: "staff",
                })
            )}
            <Route
                path="/admin/profile"
                element={
                    <RequireAuth requiredRole="ADMIN">
                        <AdminLayout>
                            <UserProfilePage />
                        </AdminLayout>
                    </RequireAuth>
                }
            />
            {ADMIN_ROUTES.map((path) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        <RequireAuth requiredRole="ADMIN">
                            <Admin />
                        </RequireAuth>
                    }
                />
            ))}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}
