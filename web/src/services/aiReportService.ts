import axios from "axios"
import { buildAuthHeaders, getCurrentAccessToken } from "@/services/auth.service"
import type { AnalyseOneRequest, AnalyseOneResponse } from "@/types/aiReport"
import { AnalyseServiceError } from "@/types/aiReport"
import type {
    AiReportHistoryDetailResponse,
    AiReportHistoryListResponse,
    AiReportHistoryQueryParams,
} from "@/types/aiReportHistory"
import { AiReportHistoryServiceError } from "@/types/aiReportHistory"

const ANALYSE_PATH = "/api/ai-reports/analyse-one"
const HISTORY_PATH = "/api/ai-reports/history"
const DEFAULT_ANALYSE_API_BASE_URL = "http://localhost:5100"
const DEFAULT_ANALYSE_API_TIMEOUT_MS = 300_000

function normalizeBaseUrl(value?: string) {
    const trimmed = value?.trim()
    if (!trimmed) return DEFAULT_ANALYSE_API_BASE_URL
    return trimmed.replace(/\/+$/, "")
}

function normalizeTimeoutMs(value?: string) {
    const parsedValue = Number(value)
    if (!Number.isFinite(parsedValue) || parsedValue < DEFAULT_ANALYSE_API_TIMEOUT_MS) {
        return DEFAULT_ANALYSE_API_TIMEOUT_MS
    }

    return Math.trunc(parsedValue)
}

export function getAnalyseApiBaseUrl() {
    return normalizeBaseUrl(import.meta.env.VITE_ANALYSE_API_BASE_URL)
}

export function getAnalyseApiTimeoutMs() {
    return normalizeTimeoutMs(import.meta.env.VITE_ANALYSE_API_TIMEOUT_MS)
}

export function getAnalyseOneUrl() {
    return `${getAnalyseApiBaseUrl()}${ANALYSE_PATH}`
}

export function getAiReportHistoryUrl(historyId?: string) {
    const baseUrl = `${getAnalyseApiBaseUrl()}${HISTORY_PATH}`
    return historyId ? `${baseUrl}/${encodeURIComponent(historyId)}` : baseUrl
}

function isSuccessCode(code?: number) {
    return code === undefined || code === 0 || code === 200 || code === 201
}

function getApiMessage(payload: AnalyseOneResponse | undefined) {
    return payload?.message?.trim() || "Không thể tạo báo cáo phân tích."
}

function getHistoryApiMessage(
    payload: AiReportHistoryListResponse | AiReportHistoryDetailResponse | undefined,
    fallback: string
) {
    return payload?.message?.trim() || fallback
}

function normalizePageNumber(value: unknown, fallback: number) {
    const nextValue = Number(value)
    return Number.isFinite(nextValue) && nextValue > 0 ? Math.trunc(nextValue) : fallback
}

function normalizeLimitNumber(value: unknown, fallback: number) {
    const nextValue = Number(value)
    return Number.isFinite(nextValue) && nextValue > 0 ? Math.trunc(nextValue) : fallback
}

function normalizeTotalNumber(value: unknown, fallback: number) {
    const nextValue = Number(value)
    return Number.isFinite(nextValue) && nextValue >= 0 ? Math.trunc(nextValue) : fallback
}

function normalizeHistoryListResponse(
    payload: AiReportHistoryListResponse,
    params?: AiReportHistoryQueryParams
): AiReportHistoryListResponse {
    const data = payload.data
    const items = Array.isArray(data?.items) ? data.items : []
    const page = normalizePageNumber(data?.page, params?.page ?? 1)
    const limit = normalizeLimitNumber(data?.limit, params?.limit ?? 20)
    const total = normalizeTotalNumber(data?.total, items.length)

    return {
        code: payload.code ?? 200,
        message: payload.message ?? "OK",
        data: {
            items,
            page,
            limit,
            total,
        },
    }
}

function buildHistorySearchParams(params?: AiReportHistoryQueryParams) {
    const searchParams = new URLSearchParams()
    const page = params?.page ?? 1
    const limit = params?.limit ?? 20

    searchParams.set("page", String(page))
    searchParams.set("limit", String(limit))

    const appendTrimmed = (key: string, value?: string) => {
        const trimmed = value?.trim()
        if (trimmed) searchParams.set(key, trimmed)
    }

    appendTrimmed("symbol", params?.symbol)
    appendTrimmed("exchange", params?.exchange)
    appendTrimmed("provider", params?.provider)
    appendTrimmed("model", params?.model)
    appendTrimmed("from_date", params?.fromDate)
    appendTrimmed("to_date", params?.toDate)

    return searchParams
}

