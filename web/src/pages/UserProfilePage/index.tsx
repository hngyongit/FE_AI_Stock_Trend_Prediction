import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/AuthProvider"
import { getMyProfile, type UserProfile } from "@/services/users.service"

function textOrPlaceholder(value?: string | null) {
    return value?.trim() ? value : "--"
}

function formatDate(value?: string) {
    if (!value) return "--"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "--"
    return date.toLocaleString()
}

export default function UserProfilePage() {
    const auth = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadTick, setReloadTick] = useState(0)

    useEffect(() => {
        let isActive = true

        async function loadProfile() {
            if (!auth.accessToken) {
                if (isActive) {
                    setProfile(null)
                    setError("Missing access token")
                    setIsLoading(false)
                }
                return
            }

            setIsLoading(true)
            setError(null)
            try {
                const data = await getMyProfile()
                if (isActive) setProfile(data)
            } catch (err) {
                if (isActive) {
                    setProfile(null)
                    setError(err instanceof Error ? err.message : "Unable to load profile")
                }
            } finally {
                if (isActive) setIsLoading(false)
            }
        }

        loadProfile()
        return () => {
            isActive = false
        }
    }, [auth.accessToken, reloadTick])

    const rows = useMemo(
        () => [
            { label: "ID", value: textOrPlaceholder(profile?.id) },
            { label: "Full Name", value: textOrPlaceholder(profile?.full_name) },
            { label: "Email", value: textOrPlaceholder(profile?.email) },
            { label: "Role", value: textOrPlaceholder(profile?.role) },
            { label: "Status", value: textOrPlaceholder(profile?.status) },
            { label: "Created At", value: formatDate(profile?.created_at) },
        ],
        [profile]
    )

    return (
        <section className="terminal-workspace-page" aria-label="User profile">
            <header className="terminal-workspace-page__header">
                <div>
                    <h1 className="terminal-workspace-page__title">User Profile</h1>
                    <p className="terminal-workspace-page__subtitle">Data source: GET /api/auth/me</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReloadTick((prev) => prev + 1)}
                    disabled={isLoading}
                >
                    Refresh
                </Button>
            </header>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {rows.map((row) => (
                    <div key={row.label} className="rounded-lg border border-border bg-card px-3 py-2">
                        <div className="text-[0.72rem] text-muted-foreground">{row.label}</div>
                        <div className="mt-1 text-sm text-foreground">{isLoading ? "--" : row.value}</div>
                    </div>
                ))}
            </div>

            {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
        </section>
    )
}
