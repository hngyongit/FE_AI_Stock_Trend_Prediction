export const palette = {
  background: '#0F172A',
  surface: '#111827',
  elevated: '#1E293B',
  border: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  positive: '#22C55E',
  negative: '#EF4444',
  warning: '#F59E0B',
  info: '#38BDF8',
  offline: '#64748B',
  primary: '#3B82F6',
  primarySoft: '#ADC6FF',
  // Legacy aliases (maintain backward compat)
  surfaceLow: '#111827',
  surfaceLowest: '#0B0F10',
  surfaceHigh: '#1E293B',
  surfaceHighest: '#323537',
  borderMuted: '#424754',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  primaryAction: '#3B82F6',
  up: '#22C55E',
  down: '#EF4444',
} as const;

export const radius = {
  control: 4,
  card: 14,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  // Legacy alias
  xxs: 4,
} as const;
