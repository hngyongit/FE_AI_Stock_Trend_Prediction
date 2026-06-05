import { cn } from "@/lib/utils"

interface BreadcrumbProps {
    items: string[]
    className?: string
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
    return (
        <div className={cn("shared-breadcrumb", className)}>
            {items.map((item, index) => (
                <span key={index}>
                    {index > 0 && <span className="shared-breadcrumb__separator"> / </span>}
                    <span className="shared-breadcrumb__item">{item}</span>
                </span>
            ))}
        </div>
    )
}
