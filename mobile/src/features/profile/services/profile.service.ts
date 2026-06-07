import axios from 'axios';

import { createApiClient } from '@/shared/services/api.service';
import type {
  ChangePasswordResponse,
  ProfileApiResponse,
  ProfileUpdateResponse,
  UserProfile,
} from '@/features/profile/types';

export class ProfileRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ProfileRequestError';
  }
}

function isWrappedProfileData(
  value: ProfileApiResponse['data'],
): value is { user?: UserProfile } {
  return Boolean(value) && typeof value === 'object' && 'user' in value;
}

export async function fetchProfile(accessToken: string): Promise<UserProfile> {
  try {
    const apiClient = createApiClient();
    const response = await apiClient.get('/api/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = response.data as ProfileApiResponse;
    const payloadData = payload.data;
    const user = isWrappedProfileData(payloadData) ? payloadData.user : payloadData;

    if (
      response.status === 401 ||
      response.status === 403 ||
      payload.message?.toLowerCase().includes('unauthorized')
    ) {
      throw new ProfileRequestError('Unauthorized', response.status);
    }

    if (
      response.status < 200 ||
      response.status >= 300 ||
      payload.success === false ||
      !user
    ) {
      throw new ProfileRequestError(
        payload.message || 'Something went wrong while loading your profile.',
        response.status,
      );
    }

    return user;
  } catch (error) {
    if (error instanceof ProfileRequestError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new ProfileRequestError(
          'Unable to load profile. Check your connection and try again.',
        );
      }

      throw new ProfileRequestError(
        'Something went wrong while loading your profile.',
        error.response.status,
      );
    }

    throw new ProfileRequestError('Something went wrong while loading your profile.');
  }
}

export async function updateProfile(
  accessToken: string,
  fullName: string,
): Promise<UserProfile> {
  try {
    const apiClient = createApiClient();
    const response = await apiClient.put(
      '/api/users/me',
      {
        full_name: fullName.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const payload = response.data as ProfileUpdateResponse;

    if (response.status === 401) {
      throw new ProfileRequestError('Unauthorized', response.status);
    }

    if (
      response.status < 200 ||
      response.status >= 300 ||
      payload.success === false ||
      !payload.data
    ) {
      const fieldMessage = payload.errors?.[0]?.message;

      throw new ProfileRequestError(
        fieldMessage || payload.message || 'Unable to update profile right now.',
        response.status,
      );
    }

    return payload.data;
  } catch (error) {
    if (error instanceof ProfileRequestError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new ProfileRequestError(
          'Unable to update profile. Check your connection and try again.',
        );
      }
    }

    throw new ProfileRequestError('Unable to update profile right now.');
  }
}

export async function changePassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  try {
    const apiClient = createApiClient();
    const response = await apiClient.put(
      '/api/users/me/password',
      {
        current_password: currentPassword,
        new_password: newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const payload = response.data as ChangePasswordResponse;

    if (response.status === 401) {
      throw new ProfileRequestError('Unauthorized', response.status);
    }

    if (response.status < 200 || response.status >= 300 || payload.success === false) {
      throw new ProfileRequestError(
        payload.message || 'Unable to change password right now.',
        response.status,
      );
    }
  } catch (error) {
    if (error instanceof ProfileRequestError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new ProfileRequestError(
          'Unable to change password. Check your connection and try again.',
        );
      }
    }

    throw new ProfileRequestError('Unable to change password right now.');
  }
}
