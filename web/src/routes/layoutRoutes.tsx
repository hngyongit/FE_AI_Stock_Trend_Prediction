import type { ReactElement } from "react"
import { Navigate } from "react-router-dom"

import AlertsPage from "@/pages/AlertsPage"
import ComparisonPage from "@/pages/ComparisonPage"
import HistoricalAnalysisPage from "@/pages/HistoricalAnalysisPage"
import SettingsPage from "@/pages/SettingsPage"
import StockDetailPage from "@/pages/StockDetailPage/StockDetailPage"
import StockListPage from "@/pages/StockListPage/StockListPage"
import UserDashboard from "@/pages/UserDashboard/UserDashboard"
import WatchlistPage from "@/pages/WatchlistPage/WatchList"
import UserProfilePage from "@/pages/UserProfilePage/UserProfilePage"
import CrawlJobsPage from "@/pages/CrawlJobsPage"
import StaffDashboardPage from "@/pages/StaffDashboardPage"
import DataSourcesPage from "@/pages/DataSourcesPage"
import CrawlLogsPage from "@/pages/CrawlLogsPage"
import EtlMonitorPage from "@/pages/EtlMonitorPage"
import DataValidationPage from "@/pages/DataValidationPage"
import ImportHistoryPage from "@/pages/ImportHistoryPage"
import StockDataMonitorPage from "@/pages/StockDataMonitorPage"

export type LayoutRoute = {
    path: string
    element: ReactElement
}

export const USER_ROUTES: LayoutRoute[] = [
    { path: "/dashboard", element: <UserDashboard /> },
    { path: "/profile", element: <UserProfilePage /> },
    { path: "/stocks", element: <StockDetailPage /> },
    { path: "/stocks/:symbol", element: <StockDetailPage /> },
    { path: "/stock-list", element: <StockListPage /> },
    { path: "/stock-analysis", element: <Navigate to="/stock-list" replace /> },
    { path: "/watchlist", element: <WatchlistPage /> },
    { path: "/alerts", element: <AlertsPage /> },
    { path: "/historical-analysis", element: <HistoricalAnalysisPage /> },
    { path: "/comparison", element: <ComparisonPage /> },
    { path: "/settings", element: <SettingsPage /> },
]

export const STAFF_ROUTES: LayoutRoute[] = [
    { path: "/staff", element: <Navigate to="/staff/crawl-jobs" replace /> },
    { path: "/staff/dashboard", element: <StaffDashboardPage /> },
    { path: "/staff/profile", element: <UserProfilePage /> },
    { path: "/staff/data-sources", element: <DataSourcesPage /> },
    { path: "/staff/crawl-jobs", element: <CrawlJobsPage /> },
    { path: "/staff/crawl-logs", element: <CrawlLogsPage /> },
    { path: "/staff/etl-monitor", element: <EtlMonitorPage /> },
    { path: "/staff/data-validation", element: <DataValidationPage /> },
    { path: "/staff/import-history", element: <ImportHistoryPage /> },
    { path: "/staff/stock-data-monitor", element: <StockDataMonitorPage /> },
    { path: "/staff/settings", element: <SettingsPage /> },
]
