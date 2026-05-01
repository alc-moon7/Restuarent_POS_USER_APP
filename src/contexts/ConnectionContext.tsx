import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import { ApiClient } from '../services/apiClient';
import { resolveConnection } from '../services/connectionResolver';
import {
  getCloudApiUrl,
  getOutletId,
  getRestaurantId,
  setCloudApiUrl,
  setOutletId,
  setRestaurantId,
} from '../services/storage';
import type { ConnectionState, ServerInfo } from '../types';

type ConnectionAction =
  | { type: 'resolve:start' }
  | {
      type: 'resolve:success';
      serverInfo: ServerInfo;
      restaurantId: string;
      outletId: string;
      cloudApiUrl: string;
      attempts: ConnectionState['attempts'];
    }
  | {
      type: 'resolve:error';
      error: string;
      attempts: ConnectionState['attempts'];
      blockedMixedContent?: boolean;
      restaurantId: string;
      outletId: string;
      cloudApiUrl: string;
    }
  | {
      type: 'settings:update';
      restaurantId: string;
      outletId: string;
      cloudApiUrl: string;
    };

type ConnectionContextValue = {
  state: ConnectionState;
  apiClient: ApiClient | null;
  resolve: () => Promise<void>;
  updateSettings: (settings: {
    restaurantId: string;
    outletId: string;
    cloudApiUrl: string;
  }) => void;
};

const initialState: ConnectionState = {
  mode: 'offline',
  status: 'idle',
  restaurantId: getRestaurantId(),
  outletId: getOutletId(),
  cloudApiUrl: getCloudApiUrl(),
  attempts: [
    { label: 'Checking local restaurant server', status: 'idle' },
    { label: 'Checking online menu', status: 'idle' },
    { label: 'Loading menu', status: 'idle' },
  ],
};

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const resolve = useCallback(async () => {
    dispatch({ type: 'resolve:start' });
    const result = await resolveConnection();
    if (result.ok) {
      dispatch({
        type: 'resolve:success',
        serverInfo: result.serverInfo,
        restaurantId: result.restaurantId,
        outletId: result.outletId,
        cloudApiUrl: result.cloudApiUrl,
        attempts: result.attempts,
      });
      return;
    }
    dispatch({
      type: 'resolve:error',
      error: result.error,
      attempts: result.attempts,
      blockedMixedContent: result.blockedMixedContent,
      restaurantId: result.restaurantId,
      outletId: result.outletId,
      cloudApiUrl: result.cloudApiUrl,
    });
  }, []);

  const updateSettings = useCallback(
    (settings: { restaurantId: string; outletId: string; cloudApiUrl: string }) => {
      setRestaurantId(settings.restaurantId);
      setOutletId(settings.outletId);
      setCloudApiUrl(settings.cloudApiUrl);
      dispatch({ type: 'settings:update', ...settings });
    },
    [],
  );

  const apiClient = useMemo(() => {
    if (!state.serverInfo || state.status !== 'ready') return null;
    return new ApiClient(
      state.serverInfo,
      state.restaurantId,
      state.outletId,
      state.cloudApiUrl,
    );
  }, [state.cloudApiUrl, state.outletId, state.restaurantId, state.serverInfo, state.status]);

  const value = useMemo(
    () => ({ state, apiClient, resolve, updateSettings }),
    [apiClient, resolve, state, updateSettings],
  );

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const value = useContext(ConnectionContext);
  if (!value) throw new Error('useConnection must be used inside ConnectionProvider.');
  return value;
}

function reducer(state: ConnectionState, action: ConnectionAction): ConnectionState {
  switch (action.type) {
    case 'resolve:start':
      return { ...state, status: 'resolving', error: undefined };
    case 'resolve:success':
      return {
        ...state,
        mode: action.serverInfo.mode,
        status: 'ready',
        serverInfo: action.serverInfo,
        restaurantId: action.restaurantId,
        outletId: action.outletId,
        cloudApiUrl: action.cloudApiUrl,
        attempts: action.attempts,
        error: undefined,
        blockedMixedContent: undefined,
      };
    case 'resolve:error':
      return {
        ...state,
        mode: 'offline',
        status: 'error',
        serverInfo: undefined,
        restaurantId: action.restaurantId,
        outletId: action.outletId,
        cloudApiUrl: action.cloudApiUrl,
        attempts: action.attempts,
        error: action.error,
        blockedMixedContent: action.blockedMixedContent,
      };
    case 'settings:update':
      return {
        ...state,
        restaurantId: action.restaurantId,
        outletId: action.outletId,
        cloudApiUrl: action.cloudApiUrl,
      };
  }
}
