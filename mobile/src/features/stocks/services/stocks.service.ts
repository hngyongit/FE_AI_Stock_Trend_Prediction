import { createApiClient } from '@/shared/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import type {
  StockChartRange,
  StockChartResponse,
  StockListItem,
  StockListResponse,
} from '@/features/stocks/types';

export async function fetchStockChart(
  symbol: string,
  range: StockChartRange,
): Promise<StockChartResponse> {
  const token = useAuthStore.getState().session?.accessToken;
  const apiClient = createApiClient();

  const response = await apiClient.get<StockChartResponse>(
    `/api/stocks/${encodeURIComponent(symbol)}/chart`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      params: { range },
    },
  );

  if (response.status >= 400 || response.data.success === false) {
    throw new Error(response.data.message ?? 'Could not load chart data');
  }

  return response.data;
}

type StockListApiEnvelope = {
  success?: boolean;
  message?: string;
  data?: unknown;
  items?: unknown;
  stocks?: unknown;
  total?: number;
  pagination?: {
    total?: number;
  };
  meta?: {
    total?: number;
    lastUpdated?: string;
    source?: string;
  };
  source?: string;
  lastUpdated?: string;
};

type FetchStocksParams = {
  keyword?: string;
  market?: string;
  page?: number;
  limit?: number;
};

function firstValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = Number(value.replace(/,/g, ''));

    if (Number.isFinite(normalized)) {
      return normalized;
    }
  }

  return null;
}

function toText(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function stockListArrayFromPayload(payload: StockListApiEnvelope | unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const response = payload as StockListApiEnvelope;

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.stocks)) {
    return response.stocks;
  }

  if (response.data && typeof response.data === 'object') {
    const nested = response.data as StockListApiEnvelope;

    if (Array.isArray(nested.data)) {
      return nested.data;
    }

    if (Array.isArray(nested.items)) {
      return nested.items;
    }

    if (Array.isArray(nested.stocks)) {
      return nested.stocks;
    }
  }

  return [];
}

function stockListMetaFromPayload(
  payload: StockListApiEnvelope | unknown,
): StockListResponse['meta'] {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const response = payload as StockListApiEnvelope;
  const nested =
    response.data && typeof response.data === 'object' && !Array.isArray(response.data)
      ? (response.data as StockListApiEnvelope)
      : {};

  return {
    total:
      response.meta?.total ??
      response.total ??
      response.pagination?.total ??
      nested.meta?.total ??
      nested.total ??
      nested.pagination?.total,
    lastUpdated:
      response.meta?.lastUpdated ??
      response.lastUpdated ??
      nested.meta?.lastUpdated ??
      nested.lastUpdated,
    source: response.meta?.source ?? response.source ?? nested.meta?.source ?? nested.source,
  };
}

function mapStockItem(item: unknown): StockListItem | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as Record<string, unknown>;
  const symbol = toText(firstValue(record, ['symbol', 'ticker', 'code']));

  if (!symbol) {
    return null;
  }

  return {
    symbol,
    companyName: toText(
      firstValue(record, ['companyName', 'company_name', 'name', 'fullName', 'full_name']),
    ),
    market: toText(firstValue(record, ['market', 'exchange'])),
    industry: toText(firstValue(record, ['industry', 'industryName', 'industry_name'])),
    sector: toText(firstValue(record, ['sector', 'sectorName', 'sector_name'])),
    status: toText(firstValue(record, ['status', 'stockStatus', 'stock_status'])),
    latestClosePrice: toNumber(
      firstValue(record, ['latestClosePrice', 'latest_close_price', 'close', 'price', 'latestPrice']),
    ),
    change: toNumber(firstValue(record, ['change', 'delta', 'priceChange'])),
    changePercent: toNumber(
      firstValue(record, ['changePercent', 'change_percent', 'pctChange', 'percentChange']),
    ),
    volume: toNumber(firstValue(record, ['volume', 'latestVolume', 'latest_volume'])),
    marketCap: toNumber(firstValue(record, ['marketCap', 'market_cap', 'capitalization'])),
    lastUpdated: toText(
      firstValue(record, ['lastUpdated', 'last_updated', 'updatedAt', 'updated_at', 'date']),
    ),
    source: toText(firstValue(record, ['source', 'provider'])),
    dataStatus: toText(firstValue(record, ['dataStatus', 'data_status', 'qualityStatus', 'quality_status'])),
  };
}

export async function fetchStocks(params: FetchStocksParams = {}): Promise<StockListResponse> {
  const token = useAuthStore.getState().session?.accessToken;
  const apiClient = createApiClient();
  const response = await apiClient.get<StockListApiEnvelope | unknown[]>('/api/stocks', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    params: {
      keyword: params.keyword?.trim() || undefined,
      limit: params.limit ?? 20,
      market: params.market?.trim() || undefined,
      page: params.page ?? 1,
    },
  });

  const payload = response.data;
  const message =
    !Array.isArray(payload) && payload && typeof payload === 'object'
      ? (payload as StockListApiEnvelope).message
      : undefined;

  if (
    response.status >= 400 ||
    (!Array.isArray(payload) &&
      payload &&
      typeof payload === 'object' &&
      (payload as StockListApiEnvelope).success === false)
  ) {
    throw new Error(message ?? 'Could not load stocks');
  }

  return {
    data: stockListArrayFromPayload(payload)
      .map(mapStockItem)
      .filter((item): item is StockListItem => Boolean(item)),
    meta: stockListMetaFromPayload(payload),
    message,
    success: true,
  };
}
