import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SkeletonBlock } from "./SkeletonBlock"

/* ── Loading ───────────────────────────────────────── */

export function TableLoading() {
    return (
        <div className="shared-table-state">
            <SkeletonBlock className="shared-table-state__head" />
            <SkeletonBlock className="shared-table-state__body" />
        </div>
    )
}

/* ── Error ─────────────────────────────────────────── */

export function TableError({
    message,
    endpoint,
    onRetry,
}: {
    message: string
    endpoint?: string
    onRetry: () => void
}) {
    return (
        <div className="shared-table-state shared-table-state--error">
            <strong>Request failed</strong>
            {endpoint ? <span>{endpoint}</span> : null}
            <span>{message}</span>
            <Button type="button" size="xs" onClick={onRetry}>
                <RefreshCw className="size-3" /> Retry
            </Button>
        </div>
    )
}

/* ── Empty ─────────────────────────────────────────── */

export function TableEmpty({ message }: { message: string }) {
    return (
        <div className="shared-table-state">
            <span>{message}</span>
        </div>
    )
}

/* ── Filtered empty ────────────────────────────────── */

export function TableNoMatch({ onClear }: { onClear: () => void }) {
    return (
        <div className="shared-table-state">
            <span>No stocks match the current filters.</span>
            <Button type="button" size="xs" variant="outline" onClick={onClear}>
                Clear filters
            </Button>
        </div>
    )
}