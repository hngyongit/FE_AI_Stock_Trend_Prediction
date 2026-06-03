import axios from 'axios';
import Constants from 'expo-constants';

const DEFAULT_API_BASE_URL = 'https://lobster-app-kte4b.ondigitalocean.app';

function getEnvValue(key: string) {
  const runtimeProcess = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return runtimeProcess.process?.env?.[key];
}

function getExtraValue(key: string) {
  const legacyManifest = (Constants as typeof Constants & {
    manifest?: {
      extra?: Record<string, unknown>;
    };
  }).manifest;

  const extra =
    Constants.expoConfig?.extra ??
    legacyManifest?.extra ??
    Constants.manifest2?.extra?.expoClient?.extra;
  const value = extra?.[key];

  return typeof value === 'string' ? value : undefined;
}

export function getApiBaseUrl() {
  return (
    getEnvValue('EXPO_PUBLIC_API_URL') ??
    getExtraValue('apiBaseUrl') ??
    getExtraValue('EXPO_PUBLIC_API_URL') ??
    DEFAULT_API_BASE_URL
  );
}

export function createApiClient() {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    throw new Error('Configuration missing. Please restart the app later.');
  }

  return axios.create({
    baseURL: apiBaseUrl.replace(/\/$/, ''),
    timeout: 8000,
    validateStatus: () => true,
  });
}
