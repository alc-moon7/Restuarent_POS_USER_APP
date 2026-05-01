import type { CartItem, Order, ServerMode } from '../types';

const keys = {
  cart: 'hybrid_pos_cart',
  lastOrder: 'hybrid_pos_last_order',
  cloudApiUrl: 'hybrid_pos_cloud_api_override',
  restaurantId: 'hybrid_pos_restaurant_id',
  outletId: 'hybrid_pos_outlet_id',
  lastMode: 'hybrid_pos_last_connection_mode',
};

export const envConfig = {
  cloudApiUrl: import.meta.env.VITE_CLOUD_API_URL ?? 'https://api.example.com',
  restaurantId: import.meta.env.VITE_DEFAULT_RESTAURANT_ID ?? 'rest_001',
  outletId: import.meta.env.VITE_DEFAULT_OUTLET_ID ?? 'outlet_001',
  appName: import.meta.env.VITE_APP_NAME ?? 'Local POS Menu',
};

export function loadCart(): CartItem[] {
  return readJson<CartItem[]>(keys.cart, []);
}

export function saveCart(items: CartItem[]) {
  writeJson(keys.cart, items);
}

export function loadLastOrder(): Order | null {
  return readJson<Order | null>(keys.lastOrder, null);
}

export function saveLastOrder(order: Order | null) {
  writeJson(keys.lastOrder, order);
}

export function getCloudApiUrl() {
  return localStorage.getItem(keys.cloudApiUrl) || envConfig.cloudApiUrl;
}

export function setCloudApiUrl(value: string) {
  localStorage.setItem(keys.cloudApiUrl, value.trim());
}

export function getRestaurantId() {
  return localStorage.getItem(keys.restaurantId) || envConfig.restaurantId;
}

export function setRestaurantId(value: string) {
  localStorage.setItem(keys.restaurantId, value.trim());
}

export function getOutletId() {
  return localStorage.getItem(keys.outletId) || envConfig.outletId;
}

export function setOutletId(value: string) {
  localStorage.setItem(keys.outletId, value.trim());
}

export function getLastMode(): ServerMode | null {
  const value = localStorage.getItem(keys.lastMode);
  if (value === 'local' || value === 'cloud' || value === 'offline') return value;
  return null;
}

export function setLastMode(value: ServerMode) {
  localStorage.setItem(keys.lastMode, value);
}

export function clearSavedConnection() {
  localStorage.removeItem(keys.cloudApiUrl);
  localStorage.removeItem(keys.restaurantId);
  localStorage.removeItem(keys.outletId);
  localStorage.removeItem(keys.lastMode);
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}
