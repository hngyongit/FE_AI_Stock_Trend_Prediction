import { useEffect, useMemo, useState } from "react"
import { Plus, RefreshCw, Edit3, Trash2, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { getStockList, type StockItem, type StockListQuery } from "@/services/stock.service"
import {
    createStock,
    updateStock,
    type AdminStockItem,
    type CreateStockPayload,
    type UpdateStockPayload,
} from "@/services/admin-stock.service"
import {
    SearchInput,
    StatusBadge,
    DataTablePagination,
    TableLoading,
    TableError,
    TableEmpty,
    TableNoMatch,
    placeholder,
    exchangeOptions,
} from "@/shared/components"
import "@/shared/components/shared-stock.css"
import "./AdminStockList.css"

/* ── Constants ─────────────────────────────────────── */

const DEFAULT_QUERY: StockListQuery = {
    page: 1,
    limit: 500,
    market: "HOSE",
}

const EXCHANGE_OPTIONS = exchangeOptions()
const STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "DELISTED"]

/* ── Modal – Add Stock ──────────────────────────────── */

type AddStockForm = {
    symbol: string
    company_name: string
    exchange_code: string
    status: string
    listed_date: string
}

const EMPTY_ADD_FORM: AddStockForm = {
    symbol: "",
    company_name: "",
    exchange_code: "HOSE",
    status: "ACTIVE",
    listed_date: "",
}

