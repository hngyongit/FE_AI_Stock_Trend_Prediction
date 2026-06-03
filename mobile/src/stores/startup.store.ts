import { create } from 'zustand';

export type StartupPhase =
  | 'idle'
  | 'authentication'
  | 'ready';

type StartupStore = {
  canRetry: boolean;
  errorMessage: string | null;
  phase: StartupPhase;
  retryDelayMs: number;
  retryKey: number;
  statusText: string;
  beginInitialization: () => void;
  completeInitialization: (statusText: string) => void;
  failInitialization: (payload: {
    canRetry: boolean;
    message: string;
    phase: Exclude<StartupPhase, 'idle' | 'ready'>;
    retryDelayMs: number;
    statusText: string;
  }) => void;
  resetRetryState: () => void;
  triggerRetry: () => void;
  updateStatus: (statusText: string) => void;
};

const DEFAULT_STATUS = 'Preparing secure workspace...';

export const useStartupStore = create<StartupStore>((set) => ({
  canRetry: false,
  errorMessage: null,
  phase: 'idle',
  retryDelayMs: 3200,
  retryKey: 0,
  statusText: DEFAULT_STATUS,
  beginInitialization: () =>
    set({
      canRetry: false,
      errorMessage: null,
      phase: 'idle',
      statusText: DEFAULT_STATUS,
    }),
  completeInitialization: (statusText) =>
    set({
      canRetry: false,
      errorMessage: null,
      phase: 'ready',
      statusText,
    }),
  failInitialization: ({ canRetry, message, phase, retryDelayMs, statusText }) =>
    set({
      canRetry,
      errorMessage: message,
      phase,
      retryDelayMs,
      statusText,
    }),
  resetRetryState: () =>
    set({
      canRetry: false,
      errorMessage: null,
    }),
  triggerRetry: () =>
    set((state) => ({
      retryKey: state.retryKey + 1,
    })),
  updateStatus: (statusText) => set({ statusText }),
}));
