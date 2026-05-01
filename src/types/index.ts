export type ServerMode = 'local' | 'cloud' | 'offline';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export type ServerInfo = {
  mode: ServerMode;
  baseUrl: string;
  wsUrl?: string;
  serverId?: string;
  restaurantId?: string;
  outletId?: string;
  restaurantName?: string;
  outletName?: string;
  cloudConnected?: boolean;
  cloudSyncEnabled?: boolean;
  timestamp?: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  preparationTimeMinutes?: number | null;
  tags?: string[];
};

export type CartItem = {
  menuItem: MenuItem;
  qty: number;
};

export type OrderItem = {
  id?: string;
  orderId?: string;
  menuItemId: string;
  name: string;
  qty: number;
  price: number;
  lineTotal?: number;
};

export type Order = {
  id: string;
  orderNo: string;
  source?: string;
  customerName?: string | null;
  tableNo?: string | null;
  note?: string | null;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type CheckoutPayload = {
  customerName?: string;
  tableNo?: string;
  note?: string;
  items: Array<{
    menuItemId: string;
    name: string;
    qty: number;
    price: number;
  }>;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; blockedMixedContent?: boolean };

export type ConnectionAttempt = {
  label: string;
  status: 'idle' | 'running' | 'success' | 'failed';
};

export type ConnectionState = {
  mode: ServerMode;
  status: 'idle' | 'resolving' | 'ready' | 'error';
  serverInfo?: ServerInfo;
  restaurantId: string;
  outletId: string;
  cloudApiUrl: string;
  error?: string;
  blockedMixedContent?: boolean;
  attempts: ConnectionAttempt[];
};