function AddStockModal({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}) {
    const [form, setForm] = useState<AddStockForm>(EMPTY_ADD_FORM)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            setForm(EMPTY_ADD_FORM)
            setError(null)
        }
    }, [open])

    const handleChange = (field: keyof AddStockForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        if (!form.symbol.trim()) {
            setError("Symbol is required")
            return
        }
        if (!form.company_name.trim()) {
            setError("Company name is required")
            return
        }
        if (!form.listed_date) {
            setError("Listed date is required")
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            const payload: CreateStockPayload = {
                symbol: form.symbol.trim().toUpperCase(),
                company_name: form.company_name.trim(),
                exchange_code: form.exchange_code,
                status: form.status,
                listed_date: form.listed_date,
            }
            await createStock(payload)
            onSuccess()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create stock")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="ams-modal">
                <DialogHeader>
                    <DialogTitle>Add New Stock</DialogTitle>
                </DialogHeader>

                <div className="ams-modal__body">
                    {error ? (
                        <div className="ams-modal__error" role="alert">
                            {error}
                        </div>
                    ) : null}

                    <div className="ams-modal__field">
                        <label className="ams-modal__label" htmlFor="add-symbol">
                            Symbol <span className="ams-modal__required">*</span>
                        </label>
                        <input
                            id="add-symbol"
                            className="ams-modal__input"
                            value={form.symbol}
                            onChange={(e) => handleChange("symbol", e.target.value.toUpperCase())}
                            placeholder="e.g. FPT"
                        />
                    </div>

                    <div className="ams-modal__field">
                        <label className="ams-modal__label" htmlFor="add-company">
                            Company Name <span className="ams-modal__required">*</span>
                        </label>
                        <input
                            id="add-company"
                            className="ams-modal__input"
                            value={form.company_name}
                            onChange={(e) => handleChange("company_name", e.target.value)}
                            placeholder="e.g. Công ty Cổ phần FPT"
                        />
                    </div>

                    <div className="ams-modal__row">
                        <div className="ams-modal__field">
                            <label className="ams-modal__label" htmlFor="add-exchange">
                                Exchange Code
                            </label>
                            <select
                                id="add-exchange"
                                className="ams-modal__select"
                                value={form.exchange_code}
                                onChange={(e) => handleChange("exchange_code", e.target.value)}
                            >
                                {EXCHANGE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="ams-modal__field">
                            <label className="ams-modal__label" htmlFor="add-status">
                                Status
                            </label>
                            <select
                                id="add-status"
                                className="ams-modal__select"
                                value={form.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="ams-modal__field">
                        <label className="ams-modal__label" htmlFor="add-date">
                            Listed Date <span className="ams-modal__required">*</span>
                        </label>
                        <input
                            id="add-date"
                            type="date"
                            className="ams-modal__input"
                            value={form.listed_date}
                            onChange={(e) => handleChange("listed_date", e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" size="sm">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Stock"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/* ── Modal – Edit Stock ─────────────────────────────── */

function EditStockModal({
    open,
    onClose,
    onSuccess,
    stock,
}: {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    stock: AdminStockItem | null
}) {
    const [form, setForm] = useState<UpdateStockPayload>({
        company_name: "",
        exchange_code: "HOSE",
        status: "ACTIVE",
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open && stock) {
            setForm({
                company_name: stock.company_name || "",
                exchange_code: stock.exchange_code || "HOSE",
                status: stock.status || "ACTIVE",
            })
            setError(null)
        }
    }, [open, stock])

    const handleChange = (field: keyof UpdateStockPayload, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        if (!form.company_name.trim()) {
            setError("Company name is required")
            return
        }
        if (!stock?._id) {
            setError("Stock ID is missing")
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            await updateStock(stock._id, {
                company_name: form.company_name.trim(),
                exchange_code: form.exchange_code,
                status: form.status,
            })
            onSuccess()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update stock")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="ams-modal">
                <DialogHeader>
                    <DialogTitle>
                        Edit Stock – {stock?.symbol || ""}
                    </DialogTitle>
                </DialogHeader>

                <div className="ams-modal__body">
                    {error ? (
                        <div className="ams-modal__error" role="alert">
                            {error}
                        </div>
                    ) : null}

                    <div className="ams-modal__field">
                        <label className="ams-modal__label" htmlFor="edit-company">
                            Company Name <span className="ams-modal__required">*</span>
                        </label>
                        <input
                            id="edit-company"
                            className="ams-modal__input"
                            value={form.company_name}
                            onChange={(e) => handleChange("company_name", e.target.value)}
                            placeholder="e.g. Công ty Cổ phần FPT"
                        />
                    </div>

                    <div className="ams-modal__row">
                        <div className="ams-modal__field">
                            <label className="ams-modal__label" htmlFor="edit-exchange">
                                Exchange Code
                            </label>
                            <select
                                id="edit-exchange"
                                className="ams-modal__select"
                                value={form.exchange_code}
                                onChange={(e) => handleChange("exchange_code", e.target.value)}
                            >
                                {EXCHANGE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="ams-modal__field">
                            <label className="ams-modal__label" htmlFor="edit-status">
                                Status
                            </label>
                            <select
                                id="edit-status"
                                className="ams-modal__select"
                                value={form.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" size="sm">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/* ── Main Component ─────────────────────────────────── */

export default function AdminStockList() {
    const [query] = useState<StockListQuery>(DEFAULT_QUERY)
    const [items, setItems] = useState<StockItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchText, setSearchText] = useState("")
    const [exchangeFilter, setExchangeFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    const [tablePage, setTablePage] = useState(1)
    const rowsPerPage = 25

    const [addModalOpen, setAddModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [editingStock, setEditingStock] = useState<AdminStockItem | null>(null)

    /* ── Load data ──────────────────────────────────── */

    const loadData = () => {
        setIsLoading(true)
        setError(null)

        getStockList(query)
            .then((result) => {
                setItems(result.items)
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : "Unable to load stock list")
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])

    /* ── Filtering & sorting ─────────────────────────── */

    const filteredItems = useMemo(() => {
        const search = searchText.trim().toLowerCase()
        return items.filter((item) => {
            const matchesSearch = !search
                || item.symbol.toLowerCase().includes(search)
                || item.companyName?.toLowerCase().includes(search)
            const matchesExchange = exchangeFilter === "all" || item.market === exchangeFilter
            const matchesStatus = statusFilter === "all" || item.status === statusFilter
            return matchesSearch && matchesExchange && matchesStatus
        })
    }, [searchText, exchangeFilter, items, statusFilter])

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => a.symbol.localeCompare(b.symbol))
    }, [filteredItems])

    const totalPages = Math.max(1, Math.ceil(sortedItems.length / rowsPerPage))

    useEffect(() => {
        setTablePage(1)
    }, [searchText, exchangeFilter, statusFilter])

    useEffect(() => {
        if (tablePage > totalPages) setTablePage(totalPages)
    }, [tablePage, totalPages])

    const paginatedItems = useMemo(() => {
        const start = (tablePage - 1) * rowsPerPage
        return sortedItems.slice(start, start + rowsPerPage)
    }, [rowsPerPage, sortedItems, tablePage])

    /* ── Handlers ────────────────────────────────────── */

    const handleEdit = (item: StockItem) => {
        const adminItem: AdminStockItem = {
            _id: "", // We'll use symbol as fallback
            symbol: item.symbol,
            company_name: item.companyName || "",
            exchange_code: item.market || "HOSE",
            status: item.status || "ACTIVE",
        }
        setEditingStock(adminItem)
        setEditModalOpen(true)
    }

    const handleDelete = (_symbol: string) => {
        // No API yet — show placeholder
        // Placeholder for future delete functionality
    }

    /* ── Render ──────────────────────────────────────── */

    return (
        <div className="ams">
            <div className="ams__breadcrumb">Admin / Stock Management</div>

            {/* Header */}
            <section className="ams__header">
                <div>
                    <h1>Stock Management</h1>
                    <p>Manage stock master data — add, edit, or remove stocks</p>
                </div>
                <div className="ams__header-status">
                    <span><strong>Total stocks</strong>{items.length || "--"}</span>
                    <span><strong>Exchange</strong>{query.market}</span>
                </div>
            </section>

            {/* Controls */}
            <section className="ams__controls">
                <SearchInput value={searchText} onChange={setSearchText} />

                <select
                    value={exchangeFilter}
                    className="ams__select"
                    onChange={(e) => setExchangeFilter(e.target.value)}
                >
                    <option value="all">All exchanges</option>
                    {EXCHANGE_OPTIONS.map((ex) => (
                        <option key={ex} value={ex}>{ex}</option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    className="ams__select"
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All statuses</option>
                    {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>{st}</option>
                    ))}
                </select>

                <div className="ams__actions">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={loadData}
                        disabled={isLoading}
                    >
                        <RefreshCw className="size-3.5" />
                        Refresh
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setAddModalOpen(true)}
                    >
                        <Plus className="size-3.5" />
                        Add Stock
                    </Button>
                </div>
            </section>

            {/* Table */}
            <section className="ams__table-card">
                {isLoading ? (
                    <TableLoading />
                ) : error ? (
                    <TableError message={error} onRetry={loadData} />
                ) : !items.length ? (
                    <TableEmpty message="No stocks found." />
                ) : !sortedItems.length ? (
                    <TableNoMatch onClear={() => { setSearchText(""); setExchangeFilter("all"); setStatusFilter("all"); }} />
                ) : (
                    <>
                        <div className="ams__table-wrap">
                            <table className="ams__table">
                                <thead>
                                    <tr>
                                        <th>Symbol</th>
                                        <th>Company Name</th>
                                        <th>Exchange Code</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedItems.map((item) => {
                                        return (
                                            <tr key={item.symbol}>
                                                <td className="ams__symbol-cell">{item.symbol}</td>
                                                <td>{placeholder(item.companyName)}</td>
                                                <td>
                                                    <Badge variant="outline">
                                                        {placeholder(item.market)}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td>
                                                    <div className="ams__row-actions">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="xs"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <Edit3 className="size-3" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="xs"
                                                            disabled
                                                            onClick={() => handleDelete(item.symbol)}
                                                        >
                                                            <Trash2 className="size-3" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <DataTablePagination
                            page={tablePage}
                            totalPages={totalPages}
                            from={(tablePage - 1) * rowsPerPage + 1}
                            to={Math.min(tablePage * rowsPerPage, sortedItems.length)}
                            total={sortedItems.length}
                            onPageChange={setTablePage}
                        />
                    </>
                )}
            </section>

            {/* Modals */}
            <AddStockModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={loadData}
            />
            <EditStockModal
                open={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false)
                    setEditingStock(null)
                }}
                onSuccess={loadData}
                stock={editingStock}
            />
        </div>
    )
}