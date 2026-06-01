import { useMemo, type ComponentType, type ReactNode, type RefObject } from "react"
import { Menu, RefreshCcw, Shield } from "lucide-react"
import { NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TopbarBrand, TopbarControls, type TopbarUserMenuAction } from "@/components/topbar"

export type AdminNavItem = {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

export type SidebarSectionData = {
  title: string
  items: AdminNavItem[]
}

export type AdminMetric = {
  key: string
  label: string
  value?: string | null
}

export type AvatarAction = TopbarUserMenuAction

function textOrPlaceholder(value?: string | null) {
  return value?.trim() ? value : "--"
}

export function SidebarItem({ item, onNavigate }: { item: AdminNavItem; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => cn("admin-shell__nav-item", isActive && "is-active")}
      onClick={onNavigate}
    >
      <Icon className="admin-shell__nav-icon" />
      <span>{item.label}</span>
    </NavLink>
  )
}

export function SidebarSection({
  section,
  onNavigate,
}: {
  section: SidebarSectionData
  onNavigate?: () => void
}) {
  return (
    <section className="admin-shell__section">
      <h2 className="admin-shell__section-title">{section.title}</h2>
      <nav className="admin-shell__nav" aria-label={section.title}>
        {section.items.map((item) => (
          <SidebarItem key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    </section>
  )
}

export function AdminSidebar({
  productName,
  sections,
  isOpen,
  onNavigate,
  onBrandClick,
}: {
  productName: string
  sections: SidebarSectionData[]
  isOpen: boolean
  onNavigate?: () => void
  onBrandClick?: () => void
}) {
  return (
    <aside className={cn("admin-shell__sidebar", isOpen && "is-open")} aria-label="Admin navigation">
      <div className="admin-shell__brand">
        <span className="admin-shell__brand-icon" aria-hidden="true">
          <Shield className="size-3.5" />
        </span>
        <TopbarBrand text={textOrPlaceholder(productName)} onClick={onBrandClick} className="admin-shell__brand-text" />
      </div>
      <div className="admin-shell__sections">
        {sections.map((section) => (
          <SidebarSection key={section.title} section={section} onNavigate={onNavigate} />
        ))}
      </div>
    </aside>
  )
}

export function AdminMetricBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="admin-shell__metric">
      <span className="admin-shell__metric-label">{label}</span>
      <span className="admin-shell__metric-value">{textOrPlaceholder(value)}</span>
    </div>
  )
}

export function IconButton({
  icon,
  label,
  onClick,
  className,
}: {
  icon: ReactNode
  label: string
  onClick?: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className={cn("admin-shell__icon-button", className)}
      aria-label={label}
      onClick={onClick}
    >
      {icon}
    </Button>
  )
}

export function RefreshButton({ onClick }: { onClick?: () => void }) {
  return <IconButton label="Refresh data" onClick={onClick} icon={<RefreshCcw className="size-4" />} />
}

export function AdminTopBar({
  roleLabel,
  metrics,
  searchValue,
  onSearchChange,
  unreadCount,
  isNotificationsOpen,
  onNotificationsClick,
  notificationRootRef,
  notificationMenu,
  onRefreshClick,
  avatarInitials,
  fullName,
  email,
  isAvatarOpen,
  onAvatarToggle,
  avatarRootRef,
  avatarActions,
  onNavToggle,
}: {
  roleLabel?: string | null
  metrics: AdminMetric[]
  searchValue: string
  onSearchChange: (value: string) => void
  unreadCount?: number
  isNotificationsOpen?: boolean
  onNotificationsClick?: () => void
  notificationRootRef?: RefObject<HTMLDivElement | null>
  notificationMenu?: ReactNode
  onRefreshClick?: () => void
  avatarInitials: string
  fullName?: string | null
  email?: string | null
  isAvatarOpen: boolean
  onAvatarToggle: () => void
  avatarRootRef?: RefObject<HTMLDivElement | null>
  avatarActions: AvatarAction[]
  onNavToggle: () => void
}) {
  return (
    <header className="admin-shell__topbar">
      <div className="admin-shell__topbar-left">
        <IconButton icon={<Menu className="size-4" />} label="Open admin navigation" onClick={onNavToggle} className="admin-shell__menu-button" />
        <span className="admin-shell__role-badge">{textOrPlaceholder(roleLabel)}</span>
        <div className="admin-shell__metrics" aria-label="System summary">
          {metrics.map((metric) => (
            <AdminMetricBlock key={metric.key} label={metric.label} value={metric.value} />
          ))}
        </div>
      </div>
      <div className="admin-shell__topbar-right">
        <TopbarControls
          classNamePrefix="admin-shell"
          search={{
            value: searchValue,
            onChange: onSearchChange,
            ariaLabel: "Search admin modules",
            placeholder: "Search admin...",
          }}
          notifications={{
            unreadCount,
            onToggle: onNotificationsClick ?? (() => {}),
            isOpen: Boolean(isNotificationsOpen),
            rootRef: notificationRootRef,
            menu: notificationMenu,
          }}
          rightSlot={<RefreshButton onClick={onRefreshClick} />}
          userMenu={{
            initials: avatarInitials,
            fullName,
            email,
            isOpen: isAvatarOpen,
            onToggle: onAvatarToggle,
            rootRef: avatarRootRef,
            actions: avatarActions,
          }}
        />
      </div>
    </header>
  )
}

export function MainWorkspace({ children }: { children?: ReactNode }) {
  return (
    <main className="admin-shell__main">
      <div className="admin-shell__workspace">{children ?? <span className="admin-shell__workspace-placeholder">--</span>}</div>
    </main>
  )
}

export function AdminAppShell({
  sidebar,
  topBar,
  mobileOverlay,
  children,
}: {
  sidebar: ReactNode
  topBar: ReactNode
  mobileOverlay?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="admin-shell">
      {sidebar}
      {topBar}
      {mobileOverlay}
      {children}
    </div>
  )
}

export function useInitials(name?: string | null) {
  return useMemo(() => {
    if (!name?.trim()) return "--"
    return (
      name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "--"
    )
  }, [name])
}
