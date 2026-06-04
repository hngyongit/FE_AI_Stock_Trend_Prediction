import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getStatusTone, placeholder } from "./stock-helpers"

type StatusBadgeProps = {
    status?: string
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const tone = getStatusTone(status)
    return (
        <Badge
            variant="outline"
            className={cn("shared-status-badge", `shared-status-badge--${tone}`, className)}
        >
            {placeholder(status)}
        </Badge>
    )
}