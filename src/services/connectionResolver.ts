import type { ConnectionAttempt, ServerInfo } from '../types';
import {
  getCloudApiUrl,
  getOutletId,
  getRestaurantId,
  setLastMode,
} from './storage';

export type ResolveResult =
  | {
      ok: true;
      serverInfo: ServerInfo;
      attempts: ConnectionAttempt[];
      restaurantId: string;
      outletId: string;
      cloudApiUrl: string;
    }
  | {
      ok: false;
      error: string;
      attempts: ConnectionAttempt[];
      blockedMixedContent?: boolean;
      restaurantId: string;
      outletId: string;
      cloudApiUrl: string;
    };

const defaultAttempts: ConnectionAttempt[] = [
  { label: 'Checking local restaurant server', status: 'idle' },
  { label: 'Checking online menu', status: 'idle' },
  { label: 'Loading menu', status: 'idle' },
];

export async function resolveConnection(): Promise<ResolveResult> {
  const restaurantId = currentRestaurantId();
  const outletId = currentOutletId();
  const cloudApiUrl = getCloudApiUrl();
  const localBaseUrl = getQueryParam('localBaseUrl');
  const attempts = cloneAttempts();
  const path = window.location.pathname;
  const hostname = window.location.hostname;

  if (localBaseUrl) {
    attempts[0] = { ...attempts[0], status: 'running' };
    const local = await tryHealth(localBaseUrl, 'local');
    if (local.ok) {
      attempts[0] = { ...attempts[0], status: 'success' };
      attempts[2] = { ...attempts[2], status: 'success' };
      setLastMode('local');
      return { ok: true, serverInfo: local.info, attempts, restaurantId, outletId, cloudApiUrl };
    }
    attempts[0] = { ...attempts[0], status: 'failed' };
  }

  if (path === '/customer' || isPrivateOrLocalHost(hostname)) {
    attempts[0] = { ...attempts[0], status: 'running' };
    const local = await tryHealth(window.location.origin, 'local');
    if (local.ok) {
      attempts[0] = { ...attempts[0], status: 'success' };
      attempts[2] = { ...attempts[2], status: 'success' };
      setLastMode('local');
      return { ok: true, serverInfo: local.info, attempts, restaurantId, outletId, cloudApiUrl };
    }
    attempts[0] = { ...attempts[0], status: 'failed' };

    if (path === '/customer') {
      return {
        ok: false,
        error:
          'Restaurant server is unavailable. Please connect to restaurant WiFi and scan the QR again.',
        attempts,
        restaurantId,
        outletId,
        cloudApiUrl,
      };
    }
  }

  attempts[1] = { ...attempts[1], status: 'running' };
  if (cloudApiUrl && cloudApiUrl !== 'https://api.example.com') {
    const cloud = await tryHealth(cloudApiUrl, 'cloud');
    if (cloud.ok) {
      attempts[1] = { ...attempts[1], status: 'success' };
      attempts[2] = { ...attempts[2], status: 'success' };
      setLastMode('cloud');
      return { ok: true, serverInfo: cloud.info, attempts, restaurantId, outletId, cloudApiUrl };
    }
    attempts[1] = { ...attempts[1], status: 'failed' };
    if (cloud.blockedMixedContent) {
      return {
        ok: false,
        error:
          'For offline ordering, please connect to restaurant WiFi and scan the local QR again.',
        attempts,
        blockedMixedContent: true,
        restaurantId,
        outletId,
        cloudApiUrl,
      };
    }
  } else {
    attempts[1] = { ...attempts[1], status: 'failed' };
  }

  setLastMode('offline');
  return {
    ok: false,
    error:
      'Restaurant server is unavailable. Please connect to restaurant WiFi and scan the QR again.',
    attempts,
    restaurantId,
    outletId,
    cloudApiUrl,
  };
}

export function isPrivateOrLocalHost(hostname: string) {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return true;
  }
  const parts = hostname.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }
  const [a, b] = parts;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

async function tryHealth(baseUrl: string, mode: 'local' | 'cloud') {
  const normalized = trimTrailingSlash(baseUrl);
  if (window.location.protocol === 'https:' && normalized.startsWith('http://')) {
    return { ok: false as const, blockedMixedContent: true };
  }

  try {
    const response = await fetch(`${normalized}/health`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { ok: false as const };
    const json = await response.json();
    const info: ServerInfo = {
      mode,
      baseUrl: normalized,
      wsUrl:
        json.wsUrl ??
        (mode === 'local'
          ? normalized.replace(/^http/, 'ws') + '/ws'
          : normalized.replace(/^http/, 'ws') + '/ws/customer'),
      serverId: json.serverId,
      restaurantId: json.restaurantId,
      outletId: json.outletId,
      restaurantName: json.restaurantName,
      outletName: json.outletName,
      cloudConnected: json.cloudConnected,
      cloudSyncEnabled: json.cloudSyncEnabled,
      timestamp: json.timestamp,
    };
    return { ok: true as const, info };
  } catch (error) {
    return {
      ok: false as const,
      blockedMixedContent:
        error instanceof TypeError &&
        window.location.protocol === 'https:' &&
        normalized.startsWith('http://'),
    };
  }
}

function currentRestaurantId() {
  const params = routeParams();
  return params.restaurantId || getRestaurantId();
}

function currentOutletId() {
  const params = routeParams();
  return params.outletId || getOutletId();
}

function routeParams() {
  const match = window.location.pathname.match(/^\/r\/([^/]+)\/o\/([^/]+)/);
  return {
    restaurantId: decodeURIComponent(match?.[1] ?? ''),
    outletId: decodeURIComponent(match?.[2] ?? ''),
  };
}

function getQueryParam(key: string) {
  const value = new URLSearchParams(window.location.search).get(key);
  return value?.trim() || '';
}

function cloneAttempts() {
  return defaultAttempts.map((attempt) => ({ ...attempt }));
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}
