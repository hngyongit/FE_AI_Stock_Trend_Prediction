import type * as React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "@/pages/LandingPage/LandingPage"
import LoginPage from "@/pages/LoginPage/Login"
import Admin from "@/pages/Admin"
import AdminStockList from "@/pages/Admin/StockManagement/AdminStockList"
import UserProfilePage from "@/pages/UserProfilePage/UserProfilePage"
import AdminLayout from "@/layouts/AdminLayout"
import Register from "@/pages/Register/Register"
import ForgotPassword from "@/pages/ForgotPassword"
import RequireAuth from "./RequireAuth"
import { STAFF_ROUTES, USER_ROUTES } from "./layoutRoutes"
import { renderProtectedLayoutRoute } from "./renderProtectedLayoutRoute"
//import AdminDashboard from "@/pages/Admin/AdminDashboard"
import AdminUserManagement from "@/pages/Admin/AdminUserManagement/AdminUserManagement" 

const ADMIN_ROUTES = [
    "/admin/dashboard",
    "/admin/users",
    "/admin/staff",
    "/admin/market-coverage",
    "/admin/alerts",
    "/admin/roles",
    "/admin/logs",
    "/admin/settings",
]

export default function AppRoutes(): React.ReactElement {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
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
            {/*<Route*/}
            {/*    path="/admin/dashboard"*/}
            {/*    element={*/}
            {/*        <RequireAuth requiredRole="ADMIN">*/}
            {/*            <AdminLayout>*/}
            {/*                <AdminDashboard />*/}
            {/*            </AdminLayout>*/}
            {/*        </RequireAuth>*/}
            {/*    }*/}
            {/*/>*/}
            <Route
                path="/admin/users"
                element={
                    <RequireAuth requiredRole="ADMIN">
                        <AdminLayout>
                            <AdminUserManagement />
                        </AdminLayout>
                    </RequireAuth>
                }
            />
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
            <Route
                path="/admin/stocks"
                element={
                    <RequireAuth requiredRole="ADMIN">
                        <AdminLayout>
                            <AdminStockList />
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
