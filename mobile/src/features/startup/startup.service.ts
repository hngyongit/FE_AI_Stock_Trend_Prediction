import {
  clearPersistedSession,
  getRoleAccessMessage,
  isMobileAllowedRole,
  isTokenExpired,
  readPersistedSession,
} from '@/features/auth/auth.service';

type StartupDestination = '/dashboard' | '/login';

type StartupStage = 'authentication' | 'ready';

type StartupSuccess = {
  ok: true;
  destination: StartupDestination;
  stage: 'ready';
  statusText: string;
};

type StartupFailure = {
  ok: false;
  canRetry: boolean;
  message: string;
  retryDelayMs: number;
  stage: Exclude<StartupStage, 'ready'>;
  statusText: string;
};

export type StartupResult = StartupSuccess | StartupFailure;
type AuthValidationResult = {
  destination: StartupDestination;
  statusText: string;
};

const GENERIC_RETRY_MESSAGE = 'Unable to continue startup. Retrying...';

function buildFailure(stage: Exclude<StartupStage, 'ready'>, statusText: string): StartupFailure {
  return {
    ok: false,
    canRetry: true,
    message: GENERIC_RETRY_MESSAGE,
    retryDelayMs: 3200,
    stage,
    statusText,
  };
}

async function validateAuthenticationState(): Promise<AuthValidationResult> {
  const session = await readPersistedSession();

  if (!session) {
    return { destination: '/login', statusText: 'No active session detected.' };
  }

  if (!isMobileAllowedRole(session.user.role)) {
    await clearPersistedSession();

    return {
      destination: '/login',
      statusText: getRoleAccessMessage(session.user.role),
    };
  }

  if (isTokenExpired(session.refreshToken)) {
    await clearPersistedSession();

    return {
      destination: '/login',
      statusText: 'Session expired. Redirecting to sign in.',
    };
  }

  if (isTokenExpired(session.accessToken)) {
    await clearPersistedSession();

    return {
      destination: '/login',
      statusText: 'Session expired. Redirecting to sign in.',
    };
  }

  return {
    destination: '/dashboard',
    statusText: 'Session verified. Preparing dashboard.',
  };
}

async function runMockStartupDelay(durationMs: number) {
  await new Promise((resolve) => setTimeout(resolve, durationMs));
}

export async function initializeApp(): Promise<StartupResult> {
  try {
    const session = await readPersistedSession();

    if (!session) {
      await runMockStartupDelay(1100);

      return {
        ok: true,
        destination: '/login',
        stage: 'ready',
        statusText: 'Startup ready. Opening sign in.',
      };
    }

    const authentication = await validateAuthenticationState();
    await runMockStartupDelay(1200);

    return {
      ok: true,
      destination: authentication.destination,
      stage: 'ready',
      statusText:
        authentication.destination === '/dashboard'
          ? 'Operational session ready. Opening dashboard.'
          : authentication.statusText,
    };
  } catch {
    return buildFailure('authentication', 'Unable to read the current session state.');
  }
}
