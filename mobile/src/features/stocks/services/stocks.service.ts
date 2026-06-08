import { createApiClient } from '@/shared/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import type {
  StockChartRange,
  StockChartResponse,
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
