import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
    Activity,
    Archive,
    BadgeCheck,
    CreditCard,
    Database,
    FileStack,
    HardDriveDownload,
    LayoutDashboard,
    Logs,
    Menu,
    Settings,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/AuthProvider"
import {
    AppShell,
    MainWorkspace,
    StaffSidebar,
    StaffTopBar,
    type StaffNavItem,
    type SystemStatus,
} from "@/components/staff-shell"
import { buildTopbarAccountActions } from "@/components/topbar/account-actions"
import { getDefaultHomeRouteByRole } from "@/lib/role-routes"
import "./staff-layout.css"

type StaffLayoutProps = {
    children?: ReactNode
    systemStatuses?: Partial<Record<"Crawler" | "ETL" | "DB" | "API", { value?: string; healthy?: boolean }>>
    notificationCount?: number
    shellData?: {
        productName?: string
        roleLabel?: string
        operationsTitle?: string
        operationsSubtitle?: string
    }
}

const STAFF_NAV_ITEMS: StaffNavItem[] = [
    { label: "Staff Dashboard", to: "/staff/dashboard", icon: LayoutDashboard, end: true },
    { label: "Data Sources", to: "/staff/data-sources", icon: Database },
    { label: "Crawl Logs", to: "/staff/crawl-logs", icon: Logs },
    { label: "ETL Monitor", to: "/staff/etl-monitor", icon: FileStack },
    { label: "Import History", to: "/staff/import-history", icon: HardDriveDownload },
    { label: "Stock Data Monitor", to: "/staff/stock-data-monitor", icon: Archive },
    { label: "Subscriptions", to: "/staff/subscriptions", icon: CreditCard, end: true },
]

const SETTINGS_ITEM: StaffNavItem = { label: "Settings", to: "/staff/settings", icon: Settings }

function toInitials(name?: string | null) {
    if (!name?.trim()) return "--"
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "--"
}

export default function StaffLayout({
    children,
    systemStatuses,
    notificationCount = 0,
    shellData,
}: StaffLayoutProps) {
    const auth = useAuth()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")
    const [isNavOpen, setIsNavOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
    const notificationsRef = useRef<HTMLDivElement | null>(null)
    const avatarRef = useRef<HTMLDivElement | null>(null)

    const statuses: SystemStatus[] = useMemo(
        () => [
            { label: "Crawler", value: systemStatuses?.Crawler?.value, healthy: systemStatuses?.Crawler?.healthy },
            { label: "ETL", value: systemStatuses?.ETL?.value, healthy: systemStatuses?.ETL?.healthy },
            { label: "DB", value: systemStatuses?.DB?.value, healthy: systemStatuses?.DB?.healthy },
            { label: "API", value: systemStatuses?.API?.value, healthy: systemStatuses?.API?.healthy },
        ],
        [systemStatuses]
    )

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node
            if (notificationsRef.current && !notificationsRef.current.contains(target)) {
                setIsNotificationsOpen(false)
            }
            if (avatarRef.current && !avatarRef.current.contains(target)) {
                setIsAvatarMenuOpen(false)
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsNotificationsOpen(false)
                setIsAvatarMenuOpen(false)
            }
        }

        document.addEventListener("pointerdown", handlePointerDown)
        document.addEventListener("keydown", handleEscape)
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [])

    return (
        <AppShell
            topBar={
                <StaffTopBar
                    leftSlot={
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="staff-shell__menu-button"
                            aria-label="Open staff navigation"
                            onClick={() => setIsNavOpen((prev) => !prev)}
                        >
                            <Menu className="size-4" />
                        </Button>
                    }
                    productName={shellData?.productName ?? "AI Stock Trend"}
                    roleLabel={shellData?.roleLabel ?? auth.user?.role ?? "--"}
                    statuses={statuses}
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    unreadCount={notificationCount}
                    isNotificationsOpen={isNotificationsOpen}
                    onNotificationsClick={() => setIsNotificationsOpen((prev) => !prev)}
                    notificationRootRef={notificationsRef}
                    avatarInitials={toInitials(auth.user?.full_name)}
                    isAvatarOpen={isAvatarMenuOpen}
                    onAvatarClick={() => setIsAvatarMenuOpen((prev) => !prev)}
                    avatarRootRef={avatarRef}
                    avatarFullName={auth.user?.full_name}
                    avatarEmail={auth.user?.email}
                    onBrandClick={() => navigate(getDefaultHomeRouteByRole(auth.user?.role))}
                    avatarActions={buildTopbarAccountActions({
                        role: auth.user?.role,
                        navigate,
                        signOut: auth.signOut,
                        settingsLabel: "Preferences",
                    })}
                />
            }
            sidebar={
                <StaffSidebar
                    items={STAFF_NAV_ITEMS}
                    settingsItem={SETTINGS_ITEM}
                    isOpen={isNavOpen}
                    onNavigate={() => setIsNavOpen(false)}
                />
            }
            mobileOverlay={
                isNavOpen ? (
                    <button
                        type="button"
                        className="staff-shell__overlay"
                        aria-label="Close staff navigation"
                        onClick={() => setIsNavOpen(false)}
                    />
                ) : null
            }
        >
            <MainWorkspace>{children}</MainWorkspace>
        </AppShell>
    )
}
