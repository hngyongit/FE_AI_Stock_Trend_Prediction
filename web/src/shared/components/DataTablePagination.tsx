import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type DataTablePaginationProps = {
    page: number
    totalPages: number
    from: number
    to: number
    total: number
    onPageChange: (page: number) => void
}

export function DataTablePagination({ page, totalPages, from, to, total, onPageChange }: DataTablePaginationProps) {
    return (
        <div className="shared-pagination">
            <span>
                Showing {from}–{to} of {total}
            </span>
            <div className="shared-pagination__buttons">
                <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                >
                    <ChevronLeft className="size-3" />
                </Button>
                <span>{page} / {totalPages}</span>
                <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                >
                    <ChevronRight className="size-3" />
                </Button>
            </div>
        </div>
    )
}