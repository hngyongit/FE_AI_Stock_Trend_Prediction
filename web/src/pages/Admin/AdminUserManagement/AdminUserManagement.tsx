import { useEffect, useState } from "react"
import { RefreshCw, Lock, Unlock } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DataTablePagination,
  SearchInput,
  TableLoading,
  TableError,
  TableEmpty,
  TableNoMatch,
  StatusBadge,
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

import "./AdminUserManagement.css"

const ROLE_OPTIONS: UserRole[] = ["ADMIN", "STAFF", "USER"]
const STATUS_OPTIONS: UserStatus[] = ["ACTIVE", "LOCKED", "INACTIVE", "DEACTIVATED"]

export default function AdminUserManagement() {
  const [params, setParams] = useState<GetUsersParams>({ page: 1, limit: 25 })
  const [items, setItems] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState<{ page: number; limit: number; total_items: number; total_pages: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchText, setSearchText] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("")
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("")

  const [updatingIds, setUpdatingIds] = useState<string[]>([])

    const loadData = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await getUsers({
                page: params.page,
                limit: params.limit,
                keyword: params.keyword,
                role: params.role,
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
    loadData()
  }, [params])

  const handleSearch = (value: string) => {
    setSearchText(value)
    setParams((p) => ({ ...p, keyword: value, page: 1 }))
  }

  const handleRoleFilter = (value: UserRole | "") => {
    setRoleFilter(value)
    setParams((p) => ({ ...p, role: value, page: 1 }))
  }

  const handleStatusFilter = (value: UserStatus | "") => {
    setStatusFilter(value)
    setParams((p) => ({ ...p, status: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setParams((p) => ({ ...p, page }))
  }

  const setUpdating = (id: string, updating: boolean) => {
    setUpdatingIds((prev) => (updating ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const toggleLock = async (user: AdminUser) => {
    const id = user.id
    setUpdating(id, true)
    try {
      if (user.status === "LOCKED") {
        await unlockUser(id)
      } else {
        await lockUser(id)
      }
      // optimistic update
      setItems((prev) => prev.map((u) => (u.id === id ? { ...u, status: u.status === "LOCKED" ? "ACTIVE" : "LOCKED" } : u)))
    } catch (err) {
      // failure – report via error state
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUpdating(id, false)
    }
  }

  const changeRole = async (user: AdminUser, role: UserRole) => {
    const id = user.id
    setUpdating(id, true)
    try {
      await updateUserRole(id, role)
      setItems((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUpdating(id, false)
    }
  }

  const total = pagination?.total_items ?? items.length
  const page = pagination?.page ?? params.page ?? 1
  const totalPages = Math.max(1, pagination?.total_pages ?? Math.ceil((total || 1) / (params.limit ?? 25)))
  const from = (page - 1) * (pagination?.limit ?? params.limit ?? 25) + 1
  const to = Math.min(page * (pagination?.limit ?? params.limit ?? 25), total)

  return (
    <div className="ams">
      <div className="ams__breadcrumb">Admin / User Management</div>

      <section className="ams__header">
        <div>
          <h1>User Management</h1>
          <p>View and manage platform users</p>
        </div>
              <div className="ams__header-status">
                  <div className="ams__stat-card">
                      <div className="ams__stat-icon">👥</div>
                      <div>
                          <span className="ams__stat-label">Total users</span>
                          <strong className="ams__stat-value">{total || "--"}</strong>
                      </div>
                  </div>
              </div>
      </section>

      <section className="ams__controls">
        <SearchInput value={searchText} onChange={handleSearch} placeholder="Search by name or email" />

        <select value={roleFilter} className="ams__select" onChange={(e) => handleRoleFilter(e.target.value as UserRole | "")}> 
          <option value="">All roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select value={statusFilter} className="ams__select" onChange={(e) => handleStatusFilter(e.target.value as UserStatus | "")}> 
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s || "_"} value={s}>{s || "ANY"}</option>
          ))}
        </select>

        <div className="ams__actions">
          <Button type="button" variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className="size-3.5" /> Refresh
          </Button>
          <Button type="button" size="sm" onClick={() => { /* TODO: open add user modal */ }}>
            + Add User
          </Button>
        </div>
      </section>

      <section className="ams__table-card">
        {isLoading ? (
          <TableLoading />
        ) : error ? (
          <TableError message={error} onRetry={loadData} />
        ) : !items.length ? (
          <TableEmpty message="No users found." />
        ) : !items.length ? (
          <TableNoMatch onClear={() => { setSearchText(""); setRoleFilter(""); setStatusFilter(""); setParams({ page: 1, limit: params.limit }) }} />
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
                    <th>Last Login</th>
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
                          onChange={(e) => changeRole(user, e.target.value as UserRole)}
                          disabled={updatingIds.includes(user.id)}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {/* verification placeholder */}
                        <span className={user.email ? "user-verified user-verified--yes" : "user-verified user-verified--no"}>
                          {user.email ? "VERIFIED" : "UNVERIFIED"}
                        </span>
                      </td>
                      <td>{user.updated_at ? new Date(user.updated_at).toISOString().slice(0, 19).replace("T", " ") : "-"}</td>
                      <td>
                        <StatusBadge status={user.status} />
                      </td>
                      <td>
                        <div className="ams__row-actions">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => toggleLock(user)}
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
    </div>
  )
}