function getHistoryHttpMessage(status: number, action: "list" | "detail" | "delete") {
    if (status === 401) {
        return "Phiên đăng nhập đã hết hạn hoặc token không hợp lệ. Hãy đăng nhập lại."
    }

    if (status === 503) {
        return "Tính năng lịch sử báo cáo AI chưa được bật hoặc SQL Server chưa cấu hình."
    }

    if (status === 404 && action === "detail") {
        return "Không tìm thấy báo cáo hoặc bạn không có quyền truy cập."
    }

    if (action === "delete") {
        return "Không xóa được báo cáo. Vui lòng thử lại."
    }

    return action === "detail"
        ? "Không tải được báo cáo cũ. Vui lòng thử lại."
        : "Không tải được lịch sử báo cáo. Hãy kiểm tra analyse service đã chạy ở http://localhost:5100 chưa."
}

function getHistoryErrorKind(status: number) {
    if (status === 401) return "unauthorized"
    if (status === 404) return "not_found"
    if (status === 503) return "history_disabled"
    return "http"
}

function buildMissingHistoryTokenError(url: string, method: string) {
    return new AiReportHistoryServiceError(
        "Bạn cần đăng nhập để xem lịch sử báo cáo AI.",
        "auth_required",
        {
            url,
            method,
            hasAuthorizationHeader: false,
            message: "Missing auth token",
        }
    )
}

function handleHistoryUnknownError(
    error: unknown,
    url: string,
    method: string,
    action: "list" | "detail" | "delete",
    signal?: AbortSignal
): never {
    if (error instanceof AiReportHistoryServiceError) {
        throw error
    }

    if (axios.isCancel(error) || signal?.aborted) {
        throw new AiReportHistoryServiceError(
            action === "detail" ? "Yêu cầu tải báo cáo cũ đã được hủy." : "Yêu cầu tải lịch sử báo cáo đã được hủy.",
            "cancelled",
            {
                url,
                method,
                hasAuthorizationHeader: true,
                message: error instanceof Error ? error.message : "Request cancelled",
                stack: error instanceof Error ? error.stack : undefined,
            },
            error
        )
    }

    if (axios.isAxiosError(error)) {
        const isTimeout = error.code === "ECONNABORTED"
        const hasResponse = Boolean(error.response)
        const status = error.response?.status
        const message = isTimeout
            ? "Yêu cầu lịch sử báo cáo quá thời gian chờ."
            : status
              ? getHistoryHttpMessage(status, action)
              : hasResponse
              ? getHistoryHttpMessage(status ?? 0, action)
              : action === "delete"
              ? "Không xóa được báo cáo. Vui lòng thử lại."
              : "Không tải được lịch sử báo cáo. Hãy kiểm tra analyse service đã chạy ở http://localhost:5100 chưa."

        throw new AiReportHistoryServiceError(
            message,
            isTimeout ? "timeout" : status ? getHistoryErrorKind(status) : hasResponse ? "http" : "network",
            {
                httpStatus: status,
                url,
                method,
                hasAuthorizationHeader: true,
                response: error.response?.data,
                message: error.message,
                stack: error.stack,
            },
            error
        )
    }

    throw new AiReportHistoryServiceError(
        action === "delete"
            ? "Không xóa được báo cáo. Vui lòng thử lại."
            : "Đã xảy ra lỗi không xác định khi tải lịch sử báo cáo AI.",
        "unknown",
        {
            url,
            method,
            hasAuthorizationHeader: true,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        },
        error
    )
}

