import type { SubscriptionStatus, UserPlan } from '@/features/auth/types';

export type ProfileStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | string;

export type UserProfile = {
  id?: string;
  full_name?: string;
  email?: string;
  role?: string;
  status?: ProfileStatus;
  plan?: UserPlan;
  subscription_status?: SubscriptionStatus;
  subscription_expires_at?: string | null;
  created_at?: string;
};

export type ProfileApiResponse = {
  success?: boolean;
  message?: string;
  data?:
    | UserProfile
    | {
        user?: UserProfile;
      };
};

export type ProfileMutationError = {
  field: string;
  message: string;
};

export type ProfileUpdateResponse = {
  success?: boolean;
  message?: string;
  data?: UserProfile;
  errors?: ProfileMutationError[];
};

export type ChangePasswordResponse = {
  success?: boolean;
  message?: string;
};

export type ProfileRowItem = {
  description?: string;
  disabled?: boolean;
  label: string;
  value?: string;
};
