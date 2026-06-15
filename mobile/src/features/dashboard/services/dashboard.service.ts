import { createApiClient } from '@/shared/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import type { UserDashboardData, UserDashboardResponse } from '../types';

function isWrappedResponse(body: UserDashboardResponse): body is {
  success?: boolean;
  message?: string;
  data?: UserDashboardData;
} {
  return typeof body === 'object' && body !== null && 'data' in body;
}

export async function fetchUserDashboard(): Promise<UserDashboardData> {
  const token = useAuthStore.getState().session?.accessToken;
  const apiClient = createApiClient();

  const response = await apiClient.get('/api/dashboard/user', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const body = response.data as UserDashboardResponse;

  if (isWrappedResponse(body)) {
    if (body.success === false || !body.data) {
      throw new Error(body.message ?? 'Unable to load dashboard data.');
    }

    return body.data;
  }

  return body;
}
