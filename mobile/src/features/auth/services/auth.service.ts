import axios from 'axios';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import type {
  AuthSession,
  LoginCredentials,
  LoginResponse,
  MeResponse,
  RefreshTokenResponse,
  RegisterCredentials,
  RegisterResponse,
} from '@/features/auth/types';
import { createApiClient, getApiBaseUrl } from '@/shared/services/api.service';

WebBrowser.maybeCompleteAuthSession();

export function createAuthApiClient() {
  return createApiClient();
}

function buildFriendlyAuthError(message?: string) {
  const normalized = message?.trim();
  if (!normalized) return 'Unable to sign in right now. Please try again.';
  if (normalized === 'Invalid email or password') {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (normalized === 'Account is locked') {
    return 'This account is locked. Please contact support for assistance.';
  }
  return normalized;
}

function buildNetworkAuthError(error: unknown) {
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

function toAuthSession(payload: LoginResponse, fallbackMessage: string): AuthSession {
  const data = payload.data;

  if (
    payload.success === false ||
    !data?.access_token ||
    !data?.refresh_token ||
    !data?.user
  ) {
    throw new Error(buildFriendlyAuthError(payload.message ?? fallbackMessage));
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: data.user,
  } satisfies AuthSession;
}

export async function loginWithCredentials(
  credentials: LoginCredentials
): Promise<AuthSession> {
  try {
    const apiClient = createAuthApiClient();
    const response = await apiClient.post('/api/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    const payload = response.data as LoginResponse;
    if (response.status < 200 || response.status >= 300) {
      throw new Error(buildFriendlyAuthError(payload.message));
    }

    return toAuthSession(payload, 'Unable to sign in right now. Please try again.');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(buildNetworkAuthError(error));
    }
    throw error;
  }
}

export async function exchangeOAuthCode(code: string): Promise<AuthSession> {
  try {
    const apiClient = createAuthApiClient();
    const response = await apiClient.post('/api/auth/oauth/exchange', { code });
    const payload = response.data as LoginResponse;

    if (response.status < 200 || response.status >= 300) {
      throw new Error(payload.message || 'Google authentication failed');
    }

    return toAuthSession(payload, 'Google authentication failed');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(buildNetworkAuthError(error));
    }

    throw error;
  }
}

export async function loginWithGoogle(): Promise<AuthSession | null> {
  const redirectUri = Linking.createURL('auth/callback');
  const apiBaseUrl = getApiBaseUrl().replace(/\/$/, '');
  const authUrl = `${apiBaseUrl}/api/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return null;
  }

  if (result.type !== 'success' || !result.url) {
    throw new Error('Google authentication did not complete.');
  }

  const { queryParams } = Linking.parse(result.url);
  const code = readQueryParam(queryParams?.code);
  const error = readQueryParam(queryParams?.error);

  if (error) {
    throw new Error(
      error === 'google_auth_failed'
        ? 'Google authentication failed. Please try again.'
        : error,
    );
  }

  if (!code) {
    throw new Error('No authorization code was returned from Google.');
  }

  return exchangeOAuthCode(code);
}

function readQueryParam(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value)) {
    const firstString = value.find((item) => typeof item === 'string' && item.trim());
    return typeof firstString === 'string' ? firstString : null;
  }
  return null;
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  try {
    const apiClient = createAuthApiClient();
    const response = await apiClient.post('/api/auth/refresh-token', {
      refresh_token: refreshToken,
    });

    const payload = response.data as RefreshTokenResponse;
    const nextAccessToken = payload.data?.access_token;

    if (
      response.status < 200 ||
      response.status >= 300 ||
      payload.success === false ||
      !nextAccessToken
    ) {
      throw new Error(payload.message || 'Unable to refresh access token');
    }

    return nextAccessToken;
  } catch (error) {
    throw new Error(buildNetworkAuthError(error));
  }
}

export async function logoutCurrentSession(accessToken: string): Promise<void> {
  try {
    const apiClient = createAuthApiClient();
    const response = await apiClient.post(
      '/api/auth/logout',
      undefined,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const payload = response.data as { success?: boolean; message?: string };

    if (response.status < 200 || response.status >= 300 || payload.success === false) {
      throw new Error(payload.message || 'Unable to log out right now.');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(buildNetworkAuthError(error));
    }

    throw error;
  }
}

export async function fetchCurrentUser(accessToken: string): Promise<AuthSession['user']> {
  try {
    const apiClient = createAuthApiClient();
    const response = await apiClient.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const payload = response.data as MeResponse;

    if (response.status < 200 || response.status >= 300 || payload.success === false || !payload.data) {
      throw new Error(payload.message || 'Unable to verify current user');
    }

    return payload.data;
  } catch (error) {
    throw new Error(buildNetworkAuthError(error));
  }
}

// ─── Register ────────────────────────────────────────

export async function registerUser(
  credentials: RegisterCredentials,
): Promise<{ success: true; message: string }> {
  const apiClient = createAuthApiClient();
  const response = await apiClient.post('/api/auth/register', credentials);
  const payload = response.data as RegisterResponse;

  if (response.status < 200 || response.status >= 300 || payload.success === false) {
    const error: Error & { fieldErrors?: RegisterResponse['errors'] } = new Error(
      payload.message || 'Registration failed. Please try again.',
    );

    if (payload.errors && payload.errors.length > 0) {
      error.fieldErrors = payload.errors;
    }

    throw error;
  }

  return {
    success: true,
    message: payload.message || 'User registered successfully',
  };
}

// ─── JWT Helpers ─────────────────────────────────────

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
