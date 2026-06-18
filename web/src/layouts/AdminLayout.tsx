import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LockKeyhole,
  Logs,
  Receipt,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/providers/AuthProvider"
import {
  AdminAppShell,
  AdminSidebar,
  AdminTopBar,
  MainWorkspace,
  useInitials,
  type AdminMetric,
  type SidebarSectionData,
} from "@/components/admin-shell"
import { buildTopbarAccountActions } from "@/components/topbar/account-actions"
import { getDefaultHomeRouteByRole } from "@/lib/role-routes"
import "./admin-layout.css"

type AdminShellData = {
  productName?: string
  roleLabel?: string
  userPool?: string
  crawlHealth?: string
  apiStatus?: string
  syncStatus?: string
  lastUpdated?: string
}

type AdminLayoutProps = {
  children?: ReactNode
  shellData?: AdminShellData
  unreadCount?: number
  onRefresh?: () => void
}

const NAV_SECTIONS: SidebarSectionData[] = [
  {
    title: "MAIN OPERATIONS",
    items: [
      { label: "Admin Dashboard", to: "/admin/dashboard", icon: LayoutDashboard, end: true },
      { label: "User Management", to: "/admin/users", icon: Users },
      { label: "Staff Management", to: "/admin/staff", icon: UserCog },
      { label: "Stock Management", to: "/admin/stocks", icon: TrendingUp },
      { label: "Market Coverage", to: "/admin/market-coverage", icon: ShieldCheck },
    ],
  },
  {
    title: "SUBSCRIPTIONS",
    items: [
      { label: "All Subscriptions", to: "/admin/subscriptions", icon: CreditCard, end: true },
      { label: "Subscription Stats", to: "/admin/subscriptions/stats", icon: BarChart3 },
      { label: "Transaction Log", to: "/admin/subscriptions/transactions", icon: Receipt },
    ],
  },
  {
    title: "SECURITY & LOGS",
    items: [
      { label: "Alert Management", to: "/admin/alerts", icon: AlertTriangle },
      { label: "Role & Permission", to: "/admin/roles", icon: LockKeyhole },
      { label: "System Logs", to: "/admin/logs", icon: Logs },
      { label: "System Settings", to: "/admin/settings", icon: Settings },
    ],
  },
]

export default function AdminLayout({ children, shellData, unreadCount = 0, onRefresh }: AdminLayoutProps) {
  const auth = useAuth()
  const navigate = useNavigate()
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const avatarRef = useRef<HTMLDivElement | null>(null)

  const metrics: AdminMetric[] = useMemo(
    () => [
      { key: "user-pool", label: "USER POOL", value: shellData?.userPool },
      { key: "crawl-health", label: "CRAWL HEALTH", value: shellData?.crawlHealth },
      { key: "api-status", label: "API STATUS", value: shellData?.apiStatus },
      { key: "sync-status", label: "SYNC", value: shellData?.syncStatus },
      { key: "last-updated", label: "LAST UPDATED", value: shellData?.lastUpdated },
    ],
    [shellData]
  )

  const initials = useInitials(auth.user?.full_name)
  const defaultHome = useMemo(() => getDefaultHomeRouteByRole(auth.user?.role), [auth.user?.role])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false)
      }
      if (avatarRef.current && !avatarRef.current.contains(target)) {
        setIsAvatarOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false)
        setIsAvatarOpen(false)
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
    <AdminAppShell
      sidebar={
        <AdminSidebar
          productName={shellData?.productName ?? "AI Stock Trend"}
          sections={NAV_SECTIONS}
          isOpen={isNavOpen}
          onNavigate={() => setIsNavOpen(false)}
          onBrandClick={() => navigate(defaultHome)}
        />
      }
      topBar={
        <AdminTopBar
          roleLabel={shellData?.roleLabel ?? auth.user?.role ?? "ADMIN ROLE"}
          metrics={metrics}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          unreadCount={unreadCount}
          isNotificationsOpen={isNotificationsOpen}
          onNotificationsClick={() => setIsNotificationsOpen((prev) => !prev)}
          notificationRootRef={notificationsRef}
          onRefreshClick={onRefresh}
          avatarInitials={initials}
          fullName={auth.user?.full_name}
          email={auth.user?.email}
          isAvatarOpen={isAvatarOpen}
          onAvatarToggle={() => setIsAvatarOpen((prev) => !prev)}
          avatarRootRef={avatarRef}
          onNavToggle={() => setIsNavOpen((prev) => !prev)}
          avatarActions={buildTopbarAccountActions({
            role: auth.user?.role,
            navigate,
            signOut: auth.signOut,
          })}
        />
      }
      mobileOverlay={
        isNavOpen ? (
          <button
            type="button"
            className="admin-shell__overlay"
            aria-label="Close admin navigation"
            onClick={() => setIsNavOpen(false)}
          />
        ) : null
      }
    >
      <MainWorkspace>{children}</MainWorkspace>
    </AdminAppShell>
  )
}
