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

// ─── API Response Types ──────────────────────────────

export type LoginResponse = {
  success?: boolean;
  message?: string;
  data?: {
    access_token?: string;
    refresh_token?: string;
    user?: AuthUser;
  };
};

export type MeResponse = {
  success?: boolean;
  message?: string;
  data?: AuthUser;
};

export type RefreshTokenResponse = {
  success?: boolean;
  message?: string;
  data?: {
    access_token?: string;
  };
};

export type StoredSessionShape = {
  accessToken: string;
  access_token: string;
  refreshToken: string;
  refresh_token: string;
  user: AuthUser;
};

// ─── Login Form ──────────────────────────────────────

export type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};