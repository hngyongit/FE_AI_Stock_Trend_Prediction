import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createApiClient, getApiBaseUrl } from '@/shared/services/api.service';

export { getApiBaseUrl } from '@/shared/services/api.service';

export type AuthRole = 'USER' | 'STAFF' | 'ADMIN';

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  role: AuthRole;
  status: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

type LoginResponse = {
  success?: boolean;
  message?: string;
  data?: {
    access_token?: string;
    refresh_token?: string;
    user?: AuthUser;
  };
};

type MeResponse = {
  success?: boolean;
  message?: string;
  data?: AuthUser;
};

type RefreshTokenResponse = {
  success?: boolean;
  message?: string;
  data?: {
    access_token?: string;
  };
};

type StoredSessionShape = {
  accessToken: string;
  access_token: string;
  refreshToken: string;
  refresh_token: string;
  user: AuthUser;
};

const AUTH_STORAGE_KEY = 'auth';
const ACCESS_TOKEN_STORAGE_KEY = 'access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
const USER_STORAGE_KEY = 'user';

export function createAuthApiClient() {
  return createApiClient();
}

function buildFriendlyAuthError(message?: string) {
  const normalized = message?.trim();

  if (!normalized) {
    return 'Unable to sign in right now. Please try again.';
  }

  if (normalized === 'Invalid email or password') {
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  if (normalized === 'Account is locked') {
    return 'This account is locked. Please contact support for assistance.';
  }

  return normalized;
}

export function buildNetworkAuthError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Authentication is taking longer than expected. Please try again.';
    }

    if (!error.response) {
      return 'You appear to be offline. Check your connection and try again.';
    }

    if ((error.response.status ?? 0) >= 500) {
      return 'The server is unavailable right now. Please try again shortly.';
    }
  }

  return 'Unable to sign in right now. Please try again.';
}

export function isMobileAllowedRole(role: string) {
  return role === 'USER';
}

export function getRoleAccessMessage(role: string) {
  if (role === 'STAFF' || role === 'ADMIN') {
    return 'This account is managed through the web dashboard. Please sign in on the web platform.';
  }

  return 'Your account is not permitted to access the mobile dashboard.';
}

function toStoredSession(session: AuthSession): StoredSessionShape {
  return {
    accessToken: session.accessToken,
    access_token: session.accessToken,
    refreshToken: session.refreshToken,
    refresh_token: session.refreshToken,
    user: session.user,
  };
}

export async function persistRememberedSession(session: AuthSession) {
  const storedSession = JSON.stringify(toStoredSession(session));

  await AsyncStorage.multiSet([
    [AUTH_STORAGE_KEY, storedSession],
    [ACCESS_TOKEN_STORAGE_KEY, session.accessToken],
    [REFRESH_TOKEN_STORAGE_KEY, session.refreshToken],
    [USER_STORAGE_KEY, JSON.stringify(session.user)],
  ]);
}

export async function clearPersistedSession() {
  await AsyncStorage.multiRemove([
    AUTH_STORAGE_KEY,
    ACCESS_TOKEN_STORAGE_KEY,
    REFRESH_TOKEN_STORAGE_KEY,
    USER_STORAGE_KEY,
  ]);
}

export async function readPersistedSession() {
  const rawSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession) as Partial<StoredSessionShape>;

    if (
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.refreshToken !== 'string' ||
      !parsed.user
    ) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      user: parsed.user,
    } satisfies AuthSession;
  } catch {
    return null;
  }
}

export function decodeJwtPayload(token: string) {
  const [, payload] = token.split('.');

  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

    if (typeof globalThis.atob !== 'function') return null;

    return JSON.parse(globalThis.atob(padded)) as { exp?: number };
  } catch {
    return null;
  }
}

export function getJwtExpiry(token: string) {
  const payload = decodeJwtPayload(token);

  return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
}

export function isTokenExpired(token: string) {
  const expiry = getJwtExpiry(token);

  return expiry !== null && expiry <= Date.now();
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const apiClient = createAuthApiClient();
    const response = await apiClient.post('/api/auth/refresh-token', {
      refresh_token: refreshToken,
    });

    const payload = response.data as RefreshTokenResponse;
    const nextAccessToken = payload.data?.access_token;

    if (response.status < 200 || response.status >= 300 || payload.success === false || !nextAccessToken) {
      throw new Error(payload.message || 'Unable to refresh access token');
    }

    return nextAccessToken;
  } catch (error) {
    throw new Error(buildNetworkAuthError(error));
  }
}

export async function fetchCurrentUser(accessToken: string) {
  try {
    const apiClient = createAuthApiClient();
    const response = await apiClient.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = response.data as MeResponse;

    if (response.status < 200 || response.status >= 300 || payload.success === false || !payload.data) {
      throw new Error(payload.message || 'Unable to verify session');
    }

    return payload.data;
  } catch (error) {
    throw new Error(buildNetworkAuthError(error));
  }
}

export async function loginWithCredentials(credentials: LoginCredentials) {
  try {
    const apiClient = createAuthApiClient();
    const response = await apiClient.post('/api/auth/login', credentials);
    const payload = response.data as LoginResponse;

    const accessToken = payload.data?.access_token;
    const refreshToken = payload.data?.refresh_token;
    const user = payload.data?.user;

    if (
      response.status < 200 ||
      response.status >= 300 ||
      payload.success === false ||
      !accessToken ||
      !refreshToken ||
      !user
    ) {
      throw new Error(buildFriendlyAuthError(payload.message));
    }

    return {
      accessToken,
      refreshToken,
      user,
    } satisfies AuthSession;
  } catch (error) {
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error;
    }

    throw new Error(buildNetworkAuthError(error));
  }
}
