import { cn } from "@/lib/utils"

export function SkeletonBlock({ className }: { className?: string }) {
    return <div className={cn("shared-skeleton", className)} />
}