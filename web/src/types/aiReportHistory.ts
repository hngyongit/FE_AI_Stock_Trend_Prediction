import type { AnalyseTechnicalDetails } from "@/types/aiReport"

export type AiReportHistoryListItem = {
    id: string
    history_id?: string
    report_id: string
    symbol: string
    exchange: string
    company?: string | null
    provider: string
    model: string
    total_score?: number | null
    risk_score?: number | null
    data_confidence?: number | null
    decision_label?: string | null
    created_at: string
}

export type AiReportHistoryListResponse = {
    code: number
    message: string
    data: {
        items: AiReportHistoryListItem[]
        page: number
        limit: number
        total: number
    }
}

export type AiReportHistoryDetailResponse = {
    code: number
    message: string
    data: {
        id: string
        report_id: string
        report_json: unknown
    }
}

export type AiReportHistoryQueryParams = {
    page?: number
    limit?: number
    symbol?: string
    exchange?: string
    provider?: string
    model?: string
    fromDate?: string
    toDate?: string
}

export type AiReportHistoryServiceErrorKind =
    | "network"
    | "timeout"
    | "http"
    | "api"
    | "auth_required"
    | "unauthorized"
    | "not_found"
    | "history_disabled"
    | "cancelled"
    | "unknown"

export class AiReportHistoryServiceError extends Error {
    kind: AiReportHistoryServiceErrorKind
    technicalDetails: AnalyseTechnicalDetails

    constructor(
        message: string,
        kind: AiReportHistoryServiceErrorKind,
        technicalDetails: AnalyseTechnicalDetails,
        cause?: unknown
    ) {
        super(message, { cause })
        this.name = "AiReportHistoryServiceError"
        this.kind = kind
        this.technicalDetails = technicalDetails
    }
}
