import { useEffect, useMemo, useState } from "react"
import { Eye, Lock, RefreshCw, Unlock } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DataTablePagination,
  SearchInput,
  StatusBadge,
  TableEmpty,
  TableError,
  TableLoading,
  TableNoMatch,
  placeholder,
} from "@/shared/components"
import {
  getUsers,
  lockUser,
  unlockUser,
  updateUserRole,
  type AdminUser,
  type GetUsersParams,
  type UserRole,
  type UserStatus,
} from "@/services/admin.service"

import "../AdminUserManagement/AdminUserManagement.css"

const STATUS_OPTIONS: UserStatus[] = ["ACTIVE", "LOCKED", "INACTIVE", "DEACTIVATED"]
const STAFF_ROLE_OPTIONS: UserRole[] = ["STAFF", "USER"]

export default function AdminStaffManagement() {
  const [params, setParams] = useState<GetUsersParams>({ page: 1, limit: 25, role: "STAFF" })
  const [items, setItems] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState<{ page: number; limit: number; total_items: number; total_pages: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("")
  const [updatingIds, setUpdatingIds] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getUsers({
        page: params.page,
        limit: params.limit,
        keyword: params.keyword,
        role: "STAFF",
        status: params.status,
      })

      setItems(result.items || [])

      if (result.pagination) {
        setPagination({
          page: result.pagination.page ?? 1,
          limit: result.pagination.limit ?? params.limit ?? 25,
          total_items: result.pagination.total_items ?? 0,
          total_pages: result.pagination.total_pages ?? 1,
        })
      } else {
        setPagination({
          page: params.page ?? 1,
          limit: params.limit ?? 25,
          total_items: result.items?.length ?? 0,
          total_pages: 1,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [params])

  const handleSearch = (value: string) => {
    setSearchText(value)
    setParams((current) => ({ ...current, keyword: value, page: 1, role: "STAFF" }))
  }

  const handleStatusFilter = (value: UserStatus | "") => {
    setStatusFilter(value)
    setParams((current) => ({ ...current, status: value, page: 1, role: "STAFF" }))
  }

  const handlePageChange = (page: number) => {
    setParams((current) => ({ ...current, page, role: "STAFF" }))
  }

  const clearFilters = () => {
    setSearchText("")
    setStatusFilter("")
    setParams((current) => ({ ...current, page: 1, keyword: "", status: "", role: "STAFF" }))
  }

  const setUpdating = (id: string, updating: boolean) => {
    setUpdatingIds((prev) => (updating ? [...prev, id] : prev.filter((item) => item !== id)))
  }

  const toggleLock = async (user: AdminUser) => {
    setUpdating(user.id, true)
    try {
      if (user.status === "LOCKED") {
        await unlockUser(user.id)
      } else {
        await lockUser(user.id)
      }

      setItems((prev) => prev.map((item) => (
        item.id === user.id
          ? { ...item, status: item.status === "LOCKED" ? "ACTIVE" : "LOCKED" }
          : item
      )))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUpdating(user.id, false)
    }
  }

  const changeRole = async (user: AdminUser, role: UserRole) => {
    setUpdating(user.id, true)
    try {
      await updateUserRole(user.id, role)
      setItems((prev) => prev.filter((item) => item.id !== user.id))
      setPagination((prev) => prev ? {
        ...prev,
        total_items: Math.max(0, prev.total_items - (role === "STAFF" ? 0 : 1)),
      } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUpdating(user.id, false)
    }
  }

  const total = pagination?.total_items ?? items.length
  const page = pagination?.page ?? params.page ?? 1
  const totalPages = Math.max(1, pagination?.total_pages ?? Math.ceil((total || 1) / (params.limit ?? 25)))
  const from = total === 0 ? 0 : (page - 1) * (pagination?.limit ?? params.limit ?? 25) + 1
  const to = Math.min(page * (pagination?.limit ?? params.limit ?? 25), total)

  const activeStaffCount = useMemo(
    () => items.filter((user) => user.status === "ACTIVE").length,
    [items],
  )
  const lockedStaffCount = useMemo(
    () => items.filter((user) => user.status === "LOCKED").length,
    [items],
  )

  const hasFilters = Boolean(searchText.trim() || statusFilter)

  return (
    <div className="ams">
      <div className="ams__breadcrumb">Admin / Staff Management</div>

      <section className="ams__header">
        <div>
          <h1>Staff Management</h1>
          <p>Manage operations staff accounts, access state, and staff role assignments.</p>
        </div>
        <div className="ams__header-status">
          <div className="ams__stat-card">
            <div className="ams__stat-icon">S</div>
            <div>
              <span className="ams__stat-label">Total Staff</span>
              <span className="ams__stat-value">{total || "--"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ams__summary-grid">
        {[
          ["Visible staff", items.length],
          ["Active staff", activeStaffCount],
          ["Locked staff", lockedStaffCount],
        ].map(([label, value]) => (
          <div key={label} className="ams__summary-card">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section className="ams__controls">
        <SearchInput value={searchText} onChange={handleSearch} placeholder="Search staff by name or email" />

        <select value="STAFF" className="ams__select" disabled>
          <option value="STAFF">STAFF only</option>
        </select>

        <select value={statusFilter} className="ams__select" onChange={(event) => handleStatusFilter(event.target.value as UserStatus | "")}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <div className="ams__actions">
          <Button type="button" variant="outline" size="sm" onClick={() => void loadData()} disabled={isLoading}>
            <RefreshCw className="size-3.5" /> Refresh
          </Button>
        </div>
      </section>

      <section className="ams__table-card">
        {isLoading ? (
          <TableLoading />
        ) : error ? (
          <TableError message={error} onRetry={() => void loadData()} />
        ) : !items.length && hasFilters ? (
          <TableNoMatch onClear={clearFilters} />
        ) : !items.length ? (
          <TableEmpty message="No staff users found." />
        ) : (
          <>
            <div className="ams__table-wrap">
              <table className="ams__table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verification</th>
                    <th>Last Update</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((user) => (
                    <tr key={user.id}>
                      <td>{placeholder(user.full_name)}</td>
                      <td>{placeholder(user.email)}</td>
                      <td>
                        <select
                          value={user.role}
                          className="ams__table-select"
                          onChange={(event) => void changeRole(user, event.target.value as UserRole)}
                          disabled={updatingIds.includes(user.id)}
                        >
                          {STAFF_ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={user.email ? "user-verified user-verified--yes" : "user-verified user-verified--no"}>
                          {user.email ? "VERIFIED" : "UNVERIFIED"}
                        </span>
                      </td>
                      <td>{user.updated_at ? new Date(user.updated_at).toISOString().slice(0, 19).replace("T", " ") : "-"}</td>
                      <td><StatusBadge status={user.status} /></td>
                      <td>
                        <div className="ams__row-actions">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setSelectedUser(user)}
                            disabled={updatingIds.includes(user.id)}
                          >
                            <Eye className="size-3" />
                            View
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => void toggleLock(user)}
                            disabled={updatingIds.includes(user.id)}
                          >
                            {user.status === "LOCKED" ? <Unlock className="size-3" /> : <Lock className="size-3" />}
                            {user.status === "LOCKED" ? "Unlock" : "Lock"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DataTablePagination
              page={page}
              totalPages={totalPages}
              from={from}
              to={to}
              total={total}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="ams-modal">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="ams-modal__body">
              <div className="ams-modal__field">
                <label className="ams-modal__label">Full Name</label>
                <div className="ams-modal__input">{selectedUser.full_name || "-"}</div>
              </div>
              <div className="ams-modal__field">
                <label className="ams-modal__label">Email</label>
                <div className="ams-modal__input">{selectedUser.email || "-"}</div>
              </div>
              <div className="ams-modal__row">
                <div className="ams-modal__field">
                  <label className="ams-modal__label">Role</label>
                  <div className="ams-modal__input">{selectedUser.role}</div>
                </div>
                <div className="ams-modal__field">
                  <label className="ams-modal__label">Status</label>
                  <div className="ams-modal__input">{selectedUser.status}</div>
                </div>
              </div>
              <div className="ams-modal__row">
                <div className="ams-modal__field">
                  <label className="ams-modal__label">Created At</label>
                  <div className="ams-modal__input">
                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : "-"}
                  </div>
                </div>
                <div className="ams-modal__field">
                  <label className="ams-modal__label">Updated At</label>
                  <div className="ams-modal__input">
                    {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleString() : "-"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
