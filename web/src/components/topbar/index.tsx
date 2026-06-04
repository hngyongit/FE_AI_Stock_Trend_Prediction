import { type ReactNode, type RefObject } from "react"
import { Bell, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type ScopeBadgesProps = {
    values: string[]
    marketStatus: string
    isStatusMuted?: boolean
    onValueClick?: (value: string, index: number) => void
}

type TopbarSearchProps = {
    value: string
    onChange: (value: string) => void
    classNamePrefix?: string
    ariaLabel?: string
    placeholder?: string
}

type TopbarNotificationsProps = {
    isOpen: boolean
    onToggle: () => void
    unreadCount?: number
    children?: ReactNode
    rootRef?: RefObject<HTMLDivElement | null>
    classNamePrefix?: string
}

export type TopbarUserMenuAction = {
    label: string
    disabled?: boolean
    onClick?: () => void | Promise<void>
}

type TopbarUserMenuProps = {
    isOpen: boolean
    onToggle: () => void
    avatar?: ReactNode
    initials?: string
    fullName?: string | null
    email?: string | null
    actions: TopbarUserMenuAction[]
    rootRef?: RefObject<HTMLDivElement | null>
    classNamePrefix?: string
}

type TopbarControlsProps = {
    classNamePrefix?: string
    search: {
        value: string
        onChange: (value: string) => void
        ariaLabel?: string
        placeholder?: string
    }
    notifications: {
        isOpen: boolean
        onToggle: () => void
        unreadCount?: number
        rootRef?: RefObject<HTMLDivElement | null>
        menu?: ReactNode
    }
    userMenu: {
        isOpen: boolean
        onToggle: () => void
        rootRef?: RefObject<HTMLDivElement | null>
        avatar?: ReactNode
        initials?: string
        fullName?: string | null
        email?: string | null
        actions: TopbarUserMenuAction[]
    }
    rightSlot?: ReactNode
}

type TopbarBrandProps = {
    text: string
    onClick?: () => void
    classNamePrefix?: string
    className?: string
}

function cls(prefix: string, name: string) {
    return `${prefix}__${name}`
}

function textOrPlaceholder(value?: string | null) {
    return value?.trim() ? value : "--"
}

export function TopbarBrand({ text, onClick, classNamePrefix = "terminal-shell", className }: TopbarBrandProps) {
    const resolvedClassName = className ?? cls(classNamePrefix, "brand")
    if (!onClick) return <div className={resolvedClassName}>{textOrPlaceholder(text)}</div>
    return (
        <button type="button" className={resolvedClassName} onClick={onClick}>
            {textOrPlaceholder(text)}
        </button>
    )
}

export function TopbarScopeBadges({ values, marketStatus, isStatusMuted = false, onValueClick }: ScopeBadgesProps) {
    return (
        <div className="terminal-shell__pills" aria-label="Market scope">
            {values.map((value, index) =>
                onValueClick ? (
                    <button
                        key={value}
                        type="button"
                        className="terminal-shell__scope-badge terminal-shell__scope-badge-button"
                        onClick={() => onValueClick(value, index)}
                    >
                        {value}
                    </button>
                ) : (
                    <Badge key={value} variant="outline" className="terminal-shell__scope-badge">
                        {value}
                    </Badge>
                )
            )}
            <Badge
                variant="outline"
                className={cn("terminal-shell__scope-badge terminal-shell__scope-badge--status", isStatusMuted && "is-muted")}
            >
                <span className="terminal-shell__status-dot" aria-hidden="true" />
                {marketStatus}
            </Badge>
        </div>
    )
}

export function TopbarSearch({
    value,
    onChange,
    classNamePrefix = "terminal-shell",
    ariaLabel = "Search stocks",
    placeholder = "Search...",
}: TopbarSearchProps) {
    return (
        <label className={cls(classNamePrefix, "search")} aria-label={ariaLabel}>
            <Search className={cls(classNamePrefix, "search-icon")} aria-hidden="true" />
            <Input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                aria-label="Search"
                className={cls(classNamePrefix, "search-input")}
            />
        </label>
    )
}

export function TopbarNotifications({
    isOpen,
    onToggle,
    unreadCount = 0,
    children,
    rootRef,
    classNamePrefix = "terminal-shell",
}: TopbarNotificationsProps) {
    return (
        <div ref={rootRef} className={cls(classNamePrefix, "popover-root")}>
            <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Notifications"
                aria-expanded={isOpen}
                onClick={onToggle}
            >
                <span className={cls(classNamePrefix, "notif-wrap")}>
                    <Bell className="size-4" />
                    {unreadCount > 0 ? <span className={cls(classNamePrefix, "notif-dot")} aria-hidden="true" /> : null}
                </span>
            </Button>
            {isOpen ? (
                <div className={`${cls(classNamePrefix, "popover")} ${cls(classNamePrefix, "popover--right")}`}>
                    <div className={cls(classNamePrefix, "popover-title")}>Notifications</div>
                    {children ?? <div className={cls(classNamePrefix, "popover-empty")}>--</div>}
                </div>
            ) : null}
        </div>
    )
}

export function TopbarUserMenu({
    isOpen,
    onToggle,
    avatar,
    initials,
    fullName,
    email,
    actions,
    rootRef,
    classNamePrefix = "terminal-shell",
}: TopbarUserMenuProps) {
    return (
        <div ref={rootRef} className={cls(classNamePrefix, "popover-root")}>
            <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className={cls(classNamePrefix, "avatar-button")}
                aria-label="User menu"
                aria-expanded={isOpen}
                onClick={onToggle}
            >
                <Avatar className={cls(classNamePrefix, "avatar")} size="sm">
                    <AvatarFallback>{avatar ?? textOrPlaceholder(initials)}</AvatarFallback>
                </Avatar>
            </Button>
            {isOpen ? (
                <div className={`${cls(classNamePrefix, "popover")} ${cls(classNamePrefix, "popover--right")}`}>
                    <div className={cls(classNamePrefix, "popover-title")}>{fullName ?? "--"}</div>
                    <div className={cls(classNamePrefix, "popover-empty")}>{email ?? "--"}</div>
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            type="button"
                            className={cls(classNamePrefix, "menu-link")}
                            disabled={action.disabled}
                            onClick={action.onClick}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

export function TopbarControls({
    classNamePrefix = "terminal-shell",
    search,
    notifications,
    userMenu,
    rightSlot,
}: TopbarControlsProps) {
    return (
        <>
            <TopbarSearch
                value={search.value}
                onChange={search.onChange}
                classNamePrefix={classNamePrefix}
                ariaLabel={search.ariaLabel}
                placeholder={search.placeholder}
            />
            <TopbarNotifications
                unreadCount={notifications.unreadCount}
                isOpen={notifications.isOpen}
                onToggle={notifications.onToggle}
                rootRef={notifications.rootRef}
                classNamePrefix={classNamePrefix}
            >
                {notifications.menu}
            </TopbarNotifications>
            {rightSlot}
            <TopbarUserMenu
                avatar={userMenu.avatar}
                initials={userMenu.initials}
                isOpen={userMenu.isOpen}
                onToggle={userMenu.onToggle}
                rootRef={userMenu.rootRef}
                fullName={userMenu.fullName}
                email={userMenu.email}
                actions={userMenu.actions}
                classNamePrefix={classNamePrefix}
            />
        </>
    )
}
