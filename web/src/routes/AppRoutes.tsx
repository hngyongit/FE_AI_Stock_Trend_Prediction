import type * as React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "@/pages/LandingPage/LandingPage"
import LoginPage from "@/pages/LoginPage/Login"
import NothingHere from "@/pages/NothingHere"
import Register from "@/pages/Register/Register"
import ForgotPassword from "@/pages/ForgotPassword"
import { STAFF_ROUTES, USER_ROUTES, ADMIN_ROUTES } from "./layoutRoutes"
import { renderProtectedLayoutRoute } from "./renderProtectedLayoutRoute"

export default function AppRoutes(): React.ReactElement {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            {USER_ROUTES.map((route) =>
                renderProtectedLayoutRoute(route, {
                    basePath: "",
                    requiredRole: "USER",
                })
            )}
            {STAFF_ROUTES.map((route) =>
                renderProtectedLayoutRoute(route, {
                    basePath: "/staff",
                    requiredRole: "STAFF",
                    layoutVariant: "staff",
                })
            )}
            {ADMIN_ROUTES.map((route) =>
                renderProtectedLayoutRoute(route, {
                    requiredRole: "ADMIN",
                    layoutVariant: "admin",
                })
            )}
            <Route path="/nothing-here" element={<NothingHere />} />
            <Route path="*" element={<Navigate to="/nothing-here" replace />} />
        </Routes>
    )
}
