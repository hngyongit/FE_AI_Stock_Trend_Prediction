export function getDefaultHomeRouteByRole(role?: string | null) {
    const normalized = String(role ?? "").toUpperCase()
    if (normalized === "ADMIN") return "/admin/dashboard"
    if (normalized === "STAFF") return "/staff/dashboard"
    return "/dashboard"
}

export function getProfileRouteByRole(role?: string | null) {
    const normalized = String(role ?? "").toUpperCase()
    if (normalized === "ADMIN") return "/admin/profile"
    if (normalized === "STAFF") return "/staff/profile"
    return "/profile"
}

export function getSettingsRouteByRole(role?: string | null) {
    const normalized = String(role ?? "").toUpperCase()
    if (normalized === "ADMIN") return "/admin/settings"
    if (normalized === "STAFF") return "/staff/settings"
    return "/settings"
}
