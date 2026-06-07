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

// ─── Register Form ───────────────────────────────────

export type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
};

// ─── Register API ────────────────────────────────────

export type RegisterCredentials = {
  full_name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
};

// ─── Login Form ──────────────────────────────────────

export type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};