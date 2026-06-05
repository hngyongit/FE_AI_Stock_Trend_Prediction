import { authenticatedRequest } from "@/services/auth.service"

export type UserRole = "ADMIN" | "STAFF" | "USER"
export type UserStatus = "ACTIVE" | "LOCKED" | "INACTIVE" | "DEACTIVATED"

export interface ApiResponse<T = unknown> {
  success?: boolean
  message?: string
  data?: T
}

export interface AdminUser {
  id: string
  full_name: string
  email: string
  role: UserRole
  status: UserStatus
  created_at?: string
  updated_at?: string
}

export interface Pagination {
  page?: number
  limit?: number
  total_items?: number
  total_pages?: number
}

export interface UserListData {
  items: AdminUser[]
  pagination?: Pagination
}

export interface GetUsersParams {
  page?: number
  limit?: number
  keyword?: string
  role?: UserRole | ""
  status?: UserStatus | ""
}

export interface UpdateUserRoleRequest {
  role: UserRole
}

export async function getUsers(params?: GetUsersParams): Promise<UserListData> {
    const cleanParams: GetUsersParams = {
        page: params?.page ?? 1,
        limit: params?.limit ?? 25,
    }

    if (params?.keyword && params.keyword.trim() !== "") {
        cleanParams.keyword = params.keyword.trim()
    }

    if (params?.role) {
        cleanParams.role = params.role
    }

    if (params?.status) {
        cleanParams.status = params.status
    }

    const response = await authenticatedRequest<ApiResponse<UserListData>>({
        url: "/api/admin/users",
        method: "GET",
        params: cleanParams,
    })

    const payload = response.data

    if (response.status < 200 || response.status >= 300 || payload?.success === false || !payload?.data) {
        throw new Error(payload?.message || "Unable to load users")
    }

    return payload.data
}

export async function getUserDetail(id: string): Promise<AdminUser> {
  const response = await authenticatedRequest<ApiResponse<AdminUser>>({
    url: `/api/admin/users/${encodeURIComponent(id)}`,
    method: "GET",
  })

  const payload = response.data
  if (response.status < 200 || response.status >= 300 || payload?.success === false) {
    throw new Error(payload?.message || "Unable to load user detail")
  }

  return payload?.data as AdminUser
}

export async function lockUser(id: string): Promise<void> {
  const response = await authenticatedRequest<ApiResponse<null>>({
    url: `/api/admin/users/${encodeURIComponent(id)}/lock`,
    method: "PATCH",
    data: {},
  })

  const payload = response.data
  if (response.status < 200 || response.status >= 300 || payload?.success === false) {
    throw new Error(payload?.message || "Unable to lock user")
  }
}

export async function unlockUser(id: string): Promise<void> {
  const response = await authenticatedRequest<ApiResponse<null>>({
    url: `/api/admin/users/${encodeURIComponent(id)}/unlock`,
    method: "PATCH",
    data: {},
  })

  const payload = response.data
  if (response.status < 200 || response.status >= 300 || payload?.success === false) {
    throw new Error(payload?.message || "Unable to unlock user")
  }
}

export async function updateUserRole(id: string, role: UserRole): Promise<AdminUser> {
  const body: UpdateUserRoleRequest = { role }

  const response = await authenticatedRequest<ApiResponse<AdminUser>>({
    url: `/api/admin/users/${encodeURIComponent(id)}/role`,
    method: "PATCH",
    data: body,
  })

  const payload = response.data
  if (response.status < 200 || response.status >= 300 || payload?.success === false) {
    throw new Error(payload?.message || "Unable to update user role")
  }

  return payload?.data as AdminUser
}
