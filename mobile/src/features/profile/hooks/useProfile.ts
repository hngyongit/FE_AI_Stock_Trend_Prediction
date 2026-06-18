import { useCallback, useEffect, useRef, useState } from 'react';

import { clearPersistedSession, readPersistedSession } from '@/shared/services/tokenStorage';
import { useAuthStore } from '@/stores/auth.store';
import { fetchProfile, ProfileRequestError } from '@/features/profile/services/profile.service';
import type { UserProfile } from '@/features/profile/types';

type UseProfileOptions = {
  onUnauthorized: () => void;
};

let cachedProfile: UserProfile | null = null;

function getFriendlyErrorMessage(error: unknown) {
  if (error instanceof ProfileRequestError) {
    if (error.message === 'Unable to load profile. Check your connection and try again.') {
      return error.message;
    }

    if (error.status === 401 || error.status === 403) {
      return 'Session expired. Please sign in again.';
    }
  }

  return 'Something went wrong while loading your profile.';
}

export function useProfile({ onUnauthorized }: UseProfileOptions) {
  const initialProfile = cachedProfile ?? useAuthStore.getState().session?.user ?? null;
  const [profile, setProfile] = useState<UserProfile | null>(() => initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(() => !initialProfile);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const profileRef = useRef<UserProfile | null>(initialProfile);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadProfile = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      const hasVisibleProfile = Boolean(profileRef.current ?? useAuthStore.getState().session?.user);

      if (mode === 'refresh' || hasVisibleProfile) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        setError(null);

        const session = useAuthStore.getState().session ?? (await readPersistedSession());
        const accessToken = session?.accessToken;

        if (!accessToken) {
          await clearPersistedSession();
          useAuthStore.getState().clearSession();
          onUnauthorized();
          return;
        }

        const nextProfile = await fetchProfile(accessToken);

        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        cachedProfile = nextProfile;
        profileRef.current = nextProfile;
        setProfile(nextProfile);

        const activeSession = useAuthStore.getState().session;
        if (activeSession) {
          const mergedUser = {
            ...activeSession.user,
            id: nextProfile.id ?? activeSession.user.id,
            full_name: nextProfile.full_name ?? activeSession.user.full_name,
            email: nextProfile.email ?? activeSession.user.email,
            role: activeSession.user.role,
            status: nextProfile.status ?? activeSession.user.status,
            plan: nextProfile.plan ?? activeSession.user.plan,
            subscription_status:
              nextProfile.subscription_status ?? activeSession.user.subscription_status,
            subscription_expires_at:
              nextProfile.subscription_expires_at ?? activeSession.user.subscription_expires_at,
            created_at: nextProfile.created_at ?? activeSession.user.created_at,
          };

          useAuthStore.getState().setSession({
            ...activeSession,
            user: mergedUser,
          });
        }
      } catch (error) {
        const isUnauthorized =
          error instanceof ProfileRequestError &&
          (error.status === 401 || error.status === 403);

        if (isUnauthorized) {
          cachedProfile = null;
          profileRef.current = null;
          await clearPersistedSession();
          useAuthStore.getState().clearSession();
          onUnauthorized();
          return;
        }

        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        setError(getFriendlyErrorMessage(error));
      } finally {
        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [onUnauthorized],
  );

  useEffect(() => {
    void loadProfile('initial');
  }, [loadProfile]);

  const retry = useCallback(() => {
    void loadProfile('initial');
  }, [loadProfile]);

  const refresh = useCallback(() => {
    void loadProfile('refresh');
  }, [loadProfile]);

  return {
    error,
    isLoading,
    isRefreshing,
    profile,
    refresh,
    retry,
  };
}
