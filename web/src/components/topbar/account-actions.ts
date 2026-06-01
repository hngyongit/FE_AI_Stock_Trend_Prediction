import type { NavigateFunction } from "react-router-dom"
import type { TopbarUserMenuAction } from "@/components/topbar"
import { getProfileRouteByRole, getSettingsRouteByRole } from "@/lib/role-routes"

type BuildAccountActionsOptions = {
    role?: string | null
    navigate: NavigateFunction
    signOut: () => Promise<void>
    onBeforeSignOut?: () => void
    settingsLabel?: string
}

export function buildTopbarAccountActions({
    role,
    navigate,
    signOut,
    onBeforeSignOut,
    settingsLabel = "Settings",
}: BuildAccountActionsOptions): TopbarUserMenuAction[] {
    return [
        { label: "Profile", onClick: () => navigate(getProfileRouteByRole(role)) },
        { label: settingsLabel, onClick: () => navigate(getSettingsRouteByRole(role)) },
        {
            label: "Sign out",
            onClick: async () => {
                onBeforeSignOut?.()
                await signOut()
                navigate("/login", { replace: true })
            },
        },
    ]
}