export async function analyseOneStock(
    request: AnalyseOneRequest,
    signal?: AbortSignal
): Promise<AnalyseOneResponse> {
    const url = getAnalyseOneUrl()
    const token = getCurrentAccessToken()

    if (!token) {
        throw new AnalyseServiceError(
            "Bạn cần đăng nhập để tải danh mục theo dõi và phân tích cổ phiếu.",
            "auth_required",
            {
                url,
                method: "POST",
                hasAuthorizationHeader: false,
                message: "Missing auth token",
            }
        )
    }

    try {
        const response = await axios.post<AnalyseOneResponse>(url, request, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...buildAuthHeaders(token),
            },
            signal,
            timeout: getAnalyseApiTimeoutMs(),
            validateStatus: () => true,
        })

        const payload = response.data

        if (response.status < 200 || response.status >= 300) {
            throw new AnalyseServiceError(
                response.status === 401
                    ? "Phiên đăng nhập không còn hợp lệ. Hãy đăng nhập lại hoặc kiểm tra quyền truy cập."
                    : "Không thể hoàn tất phân tích. Hãy kiểm tra mã cổ phiếu, provider/model hoặc thử lại.",
                response.status === 401 ? "unauthorized" : "http",
                {
                    httpStatus: response.status,
                    url,
                    method: "POST",
                    hasAuthorizationHeader: true,
                    response: payload,
                    message: getApiMessage(payload),
                }
            )
        }

        if (!isSuccessCode(payload?.code)) {
            throw new AnalyseServiceError(
                getApiMessage(payload),
                "api",
                {
                    httpStatus: response.status,
                    url,
                    method: "POST",
                    hasAuthorizationHeader: true,
                    response: payload,
                    message: getApiMessage(payload),
                }
            )
        }

        if (!payload?.data) {
            throw new AnalyseServiceError(
                "API phân tích không trả về phần dữ liệu báo cáo.",
                "api",
                {
                    httpStatus: response.status,
                    url,
                    method: "POST",
                    hasAuthorizationHeader: true,
                    response: payload,
                    message: getApiMessage(payload),
                }
            )
        }

        return payload
    } catch (error) {
        if (error instanceof AnalyseServiceError) {
            throw error
        }

        if (axios.isCancel(error) || signal?.aborted) {
            throw new AnalyseServiceError(
                "Yêu cầu phân tích đã được hủy.",
                "cancelled",
                {
                    url,
                    method: "POST",
                    hasAuthorizationHeader: true,
                    message: error instanceof Error ? error.message : "Request cancelled",
                    stack: error instanceof Error ? error.stack : undefined,
                },
                error
            )
        }

        if (axios.isAxiosError(error)) {
            const isTimeout = error.code === "ECONNABORTED"
            const hasResponse = Boolean(error.response)

            throw new AnalyseServiceError(
                isTimeout
                    ? "Phân tích mất nhiều thời gian hơn dự kiến. Bạn có thể thử lại hoặc giảm phạm vi thu thập dữ liệu."
                    : error.response?.status === 401
                      ? "Phiên đăng nhập không còn hợp lệ. Hãy đăng nhập lại hoặc kiểm tra quyền truy cập."
                      : hasResponse
                      ? "Không thể hoàn tất phân tích. Hãy kiểm tra provider/model hoặc mã cổ phiếu."
                      : "Không kết nối được hệ thống phân tích. Hãy kiểm tra tiến trình analyse đang chạy ở http://localhost:5100.",
                isTimeout ? "timeout" : error.response?.status === 401 ? "unauthorized" : hasResponse ? "http" : "network",
                {
                    httpStatus: error.response?.status,
                    url,
                    method: "POST",
                    hasAuthorizationHeader: true,
                    response: error.response?.data,
                    message: error.message,
                    stack: error.stack,
                },
                error
            )
        }

        throw new AnalyseServiceError(
            "Đã xảy ra lỗi không xác định khi gọi dịch vụ phân tích.",
            "unknown",
            {
                url,
                method: "POST",
                hasAuthorizationHeader: true,
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            },
            error
        )
    }
}

export async function getAiReportHistories(
    params?: AiReportHistoryQueryParams,
    signal?: AbortSignal
): Promise<AiReportHistoryListResponse> {
    const searchParams = buildHistorySearchParams(params)
    const url = `${getAiReportHistoryUrl()}?${searchParams.toString()}`
    const token = getCurrentAccessToken()

    if (!token) {
        throw buildMissingHistoryTokenError(url, "GET")
    }

    try {
        const response = await axios.get<AiReportHistoryListResponse>(url, {
            headers: {
                Accept: "application/json",
                ...buildAuthHeaders(token),
            },
            signal,
            timeout: getAnalyseApiTimeoutMs(),
            validateStatus: () => true,
        })

        const payload = response.data

        if (response.status < 200 || response.status >= 300) {
            throw new AiReportHistoryServiceError(
                getHistoryHttpMessage(response.status, "list"),
                getHistoryErrorKind(response.status),
                {
                    httpStatus: response.status,
                    url,
                    method: "GET",
                    hasAuthorizationHeader: true,
                    response: payload,
                    message: getHistoryApiMessage(payload, getHistoryHttpMessage(response.status, "list")),
                }
            )
        }

        if (!isSuccessCode(payload?.code)) {
            throw new AiReportHistoryServiceError(
                getHistoryApiMessage(payload, "Không tải được lịch sử báo cáo."),
                "api",
                {
                    httpStatus: response.status,
                    url,
                    method: "GET",
                    hasAuthorizationHeader: true,
                    response: payload,
                    message: getHistoryApiMessage(payload, "Không tải được lịch sử báo cáo."),
                }
            )
        }

        return normalizeHistoryListResponse(payload, params)
    } catch (error) {
        handleHistoryUnknownError(error, url, "GET", "list", signal)
    }
}

