import { type ComponentType, type ReactNode, type RefObject } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { NavLink } from "react-router-dom"
import { TopbarBrand, TopbarControls, type TopbarUserMenuAction } from "@/components/topbar"

export type SystemStatus = {
    label: string
    value?: string | null
    healthy?: boolean
}

export type StaffNavItem = {
    label: string
    to: string
    icon: ComponentType<{ className?: string }>
    end?: boolean
}

function textOrPlaceholder(value?: string | null) {
    return value?.trim() ? value : "--"
}

export function StatusPill({ label, value, healthy = false }: SystemStatus) {
    const text = textOrPlaceholder(value)
    const showHealthyDot = healthy && text !== "--"
    return (
        <Badge
            variant="outline"
            className={cn("staff-shell__status-pill", text === "--" && "is-muted")}
        >
            {showHealthyDot ? <span className="staff-shell__status-dot" aria-hidden="true" /> : null}
            {label}: {text}
        </Badge>
    )
}

export function SidebarItem({ item, onNavigate }: { item: StaffNavItem; onNavigate?: () => void }) {
    const Icon = item.icon
    return (
        <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) => cn("staff-shell__nav-item", isActive && "is-active")}
            onClick={onNavigate}
        >
            <Icon className="staff-shell__nav-icon" />
            <span>{item.label}</span>
        </NavLink>
    )
}

export function StaffTopBar({
    productName,
    roleLabel,
    statuses,
    searchValue,
    onSearchChange,
    unreadCount,
    isNotificationsOpen,
    onNotificationsClick,
    notificationMenu,
    notificationRootRef,
    avatarInitials,
    isAvatarOpen,
    onAvatarClick,
    avatarRootRef,
    avatarFullName,
    avatarEmail,
    avatarActions,
    onBrandClick,
    leftSlot,
}: {
    productName?: string | null
    roleLabel?: string | null
    statuses: SystemStatus[]
    searchValue: string
    onSearchChange: (value: string) => void
    unreadCount?: number
    isNotificationsOpen?: boolean
    onNotificationsClick?: () => void
    notificationMenu?: ReactNode
    notificationRootRef?: RefObject<HTMLDivElement | null>
    avatarInitials: string
    isAvatarOpen: boolean
    onAvatarClick?: () => void
    avatarRootRef?: RefObject<HTMLDivElement | null>
    avatarFullName?: string | null
    avatarEmail?: string | null
    avatarActions: TopbarUserMenuAction[]
    onBrandClick?: () => void
    leftSlot?: ReactNode
}) {
    return (
        <header className="staff-shell__topbar">
            <div className="staff-shell__topbar-left">
                {leftSlot}
                <TopbarBrand
                    text={textOrPlaceholder(productName)}
                    onClick={onBrandClick}
                    classNamePrefix="staff-shell"
                />
                <Badge variant="outline" className="staff-shell__role-badge">
                    {textOrPlaceholder(roleLabel)}
                </Badge>
            </div>
            <div className="staff-shell__topbar-right">
                <div className="staff-shell__status-group">
                    {statuses.map((status) => (
                        <StatusPill key={status.label} {...status} />
                    ))}
                </div>
                <TopbarControls
                    classNamePrefix="staff-shell"
                    search={{
                        value: searchValue,
                        onChange: onSearchChange,
                        ariaLabel: "Search systems",
                        placeholder: "Search systems...",
                    }}
                    notifications={{
                        unreadCount,
                        isOpen: Boolean(isNotificationsOpen),
                        onToggle: onNotificationsClick ?? (() => {}),
                        rootRef: notificationRootRef,
                        menu: notificationMenu,
                    }}
                    userMenu={{
                        initials: avatarInitials,
                        isOpen: isAvatarOpen,
                        onToggle: onAvatarClick ?? (() => {}),
                        rootRef: avatarRootRef,
                        fullName: avatarFullName,
                        email: avatarEmail,
                        actions: avatarActions,
                    }}
                />
            </div>
        </header>
    )
}

export function StaffSidebar({
    items,
    settingsItem,
    isOpen,
    onNavigate,
}: {
    items: StaffNavItem[]
    settingsItem: StaffNavItem
    isOpen: boolean
    onNavigate?: () => void
}) {
    return (
        <aside className={cn("staff-shell__sidebar", isOpen && "is-open")} aria-label="Staff navigation">
            <nav className="staff-shell__nav">
                {items.map((item) => (
                    <SidebarItem key={item.to} item={item} onNavigate={onNavigate} />
                ))}
            </nav>
            <div className="staff-shell__sidebar-footer">
                <SidebarItem item={settingsItem} onNavigate={onNavigate} />
            </div>
        </aside>
    )
}

export function MainWorkspace({ children }: { children?: ReactNode }) {
    return <main className="staff-shell__workspace">{children ?? <div className="staff-shell__workspace-empty">--</div>}</main>
}

export function AppShell({
    topBar,
    sidebar,
    mobileOverlay,
    children,
}: {
    topBar: ReactNode
    sidebar: ReactNode
    mobileOverlay?: ReactNode
    children: ReactNode
}) {
    return (
        <div className="staff-shell">
            {topBar}
            {sidebar}
            {mobileOverlay}
            {children}
        </div>
    )
}
