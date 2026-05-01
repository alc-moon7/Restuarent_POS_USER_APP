import { z } from 'zod';

import type {
  ApiResult,
  CheckoutPayload,
  MenuItem,
  Order,
  OrderStatus,
  ServerInfo,
} from '../types';

const menuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  category: z.string().optional().default('General'),
  price: z.coerce.number(),
  imageUrl: z.string().nullable().optional(),
  isAvailable: z.boolean().optional().default(true),
  preparationTimeMinutes: z.number().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
});

const orderItemSchema = z.object({
  id: z.string().optional(),
  orderId: z.string().optional(),
  menuItemId: z.string(),
  name: z.string(),
  qty: z.coerce.number(),
  price: z.coerce.number(),
  lineTotal: z.coerce.number().optional(),
});

const orderSchema = z.object({
  id: z.string(),
  orderNo: z.string(),
  source: z.string().optional(),
  customerName: z.string().nullable().optional(),
  tableNo: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  status: z.enum(['pending', 'accepted', 'preparing', 'ready', 'served', 'cancelled']),
  total: z.coerce.number(),
  items: z.array(orderItemSchema).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export class ApiClient {
  constructor(
    private readonly serverInfo: ServerInfo,
    private readonly restaurantId: string,
    private readonly outletId: string,
    private readonly cloudApiUrl: string,
  ) {}

  getActiveServerInfo() {
    return this.serverInfo;
  }

  getWebSocketUrl() {
    if (this.serverInfo.wsUrl) return this.serverInfo.wsUrl;
    if (this.serverInfo.mode === 'local') {
      return this.serverInfo.baseUrl.replace(/^http/, 'ws') + '/ws';
    }
    return this.cloudApiUrl.replace(/^http/, 'ws') + '/ws/customer';
  }

  async checkHealth(): Promise<ApiResult<ServerInfo>> {
    const result = await this.getJson<Record<string, unknown>>('/health');
    if (!result.ok) return result;
    return {
      ok: true,
      data: {
        ...this.serverInfo,
        restaurantName: result.data.restaurantName?.toString(),
        outletName: result.data.outletName?.toString(),
      },
    };
  }

  async getMenu(): Promise<ApiResult<MenuItem[]>> {
    const path =
      this.serverInfo.mode === 'local'
        ? '/menu'
        : `/outlets/${this.outletId}/menu`;
    const result = await this.getJson<unknown>(path);
    if (!result.ok) return result;
    const raw = extractArray(result.data);
    const items = raw
      .map((item) => menuItemSchema.safeParse(item))
      .filter((parsed) => parsed.success)
      .map((parsed) => parsed.data);
    return { ok: true, data: items };
  }

  async createOrder(payload: CheckoutPayload): Promise<ApiResult<Order>> {
    const path =
      this.serverInfo.mode === 'local'
        ? '/orders'
        : `/outlets/${this.outletId}/orders`;
    const body =
      this.serverInfo.mode === 'local'
        ? payload
        : {
            ...payload,
            restaurantId: this.restaurantId,
            outletId: this.outletId,
            source: 'cloud_customer',
          };
    const result = await this.postJson<unknown>(path, body);
    if (!result.ok) return result;
    const orderRaw = extractObject(result.data);
    const parsed = orderSchema.safeParse(orderRaw);
    if (!parsed.success) {
      return { ok: false, error: 'Order was placed, but response was unreadable.' };
    }
    return { ok: true, data: parsed.data };
  }

  async getOrder(orderId: string): Promise<ApiResult<Order>> {
    if (this.serverInfo.mode === 'local') {
      const result = await this.getJson<unknown>('/orders');
      if (!result.ok) return result;
      const raw = extractArray(result.data).find(
        (order) => typeof order === 'object' && order !== null && 'id' in order && order.id === orderId,
      );
      if (!raw) return { ok: false, error: 'Order was not found yet.' };
      const parsed = orderSchema.safeParse(raw);
      return parsed.success
        ? { ok: true, data: parsed.data }
        : { ok: false, error: 'Order data is unreadable.' };
    }

    const result = await this.getJson<unknown>(
      `/outlets/${this.outletId}/orders/${orderId}`,
    );
    if (!result.ok) return result;
    const parsed = orderSchema.safeParse(extractObject(result.data));
    return parsed.success
      ? { ok: true, data: parsed.data }
      : { ok: false, error: 'Order data is unreadable.' };
  }

  private async getJson<T>(path: string): Promise<ApiResult<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  private async postJson<T>(path: string, body: unknown): Promise<ApiResult<T>> {
    return this.request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<ApiResult<T>> {
    const url = this.urlFor(path);
    if (window.location.protocol === 'https:' && url.startsWith('http://')) {
      return {
        ok: false,
        blockedMixedContent: true,
        error:
          'For offline ordering, please connect to restaurant WiFi and scan the local QR again.',
      };
    }
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          Accept: 'application/json',
          ...init.headers,
        },
        signal: AbortSignal.timeout(10000),
      });
      const json = await safeJson(response);
      if (!response.ok) {
        return {
          ok: false,
          error: readableError(json) || 'Restaurant server is unavailable.',
        };
      }
      return { ok: true, data: json as T };
    } catch {
      return { ok: false, error: 'Restaurant server is unavailable.' };
    }
  }

  private urlFor(path: string) {
    const base =
      this.serverInfo.mode === 'cloud' ? this.cloudApiUrl : this.serverInfo.baseUrl;
    return base.replace(/\/+$/, '') + path;
  }
}

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'object' || value === null) return [];
  const record = value as Record<string, unknown>;
  const raw = record.data ?? record.items ?? record.menu ?? record.orders;
  return Array.isArray(raw) ? raw : [];
}

function extractObject(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return {};
  const record = value as Record<string, unknown>;
  return record.data ?? record;
}

async function safeJson(response: Response) {
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

function readableError(json: unknown) {
  if (typeof json !== 'object' || json === null) return '';
  const error = (json as Record<string, unknown>).error;
  return typeof error === 'string' ? error : '';
}

export function statusLabel(status: OrderStatus) {
  return status[0].toUpperCase() + status.slice(1);
}