export async function getAiReportHistoryDetail(
    historyId: string,
    signal?: AbortSignal
): Promise<AiReportHistoryDetailResponse> {
    const url = getAiReportHistoryUrl(historyId)
    const token = getCurrentAccessToken()

    if (!token) {
        throw buildMissingHistoryTokenError(url, "GET")
    }

    try {
        const response = await axios.get<AiReportHistoryDetailResponse>(url, {
            headers: {
                Accept: "application/json",
                ...buildAuthHeaders(token),
            },
            signal,
            timeout: getAnalyseApiTimeoutMs(),
            validateStatus: () => true,
        })

        const payload = response.data

        if (response.status < 200 || response.status >= 300) {
            throw new AiReportHistoryServiceError(
                getHistoryHttpMessage(response.status, "detail"),
                getHistoryErrorKind(response.status),
                {
                    httpStatus: response.status,
                    url,
                    method: "GET",
                    hasAuthorizationHeader: true,
                    response: payload,
                    message: getHistoryApiMessage(payload, getHistoryHttpMessage(response.status, "detail")),
                }
            )
        }

        if (!isSuccessCode(payload?.code)) {
            throw new AiReportHistoryServiceError(
                getHistoryApiMessage(payload, "Không tải được báo cáo cũ."),
                "api",
                {
                    httpStatus: response.status,
                    url,
                    method: "GET",
                    hasAuthorizationHeader: true,
                    response: payload,
                    message: getHistoryApiMessage(payload, "Không tải được báo cáo cũ."),
                }
            )
        }

        if (!payload?.data?.report_json) {
            throw new AiReportHistoryServiceError(
                "Không tìm thấy dữ liệu báo cáo cũ.",
                "api",
                {
                    httpStatus: response.status,
                    url,
                    method: "GET",
                    hasAuthorizationHeader: true,
                    response: payload,
                    message: getHistoryApiMessage(payload, "Không tìm thấy dữ liệu báo cáo cũ."),
                }
            )
        }

        return payload
    } catch (error) {
        handleHistoryUnknownError(error, url, "GET", "detail", signal)
    }
}

export async function deleteAiReportHistory(historyId: string, signal?: AbortSignal): Promise<void> {
    const url = getAiReportHistoryUrl(historyId)
    const token = getCurrentAccessToken()

    if (!token) {
        throw buildMissingHistoryTokenError(url, "DELETE")
    }

    try {
        const response = await axios.delete<AiReportHistoryDetailResponse>(url, {
            headers: {
                Accept: "application/json",
                ...buildAuthHeaders(token),
            },
            signal,
            timeout: getAnalyseApiTimeoutMs(),
            validateStatus: () => true,
        })

        const payload = response.data

        if (response.status < 200 || response.status >= 300) {
            throw new AiReportHistoryServiceError(
                getHistoryHttpMessage(response.status, "delete"),
                getHistoryErrorKind(response.status),
                {
                    httpStatus: response.status,
                    url,
                    method: "DELETE",
                    hasAuthorizationHeader: true,
                    response: payload,
                    message: getHistoryApiMessage(payload, getHistoryHttpMessage(response.status, "delete")),
                }
            )
        }

        if (payload && !isSuccessCode(payload.code)) {
            throw new AiReportHistoryServiceError(
                getHistoryApiMessage(payload, "Không xóa được báo cáo. Vui lòng thử lại."),
                "api",
                {
                    httpStatus: response.status,
                    url,
                    method: "DELETE",
                    hasAuthorizationHeader: true,
                    response: payload,
                    message: getHistoryApiMessage(payload, "Không xóa được báo cáo. Vui lòng thử lại."),
                }
            )
        }
    } catch (error) {
        handleHistoryUnknownError(error, url, "DELETE", "delete", signal)
    }
}
